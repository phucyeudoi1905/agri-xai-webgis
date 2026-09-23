import { CroppingPattern } from '../common/enums';

export interface RotationSeasonInput {
  season_name: string;
  crop_type: string;
}

/** Chuẩn hóa mã nông dân: trim + in hoa. */
export function normalizeFarmerCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}

export function resolvePrimaryCropType(input: {
  cropping_pattern: CroppingPattern;
  crop_type?: string;
  crop_types?: string[];
  rotation_seasons?: RotationSeasonInput[];
}): string {
  const extras = (input.crop_types ?? [])
    .map((c) => c.trim())
    .filter(Boolean);
  if (input.cropping_pattern === CroppingPattern.LUAN_PHIEN) {
    const seasons = input.rotation_seasons ?? [];
    const last = seasons[seasons.length - 1];
    if (last?.crop_type.trim()) return last.crop_type.trim();
  }
  if (input.cropping_pattern === CroppingPattern.XEN_CANH && extras.length > 0) {
    return extras.join(' + ');
  }
  const primary = input.crop_type?.trim();
  if (primary) return primary;
  if (extras[0]) return extras[0];
  return '';
}

export function resolveCropTypesList(input: {
  cropping_pattern: CroppingPattern;
  crop_type?: string;
  crop_types?: string[];
  rotation_seasons?: RotationSeasonInput[];
}): string[] {
  if (input.cropping_pattern === CroppingPattern.LUAN_PHIEN) {
    return (input.rotation_seasons ?? [])
      .map((s) => s.crop_type.trim())
      .filter(Boolean);
  }
  const extras = (input.crop_types ?? []).map((c) => c.trim()).filter(Boolean);
  if (extras.length > 0) return extras;
  const primary = input.crop_type?.trim();
  return primary ? [primary] : [];
}
