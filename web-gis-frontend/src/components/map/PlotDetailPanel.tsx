import { useEffect, useState } from 'react';
import { usePlotDetail } from '../../hooks/usePlotDetail';
import { errorMessage, formatArea, formatDate, formatNumber } from '../../lib/format';
import {
  GROWTH_META,
  GROWTH_ORDER,
  alertStatusLabel,
  growthLabel,
} from '../../lib/gis';
import { updateGrowthStatus, plotReportPdfUrl } from '../../services/gisApi';
import { RiskBadge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { Icon } from '../ui/Icon';
import { useToast } from '../ui/toastContext';

interface Props {
  puc: string;
  onClose: () => void;
  onChanged?: () => void;
  onLogShipment?: (puc: string) => void;
}

export function PlotDetailPanel({ puc, onClose, onChanged, onLogShipment }: Props) {
  const { detail, loading, error, reload } = usePlotDetail(puc);
  const toast = useToast();
  const [growth, setGrowth] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setGrowth(detail?.growth_status ?? '');
  }, [detail?.growth_status]);

  const saveGrowth = async () => {
    if (!detail || growth === detail.growth_status) return;
    setSaving(true);
    try {
      await updateGrowthStatus(detail.puc, growth, detail.farmer_id);
      toast.success('Đã cập nhật sinh trưởng', growthLabel(growth));
      await reload();
      onChanged?.();
    } catch (e) {
      toast.error('Cập nhật thất bại', errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside className="detail-panel" aria-label="Hồ sơ lô đất">
      <header className="detail-head">
        <div className="detail-head-titles">
          <h2>{detail?.plot_name ?? 'Hồ sơ lô đất'}</h2>
          <span className="plot-card-puc">{puc}</span>
        </div>
        <button
          type="button"
          className="btn btn-icon"
          onClick={onClose}
          aria-label="Đóng"
        >
          <Icon name="close" size={16} />
        </button>
      </header>

      <div className="detail-body">
        {loading && (
          <>
            <div className="skeleton" style={{ height: 22, width: '55%' }} />
            <div className="skeleton" style={{ height: 100 }} />
            <div className="skeleton" style={{ height: 78 }} />
          </>
        )}

        {!loading && error && (
          <EmptyState
            icon="alert"
            title="Không tải được hồ sơ"
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
        )}

        {!loading && detail && (
          <>
            <div className="row" style={{ flexWrap: 'wrap' }}>
              <RiskBadge level={detail.risk_level} />
              <span className="badge tone-brand">
                {GROWTH_META[detail.growth_status]?.label ?? detail.growth_status}
              </span>
              <a
                className="btn btn-secondary btn-sm"
                href={plotReportPdfUrl(detail.puc)}
                target="_blank"
                rel="noreferrer"
              >
                PDF
              </a>
            </div>

            <section className="detail-section">
              <h3>Thông tin lô đất</h3>
              <dl className="kv">
                <div>
                  <dt>Mã vùng trồng</dt>
                  <dd className="mono">{detail.puc}</dd>
                </div>
                <div>
                  <dt>Loại cây</dt>
                  <dd>{detail.crop_type}</dd>
                </div>
                <div>
                  <dt>Diện tích</dt>
                  <dd>{formatNumber(detail.area_ha, 4)} ha</dd>
                </div>
                <div>
                  <dt>Chính xác</dt>
                  <dd>{formatArea(detail.area_m2)}</dd>
                </div>
                <div>
                  <dt>Ngày tạo</dt>
                  <dd>{formatDate(detail.created_at)}</dd>
                </div>
              </dl>
            </section>

            <section className="detail-section">
              <h3>Cập nhật sinh trưởng</h3>
              <div className="row">
                <select
                  className="select"
                  value={growth}
                  onChange={(e) => setGrowth(e.target.value)}
                >
                  {GROWTH_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {GROWTH_META[s].label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-sm"
                  disabled={saving || growth === detail.growth_status}
                  onClick={() => void saveGrowth()}
                >
                  {saving ? <span className="spinner" /> : 'Lưu'}
                </button>
              </div>
            </section>

            {detail.qr_code_url && (
              <section className="detail-section">
                <h3>Mã QR truy xuất</h3>
                <div className="qr-box">
                  <img src={detail.qr_code_url} alt={`QR ${detail.puc}`} />
                  <div className="qr-meta">
                    <p style={{ fontSize: 12.5 }}>
                      Quét để tra cứu vị trí lô đất và lịch sử xuất xưởng.
                    </p>
                    <a
                      href={detail.qr_code_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 12.5, fontWeight: 600 }}
                    >
                      Mở ảnh QR
                    </a>
                  </div>
                </div>
              </section>
            )}

            <section className="detail-section">
              <h3>Cảnh báo dịch bệnh ({detail.alerts?.length ?? 0})</h3>
              {!detail.alerts || detail.alerts.length === 0 ? (
                <p className="muted" style={{ fontSize: 12.5 }}>
                  Chưa có cảnh báo nào từ dịch vụ AI.
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
                      {formatDate(a.alertDate)} · {alertStatusLabel(a.status)}
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
            </section>

            <section className="detail-section">
              <div className="row-between" style={{ marginBottom: 9 }}>
                <h3 style={{ margin: 0 }}>
                  Xuất xưởng ({detail.shipments?.length ?? 0})
                </h3>
                {onLogShipment && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onLogShipment(detail.puc)}
                  >
                    <Icon name="plus" size={14} />
                    Ghi nhận
                  </button>
                )}
              </div>
              {!detail.shipments || detail.shipments.length === 0 ? (
                <p className="muted" style={{ fontSize: 12.5 }}>
                  Chưa có lô hàng nào được ghi nhận.
                </p>
              ) : (
                detail.shipments.map((s) => (
                  <div className="batch-item" key={s.id}>
                    <span className="batch-code">{s.batchCode}</span>
                    <span style={{ fontSize: 12.5 }}>
                      {formatNumber(Number(s.quantity), 2)} {s.unit} →{' '}
                      {s.destination}
                    </span>
                    <span className="faint" style={{ fontSize: 11.5 }}>
                      Thu hoạch {formatDate(s.harvestDate)}
                    </span>
                  </div>
                ))
              )}
            </section>
          </>
        )}
      </div>
    </aside>
  );
}
