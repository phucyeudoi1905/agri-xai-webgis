# Scale & UX specs (T22 / T23)

## T22 — Vector tiles (MVT)

Khi số lô > vài nghìn, GeoJSON bbox sẽ nặng. Hướng triển khai:

1. Chạy [`pg_tileserv`](https://github.com/CrunchyData/pg_tileserv) cạnh PostGIS, publish layer `plots.boundary` + properties `puc, risk_level, plot_name`.
2. FE: thay `PlotLayer` GeoJSON bằng Leaflet VectorGrid / maplibre nguồn `{z}/{x}/{y}.pbf`.
3. Giữ API bbox cho list sidebar (phân trang) hoặc query MVT attributes.

Chưa bật trong compose mặc định — bật khi đo FPS map < 30 với dataset thật.

## T23 — GPS walk-to-draw + nhập sổ đất (admin)

### A. Đi bộ ranh giới (PWA / mobile)
1. Trên `/map`, bật chế độ **GPS ranh giới** (toolbar).
2. `navigator.geolocation.watchPosition` ghi chuỗi `[lng,lat]`, tối thiểu 3 điểm, khép polygon.
3. Cài PWA: `manifest.webmanifest` + service worker cache shell (bổ sung khi đóng gói mobile).
4. Sai số GPS ngoài trời: làm mượt bằng khoảng cách tối thiểu giữa các điểm (~3–5 m).

### B. Admin nhập theo sổ đất / biên bản đo
1. Toolbar **Nhập sổ đất** mở form khai báo.
2. Admin chọn **số điểm mốc** (số đỉnh đa giác, ≥ 3).
3. Nhập **vĩ độ / kinh độ** từng đỉnh (WGS84 EPSG:4326), hoặc:
   - Dán hàng loạt `lat,lng` từng dòng;
   - Gán **GPS hiện tại** vào một đỉnh (nút định vị trên từng hàng).
4. Hệ thống khép polygon → mở modal lưu lô + cấp PUC (cùng luồng `POST /plots`, vẫn chống đè `ST_Intersects`).
5. Bản đồ `fitBounds` theo đa giác vừa nhập để admin đối chiếu ảnh vệ tinh.

Thứ tự ưu tiên nhập liệu: sổ đất (B) cho văn phòng / HTX; GPS walk (A) cho khảo sát hiện trường.
