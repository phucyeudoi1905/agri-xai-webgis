import { useCallback, useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { fetchPlotsByBbox } from '../services/gisApi';
import type { PlotFeatureCollection } from '../types/gis.types';

function bboxFromMap(map: LeafletMap): [number, number, number, number] {
  const b = map.getBounds();
  return [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
}

export function usePlotData(map: LeafletMap | null) {
  const [data, setData] = useState<PlotFeatureCollection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  const reload = useCallback(async () => {
    if (!map) return;
    setLoading(true);
    setError(null);
    try {
      const fc = await fetchPlotsByBbox(bboxFromMap(map));
      setData(fc);
    } catch (e) {
      setError((e as Error).message || 'Không tải được dữ liệu lô đất');
    } finally {
      setLoading(false);
    }
  }, [map]);

  useEffect(() => {
    if (!map) return;

    const schedule = () => {
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        void reload();
      }, 350);
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

  return { data, loading, error, reload };
}
