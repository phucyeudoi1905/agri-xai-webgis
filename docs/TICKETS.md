# Web GIS — Ticket Board (Nhóm 2)

Nguồn: `Phan_Tich_Toan_Dien_Web_GIS_BA.docx`  
Stack: NestJS + PostGIS | React + Leaflet | Docker

| ID | Ticket | UC | Status | Depends |
|----|--------|----|--------|---------|
| T01 | Scaffold monorepo, Docker PostGIS, DDL, Clean Architecture folders | Infra | ✅ Code done | — |
| T02 | Tạo lô đất + validate polygon + chống đè lấp + tính diện tích | UC-GIS-01 | ✅ Code done | T01 |
| T03 | Engine sinh PUC + QR Code PNG | UC-GIS-02 | ✅ Code done | T02 |
| T04 | API GeoJSON theo BBOX + tra cứu công khai PUC | API | ✅ Code done | T02 |
| T05 | Vòng đời sinh trưởng + lịch sử chuyển trạng thái | UC-GIS-03 | ✅ Code done | T02 |
| T06 | Nhật ký xuất xưởng + mã Batch | UC-GIS-04 | ✅ Code done | T02 |
| T07 | Disease alert API + máy trạng thái risk_level / đổi màu | UC-GIS-05 | ✅ Code done | T02 |
| T08 | Frontend map: BaseMap, vẽ polygon, màu rủi ro, drawer chi tiết | FE | ✅ Code done | T04, T07 |
| T09 | Dashboard thống kê diện tích / rủi ro | Analytics | ⏳ API sẵn (`/stats/*`), UI backlog | T04 |
| T10 | Import/Export Shapefile-KML-GeoJSON | Pipeline | ⏳ Backlog | T02 |
| T11 | Xuất báo cáo PDF hồ sơ lô đất | Report | ⏳ Backlog | T06, T07 |

## Runtime (đã verify 2026-08-11)

- Docker Desktop: OK (sau khi `wsl --shutdown` + relaunch)
- PostGIS: `localhost:5434` (không dùng 5432 vì bị PostgreSQL local chiếm)
- Backend: http://localhost:4000 — smoke test create/overlap/alert OK
- Frontend: http://127.0.0.1:5173
- PUC mẫu: `VN-ST-2026-000001`

## Definition of Done (chung)

- API trả về mã lỗi chuẩn: `ERR_GIS_SPATIAL_OVERLAP`, `ERR_GIS_INVALID_POLYGON`, `ERR_GIS_PUC_NOT_FOUND`
- Geometry: WGS84 EPSG:4326, Polygon khép kín ≥ 3 đỉnh, không self-intersect
- PUC: `VN-[TỈNH]-[NĂM]-[######]` UNIQUE
- Batch: `BATCH-[PUC]-[YYYYMMDD]-[STT]`
- risk_level: `0` xanh `#2E7D32` · `1` vàng `#F57F17` · `2` đỏ `#D32F2F`

## Thứ tự thực hiện

`T01 → T02 → T03 → T04 → T05 → T06 → T07 → T08 → (T09–T11 backlog)`
