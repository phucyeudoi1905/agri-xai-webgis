# Agri XAI — Web GIS (Nhóm 2)

Hệ thống Web GIS nông nghiệp số theo đặc tả BA (`docs/Phan_Tich_Toan_Dien_Web_GIS_BA.docx`).

## Cấu trúc

```
agri-xai-webgis/
├── docker-compose.yml          # PostGIS + GIS backend
├── docs/TICKETS.md             # Tiến trình ticket
├── gis-service/                # NestJS + TypeORM + PostGIS
└── web-gis-frontend/           # React + Vite + Leaflet
```

## Chạy nhanh

```bash
# 1. Database (host port 5434 — tránh xung đột PostgreSQL local :5432)
docker compose up -d gis-db

# 2. Backend
cd gis-service
npm install
npm run start:dev

# 3. Frontend
cd ../web-gis-frontend
npm install
npm run dev
```

- API: http://localhost:4000  
- Swagger: http://localhost:4000/docs  
- Map UI: http://localhost:5173  
- PostGIS: `localhost:5434` (user `gis_admin` / db `gis_agriculture_db`)

## API chính

| Method | Path | UC |
|--------|------|----|
| POST | `/api/v1/gis/plots` | UC-GIS-01/02 tạo lô + PUC + QR |
| GET | `/api/v1/gis/plots?bbox=minX,minY,maxX,maxY` | Viewport GeoJSON |
| GET | `/api/v1/gis/plots/:puc` | Tra cứu PUC |
| PATCH | `/api/v1/gis/plots/:puc/growth-status` | UC-GIS-03 |
| POST | `/api/v1/gis/shipping` | UC-GIS-04 |
| POST | `/api/v1/gis/plots/disease-alert` | UC-GIS-05 |

Xem tiến độ: [docs/TICKETS.md](docs/TICKETS.md)
