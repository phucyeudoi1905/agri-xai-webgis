import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PlotEntity } from '../entities/plot.entity';
import { GeoJsonPolygon, toGeoJsonString } from '../utils/spatial/geojson.util';

export interface OverlapHit {
  id: string;
  puc: string;
  plot_name: string;
}

export interface PlotGeoRow {
  id: string;
  puc: string;
  farmer_id: string;
  plot_name: string;
  crop_type: string;
  growth_status: string;
  risk_level: number;
  area_m2: number;
  qr_code_url: string | null;
  farmer_name?: string | null;
  farmer_phone?: string | null;
  cooperative_name?: string | null;
  address_text?: string | null;
  elevation_m?: number | null;
  slope_deg?: number | null;
  soil_type?: string | null;
  soil_ph?: number | null;
  soil_moisture?: number | null;
  soil_organic_matter?: string | null;
  created_at: Date;
  geojson: object;
}

@Injectable()
export class PlotRepository {
  constructor(
    @InjectRepository(PlotEntity)
    private readonly repo: Repository<PlotEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findOverlaps(boundary: GeoJsonPolygon): Promise<OverlapHit[]> {
    return this.dataSource.query(
      `SELECT id, puc, plot_name
       FROM plots
       WHERE ST_Intersects(
         boundary,
         ST_SetSRID(ST_GeomFromGeoJSON($1), 4326)
       ) = TRUE
       LIMIT 5`,
      [toGeoJsonString(boundary)],
    );
  }

  async isValidGeometry(boundary: GeoJsonPolygon): Promise<boolean> {
    const rows = await this.dataSource.query(
      `SELECT ST_IsValid(ST_SetSRID(ST_GeomFromGeoJSON($1), 4326)) AS ok,
              ST_IsSimple(ST_SetSRID(ST_GeomFromGeoJSON($1), 4326)) AS simple`,
      [toGeoJsonString(boundary)],
    );
    return Boolean(rows[0]?.ok) && Boolean(rows[0]?.simple);
  }

  async computeAreaM2(boundary: GeoJsonPolygon): Promise<number> {
    const rows = await this.dataSource.query(
      `SELECT ROUND(
         ST_Area(ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON($1), 4326), 3857))::numeric,
         2
       ) AS area_m2`,
      [toGeoJsonString(boundary)],
    );
    return Number(rows[0].area_m2);
  }

  async insertPlot(input: {
    puc: string;
    farmerId: string;
    plotName: string;
    cropType: string;
    boundary: GeoJsonPolygon;
    areaM2: number;
    qrCodeUrl: string;
    farmerName?: string;
    farmerPhone?: string;
    cooperativeName?: string;
    addressText?: string;
    elevationM?: number;
    slopeDeg?: number;
    soilType?: string;
    soilPh?: number;
    soilMoisture?: number;
    soilOrganicMatter?: string;
  }): Promise<PlotEntity> {
    await this.dataSource.query(
      `INSERT INTO plots (
         puc, farmer_id, plot_name, boundary, area_m2, crop_type, qr_code_url,
         farmer_name, farmer_phone, cooperative_name, address_text,
         elevation_m, slope_deg, soil_type, soil_ph, soil_moisture, soil_organic_matter
       ) VALUES (
         $1, $2, $3,
         ST_SetSRID(ST_GeomFromGeoJSON($4), 4326),
         $5, $6, $7,
         $8, $9, $10, $11,
         $12, $13, $14, $15, $16, $17
       )`,
      [
        input.puc,
        input.farmerId,
        input.plotName,
        toGeoJsonString(input.boundary),
        input.areaM2,
        input.cropType,
        input.qrCodeUrl,
        input.farmerName ?? null,
        input.farmerPhone ?? null,
        input.cooperativeName ?? null,
        input.addressText ?? null,
        input.elevationM ?? null,
        input.slopeDeg ?? null,
        input.soilType ?? null,
        input.soilPh ?? null,
        input.soilMoisture ?? null,
        input.soilOrganicMatter ?? null,
      ],
    );
    return this.findByPuc(input.puc) as Promise<PlotEntity>;
  }

  async findByPuc(puc: string): Promise<PlotEntity | null> {
    return this.repo.findOne({ where: { puc } });
  }

  async findByPucWithGeo(puc: string): Promise<PlotGeoRow | null> {
    const rows: PlotGeoRow[] = await this.dataSource.query(
      `SELECT id, puc, farmer_id, plot_name, crop_type, growth_status, risk_level,
              area_m2, qr_code_url, farmer_name, farmer_phone, cooperative_name, address_text,
              elevation_m, slope_deg, soil_type, soil_ph, soil_moisture, soil_organic_matter,
              created_at,
              ST_AsGeoJSON(boundary)::json AS geojson
       FROM plots WHERE puc = $1`,
      [puc],
    );
    return rows[0] ?? null;
  }

  async findCentroidByPuc(puc: string): Promise<{ lat: number; lng: number } | null> {
    const rows = await this.dataSource.query(
      `SELECT ST_Y(ST_Centroid(boundary)) AS lat,
              ST_X(ST_Centroid(boundary)) AS lng
       FROM plots WHERE puc = $1`,
      [puc],
    );
    if (!rows[0] || rows[0].lat == null) return null;
    return { lat: Number(rows[0].lat), lng: Number(rows[0].lng) };
  }

  async findInBbox(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
  ): Promise<PlotGeoRow[]> {
    return this.dataSource.query(
      `SELECT id, puc, farmer_id, plot_name, crop_type, growth_status, risk_level,
              area_m2, qr_code_url, farmer_name, farmer_phone, cooperative_name, address_text,
              elevation_m, slope_deg, soil_type, soil_ph, soil_moisture, soil_organic_matter,
              created_at,
              ST_AsGeoJSON(boundary)::json AS geojson
       FROM plots
       WHERE boundary && ST_MakeEnvelope($1, $2, $3, $4, 4326)
         AND ST_Intersects(boundary, ST_MakeEnvelope($1, $2, $3, $4, 4326))`,
      [minX, minY, maxX, maxY],
    );
  }

  async updateGrowthStatus(puc: string, status: string): Promise<void> {
    await this.repo.update({ puc }, { growthStatus: status as never });
  }

  async updateRiskLevel(puc: string, riskLevel: number): Promise<void> {
    await this.repo.update({ puc }, { riskLevel: riskLevel as never });
  }

  /**
   * T19: lô trong bán kính `radiusMeters` của PUC nguồn → risk=1,
   * không hạ risk của lô đang = 2 và không đụng lô nguồn.
   */
  async markNeighborsRiskWarning(
    sourcePuc: string,
    radiusMeters = 500,
  ): Promise<Array<{ puc: string; risk_level: number }>> {
    const rows: Array<{ puc: string; risk_level: number }> =
      await this.dataSource.query(
        `UPDATE plots AS n
         SET risk_level = 1
         FROM plots AS src
         WHERE src.puc = $1
           AND n.puc <> src.puc
           AND n.risk_level < 2
           AND ST_DWithin(
             ST_Transform(n.boundary, 3857),
             ST_Transform(src.boundary, 3857),
             $2
           )
         RETURNING n.puc, n.risk_level`,
        [sourcePuc, radiusMeters],
      );
    return rows;
  }

  async riskSummary(): Promise<
    { risk_level: number; total_plots: string; total_area_m2: string }[]
  > {
    return this.dataSource.query(
      `SELECT risk_level,
              COUNT(id)::text AS total_plots,
              COALESCE(SUM(area_m2), 0)::text AS total_area_m2
       FROM plots
       GROUP BY risk_level
       ORDER BY risk_level`,
    );
  }

  async updateCropType(puc: string, cropType: string): Promise<void> {
    await this.repo.update({ puc }, { cropType });
  }

  async cropAreaStats(): Promise<
    {
      crop_type: string;
      total_plots: string;
      total_area_m2: string;
      total_area_ha: string;
    }[]
  > {
    return this.dataSource.query(
      `SELECT crop_type,
              COUNT(id)::text AS total_plots,
              SUM(area_m2)::text AS total_area_m2,
              ROUND(SUM(area_m2) / 10000.0, 2)::text AS total_area_ha
       FROM plots
       GROUP BY crop_type
       ORDER BY SUM(area_m2) DESC`,
    );
  }
}
