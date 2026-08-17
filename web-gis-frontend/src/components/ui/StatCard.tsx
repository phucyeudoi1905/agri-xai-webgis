import { Icon, type IconName } from './Icon';

interface Props {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  icon: IconName;
  tone?: 'brand' | 'risk0' | 'risk1' | 'risk2' | 'info' | 'violet';
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  unit,
  hint,
  icon,
  tone = 'brand',
  loading,
}: Props) {
  return (
    <article className="stat">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <span className={`stat-icon tone-${tone}`}>
          <Icon name={icon} size={16} />
        </span>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 30, width: '62%' }} />
      ) : (
        <div className="stat-value">
          {value}
          {unit && <span className="unit">{unit}</span>}
        </div>
      )}

      {hint &&
        (loading ? (
          <div className="skeleton" style={{ height: 12, width: '45%' }} />
        ) : (
          <span className="stat-hint">{hint}</span>
        ))}
    </article>
  );
}
