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
import { useAuth } from '../contexts/AuthContext';
import { formatArea, formatNumber, relativeTime } from '../lib/format';
import { GROWTH_ORDER, GROWTH_META, RISK_META } from '../lib/gis';

export function DashboardPage() {
  const navigate = useNavigate();
  const stats = useStats();
  const { user, isAdmin } = useAuth();
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
      {/* Role-specific Workspace Banner Header */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          background: isAdmin
            ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%)'
            : 'linear-gradient(135deg, rgba(6, 78, 59, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%)',
          borderLeft: isAdmin ? '4px solid #3b82f6' : '4px solid #10b981',
        }}
      >
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="row" style={{ gap: 8, alignItems: 'center', marginBottom: 4 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: isAdmin ? '#dbeafe' : '#d1fae5',
                  color: isAdmin ? '#1e40af' : '#065f46',
                }}
              >
                {isAdmin ? 'PORTAL ADMIN · CƠ QUAN QUẢN LÝ' : 'PORTAL HTX · CHỦ THỂ SẢN XUẤT'}
              </span>
              <span className="muted" style={{ fontSize: 12 }}>
                Đang đăng nhập: <strong>{user?.name}</strong> ({user?.cooperativeName})
              </span>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
              {isAdmin
                ? 'Bảng Điều Hành Vĩ Mô Vùng Trồng & Dịch Tễ Lâm Đồng'
                : 'Không Gian Quản Lý Canh Tác & Xuất Kho — HTX Cầu Đất Farm'}
            </h2>
            <p className="muted" style={{ fontSize: 12.5, margin: '4px 0 0' }}>
              {isAdmin
                ? 'Giám sát không gian địa lý, tỷ lệ rủi ro dịch bệnh và phê duyệt mã PUC xuất khẩu trên địa bàn tỉnh.'
                : 'Quản lý thửa đất của các hộ thành viên, lịch sử luân canh cải tạo đất và tạo mã lô hàng BATCH xuất xưởng.'}
            </p>
          </div>

          <div className="row" style={{ gap: 8 }}>
            {isAdmin ? (
              <>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => navigate('/map')}
                >
                  <Icon name="map" size={14} />
                  <span>Bản đồ quy hoạch</span>
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
                  onClick={() => navigate('/plots')}
                >
                  <Icon name="list" size={14} />
                  <span>Duyệt vùng trồng</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => navigate('/map?draw=1')}
                >
                  <Icon name="pen" size={14} />
                  <span>Đăng ký thửa</span>
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => navigate('/trace')}
                >
                  <Icon name="qr" size={14} />
                  <span>Lập phiếu xuất kho</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <StatCard
          label={isAdmin ? 'Tổng số vùng trồng toàn tỉnh' : 'Thửa đất thành viên HTX'}
          value={formatNumber(stats.totalPlots)}
          hint={isAdmin ? 'Đã thẩm định & cấp mã PUC' : 'Đang quản lý canh tác'}
          icon="target"
          tone="brand"
          loading={stats.loading}
        />
        <StatCard
          label={isAdmin ? 'Tổng diện tích quy hoạch' : 'Tổng diện tích HTX quản lý'}
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
            title={isAdmin ? 'Phân bổ rủi ro toàn tỉnh' : 'Rủi ro trên vùng HTX'}
            subtitle={
              isAdmin
                ? 'Heatmap giám sát dịch tễ — cơ quan quản lý'
                : 'Theo dõi cảnh báo trên thửa thành viên'
            }
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
