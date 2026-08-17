import type { GrowthStatus, RiskLevel } from '../types/gis.types';

export const RISK_META: Record<
  RiskLevel,
  { label: string; short: string; color: string }
> = {
  0: { label: 'Bình thường', short: 'An toàn', color: '#2E7D32' },
  1: { label: 'Cảnh báo nhẹ', short: 'Theo dõi', color: '#F57F17' },
  2: { label: 'Nguy cơ cao', short: 'Nguy cơ', color: '#D32F2F' },
};

export const GROWTH_META: Record<GrowthStatus, { label: string }> = {
  DANG_TRONG: { label: 'Đang trồng' },
  PHAT_TRIEN: { label: 'Phát triển' },
  RA_HOA: { label: 'Ra hoa' },
  THU_HOACH: { label: 'Thu hoạch' },
  NGHI_CANH: { label: 'Nghỉ canh' },
};

export const GROWTH_ORDER: GrowthStatus[] = [
  'DANG_TRONG',
  'PHAT_TRIEN',
  'RA_HOA',
  'THU_HOACH',
  'NGHI_CANH',
];

const ALERT_STATUS_LABELS: Record<string, string> = {
  MOI_PHAT_HIEN: 'Mới phát hiện',
  DANG_XU_LY: 'Đang xử lý',
  DA_KHAC_PHUC: 'Đã khắc phục',
};

export function alertStatusLabel(status?: string): string {
  if (!status) return '—';
  return ALERT_STATUS_LABELS[status] ?? status;
}

export function riskLabel(level: number): string {
  return RISK_META[(level as RiskLevel) ?? 0]?.label ?? 'Không rõ';
}

export function growthLabel(status?: string): string {
  if (!status) return '—';
  return GROWTH_META[status as GrowthStatus]?.label ?? status;
}

/** risk_level suy ra từ độ tin cậy AI khi bên ngoài không gửi kèm. */
export function riskFromConfidence(confidence: number): RiskLevel {
  if (confidence >= 80) return 2;
  if (confidence >= 50) return 1;
  return 0;
}
