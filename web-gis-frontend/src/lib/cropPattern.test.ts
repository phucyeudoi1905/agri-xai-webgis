import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeFarmerCode, primaryCropLabel } from './cropPattern.ts';

describe('normalizeFarmerCode', () => {
  it('in hoa và bỏ khoảng trắng', () => {
    assert.equal(normalizeFarmerCode(' nd-ld-0001 '), 'ND-LD-0001');
  });
});

describe('primaryCropLabel', () => {
  it('xen canh nối bằng +', () => {
    assert.equal(
      primaryCropLabel('XEN_CANH', ['Cà phê', 'Đậu leo'], []),
      'Cà phê + Đậu leo',
    );
  });

  it('luân phiên lấy vụ cuối', () => {
    assert.equal(
      primaryCropLabel(
        'LUAN_PHIEN',
        [],
        [
          { crop_type: 'Đậu' },
          { crop_type: 'Cà phê Arabica' },
        ],
      ),
      'Cà phê Arabica',
    );
  });
});
