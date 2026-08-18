import { useEffect, useMemo, useState } from 'react';
import type { GeoJsonPolygon } from '../../types/gis.types';
import { Icon } from '../ui/Icon';
import { Modal } from '../ui/Modal';

interface Vertex {
  lat: string;
  lng: string;
}

interface Props {
  onClose: () => void;
  onComplete: (polygon: GeoJsonPolygon) => void;
}

function emptyVertices(n: number): Vertex[] {
  return Array.from({ length: n }, () => ({ lat: '', lng: '' }));
}

function parseCoord(raw: string): number | null {
  const n = Number(String(raw).trim().replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/** Admin: nhập số đỉnh theo sổ đất + tọa độ từng điểm (EPSG:4326). */
export function CadastralEntryModal({ onClose, onComplete }: Props) {
  const [count, setCount] = useState(4);
  const [vertices, setVertices] = useState<Vertex[]>(() => emptyVertices(4));
  const [paste, setPaste] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [gpsBusy, setGpsBusy] = useState(false);

  useEffect(() => {
    setVertices((prev) => {
      if (count === prev.length) return prev;
      if (count > prev.length) {
        return [...prev, ...emptyVertices(count - prev.length)];
      }
      return prev.slice(0, count);
    });
  }, [count]);

  const parsed = useMemo(() => {
    return vertices.map((v) => ({
      lat: parseCoord(v.lat),
      lng: parseCoord(v.lng),
    }));
  }, [vertices]);

  const filled = parsed.filter((p) => p.lat != null && p.lng != null).length;

  const updateVertex = (index: number, key: keyof Vertex, value: string) => {
    setVertices((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    );
  };

  const fillGps = (index: number) => {
    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ GPS.');
      return;
    }
    setGpsBusy(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setVertices((prev) =>
          prev.map((row, i) =>
            i === index
              ? {
                  lat: pos.coords.latitude.toFixed(7),
                  lng: pos.coords.longitude.toFixed(7),
                }
              : row,
          ),
        );
        setGpsBusy(false);
      },
      () => {
        setError('Không lấy được vị trí GPS. Kiểm tra quyền định vị.');
        setGpsBusy(false);
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  const applyPaste = () => {
    const lines = paste
      .split(/[\n;]+/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 3) {
      setError('Dán tối thiểu 3 dòng tọa độ (lat,lng hoặc lng,lat).');
      return;
    }
    const rows: Vertex[] = [];
    for (const line of lines) {
      const parts = line.split(/[\s,;\t]+/).filter(Boolean);
      if (parts.length < 2) continue;
      const a = parseCoord(parts[0]);
      const b = parseCoord(parts[1]);
      if (a == null || b == null) continue;
      // Việt Nam: lat ~8–24, lng ~102–110 — tự nhận thứ tự
      if (a >= 8 && a <= 24 && b >= 102 && b <= 110) {
        rows.push({ lat: String(a), lng: String(b) });
      } else if (b >= 8 && b <= 24 && a >= 102 && a <= 110) {
        rows.push({ lat: String(b), lng: String(a) });
      } else {
        // mặc định lat,lng
        rows.push({ lat: String(a), lng: String(b) });
      }
    }
    if (rows.length < 3) {
      setError('Không parse được đủ tọa độ hợp lệ.');
      return;
    }
    setCount(rows.length);
    setVertices(rows);
    setPaste('');
    setError(null);
  };

  const submit = () => {
    if (count < 3) {
      setError('Đa giác cần tối thiểu 3 đỉnh.');
      return;
    }
    const ring: number[][] = [];
    for (let i = 0; i < vertices.length; i += 1) {
      const lat = parseCoord(vertices[i].lat);
      const lng = parseCoord(vertices[i].lng);
      if (lat == null || lng == null) {
        setError(`Đỉnh ${i + 1}: nhập đủ vĩ độ (lat) và kinh độ (lng).`);
        return;
      }
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        setError(`Đỉnh ${i + 1}: tọa độ ngoài khoảng hợp lệ.`);
        return;
      }
      ring.push([lng, lat]);
    }
    ring.push(ring[0]);
    setError(null);
    onComplete({ type: 'Polygon', coordinates: [ring] });
  };

  return (
    <Modal
      title="Nhập lô theo sổ đất"
      subtitle="Admin khai báo số đỉnh và tọa độ định vị (WGS84) để đánh dấu ranh giới"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Hủy
          </button>
          <button
            type="button"
            className="btn"
            disabled={filled < 3}
            onClick={submit}
          >
            <Icon name="target" size={15} />
            Tạo đa giác ({filled}/{count})
          </button>
        </>
      }
    >
      <div className="field">
        <label htmlFor="vertex-count">Số điểm mốc (đỉnh đa giác)</label>
        <input
          id="vertex-count"
          className="input"
          type="number"
          min={3}
          max={64}
          value={count}
          onChange={(e) => {
            const n = Math.min(64, Math.max(3, Number(e.target.value) || 3));
            setCount(n);
          }}
        />
        <span className="field-hint">
          Theo sổ địa chính / biên bản đo — tối thiểu 3, tối đa 64 đỉnh.
        </span>
      </div>

      <div className="field">
        <label htmlFor="paste-coords">Dán hàng loạt (tuỳ chọn)</label>
        <textarea
          id="paste-coords"
          className="textarea"
          rows={3}
          placeholder={'10.03812, 105.80501\n10.03850, 105.80620\n…'}
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ alignSelf: 'flex-start' }}
          onClick={applyPaste}
        >
          Áp dụng danh sách
        </button>
      </div>

      <div className="cadastral-table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Vĩ độ (lat)</th>
              <th>Kinh độ (lng)</th>
              <th aria-label="GPS" />
            </tr>
          </thead>
          <tbody>
            {vertices.map((v, i) => (
              <tr key={i}>
                <td className="muted">{i + 1}</td>
                <td>
                  <input
                    className="input"
                    inputMode="decimal"
                    placeholder="10.038…"
                    value={v.lat}
                    onChange={(e) => updateVertex(i, 'lat', e.target.value)}
                    aria-label={`Lat đỉnh ${i + 1}`}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    inputMode="decimal"
                    placeholder="105.805…"
                    value={v.lng}
                    onChange={(e) => updateVertex(i, 'lng', e.target.value)}
                    aria-label={`Lng đỉnh ${i + 1}`}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={gpsBusy}
                    title="Gán vị trí GPS hiện tại"
                    onClick={() => fillGps(i)}
                  >
                    <Icon name="target" size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <p className="field-error">{error}</p>}
    </Modal>
  );
}
