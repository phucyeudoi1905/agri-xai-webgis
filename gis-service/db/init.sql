-- GIS Service spatial schema (BA §3.2)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS app_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'HTX_FARMER')),
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(30),
    cooperative_name VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS farmers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_code VARCHAR(30) NOT NULL UNIQUE,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    cooperative_name VARCHAR(150),
    address_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_farmers_code ON farmers (farmer_code);

CREATE TABLE IF NOT EXISTS plots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    puc VARCHAR(50) NOT NULL UNIQUE,
    farmer_id UUID NOT NULL,
    farmer_code VARCHAR(30),
    plot_name VARCHAR(100) NOT NULL,
    boundary GEOMETRY(Polygon, 4326) NOT NULL,
    area_m2 NUMERIC(12, 2) NOT NULL,
    crop_type VARCHAR(255) NOT NULL,
    cropping_pattern VARCHAR(20) DEFAULT 'DON_CAY',
    crop_types TEXT,
    growth_status VARCHAR(20) DEFAULT 'DANG_TRONG'
        CHECK (growth_status IN ('DANG_TRONG', 'PHAT_TRIEN', 'RA_HOA', 'THU_HOACH', 'NGHI_CANH')),
    risk_level INT DEFAULT 0 CHECK (risk_level IN (0, 1, 2)),
    qr_code_url TEXT,
    farmer_name VARCHAR(120),
    farmer_phone VARCHAR(30),
    cooperative_name VARCHAR(150),
    address_text TEXT,
    elevation_m NUMERIC(8, 2),
    slope_deg NUMERIC(6, 2),
    soil_type VARCHAR(150),
    soil_ph NUMERIC(4, 2),
    soil_moisture NUMERIC(6, 2),
    soil_organic_matter VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_plots_boundary ON plots USING GIST (boundary);
CREATE INDEX IF NOT EXISTS idx_plots_farmer_id ON plots (farmer_id);
CREATE INDEX IF NOT EXISTS idx_plots_risk_level ON plots (risk_level);

CREATE TABLE IF NOT EXISTS shipping_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    puc VARCHAR(50) NOT NULL REFERENCES plots(puc) ON DELETE CASCADE,
    batch_code VARCHAR(100) NOT NULL UNIQUE,
    harvest_date DATE NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    destination VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shipping_logs_puc ON shipping_logs (puc);

CREATE TABLE IF NOT EXISTS plot_disease_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    puc VARCHAR(50) NOT NULL REFERENCES plots(puc) ON DELETE CASCADE,
    disease_name VARCHAR(100) NOT NULL,
    confidence NUMERIC(5, 2) NOT NULL,
    xai_overlay_url TEXT,
    alert_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'MOI_PHAT_HIEN'
        CHECK (status IN ('MOI_PHAT_HIEN', 'DANG_XU_LY', 'DA_KHAC_PHUC'))
);

CREATE INDEX IF NOT EXISTS idx_plot_disease_alerts_puc ON plot_disease_alerts (puc);

CREATE TABLE IF NOT EXISTS growth_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    puc VARCHAR(50) NOT NULL REFERENCES plots(puc) ON DELETE CASCADE,
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    changed_by UUID,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_growth_status_history_puc ON growth_status_history (puc);

CREATE TABLE IF NOT EXISTS puc_sequences (
    province_code VARCHAR(10) NOT NULL,
    year INT NOT NULL,
    last_value INT NOT NULL DEFAULT 0,
    PRIMARY KEY (province_code, year)
);

CREATE TABLE IF NOT EXISTS plot_climate_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    puc VARCHAR(50) NOT NULL REFERENCES plots(puc) ON DELETE CASCADE,
    temperature_c NUMERIC(5, 2) NOT NULL,
    humidity_pct NUMERIC(5, 2) NOT NULL,
    sensor_id VARCHAR(64),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_plot_climate_readings_puc ON plot_climate_readings (puc);
CREATE INDEX IF NOT EXISTS idx_plot_climate_readings_recorded_at ON plot_climate_readings (recorded_at DESC);

CREATE TABLE IF NOT EXISTS plot_crop_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    puc VARCHAR(50) NOT NULL REFERENCES plots(puc) ON DELETE CASCADE,
    season_name VARCHAR(100) NOT NULL,
    crop_type VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    yield_amount NUMERIC(12, 2),
    yield_unit VARCHAR(30),
    soil_condition_note TEXT,
    disease_history TEXT,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_plot_crop_history_puc ON plot_crop_history (puc);

INSERT INTO app_users (id, username, password_hash, role, full_name, phone, cooperative_name)
VALUES
  (
    '11111111-1111-4111-8111-111111111111',
    'admin_gis',
    '$2b$10$ia46.YzLBF67xhaF4x5z4eD8081W6Q4BKi9v58kv0S30aTK8iUifu',
    'ADMIN',
    'Nguyễn Thanh Hùng',
    '0263 3822 567',
    'Sở Nông Nghiệp & PTNT Tỉnh Lâm Đồng'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'htx_caudat',
    '$2b$10$GVseiMJPsNLJWCeB24b5M.qWlj5x4XLYuVErzJw/vlxVJUCBWzSnS',
    'HTX_FARMER',
    'K''Brông & Hộ Xã Viên',
    '0977 412 550',
    'HTX Cà Phê & Nông Sản Công Nghệ Cao Cầu Đất Farm'
  )
ON CONFLICT (username) DO NOTHING;

INSERT INTO farmers (id, farmer_code, full_name, phone, cooperative_name, address_text)
VALUES
  ('a3b8e912-4c5d-6e7f-8a9b-0c1d2e3f4a5b', 'ND-LD-0001', 'Nguyễn Văn An', '0918 345 678', 'HTX Dâu Tây Sạch Vạn Thành', 'Phường 5, TP Đà Lạt, Lâm Đồng'),
  ('b7c91d24-8e3f-4a52-9d61-7f0e2c4b8a13', 'ND-LD-0002', 'Trần Thị Mai', '0903 889 912', 'HTX Rau Sạch Vạn Thành GreenFarm', 'Làng hoa Vạn Thành, TP Đà Lạt, Lâm Đồng'),
  ('c1d84f36-2b57-4e98-8a02-5c6d9e1f3b47', 'ND-LD-0003', 'K''Brông', '0977 412 550', 'HTX Cà Phê Cầu Đất Farm', 'Xuân Trường, TP Đà Lạt, Lâm Đồng'),
  ('d4e95a47-3c68-4f09-9b13-6d7e0f2a4c58', 'ND-LD-0004', 'Lê Hoàng Nam', '0934 567 890', 'Làng hoa truyền thống Thái Phiên', 'Phường 12, TP Đà Lạt, Lâm Đồng'),
  ('e5f06b58-4d79-401a-8c24-7e8f1a3b5d69', 'ND-LD-0005', 'Phạm Đức Trọng', '0912 789 012', 'HTX Dược Liệu Ladophar Đà Lạt', 'Trại Mát, Phường 11, TP Đà Lạt, Lâm Đồng'),
  ('f6017c69-5e8a-412b-9d35-8f9a2b4c6e70', 'ND-LD-0006', 'Đặng Thu Hà', '0988 654 321', 'Trang trại CNC DaLat Gap', 'Đa Thiện, Phường 8, TP Đà Lạt, Lâm Đồng')
ON CONFLICT (farmer_code) DO NOTHING;
