import { useEffect, useRef, useState } from 'react';
import { usePlotDetail } from '../../hooks/usePlotDetail';
import { errorMessage, formatArea, formatDate, formatNumber } from '../../lib/format';
import {
  GROWTH_META,
  GROWTH_ORDER,
  growthLabel,
} from '../../lib/gis';
import { updateGrowthStatus, plotReportPdfUrl } from '../../services/gisApi';
import { EmptyState } from '../ui/EmptyState';
import { Icon } from '../ui/Icon';
import { useToast } from '../ui/toastContext';
import { WeatherCard } from '../ui/WeatherCard';
import { CropHistoryTimeline } from '../crops/CropHistoryTimeline';

interface Props {
  puc: string;
  onClose: () => void;
  onChanged?: () => void;
  onLogShipment?: (puc: string) => void;
}

const DEFAULT_WIDTH = 420;
const MIN_WIDTH = 340;

export function PlotDetailPanel({ puc, onClose, onChanged, onLogShipment }: Props) {
  const { detail, loading, error, reload } = usePlotDetail(puc);
  const toast = useToast();
  const [growth, setGrowth] = useState('');
  const [saving, setSaving] = useState(false);

  // Quản lý kích thước kéo rộng/hẹp
  const [width, setWidth] = useState<number>(() => {
    const saved = localStorage.getItem('agri_detail_panel_width');
    const parsed = Number(saved);
    return parsed >= MIN_WIDTH ? parsed : DEFAULT_WIDTH;
  });
  const [isResizing, setIsResizing] = useState(false);
  const isResizingRef = useRef(false);

  const isExpanded = width >= 600;

  const toggleExpand = () => {
    const nextWidth = isExpanded ? DEFAULT_WIDTH : 650;
    setWidth(nextWidth);
    localStorage.setItem('agri_detail_panel_width', String(nextWidth));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    isResizingRef.current = true;

    const startX = e.clientX;
    const startWidth = width;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizingRef.current) return;
      // Kéo sang trái (startX > moveEvent.clientX) làm tăng chiều rộng panel
      const delta = startX - moveEvent.clientX;
      const maxWidth = Math.min(860, window.innerWidth - 60);
      const newWidth = Math.max(MIN_WIDTH, Math.min(maxWidth, startWidth + delta));
      setWidth(newWidth);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      isResizingRef.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      setWidth((w) => {
        localStorage.setItem('agri_detail_panel_width', String(w));
        return w;
      });
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleDoubleClick = () => {
    setWidth(DEFAULT_WIDTH);
    localStorage.setItem('agri_detail_panel_width', String(DEFAULT_WIDTH));
  };

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
    <aside
      className={`detail-panel ${isResizing ? 'is-resizing' : ''}`.trim()}
      style={{ width: `${width}px` }}
      aria-label="Hồ sơ lô đất"
    >
      {/* Thanh nắm kéo chỉnh kích thước ở mép trái */}
      <div
        className="detail-resize-handle"
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        title="Kéo sang trái/phải để chỉnh độ rộng (Nhấp đúp để về mặc định)"
      >
        <div className="detail-resize-grip" />
      </div>

      <header className="detail-head">
        <div className="detail-head-titles">
          <h2>{detail?.plot_name ?? 'Hồ sơ lô đất'}</h2>
          <span className="plot-card-puc">{puc}</span>
        </div>
        <div className="row" style={{ gap: 4 }}>
          <button
            type="button"
            className="btn btn-icon"
            onClick={toggleExpand}
            aria-label={isExpanded ? 'Thu hẹp' : 'Mở rộng'}
            title={isExpanded ? 'Thu gọn (420px)' : 'Mở rộng xem chi tiết (650px)'}
          >
            <Icon name={isExpanded ? 'minimize' : 'maximize'} size={15} />
          </button>
          <button
            type="button"
            className="btn btn-icon"
            onClick={onClose}
            aria-label="Đóng"
            title="Đóng bảng chi tiết"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
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
            {/* Thẻ Đại diện chủ hộ (Khớp 100% ảnh thiết kế) */}
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

            <div className="row" style={{ flexWrap: 'wrap' }}>
              <span className="badge tone-brand">
                {GROWTH_META[detail.growth_status]?.label ?? detail.growth_status}
              </span>
              <a
                className="btn btn-secondary btn-sm"
                href={plotReportPdfUrl(detail.puc)}
                target="_blank"
                rel="noreferrer"
              >
                Tải Hồ sơ PDF
              </a>
            </div>

            {/* Khối Thổ Nhưỡng & Địa Hình */}
            <section className="detail-section">
              <h3>Đặc tính Thổ nhưỡng & Địa hình</h3>
              <div className="soil-grid">
                <div className="soil-stat-box">
                  <span className="soil-stat-label">Loại đất canh tác</span>
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
                  <span className="soil-stat-label">Dinh dưỡng đất</span>
                  <span className="soil-stat-val" style={{ fontSize: 12 }}>
                    {detail.soil_organic_matter || 'Mùn hữu cơ cao (4.2%)'}
                  </span>
                </div>
              </div>
            </section>

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

            {/* Khối Lịch Sử Cây Trồng & Luân Canh Mùa Vụ */}
            <CropHistoryTimeline
              puc={detail.puc}
              history={detail.crop_history}
              onReload={() => {
                void reload();
                onChanged?.();
              }}
            />

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

            <section className="detail-section" style={{ padding: 0, border: 'none' }}>
              <WeatherCard puc={detail.puc} compact title="Vi khí hậu tại thửa ruộng" />
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
