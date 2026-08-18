import type { ReactNode } from 'react';
import { RISK_META, growthLabel } from '../../lib/gis';
import type { RiskLevel } from '../../types/gis.types';

interface BadgeProps {
  children: ReactNode;
  tone?: 'neutral' | 'brand' | 'info' | 'violet';
  dot?: boolean;
}

export function Badge({ children, tone = 'neutral', dot }: BadgeProps) {
  const cls = tone === 'neutral' ? 'badge' : `badge tone-${tone}`;
  return (
    <span className={cls}>
      {dot && <i className="badge-dot" />}
      {children}
    </span>
  );
}

export function RiskBadge({ level }: { level: number }) {
  const meta = RISK_META[(level as RiskLevel) ?? 0] ?? RISK_META[0];
  return (
    <span className={`badge risk-${level}`}>
      <i className="badge-dot" />
      {meta.label}
    </span>
  );
}

export function GrowthBadge({ status }: { status?: string }) {
  return <span className="badge">{growthLabel(status)}</span>;
}
