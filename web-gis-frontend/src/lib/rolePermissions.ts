/** 2 role nghiệp vụ chuẩn hóa (không còn tách HTX / Nông dân riêng). */
export type UserRole = 'ADMIN' | 'HTX_FARMER';

/** Ma trận quyền UI theo báo cáo chuẩn hóa RBAC (2 Role). */
export interface RolePermissions {
  /** Vẽ / đăng ký lô đất mới */
  createPlot: boolean;
  /** Cập nhật trạng thái sinh trưởng */
  updateGrowth: boolean;
  /** Ghi nhật ký luân canh mùa vụ */
  writeCropHistory: boolean;
  /** Tạo phiếu xuất kho BATCH */
  createBatch: boolean;
  /** Phê duyệt / cấp PUC chính thức (khung Admin) */
  approvePuc: boolean;
  /** Import GeoJSON hàng loạt */
  importGeoJson: boolean;
  /** Cấu hình vùng đệm dịch tễ */
  configureBuffer: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  ADMIN: {
    createPlot: true,
    updateGrowth: true,
    writeCropHistory: false,
    createBatch: false,
    approvePuc: true,
    importGeoJson: true,
    configureBuffer: true,
  },
  HTX_FARMER: {
    createPlot: true,
    updateGrowth: true,
    writeCropHistory: true,
    createBatch: true,
    approvePuc: false,
    importGeoJson: false,
    configureBuffer: false,
  },
};
