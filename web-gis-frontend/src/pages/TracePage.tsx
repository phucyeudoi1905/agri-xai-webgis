import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShippingModal } from '../components/forms/ShippingModal';
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

export function TracePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activePuc = searchParams.get('puc');
  const [input, setInput] = useState(activePuc ?? '');
  const [shippingOpen, setShippingOpen] = useState(false);
  const { detail, loading, error, notFound, reload } = usePlotDetail(activePuc);

  useEffect(() => {
    setInput(activePuc ?? '');
  }, [activePuc]);

  const submit = () => {
    const puc = input.trim().toUpperCase();
    if (!puc) return;
    setSearchParams({ puc }, { replace: true });
  };

  const totalShipped =
    detail?.shipments?.reduce((acc, s) => {
      const qty = Number(s.quantity);
      return acc + (s.unit === 'tấn' ? qty * 1000 : qty);
    }, 0) ?? 0;

  return (
    <div className="page-narrow stack">
      <Card>
        <CardBody>
          <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
            <div className="search" style={{ flex: '1 1 320px' }}>
              <Icon name="search" size={15} />
              <input
                className="input mono"
                value={input}
                placeholder="VN-ST-2026-000001"
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submit();
                }}
              />
            </div>
            <button
              type="button"
              className="btn"
              onClick={submit}
              disabled={!input.trim()}
            >
              <Icon name="qr" size={15} />
              Tra cứu
            </button>
          </div>
          <p className="field-hint" style={{ marginTop: 8 }}>
            Nhập mã vùng trồng in trên bao bì hoặc quét QR để xem vị trí lô đất,
            cảnh báo dịch bệnh và lịch sử xuất xưởng.
          </p>
        </CardBody>
      </Card>

      {!activePuc && (
        <Card>
          <CardBody>
            <EmptyState
              icon="qr"
              title="Chưa có mã nào được tra cứu"
              description="Nhập mã PUC ở trên, hoặc chọn một lô đất từ danh sách để xem hồ sơ truy xuất đầy đủ."
              action={
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate('/plots')}
                >
                  <Icon name="list" size={15} />
                  Mở danh sách lô đất
                </button>
              }
            />
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
              hint={`Cây trồng: ${detail.crop_type}`}
              icon="sprout"
              tone="brand"
            />
            <StatCard
              label="Cảnh báo dịch bệnh"
              value={formatNumber(detail.alerts?.length ?? 0)}
              hint={
                detail.risk_level === 0
                  ? 'Lô đất an toàn'
                  : 'Đang có cảnh báo hoạt động'
              }
              icon="alert"
              tone={detail.risk_level === 2 ? 'risk2' : detail.risk_level === 1 ? 'risk1' : 'risk0'}
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
              <Card>
                <CardHead
                  title={detail.plot_name}
                  subtitle={`Mã vùng trồng ${detail.puc}`}
                  actions={
                    <div className="row">
                      <RiskBadge level={detail.risk_level} />
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
                      <dt>Chủ hộ (farmer_id)</dt>
                      <dd className="mono" style={{ fontSize: 11.5 }}>
                        {detail.farmer_id}
                      </dd>
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
                <CardHead
                  title="Nhật ký xuất xưởng"
                  subtitle="Mã lô hàng gắn với PUC phục vụ truy xuất nguồn gốc"
                  actions={
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setShippingOpen(true)}
                    >
                      <Icon name="plus" size={14} />
                      Ghi nhận
                    </button>
                  }
                />
                <div className="card-body card-body-flush">
                  {!detail.shipments || detail.shipments.length === 0 ? (
                    <EmptyState
                      icon="truck"
                      title="Chưa có lô hàng"
                      description="Ghi nhận sản lượng thu hoạch để hệ thống cấp mã BATCH."
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

              <Card>
                <CardHead title="Cảnh báo dịch bệnh" />
                <CardBody>
                  {!detail.alerts || detail.alerts.length === 0 ? (
                    <p className="muted" style={{ fontSize: 12.5 }}>
                      Không có cảnh báo nào cho lô đất này.
                    </p>
                  ) : (
                    detail.alerts.map((a) => (
                      <div className="alert-item" key={a.id}>
                        <div className="row-between">
                          <strong style={{ fontSize: 13 }}>{a.diseaseName}</strong>
                          <span className="badge risk-2">
                            {formatNumber(Number(a.confidence), 1)}%
                          </span>
                        </div>
                        <span className="faint" style={{ fontSize: 11.5 }}>
                          {formatDateTime(a.alertDate)} ·{' '}
                          {alertStatusLabel(a.status)}
                        </span>
                        {a.xaiOverlayUrl && (
                          <img
                            className="xai-img"
                            src={a.xaiOverlayUrl}
                            alt="Ảnh AI khoanh vùng bệnh"
                          />
                        )}
                      </div>
                    ))
                  )}
                </CardBody>
              </Card>

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

      {shippingOpen && activePuc && (
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
