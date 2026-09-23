# PROMPT XUẤT BÁO CÁO DỰ ÁN AGRI-XAI WEB GIS
## Kiến trúc hệ thống · Sơ đồ Use Case · Workflow

> **Cách dùng:** Copy toàn bộ khối `PROMPT BẮT ĐẦU` → `PROMPT KẾT THÚC` rồi dán vào ChatGPT / Claude / Gemini / Copilot.  
> Nếu AI giới hạn độ dài: gửi **Phần A + B** trước, sau đó lần lượt **Phần C, D, E**.  
> Yêu cầu AI vẽ sơ đồ bằng **Mermaid** (render được trong Markdown / GitHub / Notion / Word qua plugin).

---

````markdown
PROMPT BẮT ĐẦU

# VAI TRÒ
Bạn là kiến trúc sư phần mềm + chuyên gia GIS + chuyên gia UML, đồng thời là người viết báo cáo đồ án tốt nghiệp / báo cáo kỹ thuật cấp hội đồng khoa học bằng **Tiếng Việt học thuật, mạch lạc, không sáo rỗng**.

Nhiệm vụ: viết **BÁO CÁO KỸ THUẬT TOÀN DIỆN** cho dự án **Agri-XAI Web GIS (Nhóm 2)** — Nền tảng bản đồ số quản lý vùng trồng và truy xuất nguồn gốc nông nghiệp Farm-to-Fork.

# RÀNG BUỘC BẮT BUỘC
1. Chỉ dùng **sự thật kỹ thuật** trong phần "NGUỒN SỰ THẬT" bên dưới. Không bịa tính năng, API, bảng CSDL, actor, hay công nghệ ngoài danh sách.
2. Phân biệt rõ: **đã triển khai (MVP + advanced)** vs **roadmap (stub/spec)**. Không viết roadmap như đã xong.
3. Mọi sơ đồ phải là **Mermaid hợp lệ**, có tiêu đề, chú thích ngắn ngay dưới sơ đồ.
4. Mỗi Use Case phải có: mã UC, tên, actor, tiền điều kiện, luồng chính, luồng phụ/lỗi, hậu điều kiện, API liên quan.
5. Mỗi Workflow phải có: mục tiêu, actor, trigger, các bước, điểm quyết định, dữ liệu vào/ra, lỗi chuẩn.
6. Không dùng 3 role Admin / HTX / Nông dân tách rời. RBAC nội bộ chỉ **2 role**: `ADMIN` và `HTX_FARMER`. Người tiêu dùng là **public zero-auth**, không thuộc RBAC.
7. Nhóm 2 = Web GIS này. Nhóm 3 = AI Vision (YOLOv8/Drone) gửi webhook. Nhóm 1 trong tài liệu tích hợp đôi khi gọi AgriGIS — trong báo cáo này **Nhóm 2 là chủ thể Web GIS**. Nêu rõ ranh giới 3 nhóm theo hợp đồng tích hợp.
8. Văn phong: báo cáo hội đồng (mục lục, đánh số mục, bảng, kết luận). Không viết kiểu blog, không emoji rải rác trong đoạn văn (chỉ dùng trong Mermaid nếu cần phân biệt node).
9. Xuất **Markdown đầy đủ**, sẵn sàng chuyển Word. Công thức mã PUC/BATCH viết rõ bằng text + ví dụ.
10. Nếu thiếu dữ liệu: ghi **[Cần xác nhận]** chứ không bịa.

# ĐỊNH DẠNG ĐẦU RA
- Tiêu đề, thông tin dự án, mục lục.
- Hình (Mermaid) + bảng + đoạn phân tích.
- Sau mỗi sơ đồ: 1 đoạn **giải thích sơ đồ** (5–10 câu) và 1 bảng **ánh xạ node → module/file/API** nếu là sơ đồ kiến trúc.
- Cuối báo cáo: phụ lục thuật ngữ, danh mục sơ đồ, danh mục bảng.

# CẤU TRÚC BÁO CÁO BẮT BUỘC (đừng bỏ mục)

## Phần 0. Thông tin tài liệu
- Tên dự án, phân hệ, phiên bản, ngày, phạm vi, đối tượng đọc.
- Chú thích: đây là phân hệ Web GIS (Nhóm 2) trong hệ sinh thái Agri-XAI 3 nhóm.

## Phần 1. Tổng quan & mục tiêu
- Bối cảnh nông nghiệp số Việt Nam, EUDR, mã vùng trồng PUC, Farm-to-Fork.
- 4 điểm nghẽn hiện trạng (thiếu polygon địa chính, gian lận PUC, dịch hại thụ động, đứt gãy truy xuất).
- Mục tiêu tổng quát + mục tiêu kỹ thuật đo được.
- Phạm vi: Lâm Đồng / Đà Lạt / Cầu Đất; cà phê Arabica, rau ôn đới.
- Case study HTX Nông sản Cao cấp Cầu Đất (45 hộ, 65 ha) — kể 4 bước vận hành, không bịa số liệu ngoài nguồn sự thật.
- So sánh ngắn với VNPT Check, Viettel vTrace, TraceVerified, ArcGIS Online, QGIS/GeoServer — chỉ nêu khác biệt cốt lõi GIS polygon + AI buffer + BATCH, không viết marketing.

## Phần 2. Kiến trúc hệ thống (TRỌNG TÂM — viết rất chi tiết)

Phải có **tối thiểu 8 sơ đồ kiến trúc** sau, mỗi cái một mục riêng:

### 2.1. Sơ đồ ngữ cảnh hệ thống (System Context / C4 Level 1)
Actors bên ngoài ↔ hệ thống Agri-XAI Web GIS ↔ hệ thống ngoài (AI Nhóm 3, Nhóm Canh tác, người tiêu dùng, PostGIS).

### 2.2. Sơ đồ kiến trúc đa tầng (Layered Architecture)
4 tầng:
- Client: React 18 + Vite + Leaflet + Leaflet-Geoman + Socket.io-client
- Gateway: Nginx reverse proxy, TLS, CORS, ApiKeyGuard, Throttler (~100–120 req/phút)
- Service: NestJS Clean Architecture (Controller / Service / Repository / DTO / Gateway)
- Data: PostgreSQL 16 + PostGIS 3.3, volume QR `/storage/qr`

Liệt kê đúng module backend:
- PlotController, ShippingController, AlertController, ClimateController, HealthController
- PlotService, PucGeneratorService, ReportService, WeatherService, PlotRepository
- RiskGateway (Socket.io namespace `/gis`, event `risk.updated`)
- Guards: ApiKeyGuard + ThrottlerGuard; Interceptor: X-Request-Id

Liệt kê đúng màn hình frontend:
- `/` Dashboard, `/map` Bản đồ, `/plots` Danh sách lô, `/trace` Tra cứu nội bộ
- `/puc/:puc` Cổng public (không AppShell)

### 2.3. Sơ đồ thành phần (Component Diagram) gis-service
Controller → Service → Repository → Entity/PostGIS.
Nhấn mạnh: PlotService là trung tâm; Alert đi qua PlotService rồi RiskGateway.

### 2.4. Sơ đồ triển khai (Deployment Diagram)
Hai môi trường:
- Dev: docker-compose (PostGIS :5434, API :4000, FE Vite :5173, Swagger `/docs`)
- Prod-like: docker-compose.prod.yml (FE :8080, API :4000, restart/limits); Nginx/Caddy TLS; GitHub Actions CI lint/build; tùy chọn FE Vercel.

### 2.5. Sơ đồ CSDL không gian (ERD)
Bảng bắt buộc:
- `plots` (id UUID, puc UNIQUE, farmer_id, plot_name, boundary GEOMETRY(Polygon,4326) + GiST, area_m2, crop_type, growth_status, risk_level, qr_code_url, created_at)
- `growth_status_history`
- `plot_crop_history` (puc, season_name, crop_type, start_date, end_date, yield_amount, yield_unit, soil_condition_note, disease_history, is_current)
- `plot_disease_alerts` (puc, disease_name, confidence, xai_overlay_url, alert_date, status)
- `shipping_logs` (puc, batch_code UNIQUE, harvest_date, quantity, unit, destination)
- `puc_sequence`
- `climate_timeseries` / `plot_climate_reading` (stub IoT T24 — ghi rõ là stub)

Ghi rõ khóa liên kết toàn hệ sinh thái là **PUC**.

### 2.6. Sơ đồ luồng dữ liệu tích hợp 3 nhóm (Integration Architecture)
- Nhóm 2 Web GIS: số hóa thửa, PUC, QR, thổ nhưỡng/mùa vụ, buffer dịch, BATCH.
- Nhóm Canh tác: nhật ký bón phân/tưới (không vẽ GIS).
- Nhóm 3 AI: YOLOv8/Drone, Grad-CAM XAI, confidence → webhook `POST /api/v1/gis/plots/disease-alert`.
Nguyên tắc: không trùng trách nhiệm; mọi bản ghi ngoài GIS phải đính `puc`.

### 2.7. Sơ đồ bảo mật & phân quyền (Security Architecture)
- GET public: bbox, PUC, stats, health, traceability, report.pdf (theo code hiện tại).
- POST/PATCH: header `X-API-Key` khi `API_KEY` được cấu hình.
- RBAC UI: `AuthContext` + `ROLE_PERMISSIONS`.
Ma trận quyền (bắt buộc có bảng):

| Chức năng | ADMIN | HTX_FARMER | Public |
| Vẽ/tạo lô | Có | Có | Không |
| Cập nhật sinh trưởng | Có | Có | Không |
| Ghi crop history | Không | Có | Không |
| Tạo BATCH | Không | Có | Không |
| Phê duyệt PUC / import GeoJSON / cấu hình buffer | Có | Không | Không |
| Tra cứu QR /puc/:puc | — | — | Có (zero-auth) |

### 2.8. Sơ đồ máy trạng thái (State Machine)
Hai statechart:
1. `growth_status`: DANG_TRONG → PHAT_TRIEN → RA_HOA → THU_HOACH → NGHI_CANH
2. `risk_level`: 0 Bình thường `#2E7D32` → 1 Cảnh báo `#F57F17` → 2 Nguy cấp `#D32F2F` (viền đỏ nhấp nháy CSS).  
   Rule: confidence ≥ 0.8 → risk 2; 0.5–0.8 → risk 1; < 0.5 → risk 0.  
   Khi risk=2: `ST_DWithin(geography, 500m)` nâng lô lân cận risk=0 lên risk=1.  
   Alert status: MOI_PHAT_HIEN → DANG_XU_LY → DA_KHAC_PHUC.

### 2.9. Chi tiết kỹ thuật bắt buộc giải thích (không chỉ vẽ)
Với mỗi mục, giải thích **vì sao chọn** và **cách chạy**:
- WGS84 EPSG:4326 lưu trữ; tính diện tích `ST_Area(ST_Transform(boundary, 3857))` ra m².
- `ST_IsValid` chặn đa giác tự cắt; `ST_Intersects` chặn đè lấn → `ERR_GIS_INVALID_POLYGON`, `ERR_GIS_SPATIAL_OVERLAP`.
- PUC: `VN-[MÃ TỈNH]-[NĂM]-[6 SỐ]`, ví dụ `VN-LD-2026-000101`, UNIQUE.
- QR tĩnh PNG: encode URL `{FRONTEND}/puc/{puc}`, lưu `/storage/qr/{puc}.png`.
- Viewport: `GET /api/v1/gis/plots?bbox=minX,minY,maxX,maxY` + `ST_MakeEnvelope` + GiST; FE debounce 350ms trên `moveend/zoomend`; giảm >85% băng thông so với load all.
- WebSocket: namespace `/gis`, event `risk.updated`, payload `{ puc, risk_level, risk_color, neighbors, source, at }`, mục tiêu < 500ms.
- BATCH: `BATCH-[PUC viết liền]-[YYYYMMDD]-[STT]`, ví dụ `BATCH-VNLD2026000101-20261115-01`.
- PDF hồ sơ thửa: PDFKit, `GET /api/v1/gis/plots/:puc/report.pdf`.
- Clean Architecture NestJS + TypeORM + native spatial SQL; synchronize=false.
- Lỗi chuẩn: `ERR_GIS_SPATIAL_OVERLAP`, `ERR_GIS_INVALID_POLYGON`, `ERR_GIS_PUC_NOT_FOUND`, `ERR_AUTH_TOKEN_EXPIRED`.

Kèm **bảng API** đầy đủ:

| Method | Path | UC/Ticket | Auth |
| GET | /health | Infra | Public |
| POST | /api/v1/gis/plots | UC-GIS-01/02 | API Key |
| GET | /api/v1/gis/plots?bbox= | Viewport | Public |
| GET | /api/v1/gis/plots/:puc | Tra cứu PUC | Public |
| POST | /api/v1/gis/plots/import | T10 | API Key (Admin) |
| PATCH | /api/v1/gis/plots/:puc/growth-status | UC-GIS-03 | API Key |
| POST | /api/v1/gis/plots/:puc/crop-history | Luân canh | API Key |
| GET | /api/v1/gis/plots/:puc/report.pdf | T11 | Public (code hiện tại) |
| GET | /api/v1/gis/plots/:puc/traceability | Trace | Public |
| GET | /api/v1/gis/plots/stats/risk | Dashboard | Public |
| GET | /api/v1/gis/plots/stats/crops | Dashboard | Public |
| POST | /api/v1/gis/shipping | UC-GIS-04 | API Key |
| POST | /api/v1/gis/plots/disease-alert | UC-GIS-05 | x-api-key |
| WS | /gis  event risk.updated | T20 | Browser |

Payload webhook AI (ví dụ chuẩn):
```json
{
  "puc": "VN-LD-2026-000003",
  "disease_name": "Bệnh Rỉ Sắt Cà Phê (Hemileia vastatrix)",
  "confidence": 0.94,
  "xai_overlay_url": "https://cdn.example/xai/gradcam.png",
  "risk_level": 2
}
```

## Phần 3. Sơ đồ Use Case (TRỌNG TÂM — vẽ đầy đủ UML)

### 3.1. Sơ đồ Use Case tổng thể (UML Use Case Diagram — Mermaid `flowchart` hoặc `C4Context` kiểu actor-ellipse)
**Actors (đúng 4 tác nhân, trong đó 2 role + 1 public + 1 hệ thống):**
- Cơ quan Quản lý / ADMIN
- Hợp tác xã / Nông dân (HTX_FARMER) — nông dân là thành viên HTX, ủy quyền số hóa; KHÔNG vẽ actor Nông dân riêng
- Người tiêu dùng / Nhà phân phối (Public)
- Hệ thống AI Vision Nhóm 3 (actor hệ thống)

**Hệ thống biên:** Agri-XAI Web GIS

**Use case bắt buộc (đặt mã, gom package):**

Package A — Định danh không gian
- UC-GIS-01 Số hóa ranh giới thửa đất (vẽ Leaflet / nhập sổ đỏ VN2000-WGS84 / GPS walk)
- UC-GIS-02 Cấp mã PUC và sinh QR Code
- UC-GIS-06 Import GeoJSON hàng loạt (include UC-GIS-01, chỉ ADMIN)
- UC-GIS-07 Xuất PDF hồ sơ kỹ thuật thửa đất

Package B — Canh tác
- UC-GIS-03 Cập nhật trạng thái sinh trưởng
- UC-GIS-08 Ghi nhật ký luân canh mùa vụ (crop history)

Package C — Giám sát rủi ro
- UC-GIS-05 Tiếp nhận cảnh báo dịch bệnh AI
- UC-GIS-09 Khoanh vùng đệm dịch tễ 500m (extend UC-GIS-05 khi risk=2)
- UC-GIS-10 Nhận cảnh báo realtime trên bản đồ (WebSocket)
- UC-GIS-11 Xem dashboard thống kê rủi ro / cơ cấu cây trồng

Package D — Chuỗi cung ứng
- UC-GIS-04 Tạo phiếu xuất kho và mã BATCH
- UC-GIS-12 Tra cứu nguồn gốc Farm-to-Fork bằng QR

Package E — Nền tảng
- UC-GIS-13 Tải bản đồ theo viewport BBOX
- UC-GIS-14 Giám sát sức khỏe hệ thống /health

Quan hệ UML phải vẽ:
- `<<include>>`: UC-GIS-02 include UC-GIS-01 (cấp PUC sau khi polygon hợp lệ)
- `<<extend>>`: UC-GIS-09 extend UC-GIS-05 (chỉ khi risk=2)
- `<<include>>`: UC-GIS-12 include dữ liệu từ UC-GIS-03, UC-GIS-05, UC-GIS-04, UC-GIS-08
- Association đúng actor: ADMIN không tạo BATCH; HTX_FARMER không import GeoJSON / không cấu hình buffer; AI chỉ association tới UC-GIS-05; Public chỉ UC-GIS-12 (và gián tiếp xem polygon).

Vẽ **1 sơ đồ tổng** + **4 sơ đồ use case theo package** (A–D) để khỏi rối.

### 3.2. Đặc tả chi tiết từng Use Case
Với MỖI UC ở trên, viết bảng/mục theo mẫu:

- Mã & tên
- Actor chính / phụ
- Mức ưu tiên (Must)
- Tiền điều kiện
- Trigger
- Luồng chính (numbered)
- Luồng thay thế (nhập sổ đỏ, GPS walk, import hàng loạt…)
- Luồng lỗi (invalid polygon, overlap, PUC not found, 401 API key, confidence thấp)
- Hậu điều kiện
- Quy tắc nghiệp vụ (PostGIS, mã PUC/BATCH, màu risk)
- Giao diện (route FE) + API + bảng CSDL
- Tiêu chí chấp nhận (AC)

Viết đặc biệt kỹ 5 UC cốt lõi UC-GIS-01 → 05.

### 3.3. Ma trận Actor × Use Case
Bảng R/O/X (Responsible / Optional / No).

## Phần 4. Workflow / Luồng nghiệp vụ (TRỌNG TÂM)

Phải có **tối thiểu các sơ đồ workflow sau** (Mermaid `flowchart` hoặc `sequenceDiagram`, có `autonumber` với sequence):

### WF-00. Quy trình Farm-to-Fork 4 giai đoạn (overview)
G1 Số hóa & PUC → G2 Giám sát sinh trưởng & AI buffer → G3 Thu hoạch & BATCH → G4 Quét QR consumer.

### WF-01. Sequence end-to-end Farm-to-Fork
Actors: HTX, Frontend, NestJS, PostGIS, AI Nhóm 3, Consumer.
Đủ 4 giai đoạn trong 1 sequence.

### WF-02. Activity: số hóa thửa + chống đè lấn + cấp PUC + QR
Nhánh: vẽ map / nhập sổ đỏ / import GeoJSON.
Quyết định: ST_IsValid, ST_Intersects, API key.

### WF-03. Sequence: viewport BBOX + debounce 350ms
User pan/zoom → moveend → debounce → bbox → ST_MakeEnvelope + GiST → GeoJSON → render layer.

### WF-04. Activity: disease alert + ST_DWithin 500m + WebSocket đổi màu
Nhánh confidence; nhánh risk=2 buffer neighbors; emit `risk.updated`.

### WF-05. Sequence: cập nhật sinh trưởng + crop history
PATCH growth-status → history table; POST crop-history khi kết thúc/luân canh.

### WF-06. Activity: xuất kho BATCH + in tem QR
Khuyến cáo không xuất nếu risk=2 (nêu là quy tắc nghiệp vụ/khuyến cáo, đừng bịa là hard-block trừ khi nguồn sự thật nói hard-block).

### WF-07. Sequence: consumer quét QR
QR → `/puc/:puc` hoặc `/trace` → API plot + traceability → timeline (vị trí, thổ nhưỡng, mùa vụ, dịch bệnh, BATCH).

### WF-08. Sequence: tích hợp 3 nhóm
AI webhook; Nhóm canh tác GET plot / POST crop-history; khóa PUC.

### WF-09. Workflow triển khai CI/CD
Push → GitHub Actions lint/build → Docker prod → Nginx/Caddy → healthcheck.

Sau mỗi workflow: bảng **I/O**, **SLA/hiệu năng** (bbox <120ms, WS <500ms, giảm 85% bandwidth — dùng đúng số liệu nguồn), **điểm thất bại và cách hệ thống xử lý**.

## Phần 5. Ánh xạ Use Case — Workflow — Kiến trúc — Ticket
Bảng:

| UC | Workflow | Tầng/Module | Ticket | Trạng thái |
| UC-GIS-01 | WF-02 | PlotController/PlotService/PostGIS | T02 | Done |
| UC-GIS-02 | WF-02 | PucGeneratorService + QR storage | T03 | Done |
| Viewport | WF-03 | GET /plots?bbox | T04 | Done |
| UC-GIS-03 | WF-05 | growth_status_history | T05 | Done |
| UC-GIS-04 | WF-06 | shipping_logs | T06 | Done |
| UC-GIS-05+09+10 | WF-04 | Alert + ST_DWithin + RiskGateway | T07, T19, T20 | Done |
| Dashboard | UC-GIS-11 | stats/risk, stats/crops | T09 | Done |
| Import | UC-GIS-06 | POST /plots/import | T10 | Done |
| PDF | UC-GIS-07 | ReportService | T11 | Done |
| Public PUC | UC-GIS-12 | /puc/:puc | T21 | Done |
| GPS/sổ đỏ | UC-GIS-01 alt | CadastralEntryModal, GpsWalkTools | T23 | UI done |
| Vector tiles MVT | — | pg_tileserv | T22 | Spec/roadmap |
| IoT climate | — | ClimateController stub | T24 | Stub |

Ghi tiến độ tổng: Core MVP + hardening + deploy + advanced GIS ≈ hoàn thành; Phase scale T22 ~ spec; T24 stub; tổng thể sẵn sàng nghiệm thu.

## Phần 6. Kết luận & hướng phát triển
- Giá trị: polygon pháp lý + PUC chống giả mạo + buffer dịch tự động + truy xuất BATCH.
- Hướng mở: MVT/pg_tileserv khi hàng nghìn lô; IoT timeseries; PWA GPS walk hoàn thiện; object storage QR.

## Phụ lục
- Thuật ngữ: PUC, BATCH, BBOX, GiST, EPSG:4326/3857, XAI, EUDR, HTX, Farm-to-Fork.
- Quy ước màu risk.
- Cấu trúc monorepo:
```
agri-webgis/
  docker-compose.yml
  docker-compose.prod.yml
  docs/
  gis-service/          # NestJS + TypeORM + PostGIS
  web-gis-frontend/     # React + Vite + Leaflet
  scripts/              # seed-demo, smoke-api
```

# NGUỒN SỰ THẬT (GROUND TRUTH) — BÁM ĐÚNG, KHÔNG THÊM

**Tên:** Agri-XAI Web GIS — Nhóm 2 — Nền tảng bản đồ số quản lý vùng trồng & truy xuất nguồn gốc Farm-to-Fork.

**Stack:**
- FE: React 18, Vite, Leaflet, Leaflet-Geoman, Socket.io-client, React Router
- BE: NestJS (Node 20), TypeORM, Socket.io, PDFKit, Terminus health, Throttler, Swagger (chỉ non-prod)
- DB: PostgreSQL 16 + PostGIS 3.3, geometry Polygon 4326, GiST trên `plots.boundary`
- DevOps: Docker Compose dev/prod, GitHub Actions, Nginx/Caddy, optional Vercel FE

**Runtime dev:** API http://localhost:4000 ; Swagger /docs ; UI http://localhost:5173 ; PostGIS localhost:5434 (user gis_admin, db gis_agriculture_db). Prod-like UI :8080.

**Màu UI:** nông nghiệp `#2E7D32`, cảnh báo `#F57F17`, nguy cấp `#D32F2F`.

**GrowthStatus enum:** DANG_TRONG, PHAT_TRIEN, RA_HOA, THU_HOACH, NGHI_CANH.

**RiskLevel:** 0 / 1 / 2.

**Case study:** HTX Cầu Đất, Đà Lạt; ví dụ lô ông Nguyễn Văn An 12.450 m²; PUC `VN-LD-2026-000101`; lô kề `VN-LD-2026-000102` rust confidence 91.5% → risk 2; lô 000101 cách 180m → risk 1; thu hoạch 3.500 kg; BATCH `BATCH-VNLD2026000101-20261115-01`.

**Pháp lý HTX:** Luật HTX 2023 — HTX là chủ thể quản lý vùng trồng; nông dân thành viên ủy quyền; không cấp PUC xuất khẩu cho hộ cá thể tách rời tổ chức liên kết (theo báo cáo chuẩn hóa dự án).

**Không có trong hệ thống (đừng viết như đã làm):** ArcGIS, GeoServer, Kafka, Kubernetes bắt buộc, blockchain, thanh toán, nhật ký bón phân chi tiết theo giờ (thuộc nhóm canh tác), tự train YOLOv8 trong repo này.

# YÊU CẦU VẼ MERMAID
- Dùng `flowchart TB/TD/LR`, `sequenceDiagram`, `stateDiagram-v2`, `erDiagram`.
- Tên node ngắn, không ký tự đặc biệt phá cú pháp (`[]`, ngoặc kép cẩn thận).
- Use case: actor hình chữ nhật; use case hình stadium (`([UC-GIS-01 Tên])`); hệ thống `subgraph`.
- Sequence: actor + participant đúng tên thật (Leaflet, NestJS, PostGIS, RiskGateway).
- ERD: quan hệ plots 1—N history/alerts/shipping/crop_history qua `puc`.
- Mỗi diagram đặt trong fence ` ```mermaid `.

# CHẤT LƯỢNG
- Ưu tiên chiều sâu kiến trúc/use case/workflow hơn phần mềm sáo.
- Bảng > đoạn văn dài khi mô tả ma trận, API, AC.
- Giải thích thuật toán không gian bằng lời + SQL minh họa ngắn (ST_IsValid, ST_Intersects, ST_Area, ST_DWithin, ST_MakeEnvelope).
- Viết như người đã đọc code: nêu đúng path API, đúng enum, đúng namespace WS.
- Độ dài mục tiêu: báo cáo đầy đủ hội đồng, khoảng 6.000–10.000 từ; nếu bị cắt thì kết thúc bằng mục còn thiếu và chờ lệnh “tiếp tục từ mục X”.

Hãy bắt đầu bằng Mục lục, rồi viết tuần tự từ Phần 0. Không hỏi lại. Không tóm tắt thay cho báo cáo.

PROMPT KẾT THÚC
````

---

## Gợi ý chia nhỏ nếu AI bị giới hạn token

Gửi 5 lượt, mỗi lượt dán lại đoạn **RÀNG BUỘC + NGUỒN SỰ THẬT** (rút gọn) rồi:

| Lượt | Yêu cầu |
|------|---------|
| 1 | Phần 0–1 + sơ đồ ngữ cảnh |
| 2 | Phần 2 đầy đủ 8 sơ đồ kiến trúc + bảng API + ERD |
| 3 | Phần 3 sơ đồ Use Case tổng + 4 package + đặc tả UC-GIS-01…05 |
| 4 | Đặc tả nốt UC-GIS-06…14 + ma trận actor |
| 5 | Phần 4 toàn bộ workflow + Phần 5–6 + phụ lục |

Lệnh nối bài:

```text
Tiếp tục đúng cấu trúc đã nêu, không lặp lại mục đã viết.
Bắt đầu từ: [tên mục].
Vẽ đủ Mermaid. Bám ground truth. Tiếng Việt học thuật.
```

## Gợi ý xuất Word / slide hội đồng

Sau khi có Markdown:

```text
Chuyển báo cáo Markdown vừa viết sang cấu trúc Word báo cáo đồ án:
font Times New Roman 13, giãn dòng 1.5, đề mục 1 / 1.1 / 1.1.1,
caption Hình x.x / Bảng x.x, danh mục hình-bảng cuối chương.
Giữ nguyên mọi sơ đồ Mermaid trong phụ lục dưới dạng code
và mô tả cách render (mermaid.live hoặc plugin Markdown Preview).
Không rút gọn nội dung kỹ thuật.
```
