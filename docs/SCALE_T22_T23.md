# Scale & UX specs (T22 / T23)

## T22 — Vector tiles (MVT)

Khi số lô > vài nghìn, GeoJSON bbox sẽ nặng. Hướng triển khai:

1. Chạy [`pg_tileserv`](https://github.com/CrunchyData/pg_tileserv) cạnh PostGIS, publish layer `plots.boundary` + properties `puc, risk_level, plot_name`.
2. FE: thay `PlotLayer` GeoJSON bằng Leaflet VectorGrid / maplibre nguồn `{z}/{x}/{y}.pbf`.
3. Giữ API bbox cho list sidebar (phân trang) hoặc query MVT attributes.

Chưa bật trong compose mặc định — bật khi đo FPS map < 30 với dataset thật.

## T23 — GPS walk-to-draw (PWA)

1. Trên `/map`, bật chế độ “Đi bộ ranh giới” (đã có nút GPS track cơ bản trên toolbar).
2. `navigator.geolocation.watchPosition` ghi chuỗi `[lng,lat]`, tối thiểu 3 điểm, khép polygon.
3. Cài PWA: `manifest.webmanifest` + service worker cache shell (bổ sung khi đóng gói mobile).
4. Sai số GPS ngoài trời: làm mượt bằng khoảng cách tối thiểu giữa các điểm (~3–5 m).
