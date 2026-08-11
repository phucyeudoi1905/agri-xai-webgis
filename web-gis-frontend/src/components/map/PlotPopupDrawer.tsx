import { useEffect, useState } from 'react';
import { fetchPlotByPuc } from '../../services/gisApi';
import type { PlotDetail } from '../../types/gis.types';

interface Props {
  puc: string | null;
  onClose: () => void;
}

export function PlotPopupDrawer({ puc, onClose }: Props) {
  const [detail, setDetail] = useState<PlotDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!puc) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchPlotByPuc(puc)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.response?.data?.message || e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [puc]);

  if (!puc) return null;

  return (
    <aside className="drawer" aria-label="Chi tiết lô đất">
      <header className="drawer-head">
        <div>
          <p className="eyebrow">Hồ sơ lô đất</p>
          <h2>{detail?.plot_name ?? puc}</h2>
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Đóng">
          ×
        </button>
      </header>

      {loading && <p className="muted">Đang tải…</p>}
      {error && <p className="error">{error}</p>}

      {detail && (
        <div className="drawer-body">
          <div
            className="risk-badge"
            style={{ background: detail.risk_color }}
          >
            risk_level = {detail.risk_level}
          </div>

          <dl className="meta">
            <div>
              <dt>PUC</dt>
              <dd>{detail.puc}</dd>
            </div>
            <div>
              <dt>Cây trồng</dt>
              <dd>{detail.crop_type}</dd>
            </div>
            <div>
              <dt>Diện tích</dt>
              <dd>
                {detail.area_m2.toLocaleString('vi-VN')} m² ({detail.area_ha} ha)
              </dd>
            </div>
            <div>
              <dt>Sinh trưởng</dt>
              <dd>{detail.growth_status}</dd>
            </div>
          </dl>

          {detail.qr_code_url && (
            <figure className="qr">
              <img src={detail.qr_code_url} alt={`QR ${detail.puc}`} />
              <figcaption>QR tra cứu nguồn gốc</figcaption>
            </figure>
          )}

          {detail.alerts?.length > 0 && (
            <section>
              <h3>Cảnh báo dịch bệnh</h3>
              <ul className="list">
                {detail.alerts.map((a) => (
                  <li key={a.id}>
                    <strong>{a.diseaseName}</strong> — {a.confidence}%
                    <div className="muted">{a.status}</div>
                    {a.xaiOverlayUrl && (
                      <img
                        className="xai"
                        src={a.xaiOverlayUrl}
                        alt="XAI overlay"
                      />
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {detail.shipments?.length > 0 && (
            <section>
              <h3>Xuất xưởng</h3>
              <ul className="list">
                {detail.shipments.map((s) => (
                  <li key={s.id}>
                    <code>{s.batchCode}</code>
                    <div>
                      {s.quantity} {s.unit} → {s.destination}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </aside>
  );
}
