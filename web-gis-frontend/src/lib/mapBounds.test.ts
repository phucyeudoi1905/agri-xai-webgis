import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  LAM_DONG_DEFAULT_CENTER,
  LAM_DONG_MAX_BOUNDS,
  LAM_DONG_MIN_ZOOM,
} from './lamDongMapConfig.ts';

describe('Lam Dong map lock constants', () => {
  it('maxBounds SW/NE hợp lệ (south < north, west < east)', () => {
    const bounds = LAM_DONG_MAX_BOUNDS as [[number, number], [number, number]];
    const [[south, west], [north, east]] = bounds;
    assert.ok(south < north);
    assert.ok(west < east);
    assert.ok(south >= 10.5 && north <= 13);
    assert.ok(west >= 106.5 && east <= 109.5);
  });

  it('minZoom khóa mức toàn tỉnh', () => {
    assert.equal(LAM_DONG_MIN_ZOOM, 9);
    assert.ok(LAM_DONG_MIN_ZOOM >= 8 && LAM_DONG_MIN_ZOOM <= 12);
  });

  it('Đà Lạt nằm trong maxBounds', () => {
    const [lat, lng] = LAM_DONG_DEFAULT_CENTER;
    const bounds = LAM_DONG_MAX_BOUNDS as [[number, number], [number, number]];
    const [[south, west], [north, east]] = bounds;
    assert.ok(lat >= south && lat <= north);
    assert.ok(lng >= west && lng <= east);
  });

  it('Cầu Đất & Lạc Dương nằm trong maxBounds', () => {
    const points: Array<[number, number]> = [
      [11.883, 108.472],
      [12.075, 108.438],
    ];
    const bounds = LAM_DONG_MAX_BOUNDS as [[number, number], [number, number]];
    const [[south, west], [north, east]] = bounds;
    for (const [lat, lng] of points) {
      assert.ok(lat >= south && lat <= north, `lat ${lat}`);
      assert.ok(lng >= west && lng <= east, `lng ${lng}`);
    }
  });
});
