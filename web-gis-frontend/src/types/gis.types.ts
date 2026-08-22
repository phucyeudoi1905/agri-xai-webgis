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

export interface PlotCropHistory {
  id: string;
  puc: string;
  season_name?: string;
  seasonName?: string;
  crop_type?: string;
  cropType?: string;
  start_date?: string;
  startDate?: string;
  end_date?: string | null;
  endDate?: string | null;
  yield_amount?: number | null;
  yieldAmount?: number | null;
  yield_unit?: string | null;
  yieldUnit?: string | null;
  soil_condition_note?: string | null;
  soilConditionNote?: string | null;
  disease_history?: string | null;
  diseaseHistory?: string | null;
  is_current?: boolean;
  isCurrent?: boolean;
  created_at?: string;
  createdAt?: string;
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
  growth_history?: Array<{
    id: string;
    fromStatus: GrowthStatus | null;
    toStatus: GrowthStatus;
    changedBy: string | null;
    changedAt: string;
  }>;
  crop_history?: PlotCropHistory[];
}

export interface RiskSummaryRow {
  risk_level: RiskLevel;
  risk_color: string;
  total_plots: number;
  total_area_m2: number;
  total_area_ha: number;
}

/** Backend trả các trị số dạng chuỗi để giữ độ chính xác NUMERIC. */
export interface CropStatRow {
  crop_type: string;
  total_plots: string;
  total_area_m2: string;
  total_area_ha: string;
}

export const RISK_COLORS: Record<RiskLevel, string> = {
  0: '#2E7D32',
  1: '#F57F17',
  2: '#D32F2F',
};

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  rain: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  weatherCode: number;
  condition: string;
  icon: string;
  isDay: boolean;
  time: string;
}

export interface DailyForecast {
  date: string;
  weatherCode: number;
  condition: string;
  icon: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  precipitationProbability: number;
  windSpeedMax: number;
}

export interface IotClimateReading {
  temperatureC: number;
  humidityPct: number;
  sensorId: string | null;
  recordedAt: string;
}

export interface PlotWeatherReport {
  puc?: string;
  plotName?: string;
  cropType?: string;
  location: { lat: number; lng: number };
  current: CurrentWeather;
  daily: DailyForecast[];
  agriAdvice: string;
  iotReading?: IotClimateReading | null;
}

