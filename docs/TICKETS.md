# Web GIS — Ticket Board (Nhóm 2)

Nguồn: `Phan_Tich_Toan_Dien_Web_GIS_BA.docx` + [Phan_tich_Web_GIS_Nong_Nghiep.md](./Phan_tich_Web_GIS_Nong_Nghiep.md)  
Stack: NestJS + PostGIS | React + Leaflet | Docker  
Deploy: [DEPLOY.md](./DEPLOY.md)

## Phase 0 — MVP (Done)

| ID | Ticket | UC | Status | Depends |
|----|--------|----|--------|---------|
| T01 | Scaffold monorepo, Docker PostGIS, DDL, Clean Architecture folders | Infra | ✅ Done | — |
| T02 | Tạo lô đất + validate polygon + chống đè lấp + tính diện tích | UC-GIS-01 | ✅ Done | T01 |
| T03 | Engine sinh PUC + QR Code PNG | UC-GIS-02 | ✅ Done | T02 |
| T04 | API GeoJSON theo BBOX + tra cứu công khai PUC | API | ✅ Done | T02 |
| T05 | Vòng đời sinh trưởng + lịch sử chuyển trạng thái | UC-GIS-03 | ✅ Done | T02 |
| T06 | Nhật ký xuất xưởng + mã Batch | UC-GIS-04 | ✅ Done | T02 |
| T07 | Disease alert API + máy trạng thái risk_level / đổi màu | UC-GIS-05 | ✅ Done | T02 |
| T08 | Frontend map + SaaS shell (Dashboard / Map / Plots / Trace) | FE | ✅ Done | T04, T07 |
| T09 | Dashboard thống kê diện tích / rủi ro | Analytics | ✅ Done | T04 |

## Phase 1 — Productize (T12–T18)

| ID | Ticket | Status | Depends |
|----|--------|--------|---------|
| T12 | Health/readiness API + FE ping `/health` | ✅ Done | T01 |
| T13 | Logging + `X-Request-Id` interceptor | ✅ Done | T12 |
| T14 | Rate-limit + CORS whitelist + Swagger chỉ non-prod | ✅ Done | T12 |
| T15 | QR volume + FE Dockerfile + `.dockerignore` | ✅ Done | T01 |
| T16 | `docker-compose.prod.yml` (restart, limits) | ✅ Done | T15 |
| T17 | E2E smoke script API | ✅ Done | T02–T07 |
| T18 | API key guard cho API ghi; GET public vẫn mở | ✅ Done | T14 |

## Phase 2 — Cloud MVP

| ID | Ticket | Status | Depends |
|----|--------|--------|---------|
| T25 | GitHub Actions CI (lint/build FE + Nest) | ✅ Done | T16 |
| T26 | Hướng dẫn deploy HTTPS / Vercel / VPS ([DEPLOY.md](./DEPLOY.md)) | ✅ Done | T16 |

## Phase 3 — Mở rộng theo MD

| ID | Ticket | Status | Depends |
|----|--------|--------|---------|
| T19 | ST_DWithin vùng cách ly 500m khi risk=2 | ✅ Done | T07 |
| T20 | WebSocket `risk.updated` realtime | ✅ Done | T19 |
| T10 | Import GeoJSON (multi-feature) | ✅ Done | T02 |
| T11 | Xuất PDF hồ sơ lô đất | ✅ Done | T06, T07 |
| T21 | Public Trace landing `/puc/:puc` (QR lookup) | ✅ Done | T08 |
| T22 | Vector tiles / MVT (pg_tileserv) — scaffold docs | 📋 Spec ready | Scale |
| T23 | GPS walk + **nhập sổ đất (số đỉnh + tọa độ)** | ✅ UI done | T08 |
| T24 | IoT micro-climate timeseries — DDL + API stub | ✅ Stub | T01 |

## Runtime

- PostGIS: `localhost:5434` (tránh xung đột PostgreSQL local :5432)
- Backend: http://localhost:4000 — Swagger `/docs` (dev)
- Frontend: http://localhost:5173
- Health: `GET /health`
- Demo seed: `node scripts/seed-demo.mjs`
- Smoke: `node scripts/smoke-api.mjs`

## Definition of Done (chung)

- API lỗi chuẩn: `ERR_GIS_SPATIAL_OVERLAP`, `ERR_GIS_INVALID_POLYGON`, `ERR_GIS_PUC_NOT_FOUND`
- Geometry: WGS84 EPSG:4326, Polygon khép kín ≥ 3 đỉnh
- PUC: `VN-[TỈNH]-[NĂM]-[######]` UNIQUE
- Batch: `BATCH-[PUC]-[YYYYMMDD]-[STT]`
- risk_level: `0` `#2E7D32` · `1` `#F57F17` · `2` `#D32F2F`
- Ghi API (POST/PATCH) yêu cầu header `X-API-Key` khi `API_KEY` được cấu hình

## Thứ tự thực hiện

`T01–T09 → T12–T18 → T25–T26 → T19 → T20 → T10 → T11 → T21 → (T22–T24 scale)`
