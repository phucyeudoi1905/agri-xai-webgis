# Kế hoạch demo độc lập rồi nối API

**Dự án:** Agri-XAI Web GIS (Nhóm 13 — Hoàng Long, Nguyễn Thị Hoàng Phúc)  
**Mục đích:** Chốt cách **bảo vệ / seminar độc lập**, rồi mới **nối HTTP** với nhóm nhật ký (12) và nhóm XAI bệnh cây (14) mà không merge CSDL.  
**Trạng thái:** Bản thảo — **chờ duyệt** trước khi nối API thật.  
**Ngày soạn:** 23/09/2026  
**Hợp đồng kỹ thuật:** [INTEGRATION_CONTRACT.md](./INTEGRATION_CONTRACT.md)

> Đọc xong: đánh dấu mục 8 (Checklist duyệt). Chưa tick Pha B thì **không** gọi API nhóm khác, **không** cho họ ghi vào PostGIS của GIS.

---

## 1. Quyết định đề xuất

| Câu hỏi | Trả lời |
|---|---|
| Demo GIS khi 12/14 chưa có API? | **Có.** GIS không phụ thuộc API của họ. |
| Nối API sau có phá dữ liệu họ? | **Không**, nếu mỗi nhóm CSDL riêng và chỉ khóa chung `puc`. |
| Nối ngay 3 hệ trên một PostgreSQL? | **Không.** Đó mới là việc nguy hiểm. |

Hai pha:

```
Pha A — Demo độc lập (làm ngay, an toàn)
    GIS chạy local/Docker; 12/14 hardcode cùng danh sách PUC
        ↓ sau khi cả 3 nhóm duyệt payload
Pha B — Nối API (chỉ khi đã tick mục 8)
    14 → POST webhook GIS; 12 → GET/POST GIS theo puc
    Không copy bảng, không đổi format PUC
```

---

## 2. Ánh xạ nhóm (danh sách lớp)

Trong một số file cũ có “Nhóm 1/2/3”. **Với thầy và khi trao đổi liên nhóm, dùng số lớp:**

| Nhóm lớp | Thành viên | Phân hệ | Vai trò khi gộp |
|---|---|---|---|
| **12** | Lê Thành Thái, Nguyễn Hoàng Anh Khoa | Nhật ký canh tác, vật tư, chi phí | Gắn mọi bản ghi theo `puc` do GIS cấp |
| **13** | Hoàng Long, Nguyễn Thị Hoàng Phúc | **Web GIS** (repo này) | Polygon, PUC, QR, BATCH, vùng đệm 500 m, cổng `/trace` |
| **14** | Triệu Quang Ngọc, Đinh Lâm Gia Bảo | Chẩn đoán bệnh + XAI | POST cảnh báo `{ puc, disease_name, confidence }` |

**Nguồn sự thật (không đụng sang bảng của nhau):**

| Trường / thực thể | Chủ |
|---|---|
| Hình học thửa, `puc`, QR, `ST_Intersects`, `ST_DWithin`, BATCH | Nhóm 13 |
| Nhật ký bón phân / vật tư / chi phí theo ngày | Nhóm 12 |
| Ảnh bệnh, Grad-CAM, giải thích XAI | Nhóm 14 |
| Màu risk trên bản đồ | Nhóm 13 **sau khi** nhận webhook (Pha B) hoặc giả lập (Pha A) |

---

## 3. Danh mục PUC dùng chung (không đổi)

Ba nhóm **cùng dùng bộ mã này** cho demo. GIS đã seed các lô Đà Lạt / Cầu Đất. **Không đổi chuỗi PUC** sau khi 12/14 đã lưu mock.

| PUC | Lô (seed) | Cây | Chủ hộ (demo) | Gợi ý dùng |
|---|---|---|---|---|
| `VN-LD-2026-000001` | Dâu Tây New Zealand A1 | Dâu tây | Nguyễn Văn An | Tra cứu QR, nhật ký |
| `VN-LD-2026-000002` | Rau Thủy Canh Vạn Thành B2 | Xà lách Lolo | Trần Thị Mai | Nhật ký / vật tư |
| `VN-LD-2026-000003` | Cà Phê Arabica Cầu Đất C1 | Cà phê Arabica | K'Brông | **Lô chuẩn nối API** (nhật ký + AI) |
| `VN-LD-2026-000004` | Hoa Cúc Thái Phiên D3 | Hoa cúc | Lê Hoàng Nam | Bản đồ |
| `VN-LD-2026-000005` | Atisô Trại Mát E2 | Atisô | Phạm Đức Trọng | Láng giềng buffer (nếu AI đánh 000003) |
| `VN-LD-2026-000006` | Ớt Chuông Nhà Kính F1 | Ớt chuông | Đặng Thu Hà | Xuất BATCH |

Máy chủ GIS local: `http://localhost:4000`  
Cổng public: `http://localhost:5173/puc/VN-LD-2026-000003`

Nếu máy khác seed lại, số serial PUC có thể lệch. **Trước Pha B:** nhóm 13 xuất đúng danh sách `GET /api/v1/gis/plots` (hoặc trang `/plots`) rồi gửi 12/14. Khi lệch, lấy PUC thật trên GIS làm chuẩn — không bắt GIS đổi format.

---

## 4. Pha A — Demo độc lập (làm ngay)

### 4.1. Chạy GIS local

```bash
docker compose up -d
cd web-gis-frontend && npm run dev
```

| Dịch vụ | URL |
|---|---|
| UI | http://localhost:5173 |
| API | http://localhost:4000 |
| Health | http://localhost:4000/health |
| Swagger | http://localhost:4000/docs |

Đăng nhập UI:

| Role | Username | Mật khẩu | Vào trang |
|---|---|---|---|
| ADMIN | `admin_gis` | `AgriAdmin@2026` | Dashboard `/` |
| HTX | `htx_caudat` | `AgriHtx@2026` | Bản đồ `/map` |

Nếu thiếu lô demo:

```bash
node scripts/seed-demo.mjs http://localhost:4000
```

### 4.2. Kịch bản bảo vệ nhóm 13 (~8–10 phút)

Làm theo thứ tự. Không cần nhóm 12/14 online.

| # | Việc | Màn hình / API | Câu nói với hội đồng |
|---|---|---|---|
| 1 | Đăng nhập ADMIN, dashboard rủi ro | `/` | GIS quản lý vùng trồng cấp tỉnh theo polygon, không chỉ tem QR |
| 2 | Bản đồ Đà Lạt, click lô, panel chi tiết | `/map` | PUC gắn hình học WGS84; chống chồng lấn `ST_Intersects` |
| 3 | HTX vẽ / xem thửa, sinh trưởng, luân canh | `/map`, `/plots` | Nhật ký **mùa vụ trên thửa** là GIS; nhật ký vật tư chi tiết là nhóm 12 |
| 4 | Tạo / xem phiếu BATCH | `/trace?puc=VN-LD-2026-000003` | Lô hàng xuất xưởng gắn PUC |
| 5 | Cổng không login | `/puc/VN-LD-2026-000003` | Người mua quét QR |
| 6 | Giả lập AI (Pha A) | Swagger `POST /plots/disease-alert` | Endpoint **đã mở** cho nhóm 14; hôm nay gọi tay vì họ chưa nối |

**Giả lập nhóm 14 (không đụng CSDL họ):** mở Swagger hoặc PowerShell — `confidence` trên GIS là **thang 0–100** (`≥ 80` → Risk 2). Hợp đồng cũ ghi `0.94` (0–1) — **chốt với nhóm 14 trước Pha B** (mục 6.1).

```powershell
Invoke-RestMethod -Method POST -Uri http://localhost:4000/api/v1/gis/plots/disease-alert `
  -ContentType 'application/json' `
  -Body '{"puc":"VN-LD-2026-000003","disease_name":"Bệnh Rỉ Sắt Cà Phê (Hemileia vastatrix)","confidence":94}'
```

Kỳ vọng: lô `000003` Risk 2 (đỏ); lô trong 500 m (thường `000005` nếu geometry seed còn) Risk 1; bản đồ `/map` đổi màu qua WebSocket.

Dev mặc định `API_KEY` trống — POST không cần header. Khi bật khóa: thêm `X-API-Key`.

### 4.3. Việc nhóm 12 / 14 làm ở Pha A (không HTTP)

Gửi họ **chỉ** bảng PUC mục 3 + URL public. Họ:

- Nhóm 12: form nhật ký có field `puc` = `VN-LD-2026-000003` (hardcode / dropdown).
- Nhóm 14: kết quả XAI lưu `puc` cùng mã; **chưa** POST sang GIS.
- Không xin dump PostGIS, không vẽ lại polygon.

Câu họ nói khi bảo vệ: *“Khóa liên kết với Web GIS là PUC; API HTTP nối sau khi contract ổn định.”*

---

## 5. Pha B — Nối API (chỉ sau khi duyệt mục 8)

Không gộp database. Chỉ HTTP. Môi trường **staging / local**, không đụng data demo đang dùng bảo vệ nếu chưa backup.

### 5.1. Thứ tự nối (một lô trước)

1. Backup / ghi nhận PUC đang có trên GIS (`GET` stats hoặc `/plots`).
2. Nhóm 14 gọi **một lần** webhook vào `000003` (payload mục 6).
3. Kiểm tra bản đồ: tâm dịch + buffer; GIS **không** lưu ảnh gốc — chỉ `xai_overlay_url` nếu họ gửi.
4. Nhóm 12 `GET http://localhost:4000/api/v1/gis/plots/VN-LD-2026-000003` — lấy thổ nhưỡng / mùa vụ GIS.
5. (Tuỳ chọn) Nhóm 12 `POST .../plots/VN-LD-2026-000003/crop-history` khi **đổi vụ** — không POST từng lần bón phân.
6. Mở `/puc/VN-LD-2026-000003`: GIS + (sau này) link/embed nhật ký 12 + overlay 14.

Nếu payload lệch: **sửa adapter phía 12/14**, không đổi schema GIS giữa kỳ bảo vệ.

### 5.2. Việc cấm khi nối

- User SQL / quyền ghi trực tiếp vào `gis_agriculture_db`
- Đổi format `VN-[TỈNH]-[NĂM]-[6 SỐ]`
- GIS import nhật ký vật tư vào PostGIS
- Nhóm 14 `UPDATE` polygon / `puc`
- Nối production trước khi thử xong 1 PUC trên local
- Hai bên cùng coi `crop_type` là nguồn sự thật (GIS giữ cây trên thửa; 12 giữ nhật ký chi tiết)

---

## 6. Hợp đồng payload (chốt với 12/14)

Chi tiết đầy đủ: [INTEGRATION_CONTRACT.md](./INTEGRATION_CONTRACT.md). Dưới đây là bản **rút gọn để duyệt**.

### 6.1. Nhóm 14 → GIS — cảnh báo bệnh

`POST /api/v1/gis/plots/disease-alert`  
Header (khi bật): `X-API-Key`, `Content-Type: application/json`

```json
{
  "puc": "VN-LD-2026-000003",
  "disease_name": "Bệnh Rỉ Sắt Cà Phê (Hemileia vastatrix)",
  "confidence": 94,
  "xai_overlay_url": "https://example.invalid/xai/VN-LD-2026-000003-gradcam.png"
}
```

| Field | Bắt buộc | Ghi chú |
|---|---|---|
| `puc` | Có | Phải tồn tại trên GIS |
| `disease_name` | Có | ≤ 100 ký tự |
| `confidence` | Có | **Code hiện tại: 0–100.** `≥ 80` → Risk 2; `50–79` → Risk 1. **[Cần chốt với nhóm 14: 0–100 hay 0–1]** |
| `xai_overlay_url` | Không | GIS chỉ lưu URL, không lấy file ảnh |
| `risk_level` | Không | GIS tự map từ `confidence` nếu bỏ trống |

GIS trả `epicenter_puc`, `risk_level`, buffer 500 m, danh sách lô láng giềng. Không ghi CSDL nhóm 14.

### 6.2. Nhóm 12 ← GIS — đọc thửa

`GET /api/v1/gis/plots/{puc}` — công khai (không API key).  
Dùng để hiện tên lô, cây, thổ nhưỡng, `crop_history` **cấp mùa vụ**.

### 6.3. Nhóm 12 → GIS — ghi mùa vụ (không phải nhật ký ngày)

`POST /api/v1/gis/plots/{puc}/crop-history`

Chỉ khi **đổi vụ / luân canh**. Nhật ký bón phân theo giờ **ở lại hệ nhóm 12**.

---

## 7. Rủi ro và cách xử lý

| Rủi ro | Mức | Xử lý |
|---|---|---|
| PUC trên máy GIS khác seed (`000007` thay vì `000003`) | Trung bình | Xuất danh sách thật trước Pha B; 12/14 cập nhật mock |
| `confidence` 0.94 bị GIS hiểu là Risk 0 | Cao | Chốt thang 0–100; adapter nhóm 14 nhân 100 nếu model ra 0–1 |
| Nối nhầm DB chung | Cao | Cấm; chỉ HTTP + `puc` |
| Webhook spam làm đỏ cả bản đồ lúc bảo vệ | Trung bình | Pha A: gọi tay 1 lần; Pha B: API key + thử trên staging |
| Báo cáo ghi “Nhóm 2 = GIS” lệch số lớp 13 | Thấp | Nói rõ: nhóm lớp 13 = phân hệ GIS |

---

## 8. Checklist duyệt (nhóm 13)

Đánh dấu trước khi làm Pha B hoặc gửi file này cho 12/14.

**Pha A (độc lập)**

- [ ] Đồng ý demo GIS không chờ API 12/14
- [ ] Giữ nguyên bộ PUC mục 3 (hoặc đính kèm danh sách xuất từ máy demo)
- [ ] Giả lập AI bằng Swagger/POST tay, không cần server nhóm 14
- [ ] Gửi bảng PUC + URL `/puc/:puc` cho 12/14 (hardcode, chưa HTTP)

**Hợp đồng**

- [ ] Chốt `confidence` 0–100 với nhóm 14
- [ ] Nhóm 12 không POST từng lần bón phân vào GIS
- [ ] Không chia sẻ user PostgreSQL GIS

**Pha B (nối API) — để trống cho đến khi cả 3 nhóm sẵn sàng**

- [ ] Đã thử `GET /plots/VN-LD-2026-000003` từ máy nhóm 12
- [ ] Đã thử **một** `POST /disease-alert` từ máy nhóm 14
- [ ] Bản đồ đổi màu, không sửa polygon
- [ ] Có kế hoạch tắt nối (chạy lại Pha A) nếu bảo vệ cần GIS “sạch”

---

## 9. Việc **chưa** làm trong repo (cố ý)

Bản này **chỉ là kế hoạch**. Chưa implement:

- Nút UI “giả lập cảnh báo AI”
- Adapter gọi API nhóm 12/14 (họ chưa có)
- Đổi schema / format PUC
- Merge Docker 3 nhóm

Sau khi duyệt, có thể làm tiếp (từng việc, ticket riêng): nút giả lập trên `/map`, script `scripts/simulate-group14-alert.mjs`, hoặc 1 trang “Hướng dẫn nhóm 12/14” PDF rút từ mục 3–6.

---

## 10. Câu nói gợi ý khi bảo vệ

> Phân hệ Web GIS (nhóm 13) là nền danh tính không gian: cấp PUC, bản đồ, QR, BATCH và webhook dịch tễ. Nhóm 12 và 14 đang phát triển song song, khóa chung là mã PUC. Chúng em demo GIS độc lập; khi API họ sẵn sàng chỉ cần gọi đúng contract — không gộp cơ sở dữ liệu, tránh lệch dữ liệu lớn giữa các nhóm.
