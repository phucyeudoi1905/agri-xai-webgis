import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GrowthBadge, RiskBadge } from '../components/ui/Badge';
import { Card, CardHead } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Icon } from '../components/ui/Icon';
import { useAllPlots } from '../hooks/usePlotData';
import { formatDate, formatNumber } from '../lib/format';
import { RISK_META } from '../lib/gis';

type SortKey = 'created' | 'area' | 'risk' | 'name';

export function PlotsPage() {
  const navigate = useNavigate();
  const { features, loading, error, reload } = useAllPlots();
  const [query, setQuery] = useState('');
  const [risk, setRisk] = useState<'all' | '0' | '1' | '2'>('all');
  const [crop, setCrop] = useState('all');
  const [sort, setSort] = useState<SortKey>('created');

  const crops = useMemo(
    () => [...new Set(features.map((f) => f.properties.crop_type))].sort(),
    [features],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = features.filter((f) => {
      const p = f.properties;
      const matchQuery =
        !q ||
        p.plot_name.toLowerCase().includes(q) ||
        p.puc.toLowerCase().includes(q);
      const matchRisk = risk === 'all' || String(p.risk_level) === risk;
      const matchCrop = crop === 'all' || p.crop_type === crop;
      return matchQuery && matchRisk && matchCrop;
    });

    return filtered.sort((a, b) => {
      const pa = a.properties;
      const pb = b.properties;
      switch (sort) {
        case 'area':
          return pb.area_m2 - pa.area_m2;
        case 'risk':
          return pb.risk_level - pa.risk_level;
        case 'name':
          return pa.plot_name.localeCompare(pb.plot_name, 'vi');
        default:
          return (pb.created_at ?? '').localeCompare(pa.created_at ?? '');
      }
    });
  }, [features, query, risk, crop, sort]);

  const totalArea = rows.reduce((acc, f) => acc + f.properties.area_m2, 0);

  return (
    <div className="page-narrow stack">
      <Card>
        <CardHead
          title={`${formatNumber(rows.length)} lô đất`}
          subtitle={`Tổng diện tích đang hiển thị: ${formatNumber(totalArea / 10000, 2)} ha`}
          actions={
            <div className="row">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => void reload()}
              >
                {loading ? <span className="spinner" /> : <Icon name="refresh" size={15} />}
                Làm mới
              </button>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => navigate('/map?draw=1')}
              >
                <Icon name="pen" size={15} />
                Số hóa lô đất
              </button>
            </div>
          }
        />

        <div className="card-body" style={{ paddingBottom: 12 }}>
          <div className="row" style={{ flexWrap: 'wrap', gap: 10 }}>
            <div className="search" style={{ flex: '1 1 260px' }}>
              <Icon name="search" size={15} />
              <input
                className="input"
                value={query}
                placeholder="Tìm theo tên lô hoặc mã PUC…"
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <select
              className="select"
              style={{ width: 'auto' }}
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              aria-label="Lọc theo loại cây"
            >
              <option value="all">Tất cả cây trồng</option>
              {crops.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              className="select"
              style={{ width: 'auto' }}
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sắp xếp"
            >
              <option value="created">Mới nhất</option>
              <option value="area">Diện tích lớn nhất</option>
              <option value="risk">Rủi ro cao nhất</option>
              <option value="name">Tên A→Z</option>
            </select>

            <div className="segmented">
              {(['all', '0', '1', '2'] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={risk === key}
                  onClick={() => setRisk(key)}
                >
                  {key === 'all' ? 'Tất cả' : RISK_META[Number(key) as 0 | 1 | 2].short}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card-body card-body-flush">
          {loading && (
            <div className="card-body stack">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton" style={{ height: 24 }} />
              ))}
            </div>
          )}

          {!loading && error && (
            <EmptyState
              icon="alert"
              title="Không tải được danh sách"
              description={error}
              action={
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => void reload()}
                >
                  Thử lại
                </button>
              }
            />
          )}

          {!loading && !error && rows.length === 0 && (
            <EmptyState
              icon="list"
              title="Chưa có lô đất phù hợp"
              description="Xóa bộ lọc hoặc số hóa lô đất mới trên bản đồ."
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
          )}

          {!loading && !error && rows.length > 0 && (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Lô đất</th>
                    <th>Mã PUC</th>
                    <th>Cây trồng</th>
                    <th>Sinh trưởng</th>
                    <th>Rủi ro</th>
                    <th className="align-right">Diện tích (ha)</th>
                    <th>Ngày tạo</th>
                    <th aria-label="Hành động" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((f) => {
                    const p = f.properties;
                    return (
                      <tr
                        key={p.puc}
                        className="clickable"
                        onClick={() =>
                          navigate(`/trace?puc=${encodeURIComponent(p.puc)}`)
                        }
                      >
                        <td className="cell-strong">{p.plot_name}</td>
                        <td className="mono muted">{p.puc}</td>
                        <td>{p.crop_type}</td>
                        <td>
                          <GrowthBadge status={p.growth_status} />
                        </td>
                        <td>
                          <RiskBadge level={p.risk_level} />
                        </td>
                        <td className="align-right">
                          {formatNumber(p.area_m2 / 10000, 2)}
                        </td>
                        <td className="muted">{formatDate(p.created_at)}</td>
                        <td className="align-right">
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/map?puc=${encodeURIComponent(p.puc)}`);
                            }}
                          >
                            <Icon name="map" size={14} />
                            Bản đồ
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
