import axios from 'axios';
import type {
  GeoJsonPolygon,
  PlotDetail,
  PlotFeatureCollection,
} from '../types/gis.types';

const api = axios.create({
  baseURL: import.meta.env.VITE_GIS_API_URL || 'http://localhost:4000',
  timeout: 15000,
});

export async function fetchPlotsByBbox(
  bbox: [number, number, number, number],
): Promise<PlotFeatureCollection> {
  const { data } = await api.get<PlotFeatureCollection>('/api/v1/gis/plots', {
    params: { bbox: bbox.join(',') },
  });
  return data;
}

export async function fetchPlotByPuc(puc: string): Promise<PlotDetail> {
  const { data } = await api.get<{ code: string; data: PlotDetail }>(
    `/api/v1/gis/plots/${encodeURIComponent(puc)}`,
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

export default api;
