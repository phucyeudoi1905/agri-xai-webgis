import { useCallback, useEffect, useState } from 'react';
import { fetchCropStats, fetchRiskSummary } from '../services/gisApi';
import { errorMessage } from '../lib/format';
import type { CropStatRow, RiskSummaryRow } from '../types/gis.types';

export function useStats() {
  const [risk, setRisk] = useState<RiskSummaryRow[]>([]);
  const [crops, setCrops] = useState<CropStatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [riskRows, cropRows] = await Promise.all([
        fetchRiskSummary(),
        fetchCropStats(),
      ]);
      setRisk(riskRows);
      setCrops(cropRows);
    } catch (e) {
      setError(errorMessage(e, 'Không tải được số liệu thống kê'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const totalPlots = risk.reduce((acc, r) => acc + Number(r.total_plots), 0);
  const totalAreaM2 = risk.reduce((acc, r) => acc + Number(r.total_area_m2), 0);
  const byLevel = (level: number) =>
    risk.find((r) => Number(r.risk_level) === level);

  return {
    risk,
    crops,
    loading,
    error,
    reload,
    totalPlots,
    totalAreaM2,
    byLevel,
  };
}
