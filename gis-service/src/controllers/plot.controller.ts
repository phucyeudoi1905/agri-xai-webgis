import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import {
  CreatePlotDto,
  ImportGeoJsonDto,
  UpdateGrowthStatusDto,
} from '../dtos/create-plot.dto';
import { Public } from '../decorators/public.decorator';
import { PlotService } from '../services/plot.service';
import { ReportService } from '../services/report.service';

@ApiTags('plots')
@Controller('api/v1/gis/plots')
export class PlotController {
  constructor(
    private readonly plotService: PlotService,
    private readonly reports: ReportService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'UC-GIS-01/02: Số hóa ranh giới + cấp PUC + QR' })
  create(@Body() dto: CreatePlotDto) {
    return this.plotService.createPlot(dto);
  }

  @Post('import')
  @ApiOperation({ summary: 'T10: Import FeatureCollection GeoJSON' })
  importFc(@Body() dto: ImportGeoJsonDto) {
    return this.plotService.importGeoJson(dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'GeoJSON FeatureCollection theo viewport BBOX' })
  @ApiQuery({
    name: 'bbox',
    required: false,
    description: 'minX,minY,maxX,maxY (EPSG:4326)',
  })
  list(@Query('bbox') bbox?: string) {
    return this.plotService.getPlotsGeoJson(bbox);
  }

  @Public()
  @Get('stats/risk')
  @ApiOperation({ summary: 'Thống kê rủi ro không gian' })
  riskSummary() {
    return this.plotService.getRiskSummary();
  }

  @Public()
  @Get('stats/crops')
  @ApiOperation({ summary: 'Thống kê diện tích theo loại cây' })
  cropStats() {
    return this.plotService.getCropStats();
  }

  @Public()
  @Get(':puc/report.pdf')
  @ApiOperation({ summary: 'T11: Xuất PDF hồ sơ lô đất' })
  @Header('Content-Type', 'application/pdf')
  async reportPdf(
    @Param('puc') puc: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const buf = await this.reports.buildPlotPdf(puc);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${puc}-report.pdf"`,
    );
    return new StreamableFile(buf);
  }

  @Public()
  @Get(':puc')
  @ApiOperation({ summary: 'Tra cứu công khai theo mã PUC' })
  getByPuc(@Param('puc') puc: string) {
    return this.plotService.getByPuc(puc);
  }

  @Patch(':puc/growth-status')
  @ApiOperation({ summary: 'UC-GIS-03: Cập nhật trạng thái sinh trưởng' })
  updateGrowth(
    @Param('puc') puc: string,
    @Body() dto: UpdateGrowthStatusDto,
  ) {
    return this.plotService.updateGrowthStatus(
      puc,
      dto.growth_status,
      dto.changed_by,
    );
  }

  @Post(':puc/crop-history')
  @ApiOperation({ summary: 'Ghi nhận mùa vụ / luân canh cây trồng cho lô đất' })
  addCropHistory(
    @Param('puc') puc: string,
    @Body()
    body: {
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
    return this.plotService.addCropHistory(puc, body);
  }
}
