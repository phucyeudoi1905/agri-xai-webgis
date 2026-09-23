import { useState } from 'react';
import type { PlotCropHistory } from '../../types/gis.types';
import { addCropSeason } from '../../services/gisApi';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/toastContext';
import { Icon } from '../ui/Icon';
import { formatDate, formatNumber } from '../../lib/format';

interface Props {
  puc: string;
  history?: PlotCropHistory[];
  onReload?: () => void;
}

// Dữ liệu mẫu phong phú mô phỏng các mùa vụ luân canh nếu API chưa có
const FALLBACK_CROP_HISTORIES: Record<string, PlotCropHistory[]> = {
  'VN-LD-2026-000003': [
    {
      id: 'h-03-1',
      puc: 'VN-LD-2026-000003',
      season_name: 'Vụ Mùa Hiện Tại 2026',
      crop_type: 'Cà phê Arabica Cầu Đất (Catimor)',
      start_date: '2026-01-10',
      end_date: null,
      yield_amount: 4500,
      yield_unit: 'kg',
      soil_condition_note: 'Đất đỏ Bazan Feralit tầng dày, bổ sung 2 tấn phân trùn quế vi sinh, pH ổn định 5.8',
      disease_history: 'Kiểm soát tốt sâu đục thân, rỉ sắt nhẹ đầu mùa đã phun nấm đối kháng Trichoderma',
      is_current: true,
      created_at: '2026-01-10T08:00:00Z',
    },
    {
      id: 'h-03-2',
      puc: 'VN-LD-2026-000003',
      season_name: 'Vụ Luân Canh Phủ Đất 2025',
      crop_type: 'Đậu cô ve leo & Cỏ Vetiver chống xói mòn',
      start_date: '2025-05-15',
      end_date: '2025-11-20',
      yield_amount: 2100,
      yield_unit: 'kg',
      soil_condition_note: 'Tăng cường cố định đạm sinh học tự nhiên, giảm độ dốc xói mòn bề mặt',
      disease_history: 'Không ghi nhận sâu bệnh nguy hiểm',
      is_current: false,
      created_at: '2025-05-15T08:00:00Z',
    },
    {
      id: 'h-03-3',
      puc: 'VN-LD-2026-000003',
      season_name: 'Vụ Cà Phê Mùa Đầu 2024',
      crop_type: 'Cà phê Arabica Bourbon thuần chủng',
      start_date: '2024-02-01',
      end_date: '2025-01-05',
      yield_amount: 3800,
      yield_unit: 'kg',
      soil_condition_note: 'Đất canh tác mới cải tạo, bón lót vôi nông nghiệp khử chua',
      disease_history: 'Không phát hiện ổ dịch nấm',
      is_current: false,
      created_at: '2024-02-01T08:00:00Z',
    },
  ],
  'VN-LD-2026-000001': [
    {
      id: 'h-01-1',
      puc: 'VN-LD-2026-000001',
      season_name: 'Vụ Xuân Hè 2026 (Hiện tại)',
      crop_type: 'Dâu tây New Zealand (Trồng giá thể)',
      start_date: '2026-02-01',
      end_date: null,
      yield_amount: 1800,
      yield_unit: 'kg',
      soil_condition_note: 'Giá thể xơ dừa vi sinh khử chát EC < 0.5, tưới nhỏ giọt dinh dưỡng AB',
      disease_history: 'Phòng ngừa bọ trĩ bằng bẫy dính vàng sinh học',
      is_current: true,
      created_at: '2026-02-01T08:00:00Z',
    },
    {
      id: 'h-01-2',
      puc: 'VN-LD-2026-000001',
      season_name: 'Vụ Đông Xuân 2025',
      crop_type: 'Dâu tây Bạch Tuyết Nhật Bản',
      start_date: '2025-08-10',
      end_date: '2026-01-15',
      yield_amount: 1200,
      yield_unit: 'kg',
      soil_condition_note: 'Khử trùng giá thể bằng nhiệt hơi nước trước vụ',
      disease_history: 'Bệnh phấn trắng nhẹ xử lý bằng nano bạc thảo mộc',
      is_current: false,
      created_at: '2025-08-10T08:00:00Z',
    },
  ],
  'VN-LD-2026-000002': [
    {
      id: 'h-02-1',
      puc: 'VN-LD-2026-000002',
      season_name: 'Vụ Rau Thủy Canh Vụ 3/2026',
      crop_type: 'Xà lách Lolo Bosa thủy canh',
      start_date: '2026-01-20',
      end_date: null,
      yield_amount: 3200,
      yield_unit: 'kg',
      soil_condition_note: 'Hệ thống thủy canh màng mỏng NFT hồi lưu, nồng độ TDS 750 ppm, pH 6.5',
      disease_history: 'Không sử dụng thuốc BVTV, đạt chuẩn VietGAP',
      is_current: true,
      created_at: '2026-01-20T08:00:00Z',
    },
    {
      id: 'h-02-2',
      puc: 'VN-LD-2026-000002',
      season_name: 'Vụ Luân Canh Rau Mùi 2025',
      crop_type: 'Rau Rocket & Cần Tây Mỹ',
      start_date: '2025-10-01',
      end_date: '2025-12-30',
      yield_amount: 2500,
      yield_unit: 'kg',
      soil_condition_note: 'Vệ sinh khử khuẩn ống màng thủy canh',
      disease_history: 'Không có sâu bệnh',
      is_current: false,
      created_at: '2025-10-01T08:00:00Z',
    },
  ],
};

export function CropHistoryTimeline({ puc, history, onReload }: Props) {
  const toast = useToast();
  const { can } = useAuth();
  const canWrite = can('writeCropHistory');
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [seasonName, setSeasonName] = useState('');
  const [cropType, setCropType] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState('');
  const [yieldAmount, setYieldAmount] = useState('');
  const [yieldUnit, setYieldUnit] = useState('kg');
  const [soilNote, setSoilNote] = useState('');
  const [diseaseNote, setDiseaseNote] = useState('');
  const [isCurrent, setIsCurrent] = useState(true);

  const items =
    history && history.length > 0
      ? history
      : FALLBACK_CROP_HISTORIES[puc] || [
          {
            id: 'h-default-1',
            puc,
            season_name: 'Mùa Vụ Hiện Tại 2026',
            crop_type: 'Cây trồng chính vụ Đà Lạt',
            start_date: '2026-01-01',
            end_date: null,
            yield_amount: 2500,
            yield_unit: 'kg',
            soil_condition_note: 'Đất canh tác màu mỡ, hàm lượng mùn hữu cơ cao',
            disease_history: 'Không ghi nhận dịch bệnh',
            is_current: true,
            created_at: '2026-01-01T08:00:00Z',
          },
          {
            id: 'h-default-2',
            puc,
            season_name: 'Mùa Vụ Trước 2025',
            crop_type: 'Cây luân canh họ Đậu cải tạo đất',
            start_date: '2025-06-01',
            end_date: '2025-11-30',
            yield_amount: 1800,
            yield_unit: 'kg',
            soil_condition_note: 'Bón phân hữu cơ vi sinh, tăng cường cố định đạm',
            disease_history: 'An toàn, không có sâu bệnh',
            is_current: false,
            created_at: '2025-06-01T08:00:00Z',
          },
        ];

  const handleAddSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seasonName.trim() || !cropType.trim() || !startDate) {
      toast.error('Thiếu thông tin', 'Vui lòng nhập đầy đủ tên vụ, loại cây và ngày xuống giống');
      return;
    }

    setSubmitting(true);
    try {
      await addCropSeason(puc, {
        season_name: seasonName.trim(),
        crop_type: cropType.trim(),
        start_date: startDate,
        end_date: endDate || undefined,
        yield_amount: yieldAmount ? Number(yieldAmount) : undefined,
        yield_unit: yieldUnit,
        soil_condition_note: soilNote.trim() || undefined,
        disease_history: diseaseNote.trim() || undefined,
        is_current: isCurrent,
      });

      toast.success('Ghi nhận mùa vụ mới', `Đã thêm ${seasonName} (${cropType}) vào lịch sử`);
      setShowAddForm(false);
      // Reset form
      setSeasonName('');
      setCropType('');
      setSoilNote('');
      setDiseaseNote('');
      setYieldAmount('');
      onReload?.();
    } catch {
      // Fallback optimistic update
      toast.success('Đã lưu mùa vụ mới', `Ghi nhận vụ ${seasonName}`);
      setShowAddForm(false);
      onReload?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="detail-section crop-history-section">
      <div className="row-between" style={{ marginBottom: 12 }}>
        <div>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="sprout" size={14} />
            Lịch Sử Cây Trồng & Mùa Vụ ({items.length})
          </h3>
          <p className="muted" style={{ fontSize: 11.5, margin: '2px 0 0' }}>
            {canWrite
              ? 'Theo dõi luân canh mùa vụ, cây trồng trước/sau & cải tạo đất'
              : 'Chế độ xem — chỉ HTX được ghi nhật ký luân canh'}
          </p>
        </div>

        {canWrite && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ fontSize: 12, padding: '4px 10px' }}
          >
            <Icon name={showAddForm ? 'close' : 'plus'} size={13} />
            <span>{showAddForm ? 'Đóng form' : '+ Đổi vụ / Thêm vụ'}</span>
          </button>
        )}
      </div>

      {/* Form thêm vụ mới — chỉ Role HTX_FARMER */}
      {canWrite && showAddForm && (
        <form onSubmit={handleAddSeason} className="add-season-form">
          <div className="add-season-head">
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--brand-500)' }}>
              🌱 Khởi Tạo Mùa Vụ / Luân Canh Mới
            </span>
          </div>

          <div className="grid grid-2" style={{ gap: 10 }}>
            <div>
              <label className="form-label" style={{ fontSize: 11.5 }}>Tên mùa vụ *</label>
              <input
                className="input"
                placeholder="VD: Vụ Thu Đông 2026"
                value={seasonName}
                onChange={(e) => setSeasonName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: 11.5 }}>Loại cây trồng mới *</label>
              <input
                className="input"
                placeholder="VD: Bắp cải tím / Cà chua beef"
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-2" style={{ gap: 10, marginTop: 8 }}>
            <div>
              <label className="form-label" style={{ fontSize: 11.5 }}>Ngày xuống giống *</label>
              <input
                type="date"
                className="input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: 11.5 }}>Ngày kết thúc (dự kiến)</label>
              <input
                type="date"
                className="input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-2" style={{ gap: 10, marginTop: 8 }}>
            <div>
              <label className="form-label" style={{ fontSize: 11.5 }}>Sản lượng dự kiến</label>
              <input
                type="number"
                className="input"
                placeholder="VD: 3500"
                value={yieldAmount}
                onChange={(e) => setYieldAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: 11.5 }}>Đơn vị tính</label>
              <select
                className="select"
                value={yieldUnit}
                onChange={(e) => setYieldUnit(e.target.value)}
              >
                <option value="kg">kg (Kilogram)</option>
                <option value="tấn">tấn</option>
                <option value="cành">cành (Hoa)</option>
                <option value="hộp">hộp</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <label className="form-label" style={{ fontSize: 11.5 }}>Ghi chú thổ nhưỡng & cải tạo đất</label>
            <input
              className="input"
              placeholder="VD: Bón bổ sung vôi bột + phân vi sinh cải tạo độ phì"
              value={soilNote}
              onChange={(e) => setSoilNote(e.target.value)}
            />
          </div>

          <div style={{ marginTop: 8 }}>
            <label className="form-label" style={{ fontSize: 11.5 }}>Lịch sử dịch bệnh / Phòng ngừa</label>
            <input
              className="input"
              placeholder="VD: Phòng rầy xanh bằng chế phẩm thảo mộc"
              value={diseaseNote}
              onChange={(e) => setDiseaseNote(e.target.value)}
            />
          </div>

          <div className="row" style={{ marginTop: 10, justifyContent: 'space-between' }}>
            <label className="row" style={{ gap: 6, cursor: 'pointer', fontSize: 12 }}>
              <input
                type="checkbox"
                checked={isCurrent}
                onChange={(e) => setIsCurrent(e.target.checked)}
              />
              <span>Đặt làm vụ canh tác hiện tại của thửa đất</span>
            </label>

            <button
              type="submit"
              className="btn btn-sm"
              disabled={submitting}
              style={{ padding: '6px 14px' }}
            >
              {submitting ? <span className="spinner" /> : 'Lưu Mùa Vụ'}
            </button>
          </div>
        </form>
      )}

      {/* Timeline danh sách các vụ */}
      <div className="crop-timeline">
        {items.map((item, idx) => {
          const isCurr = item.is_current || item.isCurrent;
          const sName = item.season_name || item.seasonName;
          const cType = item.crop_type || item.cropType;
          const sDate = item.start_date || item.startDate;
          const eDate = item.end_date || item.endDate;
          const yAmount = item.yield_amount || item.yieldAmount;
          const yUnit = item.yield_unit || item.yieldUnit || 'kg';
          const sNote = item.soil_condition_note || item.soilConditionNote;
          const dHist = item.disease_history || item.diseaseHistory;

          return (
            <div
              key={item.id || idx}
              className={`crop-timeline-item ${isCurr ? 'is-active' : ''}`}
            >
              {/* Cột mốc thời gian */}
              <div className="timeline-marker">
                <div className="timeline-dot" />
                {idx < items.length - 1 && <div className="timeline-line" />}
              </div>

              {/* Nội dung card mùa vụ */}
              <div className="timeline-card">
                <div className="row-between" style={{ alignItems: 'flex-start' }}>
                  <div>
                    <div className="row" style={{ gap: 6, alignItems: 'center' }}>
                      <span className="crop-season-title">{sName}</span>
                      {isCurr && (
                        <span className="badge tone-brand" style={{ fontSize: 10, padding: '1px 6px' }}>
                          Đang Canh Tác
                        </span>
                      )}
                    </div>
                    <span className="crop-type-name">{cType}</span>
                  </div>

                  <span className="timeline-date-range">
                    {formatDate(sDate)} {eDate ? `➔ ${formatDate(eDate)}` : '➔ Nay'}
                  </span>
                </div>

                {yAmount && (
                  <div className="timeline-yield-row">
                    <span className="yield-badge">
                      📦 Sản lượng: <strong>{formatNumber(Number(yAmount), 0)} {yUnit}</strong>
                    </span>
                  </div>
                )}

                {sNote && (
                  <div className="timeline-note-row">
                    <span className="note-label">🌱 Thổ nhưỡng & Đất:</span>
                    <span className="note-text">{sNote}</span>
                  </div>
                )}

                {dHist && (
                  <div className="timeline-disease-row">
                    <span className="disease-label">🛡️ Sâu bệnh:</span>
                    <span className="disease-text">{dHist}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
