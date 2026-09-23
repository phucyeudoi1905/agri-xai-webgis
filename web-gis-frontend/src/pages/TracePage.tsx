import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShippingModal } from '../components/forms/ShippingModal';

import { Card, CardBody, CardHead } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Icon } from '../components/ui/Icon';
import { StatCard } from '../components/ui/StatCard';
import { WeatherCard } from '../components/ui/WeatherCard';
import { usePlotDetail } from '../hooks/usePlotDetail';
import { useAuth } from '../contexts/AuthContext';
import {
  formatArea,
  formatDate,
  formatDateTime,
  formatNumber,
} from '../lib/format';
import { growthLabel } from '../lib/gis';
import { plotReportPdfUrl } from '../services/gisApi';
import { CropHistoryTimeline } from '../components/crops/CropHistoryTimeline';

const DEMO_PUCS = [
  { puc: 'VN-LD-2026-000003', name: 'Lô Cà Phê Arabica Cầu Đất C1', crop: 'Cà phê Arabica', farmer: "K'Brông (Đại diện Hộ)" },
  { puc: 'VN-LD-2026-000001', name: 'Lô Dâu Tây New Zealand A1', crop: 'Dâu tây New Zealand', farmer: 'Nguyễn Văn An' },
  { puc: 'VN-LD-2026-000002', name: 'Lô Rau Thủy Canh Vạn Thành B2', crop: 'Xà lách Lolo Bosa', farmer: 'Trần Thị Mai' },
  { puc: 'VN-LD-2026-000005', name: 'Lô Atisô Trại Mát E2', crop: 'Atisô Đà Lạt', farmer: 'Phạm Đức Trọng' },
  { puc: 'VN-LD-2026-000004', name: 'Lô Hoa Cúc Thái Phiên D3', crop: 'Hoa Cúc Đại Đóa', farmer: 'Lê Hoàng Nam' },
  { puc: 'VN-LD-2026-000006', name: 'Lô Ớt Chuông Nhà Kính F1', crop: 'Ớt chuông Sweet', farmer: 'Đặng Thu Hà' },
];

export function TracePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAdmin, can } = useAuth();
  const canCreateBatch = can('createBatch');
  const activePuc = searchParams.get('puc') ?? '';
  const [input, setInput] = useState(activePuc);
  const [shippingOpen, setShippingOpen] = useState(false);

  const { detail, loading, error, notFound, reload } = usePlotDetail(activePuc);

  useEffect(() => {
    setInput(activePuc);
  }, [activePuc]);

  const submit = (customPuc?: string) => {
    const target = (customPuc ?? input).trim().toUpperCase();
    if (!target) return;
    setInput(target);
    setSearchParams({ puc: target }, { replace: true });
  };

  const totalShipped =
    detail?.shipments?.reduce((acc, s) => {
      const qty = Number(s.quantity);
      return acc + (s.unit === 'tấn' ? qty * 1000 : qty);
    }, 0) ?? 0;

  return (
    <div className="page-narrow stack">
      <Card>
        <CardHead
          title={
            isAdmin
              ? 'Giám sát chuỗi cung ứng & truy xuất PUC'
              : 'Xuất kho BATCH & tra cứu tem QR'
          }
          subtitle={
            isAdmin
              ? 'Portal Admin: tra cứu hồ sơ Farm-to-Fork, giám sát lô hàng — không tạo phiếu xuất kho.'
              : 'Portal HTX: lập phiếu xuất kho, sinh mã BATCH và in tem QR dán bao bì.'
          }
        />
        <CardBody>
          <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
            <div className="search" style={{ flex: '1 1 320px' }}>
              <Icon name="search" size={15} />
              <input
                className="input mono"
                value={input}
                placeholder="VN-LD-2026-000001"
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submit();
                }}
              />
            </div>
            <button
              type="button"
              className="btn"
              onClick={() => submit()}
              disabled={!input.trim()}
            >
              <Icon name="qr" size={15} />
              Tra cứu
            </button>
          </div>
          <p className="field-hint" style={{ marginTop: 8 }}>
            Nhập mã vùng trồng in trên bao bì hoặc quét QR để xem vị trí lô đất, chủ hộ, thổ nhưỡng và lịch sử xuất xưởng.
          </p>
        </CardBody>
      </Card>

      {!activePuc && (
        <Card>
          <CardHead
            title="Gợi ý tra cứu nhanh (Demo PUCs Lâm Đồng)"
            subtitle="Nhấp trực tiếp vào lô đất để xem hồ sơ truy xuất Farm-to-Fork nguồn gốc"
          />
          <CardBody>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
              {DEMO_PUCS.map((item) => (
                <div
                  key={item.puc}
                  className="quick-puc-card"
                  onClick={() => submit(item.puc)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    padding: '12px 14px',
                    borderRadius: 'var(--r-md)',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'all var(--dur) var(--ease)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--brand-500)';
                    e.currentTarget.style.background = 'var(--bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.background = 'var(--bg-subtle)';
                  }}
                >
                  <div className="row-between">
                    <span className="mono font-bold" style={{ color: 'var(--brand-500)', fontSize: 13 }}>
                      {item.puc}
                    </span>
                    <span className="badge tone-brand" style={{ fontSize: 11 }}>
                      {item.crop}
                    </span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>
                    {item.name}
                  </span>
                  <span className="muted" style={{ fontSize: 12 }}>
                    👤 Đại diện: {item.farmer}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {activePuc && loading && (
        <div className="grid grid-sidebar">
          <div className="skeleton" style={{ height: 260, borderRadius: 14 }} />
          <div className="skeleton" style={{ height: 260, borderRadius: 14 }} />
        </div>
      )}

      {activePuc && !loading && error && (
        <Card>
          <CardBody>
            <EmptyState
              icon={notFound ? 'search' : 'alert'}
              title={
                notFound
                  ? 'Không tìm thấy thông tin Mã vùng trồng'
                  : 'Không tra cứu được'
              }
              description={error}
              action={
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => void reload()}
                >
                  <Icon name="refresh" size={15} />
                  Thử lại
                </button>
              }
            />
          </CardBody>
        </Card>
      )}

      {activePuc && !loading && detail && (
        <>
          <div className="grid grid-3">
            <StatCard
              label="Diện tích"
              value={formatNumber(detail.area_ha, 2)}
              unit="ha"
              hint={formatArea(detail.area_m2)}
              icon="area"
              tone="info"
            />
            <StatCard
              label="Giai đoạn"
              value={growthLabel(detail.growth_status)}
              hint={`Cây trồng: ${detail.crop_type}`}
              icon="sprout"
              tone="brand"
            />
            <StatCard
              label="Đã xuất xưởng"
              value={formatNumber(totalShipped)}
              unit="kg"
              hint={`${detail.shipments?.length ?? 0} lô hàng`}
              icon="truck"
              tone="violet"
            />
          </div>

          <div className="grid grid-sidebar">
            <div className="stack">
              {/* Thẻ Đại diện chủ hộ */}
              <div className="farmer-profile-card">
                <div className="farmer-profile-top">
                  <div className="farmer-avatar-circle">
                    {detail.farmer_name
                      ? detail.farmer_name.charAt(0).toUpperCase()
                      : 'K'}
                  </div>
                  <div className="farmer-main-info">
                    <span className="farmer-name-text">
                      {detail.farmer_name || "K'Brông (Đại diện Hộ)"}
                    </span>
                    <span className="farmer-coop-text">
                      {detail.cooperative_name || 'HTX Cà Phê Cầu Đất Farm'}
                    </span>
                  </div>
                  <a
                    className="farmer-phone-btn"
                    href={`tel:${detail.farmer_phone || '0977412550'}`}
                    title="Gọi trực tiếp cho chủ hộ"
                  >
                    <Icon name="phone" size={13} />
                    <span>{detail.farmer_phone || '0977 412 550'}</span>
                  </a>
                </div>
                <div className="farmer-address-row">
                  <Icon name="map-pin" size={13} />
                  <span>
                    {detail.address_text || 'Xuân Trường, TP Đà Lạt, Lâm Đồng'}{' '}
                    <span className="farmer-elev-tag">
                      (Elev: {detail.elevation_m || 1540}m, Slope: {detail.slope_deg || 16.5}°)
                    </span>
                  </span>
                </div>
              </div>

              <Card>
                <CardHead
                  title="Đặc tính Thổ nhưỡng & Địa hình"
                  subtitle="Thông số lý hóa tầng đất canh tác cao nguyên"
                />
                <CardBody>
                  <div className="soil-grid">
                    <div className="soil-stat-box">
                      <span className="soil-stat-label">Loại đất</span>
                      <span className="soil-stat-val">
                        {detail.soil_type || 'Đất đỏ Bazan màu mỡ'}
                      </span>
                    </div>
                    <div className="soil-stat-box">
                      <span className="soil-stat-label">Độ pH đất</span>
                      <span className="soil-stat-val" style={{ color: 'var(--brand-500)' }}>
                        {detail.soil_ph || 5.8} (Lý tưởng)
                      </span>
                    </div>
                    <div className="soil-stat-box">
                      <span className="soil-stat-label">Độ ẩm tầng rễ</span>
                      <span className="soil-stat-val">
                        {detail.soil_moisture || 74}%
                      </span>
                    </div>
                    <div className="soil-stat-box">
                      <span className="soil-stat-label">Dinh dưỡng hữu cơ</span>
                      <span className="soil-stat-val" style={{ fontSize: 12 }}>
                        {detail.soil_organic_matter || 'Mùn hữu cơ cao (4.2%)'}
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHead
                  title={detail.plot_name}
                  subtitle={`Mã vùng trồng ${detail.puc}`}
                  actions={
                    <div className="row">
                      <a
                        className="btn btn-secondary btn-sm"
                        href={plotReportPdfUrl(detail.puc)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Tải PDF
                      </a>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          navigate(`/map?puc=${encodeURIComponent(detail.puc)}`)
                        }
                      >
                        <Icon name="map" size={14} />
                        Xem bản đồ
                      </button>
                    </div>
                  }
                />
                <CardBody>
                  <dl className="kv">
                    <div>
                      <dt>Mã vùng trồng (PUC)</dt>
                      <dd className="mono">{detail.puc}</dd>
                    </div>
                    <div>
                      <dt>Hợp tác xã / Trang trại</dt>
                      <dd>{detail.cooperative_name || 'HTX Cà Phê Cầu Đất Farm'}</dd>
                    </div>
                    <div>
                      <dt>Loại cây trồng</dt>
                      <dd>{detail.crop_type}</dd>
                    </div>
                    <div>
                      <dt>Diện tích canh tác</dt>
                      <dd>
                        {formatNumber(detail.area_ha, 4)} ha ·{' '}
                        {formatArea(detail.area_m2)}
                      </dd>
                    </div>
                    <div>
                      <dt>Ngày số hóa</dt>
                      <dd>{formatDate(detail.created_at)}</dd>
                    </div>
                  </dl>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <CropHistoryTimeline
                    puc={detail.puc}
                    history={detail.crop_history}
                    onReload={() => void reload()}
                  />
                </CardBody>
              </Card>

              <Card>
                <CardHead
                  title="Nhật ký xuất xưởng"
                  subtitle={
                    canCreateBatch
                      ? 'Mã lô hàng BATCH gắn PUC — lập phiếu khi thu hoạch'
                      : 'Chỉ đọc: Admin giám sát chuỗi; HTX tạo BATCH'
                  }
                  actions={
                    canCreateBatch ? (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setShippingOpen(true)}
                      >
                        <Icon name="plus" size={14} />
                        Lập phiếu BATCH
                      </button>
                    ) : undefined
                  }
                />
                <div className="card-body card-body-flush">
                  {!detail.shipments || detail.shipments.length === 0 ? (
                    <EmptyState
                      icon="truck"
                      title="Chưa có lô hàng"
                      description={
                        canCreateBatch
                          ? 'Ghi nhận sản lượng thu hoạch để hệ thống cấp mã BATCH.'
                          : 'Chưa có phiếu xuất kho từ HTX trên mã PUC này.'
                      }
                    />
                  ) : (
                    <div className="table-wrap">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Mã lô hàng</th>
                            <th>Thu hoạch</th>
                            <th className="align-right">Sản lượng</th>
                            <th>Nơi tiêu thụ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detail.shipments.map((s) => (
                            <tr key={s.id}>
                              <td className="mono" style={{ fontSize: 11.5 }}>
                                {s.batchCode}
                              </td>
                              <td className="muted">{formatDate(s.harvestDate)}</td>
                              <td className="align-right">
                                {formatNumber(Number(s.quantity), 2)} {s.unit}
                              </td>
                              <td>{s.destination}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div className="stack">
              {detail.qr_code_url && (
                <Card>
                  <CardHead title="Mã QR truy xuất" />
                  <CardBody>
                    <div className="qr-box">
                      <img src={detail.qr_code_url} alt={`QR ${detail.puc}`} />
                      <div className="qr-meta">
                        <p style={{ fontSize: 12.5 }}>
                          In lên bao bì để người tiêu dùng quét tra cứu.
                        </p>
                        <a
                          href={detail.qr_code_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: 12.5, fontWeight: 600 }}
                        >
                          Tải ảnh QR
                        </a>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}

              <WeatherCard puc={detail.puc} title="Vi khí hậu tại thửa ruộng" />

              <Card>
                <CardHead title="Lịch sử sinh trưởng" />
                <CardBody>
                  {!detail.growth_history || detail.growth_history.length === 0 ? (
                    <p className="muted" style={{ fontSize: 12.5 }}>
                      Chưa có lịch sử chuyển trạng thái.
                    </p>
                  ) : (
                    <ul className="timeline">
                      {detail.growth_history.map((h) => (
                        <li key={h.id}>
                          <span className="t-title">
                            {h.fromStatus
                              ? `${growthLabel(h.fromStatus)} → ${growthLabel(h.toStatus)}`
                              : growthLabel(h.toStatus)}
                          </span>
                          <span className="t-meta">
                            {formatDateTime(h.changedAt)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardBody>
              </Card>
            </div>
          </div>
        </>
      )}

      {shippingOpen && activePuc && canCreateBatch && (
        <ShippingModal
          puc={activePuc}
          onClose={() => setShippingOpen(false)}
          onCreated={() => {
            setShippingOpen(false);
            void reload();
          }}
        />
      )}
    </div>
  );
}
