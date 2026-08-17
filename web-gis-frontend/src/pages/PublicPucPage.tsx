import { useParams, Link } from 'react-router-dom';
import { RiskBadge } from '../components/ui/Badge';
import { Card, CardBody, CardHead } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Icon } from '../components/ui/Icon';
import { StatCard } from '../components/ui/StatCard';
import { usePlotDetail } from '../hooks/usePlotDetail';
import {
  formatArea,
  formatDate,
  formatDateTime,
  formatNumber,
} from '../lib/format';
import { alertStatusLabel, growthLabel } from '../lib/gis';
import { plotReportPdfUrl } from '../services/gisApi';

/** Landing công khai khi quét QR — không cần AppShell. */
export function PublicPucPage() {
  const { puc: raw } = useParams();
  const puc = raw ? decodeURIComponent(raw).toUpperCase() : null;
  const { detail, loading, error, notFound } = usePlotDetail(puc);

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
        <Link to="/trace" className="btn btn-secondary btn-sm">
          Mở ứng dụng
        </Link>
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
                <RiskBadge level={detail.risk_level} />
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

            <div className="grid grid-4">
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
                label="Cảnh báo"
                value={formatNumber(detail.alerts?.length ?? 0)}
                icon="alert"
                tone={detail.risk_level === 2 ? 'risk2' : 'risk0'}
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
                <CardHead title="Thông tin canh tác" />
                <CardBody>
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

              <Card>
                <CardHead title="Cảnh báo dịch bệnh" />
                <CardBody>
                  {!detail.alerts?.length ? (
                    <p className="muted">Không có cảnh báo.</p>
                  ) : (
                    detail.alerts.map((a) => (
                      <div className="alert-item" key={a.id}>
                        <div className="row-between">
                          <strong>{a.diseaseName}</strong>
                          <span className="badge risk-2">
                            {formatNumber(Number(a.confidence), 1)}%
                          </span>
                        </div>
                        <span className="faint" style={{ fontSize: 11.5 }}>
                          {formatDateTime(a.alertDate)} ·{' '}
                          {alertStatusLabel(a.status)}
                        </span>
                      </div>
                    ))
                  )}
                </CardBody>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
