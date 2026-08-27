# BÁO CÁO TỔNG KẾT BỔ SUNG TÍNH NĂNG THEO GÓP Ý HỘI ĐỒNG

**Dự án:** Agri-XAI Web GIS — Nền Tảng Bản Đồ Số Quản Lý Vùng Trồng & Chuỗi Cung Ứng Nông Nghiệp Farm-to-Fork
**Nhóm thực hiện:** Nhóm 2 — Phân hệ Web GIS
**Ngày báo cáo tiến độ:** 21/08/2026
**Ngày hoàn thiện bổ sung:** 22/08/2026
**Trạng thái sau bổ sung:** ✅ **Hoàn thành 100% — Sẵn sàng Nghiệm thu & Báo cáo (~99%)**

---

## I. BỐI CẢNH

Sau buổi báo cáo tiến độ với giảng viên hướng dẫn, hội đồng đã có một số nhận xét và yêu cầu bổ sung thêm tính năng nhằm nâng cao tính hoàn chỉnh và thực tiễn của hệ thống. Toàn bộ các góp ý đã được nhóm tiếp thu và triển khai trong đợt cập nhật **Phase 5 — Góp ý Hội đồng & GVHD**.

---

## II. NỘI DUNG GÓP Ý & HƯỚNG XỬ LÝ

### 📌 Góp ý 1: Bổ sung Phân quyền người dùng (RBAC)

> *"Hệ thống cần phân biệt rõ quyền hạn giữa các đối tượng sử dụng: cán bộ quản lý (Admin), hợp tác xã (HTX), và nông dân thực canh."*

**Hướng xử lý:** Xây dựng hệ thống Role-Based Access Control (RBAC) với 3 vai trò rõ ràng.

| Vai trò | Đại diện | Quyền hạn |
|:---|:---|:---|
| **Admin** | Chi cục Nông nghiệp / Quản lý hệ thống | Toàn quyền: xem, thêm, sửa, xóa, cảnh báo dịch bệnh |
| **HTX** | Chủ nhiệm Hợp tác xã | Quản lý lô đất trong HTX, ghi nhận mùa vụ, tạo phiếu xuất kho |
| **Nông dân** | Chủ hộ canh tác | Chỉ xem thông tin lô đất của mình, tra cứu nguồn gốc |

**File triển khai:**
- `web-gis-frontend/src/contexts/AuthContext.tsx` — Context quản lý phiên đăng nhập
- Tích hợp điều kiện ẩn/hiện chức năng trong: `PlotDetailPanel`, `AppShell`, `DashboardPage`

**Tài khoản demo:**
```
Admin:    admin@agri.vn   / admin123   (Chi cục NN Lâm Đồng)
HTX:      htx@agri.vn     / htx123     (HTX Rau Đà Lạt)
Nông dân: farmer@agri.vn  / farmer123  (Chủ hộ Nguyễn Văn An)
```

---

### 📌 Góp ý 2: Thêm Thẻ Chủ Hộ & Thông tin Thổ Nhưỡng cho từng lô đất

> *"Mỗi lô đất cần có thông tin đại diện chủ hộ và các chỉ số thổ nhưỡng cơ bản để phục vụ công tác khuyến nông."*

**Hướng xử lý:** Bổ sung 2 khối thông tin mới vào chi tiết lô đất.

#### Thẻ Chủ Hộ

| Trường | Ví dụ |
|:---|:---|
| Họ và tên | Nguyễn Văn An |
| Số điện thoại | 0901 234 567 |
| HTX trực thuộc | HTX Rau sạch Đà Lạt |
| Địa chỉ | Phường 5, Đà Lạt, Lâm Đồng |

#### Thông số Thổ Nhưỡng

| Chỉ số | Đơn vị | Ý nghĩa |
|:---|:---|:---|
| Cao độ | m (so với mực nước biển) | Phân vùng khí hậu, lựa chọn giống |
| Độ dốc | % | Nguy cơ xói mòn, thiết kế tưới tiêu |
| Loại đất | Đất feralit đỏ vàng, ... | Phù hợp với loại cây trồng |
| pH đất | 4.5 – 7.5 | Điều chỉnh phân bón, vôi hóa |
| Độ mùn hữu cơ | % | Đánh giá độ màu mỡ |

**Hiển thị tại:** `PlotDetailPanel.tsx` · `TracePage.tsx` · `PublicPucPage.tsx`

---

### 📌 Góp ý 3: Bổ sung Lịch Sử Cây Trồng của Vùng Trồng *(Góp ý trọng tâm)*

> *"Cô có góp ý là thêm lịch sử cây trồng của vùng trồng đó — giúp đánh giá được luân canh, cải tạo đất theo thời gian."*

**Hướng xử lý:** Xây dựng tính năng **Crop Rotation Timeline** — lịch sử mùa vụ và luân canh cây trồng theo từng lô đất.

#### Cấu trúc dữ liệu (Entity)

```typescript
// PlotCropHistoryEntity
{
  id: number;
  puc: string;                    // Khóa liên kết với lô đất
  season_name: string;            // VD: "Vụ Đông Xuân 2024-2025"
  crop_type: string;              // VD: "Cà phê Arabica", "Rau cải ngọt"
  start_date: Date;               // Ngày bắt đầu mùa vụ
  end_date: Date | null;          // Ngày kết thúc (null = đang canh tác)
  actual_yield_kg: number | null; // Sản lượng thực thu (kg)
  soil_note: string | null;       // Ghi chú đánh giá đất sau thu hoạch
  disease_history: string | null; // Dịch bệnh ghi nhận trong vụ
  is_current: boolean;            // Mùa vụ đang canh tác?
  created_at: Date;
}
```

#### API Endpoints

| Method | Endpoint | Mô tả |
|:---|:---|:---|
| `GET` | `/api/v1/gis/plots/:puc` | Trả về `crop_history[]` kèm chi tiết lô đất |
| `POST` | `/api/v1/gis/plots/:puc/crop-history` | Thêm mùa vụ mới / Ghi nhận luân canh |

**Payload mẫu — Thêm mùa vụ mới:**
```json
{
  "season_name": "Vụ Hè Thu 2025",
  "crop_type": "Rau cải ngọt",
  "start_date": "2025-05-01",
  "actual_yield_kg": 850,
  "soil_note": "Đất đã phục hồi độ pH sau vụ cà phê, bổ sung 200kg vôi/ha",
  "disease_history": "Không ghi nhận dịch hại",
  "is_current": true
}
```

#### Giao diện Timeline (CropHistoryTimeline.tsx)

Component hiển thị dạng **timeline dọc** với các đặc điểm:

- 🌿 Mỗi mùa vụ là một **thẻ riêng** với màu sắc phân biệt (đang canh tác = viền xanh nổi bật)
- 📅 Hiển thị khoảng thời gian (ngày bắt đầu → ngày kết thúc)
- 🏷️ Badge sản lượng (kg)
- 📋 Ghi chú thổ nhưỡng và lịch sử dịch bệnh trong vụ
- ➕ Nút **"Ghi nhận mùa vụ mới"** (hiển thị với Admin & HTX)
- ↩️ Tra cứu xuyên suốt theo mã PUC

**Tích hợp vào 3 màn hình:**

| Màn hình | Đối tượng | Mục đích |
|:---|:---|:---|
| `PlotDetailPanel` (sidebar bản đồ) | Admin, HTX | Quản lý & ghi nhận trực tiếp trên bản đồ |
| `TracePage` (`/trace`) | Tất cả | Tra cứu lịch sử từ mã QR / số PUC |
| `PublicPucPage` (`/puc/:puc`) | Người tiêu dùng | Xem nguồn gốc rõ ràng khi quét QR nông sản |

**Dữ liệu demo:** Mỗi lô đất trong hệ thống (6 lô tại Đà Lạt) được seeded sẵn **2 mùa vụ lịch sử**:
- Vụ trước: đã kết thúc, có thống kê sản lượng và ghi chú cải tạo đất
- Vụ hiện tại: đang canh tác, `is_current = true`

---

### 📌 Góp ý 4: Phiếu Xuất Kho cho mỗi lô đất

> *"Mỗi lô đất cần có phiếu xuất kho demo thể hiện chuỗi cung ứng."*

**Hướng xử lý:** Bảo đảm 100% lô đất demo có ít nhất 1 phiếu xuất kho BATCH với:
- Mã lô hàng: `BATCH-VN-LĐ-YYYYMMDD-001`
- Thông tin: sản lượng (kg), loại nông sản, điểm đến tiêu thụ, ngày xuất
- Tra cứu nhanh 1-click từ màn hình chi tiết lô đất

---

### 📌 Góp ý 5: Bản Hợp Đồng Tích Hợp 3 Nhóm

> *"Cần có tài liệu rõ ràng về cách 3 nhóm kết nối với nhau qua hệ thống."*

**Hướng xử lý:** Tạo file `docs/INTEGRATION_CONTRACT.md` — bản đặc tả API Contract đầy đủ.

Nội dung gồm:
- Sơ đồ tổng quan kết nối 3 phân hệ
- Quy ước mã khóa **PUC** là định danh xuyên suốt
- Bảng endpoint: Nhóm 3 (AI) → gọi Nhóm 2 (Web GIS)
- Payload mẫu cho webhook cảnh báo dịch bệnh
- Hướng dẫn xác thực `x-api-key`

---

## III. DANH SÁCH FILE THAY ĐỔI

### 🆕 File mới tạo

| File | Mô tả |
|:---|:---|
| `gis-service/src/entities/plot-crop-history.entity.ts` | Entity lịch sử mùa vụ |
| `gis-service/src/services/weather.service.ts` | Service stub dữ liệu vi khí hậu |
| `web-gis-frontend/src/components/crops/CropHistoryTimeline.tsx` | Component timeline lịch sử cây trồng |
| `web-gis-frontend/src/components/ui/ThemeToggle.tsx` | Nút chuyển giao diện sáng/tối |
| `web-gis-frontend/src/components/ui/WeatherCard.tsx` | Widget thời tiết thực địa (stub) |
| `web-gis-frontend/src/contexts/AuthContext.tsx` | Context quản lý đăng nhập & phân quyền RBAC |
| `web-gis-frontend/src/hooks/useTheme.tsx` | Hook quản lý theme sáng/tối |
| `docs/INTEGRATION_CONTRACT.md` | Bản hợp đồng tích hợp 3 nhóm |
| `docs/TIEN_DO_DU_AN.md` | Tài liệu tiến độ dự án (cập nhật) |

### ✏️ File cập nhật chính

| File | Thay đổi |
|:---|:---|
| `gis-service/src/app.module.ts` | Đăng ký `PlotCropHistoryEntity` |
| `gis-service/src/controllers/plot.controller.ts` | Thêm endpoint `POST :puc/crop-history` |
| `gis-service/src/services/plot.service.ts` | Logic thêm & truy vấn lịch sử mùa vụ |
| `gis-service/src/repositories/plot.repository.ts` | Hàm `updateCropType()` |
| `web-gis-frontend/src/types/gis.types.ts` | Interface `PlotCropHistory` |
| `web-gis-frontend/src/services/gisApi.ts` | Hàm `addCropSeason()` |
| `web-gis-frontend/src/components/map/PlotDetailPanel.tsx` | Tích hợp Timeline + Thẻ Chủ hộ + Thổ nhưỡng |
| `web-gis-frontend/src/pages/TracePage.tsx` | Tích hợp CropHistoryTimeline |
| `web-gis-frontend/src/pages/PublicPucPage.tsx` | Tích hợp CropHistoryTimeline |
| `web-gis-frontend/src/styles/map.css` | CSS cho timeline, thẻ chủ hộ, thổ nhưỡng |
| `scripts/seed-demo.mjs` | Seed 2 mùa vụ / lô đất cho 6 lô demo |

---

## IV. KẾT QUẢ TRƯỚC & SAU BỔ SUNG

| Tiêu chí | Trước bổ sung | Sau bổ sung |
|:---|:---:|:---:|
| Phân quyền người dùng | ❌ | ✅ RBAC 3 vai trò |
| Thẻ chủ hộ trên lô đất | ❌ | ✅ Đầy đủ |
| Thông số thổ nhưỡng | ❌ | ✅ pH, độ mùn, cao độ, độ dốc |
| Lịch sử cây trồng & luân canh | ❌ | ✅ Timeline đầy đủ |
| Phiếu xuất kho 100% lô đất | ⚠️ Một phần | ✅ 6/6 lô đất |
| Bản hợp đồng tích hợp 3 nhóm | ❌ | ✅ `INTEGRATION_CONTRACT.md` |
| Tổng tiến độ | ~96% | **~99%** |
| Tổng ticket kỹ thuật | 26 tickets | **29 tickets** |

---

## V. THỐNG KÊ COMMIT

```
Commit:  294fb81
Branch:  main
Repo:    github.com/phucyeudoi1905/agri-webgis

38 files changed
3,631 insertions(+)
677 deletions(-)

feat: add crop rotation history timeline, RBAC, soil data & integration contract
```

---

## VI. KẾT LUẬN

Toàn bộ **5 nhóm góp ý** từ hội đồng và giảng viên hướng dẫn đã được tiếp thu và triển khai hoàn chỉnh trong vòng **1 ngày** (21–22/08/2026).

Hệ thống **Agri-XAI Web GIS (Nhóm 2)** sau bổ sung đã đáp ứng đầy đủ yêu cầu:

- ✅ **Phân quyền rõ ràng** cho 3 nhóm đối tượng (Admin / HTX / Nông dân)
- ✅ **Hồ sơ lô đất toàn diện** với chủ hộ, thổ nhưỡng, lịch sử canh tác
- ✅ **Lịch sử cây trồng & luân canh** — tính năng cốt lõi mới theo đề xuất của cô
- ✅ **Chuỗi cung ứng hoàn chỉnh** từ gieo trồng → thu hoạch → xuất kho → tra cứu QR
- ✅ **Hợp đồng tích hợp** chuẩn hóa giao tiếp với Nhóm 1 và Nhóm 3

> Hệ thống hiện **sẵn sàng cho buổi nghiệm thu và báo cáo đồ án tốt nghiệp.**

---

*Tài liệu liên quan:*
- 📄 [`docs/TIEN_DO_DU_AN.md`](./TIEN_DO_DU_AN.md) — Tiến độ chi tiết 29 tickets
- 📄 [`docs/INTEGRATION_CONTRACT.md`](./INTEGRATION_CONTRACT.md) — Bản hợp đồng tích hợp 3 nhóm
- 📄 [`docs/DEPLOY.md`](./DEPLOY.md) — Hướng dẫn triển khai hệ thống
