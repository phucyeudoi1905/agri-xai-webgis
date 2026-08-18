/**
 * E2E API smoke: health → create → overlap reject → alert → get → shipping → pdf
 * Usage: node scripts/smoke-api.mjs [baseUrl] [apiKey]
 */
const BASE = process.argv[2] ?? 'http://localhost:4000';
const API_KEY = process.argv[3] ?? process.env.API_KEY ?? '';
const API = `${BASE}/api/v1/gis`;

function headers(json = true) {
  const h = {};
  if (json) h['Content-Type'] = 'application/json';
  if (API_KEY) h['X-API-Key'] = API_KEY;
  return h;
}

async function call(method, path, body) {
  const url = path.startsWith('http') ? path : `${API}${path}`;
  const res = await fetch(url, {
    method,
    headers: headers(Boolean(body)),
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = text;
  }
  return { status: res.status, payload, ok: res.ok };
}

function ring(seed) {
  const w = 105.91 + (seed % 1000) * 0.0003;
  const s = 10.121 + (seed % 1000) * 0.0003;
  return [
    [w, s],
    [w + 0.0018, s],
    [w + 0.0018, s + 0.0018],
    [w, s + 0.0018],
    [w, s],
  ];
}

async function main() {
  const health = await fetch(`${BASE}/health`).then((r) => r.json());
  console.log('health', health);
  if (health.db !== 'up') throw new Error('DB not ready');

  const farmer = 'a3b8e912-4c5d-6e7f-8a9b-0c1d2e3f4a5b';
  const coords = ring(Date.now());
  const create = await call('POST', '/plots', {
    farmer_id: farmer,
    plot_name: `Smoke ${Date.now()}`,
    crop_type: 'Lúa ST25',
    boundary: { type: 'Polygon', coordinates: [coords] },
  });
  if (!create.ok) {
    throw new Error(`create failed: ${JSON.stringify(create.payload)}`);
  }
  const puc = create.payload.data.puc;
  console.log('created', puc);

  const overlap = await call('POST', '/plots', {
    farmer_id: farmer,
    plot_name: 'Overlap twin',
    crop_type: 'Lúa ST25',
    boundary: { type: 'Polygon', coordinates: [coords] },
  });
  if (overlap.ok) throw new Error('expected overlap rejection');
  console.log('overlap rejected', overlap.status, overlap.payload?.code || overlap.payload);

  const alert = await call('POST', '/plots/disease-alert', {
    puc,
    disease_name: 'Smoke blight',
    confidence: 91,
  });
  if (!alert.ok) throw new Error(`alert failed: ${JSON.stringify(alert.payload)}`);
  console.log('alert risk', alert.payload.data.risk_level, 'neighbors', alert.payload.data.isolation_neighbors?.length ?? 0);

  const again = await call('GET', `/plots/${encodeURIComponent(puc)}`);
  if (!again.ok) throw new Error('get puc failed');
  console.log('risk after alert', again.payload.data.risk_level);

  const ship = await call('POST', '/shipping', {
    puc,
    harvest_date: new Date().toISOString().slice(0, 10),
    quantity: 100,
    unit: 'kg',
    destination: 'Smoke Factory',
  });
  if (!ship.ok) throw new Error(`shipping failed: ${JSON.stringify(ship.payload)}`);
  console.log('batch', ship.payload.data.batchCode);

  const pdf = await fetch(`${API}/plots/${encodeURIComponent(puc)}/report.pdf`, {
    headers: headers(false),
  });
  if (!pdf.ok) throw new Error(`pdf failed ${pdf.status}`);
  console.log('pdf bytes', (await pdf.arrayBuffer()).byteLength);

  console.log('\nSMOKE PASS');
}

main().catch((e) => {
  console.error('SMOKE FAIL', e.message);
  process.exit(1);
});
