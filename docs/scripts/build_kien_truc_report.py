"""Build Word report: architecture, use cases, workflows for Agri-XAI Web GIS."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from docx.enum.text import WD_ALIGN_PARAGRAPH  # noqa: E402
from docx_util import (  # noqa: E402
    add_bullet,
    add_center,
    add_code,
    add_figure,
    add_h,
    add_p,
    add_table,
    add_title,
    init_document,
)
from report_diagrams import (  # noqa: E402
    FIG_COMPONENT,
    FIG_CONTEXT,
    FIG_DEPLOY,
    FIG_ERD,
    FIG_GROWTH_SM,
    FIG_INTEGRATION,
    FIG_LAYERS,
    FIG_RISK_SM,
    FIG_SECURITY,
    FIG_UC_A,
    FIG_UC_B,
    FIG_UC_C,
    FIG_UC_D,
    FIG_UC_OVERVIEW,
    FIG_WF00,
    FIG_WF01,
    FIG_WF02,
    FIG_WF03,
    FIG_WF04,
    FIG_WF05,
    FIG_WF06,
    FIG_WF07,
    FIG_WF08,
    FIG_WF09,
)

OUT = Path(__file__).resolve().parents[1] / "BAO_CAO_KIEN_TRUC_USECASE_WORKFLOW.docx"


def add_uc(doc, *, code, name, actors, pre, trigger, steps, alts, errors, post, rules, ui_api, ac):
    add_h(doc, f"{code}. {name}", 3)
    add_table(
        doc,
            ["Hạng mục", "Mô tả"],
        [
            ["Mã & tên", f"{code} — {name}"],
            ["Actor chính / phụ", actors],
            ["Mức ưu tiên", "Must"],
            ["Tiền điều kiện", pre],
            ["Trigger", trigger],
            ["Hậu điều kiện", post],
            ["Giao diện / API / CSDL", ui_api],
        ],
        caption=f"Bảng đặc tả tóm tắt {code}",
    )
    add_p(doc, "**Luồng chính**", indent=False)
    for i, s in enumerate(steps, 1):
        add_bullet(doc, f"{i}. {s}")
    add_p(doc, "**Luồng thay thế**", indent=False)
    for s in alts:
        add_bullet(doc, s)
    add_p(doc, "**Luồng lỗi**", indent=False)
    for s in errors:
        add_bullet(doc, s)
    add_p(doc, f"**Quy tắc nghiệp vụ:** {rules}")
    add_p(doc, "**Tiêu chí chấp nhận (AC)**", indent=False)
    for s in ac:
        add_bullet(doc, s)


def cover(doc):
    for _ in range(3):
        add_center(doc, "", size=13)
    add_center(doc, "BÁO CÁO KỸ THUẬT DỰ ÁN", size=14, bold=True)
    add_title(doc, "AGRI-XAI WEB GIS", size=22, space_after=8)
    add_center(
        doc,
        "Nền tảng bản đồ số quản lý vùng trồng và truy xuất nguồn gốc nông nghiệp Farm-to-Fork",
        size=14,
        italic=True,
        space_after=12,
    )
    add_center(doc, "Kiến trúc hệ thống · Sơ đồ Use Case · Workflow nghiệp vụ", size=13, bold=True)
    add_center(doc, "Phân hệ Web GIS — Nhóm 2 trong hệ sinh thái Agri-XAI (3 nhóm)", size=13)
    add_center(doc, "", size=13)
    add_table(
        doc,
        ["Thông tin", "Giá trị"],
        [
            ["Tên dự án", "Agri-XAI Web GIS"],
            ["Phân hệ", "Nhóm 2 — Web GIS và chuỗi cung ứng không gian"],
            ["Phiên bản tài liệu", "3.0 — Kiến trúc / Use Case / Workflow"],
            ["Ngày phát hành", "15/09/2026"],
            ["Trạng thái", "Core MVP + Advanced GIS hoàn thành; T22 spec; T24 stub"],
            ["Đối tượng đọc", "Hội đồng khoa học, GVHD, nhóm phát triển, đối tác tích hợp"],
            ["Phạm vi địa lý", "Lâm Đồng — Đà Lạt, Cầu Đất, Lạc Dương, Đơn Dương, Đức Trọng"],
        ],
        caption="Bảng 0.1. Thông tin tài liệu",
    )
    add_p(
        doc,
        "Tài liệu này là báo cáo kỹ thuật cấp hội đồng, tập trung ba trục: kiến trúc hệ thống đa tầng, mô hình Use Case UML, và các luồng nghiệp vụ (workflow) Farm-to-Fork. Phân hệ được mô tả là **chủ thể Web GIS (Nhóm 2)**. Nhóm Canh tác phụ trách nhật ký chăm sóc; Nhóm 3 phụ trách AI thị giác (YOLOv8/Drone) và gửi webhook cảnh báo. Khóa liên kết toàn hệ sinh thái là mã vùng trồng **PUC**.",
    )


def toc(doc):
    add_h(doc, "MỤC LỤC", 1)
    items = [
        "Phần 0. Thông tin tài liệu",
        "Phần 1. Tổng quan và mục tiêu dự án",
        "    1.1. Bối cảnh và điểm nghẽn",
        "    1.2. Mục tiêu tổng quát và kỹ thuật",
        "    1.3. Phạm vi ứng dụng và case study Cầu Đất",
        "    1.4. So sánh ngắn với 5 hệ thống phổ biến",
        "Phần 2. Kiến trúc hệ thống",
        "    2.1. Sơ đồ ngữ cảnh (C4 Level 1)",
        "    2.2. Kiến trúc đa tầng",
        "    2.3. Sơ đồ thành phần gis-service",
        "    2.4. Sơ đồ triển khai",
        "    2.5. Mô hình CSDL không gian (ERD)",
        "    2.6. Kiến trúc tích hợp 3 nhóm",
        "    2.7. Bảo mật và phân quyền RBAC",
        "    2.8. Máy trạng thái sinh trưởng và rủi ro",
        "    2.9. Chi tiết kỹ thuật cốt lõi và bảng API",
        "Phần 3. Sơ đồ và đặc tả Use Case",
        "    3.1. Sơ đồ Use Case tổng thể và theo package",
        "    3.2. Đặc tả chi tiết UC-GIS-01 đến UC-GIS-14",
        "    3.3. Ma trận Actor × Use Case",
        "Phần 4. Workflow nghiệp vụ",
        "    WF-00 đến WF-09",
        "Phần 5. Ánh xạ Use Case — Workflow — Ticket",
        "Phần 6. Kết luận và hướng phát triển",
        "Phụ lục. Thuật ngữ, màu risk, cấu trúc monorepo, danh mục hình/bảng",
    ]
    for it in items:
        add_bullet(doc, it)


def part0(doc):
    add_h(doc, "PHẦN 0. THÔNG TIN TÀI LIỆU", 1)
    add_p(
        doc,
        "Dự án **Agri-XAI Web GIS** xây dựng nền tảng bản đồ số để số hóa từng thửa đất thành polygon WGS84, cấp mã định danh vùng trồng PUC, giám sát rủi ro dịch bệnh theo không gian, và khép kín chuỗi truy xuất từ nông trại đến bàn ăn. Báo cáo này không lặp lại toàn bộ báo cáo nghiệp vụ trước đó, mà **đi sâu kiến trúc, Use Case và workflow** — ba nội dung hội đồng thường đòi hỏi khi đánh giá đồ án kỹ thuật.",
    )
    add_p(
        doc,
        "Phạm vi tài liệu: mô tả hệ thống **đã triển khai** (Phase 0–3, T01–T21, T23, T25–T26) và **tách rõ** các hạng mục roadmap (T22 Vector Tiles/MVT chỉ ở mức spec; T24 IoT vi khí hậu chỉ ở mức DDL + API stub). Không mô tả ArcGIS, GeoServer, Kafka, Kubernetes bắt buộc, blockchain, thanh toán, hay việc huấn luyện YOLOv8 ngay trong kho mã nguồn này.",
    )


def part1(doc):
    add_h(doc, "PHẦN 1. TỔNG QUAN VÀ MỤC TIÊU DỰ ÁN", 1)
    add_h(doc, "1.1. Bối cảnh và bốn điểm nghẽn hiện trạng", 2)
    add_p(
        doc,
        "Nông nghiệp Việt Nam đang chuyển sang xuất khẩu chính ngạch. Các thị trường khó tính (EUDR của Liên minh Châu Âu, mã số vùng trồng PUC đối với Hoa Kỳ và Trung Quốc) yêu cầu chứng minh **vị trí địa lý thửa đất**, lịch sử sử dụng đất và an toàn dịch tễ. Truy xuất bằng địa chỉ văn bản hay một điểm ghim (point marker) không đủ để chứng minh ranh giới thật.",
    )
    add_p(doc, "Bốn điểm nghẽn mà hệ thống nhằm xử lý:", indent=False)
    add_bullet(doc, "**Thiếu định danh không gian:** ranh giới chủ yếu nằm trên giấy, khó tính diện tích thật, khó tích hợp CSDL số.")
    add_bullet(doc, "**Gian lận mã vùng trồng PUC:** nông sản vùng này mượn mã vùng khác; khi hải quan đối chiếu tọa độ, cả lô hàng có thể bị thu hồi.")
    add_bullet(doc, "**Ứng phó dịch hại thụ động:** thông tin xử lý cục bộ, không có thuật toán khoảng cách không gian để khoanh vùng đệm.")
    add_bullet(doc, "**Đứt gãy thông tin Farm-to-Fork:** người tiêu dùng chỉ thấy tem chung, không thấy lịch sử luân canh, thổ nhưỡng, nhật ký kiểm dịch của đúng thửa đất tạo ra sản phẩm.")
    add_p(
        doc,
        "Agri-XAI Web GIS được đặt là **nguồn dữ liệu gốc duy nhất (Single Source of Truth)** cho ranh giới thửa đất, mã PUC, rủi ro không gian và lô hàng BATCH. Phân hệ nhận cảnh báo từ mô hình AI thị giác (Nhóm 3) qua webhook, không tự huấn luyện mô hình trong repo này.",
    )

    add_h(doc, "1.2. Mục tiêu tổng quát và mục tiêu kỹ thuật đo được", 2)
    add_p(
        doc,
        "Mục tiêu tổng quát: trực quan hóa vùng trồng trên Web GIS; hỗ trợ cơ quan quản lý giám sát vĩ mô; hỗ trợ HTX quản lý chi tiết từng lô; kết nối sản phẩm vật lý với dữ liệu không gian qua PUC và BATCH; nâng cao khả năng chủ động phòng dịch bằng liên kết PostGIS với tín hiệu AI.",
    )
    add_table(
        doc,
        ["Mục tiêu kỹ thuật", "Cách đo / bằng chứng trong hệ thống"],
        [
            ["Lưu trữ polygon chuẩn", "GEOMETRY(Polygon, 4326), GiST trên plots.boundary, ST_IsValid"],
            ["Chống đè lấn địa chính", "ST_Intersects → ERR_GIS_SPATIAL_OVERLAP"],
            ["Diện tích chuẩn m2", "ST_Area(ST_Transform(boundary, 3857))"],
            ["Mã PUC quốc gia", "VN-[Mã tỉnh]-[Năm]-[6 số], UNIQUE, ví dụ VN-LD-2026-000101"],
            ["QR định danh", "PNG tĩnh /storage/qr/{puc}.png, URL /puc/{puc}"],
            ["Cảnh báo AI", "POST /plots/disease-alert, conf ≥ 0.8 → risk 2"],
            ["Vùng đệm 500m", "ST_DWithin(geography, 500) khi risk=2"],
            ["Realtime", "Socket.io namespace /gis, event risk.updated, mục tiêu < 500ms"],
            ["Viewport BBOX", "Debounce 350ms, giảm >85% băng thông so với load-all"],
            ["BATCH", "BATCH-[PUC viết liền]-[YYYYMMDD]-[STT]"],
        ],
        caption="Bảng 1.1. Mục tiêu kỹ thuật và bằng chứng",
    )

    add_h(doc, "1.3. Phạm vi ứng dụng và case study HTX Cầu Đất", 2)
    add_p(
        doc,
        "Phạm vi thí điểm: tỉnh **Lâm Đồng**, tập trung Đà Lạt, Lạc Dương (Langbiang), tiểu vùng Cầu Đất (Xuân Trường, Trạm Hành), Đơn Dương và Đức Trọng. Cây trồng đặc thù: cà phê Arabica Cầu Đất (Bourbon, Typica, Catimor) — yêu cầu EUDR và kiểm soát nấm rỉ sắt (*Hemileia vastatrix*); rau ôn đới và nông sản CNC (xà lách, ớt chuông, cà chua bi, dâu tây) — chu kỳ luân canh nhanh. Địa hình 800–1.650 m, dốc 5–25%, đất Feralit/mùn; dịch dễ lây theo gió và dòng chảy, nên buffer không gian là yêu cầu nghiệp vụ, không phải trang trí kỹ thuật.",
    )
    add_p(
        doc,
        "Case study: HTX Nông sản Cao cấp Cầu Đất quản lý **45 hộ**, **65 ha**. Bốn bước vận hành đã chuẩn hóa:",
    )
    add_bullet(
        doc,
        "Số hóa: Chủ nhiệm HTX vẽ lô cà phê hộ ông Nguyễn Văn An, diện tích **12.450 m2**. PostGIS không phát hiện đè lấn; hệ thống cấp **VN-LD-2026-000101** và QR. Cán bộ Chi cục phê duyệt hiệu lực.",
    )
    add_bullet(
        doc,
        "Giám sát: cập nhật DANG_TRONG → PHAT_TRIEN → RA_HOA; hồ sơ thổ nhưỡng (cao độ 1.480 m, dốc 8%, Feralit mùn đỏ, pH 5.8) nằm trong chuỗi truy xuất.",
    )
    add_bullet(
        doc,
        "AI: lô kề **VN-LD-2026-000102** bị rỉ sắt, độ tin cậy **91,5%** → risk 2 (đỏ nhấp nháy). `ST_DWithin` 500 m trúng lô 000101 cách **180 m** → risk 1 (vàng cam). WebSocket đẩy Dashboard.",
    )
    add_bullet(
        doc,
        "Thu hoạch: 3.500 kg quả chín; mã **BATCH-VNLD2026000101-20261115-01**. Người tiêu dùng/nhập khẩu quét QR mở `/puc/:puc` xem hành trình Farm-to-Fork.",
    )

    add_h(doc, "1.4. So sánh ngắn với năm hệ thống phổ biến", 2)
    add_p(
        doc,
        "VNPT Check và Viettel vTrace mạnh về tem nhãn thương mại, yếu về **polygon ranh giới** và topology địa chính. TraceVerified mạnh nhật ký chuỗi nhưng tách rời bản đồ. ArcGIS Online mạnh GIS thương mại nhưng đắt và không có sẵn nghiệp vụ PUC/BATCH Việt Nam. QGIS/GeoServer mạnh chuẩn OGC nhưng không kèm sẵn webhook AI, Socket.io và cổng tra cứu QR. Agri-XAI Web GIS khác ở chỗ **gắn PUC vào polygon thật**, **tự động buffer 500 m khi AI báo risk 2**, và **BATCH gắn vật lý với thửa đất** — dùng Clean Architecture NestJS + PostGIS, không phụ thuộc bản quyền Esri.",
    )
    add_table(
        doc,
        ["Tiêu chí", "Tem truy xuất (VNPT/Viettel)", "ArcGIS / QGIS", "Agri-XAI Web GIS"],
        [
            ["Ranh giới", "Text / point marker", "Đầy đủ GIS", "Polygon GeoJSON 4326"],
            ["Chống đè lấn", "Không", "Có, cấu hình phức tạp", "ST_Intersects tự động"],
            ["AI realtime", "Không", "Tích hợp ngoài", "Webhook + WS < 500ms"],
            ["Buffer dịch", "Không", "Geoprocessing thủ công", "ST_DWithin 500m"],
            ["PUC / BATCH", "Tem nội bộ", "Không sẵn", "Chuẩn VN-LD-... và BATCH-..."],
            ["Chi phí", "Thuê bao tem", "Bản quyền / vận hành", "Mã nguồn mở, Docker"],
        ],
        caption="Bảng 1.2. Khác biệt cốt lõi (tóm tắt)",
    )


def part2(doc):
    add_h(doc, "PHẦN 2. KIẾN TRÚC HỆ THỐNG", 1)
    add_p(
        doc,
        "Hệ thống được tổ chức theo kiến trúc đa tầng, API-first, Clean Architecture trên NestJS. Frontend là SPA React. Dữ liệu không gian nằm ở PostgreSQL 16 + PostGIS 3.3. Đây không phải microservice cắt nhỏ nhiều process nghiệp vụ: **gis-service là một backend đơn**, tách module bằng controller/service/repository. ClimateController là stub T24.",
    )

    add_h(doc, "2.1. Sơ đồ ngữ cảnh hệ thống (C4 Level 1)", 2)
    add_figure(doc, FIG_CONTEXT, "Hình 2.1. Sơ đồ ngữ cảnh: tác nhân bên ngoài và Agri-XAI Web GIS")
    add_p(
        doc,
        "Giải thích: bốn tác nhân bên ngoài tương tác với một hệ thống phần mềm duy nhất. ADMIN giám sát vĩ mô và phê duyệt. HTX_FARMER là chủ thể sản xuất — nông dân là thành viên HTX, không vẽ actor riêng (theo Luật HTX 2023 và báo cáo chuẩn hóa RBAC). Người tiêu dùng không đăng nhập. AI Nhóm 3 chỉ gọi webhook. Nhóm Canh tác đọc/ghi mùa vụ qua PUC, không vẽ lại bản đồ. PostGIS là hệ thống dữ liệu, không phải actor nghiệp vụ.",
    )
    add_table(
        doc,
        ["Node", "Hiện thực"],
        [
            ["ADMIN / HTX_FARMER", "AuthContext.tsx, rolePermissions.ts"],
            ["Public", "PublicPucPage.tsx, TracePage.tsx"],
            ["AI Nhóm 3", "POST /api/v1/gis/plots/disease-alert"],
            ["Nhóm Canh tác", "GET /plots/:puc, POST /plots/:puc/crop-history"],
            ["Web GIS", "web-gis-frontend + gis-service"],
            ["PostGIS", "docker gis-db, port 5434 (dev)"],
        ],
        caption="Bảng 2.1. Ánh xạ node ngữ cảnh → hiện thực",
    )

    add_h(doc, "2.2. Kiến trúc đa tầng", 2)
    add_figure(doc, FIG_LAYERS, "Hình 2.2. Bốn tầng: Client, Gateway, Service, Data")
    add_p(
        doc,
        "Tầng Client dùng React 18 + Vite, Leaflet và Leaflet-Geoman để vẽ/chỉnh polygon, Socket.io-client lắng nghe `/gis`. Các màn hình nội bộ nằm trong AppShell: `/` Dashboard, `/map`, `/plots`, `/trace`. Cổng public `/puc/:puc` nằm ngoài AppShell để tối ưu mobile. Tầng Gateway: Nginx/Caddy TLS ở môi trường prod-like; trong process NestJS có ApiKeyGuard, Throttler (cấu hình 120 req / 60s), CORS, interceptor gán `X-Request-Id`. Tầng Service gồm PlotController, ShippingController, AlertController, ClimateController (stub), HealthController; service cốt lõi PlotService, PucGeneratorService, ReportService, WeatherService; PlotRepository viết spatial SQL; RiskGateway namespace `/gis`. Tầng Data: PostGIS và volume file QR.",
    )
    add_p(
        doc,
        "Vì sao chọn stack này: Leaflet nhẹ hơn Mapbox có phí; PostGIS xử lý topology và buffer tại CSDL, tránh kéo cả tỉnh về trình duyệt; NestJS cho DI/guard/swagger đúng Clean Architecture; Socket.io phù hợp đẩy sự kiện risk theo phòng, không cần Kafka ở quy mô MVP.",
    )
    add_table(
        doc,
        ["Lớp", "Thành phần", "File / module tiêu biểu"],
        [
            ["Client", "Dashboard, Map, Plots, Trace, Public PUC", "pages/*.tsx, GISMap.tsx"],
            ["Client", "Vẽ polygon, sổ đỏ, GPS walk", "PolygonDrawTools, CadastralEntryModal, GpsWalkTools"],
            ["Gateway", "ApiKeyGuard, Throttler, logging", "api-key.guard.ts, app.module.ts"],
            ["Service", "CRUD lô + BBOX + import + PDF", "plot.controller.ts, plot.service.ts, report.service.ts"],
            ["Service", "BATCH", "shipping.controller.ts"],
            ["Service", "Webhook AI", "alert.controller.ts"],
            ["Service", "Realtime", "risk.gateway.ts"],
            ["Data", "Entity + GiST", "plot.entity.ts, init.sql"],
        ],
        caption="Bảng 2.2. Ánh xạ tầng → module",
    )

    add_h(doc, "2.3. Sơ đồ thành phần gis-service", 2)
    add_figure(doc, FIG_COMPONENT, "Hình 2.3. Component diagram: Controller - Service - Repository")
    add_p(
        doc,
        "PlotService là trung tâm miền GIS: tạo lô, bbox, cập nhật sinh trưởng, crop history, import, tra cứu PUC, thống kê, và xử lý disease-alert (phân loại risk, buffer, ghi alert). AlertController chỉ là cổng webhook, không giữ logic không gian. Sau khi cập nhật risk, PlotService gọi RiskGateway.emitRiskUpdated. PucGeneratorService đọc/ghi `puc_sequences` theo cặp (province_code, year). ReportService dùng PDFKit. TypeORM `synchronize: false` — schema đi qua SQL init/migrate, tránh trượt schema production.",
    )

    add_h(doc, "2.4. Sơ đồ triển khai", 2)
    add_figure(doc, FIG_DEPLOY, "Hình 2.4. Triển khai dev và prod-like")
    add_p(
        doc,
        "Dev: `docker compose up -d` nâng PostGIS (localhost:5434, user gis_admin, db gis_agriculture_db) và backend; frontend `npm run dev` tại :5173; Swagger `/docs` chỉ bật non-prod. Prod-like: `docker-compose.prod.yml` (restart, limits, FE :8080). Reverse proxy Caddy/Nginx TLS tới FE và API; bắt buộc proxy cả WebSocket `/gis`. FE có thể đặt Vercel (`VITE_GIS_API_URL`, `VITE_GIS_WS_URL`). CI GitHub Actions lint/build FE + Nest trên push/PR. Backup: pg_dump CSDL và volume `qr_storage`.",
    )

    add_h(doc, "2.5. Mô hình cơ sở dữ liệu không gian (ERD)", 2)
    add_figure(doc, FIG_ERD, "Hình 2.5. ERD: PUC là khóa liên kết nghiệp vụ")
    add_p(
        doc,
        "Bảng `plots` lưu hình học `boundary` SRID 4326, chỉ mục không gian GiST. Khóa nghiệp vụ toàn cục là `puc` (UNIQUE), không phải chỉ UUID nội bộ — để Nhóm 3 và Nhóm Canh tác gọi chéo hệ thống. Lịch sử sinh trưởng, luân canh, cảnh báo, xuất kho đều tham chiếu `puc`. Bảng `puc_sequences` đảm bảo cấp số thứ tự 6 ký tự theo tỉnh + năm. Bảng `plot_climate_readings` là **stub T24** (nhiệt độ, độ ẩm, sensor_id); chưa có pipeline IoT hoàn chỉnh. `plot_crop_history` lưu mùa vụ đã/đang canh tác, phục vụ đóng góp ý hội đồng về luân canh.",
    )
    add_table(
        doc,
        ["Bảng", "Vai trò", "Trạng thái"],
        [
            ["plots", "Thửa đất, polygon, risk, QR", "Production"],
            ["growth_status_history", "Vết chuyển giai đoạn cây trồng", "Production"],
            ["plot_crop_history", "Luân canh mùa vụ", "Production"],
            ["plot_disease_alerts", "Nhật ký webhook AI + XAI URL", "Production"],
            ["shipping_logs", "BATCH xuất kho", "Production"],
            ["puc_sequences", "Bộ đếm mã PUC", "Production"],
            ["plot_climate_readings", "Timeseries vi khí hậu", "Stub T24"],
        ],
        caption="Bảng 2.3. Bảng CSDL và mức độ chín muồi",
    )

    add_h(doc, "2.6. Kiến trúc tích hợp ba nhóm", 2)
    add_figure(doc, FIG_INTEGRATION, "Hình 2.6. Hợp đồng tích hợp: PUC là khóa chung")
    add_p(
        doc,
        "Nguyên tắc không trùng trách nhiệm: Web GIS không làm form bón phân theo giờ; Nhóm Canh tác không tự vẽ PostGIS; Nhóm 3 không cấp PUC. Mọi bản ghi ngoài GIS bắt buộc đính `puc`. Webhook AI dùng header `x-api-key`. Tra cứu đa kênh: vị trí thửa (Nhóm 2) → chăm sóc (Nhóm Canh tác) → an toàn sâu bệnh (Nhóm 3) → lô hàng (Nhóm 2).",
    )

    add_h(doc, "2.7. Bảo mật và phân quyền (RBAC)", 2)
    add_figure(doc, FIG_SECURITY, "Hình 2.7. Luồng bảo mật: GET public, ghi cần API key, UI theo 2 role")
    add_p(
        doc,
        "RBAC nội bộ chỉ **2 role**: `ADMIN` và `HTX_FARMER`. Người tiêu dùng là public zero-auth, không nằm trong ma trận tài khoản. Khi biến `API_KEY` được cấu hình, mọi POST/PATCH cần header `X-API-Key`. GET bbox, PUC, stats, health, traceability, report.pdf là public theo code hiện tại. UI ẩn/hiện nút qua `ROLE_PERMISSIONS`. ADMIN không tạo BATCH (không trực tiếp xuất kho). HTX_FARMER không import GeoJSON hàng loạt và không cấu hình bán kính buffer.",
    )
    add_table(
        doc,
        ["Chức năng", "ADMIN", "HTX_FARMER", "Public"],
        [
            ["Vẽ / tạo lô đất", "Có", "Có", "Không"],
            ["Cập nhật sinh trưởng", "Có", "Có", "Không"],
            ["Ghi crop history", "Không", "Có", "Không"],
            ["Tạo BATCH", "Không", "Có", "Không"],
            ["Phê duyệt PUC / import GeoJSON / cấu hình buffer", "Có", "Không", "Không"],
            ["Tra cứu QR /puc/:puc", "—", "—", "Có (zero-auth)"],
            ["Nhận WS risk.updated", "Có", "Có", "Không bắt buộc"],
        ],
        caption="Bảng 2.4. Ma trận quyền RBAC (2 role + public)",
    )

    add_h(doc, "2.8. Máy trạng thái sinh trưởng và rủi ro", 2)
    add_figure(doc, FIG_GROWTH_SM, "Hình 2.8. Máy trạng thái growth_status")
    add_figure(doc, FIG_RISK_SM, "Hình 2.9. Máy trạng thái risk_level")
    add_p(
        doc,
        "Enum `GrowthStatus`: DANG_TRONG, PHAT_TRIEN, RA_HOA, THU_HOACH, NGHI_CANH. Mỗi lần PATCH ghi `growth_status_history` (from_status, to_status, changed_by, changed_at). Enum `RiskLevel`: 0 bình thường `#2E7D32`, 1 cảnh báo `#F57F17`, 2 nguy cấp `#D32F2F` (viền đỏ nhấp nháy CSS). Luật confidence: ≥ 0.8 → 2; 0.5–0.8 → 1; < 0.5 → 0. Khi risk=2, các lô `ST_DWithin` 500 m còn risk=0 được nâng lên 1. Trạng thái alert: MOI_PHAT_HIEN → DANG_XU_LY → DA_KHAC_PHUC.",
    )

    add_h(doc, "2.9. Chi tiết kỹ thuật cốt lõi và danh sách API", 2)
    add_p(
        doc,
        "Lưu trữ dùng EPSG:4326 vì đó là chuẩn GPS/GeoJSON/Leaflet. Tính diện tích không dùng đơn vị độ (degree) mà chuyển Web Mercator 3857 rồi `ST_Area` ra m2. `ST_IsValid` chặn đa giác tự cắt hoặc không khép. `ST_Intersects` chặn đè lấn; lỗi `ERR_GIS_SPATIAL_OVERLAP`. Mã PUC: `VN-[MA TINH]-[NAM]-[6 SO]`, ví dụ `VN-LD-2026-000101`. QR encode URL frontend `/puc/{puc}`. Viewport: `GET /api/v1/gis/plots?bbox=minX,minY,maxX,maxY` + `ST_MakeEnvelope` + GiST; FE debounce 350 ms trên `moveend`/`zoomend`; số liệu thiết kế: giảm >85% băng thông, API bbox ổn định dưới 120 ms. WebSocket payload `{ puc, risk_level, risk_color, neighbors, source, at }`. BATCH ví dụ `BATCH-VNLD2026000101-20261115-01`. PDF: `GET /plots/:puc/report.pdf`. Lỗi chuẩn thêm: `ERR_GIS_INVALID_POLYGON`, `ERR_GIS_PUC_NOT_FOUND`, `ERR_AUTH_TOKEN_EXPIRED`.",
    )
    add_p(doc, "Minh họa SQL chống đè lấn:", indent=False)
    add_code(
        doc,
        "SELECT id, puc, plot_name FROM plots\n"
        "WHERE ST_Intersects(boundary, ST_SetSRID(ST_GeomFromGeoJSON($1), 4326));",
    )
    add_p(doc, "Minh họa SQL diện tích:", indent=False)
    add_code(
        doc,
        "SELECT ROUND(ST_Area(ST_Transform(\n"
        "  ST_SetSRID(ST_GeomFromGeoJSON($1), 4326), 3857))::numeric, 2) AS area_m2;",
    )
    add_p(doc, "Minh họa SQL vùng đệm 500 m (kiểu geography, đơn vị mét):", indent=False)
    add_code(
        doc,
        "UPDATE plots SET risk_level = 1\n"
        "WHERE ST_DWithin(boundary::geography,\n"
        "  (SELECT boundary FROM plots WHERE puc = $1)::geography, 500)\n"
        "AND risk_level = 0 AND puc <> $1;",
    )
    add_p(doc, "Minh họa SQL viewport:", indent=False)
    add_code(
        doc,
        "SELECT puc, plot_name, risk_level, ST_AsGeoJSON(boundary)::json AS geometry\n"
        "FROM plots\n"
        "WHERE ST_Intersects(boundary, ST_MakeEnvelope($1,$2,$3,$4,4326));",
    )
    add_table(
        doc,
        ["Method", "Path", "UC / Ticket", "Auth"],
        [
            ["GET", "/health", "UC-GIS-14 / T12", "Public"],
            ["POST", "/api/v1/gis/plots", "UC-GIS-01/02", "API Key"],
            ["GET", "/api/v1/gis/plots?bbox=", "UC-GIS-13 / T04", "Public"],
            ["GET", "/api/v1/gis/plots/:puc", "Tra cuu PUC", "Public"],
            ["POST", "/api/v1/gis/plots/import", "UC-GIS-06 / T10", "API Key (Admin)"],
            ["PATCH", "/api/v1/gis/plots/:puc/growth-status", "UC-GIS-03", "API Key"],
            ["POST", "/api/v1/gis/plots/:puc/crop-history", "UC-GIS-08", "API Key"],
            ["GET", "/api/v1/gis/plots/:puc/report.pdf", "UC-GIS-07 / T11", "Public (code hien tai)"],
            ["GET", "/api/v1/gis/plots/:puc/traceability", "UC-GIS-12", "Public"],
            ["GET", "/api/v1/gis/plots/stats/risk", "UC-GIS-11", "Public"],
            ["GET", "/api/v1/gis/plots/stats/crops", "UC-GIS-11", "Public"],
            ["POST", "/api/v1/gis/shipping", "UC-GIS-04", "API Key"],
            ["POST", "/api/v1/gis/plots/disease-alert", "UC-GIS-05", "x-api-key"],
            ["WS", "/gis event risk.updated", "UC-GIS-10 / T20", "Trinh duyet"],
        ],
        caption="Bảng 2.5. Đặc tả API cốt lõi",
    )
    add_p(doc, "Payload webhook AI (ví dụ chuẩn hợp đồng tích hợp):", indent=False)
    add_code(
        doc,
        '{\n'
        '  "puc": "VN-LD-2026-000003",\n'
        '  "disease_name": "Benh Ri Sat Ca Phe (Hemileia vastatrix)",\n'
        '  "confidence": 0.94,\n'
        '  "xai_overlay_url": "https://cdn.example/xai/gradcam.png",\n'
        '  "risk_level": 2\n'
        "}",
    )


def part3(doc):
    add_h(doc, "PHẦN 3. SƠ ĐỒ VÀ ĐẶC TẢ USE CASE", 1)
    add_h(doc, "3.1. Sơ đồ Use Case tổng thể và theo package", 2)
    add_p(
        doc,
        "Hệ thống biên: Agri-XAI Web GIS. Bốn actor: ADMIN, HTX_FARMER, Người tiêu dùng (Public), AI Vision Nhóm 3. Quan hệ UML: UC-GIS-02 **include** UC-GIS-01 (chỉ cấp PUC khi polygon hợp lệ); UC-GIS-06 include UC-GIS-01 cho từng feature; UC-GIS-09 **extend** UC-GIS-05 khi risk=2; UC-GIS-12 include dữ liệu từ UC-GIS-03, 04, 05, 08. ADMIN không association tới UC-GIS-04. AI chỉ association tới UC-GIS-05. Public chỉ association tới UC-GIS-12 (và gián tiếp nhìn polygon trên trang public).",
    )
    add_figure(doc, FIG_UC_OVERVIEW, "Hình 3.1. Use Case tong the")
    add_figure(doc, FIG_UC_A, "Hình 3.2. Package A — Dinh danh khong gian")
    add_figure(doc, FIG_UC_B, "Hình 3.3. Package B — Canh tac")
    add_figure(doc, FIG_UC_C, "Hình 3.4. Package C — Giam sat rui ro")
    add_figure(doc, FIG_UC_D, "Hình 3.5. Package D — Chuoi cung ung")
    add_p(
        doc,
        "Package E (nền tảng) gồm UC-GIS-13 Viewport BBOX và UC-GIS-14 Health; hai UC này phục vụ mọi actor nội bộ và hạ tầng, không vẽ riêng để tránh đồ thị quá tải. Giải thích sơ đồ: hình stadium là use case; mũi tên nét đứt là include/extend; mũi tên nét liền là association actor. Việc tách 4 package giúp hội đồng đọc theo miền nghiệp vụ thay vì một sơ đồ 14 ellipse chồng chéo.",
    )

    add_h(doc, "3.2. Đặc tả chi tiết từng Use Case", 2)

    add_uc(
        doc,
        code="UC-GIS-01",
        name="So hoa ranh gioi thua dat",
        actors="Chinh: HTX_FARMER. Phu: ADMIN (quy hoach / duyet).",
        pre="Nguoi dung da xac thuc role hop le; API_KEY (neu bat) dung; CSDL PostGIS san sang.",
        trigger="Ve polygon tren /map, nhap toa do so do, hoac GPS walk (T23 UI).",
        steps=[
            "Nguoi dung chon hinh thuc nhap tren GISMap / CadastralEntryModal / GpsWalkTools.",
            "Frontend chuan hoa GeoJSON Polygon, SRID 4326, da giac khep >= 3 dinh.",
            "POST /api/v1/gis/plots kem plot_name, farmer_id, crop_type, boundary.",
            "PlotService goi ST_IsValid; neu sai tra ERR_GIS_INVALID_POLYGON.",
            "PlotService goi ST_Intersects; neu trung lo cu tra ERR_GIS_SPATIAL_OVERLAP kem puc lo bi xam lan.",
            "Tinh area_m2 bang ST_Area sau ST_Transform 3857.",
            "Chuyen tiep UC-GIS-02 de cap PUC va QR, INSERT plots, HTTP 201.",
            "Ban do render vien xanh #2E7D32 (risk 0 mac dinh).",
        ],
        alts=[
            "Nhap so do: bang dinh VN2000/WGS84 (T23) → cung pipeline GeoJSON.",
            "GPS walk: thu thap dinh ngoai dong roi chot polygon (UI done; PWA offline chua phai production).",
            "ADMIN ve lo quy hoach cung endpoint, khac o pham vi phe duyet.",
        ],
        errors=[
            "401 thieu/sai X-API-Key khi API_KEY bat.",
            "400 ERR_GIS_INVALID_POLYGON: tu cat, ho dinh, khong khep.",
            "400/409 ERR_GIS_SPATIAL_OVERLAP: de lan lo da co.",
        ],
        post="Co ban ghi plots voi boundary hop le va area_m2; san sang cap PUC.",
        rules="WGS84; cam de lan; dien tich khong tinh bang degree.",
        ui_api="/map, CreatePlotModal; POST /api/v1/gis/plots; bang plots.",
        ac=[
            "Polygon hien dung vi tri tren Google Satellite / ESRI imagery.",
            "Khong luu duoc lo de len lo da ton tai.",
            "area_m2 lam tron 2 chu so thap phan.",
        ],
    )

    add_uc(
        doc,
        code="UC-GIS-02",
        name="Cap ma PUC va sinh QR Code",
        actors="He thong (tu dong). ADMIN phe duyet hieu luc o khung quan tri. HTX_FARMER nhan ma sau khi so hoa thanh cong.",
        pre="UC-GIS-01 da vuot validate hinh hoc va topology.",
        trigger="Include trong luong tao lo thanh cong.",
        steps=[
            "PucGeneratorService lay province_code va nam, tang last_value trong puc_sequences.",
            "Ghep ma VN-[TINH]-[NAM]-[6 so], rang UNIQUE.",
            "Render PNG QR tro toi {FRONTEND_PUBLIC_URL}/puc/{puc}.",
            "Luu /storage/qr/{puc}.png, gan qr_code_url vao plots.",
        ],
        alts=["Neu render QR loi: lo van duoc luu, qr_code_url co the null — can kiem tra log [can van hanh giam sat]."],
        errors=["Trung UNIQUE puc (hiem, do sequence); giao dich rollback."],
        post="Thua dat co PUC on dinh de Nhom 3 va Nhom Canh tac tham chieu.",
        rules="Khong cap PUC xuat khau cho ho ca the tach roi HTX (quy tac nghiep vu bao cao chuan hoa).",
        ui_api="PlotDetailPanel hien PUC + anh QR; PucGeneratorService.",
        ac=[
            "Ma dung mau VN-LD-2026-000101.",
            "File PNG ton tai, quet ra dung URL public.",
        ],
    )

    add_uc(
        doc,
        code="UC-GIS-03",
        name="Cap nhat trang thai sinh truong",
        actors="Chinh: HTX_FARMER. Phu: ADMIN giam sat.",
        pre="Lo da co PUC.",
        trigger="HTX chon giai doan tren panel lo / trang plots.",
        steps=[
            "PATCH /api/v1/gis/plots/:puc/growth-status voi growth_status, changed_by, notes (neu co).",
            "UPDATE plots.growth_status.",
            "INSERT growth_status_history (from_status, to_status, changed_by, changed_at).",
            "UI cap nhat badge giai doan.",
        ],
        alts=["ADMIN co the cap nhat phuc vu giam sat, khong thay the nhat ky HTX."],
        errors=["ERR_GIS_PUC_NOT_FOUND; 401 API key; enum khong hop le."],
        post="Co vet lich su chuyen trang thai, phuc vu UC-GIS-12.",
        rules="Enum dung 5 gia tri: DANG_TRONG, PHAT_TRIEN, RA_HOA, THU_HOACH, NGHI_CANH.",
        ui_api="PlotDetailPanel; bang growth_status_history.",
        ac=["Moi lan doi giai doan tao dung 1 ban ghi history.", "Giao dien hien giai doan moi ngay."],
    )

    add_uc(
        doc,
        code="UC-GIS-04",
        name="Tao phieu xuat kho va ma BATCH",
        actors="Chinh: HTX_FARMER. ADMIN khong tao BATCH.",
        pre="Lo da co PUC; khuyen cao da qua THU_HOACH va khong o risk 2.",
        trigger="Mo ShippingModal, nhap harvest_date, quantity, unit, destination.",
        steps=[
            "POST /api/v1/gis/shipping { puc, harvest_date, quantity, unit, destination }.",
            "Sinh batch_code BATCH-[PUC viet lien]-[YYYYMMDD]-[STT], UNIQUE.",
            "INSERT shipping_logs.",
            "HTX in tem QR (cung URL PUC / BATCH) dan bao bi.",
        ],
        alts=["Nhieu BATCH trong cung ngay: STT tang."],
        errors=["PUC khong ton tai; 401; trung batch_code."],
        post="Co lo hang gan voi thua dat de tra cuu cong khai.",
        rules="Khuyen cao khong xuat khi risk=2 — day la quy tac nghiep vu/khuyen cao tren UI, khong mo ta la hard-block backend neu code khong chan.",
        ui_api="ShippingModal; POST /api/v1/gis/shipping; shipping_logs.",
        ac=["Ma BATCH parse duoc lai PUC va ngay.", "Trang public liet ke lo hang."],
    )

    add_uc(
        doc,
        code="UC-GIS-05",
        name="Tiep nhan canh bao dich benh AI",
        actors="Chinh: AI Vision Nhom 3. Phu: ADMIN (cau hinh), HTX (nhan ket qua).",
        pre="PUC ton tai; AI co x-api-key.",
        trigger="Mo hinh YOLOv8/Drone gui POST /api/v1/gis/plots/disease-alert.",
        steps=[
            "Kiem tra API key.",
            "Doc puc, disease_name, confidence, xai_overlay_url.",
            "Gan risk theo nguong 0.8 / 0.5.",
            "INSERT plot_disease_alerts (status MOI_PHAT_HIEN).",
            "UPDATE plots.risk_level.",
            "Neu risk=2: kich hoat UC-GIS-09.",
            "Emit UC-GIS-10 risk.updated.",
        ],
        alts=["Conf thap van ghi log de kiem toan, risk 0 hoac 1 tuy nguong."],
        errors=["401 sai key; ERR_GIS_PUC_NOT_FOUND; payload thieu field."],
        post="Lo tam dich doi mau; co URL Grad-CAM neu Nhom 3 cung cap.",
        rules="GIS khong tu suy benh tu anh; chi tin webhook da xac thuc.",
        ui_api="alert.controller.ts; plot.service.ts; plot_disease_alerts.",
        ac=["Conf 0.94 dat risk 2.", "Ban do doi mau khong can reload trang."],
    )

    add_uc(
        doc,
        code="UC-GIS-06",
        name="Import GeoJSON hang loat",
        actors="ADMIN.",
        pre="File FeatureCollection hop le; API key.",
        trigger="ADMIN upload / POST /api/v1/gis/plots/import.",
        steps=[
            "Duyet tung Feature trong transaction.",
            "Moi feature include UC-GIS-01/02.",
            "Commit neu tat ca hop le hoac rollback theo thiet ke service (ghi ro ket qua tung lo).",
        ],
        alts=["HTX_FARMER khong duoc import hang loat (RBAC)."],
        errors=["Mot feature de lan → bao loi feature do, khong pha toan bo neu service xu ly tung lo."],
        post="Nhieu lo co PUC.",
        rules="Chi ADMIN de bao toan CSDL.",
        ui_api="POST /plots/import; T10.",
        ac=["Import N polygon khong de lan → N PUC moi."],
    )

    add_uc(
        doc,
        code="UC-GIS-07",
        name="Xuat PDF ho so ky thuat thua dat",
        actors="ADMIN (day du), HTX_FARMER (tom tat ho).",
        pre="PUC ton tai.",
        trigger="GET /api/v1/gis/plots/:puc/report.pdf.",
        steps=["ReportService ghep metadata, toa do, QR, risk, mua vu.", "Tra StreamableFile PDFKit."],
        alts=["Tai tu PlotDetailPanel."],
        errors=["ERR_GIS_PUC_NOT_FOUND."],
        post="File PDF tai ve ten {puc}-report.pdf.",
        rules="Phuc vu ho so VietGAP/GlobalGAP / kiem toan.",
        ui_api="report.service.ts; T11. GET hien tai public theo code.",
        ac=["PDF mo duoc, co PUC va QR."],
    )

    add_uc(
        doc,
        code="UC-GIS-08",
        name="Ghi nhat ky luan canh mua vu",
        actors="HTX_FARMER. ADMIN khong ghi (RBAC writeCropHistory=false).",
        pre="PUC ton tai.",
        trigger="POST /plots/:puc/crop-history.",
        steps=[
            "Nhap season_name, crop_type, start_date, yield, soil_condition_note, disease_history, is_current.",
            "INSERT plot_crop_history.",
            "CropHistoryTimeline hien thi.",
        ],
        alts=["Nhom Canh tac goi cung API theo hop dong tich hop."],
        errors=["401; PUC not found."],
        post="Co lich su luan canh cho UC-GIS-12.",
        rules="Khong thay the nhat ky bon phan theo gio cua Nhom Canh tac.",
        ui_api="plot_crop_history; CropHistoryTimeline.tsx.",
        ac=["Timeline dung thu tu thoi gian.", "is_current danh dau vu hien tai."],
    )

    add_uc(
        doc,
        code="UC-GIS-09",
        name="Khoanh vung dem dich te 500 m",
        actors="He thong (extend UC-GIS-05). ADMIN co khung cau hinh buffer; HTX khong cau hinh.",
        pre="Lo tam dich risk=2.",
        trigger="Nhanh extend khi PlotService xac dinh risk 2.",
        steps=[
            "ST_DWithin boundary::geography, 500 met.",
            "UPDATE lo lang gieng risk=0 → 1.",
            "Gom neighbors vao payload WS.",
        ],
        alts=["Ban kinh 1000 m neu ADMIN cau hinh [khung quyen configureBuffer]."],
        errors=["Loi SQL khong gian → khong emit nua lo; log loi."],
        post="Vung dem hien vang cam; tam dich do.",
        rules="Dung geography de tinh met that, khong dung degree.",
        ui_api="T19; PlotService buffer.",
        ac=["Lo cach 180 m (case Cau Dat) vao vung dem; lo >500 m khong doi neu dang risk 0."],
    )

    add_uc(
        doc,
        code="UC-GIS-10",
        name="Nhan canh bao realtime tren ban do",
        actors="ADMIN va HTX_FARMER dang mo Web GIS.",
        pre="Trinh duyet ket noi Socket.io namespace /gis.",
        trigger="emitRiskUpdated sau UC-GIS-05/09.",
        steps=[
            "Gateway emit event risk.updated.",
            "FE doi mau layer theo risk_color.",
            "Toast canh bao; risk 2 animate-pulse.",
        ],
        alts=["Mat WS: nguoi dung reload bbox van thay risk da persist CSDL."],
        errors=["Proxy khong upgrade WS → mat realtime, API van dung."],
        post="UI dong bo < 500 ms theo muc tieu thiet ke.",
        rules="source trong payload: disease-alert | buffer | manual.",
        ui_api="risk.gateway.ts; PlotLayer.tsx.",
        ac=["Khong can F5 de thay doi mau."],
    )

    add_uc(
        doc,
        code="UC-GIS-11",
        name="Xem dashboard thong ke rui ro va co cau cay trong",
        actors="ADMIN (vi mo), HTX_FARMER (tong quan khu vuc).",
        pre="Co du lieu plots.",
        trigger="Mo `/`.",
        steps=["GET stats/risk va stats/crops.", "Ve KPI, donut, heatmap/danh sach."],
        alts=["Health ping /health tren shell."],
        errors=["API down → empty state / toast."],
        post="Nguoi dung nhin duoc phan bo risk 0/1/2 va dien tich theo cay.",
        rules="Khong thay the ban do chi tiet.",
        ui_api="DashboardPage.tsx; T09.",
        ac=["So lo theo risk khop CSDL."],
    )

    add_uc(
        doc,
        code="UC-GIS-12",
        name="Tra cuu nguon goc Farm-to-Fork bang QR",
        actors="Nguoi tieu dung / nha phan phoi (Public).",
        pre="Tem QR da in; PUC ton tai.",
        trigger="Quet QR hoac go `/puc/:puc` / `/trace`.",
        steps=[
            "GET /plots/:puc va/hoac /plots/:puc/traceability.",
            "Hien ban do mini, HTX/chu ho, thonhuong, crop history, alert, BATCH.",
        ],
        alts=["Go tay ma PUC tren /trace."],
        errors=["PUC sai → ERR_GIS_PUC_NOT_FOUND trang loi than thien."],
        post="Nguoi dung thay chuoi minh bach khong can tai khoan.",
        rules="Zero-auth; include du lieu UC-03/04/05/08.",
        ui_api="PublicPucPage.tsx; T21.",
        ac=["Dien thoai mo duoc trang; co polygon va BATCH vi du Cau Dat."],
    )

    add_uc(
        doc,
        code="UC-GIS-13",
        name="Tai ban do theo viewport BBOX",
        actors="Moi user noi bo (va lop map public neu dung chung API).",
        pre="Ban do Leaflet khoi tao, tam Lam Dong.",
        trigger="moveend / zoomend.",
        steps=["Debounce 350 ms.", "GET /plots?bbox=minX,minY,maxX,maxY.", "Ve FeatureCollection."],
        alts=["Khong bbox → [tuy service] danh sach/gioi han; thiet ke chinh la loc viewport."],
        errors=["bbox malform → 400."],
        post="Chi lo trong khung hinh duoc tai.",
        rules="GiST + ST_MakeEnvelope; muc tieu giam >85% bang thong, <120 ms.",
        ui_api="usePlotData.ts; T04.",
        ac=["Pan nhanh khong spam API; sau 350 ms co 1 request."],
    )

    add_uc(
        doc,
        code="UC-GIS-14",
        name="Giam sat suc khoe he thong",
        actors="Ha tang / CI / ADMIN.",
        pre="Process NestJS chay.",
        trigger="GET /health (Terminus).",
        steps=["Kiem tra ket noi PostGIS va tai nguyen.", "Tra liveness/readiness."],
        alts=["FE ping de hien badge suc khoe."],
        errors=["DB down → health fail, proxy ngung chuyen traffic."],
        post="Biet service song truoc khi nghiem thu.",
        rules="Swagger tat khi NODE_ENV=production.",
        ui_api="health.controller.ts; T12.",
        ac=["Smoke script goi /health thanh cong khi stack up."],
    )

    add_h(doc, "3.3. Ma trận Actor × Use Case", 2)
    add_table(
        doc,
        ["Use Case", "ADMIN", "HTX_FARMER", "Public", "AI Nhom 3"],
        [
            ["UC-GIS-01 So hoa", "R", "R", "X", "X"],
            ["UC-GIS-02 PUC/QR", "O (duyet)", "R (nhan ma)", "X", "X"],
            ["UC-GIS-03 Sinh truong", "O", "R", "X", "X"],
            ["UC-GIS-04 BATCH", "X", "R", "X", "X"],
            ["UC-GIS-05 Disease alert", "O (cau hinh)", "O (nhan)", "X", "R"],
            ["UC-GIS-06 Import", "R", "X", "X", "X"],
            ["UC-GIS-07 PDF", "R", "O", "X", "X"],
            ["UC-GIS-08 Crop history", "X", "R", "X", "X"],
            ["UC-GIS-09 Buffer 500m", "O (cau hinh)", "O (chiu anh huong)", "X", "X"],
            ["UC-GIS-10 WebSocket", "R", "R", "X", "X"],
            ["UC-GIS-11 Dashboard", "R", "O", "X", "X"],
            ["UC-GIS-12 Tra cuu QR", "O", "O", "R", "X"],
            ["UC-GIS-13 BBOX", "R", "R", "O", "X"],
            ["UC-GIS-14 Health", "O", "X", "X", "X"],
        ],
        caption="Bảng 3.1. R = Responsible, O = Optional, X = No",
    )
    add_p(
        doc,
        "Doc ma tran: R la actor kich hoat hoac chiu trach nhiem nghiep vu; O la duoc tham gia nhung khong bat buoc; X la cam hoac khong co association. Diem de sai da duoc chuan hoa: khong ve Nong dan tach role; khong cho ADMIN xuat kho; khong cho HTX import hang loat.",
    )


def part4(doc):
    add_h(doc, "PHẦN 4. WORKFLOW / LUỒNG NGHIỆP VỤ", 1)

    add_h(doc, "WF-00. Quy trình Farm-to-Fork bốn giai đoạn", 2)
    add_p(
        doc,
        "Muc tieu: cung cap anh xa muc luc cho hoi dong truoc khi di vao sequence chi tiet. Actor: HTX_FARMER, ADMIN, AI Nhom 3, Nguoi tieu dung. Trigger: vong doi thua dat tu so hoa den tieu thu.",
        indent=True,
    )
    add_figure(doc, FIG_WF00, "Hình 4.1. Bon giai doan truy xuat nguon goc")
    add_table(
        doc,
        ["Giai doan", "Trigger", "Input", "Output", "SLA / ghi chu"],
        [
            ["G1 So hoa & PUC", "Ve / so do / import", "GeoJSON", "plots + PUC + QR", "Validate truoc khi cap ma"],
            ["G2 Giam sat & AI", "PATCH sinh truong / webhook", "status, confidence", "history + risk + buffer", "WS < 500ms"],
            ["G3 BATCH", "Thu hoach", "san luong, ngay, den", "shipping_logs", "Khuyen cao tranh risk 2"],
            ["G4 QR public", "Quet tem", "puc", "Timeline", "Zero-auth"],
        ],
        caption="Bảng 4.1. I/O tong quat WF-00",
    )
    add_p(doc, "Diem that bai: neu G1 luu polygon sai, toan chuoi sau (PUC, BATCH, EUDR) mat gia tri phap ly — do do ST_IsValid/ST_Intersects nam o cong dau.")

    add_h(doc, "WF-01. Sequence end-to-end Farm-to-Fork", 2)
    add_figure(doc, FIG_WF01, "Hình 4.2. Sequence khép kin HTX — GIS — AI — Consumer")
    add_p(
        doc,
        "Giai thich: mot cuoc doi thoai duy nhat noi 4 giai doan. HTX khong cho AI; AI khong cho HTX. Moi ben chi noi voi NestJS/PostGIS. Consumer khong bao gio goi POST. Day la anh xa dung hop dong tich hop: PUC duoc sinh o buoc 1 roi di xuyen cac buoc sau.",
    )
    add_table(
        doc,
        ["Hang muc", "Gia tri"],
        [
            ["Actor", "HTX_FARMER, React, NestJS, PostGIS, AI Nhom 3, Nguoi tieu dung"],
            ["That bai chinh", "Overlap luc tao lo; 401 webhook; proxy mat WS; PUC khong tim thay luc quet"],
            ["Xu ly", "Ma loi chuan; persist CSDL du neu WS die; trang public bao loi than thien"],
        ],
        caption="Bảng 4.2. Tom tat WF-01",
    )

    add_h(doc, "WF-02. Activity so hoa thua, chong de lan, cap PUC, QR", 2)
    add_figure(doc, FIG_WF02, "Hình 4.3. Activity nhap lieu khong gian")
    add_p(
        doc,
        "Ba nhanh nhap hop nhat ve mot hop GeoJSON. Auth dung truoc spatial de tranh tan cong vo polygon. Thu tu validate: hinh hoc roi topology roi dien tich roi dinh danh — vi khong cap PUC cho da giac vo hieu. Import (UC-06) di cung duong nhung lap theo feature.",
    )
    add_table(
        doc,
        ["I/O", "Mo ta"],
        [
            ["In", "Toa do ve, bang so do, hoac FeatureCollection"],
            ["Out", "HTTP 201, puc, area_m2, qr_code_url"],
            ["Loi", "401, ERR_GIS_INVALID_POLYGON, ERR_GIS_SPATIAL_OVERLAP"],
            ["SLA", "Phu thuoc so dinh; GiST giup overlap nhanh o quy mo nghin lo"],
        ],
        caption="Bảng 4.3. I/O WF-02",
    )

    add_h(doc, "WF-03. Sequence viewport BBOX va debounce 350 ms", 2)
    add_figure(doc, FIG_WF03, "Hình 4.4. Tai ban do theo khung nhin")
    add_p(
        doc,
        "Khong tai toan tinh. Debounce 350 ms gom nhieu su kien pan/zoom thanh mot request. ST_MakeEnvelope tao hinh chu nhat viewport; ST_Intersects + GiST loc lo. So lieu thiet ke: ~15 MB neu tai 10.000 lo giam con ~120 KB (~50–100 lo trong khung), tiet kiem hon 85%; thoi gian dap ung API muc tieu duoi 120 ms.",
    )
    add_table(
        doc,
        ["That bai", "Xu ly"],
        [
            ["Nguoi dung keo lien tuc", "Huy/ghep request bang debounce"],
            ["bbox nguoc min>max", "Backend tu choi 400"],
            ["Zoom qua rong", "So feature tang — T22 MVT la huong scale, hien moi o spec"],
        ],
        caption="Bảng 4.4. Diem that bai WF-03",
    )

    add_h(doc, "WF-04. Activity disease alert, buffer 500 m, WebSocket", 2)
    add_figure(doc, FIG_WF04, "Hình 4.5. Phan ung su co dich hai")
    add_p(
        doc,
        "Nhanh confidence tao risk 0/1/2. Chi risk 2 mo nhanh buffer. Cap nhat CSDL truoc, roi moi broadcast — neu WS loi, reload van dung. Leaflet: risk 0 xanh do mo 0.2; risk 1 vang cam do mo 0.4; risk 2 do do mo 0.6 + pulse. Muc tieu dau-cuoi AI→UI duoi 500 ms.",
    )
    add_table(
        doc,
        ["I/O", "Mo ta"],
        [
            ["In", "puc, disease_name, confidence, xai_overlay_url"],
            ["Out", "risk lo tam, neighbors risk 1, event risk.updated"],
            ["SLA", "WS < 500ms; buffer SQL GiST"],
            ["That bai", "Sai key 401; PUC khong co; proxy khong WS"],
        ],
        caption="Bảng 4.5. I/O WF-04",
    )

    add_h(doc, "WF-05. Sequence sinh trưởng và crop history", 2)
    add_figure(doc, FIG_WF05, "Hình 4.6. Nhat ky sinh truong va luan canh")
    add_p(
        doc,
        "Hai API tach nhau: PATCH doi nấc sinh truong (nhieu lan trong mot vu); POST crop-history khi ket thuc/doi cay. ADMIN co the PATCH giam sat nhung khong ghi crop history. Du lieu ca hai bang duoc UC-GIS-12 gom vao timeline.",
    )

    add_h(doc, "WF-06. Activity xuat kho BATCH va in tem QR", 2)
    add_figure(doc, FIG_WF06, "Hình 4.7. Tao lo hang gan PUC")
    add_p(
        doc,
        "Nhanh risk=2 chi **khuyen cao** dung xuat, van cho phep lap phieu neu HTX chot (khong khai hard-block neu backend khong chan). Ma BATCH ghép PUC viet lien + ngay + STT de truy vet mot chieu tu tem ve thua dat. Tem vat ly dung cung kenh QR PUC de consumer khong can app rieng.",
    )
    add_table(
        doc,
        ["I/O", "Mo ta"],
        [
            ["In", "puc, harvest_date, quantity, unit, destination"],
            ["Out", "batch_code UNIQUE, ban ghi shipping_logs"],
            ["Vi du", "BATCH-VNLD2026000101-20261115-01 — 3500 kg"],
        ],
        caption="Bảng 4.6. I/O WF-06",
    )

    add_h(doc, "WF-07. Sequence consumer quet QR", 2)
    add_figure(doc, FIG_WF07, "Hình 4.8. Cong public Farm-to-Fork")
    add_p(
        doc,
        "Dien thoai chi can trinh duyet. Trang `/puc/:puc` khong AppShell. API public khong doi cookie. Noi dung: polygon tren nen ve tinh, thong tin HTX, thonhuong, luan canh, lich su kiem dich, BATCH. Day la diem khac tem thuong mai chi hien xa/huyen.",
    )

    add_h(doc, "WF-08. Sequence tich hop ba nhom", 2)
    add_figure(doc, FIG_WF08, "Hình 4.9. PUC lam khoa cheo he thong")
    add_p(
        doc,
        "GIS phat hanh PUC. AI va Nhom Canh tac chi tieu thu PUC. Hai chieu Nhom Canh tac: GET ho so thonhuong/mua vu, POST crop-history. Khong co hang doi phan tan trong MVP; tich hop dong bo HTTP + mot kenh WS noi bo GIS.",
    )

    add_h(doc, "WF-09. Workflow trien khai CI/CD", 2)
    add_figure(doc, FIG_WF09, "Hình 4.10. Push → CI → Docker → proxy → health")
    add_p(
        doc,
        "GitHub Actions chay lint/build FE va Nest. Anh prod-like compose co restart policy. Healthcheck Terminus la cong cuoi truoc nghiem thu. Swagger tat o production. Bien nhay cam (`POSTGRES_PASSWORD`, `API_KEY`, `JWT_SECRET`, `CORS_ORIGINS`) nam .env, khong commit.",
    )
    add_table(
        doc,
        ["That bai", "Xu ly"],
        [
            ["CI do build", "Khong deploy"],
            ["DB migrate thieu", "Chay SQL init/migrate_t24 thu cong tren volume cu"],
            ["Quen proxy WS", "Realtime chet, can cau hinh /gis"],
        ],
        caption="Bảng 4.7. Diem that bai WF-09",
    )


def part5(doc):
    add_h(doc, "PHẦN 5. ÁNH XẠ USE CASE — WORKFLOW — KIẾN TRÚC — TICKET", 1)
    add_table(
        doc,
        ["UC", "Workflow", "Tang / module", "Ticket", "Trang thai"],
        [
            ["UC-GIS-01", "WF-02", "PlotController / PlotService / PostGIS", "T02", "Done"],
            ["UC-GIS-02", "WF-02", "PucGeneratorService + /storage/qr", "T03", "Done"],
            ["UC-GIS-13", "WF-03", "GET /plots?bbox", "T04", "Done"],
            ["UC-GIS-03", "WF-05", "growth_status_history", "T05", "Done"],
            ["UC-GIS-04", "WF-06", "shipping_logs", "T06", "Done"],
            ["UC-GIS-05+09+10", "WF-04", "Alert + ST_DWithin + RiskGateway", "T07, T19, T20", "Done"],
            ["UC-GIS-11", "WF-00", "stats/risk, stats/crops", "T09", "Done"],
            ["UC-GIS-06", "WF-02 nhanh import", "POST /plots/import", "T10", "Done"],
            ["UC-GIS-07", "Ho so PDF", "ReportService", "T11", "Done"],
            ["UC-GIS-12", "WF-07", "/puc/:puc", "T21", "Done"],
            ["UC-GIS-01 alt GPS/so do", "WF-02", "CadastralEntryModal, GpsWalkTools", "T23", "UI done"],
            ["MVT / pg_tileserv", "—", "Scale tiles", "T22", "Spec / roadmap"],
            ["IoT climate", "—", "ClimateController stub", "T24", "Stub"],
            ["UC-GIS-14", "WF-09", "Terminus /health", "T12", "Done"],
            ["Hardening", "WF-09", "API key, CORS, Docker, CI", "T13–T18, T25–T26", "Done"],
        ],
        caption="Bảng 5.1. Ánh xạ UC — WF — module — ticket",
    )
    add_p(
        doc,
        "Tiến độ tổng: Phase 0 Core GIS, Phase 1 hardening, Phase 2 CI/CD, Phase 3 advanced GIS (buffer, WS, import, PDF, trace, sổ đỏ) **hoàn thành**. Phase 4 scale: T22 còn spec; T24 stub. Tổng thể sẵn sàng nghiệm thu về kiến trúc và nghiệp vụ cốt lõi; không khai báo vector tiles hay IoT như đã xong.",
    )


def part6(doc):
    add_h(doc, "PHẦN 6. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN", 1)
    add_p(
        doc,
        "Agri-XAI Web GIS (Nhóm 2) đã khép kín một kiến trúc đo lường được: polygon pháp lý trên PostGIS, mã PUC chống giả mạo tọa độ, buffer dịch 500 m khi AI báo risk 2, realtime dưới nửa giây, viewport tiết kiệm băng thông, và BATCH gắn sản phẩm vật lý với thửa đất. Mô hình 2 role đúng với thực tiễn HTX Việt Nam; người tiêu dùng dùng kênh public. Use Case và workflow ở báo cáo này ánh xạ 1-1 sang controller, bảng CSDL và ticket T01–T26.",
    )
    add_p(doc, "Hướng mở đã nằm ở spec/stub, chưa triển khai đầy đủ:", indent=False)
    add_bullet(doc, "T22: Vector Tiles / MVT (pg_tileserv) khi hàng nghìn lô làm BBOX GeoJSON nặng.")
    add_bullet(doc, "T24: IoT timeseries vi khí hậu — DDL và API stub đã có.")
    add_bullet(doc, "Hoàn thiện PWA GPS walk offline (T23 hiện UI).")
    add_bullet(doc, "Đưa file QR lên object storage khi nhiều node.")
    add_p(
        doc,
        "Hệ thống sẵn sàng báo cáo hội đồng và vận hành thí điểm tại các vùng trồng Lâm Đồng, với điều kiện hạ tầng: PostGIS, proxy TLS có WebSocket, và hợp đồng PUC với Nhóm Canh tác và Nhóm 3.",
    )


def appendix(doc):
    add_h(doc, "PHỤ LỤC", 1)
    add_h(doc, "A. Thuật ngữ", 2)
    add_table(
        doc,
        ["Thuật ngữ", "Nghĩa trong dự án"],
        [
            ["PUC", "Production Unit Code — ma vung trong VN-[TINH]-[NAM]-[6 so]"],
            ["BATCH", "Ma lo xuat kho BATCH-[PUC viet lien]-[YYYYMMDD]-[STT]"],
            ["BBOX", "Bounding box viewport minX,minY,maxX,maxY EPSG:4326"],
            ["GiST", "Chi muc khong gian PostGIS tren plots.boundary"],
            ["EPSG:4326", "WGS84 do/phut — luu tru va GeoJSON"],
            ["EPSG:3857", "Web Mercator — tinh dien tich m2"],
            ["XAI", "Explainable AI — overlay Grad-CAM do Nhom 3 cung cap URL"],
            ["EUDR", "Quy dinh chong pha rung EU, can polygon ranh gioi"],
            ["HTX", "Hop tac xa — chu the quan ly vung trong"],
            ["Farm-to-Fork", "Chuoi tu thua dat den nguoi tieu dung qua PUC/BATCH"],
            ["RBAC", "2 role ADMIN va HTX_FARMER; public zero-auth"],
        ],
        caption="Bảng P.1. Thuật ngữ",
    )
    add_h(doc, "B. Quy ước màu risk", 2)
    add_table(
        doc,
        ["risk_level", "Ten", "Mau", "Hien thi ban do"],
        [
            ["0", "Binh thuong", "#2E7D32", "Vien xanh, do mo 0.2"],
            ["1", "Canh bao / vung dem", "#F57F17", "Vien vang cam, do mo 0.4"],
            ["2", "Nguy cap / o dich", "#D32F2F", "Vien do, do mo 0.6, pulse"],
        ],
        caption="Bảng P.2. Bảng màu rủi ro",
    )
    add_h(doc, "C. Cấu trúc monorepo", 2)
    add_code(
        doc,
        "agri-webgis/\n"
        "  docker-compose.yml\n"
        "  docker-compose.prod.yml\n"
        "  docs/\n"
        "  gis-service/          # NestJS + TypeORM + PostGIS\n"
        "  web-gis-frontend/     # React + Vite + Leaflet\n"
        "  scripts/              # seed-demo, smoke-api",
    )
    add_h(doc, "D. Runtime tham chiếu", 2)
    add_bullet(doc, "API dev: http://localhost:4000 — Swagger /docs (non-prod)")
    add_bullet(doc, "UI dev: http://localhost:5173 — prod-like UI :8080")
    add_bullet(doc, "PostGIS: localhost:5434 — gis_admin / gis_agriculture_db")
    add_bullet(doc, "Health: GET /health")
    add_bullet(doc, "Demo: node scripts/seed-demo.mjs — smoke: node scripts/smoke-api.mjs")
    add_h(doc, "E. Danh mục hình", 2)
    for line in [
        "Hình 2.1 Ngu canh he thong",
        "Hình 2.2 Kien truc da tang",
        "Hình 2.3 Component gis-service",
        "Hình 2.4 Trien khai",
        "Hình 2.5 ERD",
        "Hình 2.6 Tich hop 3 nhom",
        "Hình 2.7 Bao mat",
        "Hình 2.8 State growth_status",
        "Hình 2.9 State risk_level",
        "Hình 3.1–3.5 Use Case",
        "Hình 4.1–4.10 Workflow WF-00 den WF-09",
    ]:
        add_bullet(doc, line)
    add_h(doc, "F. Ghi chú về sơ đồ Mermaid trong Word", 2)
    add_p(
        doc,
        "Các sơ đồ được render PNG/JPEG qua Kroki hoặc mermaid.ink tại thời điểm xuất file. Nếu cần chỉnh sửa, nguồn Mermaid nằm trong docs/scripts/report_diagrams.py; có thể dán lại mermaid.live. Định dạng văn bản: Times New Roman 13, giãn dòng 1.5, khổ A4, lề trái 2.5 cm.",
    )


def main():
    print("init document", flush=True)
    doc = init_document()
    print("cover", flush=True)
    cover(doc)
    print("toc", flush=True)
    toc(doc)
    print("part0", flush=True)
    part0(doc)
    print("part1", flush=True)
    part1(doc)
    print("part2", flush=True)
    part2(doc)
    print("part3", flush=True)
    part3(doc)
    print("part4", flush=True)
    part4(doc)
    print("part5", flush=True)
    part5(doc)
    print("part6", flush=True)
    part6(doc)
    print("appendix", flush=True)
    appendix(doc)
    print("save", flush=True)
    doc.save(str(OUT))
    print("WROTE", OUT, flush=True)


if __name__ == "__main__":
    main()
