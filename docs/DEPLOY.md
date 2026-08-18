# Deploy Guide — AgriLens GIS (Phase 2)

## Local production-like

```bash
# Optional .env next to compose:
# API_KEY=change-me
# CORS_ORIGINS=http://localhost:8080
# PUBLIC_BASE_URL=http://localhost:4000
# FRONTEND_PUBLIC_URL=http://localhost:8080

docker compose -f docker-compose.prod.yml up -d --build
```

- UI: http://localhost:8080  
- API: http://localhost:4000  
- Health: http://localhost:4000/health  
- Swagger: **tắt** khi `NODE_ENV=production`

Smoke:

```bash
node scripts/smoke-api.mjs http://localhost:4000
# với API_KEY:
node scripts/smoke-api.mjs http://localhost:4000 change-me
```

Migrate climate table trên volume cũ:

```bash
docker exec -i gis_postgis_db psql -U gis_admin -d gis_agriculture_db < gis-service/db/migrate_t24_climate.sql
```

## VPS (Docker)

1. Clone repo, cài Docker.
2. Đặt secrets trong `.env` (`POSTGRES_PASSWORD`, `API_KEY`, `JWT_SECRET`, `CORS_ORIGINS`, `PUBLIC_BASE_URL`, `FRONTEND_PUBLIC_URL` = domain HTTPS).
3. `docker compose -f docker-compose.prod.yml up -d --build`
4. Reverse proxy (Caddy/Nginx) TLS → `:8080` (FE) và `:4000` (API) hoặc chỉ expose FE + proxy `/api` và `/storage` `/health` `/gis` (WS) tới backend.

### Caddy ví dụ

```caddyfile
api.example.com {
  reverse_proxy localhost:4000
}
app.example.com {
  reverse_proxy localhost:8080
}
```

Đặt `CORS_ORIGINS=https://app.example.com`, `PUBLIC_BASE_URL=https://api.example.com`, `FRONTEND_PUBLIC_URL=https://app.example.com`.

## Frontend trên Vercel

1. Root: `web-gis-frontend`
2. Build: `npm run build` · Output: `dist`
3. Env: `VITE_GIS_API_URL`, `VITE_GIS_WS_URL`, `VITE_GIS_API_KEY` (nếu bật)
4. SPA rewrites: tất cả → `/index.html`

API vẫn host Docker/Cloud Run; QR `PUBLIC_BASE_URL` phải là URL API công khai.

## Managed PostGIS

Trỏ `DATABASE_HOST/PORT/USER/PASSWORD/NAME` của `gis-backend` tới Cloud SQL / RDS (bật PostGIS). Chạy `gis-service/db/init.sql` một lần. Volume QR: gắn disk hoặc sync object storage (mở rộng sau).

## Backup

- DB: `pg_dump -U gis_admin gis_agriculture_db > backup.sql`
- QR: sao lưu Docker volume `qr_storage`

## CI

GitHub Actions (`.github/workflows/ci.yml`) chạy lint/build FE + build Nest trên mỗi push/PR.
