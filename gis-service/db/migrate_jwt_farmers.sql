-- JWT users, farmer registry, cropping pattern (existing volumes)
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

ALTER TABLE plots ADD COLUMN IF NOT EXISTS farmer_name VARCHAR(120);
ALTER TABLE plots ADD COLUMN IF NOT EXISTS farmer_phone VARCHAR(30);
ALTER TABLE plots ADD COLUMN IF NOT EXISTS cooperative_name VARCHAR(150);
ALTER TABLE plots ADD COLUMN IF NOT EXISTS address_text TEXT;
ALTER TABLE plots ADD COLUMN IF NOT EXISTS elevation_m NUMERIC(8, 2);
ALTER TABLE plots ADD COLUMN IF NOT EXISTS slope_deg NUMERIC(6, 2);
ALTER TABLE plots ADD COLUMN IF NOT EXISTS soil_type VARCHAR(150);
ALTER TABLE plots ADD COLUMN IF NOT EXISTS soil_ph NUMERIC(4, 2);
ALTER TABLE plots ADD COLUMN IF NOT EXISTS soil_moisture NUMERIC(6, 2);
ALTER TABLE plots ADD COLUMN IF NOT EXISTS soil_organic_matter VARCHAR(200);
ALTER TABLE plots ADD COLUMN IF NOT EXISTS farmer_code VARCHAR(30);
ALTER TABLE plots ADD COLUMN IF NOT EXISTS cropping_pattern VARCHAR(20) DEFAULT 'DON_CAY';
ALTER TABLE plots ADD COLUMN IF NOT EXISTS crop_types TEXT;

ALTER TABLE plots ALTER COLUMN crop_type TYPE VARCHAR(255);

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
ON CONFLICT (username) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  cooperative_name = EXCLUDED.cooperative_name;

INSERT INTO farmers (id, farmer_code, full_name, phone, cooperative_name, address_text)
VALUES
  ('a3b8e912-4c5d-6e7f-8a9b-0c1d2e3f4a5b', 'ND-LD-0001', 'Nguyễn Văn An', '0918 345 678', 'HTX Dâu Tây Sạch Vạn Thành', 'Phường 5, TP Đà Lạt, Lâm Đồng'),
  ('b7c91d24-8e3f-4a52-9d61-7f0e2c4b8a13', 'ND-LD-0002', 'Trần Thị Mai', '0903 889 912', 'HTX Rau Sạch Vạn Thành GreenFarm', 'Làng hoa Vạn Thành, TP Đà Lạt, Lâm Đồng'),
  ('c1d84f36-2b57-4e98-8a02-5c6d9e1f3b47', 'ND-LD-0003', 'K''Brông', '0977 412 550', 'HTX Cà Phê Cầu Đất Farm', 'Xuân Trường, TP Đà Lạt, Lâm Đồng'),
  ('d4e95a47-3c68-4f09-9b13-6d7e0f2a4c58', 'ND-LD-0004', 'Lê Hoàng Nam', '0934 567 890', 'Làng hoa truyền thống Thái Phiên', 'Phường 12, TP Đà Lạt, Lâm Đồng'),
  ('e5f06b58-4d79-401a-8c24-7e8f1a3b5d69', 'ND-LD-0005', 'Phạm Đức Trọng', '0912 789 012', 'HTX Dược Liệu Ladophar Đà Lạt', 'Trại Mát, Phường 11, TP Đà Lạt, Lâm Đồng'),
  ('f6017c69-5e8a-412b-9d35-8f9a2b4c6e70', 'ND-LD-0006', 'Đặng Thu Hà', '0988 654 321', 'Trang trại CNC DaLat Gap', 'Đa Thiện, Phường 8, TP Đà Lạt, Lâm Đồng')
ON CONFLICT (farmer_code) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  cooperative_name = EXCLUDED.cooperative_name,
  address_text = EXCLUDED.address_text;
