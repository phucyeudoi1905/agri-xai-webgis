/**
 * generate_khao_sat_docx.mjs
 * ──────────────────────────────────────────────────────────
 * Sinh file BÁO CÁO KHẢO SÁT 5 hệ thống WebGIS mã nguồn mở
 *
 * Chạy: node scripts/generate_khao_sat_docx.mjs
 * Output: docs/BAO_CAO_KHAO_SAT_WEBGIS.docx
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
  Header,
  Footer,
  PageNumber,
  PageOrientation,
  VerticalAlign,
} from 'docx';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(__dirname, '..', 'docs', 'BAO_CAO_KHAO_SAT_WEBGIS.docx');

const FONT = 'Times New Roman';
const SZ = 26; // 13pt
const SZ_SM = 22; // 11pt
const SZ_XS = 16; // 8pt — bảng so sánh nhiều cột
const C1 = '1B5E20';
const C2 = '2E7D32';
const HDR_BG = '2E7D32';
const HDR_FG = 'FFFFFF';
const ALT_ROW = 'F1F8E9';
const HL_COL = 'E8F5E9';
const CODE_BG = 'F5F5F5';

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
    alignment: opts.align || AlignmentType.JUSTIFIED,
    indent: opts.indent ? { firstLine: 600 } : undefined,
    children: [
      new TextRun({
        text,
        font: FONT,
        size: opts.size || SZ,
        bold: !!opts.bold,
        italics: !!opts.italic,
        color: opts.color || '212121',
      }),
    ],
  });
}
function mixed(parts, opts = {}) {
  return new Paragraph({
    spacing: { after: 100, line: 340 },
    alignment: opts.align || AlignmentType.JUSTIFIED,
    indent: opts.indent ? { firstLine: 600 } : undefined,
    children: parts.map((part) =>
      typeof part === 'string'
        ? new TextRun({ text: part, font: FONT, size: SZ })
        : new TextRun({ text: part.text, font: FONT, size: SZ, bold: !!part.bold, italics: !!part.italic }),
    ),
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
function num(n, text) {
  return new Paragraph({
    spacing: { after: 80, line: 320 },
    indent: { left: 400 },
    children: [
      new TextRun({ text: `${n}. `, font: FONT, size: SZ, bold: true }),
      new TextRun({ text, font: FONT, size: SZ }),
    ],
  });
}
function gap() {
  return new Paragraph({ spacing: { after: 40 } });
}
function pb() {
  return new Paragraph({ children: [new PageBreak()] });
}
function caption(text) {
  return new Paragraph({
    spacing: { before: 40, after: 120 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, font: FONT, size: 20, italics: true, color: '616161' })],
  });
}

const BD = { style: BorderStyle.SINGLE, size: 1, color: 'BDBDBD' };
const BS = { top: BD, bottom: BD, left: BD, right: BD };

function hc(text, w, opts = {}) {
  return new TableCell({
    width: { size: w, type: WidthType.PERCENTAGE },
    borders: BS,
    verticalAlign: VerticalAlign.CENTER,
    shading: { type: ShadingType.SOLID, fill: HDR_BG, color: HDR_BG },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 50, after: 50 },
        children: [new TextRun({ text, font: FONT, size: opts.size || SZ_SM, bold: true, color: HDR_FG })],
      }),
    ],
  });
}
function dc(text, w, opts = {}) {
  return new TableCell({
    width: { size: w, type: WidthType.PERCENTAGE },
    borders: BS,
    verticalAlign: VerticalAlign.CENTER,
    shading: opts.bg ? { type: ShadingType.SOLID, fill: opts.bg, color: opts.bg } : undefined,
    children: [
      new Paragraph({
        alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { before: 30, after: 30 },
        children: [
          new TextRun({
            text,
            font: FONT,
            size: opts.size || SZ_SM,
            bold: !!opts.bold,
            color: opts.color || '212121',
          }),
        ],
      }),
    ],
  });
}
function tbl(headers, rows, cw, opts = {}) {
  const sz = opts.size || SZ_SM;
  const centerCols = opts.centerCols || [];
  const highlightCol = opts.highlightCol;
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) => hc(h, cw[i], { size: sz })),
      }),
      ...rows.map((r, ri) =>
        new TableRow({
          children: r.map((c, ci) =>
            dc(c, cw[ci], {
              bg: ci === highlightCol ? HL_COL : ri % 2 === 1 ? ALT_ROW : undefined,
              center: centerCols.includes(ci),
              size: sz,
              bold: ci === highlightCol || (opts.boldCols || []).includes(ci),
            }),
          ),
        }),
      ),
    ],
  });
}
function codeBlock(lines) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: BS,
            shading: { type: ShadingType.SOLID, fill: CODE_BG, color: CODE_BG },
            children: lines.map(
              (line) =>
                new Paragraph({
                  spacing: { after: 0, line: 276 },
                  children: [new TextRun({ text: line || ' ', font: 'Consolas', size: 20 })],
                }),
            ),
          }),
        ],
      }),
    ],
  });
}

function headerFooter() {
  return {
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: 'Agri-XAI Web GIS  ·  Báo cáo khảo sát WebGIS mã nguồn mở',
                font: FONT,
                size: 18,
                italics: true,
                color: '757575',
              }),
            ],
          }),
        ],
      }),
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'Nhóm 2  ·  Trang ', font: FONT, size: 18, color: '757575' }),
              new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: '757575' }),
            ],
          }),
        ],
      }),
    },
  };
}

// ────────────────────── TITLE ──────────────────────

function secTitle() {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 80 },
      children: [new TextRun({ text: 'BÁO CÁO KHẢO SÁT', font: FONT, size: 48, bold: true, color: C1 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 280 },
      children: [
        new TextRun({
          text: '5 HỆ THỐNG WEBGIS MÃ NGUỒN MỞ TRÊN MẠNG / GITHUB',
          font: FONT,
          size: 32,
          bold: true,
          color: C2,
        }),
      ],
    }),
    tbl(
      ['Hạng mục', 'Nội dung'],
      [
        ['Dự án', 'Agri-XAI Web GIS — Nền tảng bản đồ số quản lý vùng trồng & chuỗi cung ứng nông nghiệp Farm-to-Fork (Nhóm 2)'],
        ['Mục đích', 'Khảo sát hiện trạng các hệ thống WebGIS công khai, rút ra bài học kiến trúc và định vị khác biệt của dự án'],
        ['Nguồn', 'GitHub, tài liệu chính thức, demo trực tuyến'],
        ['Thời điểm khảo sát', 'Tháng 9/2026'],
      ],
      [22, 78],
      { centerCols: [] },
    ),
    gap(),
    mixed(
      [
        { text: 'Ghi chú trình bày với giảng viên: ', bold: true },
        'Mục 1.3 báo cáo kỹ thuật đối chiếu với sản phẩm thương mại Việt Nam + ArcGIS (VNPT Check, vTrace, TraceVerified, ArcGIS, GeoServer). Báo cáo này khảo sát ',
        { text: '5 hệ mã nguồn mở trên GitHub', bold: true },
        ' — hai phần bổ sung nhau, không trùng.',
      ],
      { italic: false },
    ),
    p(
      'Năm hệ thống được chọn vì có mã nguồn công khai trên GitHub, demo/tài liệu chính thức, và đủ “nặng” để đối chiếu với Agri-XAI Web GIS (Leaflet/PostGIS, vùng trồng, Farm-to-Fork).',
      { indent: true },
    ),
  ];
}

// ────────────────────── 1. MỤC ĐÍCH ──────────────────────

function sec1() {
  return [
    h1('1. Mục đích và phạm vi khảo sát'),
    p('Trong đồ án WebGIS nông nghiệp, việc khảo sát các hệ thống đã tồn tại trên Internet là bước bắt buộc để:', {
      indent: true,
    }),
    num(
      1,
      'Xác định chuẩn công nghệ đang được cộng đồng GIS dùng (OGC, PostGIS, Leaflet/OpenLayers, QGIS Server, GeoServer).',
    ),
    num(
      2,
      'Phân biệt nền tảng WebGIS tổng quát (xuất bản bản đồ, SDI) với WebGIS chuyên ngành nông nghiệp (nhật ký canh tác, ranh giới thửa, chỉ số thực vật).',
    ),
    num(
      3,
      'Chỉ ra khoảng trống mà Agri-XAI Web GIS giải quyết: mã PUC gắn Polygon, webhook AI dịch bệnh, khoanh vùng đệm 500 m (ST_DWithin), truy xuất QR Farm-to-Fork.',
    ),
    gap(),
    h2('1.1. Tiêu chí chọn 5 hệ thống'),
    tbl(
      ['#', 'Tiêu chí', 'Lý do'],
      [
        ['1', 'Có repository GitHub công khai', 'Có thể kiểm chứng kiến trúc, giấy phép, stack'],
        ['2', 'Có demo hoặc tài liệu triển khai', 'Không chỉ “bài tập nhỏ”, đủ dùng làm đối sánh'],
        ['3', 'Liên quan PostGIS / bản đồ web / nông nghiệp', 'Sát stack và nghiệp vụ nhóm'],
        ['4', 'Đại diện 2 nhóm: WebGIS tổng quát + WebGIS nông nghiệp', 'Tránh khảo sát lệch (chỉ GIS thuần hoặc chỉ tem QR)'],
      ],
      [8, 38, 54],
      { centerCols: [0] },
    ),
    caption('Bảng 1. Tiêu chí chọn hệ thống khảo sát'),
    h2('1.2. Năm hệ thống được khảo sát'),
    tbl(
      ['STT', 'Hệ thống', 'Nhóm', 'GitHub', 'Demo / trang chủ'],
      [
        ['1', 'GeoNode', 'WebGIS / SDI (OSGeo)', 'github.com/GeoNode/geonode (~1.700★)', 'geonode.org, demo.geonode.org'],
        ['2', 'MapStore2', 'Web mapping framework', 'github.com/geosolutions-it/MapStore2 (~650★)', 'mapstore.geosolutionsgroup.com'],
        ['3', 'Lizmap Web Client', 'Xuất bản dự án QGIS ra Web', 'github.com/3liz/lizmap-web-client (~330★)', 'demo.3liz.com'],
        ['4', 'farmOS', 'Quản lý nông trại + bản đồ', 'github.com/farmOS/farmOS (~1.290★)', 'farmos.org'],
        ['5', 'OpenFarm', 'Crop intelligence + WebGIS', 'github.com/superzero11/openfarm', 'openfarm.earth'],
      ],
      [7, 18, 22, 28, 25],
      { centerCols: [0] },
    ),
    caption('Bảng 2. Danh sách hệ thống khảo sát'),
    pb(),
  ];
}

// ────────────────────── 2. PHƯƠNG PHÁP ──────────────────────

function sec2() {
  return [
    h1('2. Phương pháp khảo sát'),
    p('Mỗi hệ thống được mô tả theo cùng một khung (để so sánh công bằng):', { indent: true }),
    num(1, 'Tổng quan & mục đích sử dụng'),
    num(2, 'Kiến trúc & công nghệ'),
    num(3, 'Chức năng GIS nổi bật'),
    num(4, 'Điểm mạnh / hạn chế (nhìn từ góc độ đồ án nông nghiệp Việt Nam)'),
    num(5, 'Bài học rút ra cho Agri-XAI Web GIS'),
  ];
}

// ────────────────────── 3. GEONODE ──────────────────────

function sec3() {
  return [
    h1('3. Hệ thống 1 — GeoNode (OSGeo)'),
    tbl(
      ['Hạng mục', 'Chi tiết'],
      [
        ['Nguồn', 'https://github.com/GeoNode/geonode'],
        ['Giấy phép', 'GPL (OSGeo Community Project)'],
        ['Vai trò', 'Hệ quản trị nội dung địa lý (Geospatial CMS) — xây dựng hạ tầng dữ liệu không gian (SDI), chia sẻ lớp bản đồ, metadata, quyền người dùng'],
      ],
      [22, 78],
      { centerCols: [] },
    ),
    gap(),
    h2('3.1. Tổng quan'),
    p(
      'GeoNode cho phép người không chuyên GIS vẫn tải lớp dữ liệu, tạo bản đồ tương tác, phân quyền (công khai / nhóm / riêng tư). Đây là nền tảng “cổng dữ liệu địa lý” hơn là một phần mềm nghiệp vụ nông nghiệp.',
      { indent: true },
    ),
    h2('3.2. Kiến trúc'),
    tbl(
      ['Tầng', 'Thành phần'],
      [
        ['Ứng dụng web', 'Django (Python) — người dùng, metadata, catalog'],
        ['Dịch vụ GIS', 'GeoServer — WMS, WFS, WCS, WMTS (chuẩn OGC)'],
        ['CSDL', 'PostgreSQL + PostGIS — vector + metadata'],
        ['Catalog', 'pycsw / CSW — tìm kiếm metadata'],
      ],
      [22, 78],
      { centerCols: [] },
    ),
    caption('Bảng 3. Kiến trúc GeoNode'),
    p(
      'Luồng điển hình: người dùng upload shapefile/GeoTIFF → GeoNode xử lý metadata → publish sang GeoServer → client xem bản đồ qua WMS/WFS.',
      { indent: true },
    ),
    h2('3.3. Điểm mạnh'),
    bl('Chuẩn OGC đầy đủ; liên thông với QGIS, ArcGIS, OpenLayers.'),
    bl('Phân quyền lớp dữ liệu, nhóm người dùng, catalog tìm kiếm.'),
    bl('Cộng đồng lớn, Docker chính thức, có trên OSGeo-Live.'),
    bl('Phù hợp cơ quan nhà nước / sở ban ngành cần cổng dữ liệu không gian.'),
    h2('3.4. Hạn chế so với đồ án'),
    bl('Không có sẵn nghiệp vụ nông nghiệp: mã PUC, BATCH, QR Farm-to-Fork, luân canh mùa vụ.'),
    bl('Không có webhook AI dịch bệnh hay ST_DWithin khoanh vùng đệm tự động.'),
    bl('Kiến trúc nặng (Django + GeoServer + PostGIS): vận hành phức tạp, không “may đo” cho HTX.'),
    bl('Giao diện thiên về catalog/lớp bản đồ, không phải dashboard vùng trồng.'),
    h2('3.5. Bài học'),
    p(
      'Nhóm nên học chuẩn dữ liệu (GeoJSON, WGS84, PostGIS) và tư duy phân quyền theo lớp/đối tượng. Không cần nhúng nguyên GeoServer nếu API NestJS + PostGIS đã đủ cho Polygon thửa đất và BBOX.',
      { indent: true },
    ),
  ];
}

// ────────────────────── 4. MAPSTORE2 ──────────────────────

function sec4() {
  return [
    h1('4. Hệ thống 2 — MapStore2 (GeoSolutions)'),
    tbl(
      ['Hạng mục', 'Chi tiết'],
      [
        ['Nguồn', 'https://github.com/geosolutions-it/MapStore2'],
        ['Giấy phép', 'Simplified BSD'],
        ['Vai trò', 'Framework tạo bản đồ, dashboard, geostory (2D/3D) trên web'],
      ],
      [22, 78],
      { centerCols: [] },
    ),
    gap(),
    h2('4.1. Tổng quan'),
    p(
      'MapStore2 là khung ứng dụng bản đồ web hiện đại: tạo map, dashboard KPI, câu chuyện bản đồ (geostory), hỗ trợ 3D (Cesium). Được dùng thực tế (ví dụ dịch vụ thủy văn vùng Tuscany, Ý).',
      { indent: true },
    ),
    h2('4.2. Kiến trúc'),
    tbl(
      ['Tầng', 'Thành phần'],
      [
        ['Frontend', 'ReactJS + OpenLayers / Leaflet / Cesium'],
        ['Chuẩn', 'WMS, WMTS, WFS, 3D Tiles, CSW'],
        ['Backend', 'GeoServer / MapStore backend (Java) — catalog, lưu map'],
        ['Mở rộng', 'Kiến trúc plugin — thêm công cụ phân tích, chỉnh sửa'],
      ],
      [22, 78],
      { centerCols: [] },
    ),
    caption('Bảng 4. Kiến trúc MapStore2'),
    h2('4.3. Điểm mạnh'),
    bl('UI web hiện đại, plugin hóa — gần với hướng React của nhóm hơn GeoNode.'),
    bl('Hỗ trợ nhiều nguồn lớp (OGC, GeoJSON, Cesium 3D).'),
    bl('Có sẵn công cụ đo, style lớp, phân tích không gian cơ bản.'),
    bl('Phù hợp xây cổng bản đồ đa ngành (quy hoạch, môi trường, thủy lợi).'),
    h2('4.4. Hạn chế'),
    bl('Vẫn là công cụ GIS tổng quát: không có PUC, tem QR, phiếu BATCH.'),
    bl('Phụ thuộc hệ sinh thái GeoServer/OGC; tích hợp AI realtime không phải chức năng lõi.'),
    bl('Học React plugin MapStore mất thời gian; không tối ưu cho một domain hẹp (HTX + ADMIN).'),
    h2('4.5. Bài học'),
    p(
      'Hướng React + bản đồ + dashboard của MapStore khớp với frontend nhóm (React + Leaflet). Nhóm đã đi đúng khi không dùng framework GIS khổng lồ, mà tự xây map-centric UI gắn nghiệp vụ (vẽ Polygon, đổi màu risk realtime).',
      { indent: true },
    ),
  ];
}

// ────────────────────── 5. LIZMAP ──────────────────────

function sec5() {
  return [
    h1('5. Hệ thống 3 — Lizmap Web Client (3Liz)'),
    tbl(
      ['Hạng mục', 'Chi tiết'],
      [
        ['Nguồn', 'https://github.com/3liz/lizmap-web-client'],
        ['Giấy phép', 'Mozilla Public License 2.0 (theo repo 3liz)'],
        ['Vai trò', 'Đưa dự án QGIS Desktop lên trình duyệt, giữ nguyên symbology và layout in'],
      ],
      [22, 78],
      { centerCols: [] },
    ),
    gap(),
    h2('5.1. Tổng quan'),
    p(
      'Quy trình: biên tập trong QGIS Desktop → cấu hình plugin Lizmap → đẩy project lên server có QGIS Server → người dùng xem/sửa trên web. Đây là mô hình “desktop-first, web second”, rất phổ biến ở châu Âu (hơn 12 năm phát triển).',
      { indent: true },
    ),
    h2('5.2. Kiến trúc'),
    tbl(
      ['Tầng', 'Thành phần'],
      [
        ['Biên tập', 'QGIS Desktop + plugin Lizmap'],
        ['Server GIS', 'QGIS Server (OGC: WMS/WFS)'],
        ['Web client', 'Lizmap (PHP / Jelix) — proxy tới QGIS Server'],
        ['CSDL', 'PostgreSQL/PostGIS (lớp chỉnh sửa online)'],
        ['Tính năng', 'Editing form, in atlas PDF, dataviz, filter không gian, chạy Processing QGIS trên web'],
      ],
      [22, 78],
      { centerCols: [] },
    ),
    caption('Bảng 5. Kiến trúc Lizmap Web Client'),
    h2('5.3. Điểm mạnh'),
    bl('Trung thành với QGIS: màu sắc, nhãn, layout in PDF gần như desktop.'),
    bl('Chỉnh sửa lớp PostGIS trên web, phân quyền theo repository/project/lớp.'),
    bl('In ấn, biểu đồ, quan hệ 1-n — phù hợp cơ quan địa chính / nông nghiệp đã có sẵn dự án QGIS.'),
    h2('5.4. Hạn chế'),
    bl('Phụ thuộc QGIS Desktop + QGIS Server — không phải stack NestJS/React độc lập.'),
    bl('Nghiệp vụ nông nghiệp phải tự thiết kế lớp trong QGIS; không có sẵn mã vùng trồng Việt Nam.'),
    bl('Khó gắn Socket.io realtime và webhook AI như đồ án.'),
    bl('Người dùng HTX phải biết (hoặc nhờ kỹ thuật viên) cấu hình QGIS — rào cản cao.'),
    h2('5.5. Bài học'),
    p(
      'Lizmap giỏi xuất bản bản đồ đã thiết kế. Đồ án nhóm ngược lại: ứng dụng nghiệp vụ có bản đồ (vẽ thửa, cấp PUC, cảnh báo dịch). Nếu sau này cần in hồ sơ kỹ thuật đẹp (VietGAP), có thể học cách Lizmap dùng print layout — nhóm đã có xuất PDF hồ sơ thửa.',
      { indent: true },
    ),
  ];
}

// ────────────────────── 6. FARMOS ──────────────────────

function sec6() {
  return [
    h1('6. Hệ thống 4 — farmOS'),
    tbl(
      ['Hạng mục', 'Chi tiết'],
      [
        ['Nguồn', 'https://github.com/farmOS/farmOS'],
        ['Giấy phép', 'GPL-2.0'],
        ['Vai trò', 'Phần mềm ghi chép nông trại (farm record keeping) trên web, có module bản đồ'],
      ],
      [22, 78],
      { centerCols: [] },
    ),
    gap(),
    h2('6.1. Tổng quan'),
    p(
      'farmOS do cộng đồng nông dân – lập trình viên – nhà nghiên cứu phát triển từ khoảng 2014. Đây là FMIS (Farm Management Information System): tài sản (đất, cây, vật nuôi, máy), nhật ký (gieo, bón, thu hoạch), cảm biến — bản đồ là một module, không phải toàn bộ sản phẩm.',
      { indent: true },
    ),
    p(
      'Thư viện farmOS-map (github.com/farmOS/farmOS-map) dựa trên OpenLayers: vẽ/sửa geometry, lớp vector, popup.',
      { indent: true },
    ),
    h2('6.2. Kiến trúc'),
    tbl(
      ['Tầng', 'Thành phần'],
      [
        ['Ứng dụng', 'Drupal (PHP) — entity Asset, Log, Plan'],
        ['Bản đồ', 'OpenLayers qua farmOS-map; geometry thường WKT'],
        ['CSDL', 'PostgreSQL (có thể kèm PostGIS tùy triển khai)'],
        ['API', 'REST JSON:API (Drupal) — tích hợp cảm biến, app khảo sát'],
      ],
      [22, 78],
      { centerCols: [] },
    ),
    caption('Bảng 6. Kiến trúc farmOS'),
    p(
      'Chức năng GIS: vẽ ranh giới khu vực/luống, gắn log vào vị trí, lớp cluster tài sản trên dashboard.',
      { indent: true },
    ),
    h2('6.3. Điểm mạnh'),
    bl('Nghiệp vụ nông nghiệp thực tế: nhật ký, mùa vụ, đất, cảm biến — gần “luân canh / growth history” của nhóm.'),
    bl('Cộng đồng lâu năm, giấy phép tự do, tự host.'),
    bl('Bản đồ phục vụ ghi chép tại thửa, không chỉ trưng bày lớp WMS.'),
    h2('6.4. Hạn chế'),
    bl('Drupal nặng; stack không trùng NestJS + React của nhóm.'),
    bl('GIS không phải thế mạnh lõi: không nhấn topology (ST_Intersects chống đè lấn), BBOX viewport, vùng đệm dịch tễ.'),
    bl('Không có mã PUC Việt Nam, cổng tra cứu QR cho người tiêu dùng, hay AI bệnh cây realtime.'),
    bl('Định hướng “trang trại / nghiên cứu”, không phải “cơ quan quản lý vùng trồng + HTX + người mua”.'),
    h2('6.5. Bài học'),
    mixed(
      [
        'farmOS xác nhận: WebGIS nông nghiệp phải gắn nhật ký canh tác với hình học thửa. Nhóm đã làm đúng khi plots + growth_status_history + BATCH. Điểm vượt farmOS: ',
        { text: 'PostGIS topology + PUC + AI buffer 500 m + cổng /trace.', bold: true },
      ],
      { indent: true },
    ),
  ];
}

// ────────────────────── 7. OPENFARM ──────────────────────

function sec7() {
  return [
    h1('7. Hệ thống 5 — OpenFarm (Crop Intelligence Platform)'),
    tbl(
      ['Hạng mục', 'Chi tiết'],
      [
        ['Nguồn', 'https://github.com/superzero11/openfarm'],
        ['Demo', 'https://openfarm.earth'],
        ['Giấy phép', 'BSD-3-Clause'],
      ],
      [22, 78],
      { centerCols: [] },
    ),
    gap(),
    h2('7.1. Tổng quan'),
    p(
      'OpenFarm là nền tảng tự host, kết hợp vệ tinh – thời tiết – thổ nhưỡng để giải thích “ruộng đang thế nào và vì sao”. Gần với hướng nông nghiệp chính xác + XAI hơn GeoNode/Lizmap.',
      { indent: true },
    ),
    h2('7.2. Kiến trúc'),
    codeBlock([
      'Next.js 14 + MapLibre + ECharts',
      '        ↕',
      'FastAPI + Celery + JWT / RBAC',
      '        ↕',
      'PostgreSQL/PostGIS + Redis + MinIO',
      '        ↕',
      'TiTiler (tile COG Sentinel-2) + STAC (Element84)',
    ]),
    caption('Hình 1. Stack OpenFarm'),
    bl('Geometry: MultiPolygon EPSG:4326; tính diện tích tự động.'),
    bl('RBAC: owner / admin / member / viewer.'),
    bl('Chỉ số: NDVI, EVI, SAVI, NDWI từ Sentinel-2; NDVI lịch sử 24 tháng.'),
    bl('ML: phát hiện ranh giới ruộng (FTW); SoilGrids / POLARIS; GDD, hạn hán.'),
    h2('7.3. Điểm mạnh'),
    bl('Stack hiện đại (Docker, API-first, JWT) — gần Agri-XAI hơn Django + GeoServer.'),
    bl('Giải thích được (explainability): cảnh báo kết hợp NDVI + thời tiết + đất — cùng tinh thần XAI.'),
    bl('Bản đồ vector (MapLibre, PMTiles) không phụ thuộc token Mapbox.'),
    bl('Có vẽ/upload GeoJSON/KML, chia sẻ báo cáo sức khỏe ruộng (link read-only).'),
    h2('7.4. Hạn chế'),
    bl('Cộng đồng còn nhỏ (repo mới); chưa phải chuẩn OSGeo.'),
    bl('Tập trung viễn thám / chỉ số thực vật, không có chuỗi PUC–BATCH–QR người tiêu dùng.'),
    bl('Không có cảnh báo dịch từ mô hình thị giác (YOLOv8/drone) hay buffer 500 m theo ổ dịch.'),
    bl('Phụ thuộc Sentinel-2/STAC — khác pipeline webhook AI của nhóm 3.'),
    h2('7.5. Bài học'),
    p(
      'OpenFarm là đối sánh gần nhất về “nông nghiệp + bản đồ + AI giải thích”. Roadmap nhóm (T22 vector tiles, T24 IoT vi khí hậu) có thể học cách họ tách Tiler / object storage / PostGIS. Phần đồ án đã có mà OpenFarm không có: định danh PUC quốc gia, chống đè lấn, truy xuất tem QR, khoanh vùng dịch tễ realtime.',
      { indent: true },
    ),
  ];
}

// ────────────────────── 8. BẢNG SO SÁNH ──────────────────────

function sec8() {
  return [
    h1('8. Bảng so sánh tổng hợp'),
    p('Ký hiệu: ✅ có sẵn  |  ⚠️ một phần / phải tự cấu hình  |  ❌ không nhằm mục đích đó', { italic: true }),
    gap(),
    tbl(
      ['Tiêu chí', 'GeoNode', 'MapStore2', 'Lizmap', 'farmOS', 'OpenFarm', 'Agri-XAI Web GIS'],
      [
        ['Mã nguồn GitHub', '✅ OSGeo', '✅ GeoSolutions', '✅ 3Liz', '✅ farmOS', '✅ superzero11', '✅ Nhóm 2'],
        ['Stack chính', 'Django + GeoServer + PostGIS', 'React + OL/Leaflet + GeoServer', 'PHP + QGIS Server', 'Drupal + OpenLayers', 'Next.js + FastAPI + PostGIS', 'NestJS + React + Leaflet + PostGIS'],
        ['Chuẩn OGC (WMS/WFS)', '✅', '✅', '✅', '⚠️', '⚠️', '⚠️ GeoJSON/BBOX (đủ cho domain)'],
        ['Vẽ Polygon thửa đất', '⚠️ editing WFS', '⚠️ plugin', '✅ QGIS forms', '✅ farmOS-map', '✅ GeoJSON/KML', '✅ Leaflet-Geoman + sổ đỏ'],
        ['Chống đè lấn topology', '⚠️', '⚠️', '⚠️', '❌', '❌', '✅ ST_Intersects'],
        ['Viewport BBOX / tiles', 'WMS tiles', '✅', 'WMS', '⚠️', 'PMTiles/COG', '✅ /plots/bbox + debounce'],
        ['Nhật ký canh tác', '❌', '❌', '⚠️ tự thiết kế lớp', '✅ Asset/Log', '⚠️ scouting', '✅ Crop history + luân canh'],
        ['Mã PUC / BATCH / QR', '❌', '❌', '❌', '❌', '❌', '✅ Gắn Polygon'],
        ['AI dịch bệnh realtime', '❌', '❌', '❌', '❌', '⚠️ anomaly NDVI', '✅ Webhook + WebSocket'],
        ['Vùng đệm dịch tễ 500 m', '❌', '⚠️ geoprocess', '⚠️ Processing', '❌', '❌', '✅ ST_DWithin tự động'],
        ['Cổng tra cứu NTD', 'Catalog SDI', 'Embed map', '⚠️', '❌', 'Share report', '✅ /trace, /puc/:puc'],
        ['Chi phí bản quyền', 'Mở (vận hành nặng)', 'Mở', 'Mở', 'Mở', 'Mở', 'Mở, Docker tinh gọn'],
        ['Phù hợp HTX VN “cài là dùng”', 'Thấp', 'Trung bình', 'Thấp (cần QGIS)', 'Trung bình', 'Trung bình', 'Cao (2 role ADMIN/HTX)'],
      ],
      [16, 14, 14, 13, 13, 14, 16],
      { size: SZ_XS, centerCols: [], highlightCol: 6 },
    ),
    caption('Bảng 7. So sánh 5 hệ thống mã nguồn mở với Agri-XAI Web GIS (cột tô đậm = đồ án nhóm)'),
  ];
}

// ────────────────────── 9. NHẬN XÉT ──────────────────────

function sec9() {
  return [
    h1('9. Nhận xét chung và định vị dự án'),
    h2('9.1. Hai họ WebGIS trên GitHub'),
    mixed([
      { text: 'Họ A — Nền tảng GIS tổng quát (GeoNode, MapStore2, Lizmap). ', bold: true },
      'Mạnh về xuất bản lớp, chuẩn OGC, catalog, in ấn. Yếu về chuỗi cung ứng nông sản và phản ứng sự cố không gian tự động. Muốn dùng cho vùng trồng thì phải tự mô hình hóa 100% schema PUC, BATCH, dịch bệnh.',
    ]),
    mixed([
      { text: 'Họ B — Ứng dụng nông nghiệp có bản đồ (farmOS, OpenFarm). ', bold: true },
      'Mạnh về nhật ký ruộng hoặc chỉ số vệ tinh. GIS thường dừng ở vẽ ranh giới + xem lớp, chưa thành hệ thống quản lý vùng trồng cấp tỉnh (duyệt PUC, chống mạo danh tọa độ, khoanh vùng dập dịch).',
    ]),
    h2('9.2. Khoảng trống mà Agri-XAI Web GIS lấp'),
    p('Không hệ thống nào trong 5 hệ trên đồng thời có:', { indent: true }),
    num(1, 'Polygon thửa chuẩn WGS84 + chặn chồng lấn ST_Intersects'),
    num(2, 'Cấp mã PUC dạng VN-[Tỉnh]-[Năm]-… gắn hình học'),
    num(3, 'Webhook AI + WebSocket đổi màu bản đồ < 500 ms'),
    num(4, 'Vùng đệm 500 m khi Risk = 2'),
    num(5, 'Tem QR / BATCH và cổng không cần đăng nhập cho người tiêu dùng'),
    p(
      'Đó là lý do đồ án không fork GeoNode/Lizmap, mà xây Clean Architecture NestJS + PostGIS may đo Farm-to-Fork.',
      { indent: true },
    ),
    h2('9.3. Hướng có thể học thêm (không sao chép nguyên khối)'),
    tbl(
      ['Từ hệ thống', 'Có thể học'],
      [
        ['GeoNode', 'Catalog metadata lớp, phân quyền tài nguyên'],
        ['MapStore2', 'Plugin dashboard, 3D/Cesium nếu mở rộng'],
        ['Lizmap', 'Print layout / atlas PDF hồ sơ thửa'],
        ['farmOS', 'Mô hình Asset–Log (đất ↔ nhật ký)'],
        ['OpenFarm', 'Vector tiles / TiTiler, NDVI Sentinel-2, explainability'],
      ],
      [22, 78],
      { centerCols: [] },
    ),
    caption('Bảng 8. Bài học có thể áp dụng (không fork nguyên khối)'),
  ];
}

// ────────────────────── 10. KẾT LUẬN ──────────────────────

function sec10() {
  return [
    h1('10. Kết luận'),
    p('Khảo sát 5 hệ thống WebGIS công khai trên GitHub cho thấy:', { indent: true }),
    num(
      1,
      'WebGIS tổng quát (GeoNode, MapStore, Lizmap) đủ mạnh để làm cổng bản đồ, nhưng không thay được phần mềm quản lý vùng trồng – truy xuất nguồn gốc.',
    ),
    num(
      2,
      'WebGIS nông nghiệp (farmOS, OpenFarm) gần nghiệp vụ hơn, nhưng thiếu định danh không gian quốc gia (PUC), topology địa chính, và phản ứng dịch tễ realtime.',
    ),
    num(
      3,
      'Agri-XAI Web GIS đứng ở giao điểm: GIS đúng chuẩn PostGIS và nghiệp vụ nông nghiệp Việt Nam (HTX, PUC, BATCH, QR, AI dịch hại).',
    ),
    p(
      'Việc tự phát triển trên NestJS + React + Leaflet + PostGIS là hợp lý: tận dụng bài học cộng đồng mã nguồn mở, đồng thời tránh phụ thuộc GeoServer/QGIS Server khi bài toán lõi là thửa đất – mã vùng trồng – chuỗi cung ứng – cảnh báo AI.',
      { indent: true },
    ),
  ];
}

// ────────────────────── TÀI LIỆU ──────────────────────

function secRefs() {
  return [
    h1('Tài liệu tham khảo'),
    num(1, 'GeoNode. GeoNode — Open source geospatial CMS. GitHub: https://github.com/GeoNode/geonode ; https://geonode.org'),
    num(2, 'GeoSolutions. MapStore2. GitHub: https://github.com/geosolutions-it/MapStore2'),
    num(3, '3Liz. Lizmap Web Client. GitHub: https://github.com/3liz/lizmap-web-client ; https://demo.3liz.com'),
    num(4, 'farmOS. farmOS: web-based farm record keeping. https://github.com/farmOS/farmOS ; https://farmos.org'),
    num(5, 'farmOS. Maps module / farmOS-map (OpenLayers). https://farmos.org/development/module/maps/'),
    num(6, 'OpenFarm. Open Intelligence for Every Farm. https://github.com/superzero11/openfarm ; https://openfarm.earth'),
    num(7, 'Open Source Geospatial Foundation. OSGeo Community Projects. https://www.osgeo.org'),
  ];
}

// ────────────────────── BUILD ──────────────────────

const pageMargin = { top: 1134, bottom: 1134, left: 1134, right: 851 };
const hf = headerFooter();

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: FONT, size: SZ },
        paragraph: { spacing: { line: 340 } },
      },
    },
  },
  sections: [
    {
      properties: {
        page: { margin: pageMargin },
      },
      ...hf,
      children: [
        ...secTitle(),
        ...sec1(),
        ...sec2(),
        ...sec3(),
        ...sec4(),
        ...sec5(),
        ...sec6(),
        ...sec7(),
      ],
    },
    {
      properties: {
        page: {
          size: { orientation: PageOrientation.LANDSCAPE },
          margin: { top: 851, bottom: 851, left: 851, right: 851 },
        },
      },
      ...hf,
      children: [...sec8()],
    },
    {
      properties: {
        page: { margin: pageMargin },
      },
      ...hf,
      children: [...sec9(), ...sec10(), ...secRefs()],
    },
  ],
});

const buf = await Packer.toBuffer(doc);
writeFileSync(OUTPUT, buf);
console.log(`✅ Đã tạo: ${OUTPUT}`);
console.log(`   Kích thước: ${(buf.byteLength / 1024).toFixed(1)} KB`);
