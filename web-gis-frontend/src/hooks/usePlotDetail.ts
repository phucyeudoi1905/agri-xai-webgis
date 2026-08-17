import { useCallback, useEffect, useState } from 'react';
import { fetchPlotByPuc } from '../services/gisApi';
import { errorCode, errorMessage } from '../lib/format';
import type { PlotDetail } from '../types/gis.types';

export function usePlotDetail(puc: string | null) {
  const [detail, setDetail] = useState<PlotDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    if (!puc) {
      setDetail(null);
      setError(null);
      setNotFound(false);
      return;
    }
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      setDetail(await fetchPlotByPuc(puc));
    } catch (e) {
      setDetail(null);
      setNotFound(errorCode(e) === 'ERR_GIS_PUC_NOT_FOUND');
      setError(errorMessage(e, 'Không tải được hồ sơ lô đất'));
    } finally {
      setLoading(false);
    }
  }, [puc]);

  useEffect(() => {
    void load();
  }, [load]);

  return { detail, loading, error, notFound, reload: load };
}
