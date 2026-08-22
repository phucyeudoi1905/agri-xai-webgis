import { useState } from 'react';
import { createShippingLog } from '../../services/gisApi';
import { errorMessage } from '../../lib/format';
import { Icon } from '../ui/Icon';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/toastContext';

interface Props {
  puc: string;
  onClose: () => void;
  onCreated: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export function ShippingModal({ puc, onClose, onCreated }: Props) {
  const toast = useToast();
  const [harvestDate, setHarvestDate] = useState(today());
  const [quantity, setQuantity] = useState('1000');
  const [unit, setUnit] = useState('kg');
  const [destination, setDestination] = useState('');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async () => {
    const qty = Number(quantity);
    if (!destination.trim() || !Number.isFinite(qty) || qty <= 0) return;

    setBusy(true);
    setFormError(null);
    try {
      const res = await createShippingLog({
        puc,
        harvest_date: harvestDate,
        quantity: qty,
        unit,
        destination: destination.trim(),
      });
      toast.success('Đã cấp mã lô hàng', res.data?.batchCode);
      onCreated();
    } catch (e) {
      setFormError(errorMessage(e, 'Không ghi nhận được lô hàng'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title="Ghi nhận xuất xưởng"
      subtitle={`Cấp mã lô hàng truy xuất cho ${puc}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Hủy
          </button>
          <button
            type="button"
            className="btn"
            disabled={busy || !destination.trim()}
            onClick={() => void submit()}
          >
            {busy ? <span className="spinner" /> : <Icon name="truck" size={15} />}
            Cấp mã lô hàng
          </button>
        </>
      }
    >
      <div className="field">
        <label htmlFor="harvest-date">Ngày thu hoạch</label>
        <input
          id="harvest-date"
          className="input"
          type="date"
          value={harvestDate}
          onChange={(e) => setHarvestDate(e.target.value)}
        />
      </div>

      <div className="grid grid-2" style={{ gap: 12 }}>
        <div className="field">
          <label htmlFor="quantity">Sản lượng</label>
          <input
            id="quantity"
            className="input"
            type="number"
            min="0"
            step="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="unit">Đơn vị</label>
          <select
            id="unit"
            className="select"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          >
            <option value="kg">kg</option>
            <option value="tấn">tấn</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="destination">Nơi tiêu thụ / Nhà máy chế biến</label>
        <input
          id="destination"
          className="input"
          value={destination}
          placeholder="Ví dụ: Chợ nông sản Đà Lạt / Siêu thị Co.opmart TP.HCM"
          onChange={(e) => setDestination(e.target.value)}
        />
      </div>

      {formError && <p className="field-error">{formError}</p>}
    </Modal>
  );
}
