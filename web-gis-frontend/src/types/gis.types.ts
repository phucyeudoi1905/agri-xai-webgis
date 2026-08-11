export type GrowthStatus =
  | 'DANG_TRONG'
  | 'PHAT_TRIEN'
  | 'RA_HOA'
  | 'THU_HOACH'
  | 'NGHI_CANH';

export type RiskLevel = 0 | 1 | 2;

export interface GeoJsonPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface PlotProperties {
  id: string;
  puc: string;
  farmer_id: string;
  plot_name: string;
  crop_type: string;
  growth_status: GrowthStatus;
  risk_level: RiskLevel;
  risk_color: string;
  area_m2: number;
  qr_code_url?: string | null;
  created_at?: string;
}

export interface PlotFeature {
  type: 'Feature';
  geometry: GeoJsonPolygon;
  properties: PlotProperties;
}

export interface PlotFeatureCollection {
  type: 'FeatureCollection';
  features: PlotFeature[];
}

export interface PlotDetail {
  id: string;
  puc: string;
  farmer_id: string;
  plot_name: string;
  crop_type: string;
  growth_status: GrowthStatus;
  risk_level: RiskLevel;
  risk_color: string;
  area_m2: number;
  area_ha: number;
  qr_code_url: string | null;
  boundary: GeoJsonPolygon;
  created_at: string;
  alerts: Array<{
    id: string;
    diseaseName: string;
    confidence: number;
    xaiOverlayUrl: string | null;
    alertDate: string;
    status: string;
  }>;
  shipments: Array<{
    id: string;
    batchCode: string;
    harvestDate: string;
    quantity: number;
    unit: string;
    destination: string;
  }>;
}

export const RISK_COLORS: Record<RiskLevel, string> = {
  0: '#2E7D32',
  1: '#F57F17',
  2: '#D32F2F',
};
