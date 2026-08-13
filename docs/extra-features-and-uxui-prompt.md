# Tài liệu: Tính năng bổ sung & Prompt tạo UX/UI demo

Mục đích: Liệt kê các tính năng có thể bổ sung cho dự án agri-xai-webgis và cung cấp prompt sẵn dùng để gửi vào công cụ tạo giao diện/UX (ví dụ: Stitch AI hoặc Figma plugin) để sinh demo UX/UI trước khi triển khai.

---

## 1) Các tính năng bổ sung đề xuất
Mỗi tính năng có mô tả ngắn và tiêu chí chấp nhận (acceptance criteria).

1. Real-time Monitoring (WebSocket)
   - Mô tả: Cập nhật cảnh báo, trạng thái inference jobs, và activity feed theo thời gian thực.
   - AC: Activity feed và KPI cards tự cập nhật khi có sự kiện mới trong vòng <5s.

2. Predictive Analytics & Yield Forecasting
   - Mô tả: Sử dụng lịch sử phát hiện + thời tiết để dự báo năng suất và rủi ro dịch bệnh.
   - AC: Bảng dự báo trên dashboard và biểu đồ tương tác lịch sử vs dự báo.

3. Mobile Offline Mode & Sync
   - Mô tả: Ứng dụng web/mobile có khả năng lưu trữ bản đồ vùng và các parcel khi offline, sync khi online.
   - AC: Cho phép download region cache; khi offline có thể xem parcel và tạo ghi chú, sau đó sync khi kết nối.

4. Multi-sensor Fusion (Satellite + Drone + IoT)
   - Mô tả: Kết hợp nhiều nguồn dữ liệu (Sentinel/Planet, drone imagery, cảm biến đất) và biểu diễn layers kết hợp.
   - AC: Layer selector cho từng nguồn, overlay NDVI/thermal/soil-sensor time series.

5. Advanced Annotation & Labeling Tool
   - Mô tả: Công cụ đánh dấu vùng bệnh, ghi chú bounding box/polygon để tạo bộ dữ liệu huấn luyện.
   - AC: Lưu annotation vào DB; export annotations (COCO/GeoJSON)

6. Model Management & A/B Testing
   - Mô tả: Quản lý nhiều phiên bản model, chạy A/B test, so sánh kết quả.
   - AC: UI để chọn model cho inference job, bảng so sánh metrics.

7. Automated Mosaic / Image Preprocessing Pipeline
   - Mô tả: Tự động ghép ảnh, cân chỉnh màu, và tạo tiles để hiển thị trên bản đồ.
   - AC: Job queue hiển thị trạng thái mosaic jobs và thumbnails kết quả.

8. Geofencing & Alerts Scheduling
   - Mô tả: Định nghĩa vùng geofence, cấu hình rule để gửi alert (email/SMS/webhook) theo điều kiện.
   - AC: UI tạo geofence, rule editor, và lịch sử alert gửi.

9. Role-based Dashboards & Permissions
   - Mô tả: Dashboard tùy theo vai trò (Farmer / Agronomist / Manager / Admin) với quyền truy cập khác nhau.
   - AC: Tài khoản test cho 3 vai trò; mỗi vai trò chỉ thấy hành động được phép.

10. Audit Logs & Compliance Export
   - Mô tả: Ghi lại mọi hành động CRUD trên parcel, model và traceability events; export cho kiểm toán.
   - AC: Báo cáo audit với bộ lọc thời gian, user, action; export CSV/PDF.

11. One-click Reporting (PDF / CSV) & Scheduled Reports
   - Mô tả: Xuất báo cáo nhanh theo khu vực, crop, date-range; có thể schedule gửi định kỳ.
   - AC: Generate report; tải về PDF/CSV; scheduling job lưu cấu hình.

12. Collaboration: Shared Projects & Comments
   - Mô tả: Cho phép nhiều user cùng làm việc trên 1 project/parcel, comment trên map/object.
   - AC: Comments thread trên Parcel Detail, mentions @user, và notification.

13. Map Snapshot & Share
   - Mô tả: Lưu ảnh chụp bản đồ (with layers) và chia sẻ link/PNG.
   - AC: Generate snapshot with current layers, bbox, legend; public/private link option.

14. Performance Enhancements: Clustering, Vector Tiles, Canvas Layer
   - Mô tả: Hỗ trợ hiển thị hàng nghìn điểm/polygons bằng clustering hoặc vector tiles.
   - AC: Map hiển thị nhanh với >10k features; toggle clustering on/off.

15. Localization & Multi-language
   - Mô tả: Hỗ trợ nhiều ngôn ngữ (Tiếng Việt, English), locale-aware dates.
   - AC: UI switch language; translations for core pages.

16. Accessibility Mode & Dark Theme
   - Mô tả: High-contrast mode, keyboard navigation, dark theme.
   - AC: Toggle để bật dark & high-contrast; ARIA labels cho controls.

17. API Keys & External Integrations
   - Mô tả: Quản lý API keys, webhook endpoints, tích hợp dịch vụ bên ngoài (e.g., weather API).
   - AC: UI tạo/revoke API keys và docs mẫu cho tích hợp.

18. Dataset Versioning & Provenance
   - Mô tả: Lưu version cho dataset/annotations để trace model training data.
   - AC: List versions, diff metadata, download specific version.

---

## 2) Prompt chuẩn để tạo UX/UI demo (bản tiếng Việt) — dán vào Stitch AI / Figma plugin
Dán toàn bộ nội dung sau vào công cụ tạo giao diện để sinh mockup & prototype tương tác.

Bạn là một công cụ thiết kế & sinh mã (Stitch AI / Figma plugin). Nhiệm vụ: Tạo một UX/UI demo (interactive prototype + mã mẫu React+TypeScript UI components) cho dự án "agri-xai-webgis". Mục tiêu: demo map-centric dashboard mới bao gồm các tính năng cốt lõi hiện có và một số tính năng bổ sung được liệt kê dưới đây. Yêu cầu rõ ràng:

1) Scope & Không thay đổi backend
- Không thay đổi API contract hay logic backend. Giao diện chỉ gọi các endpoint hiện có (giả định endpoints: /api/kpis, /api/parcels, /api/detections, /api/jobs, /api/traceability). Nếu cần mock data, cung cấp fixture JSON.

2) Deliverables
- 3 mockups Figma (Desktop 1440px, Tablet 768px, Mobile 375px).
- 1 interactive prototype (clickable) cho flows: Dashboard -> Map View -> Parcel Detail -> Upload/Inference.
- Component library (thumbnails + names) và design tokens (colors, typography, spacing) xuất dưới dạng JSON.
- Skeleton code: React + TypeScript TSX components (AppShell, MapCanvas, KPICard, TrendChart, ParcelTable, ParcelDetail, UploadModal) với sample props và mock data.
- Storybook stories cho các component chính.

3) Core screens & interactions
- Dashboard (map-first): lớn MapCanvas bên trái/phía trên, KPI cards, TrendChart, Recent Activity, Geographic Distribution.
- Map View (full-screen): toolbar (draw, measure, basemap select, layer opacity), layer panel, search, cluster toggle.
- Parcel Detail: metadata, images gallery, detection results viewer (heatmap + boxes), traceability timeline, comments.
- Upload/Inference flow: UploadDropzone -> Job config (select model, params) -> Submit -> Job progress + result preview.

4) Các tính năng bổ sung ưu tiên thử nghiệm trong demo
- Real-time activity feed (simulated)
- Map snapshot & share
- Layer opacity slider & timeline scrubber for detection overlays
- Annotation tool (basic) to mark disease region and save as GeoJSON
- Role-based UI mock (Farmer vs Agronomist) — show/hide admin controls

5) Visual style
- Palette: primary green (#2B8F6E), accent orange (#F6A623), neutral gray scale; provide dark theme variant
- Typography: Inter or Poppins; sizes: base 16px
- Spacing: 8px baseline
- Accessibility: ensure color contrast WCAG 2.1 AA

6) Acceptance criteria
- Prototype interactive for flows mentioned; components exportable as TSX; sample mock data included.
- Provide a short README hướng dẫn chạy prototype locally (npm/yarn) và cách switch mock API vs real API.

---

## 3) Prompt ngắn tiếng Anh (tùy dùng nếu Stitch AI hoạt động tốt hơn với tiếng Anh)
Please act as a UI/UX design and code generation tool (Stitch AI / Figma plugin). Create a map-centric dashboard prototype and a small React+TypeScript component library for the repo "agri-xai-webgis". Keep backend APIs unchanged; mock data where needed. Deliver Figma mockups (Desktop/Tablet/Mobile), interactive prototype, design tokens (JSON), and skeleton TSX components (AppShell, MapCanvas, KPICard, TrendChart, ParcelTable, ParcelDetail, UploadModal). Prioritize: map-first layout, detection overlay controls, upload/inference flow, role-based UI, and map snapshot/share. Include README with run instructions.

---

## 4) Hướng dẫn thêm để developer
- Nơi để lưu demo: `docs/ux-ui-demo` (mocks + design tokens + sample fixtures)
- Component file suggestions: `src/components/ui/KPICard.tsx`, `src/components/map/MapCanvas.tsx`, `src/pages/dashboard/Dashboard.tsx`
- Mock API fixtures: `docs/ux-ui-demo/fixtures/kpis.json`, `parcels.json`, `detections.json`, `jobs.json`
- Branch suggestion: `feat/ui-demo/stitch`

---

Nếu bạn muốn, tôi sẽ:
- Tạo folder `docs/ux-ui-demo` và thêm các fixture JSON + README mẫu.
- Chuyển prompt tiếng Việt sang 1 file ngắn hơn để dán nhanh.

Yêu cầu bạn chọn: tạo file fixture & README mẫu bây giờ không?