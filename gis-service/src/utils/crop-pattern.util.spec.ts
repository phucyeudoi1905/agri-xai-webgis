import { CroppingPattern } from '../common/enums';
import {
  normalizeFarmerCode,
  resolveCropTypesList,
  resolvePrimaryCropType,
} from './crop-pattern.util';

describe('normalizeFarmerCode', () => {
  it('trim và in hoa mã nông dân', () => {
    expect(normalizeFarmerCode(' nd-ld-0001 ')).toBe('ND-LD-0001');
  });
});

describe('resolvePrimaryCropType', () => {
  it('đơn cây dùng crop_type', () => {
    expect(
      resolvePrimaryCropType({
        cropping_pattern: CroppingPattern.DON_CAY,
        crop_type: 'Cà phê Arabica',
      }),
    ).toBe('Cà phê Arabica');
  });

  it('xen canh nối nhiều loại bằng +', () => {
    expect(
      resolvePrimaryCropType({
        cropping_pattern: CroppingPattern.XEN_CANH,
        crop_types: ['Cà phê Arabica', 'Đậu leo'],
      }),
    ).toBe('Cà phê Arabica + Đậu leo');
  });

  it('luân phiên lấy cây vụ cuối (vụ hiện tại)', () => {
    expect(
      resolvePrimaryCropType({
        cropping_pattern: CroppingPattern.LUAN_PHIEN,
        rotation_seasons: [
          { season_name: 'Vụ 2025', crop_type: 'Đậu leo' },
          { season_name: 'Vụ 2026', crop_type: 'Cà phê Arabica' },
        ],
      }),
    ).toBe('Cà phê Arabica');
  });
});

describe('resolveCropTypesList', () => {
  it('luân phiên trả đúng thứ tự vụ', () => {
    expect(
      resolveCropTypesList({
        cropping_pattern: CroppingPattern.LUAN_PHIEN,
        rotation_seasons: [
          { season_name: 'A', crop_type: 'Đậu' },
          { season_name: 'B', crop_type: 'Cà phê' },
        ],
      }),
    ).toEqual(['Đậu', 'Cà phê']);
  });
});
