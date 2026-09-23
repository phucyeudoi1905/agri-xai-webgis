/**
 * Khóa phạm vi bản đồ trong tỉnh Lâm Đồng (WGS84).
 * [[south, west], [north, east]] — có padding nhẹ quanh ranh giới hành chính.
 */
export const LAM_DONG_MAX_BOUNDS: [[number, number], [number, number]] = [
  [11.05, 107.15], // SW — biên phía Nam / Tây
  [12.4, 108.98], // NE — biên phía Bắc / Đông
];

/** Zoom nhỏ nhất vẫn gói gọn khung nhìn trong maxBounds (không “thoát” tỉnh). */
export const LAM_DONG_MIN_ZOOM = 9;

/** Tâm mặc định: TP Đà Lạt */
export const LAM_DONG_DEFAULT_CENTER: [number, number] = [11.9404, 108.4583];
export const LAM_DONG_DEFAULT_ZOOM = 14;
