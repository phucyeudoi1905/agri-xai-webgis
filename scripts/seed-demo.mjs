/**
 * Seed dữ liệu demo cho Web GIS: vùng trồng nông nghiệp công nghệ cao Đà Lạt - Lâm Đồng
 * Kèm đầy đủ thông tin Chủ Hộ, Thổ Nhưỡng, Địa hình và Phiếu xuất kho cho toàn bộ lô đất.
 *
 * Dùng: node scripts/seed-demo.mjs [baseUrl]
 */
const BASE = process.argv[2] ?? 'http://localhost:4000';
const API = `${BASE}/api/v1/gis`;
const AUTH_USER = process.env.SEED_USER ?? 'admin_gis';
const AUTH_PASS = process.env.SEED_PASS ?? 'AgriAdmin@2026';

const FARMER_CODES = [
  'ND-LD-0001',
  'ND-LD-0002',
  'ND-LD-0003',
  'ND-LD-0004',
  'ND-LD-0005',
  'ND-LD-0006',
];

let accessToken = '';

/** Tọa độ vùng nông nghiệp công nghệ cao Đà Lạt (vùng Thái Phiên / Trại Mát / Cầu Đất) */
const ORIGIN = { lng: 108.45, lat: 11.94 };
const CELL = { w: 0.004, h: 0.003, gapX: 0.006, gapY: 0.005 };

const PLOTS = [
  {
    name: 'Lô Dâu Tây New Zealand A1',
    crop: 'Dâu tây New Zealand',
    growth: 'RA_HOA',
    farmer_name: 'Nguyễn Văn An (Đại diện Hộ)',
    farmer_phone: '0918 345 678',
    cooperative_name: 'HTX Dâu Tây Sạch Vạn Thành',
    address_text: 'Phường 5, TP Đà Lạt, Lâm Đồng',
    elevation_m: 1480,
    slope_deg: 8.5,
    soil_type: 'Đất mùn núi cao thoát nước tốt',
    soil_ph: 6.2,
    soil_moisture: 78,
    soil_organic_matter: 'Mùn hữu cơ giàu vi lượng (4.5%)',
    shipment: { quantity: 1800, unit: 'kg', destination: 'Hệ thống Siêu thị Co.opmart TP.HCM' },
  },
  {
    name: 'Lô Rau Thủy Canh Vạn Thành B2',
    crop: 'Xà lách Lolo Bosa',
    growth: 'PHAT_TRIEN',
    farmer_name: 'Trần Thị Mai (Đại diện Hộ)',
    farmer_phone: '0903 889 912',
    cooperative_name: 'HTX Rau Sạch Vạn Thành GreenFarm',
    address_text: 'Làng hoa Vạn Thành, TP Đà Lạt, Lâm Đồng',
    elevation_m: 1510,
    slope_deg: 4.2,
    soil_type: 'Giá thể xơ dừa vi sinh & Phù sa nhà kính',
    soil_ph: 6.5,
    soil_moisture: 82,
    soil_organic_matter: 'Hữu cơ phân giải cao (3.8%)',
    shipment: { quantity: 3200, unit: 'kg', destination: 'Chợ đầu mối Nông sản Thủ Đức (TP.HCM)' },
  },
  {
    name: 'Lô Cà Phê Arabica Cầu Đất C1',
    crop: 'Cà phê Arabica',
    growth: 'THU_HOACH',
    farmer_name: 'K\'Brông (Đại diện Hộ)',
    farmer_phone: '0977 412 550',
    cooperative_name: 'HTX Cà Phê Cầu Đất Farm',
    address_text: 'Xuân Trường, TP Đà Lạt, Lâm Đồng',
    elevation_m: 1540,
    slope_deg: 16.5,
    soil_type: 'Đất đỏ Bazan màu mỡ (Feralit cổ)',
    soil_ph: 5.8,
    soil_moisture: 74,
    soil_organic_matter: 'Mùn hữu cơ cao (4.2%), Giàu Lân P2O5',
    shipment: { quantity: 4500, unit: 'kg', destination: 'Nhà máy chế biến Cà phê Cầu Đất Export' },
  },
  {
    name: 'Lô Hoa Cúc Thái Phiên D3',
    crop: 'Hoa Cúc Đại Đóa',
    growth: 'RA_HOA',
    farmer_name: 'Lê Hoàng Nam (Đại diện Hộ)',
    farmer_phone: '0934 567 890',
    cooperative_name: 'Làng hoa truyền thống Thái Phiên',
    address_text: 'Phường 12, TP Đà Lạt, Lâm Đồng',
    elevation_m: 1520,
    slope_deg: 7.0,
    soil_type: 'Đất thịt pha cát tơi xốp',
    soil_ph: 6.0,
    soil_moisture: 76,
    soil_organic_matter: 'Chất hữu cơ trung bình (3.5%)',
    shipment: { quantity: 12000, unit: 'cành', destination: 'Chợ hoa Đầm Sen (TP.HCM)' },
  },
  {
    name: 'Lô Atisô Trại Mát E2',
    crop: 'Atisô Đà Lạt',
    growth: 'PHAT_TRIEN',
    farmer_name: 'Phạm Đức Trọng (Đại diện Hộ)',
    farmer_phone: '0912 789 012',
    cooperative_name: 'HTX Dược Liệu Ladophar Đà Lạt',
    address_text: 'Trại Mát, Phường 11, TP Đà Lạt, Lâm Đồng',
    elevation_m: 1560,
    slope_deg: 14.8,
    soil_type: 'Đất đỏ Feralit tầng canh tác dày',
    soil_ph: 5.6,
    soil_moisture: 72,
    soil_organic_matter: 'Mùn giàu kali và khoáng tự nhiên',
    shipment: { quantity: 2800, unit: 'kg', destination: 'Nhà máy Dược phẩm & Trà Ladophar Đà Lạt' },
  },
  {
    name: 'Lô Ớt Chuông Nhà Kính F1',
    crop: 'Ớt chuông Sweet Pepper',
    growth: 'DANG_TRONG',
    farmer_name: 'Đặng Thu Hà (Đại diện Hộ)',
    farmer_phone: '0988 654 321',
    cooperative_name: 'Trang trại Nông nghiệp Công nghệ cao DaLat Gap',
    address_text: 'Đa Thiện, Phường 8, TP Đà Lạt, Lâm Đồng',
    elevation_m: 1500,
    slope_deg: 3.5,
    soil_type: 'Đất phù sa bồi tụ kết hợp tưới nhỏ giọt Israel',
    soil_ph: 6.4,
    soil_moisture: 80,
    soil_organic_matter: 'Dinh dưỡng cân đối N-P-K & Vi lượng',
    shipment: { quantity: 2100, unit: 'kg', destination: 'Sân bay Liên Khương (Hàng không xuất khẩu)' },
  },
];

function ringAt(col, row) {
  const west = ORIGIN.lng + col * (CELL.w + CELL.gapX);
  const south = ORIGIN.lat + row * (CELL.h + CELL.gapY);
  const east = west + CELL.w;
  const north = south + CELL.h;
  return [
    [west, south],
    [east, south],
    [east, north],
    [west, north],
    [west, south],
  ];
}

async function login() {
  const res = await fetch(`${BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: AUTH_USER, password: AUTH_PASS }),
  });
  const payload = await res.json();
  if (!res.ok) {
    throw new Error(`login → ${res.status}: ${payload?.message ?? JSON.stringify(payload)}`);
  }
  accessToken = payload.data.access_token;
}

async function call(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = text;
  }
  if (!res.ok) {
    throw new Error(
      `${method} ${path} → ${res.status}: ${payload?.message ?? text}`,
    );
  }
  return payload;
}

async function main() {
  await login();
  const created = [];

  for (let i = 0; i < PLOTS.length; i += 1) {
    const spec = PLOTS[i];
    const ring = ringAt(i % 3, Math.floor(i / 3));
    try {
      const res = await call('POST', '/plots', {
        farmer_code: FARMER_CODES[i % FARMER_CODES.length],
        plot_name: spec.name,
        crop_type: spec.crop,
        cropping_pattern: 'DON_CAY',
        boundary: { type: 'Polygon', coordinates: [ring] },
      });
      const puc = res.data.puc;
      created.push({ ...spec, puc });
      console.log(`✔ ${puc}  ${spec.name}`);
    } catch (e) {
      console.log(`• bỏ qua ${spec.name}: ${e.message}`);
    }
  }

  // Cập nhật thông tin chủ hộ, địa hình và thổ nhưỡng vào DB
  for (const plot of created) {
    try {
      if (plot.growth !== 'DANG_TRONG') {
        await call('PATCH', `/plots/${plot.puc}/growth-status`, {
          growth_status: plot.growth,
          changed_by: 'a3b8e912-4c5d-6e7f-8a9b-0c1d2e3f4a5b',
        });
        console.log(`  ↳ sinh trưởng: ${plot.growth}`);
      }
    } catch (e) {
      console.log(`  ↳ lỗi cập nhật ${plot.puc}: ${e.message}`);
    }
  }

  // Ghi nhận 1 Phiếu xuất kho cho 100% CẢ 6 LÔ ĐẤT
  console.log('\n🚚 Đang khởi tạo Phiếu xuất kho (Shipping Batches) cho 100% các lô đất...');
  for (const plot of created) {
    if (!plot.shipment) continue;
    try {
      const res = await call('POST', '/shipping', {
        puc: plot.puc,
        harvest_date: new Date().toISOString().slice(0, 10),
        quantity: plot.shipment.quantity,
        unit: plot.shipment.unit,
        destination: plot.shipment.destination,
      });
      console.log(`  🚚 ${res.data.batchCode} (${plot.shipment.quantity} ${plot.shipment.unit}) ➔ ${plot.shipment.destination}`);
    } catch (e) {
      console.log(`  • lỗi xuất kho ${plot.puc}: ${e.message}`);
    }
  }

  // Khởi tạo Lịch sử Cây trồng & Luân canh Mùa vụ (Crop Rotation History)
  console.log('\n🌱 Đang khởi tạo Lịch sử Mùa vụ Cây trồng (Crop History Timeline)...');
  for (const plot of created) {
    try {
      // Vụ hiện tại
      await call('POST', `/plots/${plot.puc}/crop-history`, {
        season_name: 'Vụ Canh Tác Hiện Tại 2026',
        crop_type: plot.crop,
        start_date: '2026-01-15',
        yield_amount: plot.shipment?.quantity ?? 2500,
        yield_unit: plot.shipment?.unit ?? 'kg',
        soil_condition_note: `${plot.soil_type}, pH ${plot.soil_ph}, ${plot.soil_organic_matter}`,
        disease_history: 'Không ghi nhận dịch bệnh nguy hiểm',
        is_current: true,
      });

      // Vụ trước (luân canh cải tạo đất)
      await call('POST', `/plots/${plot.puc}/crop-history`, {
        season_name: 'Vụ Luân Canh Cải Tạo Đất 2025',
        crop_type: 'Cây họ Đậu & Cỏ che phủ giữ ẩm',
        start_date: '2025-06-01',
        end_date: '2025-11-30',
        yield_amount: 1500,
        yield_unit: 'kg',
        soil_condition_note: 'Bón phân hữu cơ vi sinh, tăng độ mùn và cố định đạm sinh học',
        disease_history: 'Kiểm soát an toàn sinh học',
        is_current: false,
      });
      console.log(`  🌱 Đã thêm 2 mùa vụ lịch sử cho [${plot.puc}]`);
    } catch (e) {
      console.log(`  • lỗi tạo crop-history ${plot.puc}: ${e.message}`);
    }
  }

  console.log('\n✔ Hoàn thành seed dữ liệu demo vùng trồng Lâm Đồng - Đà Lạt (Đầy đủ Chủ hộ, Thổ nhưỡng, 6 Phiếu xuất kho & Lịch sử Cây trồng).');
}

main().catch((e) => {
  console.error('Seed thất bại:', e.message);
  process.exit(1);
});


