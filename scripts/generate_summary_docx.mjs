/**
 * generate_summary_docx.mjs
 * ──────────────────────────────────────────────────────────
 * Script tự động sinh file BÁO CÁO TỔNG HỢP dạng .docx
 * Phiên bản ngắn gọn — 5 phần chính, không trang bìa/mục lục
 *
 * Chạy: node scripts/generate_summary_docx.mjs
 * Output: docs/BAO_CAO_TONG_HOP_AGRI_XAI_WEB_GIS.docx
 * ──────────────────────────────────────────────────────────
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  ShadingType,
  PageBreak,
} from 'docx';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(__dirname, '..', 'docs', 'BAO_CAO_TONG_HOP_AGRI_XAI_WEB_GIS.docx');

// ────────────────────── HELPERS ──────────────────────

const FONT = 'Times New Roman';
const SZ = 26;        // 13pt
const SZ_SM = 22;     // 11pt
const C1 = '1B5E20';  // xanh đậm
const C2 = '2E7D32';  // xanh lá
const HDR_BG = '2E7D32';
const HDR_FG = 'FFFFFF';
const ALT_ROW = 'F1F8E9';

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 300, after: 160 },
    children: [new TextRun({ text, font: FONT, size: 34, bold: true, color: C1 })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 220, after: 120 },
    children: [new TextRun({ text, font: FONT, size: 28, bold: true, color: C2 })],
  });
}
function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 100, line: 340 },
    alignment: AlignmentType.JUSTIFIED,
    indent: opts.indent ? { firstLine: 600 } : undefined,
    children: [new TextRun({ text, font: FONT, size: SZ, bold: !!opts.bold, italics: !!opts.italic, color: opts.color || '212121' })],
  });
}
function bl(text, lvl = 0) {
  return new Paragraph({
    spacing: { after: 60, line: 320 },
    bullet: { level: lvl },
    children: [new TextRun({ text, font: FONT, size: SZ })],
  });
}
function bbl(label, desc) {
  return new Paragraph({
    spacing: { after: 60, line: 320 },
    bullet: { level: 0 },
    children: [
      new TextRun({ text: label + ': ', font: FONT, size: SZ, bold: true }),
      new TextRun({ text: desc, font: FONT, size: SZ }),
    ],
  });
}
function gap() { return new Paragraph({ spacing: { after: 40 } }); }
function pb() { return new Paragraph({ children: [new PageBreak()] }); }

const BD = { style: BorderStyle.SINGLE, size: 1, color: 'BDBDBD' };
const BS = { top: BD, bottom: BD, left: BD, right: BD };

function hc(text, w) {
  return new TableCell({
    width: { size: w, type: WidthType.PERCENTAGE }, borders: BS,
    shading: { type: ShadingType.SOLID, fill: HDR_BG, color: HDR_BG },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 50, after: 50 },
      children: [new TextRun({ text, font: FONT, size: SZ_SM, bold: true, color: HDR_FG })],
    })],
  });
}
function dc(text, w, opts = {}) {
  return new TableCell({
    width: { size: w, type: WidthType.PERCENTAGE }, borders: BS,
    shading: opts.bg ? { type: ShadingType.SOLID, fill: opts.bg, color: opts.bg } : undefined,
    children: [new Paragraph({
      alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { before: 30, after: 30 },
      children: [new TextRun({ text, font: FONT, size: SZ_SM, bold: !!opts.bold, color: opts.color || '212121' })],
    })],
  });
}
function tbl(headers, rows, cw) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: headers.map((h, i) => hc(h, cw[i])), tableHeader: true }),
      ...rows.map((r, ri) => new TableRow({
        children: r.map((c, ci) => dc(c, cw[ci], { bg: ri % 2 === 1 ? ALT_ROW : undefined, center: ci === headers.length - 1 })),
      })),
    ],
  });
}

// ────────────────────── I. ABSTRACT ──────────────────────

function sec1() {
  return [
    h1('I. ABSTRACT — TÓM TẮT ĐỀ TÀI'),
    p('Agri-XAI Web GIS là nền tảng bản đồ số quản lý vùng trồng và chuỗi cung ứng nông nghiệp Farm-to-Fork. Hệ thống tích hợp PostGIS xử lý dữ liệu không gian, AI Webhook + WebSocket giám sát dịch bệnh thời gian thực, và cổng truy xuất nguồn gốc QR Code cho người tiêu dùng.', { indent: true }),
    gap(),
    tbl(
      ['Tác nhân', 'Chức năng chính', 'Giao diện'],
      [
        ['Nông dân / HTX', 'Vẽ lô, cập nhật sinh trưởng, xuất kho BATCH', '/map, /plots'],
        ['Cơ quan QL & AI', 'Dashboard rủi ro, tiếp nhận webhook dịch bệnh', '/, /disease-alert'],
        ['Người tiêu dùng', 'Quét QR truy xuất nguồn gốc', '/puc/:puc, /trace'],
      ],
      [22, 48, 30]
    ),
    gap(),
    p('Công nghệ: React 18 + Vite + Leaflet (Frontend) | NestJS + TypeORM (Backend) | PostgreSQL 16 + PostGIS 3.3 (DB) | Docker Compose + GitHub Actions (DevOps).', { italic: true }),
    pb(),
  ];
}

// ────────────────────── II. OVERVIEW ──────────────────────

function sec2() {
  return [
    h1('II. OVERVIEW — TỔNG QUAN HỆ THỐNG'),
    h2('2.1. Kiến trúc 3 tầng'),
    tbl(
      ['Tầng', 'Công nghệ', 'Vai trò'],
      [
        ['Frontend', 'React 18 + Vite + Leaflet + Socket.io', 'SPA bản đồ, Dashboard, Tra cứu QR'],
        ['Backend', 'NestJS + TypeORM + Swagger + WebSocket', 'REST API, Logic nghiệp vụ, Realtime'],
        ['Database', 'PostgreSQL 16 + PostGIS 3.3', 'Spatial Index, ST_Intersects, ST_DWithin'],
      ],
      [15, 38, 47]
    ),
    gap(),
    h2('2.2. Tiến độ tổng hợp'),
    tbl(
      ['Giai đoạn', 'Phạm vi', 'Tiến độ'],
      [
        ['Phase 0: Core GIS & MVP', 'CRUD Lô đất, PUC, QR, BBOX, Vòng đời, BATCH, AI Webhook', '100% ✅'],
        ['Phase 1: Hardening', 'API Key Guard, Rate-limit, CORS, Health Check, Docker', '100% ✅'],
        ['Phase 2: CI/CD', 'GitHub Actions, Tài liệu Deploy, HTTPS Nginx', '100% ✅'],
        ['Phase 3: Advanced', 'Vùng đệm 500m, WebSocket, Import GeoJSON, PDF, Traceability', '100% ✅'],
        ['Phase 4: Scale', 'Vector Tiles MVT, CSDL Timeseries IoT', '60% 📋'],
        ['Phase 5: Góp ý GVHD', 'RBAC, Chủ hộ, Thổ nhưỡng, Lịch sử cây trồng, Hợp đồng 3 Nhóm', '100% ✅'],
        ['TỔNG THỂ', 'Toàn bộ hệ thống', '~99% 🎓'],
      ],
      [22, 55, 13]
    ),
    gap(),
    h2('2.3. API Endpoints chính'),
    tbl(
      ['Method', 'Endpoint', 'Mô tả'],
      [
        ['POST', '/api/v1/gis/plots', 'Tạo lô đất + PUC + QR'],
        ['GET', '/api/v1/gis/plots?bbox=', 'GeoJSON theo Viewport BBOX'],
        ['GET', '/api/v1/gis/plots/:puc', 'Tra cứu theo mã PUC'],
        ['PATCH', '/api/v1/gis/plots/:puc/growth-status', 'Cập nhật sinh trưởng'],
        ['POST', '/api/v1/gis/plots/:puc/crop-history', 'Ghi nhận mùa vụ mới'],
        ['POST', '/api/v1/gis/plots/disease-alert', 'Webhook cảnh báo AI'],
        ['POST', '/api/v1/gis/shipping', 'Tạo phiếu xuất kho BATCH'],
        ['GET', '/api/v1/gis/plots/:puc/report.pdf', 'Xuất PDF hồ sơ'],
        ['WS', '/gis → risk.updated', 'Realtime cập nhật rủi ro'],
      ],
      [8, 40, 42]
    ),
    pb(),
  ];
}

// ────────────────────── III. RBAC ──────────────────────

function sec3() {
  return [
    h1('III. PHÂN QUYỀN RBAC'),
    p('Hệ thống phân quyền 3 vai trò qua AuthContext.tsx (Frontend) và API Key Guard (Backend).', { indent: true }),
    gap(),
    h2('3.1. Ma trận phân quyền'),
    tbl(
      ['Chức năng', 'Admin', 'HTX', 'Nông dân'],
      [
        ['Xem bản đồ', '✅ Toàn hệ thống', '✅ Toàn hệ thống', '✅ Lô của mình'],
        ['Tạo / Vẽ lô đất', '✅', '✅', '❌'],
        ['Cập nhật sinh trưởng', '✅', '✅', '✅ Lô mình'],
        ['Ghi nhận mùa vụ', '✅', '✅', '❌'],
        ['Tạo phiếu xuất kho', '✅', '✅', '❌'],
        ['Dashboard thống kê', '✅ Đầy đủ', '✅ Cơ bản', '❌'],
        ['Cảnh báo dịch bệnh AI', '✅', '❌', '❌'],
        ['Import GeoJSON', '✅', '❌', '❌'],
        ['Xuất PDF', '✅', '✅', '❌'],
        ['Tra cứu nguồn gốc', '✅', '✅', '✅'],
      ],
      [28, 24, 24, 24]
    ),
    gap(),
    h2('3.2. Tài khoản demo'),
    tbl(
      ['Vai trò', 'Username', 'Tên', 'Đơn vị'],
      [
        ['Admin', 'admin_gis', 'Nguyễn Thanh Hùng', 'Chi Cục Trồng Trọt & BVTV Lâm Đồng'],
        ['HTX', 'htx_caudat', "K'Brông", 'HTX Cà Phê Cầu Đất Farm'],
        ['Nông dân', 'farmer_mai', 'Trần Thị Mai', 'HTX Rau Sạch Vạn Thành GreenFarm'],
      ],
      [12, 18, 22, 48]
    ),
    gap(),
    h2('3.3. Triển khai kỹ thuật'),
    bbl('Frontend', 'AuthContext.tsx — React Context + localStorage, hàm switchRole(), ẩn/hiện UI theo role'),
    bbl('Backend', 'ApiKeyGuard — xác thực x-api-key cho POST/PATCH, @Public() cho GET công khai'),
    bbl('Rate Limit', 'ThrottlerGuard 120 req/phút chống spam'),
    pb(),
  ];
}

// ────────────────────── IV. DIRECT FLOW ──────────────────────

function sec4() {
  return [
    h1('IV. LUỒNG TƯƠNG TÁC TRỰC TIẾP (DIRECT FLOW)'),

    h2('4.1. Số hóa Thửa đất & Cấp PUC'),
    bbl('Nhập liệu', 'Vẽ trên Map (Leaflet Geoman) / Nhập tọa độ sổ đỏ / Upload GeoJSON'),
    bbl('Validate', 'ST_IsValid → ST_Intersects (chống chồng lấn) → ST_Area (tính diện tích m²)'),
    bbl('Kết quả', 'Sinh mã PUC VN-LD-YYYY-NNNNNN + QR Code PNG → INSERT plots → 201 Created'),
    gap(),

    h2('4.2. Cảnh báo Dịch bệnh AI & Vùng đệm 500m'),
    bbl('Trigger', 'AI Nhóm 3 → POST /disease-alert (kèm x-api-key)'),
    bbl('Phân loại', 'Confidence ≥ 0.8 → Risk 2 (Đỏ) | 0.5–0.8 → Risk 1 (Vàng) | < 0.5 → Risk 0 (Xanh)'),
    bbl('Vùng đệm', 'Risk 2 → ST_DWithin 500m → UPDATE lô lân cận lên Risk 1'),
    bbl('Realtime', 'WebSocket /gis phát risk.updated → Bản đồ đổi màu < 500ms'),
    gap(),

    h2('4.3. Viewport BBOX Loading'),
    bbl('Sự kiện', 'Kéo/Zoom bản đồ → moveend/zoomend → Debounce 350ms'),
    bbl('Query', 'GET /plots?bbox=minLng,minLat,maxLng,maxLat → ST_Intersects(ST_MakeEnvelope)'),
    bbl('Kết quả', 'Trả GeoJSON FeatureCollection → Tiết kiệm >85% băng thông'),
    gap(),

    h2('4.4. Truy xuất Nguồn gốc Farm-to-Fork'),
    bbl('Quét QR', 'Người tiêu dùng quét mã QR → Mở /puc/:puc'),
    bbl('Tổng hợp', 'Backend trả: thửa đất + lịch sử mùa vụ + dịch bệnh + lô hàng BATCH'),
    bbl('Hiển thị', 'Timeline Farm-to-Fork tối ưu cho Mobile'),
    gap(),

    h2('4.5. Quản lý Mùa vụ & Luân canh'),
    bbl('Thao tác', 'Admin/HTX bấm "Ghi nhận mùa vụ mới" → POST /plots/:puc/crop-history'),
    bbl('Xử lý', 'Tạo PlotCropHistoryEntity, nếu is_current=true → cập nhật crop_type lô chính'),
    bbl('UI', 'CropHistoryTimeline.tsx — timeline dọc từng vụ mùa'),
    gap(),

    h2('4.6. Xuất Kho BATCH'),
    bbl('Thao tác', 'HTX/Admin tạo phiếu → POST /shipping → Sinh mã BATCH-PUC-YYYYMMDD-STT'),
    bbl('Kết quả', 'INSERT shipping_logs → In tem QR gắn thùng hàng → Người tiêu dùng tra cứu'),
    pb(),
  ];
}

// ────────────────────── V. MOCKUP DATA ──────────────────────

function sec5() {
  return [
    h1('V. DỮ LIỆU MÔ PHỎNG (MOCKUP DATA)'),
    p('Hệ thống seeded sẵn 6 lô đất demo tại Đà Lạt – Lâm Đồng, đầy đủ chủ hộ, thổ nhưỡng, lịch sử mùa vụ và phiếu xuất kho.', { indent: true }),
    gap(),

    h2('5.1. Danh sách lô đất'),
    tbl(
      ['STT', 'Mã PUC', 'Tên lô', 'Cây trồng', 'Diện tích', 'Risk'],
      [
        ['1', 'VN-LD-2026-000001', 'Cà Phê Arabica Cầu Đất C1', 'Cà phê Arabica', '14.500 m²', 'Xanh (0)'],
        ['2', 'VN-LD-2026-000002', 'Rau Cải Ngọt Vạn Thành R1', 'Rau cải ngọt', '3.200 m²', 'Xanh (0)'],
        ['3', 'VN-LD-2026-000003', 'Dâu Tây Trại Mát D1', 'Dâu tây', '2.800 m²', 'Đỏ (2)'],
        ['4', 'VN-LD-2026-000004', 'Atiso Xuân Trường A1', 'Atiso xanh', '5.600 m²', 'Vàng (1)'],
        ['5', 'VN-LD-2026-000005', 'Hoa Cẩm Tú Cầu H1', 'Cẩm tú cầu', '1.900 m²', 'Xanh (0)'],
        ['6', 'VN-LD-2026-000006', 'Bắp Sú Đà Lạt B1', 'Bắp sú', '4.100 m²', 'Xanh (0)'],
      ],
      [5, 19, 24, 16, 14, 12]
    ),
    gap(),

    h2('5.2. Chủ hộ & Thổ nhưỡng (mẫu)'),
    tbl(
      ['Trường', 'Lô 000001', 'Lô 000003'],
      [
        ['Chủ hộ', "K'Brông", 'Phạm Văn Hoàng'],
        ['SĐT', '0977 412 550', '0918 667 234'],
        ['HTX', 'HTX Cà Phê Cầu Đất Farm', 'HTX Dâu Tây Trại Mát'],
        ['Cao độ / Dốc', '1.540m / 16.5°', '1.480m / 8.2°'],
        ['Loại đất', 'Đất đỏ Bazan', 'Đất phù sa nhẹ'],
        ['pH / Mùn', '5.8 / 4.2% (Cao)', '6.2 / 3.5% (TB)'],
      ],
      [22, 39, 39]
    ),
    gap(),

    h2('5.3. Lịch sử mùa vụ (mẫu — Lô 000001)'),
    tbl(
      ['Vụ mùa', 'Cây trồng', 'Thời gian', 'Sản lượng', 'Đang canh tác?'],
      [
        ['Vụ Mùa 2026', 'Cà phê Arabica', '01/2026 → Hiện tại', '4.500 kg', '✅ Có'],
        ['Vụ Luân Canh 2025', 'Đậu cô ve & Cỏ Vetiver', '05/2025 → 11/2025', '2.100 kg', 'Không'],
      ],
      [18, 22, 22, 14, 14]
    ),
    gap(),

    h2('5.4. Phiếu xuất kho BATCH (mẫu)'),
    tbl(
      ['Mã BATCH', 'Lô PUC', 'Sản lượng', 'Nông sản', 'Điểm đến'],
      [
        ['BATCH-VNLD-20260801-001', '000001', '800 kg', 'Cà phê nhân xanh', 'Cty XNK Đà Lạt Coffee'],
        ['BATCH-VNLD-20260715-001', '000002', '350 kg', 'Rau cải hữu cơ', 'Co.opmart Đà Lạt'],
        ['BATCH-VNLD-20260720-001', '000003', '120 kg', 'Dâu tây tươi', 'BachHoa Xanh'],
      ],
      [25, 10, 12, 20, 23]
    ),
    gap(),

    h2('5.5. Cảnh báo dịch bệnh AI (mẫu)'),
    tbl(
      ['Lô PUC', 'Bệnh', 'Confidence', 'Risk', 'Vùng đệm 500m'],
      [
        ['000003', 'Thán thư dâu tây (Anthracnose)', '94%', 'Risk 2 — Đỏ', '→ 000004 nâng Risk 1'],
      ],
      [12, 30, 13, 17, 28]
    ),
  ];
}

// ────────────────────── BUILD & EXPORT ──────────────────────

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: FONT, size: SZ },
        paragraph: { spacing: { line: 340 } },
      },
    },
  },
  sections: [{
    properties: {
      page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1080 } },
    },
    children: [
      ...sec1(),
      ...sec2(),
      ...sec3(),
      ...sec4(),
      ...sec5(),
    ],
  }],
});

const buf = await Packer.toBuffer(doc);
writeFileSync(OUTPUT, buf);
console.log(`✅ Đã tạo: ${OUTPUT}`);
console.log(`   Kích thước: ${(buf.byteLength / 1024).toFixed(1)} KB`);
