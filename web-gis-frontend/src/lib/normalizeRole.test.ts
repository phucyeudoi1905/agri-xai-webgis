import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/** Mirror normalizeRole logic (tránh import React/AuthContext trong node:test). */
function normalizeRole(raw: string | null): 'ADMIN' | 'HTX_FARMER' {
  if (raw === 'ADMIN') return 'ADMIN';
  if (raw === 'HTX_FARMER') return 'HTX_FARMER';
  if (raw === 'HTX' || raw === 'FARMER') return 'HTX_FARMER';
  return 'ADMIN';
}

describe('normalizeRole legacy migration', () => {
  it('giữ ADMIN / HTX_FARMER', () => {
    assert.equal(normalizeRole('ADMIN'), 'ADMIN');
    assert.equal(normalizeRole('HTX_FARMER'), 'HTX_FARMER');
  });

  it('map HTX và FARMER cũ → HTX_FARMER', () => {
    assert.equal(normalizeRole('HTX'), 'HTX_FARMER');
    assert.equal(normalizeRole('FARMER'), 'HTX_FARMER');
  });

  it('mặc định ADMIN khi null/unknown', () => {
    assert.equal(normalizeRole(null), 'ADMIN');
    assert.equal(normalizeRole('SUPERUSER'), 'ADMIN');
  });
});
