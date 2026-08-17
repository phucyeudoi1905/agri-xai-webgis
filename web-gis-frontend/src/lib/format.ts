const vi = 'vi-VN';

export function formatNumber(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString(vi, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatArea(m2: number): string {
  if (!Number.isFinite(m2)) return '—';
  return `${formatNumber(m2, m2 < 100 ? 2 : 0)} m²`;
}

export function formatHa(m2: number): string {
  return `${formatNumber(m2 / 10000, 2)} ha`;
}

export function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(vi, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(vi, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function relativeTime(iso?: string | null): string {
  if (!iso) return '—';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '—';
  const diffMin = Math.round((Date.now() - then) / 60000);
  if (diffMin < 1) return 'vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  const h = Math.round(diffMin / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} ngày trước`;
  return formatDate(iso);
}

/** Chuyển lỗi axios thành thông điệp hiển thị được. */
export function errorMessage(e: unknown, fallback = 'Đã xảy ra lỗi'): string {
  const err = e as {
    response?: { data?: { message?: string | string[]; code?: string } };
    message?: string;
  };
  const msg = err?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  return msg || err?.message || fallback;
}

/** Mã lỗi nghiệp vụ GIS nếu backend trả về. */
export function errorCode(e: unknown): string | null {
  const err = e as { response?: { data?: { code?: string } } };
  return err?.response?.data?.code ?? null;
}
