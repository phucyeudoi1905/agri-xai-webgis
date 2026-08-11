export enum GrowthStatus {
  DANG_TRONG = 'DANG_TRONG',
  PHAT_TRIEN = 'PHAT_TRIEN',
  RA_HOA = 'RA_HOA',
  THU_HOACH = 'THU_HOACH',
  NGHI_CANH = 'NGHI_CANH',
}

export enum RiskLevel {
  BINH_THUONG = 0,
  CANH_BAO_NHE = 1,
  NGUY_CO_CAO = 2,
}

export enum AlertStatus {
  MOI_PHAT_HIEN = 'MOI_PHAT_HIEN',
  DANG_XU_LY = 'DANG_XU_LY',
  DA_KHAC_PHUC = 'DA_KHAC_PHUC',
}

export const RISK_COLORS: Record<RiskLevel, string> = {
  [RiskLevel.BINH_THUONG]: '#2E7D32',
  [RiskLevel.CANH_BAO_NHE]: '#F57F17',
  [RiskLevel.NGUY_CO_CAO]: '#D32F2F',
};

export enum GisErrorCode {
  SPATIAL_OVERLAP = 'ERR_GIS_SPATIAL_OVERLAP',
  INVALID_POLYGON = 'ERR_GIS_INVALID_POLYGON',
  PUC_NOT_FOUND = 'ERR_GIS_PUC_NOT_FOUND',
  TOKEN_EXPIRED = 'ERR_AUTH_TOKEN_EXPIRED',
}
