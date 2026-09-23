import axios from 'axios';
import { io, type Socket } from 'socket.io-client';
import type {
  CropStatRow,
  GeoJsonPolygon,
  PlotDetail,
  PlotFeatureCollection,
  RiskSummaryRow,
} from '../types/gis.types';
import { getStoredToken } from '../lib/authStorage';

const baseURL = import.meta.env.VITE_GIS_API_URL || 'http://localhost:4000';
const apiKey = (import.meta.env.VITE_GIS_API_KEY as string | undefined)?.trim();

const api = axios.create({
  baseURL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (apiKey) {
    config.headers.set('X-API-Key', apiKey);
  }
  const token = getStoredToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

export async function loginRequest(username: string, password: string) {
  const { data } = await api.post<{
    code: string;
    data: {
      access_token: string;
      user: {
        id: string;
        username: string;
        name: string;
        role: string;
        phone?: string | null;
        cooperativeName?: string | null;
      };
    };
  }>('/api/v1/auth/login', { username, password });
  return data.data;
}

export async function fetchMe() {
  const { data } = await api.get<{
    code: string;
    data: {
      id: string;
      username: string;
      name: string;
      role: string;
      phone?: string | null;
      cooperativeName?: string | null;
    };
  }>('/api/v1/auth/me');
  return data.data;
}

export interface FarmerRecord {
  id: string;
  farmer_code: string;
  full_name: string;
  phone: string;
  cooperative_name: string | null;
  address_text: string | null;
}

export async function fetchFarmerByCode(code: string): Promise<FarmerRecord> {
  const { data } = await api.get<{ code: string; data: FarmerRecord }>(
    `/api/v1/gis/farmers/${encodeURIComponent(code)}`,
  );
  return data.data;
}

export type Bbox = [number, number, number, number];

/** BBOX phủ toàn bộ vùng dữ liệu — dùng cho trang danh sách và thống kê. */
export const NATIONWIDE_BBOX: Bbox = [102, 8, 110, 24];

export async function fetchPlotsByBbox(
  bbox: Bbox,
): Promise<PlotFeatureCollection> {
  const { data } = await api.get<PlotFeatureCollection>('/api/v1/gis/plots', {
    params: { bbox: bbox.join(',') },
  });
  return data;
}

export function fetchAllPlots(): Promise<PlotFeatureCollection> {
  return fetchPlotsByBbox(NATIONWIDE_BBOX);
}

export async function fetchPlotByPuc(puc: string): Promise<PlotDetail> {
  const { data } = await api.get<{ code: string; data: PlotDetail }>(
    `/api/v1/gis/plots/${encodeURIComponent(puc)}`,
  );
  return data.data;
}

export async function fetchRiskSummary(): Promise<RiskSummaryRow[]> {
  const { data } = await api.get<{ code: string; data: RiskSummaryRow[] }>(
    '/api/v1/gis/plots/stats/risk',
  );
  return data.data;
}

export async function fetchCropStats(): Promise<CropStatRow[]> {
  const { data } = await api.get<{ code: string; data: CropStatRow[] }>(
    '/api/v1/gis/plots/stats/crops',
  );
  return data.data;
}

export async function createPlot(payload: {
  farmer_id?: string;
  farmer_code?: string;
  plot_name: string;
  crop_type?: string;
  cropping_pattern?: 'DON_CAY' | 'XEN_CANH' | 'LUAN_PHIEN';
  crop_types?: string[];
  rotation_seasons?: Array<{ season_name: string; crop_type: string }>;
  boundary: GeoJsonPolygon;
}) {
  const { data } = await api.post('/api/v1/gis/plots', payload);
  return data;
}

export async function importGeoJson(payload: {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: GeoJsonPolygon;
    properties?: {
      plot_name?: string;
      crop_type?: string;
      farmer_id?: string;
    };
  }>;
  default_farmer_id?: string;
  default_crop_type?: string;
}) {
  const { data } = await api.post('/api/v1/gis/plots/import', payload);
  return data;
}

export async function updateGrowthStatus(
  puc: string,
  growthStatus: string,
  changedBy: string,
) {
  const { data } = await api.patch(
    `/api/v1/gis/plots/${encodeURIComponent(puc)}/growth-status`,
    { growth_status: growthStatus, changed_by: changedBy },
  );
  return data;
}

export async function createShippingLog(payload: {
  puc: string;
  harvest_date: string;
  quantity: number;
  unit: string;
  destination: string;
}) {
  const { data } = await api.post('/api/v1/gis/shipping', payload);
  return data;
}

export async function postDiseaseAlert(payload: {
  puc: string;
  disease_name: string;
  confidence: number;
  xai_overlay_url?: string;
  risk_level?: number;
}) {
  const { data } = await api.post('/api/v1/gis/plots/disease-alert', payload);
  return data;
}

export async function addCropSeason(
  puc: string,
  payload: {
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
  const { data } = await api.post(
    `/api/v1/gis/plots/${encodeURIComponent(puc)}/crop-history`,
    payload,
  );
  return data;
}

export function plotReportPdfUrl(puc: string): string {
  return `${baseURL}/api/v1/gis/plots/${encodeURIComponent(puc)}/report.pdf`;
}

export async function pingService(): Promise<boolean> {
  try {
    const { data } = await api.get<{ status: string; db: string }>('/health', {
      timeout: 4000,
    });
    return data.db === 'up';
  } catch {
    return false;
  }
}

export interface RiskUpdatedEvent {
  puc: string;
  risk_level: number;
  risk_color: string;
  neighbors?: Array<{ puc: string; risk_level: number }>;
  source: string;
  at: string;
}

export function connectRiskSocket(
  onRisk: (ev: RiskUpdatedEvent) => void,
): Socket {
  const wsBase = import.meta.env.VITE_GIS_WS_URL || baseURL;
  const socket = io(`${wsBase}/gis`, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });
  socket.on('risk.updated', onRisk);
  return socket;
}

export async function fetchPlotWeather(puc: string) {
  const { data } = await api.get<{ code: string; data: import('../types/gis.types').PlotWeatherReport }>(
    `/api/v1/gis/climate/${encodeURIComponent(puc)}/weather`,
  );
  return data.data;
}

export async function fetchCurrentWeather(lat = 11.94, lng = 108.45) {
  const { data } = await api.get<{ code: string; data: import('../types/gis.types').PlotWeatherReport }>(
    '/api/v1/gis/climate/weather/current',
    { params: { lat, lng } },
  );
  return data.data;
}

export default api;

