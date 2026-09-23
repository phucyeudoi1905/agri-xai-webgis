import { useEffect, useState } from 'react';
import { createPlot, fetchFarmerByCode, type FarmerRecord } from '../../services/gisApi';
import { errorCode, errorMessage } from '../../lib/format';
import {
  normalizeFarmerCode,
  type CroppingPattern,
} from '../../lib/cropPattern';
import type { GeoJsonPolygon } from '../../types/gis.types';
import { Icon } from '../ui/Icon';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/toastContext';

const CROP_PRESETS = [
  'Cà phê Arabica Cầu Đất',
  'Cà phê Robusta',
  'Dâu tây New Zealand',
  'Dâu tây Bạch Tuyết',
  'Atisô Đà Lạt',
  'Hoa Cúc Đại Đóa',
  'Hoa Hồng Đà Lạt',
  'Xà lách Lolo Bosa',
  'Ớt chuông Sweet',
  'Cà chua beef nhà kính',
  'Bắp cải tím',
  'Su su Đà Lạt',
  'Rau Rocket thủy canh',
  'Chè Ô Long Cầu Đất',
  'Bơ Booth',
  'Đậu leo che phủ',
  'Lúa ST25',
];

interface Props {
  boundary: GeoJsonPolygon;
  onClose: () => void;
  onCreated: (puc: string) => void;
}

export function CreatePlotModal({ boundary, onClose, onCreated }: Props) {
  const toast = useToast();
  const [plotName, setPlotName] = useState('');
  const [pattern, setPattern] = useState<CroppingPattern>('DON_CAY');
  const [cropType, setCropType] = useState(CROP_PRESETS[0]);
  const [multiCrops, setMultiCrops] = useState<string[]>([CROP_PRESETS[0]]);
  const [rotation, setRotation] = useState([
    { season_name: 'Vụ luân canh trước', crop_type: 'Đậu leo che phủ' },
    { season_name: 'Vụ hiện tại', crop_type: CROP_PRESETS[0] },
  ]);
  const [farmerCode, setFarmerCode] = useState('ND-LD-0001');
  const [farmer, setFarmer] = useState<FarmerRecord | null>(null);
  const [farmerError, setFarmerError] = useState<string | null>(null);
  const [looking, setLooking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const vertexCount = Math.max((boundary.coordinates[0]?.length ?? 1) - 1, 0);

  useEffect(() => {
    const code = normalizeFarmerCode(farmerCode);
    if (code.length < 5) {
      setFarmer(null);
      return;
    }
    const t = window.setTimeout(() => {
      setLooking(true);
      setFarmerError(null);
      void fetchFarmerByCode(code)
        .then((row) => {
          setFarmer(row);
          setFarmerError(null);
        })
        .catch((e) => {
          setFarmer(null);
          setFarmerError(errorMessage(e, 'Không tìm thấy nông dân với mã này'));
        })
        .finally(() => setLooking(false));
    }, 400);
    return () => window.clearTimeout(t);
  }, [farmerCode]);

  const toggleCrop = (crop: string) => {
    setMultiCrops((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop],
    );
  };

  const submit = async () => {
    if (!plotName.trim() || !farmer) return;
    setBusy(true);
    setFormError(null);
    try {
      const payload = {
        farmer_code: normalizeFarmerCode(farmerCode),
        plot_name: plotName.trim(),
        cropping_pattern: pattern,
        crop_type: pattern === 'DON_CAY' ? cropType.trim() : undefined,
        crop_types: pattern === 'XEN_CANH' ? multiCrops : undefined,
        rotation_seasons: pattern === 'LUAN_PHIEN' ? rotation : undefined,
        boundary,
      };
      const res = await createPlot(payload);
      const puc: string = res.data.puc;
      toast.success('Đã cấp mã vùng trồng', puc);
      onCreated(puc);
    } catch (e) {
      const code = errorCode(e);
      const msg = errorMessage(e, 'Không lưu được lô đất');
      setFormError(
        code === 'ERR_GIS_SPATIAL_OVERLAP'
          ? `${msg} (ranh giới đè lên lô đã có)`
          : msg,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title="Lưu lô đất mới"
      subtitle="Gắn nông dân theo mã · chọn đơn cây, xen canh hoặc luân phiên"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Hủy
          </button>
          <button
            type="button"
            className="btn"
            disabled={
              busy ||
              !plotName.trim() ||
              vertexCount < 3 ||
              !farmer ||
              (pattern === 'XEN_CANH' && multiCrops.length === 0)
            }
            onClick={() => void submit()}
          >
            {busy ? <span className="spinner" /> : <Icon name="plus" size={15} />}
            Lưu &amp; cấp PUC
          </button>
        </>
      }
    >
      <div className="badge tone-brand" style={{ alignSelf: 'flex-start' }}>
        <Icon name="target" size={13} />
        Đa giác {vertexCount} đỉnh · EPSG:4326
      </div>

      <div className="field">
        <label htmlFor="plot-name">Tên lô đất</label>
        <input
          id="plot-name"
          className="input"
          value={plotName}
          placeholder="Ví dụ: Lô Cà Phê Arabica Cầu Đất C1"
          autoFocus
          onChange={(e) => setPlotName(e.target.value)}
        />
      </div>

      <div className="field">
        <span className="label">Hình thức canh tác</span>
        <div className="segmented" role="group" aria-label="Hình thức canh tác">
          {(
            [
              ['DON_CAY', 'Một loại cây'],
              ['XEN_CANH', 'Nhiều loại (xen canh)'],
              ['LUAN_PHIEN', 'Luân phiên theo vụ'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={pattern === id}
              onClick={() => setPattern(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {pattern === 'DON_CAY' && (
        <div className="field">
          <label htmlFor="crop-type">Loại cây trồng</label>
          <select
            id="crop-type"
            className="select"
            value={cropType}
            onChange={(e) => setCropType(e.target.value)}
          >
            {CROP_PRESETS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}

      {pattern === 'XEN_CANH' && (
        <div className="field">
          <span className="label">Chọn các loại cây trồng cùng lô</span>
          <div className="crop-chip-row">
            {CROP_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                className={`crop-chip ${multiCrops.includes(c) ? 'on' : ''}`}
                onClick={() => toggleCrop(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <span className="field-hint">
            Đã chọn: {multiCrops.join(' + ') || 'chưa chọn'}
          </span>
        </div>
      )}

      {pattern === 'LUAN_PHIEN' && (
        <div className="field">
          <span className="label">Lịch luân phiên (vụ cuối = vụ hiện tại)</span>
          {rotation.map((row, i) => (
            <div key={i} className="rotation-row">
              <input
                className="input"
                value={row.season_name}
                placeholder="Tên vụ"
                onChange={(e) => {
                  const next = [...rotation];
                  next[i] = { ...next[i], season_name: e.target.value };
                  setRotation(next);
                }}
              />
              <select
                className="select"
                value={row.crop_type}
                onChange={(e) => {
                  const next = [...rotation];
                  next[i] = { ...next[i], crop_type: e.target.value };
                  setRotation(next);
                }}
              >
                {CROP_PRESETS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      <div className="field">
        <label htmlFor="farmer-code">Mã nông dân</label>
        <input
          id="farmer-code"
          className="input mono"
          value={farmerCode}
          placeholder="ND-LD-0001"
          onChange={(e) => setFarmerCode(e.target.value)}
        />
        <span className="field-hint">
          Nhập mã thành viên HTX (ví dụ ND-LD-0001 … ND-LD-0006). Hệ thống tự hiện tên và SĐT.
        </span>
      </div>

      {looking && <p className="field-hint">Đang tra cứu nông dân…</p>}
      {farmerError && <p className="field-error">{farmerError}</p>}
      {farmer && (
        <div className="farmer-lookup-card">
          <div className="farmer-avatar-circle">{farmer.full_name.charAt(0)}</div>
          <div>
            <strong>{farmer.full_name}</strong>
            <div>SĐT: {farmer.phone}</div>
            <div className="field-hint">
              {farmer.farmer_code} · {farmer.cooperative_name}
            </div>
          </div>
        </div>
      )}

      {formError && <p className="field-error">{formError}</p>}
    </Modal>
  );
}
