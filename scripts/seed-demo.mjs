/**
 * Seed dữ liệu demo cho Web GIS: lô đất nhiều loại cây, cảnh báo dịch bệnh,
 * cập nhật sinh trưởng và nhật ký xuất xưởng.
 *
 * Dùng: node scripts/seed-demo.mjs [baseUrl]
 */
const BASE = process.argv[2] ?? 'http://localhost:4000';
const API = `${BASE}/api/v1/gis`;

const FARMERS = [
  'a3b8e912-4c5d-6e7f-8a9b-0c1d2e3f4a5b',
  'b7c91d24-8e3f-4a52-9d61-7f0e2c4b8a13',
  'c1d84f36-2b57-4e98-8a02-5c6d9e1f3b47',
];

/** Lưới lô đất nằm lệch khỏi vùng đã có dữ liệu để tránh chồng lấn. */
const ORIGIN = { lng: 105.83, lat: 10.05 };
const CELL = { w: 0.004, h: 0.003, gapX: 0.006, gapY: 0.005 };

const PLOTS = [
  { name: 'Lô Lúa Đông Xuân A2', crop: 'Lúa ST25', growth: 'RA_HOA' },
  { name: 'Lô Xoài Cát Chu B1', crop: 'Xoài Cát Chu', growth: 'PHAT_TRIEN' },
  { name: 'Lô Sầu Riêng C3', crop: 'Sầu riêng Ri6', growth: 'THU_HOACH' },
  { name: 'Lô Thanh Long D1', crop: 'Thanh long ruột đỏ', growth: 'RA_HOA' },
  { name: 'Lô Cà Chua Nhà Kính E2', crop: 'Cà chua ST-01', growth: 'PHAT_TRIEN' },
  { name: 'Lô Nhãn Idor F4', crop: 'Nhãn Idor', growth: 'DANG_TRONG' },
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

async function call(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
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
  const created = [];

  for (let i = 0; i < PLOTS.length; i += 1) {
    const spec = PLOTS[i];
    const ring = ringAt(i % 3, Math.floor(i / 3));
    try {
      const res = await call('POST', '/plots', {
        farmer_id: FARMERS[i % FARMERS.length],
        plot_name: spec.name,
        crop_type: spec.crop,
        boundary: { type: 'Polygon', coordinates: [ring] },
      });
      const puc = res.data.puc;
      created.push({ ...spec, puc });
      console.log(`✔ ${puc}  ${spec.name}`);
    } catch (e) {
      console.log(`• bỏ qua ${spec.name}: ${e.message}`);
    }
  }

  for (const plot of created) {
    if (plot.growth === 'DANG_TRONG') continue;
    try {
      await call('PATCH', `/plots/${plot.puc}/growth-status`, {
        growth_status: plot.growth,
        changed_by: FARMERS[0],
      });
      console.log(`  ↳ sinh trưởng: ${plot.growth}`);
    } catch (e) {
      console.log(`  ↳ lỗi sinh trưởng ${plot.puc}: ${e.message}`);
    }
  }

  const alerts = [
    { idx: 1, disease: 'Thán thư trên xoài', confidence: 62 },
    { idx: 3, disease: 'Đốm nâu thanh long', confidence: 91 },
  ];

  for (const a of alerts) {
    const plot = created[a.idx];
    if (!plot) continue;
    try {
      await call('POST', '/plots/disease-alert', {
        puc: plot.puc,
        disease_name: a.disease,
        confidence: a.confidence,
      });
      console.log(`⚠ cảnh báo ${a.disease} (${a.confidence}%) → ${plot.puc}`);
    } catch (e) {
      console.log(`• lỗi cảnh báo ${plot.puc}: ${e.message}`);
    }
  }

  const shipments = [
    { idx: 2, quantity: 4200, unit: 'kg', destination: 'Nhà máy chế biến Sóc Trăng' },
    { idx: 0, quantity: 12, unit: 'tấn', destination: 'Hợp tác xã Thạnh Phú' },
  ];

  for (const s of shipments) {
    const plot = created[s.idx];
    if (!plot) continue;
    try {
      const res = await call('POST', '/shipping', {
        puc: plot.puc,
        harvest_date: new Date().toISOString().slice(0, 10),
        quantity: s.quantity,
        unit: s.unit,
        destination: s.destination,
      });
      console.log(`🚚 ${res.data.batchCode} ← ${plot.puc}`);
    } catch (e) {
      console.log(`• lỗi xuất xưởng ${plot.puc}: ${e.message}`);
    }
  }

  const risk = await call('GET', '/plots/stats/risk');
  console.log('\nTổng hợp rủi ro:', JSON.stringify(risk.data));
}

main().catch((e) => {
  console.error('Seed thất bại:', e.message);
  process.exit(1);
});
