import { useState } from 'react';
import { createPlot } from '../../services/gisApi';
import { errorCode, errorMessage } from '../../lib/format';
import type { GeoJsonPolygon } from '../../types/gis.types';
import { Icon } from '../ui/Icon';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/toastContext';

const DEMO_FARMER_ID = 'a3b8e912-4c5d-6e7f-8a9b-0c1d2e3f4a5b';

const CROP_PRESETS = [
  'Lúa ST25',
  'Cà chua ST-01',
  'Xoài Cát Chu',
  'Sầu riêng Ri6',
  'Thanh long ruột đỏ',
];

interface Props {
  boundary: GeoJsonPolygon;
  onClose: () => void;
  onCreated: (puc: string) => void;
}

export function CreatePlotModal({ boundary, onClose, onCreated }: Props) {
  const toast = useToast();
  const [plotName, setPlotName] = useState('');
  const [cropType, setCropType] = useState(CROP_PRESETS[0]);
  const [farmerId, setFarmerId] = useState(DEMO_FARMER_ID);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const vertexCount = Math.max((boundary.coordinates[0]?.length ?? 1) - 1, 0);

  const submit = async () => {
    if (!plotName.trim()) return;
    setBusy(true);
    setFormError(null);
    try {
      const res = await createPlot({
        farmer_id: farmerId.trim(),
        plot_name: plotName.trim(),
        crop_type: cropType.trim(),
        boundary,
      });
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
      subtitle="Hệ thống tự tính diện tích và cấp mã PUC kèm QR Code"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Hủy
          </button>
          <button
            type="button"
            className="btn"
            disabled={busy || !plotName.trim() || vertexCount < 3}
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
          placeholder="Ví dụ: Lô Ruộng Cà Chua A1"
          autoFocus
          onChange={(e) => setPlotName(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="crop-type">Loại cây trồng</label>
        <input
          id="crop-type"
          className="input"
          list="crop-presets"
          value={cropType}
          onChange={(e) => setCropType(e.target.value)}
        />
        <datalist id="crop-presets">
          {CROP_PRESETS.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>

      <div className="field">
        <label htmlFor="farmer-id">Mã nông dân (farmer_id)</label>
        <input
          id="farmer-id"
          className="input mono"
          value={farmerId}
          onChange={(e) => setFarmerId(e.target.value)}
        />
        <span className="field-hint">
          UUID lấy từ Farmer Registry dùng chung của dự án.
        </span>
      </div>

      {formError && <p className="field-error">{formError}</p>}
    </Modal>
  );
}
