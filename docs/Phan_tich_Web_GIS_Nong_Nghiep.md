# Phân Tích Kiến Trúc & Định Hướng Phát Triển: Web GIS Nông Nghiệp Số

Tài liệu này cung cấp cái nhìn chuyên sâu về hệ thống Web GIS phục vụ nông nghiệp số, bóc tách các trường hợp sử dụng cốt lõi, luồng dữ liệu Farm-to-Fork và vạch ra lộ trình nâng cấp hệ thống đạt chuẩn Production.

Ánh xạ ticket: xem [TICKETS.md](./TICKETS.md). Deploy: xem [DEPLOY.md](./DEPLOY.md).

---

## 1. Phân Tích Các Trường Hợp Sử Dụng (Use Cases)

Hệ thống được thiết kế để phục vụ 3 nhóm tác nhân (Actors) chính trong chuỗi cung ứng nông nghiệp:

### 1.1. Nông Dân / Chủ Hợp Tác Xã (Đơn vị canh tác)
*   **Số hóa bản đồ:** Trực tiếp vẽ ranh giới không gian (Polygon) cho mảnh đất canh tác. Cơ sở dữ liệu PostGIS với hàm `ST_Intersects` sẽ hoạt động như một chốt chặn tự động để đảm bảo tính toàn vẹn của dữ liệu địa chính, ngăn chặn tranh chấp hoặc vẽ đè.
*   **Ghi nhật ký sinh trưởng:** Cập nhật liên tục các giai đoạn của mùa vụ (xuống giống, bón phân, thu hoạch) vào hệ thống `growth_status_history`.
*   **Khởi tạo lô hàng:** Chủ động tạo lô xuất xưởng (BATCH) khi đến kỳ thu hoạch, gắn liền sản phẩm vật lý với thực thể không gian trên hệ thống.

### 1.2. Cơ Quan Quản Lý / Hệ Thống Giám Sát Tự Động
*   **Tiếp nhận dữ liệu AI:** Module backend hoạt động như một webhook liên tục lắng nghe các tín hiệu (`POST /plots/disease-alert`) từ hệ thống AI (Nhóm 3).
*   **Điều phối rủi ro:** Dựa vào điểm số `confidence`, hệ thống tự động phân cấp mức độ rủi ro (`risk_level`).
*   **Giám sát vĩ mô:** Thông qua Dashboard `stats/risk` và bản đồ heatmap, cán bộ nông nghiệp có thể quan sát toàn cảnh sự phân bố của dịch bệnh để khoanh vùng dập dịch khẩn cấp.

### 1.3. Người Tiêu Dùng / Đối Tác Phân Phối
*   **Xác thực thông tin:** Quét mã QR được gắn trên bao bì sản phẩm để truy xuất dữ liệu từ API `/plots/:puc`.
*   **Đánh giá minh bạch:** Theo dõi được toàn bộ vòng đời sản phẩm: tọa độ trồng ở đâu, ai chăm sóc, và đặc biệt là khu vực đó có tiền sử cảnh báo dịch hại hay không.

---

## 2. Luồng Hoạt Động Hệ Thống (Workflows)

Hệ thống vận hành theo một vòng lặp khép kín, tối ưu hóa sự tương tác giữa Frontend (React/Leaflet), Backend (NestJS) và Database (PostGIS).

### Giai đoạn 1: Onboarding & Cấp định danh (Spatial Identity)
1.  **Input:** Tọa độ GeoJSON từ thao tác vẽ trên Map.
2.  **Validation:** API gọi PostGIS thực thi `ST_IsValid` và đối chiếu chồng chéo.
3.  **Process:** Tính toán diện tích thực tế qua `ST_Area`.
4.  **Output:** Sinh mã định danh **PUC** duy nhất và tạo tệp tĩnh QR code tại `/storage`.

### Giai đoạn 2: Tối ưu hiển thị (Viewport-based Loading)
*   Hệ thống không tải toàn bộ dữ liệu nông nghiệp quốc gia cùng lúc. Khi có sự kiện `moveend` hoặc `zoomend` trên Leaflet (có debounce 350ms), Frontend gửi tọa độ BBOX hiện tại xuống API.
*   Backend sử dụng Query không gian để chỉ bóc tách và trả về FeatureCollection của các lô đất nằm gọn trong khung hình, tối ưu hóa băng thông.

### Giai đoạn 3: Phản ứng sự cố (Incident Response)
*   Nhận tín hiệu từ AI -> Cập nhật `plots.risk_level`.
*   Mã hóa màu sắc trực tiếp trên bản đồ: Lô đất bình thường (Xanh) -> Cảnh báo nhẹ (Cam) -> Nguy cơ cao (Đỏ, nhấp nháy CSS).
*   Khi risk=2, PostGIS `ST_DWithin` (~500m) đánh dấu lô lân cận risk=1 (vùng cách ly).

### Giai đoạn 4: Đóng gói và Truy xuất (Traceability)
*   Bản ghi `shipping_logs` được tạo ra với cấu trúc mã BATCH tiêu chuẩn.
*   Trang `/trace` và landing công khai `/puc/:puc` tổng hợp `plots`, `growth_status_history`, `plot_disease_alerts` và hiển thị Timeline cho người dùng cuối.

---

## 3. Định Hướng Phát Triển Mở Rổng (Future Roadmap)

### 3.1. Nâng Cấp Kiến Trúc Hạ Tầng & Triển Khai
*   **Đóng gói và Cloud-native:** Docker Compose (dev/prod) + FE edge (Vercel). Xem [DEPLOY.md](./DEPLOY.md).
*   **Đồng bộ thời gian thực (Real-time GIS):** NestJS WebSocket gateway phát sự kiện `risk.updated` (T20).
*   **Vector Tiles:** `pg_tileserv` / MVT khi scale hàng nghìn lô (T22).

### 3.2. Tích Hợp AI & Phân Tích Dữ Liệu Sâu
*   **Computer Vision (YOLOv8):** thuộc Nhóm 3; GIS chỉ nhận webhook + có thể mở rộng contract bbox/mask GeoJSON.
*   **Spatial Buffering:** `ST_Buffer` / `ST_DWithin` khi risk=2 (T19).

### 3.3. Trải Nghiệm Người Dùng (UX) & Thực Tiễn
*   **GPS walk-to-draw (PWA):** T23.
*   **IoT micro-climate:** bảng timeseries + API (T24).
