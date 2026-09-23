import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  LAM_DONG_PLACES,
  filterLamDongPlaces,
} from './lamDongPlaces.ts';

describe('filterLamDongPlaces', () => {
  it('trả về gợi ý nổi bật khi query rỗng', () => {
    const result = filterLamDongPlaces('', 5);
    assert.equal(result.length, 5);
    assert.equal(result[0]?.name, 'Đà Lạt');
    assert.ok(result.some((p) => p.id === 'cau-dat'));
  });

  it('tìm Đà Lạt không dấu', () => {
    const result = filterLamDongPlaces('dalat');
    assert.ok(result.some((p) => p.id === 'da-lat'));
  });

  it('tìm Cầu Đất', () => {
    const result = filterLamDongPlaces('cau dat');
    assert.equal(result[0]?.id, 'cau-dat');
  });

  it('tìm Lạc Dương / Langbiang', () => {
    const lac = filterLamDongPlaces('lac duong');
    assert.ok(lac.some((p) => p.id === 'lac-duong'));

    const lang = filterLamDongPlaces('langbiang');
    assert.ok(lang.some((p) => p.id === 'lang-biang' || p.id === 'lac-duong'));
  });

  it('tìm Bảo Lộc', () => {
    const result = filterLamDongPlaces('bao loc');
    assert.ok(result.some((p) => p.id === 'bao-loc'));
  });

  it('không trả kết quả với chuỗi không khớp', () => {
    const result = filterLamDongPlaces('ha noi');
    assert.equal(result.length, 0);
  });

  it('mọi địa danh nằm trong khoảng Lâm Đồng hợp lý', () => {
    for (const place of LAM_DONG_PLACES) {
      assert.ok(place.lat >= 11.0 && place.lat <= 12.5, `${place.name} lat`);
      assert.ok(place.lng >= 107.0 && place.lng <= 109.1, `${place.name} lng`);
      assert.ok(place.zoom >= 9 && place.zoom <= 18, `${place.name} zoom`);
    }
  });
});
