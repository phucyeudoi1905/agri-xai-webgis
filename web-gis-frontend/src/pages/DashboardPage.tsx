import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarList } from '../components/charts/BarList';
import { DonutChart, type DonutSlice } from '../components/charts/DonutChart';
import { GrowthBadge } from '../components/ui/Badge';
import { Card, CardBody, CardHead } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Icon } from '../components/ui/Icon';
import { StatCard } from '../components/ui/StatCard';
import { WeatherCard } from '../components/ui/WeatherCard';
import { useAllPlots } from '../hooks/usePlotData';
import { useStats } from '../hooks/useStats';
import { formatArea, formatNumber, relativeTime } from '../lib/format';
import { GROWTH_ORDER, GROWTH_META, RISK_META } from '../lib/gis';

export function DashboardPage() {
  const navigate = useNavigate();
  const stats = useStats();
  const { features, reload: reloadPlots } = useAllPlots();

  const riskSlices = useMemo<DonutSlice[]>(
    () =>
      ([0, 1, 2] as const).map((level) => ({
        name: RISK_META[level].label,
        value: Number(stats.byLevel(level)?.total_plots ?? 0),
        color: RISK_META[level].color,
      })),
    [stats],
  );

  const cropItems = useMemo(
    () =>
      stats.crops.slice(0, 6).map((c) => ({
        name: c.crop_type,
        value: Number(c.total_area_ha),
        caption: `${formatNumber(Number(c.total_plots))} lô`,
      })),
    [stats.crops],
  );

  const growthItems = useMemo(() => {
    const counts = new Map<string, number>();
    for (const f of features) {
      const key = f.properties.growth_status;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return GROWTH_ORDER.filter((s) => counts.get(s)).map((s) => ({
      name: GROWTH_META[s].label,
      value: counts.get(s) ?? 0,
    }));
  }, [features]);
  const recent = useMemo(
    () =>
      [...features]
        .sort((a, b) =>
          (b.properties.created_at ?? '').localeCompare(
            a.properties.created_at ?? '',
          ),
        )
        .slice(0, 5),
    [features],
  );


  if (stats.error) {
    return (
      <div className="page-narrow">
        <Card>
          <CardBody>
            <EmptyState
              icon="alert"
              title="Không tải được số liệu"
              description={stats.error}
              action={
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => void stats.reload()}
                >
                  <Icon name="refresh" size={15} />
                  Thử lại
                </button>
              }
            />
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-narrow stack">
      <div className="grid grid-2">
        <StatCard
          label="Tổng lô đất"
          value={formatNumber(stats.totalPlots)}
          hint="Đã cấp mã vùng trồng PUC"
          icon="target"
          tone="brand"
          loading={stats.loading}
        />
        <StatCard
          label="Tổng diện tích"
          value={formatNumber(stats.totalAreaM2 / 10000, 2)}
          unit="ha"
          hint={formatArea(stats.totalAreaM2)}
          icon="area"
          tone="info"
          loading={stats.loading}
        />
      </div>

      <WeatherCard title="Thời tiết & Vi khí hậu toàn vùng trồng (Lâm Đồng - Đà Lạt)" />

      <div className="grid grid-sidebar">
        <Card>
          <CardHead
            title="Diện tích theo loại cây trồng"
            subtitle="Tổng hợp từ PostGIS ST_Area, quy đổi héc-ta"
          />
          <CardBody>
            {stats.loading ? (
              <div className="stack">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="skeleton" style={{ height: 30 }} />
                ))}
              </div>
            ) : cropItems.length === 0 ? (
              <EmptyState
                icon="sprout"
                title="Chưa có dữ liệu cây trồng"
                description="Hãy số hóa lô đất đầu tiên để hệ thống tổng hợp diện tích canh tác."
                action={
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => navigate('/map?draw=1')}
                  >
                    <Icon name="pen" size={15} />
                    Số hóa lô đất
                  </button>
                }
              />
            ) : (
              <BarList
                items={cropItems}
                format={(v) => `${formatNumber(v, 2)} ha`}
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHead
            title="Phân bổ rủi ro không gian"
            subtitle="Máy trạng thái đổi màu bản đồ"
          />
          <CardBody>
            {stats.loading ? (
              <div className="skeleton" style={{ height: 148, borderRadius: 999 }} />
            ) : stats.totalPlots === 0 ? (
              <EmptyState
                icon="shield"
                title="Chưa có lô đất nào"
                description="Số liệu rủi ro sẽ xuất hiện khi có lô đất trong hệ thống."
              />
            ) : (
              <DonutChart slices={riskSlices} />
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-sidebar">
        <div className="stack">
          <Card>
            <CardHead
              title="Tiến độ sinh trưởng"
              subtitle="Số lô theo từng giai đoạn"
            />
            <CardBody>
              {growthItems.length === 0 ? (
                <p className="muted">Chưa có dữ liệu sinh trưởng.</p>
              ) : (
                <BarList items={growthItems} format={(v) => `${v} lô`} />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHead
              title="Lô đất mới nhất"
              actions={
                <button
                  type="button"
                  className="btn btn-icon"
                  onClick={() => void reloadPlots()}
                  aria-label="Làm mới"
                >
                  <Icon name="refresh" size={15} />
                </button>
              }
            />
            <CardBody>
              {recent.length === 0 ? (
                <p className="muted">Chưa có lô đất nào.</p>
              ) : (
                <ul className="timeline">
                  {recent.map((f) => (
                    <li key={f.properties.puc}>
                      <span className="t-title">{f.properties.plot_name}</span>
                      <span className="t-meta">
                        {f.properties.puc} · {relativeTime(f.properties.created_at)}
                      </span>
                      <div style={{ marginTop: 4 }}>
                        <GrowthBadge status={f.properties.growth_status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
