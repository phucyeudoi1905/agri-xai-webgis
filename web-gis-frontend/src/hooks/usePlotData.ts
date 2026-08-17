import { useCallback, useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { fetchAllPlots, fetchPlotsByBbox, type Bbox } from '../services/gisApi';
import { errorMessage } from '../lib/format';
import type { PlotFeature, PlotFeatureCollection } from '../types/gis.types';

function bboxFromMap(map: LeafletMap): Bbox {
  const b = map.getBounds();
  return [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
}

/** Nạp lô đất theo khung nhìn (BBOX) — NFR viewport-based loading của BA. */
export function useViewportPlots(map: LeafletMap | null) {
  const [features, setFeatures] = useState<PlotFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  const reload = useCallback(async () => {
    if (!map) return;
    setLoading(true);
    setError(null);
    try {
      const fc = await fetchPlotsByBbox(bboxFromMap(map));
      setFeatures(fc.features ?? []);
    } catch (e) {
      setError(errorMessage(e, 'Không tải được dữ liệu lô đất'));
    } finally {
      setLoading(false);
    }
  }, [map]);

  useEffect(() => {
    if (!map) return;

    const schedule = () => {
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => void reload(), 350);
    };

    map.on('moveend', schedule);
    map.on('zoomend', schedule);
    void reload();

    return () => {
      map.off('moveend', schedule);
      map.off('zoomend', schedule);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [map, reload]);

  return { features, loading, error, reload };
}

/** Nạp toàn bộ lô đất cho trang danh sách / thống kê. */
export function useAllPlots() {
  const [data, setData] = useState<PlotFeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchAllPlots());
    } catch (e) {
      setError(errorMessage(e, 'Không tải được danh sách lô đất'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    features: data?.features ?? [],
    loading,
    error,
    reload,
  };
}
