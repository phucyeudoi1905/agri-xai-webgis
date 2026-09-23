import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ROLE_PERMISSIONS, type UserRole } from './rolePermissions.ts';

const ROLES: UserRole[] = ['ADMIN', 'HTX_FARMER'];

describe('ROLE_PERMISSIONS (2 role chuẩn hóa)', () => {
  it('chỉ có đúng 2 role ADMIN và HTX_FARMER', () => {
    assert.deepEqual(Object.keys(ROLE_PERMISSIONS).sort(), [
      'ADMIN',
      'HTX_FARMER',
    ]);
  });

  it('Admin không tạo BATCH; HTX được tạo BATCH', () => {
    assert.equal(ROLE_PERMISSIONS.ADMIN.createBatch, false);
    assert.equal(ROLE_PERMISSIONS.HTX_FARMER.createBatch, true);
  });

  it('Admin chỉ xem crop history; HTX được ghi', () => {
    assert.equal(ROLE_PERMISSIONS.ADMIN.writeCropHistory, false);
    assert.equal(ROLE_PERMISSIONS.HTX_FARMER.writeCropHistory, true);
  });

  it('cả 2 role đều được tạo lô và cập nhật sinh trưởng', () => {
    for (const role of ROLES) {
      assert.equal(ROLE_PERMISSIONS[role].createPlot, true);
      assert.equal(ROLE_PERMISSIONS[role].updateGrowth, true);
    }
  });

  it('chỉ Admin có approvePuc / importGeoJson / configureBuffer', () => {
    assert.equal(ROLE_PERMISSIONS.ADMIN.approvePuc, true);
    assert.equal(ROLE_PERMISSIONS.ADMIN.importGeoJson, true);
    assert.equal(ROLE_PERMISSIONS.ADMIN.configureBuffer, true);

    assert.equal(ROLE_PERMISSIONS.HTX_FARMER.approvePuc, false);
    assert.equal(ROLE_PERMISSIONS.HTX_FARMER.importGeoJson, false);
    assert.equal(ROLE_PERMISSIONS.HTX_FARMER.configureBuffer, false);
  });
});
