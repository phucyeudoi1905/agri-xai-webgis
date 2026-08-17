# Agri XAI — Web GIS (Nhóm 2)

Hệ thống Web GIS nông nghiệp số theo đặc tả BA và [phân tích kiến trúc Farm-to-Fork](docs/Phan_tich_Web_GIS_Nong_Nghiep.md).

## Actors

| Actor | Việc chính | UI / API |
|-------|------------|----------|
| Nông dân / HTX | Vẽ lô, sinh trưởng, xuất xưởng | `/map`, `/plots` |
| Cơ quan / AI | Dashboard rủi ro, webhook bệnh | `/`, `POST .../disease-alert` |
| Người tiêu dùng | Quét QR truy xuất | `/puc/:puc`, `/trace` |

## Workflows (tóm tắt)

1. **Spatial identity** — vẽ polygon → validate → `ST_Area` → PUC + QR  
2. **Viewport loading** — BBOX debounce 350ms → GeoJSON  
3. **Incident** — AI alert → risk màu + vùng cách ly 500m + WebSocket  
4. **Traceability** — BATCH + timeline trên Trace / public PUC  

Chi tiết: [docs/Phan_tich_Web_GIS_Nong_Nghiep.md](docs/Phan_tich_Web_GIS_Nong_Nghiep.md) · Ticket: [docs/TICKETS.md](docs/TICKETS.md) · Deploy: [docs/DEPLOY.md](docs/DEPLOY.md)

## Cấu trúc

```
agri-xai-webgis/
├── docker-compose.yml           # Dev: PostGIS + backend
├── docker-compose.prod.yml      # Prod-like: restart + limits + FE
├── docs/                        # BA, kiến trúc, tickets, deploy
├── gis-service/                 # NestJS + TypeORM + PostGIS
├── web-gis-frontend/            # React + Vite + Leaflet
└── scripts/                     # seed-demo, smoke-api
```

## Chạy nhanh (dev)

```bash
# Full stack DB + API
docker compose up -d

# Frontend
cd web-gis-frontend && npm install && npm run dev
```

Hoặc backend local:

```bash
docker compose up -d gis-db
cd gis-service && npm install && npm run start:dev
```

- API: http://localhost:4000  
- Health: http://localhost:4000/health  
- Swagger (dev): http://localhost:4000/docs  
- UI: http://localhost:5173  
- PostGIS: `localhost:5434` (`gis_admin` / `gis_agriculture_db`)

### Prod-like local

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### Auth ghi (khi bật)

Đặt `API_KEY` trong env. Các POST/PATCH cần header:

```http
X-API-Key: <your-key>
```

GET công khai (plots bbox, PUC, stats, health) không cần key.

## API chính

| Method | Path | UC |
|--------|------|----|
| GET | `/health` | Liveness/readiness |
| POST | `/api/v1/gis/plots` | UC-GIS-01/02 tạo lô + PUC + QR |
| GET | `/api/v1/gis/plots?bbox=` | Viewport GeoJSON |
| GET | `/api/v1/gis/plots/:puc` | Tra cứu PUC |
| PATCH | `/api/v1/gis/plots/:puc/growth-status` | UC-GIS-03 |
| POST | `/api/v1/gis/shipping` | UC-GIS-04 |
| POST | `/api/v1/gis/plots/disease-alert` | UC-GIS-05 |
| POST | `/api/v1/gis/plots/import` | Import GeoJSON |
| GET | `/api/v1/gis/plots/:puc/report.pdf` | PDF hồ sơ |
| WS | `/gis` event `risk.updated` | Realtime risk |

## Scripts

```bash
node scripts/seed-demo.mjs          # dữ liệu demo
node scripts/smoke-api.mjs          # E2E API smoke
```
