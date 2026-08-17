import { useEffect, useState } from 'react';
import { pingService } from '../services/gisApi';

export type HealthState = 'checking' | 'up' | 'down';

export function useServiceHealth(intervalMs = 30000): HealthState {
  const [state, setState] = useState<HealthState>('checking');

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const ok = await pingService();
      if (!cancelled) setState(ok ? 'up' : 'down');
    };

    void check();
    const id = window.setInterval(() => void check(), intervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [intervalMs]);

  return state;
}
