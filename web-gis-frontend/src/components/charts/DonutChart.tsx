export interface DonutSlice {
  name: string;
  value: number;
  color: string;
}

interface Props {
  slices: DonutSlice[];
  total?: number;
  centerLabel?: string;
  size?: number;
  thickness?: number;
}

export function DonutChart({
  slices,
  total,
  centerLabel = 'lô đất',
  size = 148,
  thickness = 16,
}: Props) {
  const sum = total ?? slices.reduce((acc, s) => acc + s.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <div className="donut-wrap">
      <div className="donut" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--bg-inset)"
            strokeWidth={thickness}
          />
          {sum > 0 &&
            slices.map((s) => {
              const portion = s.value / sum;
              const dash = portion * circumference;
              const el = (
                <circle
                  key={s.name}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={thickness}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                  strokeLinecap={portion > 0 && portion < 1 ? 'butt' : 'round'}
                />
              );
              offset += dash;
              return el;
            })}
        </svg>
        <div className="donut-center">
          <strong>{sum.toLocaleString('vi-VN')}</strong>
          <span>{centerLabel}</span>
        </div>
      </div>

      <ul className="donut-legend">
        {slices.map((s) => (
          <li key={s.name}>
            <i className="swatch" style={{ background: s.color }} />
            <span className="name">{s.name}</span>
            <span className="value">{s.value.toLocaleString('vi-VN')}</span>
            <span className="pct">
              {sum > 0 ? `${Math.round((s.value / sum) * 100)}%` : '0%'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
