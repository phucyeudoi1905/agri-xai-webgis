import { useParams, Link } from 'react-router-dom';

import { Card, CardBody, CardHead } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Icon } from '../components/ui/Icon';
import { StatCard } from '../components/ui/StatCard';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { WeatherCard } from '../components/ui/WeatherCard';
import { usePlotDetail } from '../hooks/usePlotDetail';
import {
  formatArea,
  formatDate,
  formatNumber,
} from '../lib/format';
import { growthLabel } from '../lib/gis';
import { plotReportPdfUrl } from '../services/gisApi';
import { CropHistoryTimeline } from '../components/crops/CropHistoryTimeline';

/** Landing công khai khi quét QR — không cần AppShell. */
export function PublicPucPage() {
  const { puc: raw } = useParams();
  const puc = raw ? decodeURIComponent(raw).toUpperCase() : null;
  const { detail, loading, error, notFound, reload } = usePlotDetail(puc);

  return (
    <div className="public-trace">
      <header className="public-trace-head">
        <div className="row" style={{ gap: 10 }}>
          <span className="brand-logo" style={{ width: 36, height: 36 }}>
            <Icon name="sprout" size={18} />
          </span>
          <div>
            <strong>AgriLens GIS</strong>
            <p className="muted" style={{ fontSize: 12, margin: 0 }}>
              Tra cứu nguồn gốc nông sản
            </p>
          </div>
        </div>
        <div className="row">
          <ThemeToggle />
          <Link to="/trace" className="btn btn-secondary btn-sm">
            Mở ứng dụng
          </Link>
        </div>
      </header>

      <div className="public-trace-body page-narrow stack">
        {!puc && (
          <Card>
            <CardBody>
              <EmptyState
                icon="qr"
                title="Thiếu mã PUC"
                description="Quét lại mã QR trên bao bì hoặc mở trang Tra cứu."
              />
            </CardBody>
          </Card>
        )}

        {puc && loading && (
          <div className="skeleton" style={{ height: 220, borderRadius: 14 }} />
        )}

        {puc && !loading && error && (
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
              />
            </CardBody>
          </Card>
        )}

        {detail && (
          <>
            <div className="row-between" style={{ flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ fontSize: 22 }}>{detail.plot_name}</h1>
                <p className="mono muted">{detail.puc}</p>
              </div>
              <div className="row">
                <a
                  className="btn btn-secondary btn-sm"
                  href={plotReportPdfUrl(detail.puc)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Tải PDF
                </a>
              </div>
            </div>

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
                hint={detail.crop_type}
                icon="sprout"
                tone="brand"
              />
              <StatCard
                label="Lô hàng"
                value={formatNumber(detail.shipments?.length ?? 0)}
                icon="truck"
                tone="violet"
              />
            </div>

            <div className="grid grid-2">
              <Card>
                <CardHead title="Đặc tính Thổ nhưỡng & Canh tác" />
                <CardBody>
                  <div className="soil-grid" style={{ marginBottom: 14 }}>
                    <div className="soil-stat-box">
                      <span className="soil-stat-label">Loại đất</span>
                      <span className="soil-stat-val">{detail.soil_type || 'Đất đỏ Bazan màu mỡ'}</span>
                    </div>
                    <div className="soil-stat-box">
                      <span className="soil-stat-label">Độ pH đất</span>
                      <span className="soil-stat-val" style={{ color: 'var(--brand-500)' }}>
                        {detail.soil_ph || 5.8} (Lý tưởng)
                      </span>
                    </div>
                  </div>

                  <dl className="kv">
                    <div>
                      <dt>Cây trồng</dt>
                      <dd>{detail.crop_type}</dd>
                    </div>
                    <div>
                      <dt>Ngày số hóa</dt>
                      <dd>{formatDate(detail.created_at)}</dd>
                    </div>
                  </dl>
                  {detail.qr_code_url && (
                    <div className="qr-box" style={{ marginTop: 12 }}>
                      <img src={detail.qr_code_url} alt={`QR ${detail.puc}`} />
                      <div className="qr-meta">
                        <p style={{ fontSize: 12.5 }}>Mã QR trên bao bì</p>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>

              <WeatherCard puc={detail.puc} title="Vi khí hậu tại thửa đất" />
            </div>

            <div style={{ marginTop: 14 }}>
              <Card>
                <CardBody>
                  <CropHistoryTimeline
                    puc={detail.puc}
                    history={detail.crop_history}
                    onReload={() => void reload()}
                  />
                </CardBody>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
