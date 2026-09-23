export type CroppingPattern = 'DON_CAY' | 'XEN_CANH' | 'LUAN_PHIEN';

export function normalizeFarmerCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}

export function primaryCropLabel(
  pattern: CroppingPattern,
  crops: string[],
  rotation: Array<{ crop_type: string }>,
): string {
  if (pattern === 'LUAN_PHIEN') {
    const last = rotation.filter((s) => s.crop_type.trim()).at(-1);
    return last?.crop_type.trim() ?? '';
  }
  const clean = crops.map((c) => c.trim()).filter(Boolean);
  if (pattern === 'XEN_CANH') return clean.join(' + ');
  return clean[0] ?? '';
}
