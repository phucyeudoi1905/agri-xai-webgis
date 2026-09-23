-- Sửa chữ Việt bị thay bằng '?' khi migrate qua PowerShell (code page không UTF-8).
UPDATE app_users SET
  full_name = 'Nguyễn Thanh Hùng',
  cooperative_name = 'Sở Nông Nghiệp & PTNT Tỉnh Lâm Đồng'
WHERE username = 'admin_gis';

UPDATE app_users SET
  full_name = 'K''Brông & Hộ Xã Viên',
  cooperative_name = 'HTX Cà Phê & Nông Sản Công Nghệ Cao Cầu Đất Farm'
WHERE username = 'htx_caudat';

UPDATE farmers SET
  full_name = 'Nguyễn Văn An',
  cooperative_name = 'HTX Dâu Tây Sạch Vạn Thành',
  address_text = 'Phường 5, TP Đà Lạt, Lâm Đồng'
WHERE farmer_code = 'ND-LD-0001';

UPDATE farmers SET
  full_name = 'Trần Thị Mai',
  cooperative_name = 'HTX Rau Sạch Vạn Thành GreenFarm',
  address_text = 'Làng hoa Vạn Thành, TP Đà Lạt, Lâm Đồng'
WHERE farmer_code = 'ND-LD-0002';

UPDATE farmers SET
  full_name = 'K''Brông',
  cooperative_name = 'HTX Cà Phê Cầu Đất Farm',
  address_text = 'Xuân Trường, TP Đà Lạt, Lâm Đồng'
WHERE farmer_code = 'ND-LD-0003';

UPDATE farmers SET
  full_name = 'Lê Hoàng Nam',
  cooperative_name = 'Làng hoa truyền thống Thái Phiên',
  address_text = 'Phường 12, TP Đà Lạt, Lâm Đồng'
WHERE farmer_code = 'ND-LD-0004';

UPDATE farmers SET
  full_name = 'Phạm Đức Trọng',
  cooperative_name = 'HTX Dược Liệu Ladophar Đà Lạt',
  address_text = 'Trại Mát, Phường 11, TP Đà Lạt, Lâm Đồng'
WHERE farmer_code = 'ND-LD-0005';

UPDATE farmers SET
  full_name = 'Đặng Thu Hà',
  cooperative_name = 'Trang trại CNC DaLat Gap',
  address_text = 'Đa Thiện, Phường 8, TP Đà Lạt, Lâm Đồng'
WHERE farmer_code = 'ND-LD-0006';

UPDATE plots AS p
SET
  farmer_name = f.full_name,
  farmer_phone = f.phone,
  cooperative_name = f.cooperative_name,
  address_text = COALESCE(p.address_text, f.address_text)
FROM farmers AS f
WHERE p.farmer_code = f.farmer_code;
