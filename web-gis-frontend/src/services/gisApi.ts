import axios from 'axios';
import { io, type Socket } from 'socket.io-client';
import type {
  CropStatRow,
  GeoJsonPolygon,
  PlotDetail,
  PlotFeatureCollection,
  RiskSummaryRow,
} from '../types/gis.types';

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
  return config;
});

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
  farmer_id: string;
  plot_name: string;
  crop_type: string;
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

export default api;
