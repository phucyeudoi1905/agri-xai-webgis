import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GisErrorCode, GrowthStatus, RiskLevel } from '../common/enums';
import { GisException } from '../common/gis.exception';
import { CreatePlotDto } from '../dtos/create-plot.dto';
import { GrowthStatusHistoryEntity } from '../entities/growth-status-history.entity';
import { PlotClimateReadingEntity } from '../entities/plot-climate-reading.entity';
import { PlotCropHistoryEntity } from '../entities/plot-crop-history.entity';
import { PlotDiseaseAlertEntity } from '../entities/plot-disease-alert.entity';
import { ShippingLogEntity } from '../entities/shipping-log.entity';
import { PlotRepository } from '../repositories/plot.repository';
import {
  assertValidPolygon,
  GeoJsonPolygon,
} from '../utils/spatial/geojson.util';
import { PucGeneratorService } from './puc-generator.service';
import { RISK_COLORS } from '../common/enums';
import { RiskGateway } from '../gateways/risk.gateway';
import { ImportGeoJsonDto } from '../dtos/create-plot.dto';

@Injectable()
export class PlotService {
  constructor(
    private readonly plots: PlotRepository,
    private readonly pucGenerator: PucGeneratorService,
    private readonly riskGateway: RiskGateway,
    @InjectRepository(GrowthStatusHistoryEntity)
    private readonly growthHistory: Repository<GrowthStatusHistoryEntity>,
    @InjectRepository(ShippingLogEntity)
    private readonly shippingLogs: Repository<ShippingLogEntity>,
    @InjectRepository(PlotDiseaseAlertEntity)
    private readonly alerts: Repository<PlotDiseaseAlertEntity>,
    @InjectRepository(PlotCropHistoryEntity)
    private readonly cropHistories: Repository<PlotCropHistoryEntity>,
  ) {}

  async createPlot(dto: CreatePlotDto) {
    const boundary = dto.boundary as GeoJsonPolygon;

    try {
      assertValidPolygon(boundary);
    } catch (e) {
      throw new GisException(
        GisErrorCode.INVALID_POLYGON,
        (e as Error).message,
      );
    }

    const valid = await this.plots.isValidGeometry(boundary);
    if (!valid) {
      throw new GisException(
        GisErrorCode.INVALID_POLYGON,
        'Đa giác không khép kín hoặc các cạnh tự cắt chéo nhau.',
      );
    }

    const overlaps = await this.plots.findOverlaps(boundary);
    if (overlaps.length > 0) {
      throw new GisException(
        GisErrorCode.SPATIAL_OVERLAP,
        `Ranh giới bị trùng đè với Lô đất [${overlaps[0].puc}]. Vui lòng vẽ lại.`,
        HttpStatus.BAD_REQUEST,
        { overlaps },
      );
    }

    const areaM2 = await this.plots.computeAreaM2(boundary);
    const puc = await this.pucGenerator.generateNextPuc();
    const { publicUrl } = await this.pucGenerator.generateQrCode(puc);

    const plot = await this.plots.insertPlot({
      puc,
      farmerId: dto.farmer_id,
      plotName: dto.plot_name,
      cropType: dto.crop_type,
      boundary,
      areaM2,
      qrCodeUrl: publicUrl,
    });

    await this.growthHistory.save(
      this.growthHistory.create({
        puc,
        fromStatus: null,
        toStatus: GrowthStatus.DANG_TRONG,
        changedBy: dto.farmer_id,
      }),
    );

    return {
      code: 'SUCCESS',
      message: 'Tạo lô đất và cấp mã PUC thành công.',
      data: {
        id: plot.id,
        puc: plot.puc,
        farmer_id: plot.farmerId,
        plot_name: plot.plotName,
        area_m2: Number(plot.areaM2),
        area_ha: Number((Number(plot.areaM2) / 10000).toFixed(4)),
        crop_type: plot.cropType,
        growth_status: plot.growthStatus,
        risk_level: plot.riskLevel,
        risk_color: RISK_COLORS[plot.riskLevel as RiskLevel],
        qr_code_url: plot.qrCodeUrl,
        created_at: plot.createdAt,
      },
    };
  }

  async getPlotsGeoJson(bbox?: string) {
    let rows;
    if (bbox) {
      const parts = bbox.split(',').map(Number);
      if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) {
        throw new GisException(
          GisErrorCode.INVALID_POLYGON,
          'bbox phải có dạng minX,minY,maxX,maxY',
        );
      }
      const [minX, minY, maxX, maxY] = parts;
      rows = await this.plots.findInBbox(minX, minY, maxX, maxY);
    } else {
      // Default Vietnam Mekong-ish viewport if no bbox
      rows = await this.plots.findInBbox(104.5, 8.5, 107.0, 11.5);
    }

    return {
      type: 'FeatureCollection',
      features: rows.map((r) => ({
        type: 'Feature',
        geometry: r.geojson,
        properties: {
          id: r.id,
          puc: r.puc,
          farmer_id: r.farmer_id,
          plot_name: r.plot_name,
          crop_type: r.crop_type,
          growth_status: r.growth_status,
          risk_level: r.risk_level,
          risk_color: RISK_COLORS[r.risk_level as RiskLevel],
          area_m2: Number(r.area_m2),
          qr_code_url: r.qr_code_url,
          farmer_name: r.farmer_name ?? 'K\'Brông (Đại diện Hộ)',
          farmer_phone: r.farmer_phone ?? '0977 412 550',
          cooperative_name: r.cooperative_name ?? 'HTX Cà Phê Cầu Đất Farm',
          address_text: r.address_text ?? 'Xuân Trường, TP Đà Lạt, Lâm Đồng',
          elevation_m: r.elevation_m ? Number(r.elevation_m) : 1540,
          slope_deg: r.slope_deg ? Number(r.slope_deg) : 16.5,
          soil_type: r.soil_type ?? 'Đất đỏ Bazan màu mỡ',
          soil_ph: r.soil_ph ? Number(r.soil_ph) : 5.8,
          soil_moisture: r.soil_moisture ? Number(r.soil_moisture) : 74,
          soil_organic_matter: r.soil_organic_matter ?? 'Mùn hữu cơ cao (4.2%)',
          created_at: r.created_at,
        },
      })),
    };
  }

  async getByPuc(puc: string) {
    const row = await this.plots.findByPucWithGeo(puc);
    if (!row) {
      throw new GisException(
        GisErrorCode.PUC_NOT_FOUND,
        'Không tìm thấy thông tin Mã vùng trồng.',
        HttpStatus.NOT_FOUND,
      );
    }

    const alerts = await this.alerts.find({
      where: { puc },
      order: { alertDate: 'DESC' },
      take: 10,
    });
    const shipments = await this.shippingLogs.find({
      where: { puc },
      order: { createdAt: 'DESC' },
      take: 20,
    });
    const history = await this.growthHistory.find({
      where: { puc },
      order: { changedAt: 'DESC' },
    });
    const cropHistory = await this.cropHistories.find({
      where: { puc },
      order: { startDate: 'DESC' },
    });

    return {
      code: 'SUCCESS',
      data: {
        id: row.id,
        puc: row.puc,
        farmer_id: row.farmer_id,
        plot_name: row.plot_name,
        crop_type: row.crop_type,
        growth_status: row.growth_status,
        risk_level: row.risk_level,
        risk_color: RISK_COLORS[row.risk_level as RiskLevel],
        area_m2: Number(row.area_m2),
        area_ha: Number((Number(row.area_m2) / 10000).toFixed(4)),
        qr_code_url: row.qr_code_url,
        farmer_name: row.farmer_name ?? 'K\'Brông (Đại diện Hộ)',
        farmer_phone: row.farmer_phone ?? '0977 412 550',
        cooperative_name: row.cooperative_name ?? 'HTX Cà Phê Cầu Đất Farm',
        address_text: row.address_text ?? 'Xuân Trường, TP Đà Lạt, Lâm Đồng',
        elevation_m: row.elevation_m ? Number(row.elevation_m) : 1540,
        slope_deg: row.slope_deg ? Number(row.slope_deg) : 16.5,
        soil_type: row.soil_type ?? 'Đất đỏ Bazan màu mỡ',
        soil_ph: row.soil_ph ? Number(row.soil_ph) : 5.8,
        soil_moisture: row.soil_moisture ? Number(row.soil_moisture) : 74,
        soil_organic_matter: row.soil_organic_matter ?? 'Mùn hữu cơ cao (4.2%)',
        boundary: row.geojson,
        created_at: row.created_at,
        alerts,
        shipments,
        growth_history: history,
        crop_history: cropHistory,
      },
    };
  }

  async addCropHistory(
    puc: string,
    input: {
      season_name: string;
      crop_type: string;
      start_date: string;
      end_date?: string;
      yield_amount?: number;
      yield_unit?: string;
      soil_condition_note?: string;
      disease_history?: string;
      is_current?: boolean;
    },
  ) {
    const plot = await this.plots.findByPuc(puc);
    if (!plot) {
      throw new GisException(
        GisErrorCode.PUC_NOT_FOUND,
        'Không tìm thấy thông tin Mã vùng trồng.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (input.is_current) {
      // Đặt các vụ khác thành false
      await this.cropHistories.update({ puc }, { isCurrent: false });
      // Cập nhật loại cây trồng chính của plot
      await this.plots.updateCropType(puc, input.crop_type);
    }

    const saved = await this.cropHistories.save(
      this.cropHistories.create({
        puc,
        seasonName: input.season_name,
        cropType: input.crop_type,
        startDate: input.start_date,
        endDate: input.end_date ?? null,
        yieldAmount: input.yield_amount ?? null,
        yieldUnit: input.yield_unit ?? 'kg',
        soilConditionNote: input.soil_condition_note ?? null,
        diseaseHistory: input.disease_history ?? 'Không ghi nhận dịch bệnh',
        isCurrent: Boolean(input.is_current),
      }),
    );

    return {
      code: 'SUCCESS',
      message: 'Ghi nhận lịch sử mùa vụ cây trồng thành công.',
      data: saved,
    };
  }

  async updateGrowthStatus(
    puc: string,
    growthStatus: string,
    changedBy: string,
  ) {
    if (!Object.values(GrowthStatus).includes(growthStatus as GrowthStatus)) {
      throw new GisException(
        GisErrorCode.INVALID_POLYGON,
        `growth_status không hợp lệ. Cho phép: ${Object.values(GrowthStatus).join(', ')}`,
      );
    }

    const plot = await this.plots.findByPuc(puc);
    if (!plot) {
      throw new GisException(
        GisErrorCode.PUC_NOT_FOUND,
        'Không tìm thấy thông tin Mã vùng trồng.',
        HttpStatus.NOT_FOUND,
      );
    }

    const from = plot.growthStatus;
    await this.plots.updateGrowthStatus(puc, growthStatus);
    await this.growthHistory.save(
      this.growthHistory.create({
        puc,
        fromStatus: from,
        toStatus: growthStatus as GrowthStatus,
        changedBy,
      }),
    );

    return {
      code: 'SUCCESS',
      message: 'Cập nhật trạng thái sinh trưởng thành công.',
      data: { puc, from_status: from, to_status: growthStatus },
    };
  }

  async createShippingLog(input: {
    puc: string;
    harvest_date: string;
    quantity: number;
    unit: string;
    destination: string;
  }) {
    const plot = await this.plots.findByPuc(input.puc);
    if (!plot) {
      throw new GisException(
        GisErrorCode.PUC_NOT_FOUND,
        'Không tìm thấy thông tin Mã vùng trồng.',
        HttpStatus.NOT_FOUND,
      );
    }

    const datePart = input.harvest_date.replace(/-/g, '');
    const pucCompact = input.puc.replace(/-/g, '');
    const existing = await this.shippingLogs.count({
      where: { puc: input.puc },
    });
    const stt = String(existing + 1).padStart(2, '0');
    const batchCode = `BATCH-${pucCompact}-${datePart}-${stt}`;

    const log = await this.shippingLogs.save(
      this.shippingLogs.create({
        puc: input.puc,
        batchCode,
        harvestDate: input.harvest_date,
        quantity: input.quantity,
        unit: input.unit,
        destination: input.destination,
      }),
    );

    return {
      code: 'SUCCESS',
      message: 'Ghi nhận nhật ký xuất xưởng thành công.',
      data: log,
    };
  }

  async receiveDiseaseAlert(input: {
    puc: string;
    disease_name: string;
    confidence: number;
    xai_overlay_url?: string;
    risk_level?: number;
  }) {
    const plot = await this.plots.findByPuc(input.puc);
    if (!plot) {
      throw new GisException(
        GisErrorCode.PUC_NOT_FOUND,
        'Không tìm thấy thông tin Mã vùng trồng.',
        HttpStatus.NOT_FOUND,
      );
    }

    let risk =
      input.risk_level !== undefined && input.risk_level !== null
        ? Number(input.risk_level)
        : input.confidence >= 80
          ? RiskLevel.NGUY_CO_CAO
          : input.confidence >= 50
            ? RiskLevel.CANH_BAO_NHE
            : RiskLevel.BINH_THUONG;

    if (![0, 1, 2].includes(risk)) {
      risk = RiskLevel.CANH_BAO_NHE;
    }

    const alert = await this.alerts.save(
      this.alerts.create({
        puc: input.puc,
        diseaseName: input.disease_name,
        confidence: input.confidence,
        xaiOverlayUrl: input.xai_overlay_url ?? null,
      }),
    );

    await this.plots.updateRiskLevel(input.puc, risk);

    let neighbors: Array<{ puc: string; risk_level: number }> = [];
    if (risk === RiskLevel.NGUY_CO_CAO) {
      neighbors = await this.plots.markNeighborsRiskWarning(input.puc, 500);
    }

    this.riskGateway.emitRiskUpdated({
      puc: input.puc,
      risk_level: risk,
      risk_color: RISK_COLORS[risk as RiskLevel],
      neighbors,
      source: 'disease-alert',
      at: new Date().toISOString(),
    });

    return {
      code: 'SUCCESS',
      message: 'Tiếp nhận cảnh báo dịch bệnh và cập nhật màu bản đồ.',
      data: {
        alert,
        risk_level: risk,
        risk_color: RISK_COLORS[risk as RiskLevel],
        isolation_neighbors: neighbors,
      },
    };
  }

  async importGeoJson(dto: ImportGeoJsonDto) {
    const farmer =
      dto.default_farmer_id ?? 'a3b8e912-4c5d-6e7f-8a9b-0c1d2e3f4a5b';
    const crop = dto.default_crop_type ?? 'Chưa phân loại';
    const created: string[] = [];
    const errors: Array<{ index: number; message: string }> = [];

    for (let i = 0; i < dto.features.length; i += 1) {
      const f = dto.features[i];
      try {
        const res = await this.createPlot({
          farmer_id: f.properties?.farmer_id ?? farmer,
          plot_name:
            f.properties?.plot_name ?? `Lô import #${i + 1}`,
          crop_type: f.properties?.crop_type ?? crop,
          boundary: f.geometry as never,
        });
        created.push(res.data.puc);
      } catch (e) {
        const err = e as { message?: string; getResponse?: () => unknown };
        const body = err.getResponse?.() as { message?: string } | string | undefined;
        const message =
          typeof body === 'object' && body?.message
            ? body.message
            : err.message || 'Import feature thất bại';
        errors.push({ index: i, message: String(message) });
      }
    }

    return {
      code: 'SUCCESS',
      message: `Import xong: ${created.length} thành công, ${errors.length} lỗi.`,
      data: { created, errors },
    };
  }

  async getRiskSummary() {
    const rows = await this.plots.riskSummary();
    return {
      code: 'SUCCESS',
      data: rows.map((r) => ({
        risk_level: Number(r.risk_level),
        risk_color: RISK_COLORS[Number(r.risk_level) as RiskLevel],
        total_plots: Number(r.total_plots),
        total_area_m2: Number(r.total_area_m2),
        total_area_ha: Number((Number(r.total_area_m2) / 10000).toFixed(2)),
      })),
    };
  }

  async getCropStats() {
    return {
      code: 'SUCCESS',
      data: await this.plots.cropAreaStats(),
    };
  }
}
