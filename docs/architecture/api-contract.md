# Hợp đồng API HTTP — pi-backend (MVP)

## Nguồn sự thật (tránh nhiều bản “hợp đồng” lệch nhau)

| Loại | Nguồn chính |
|------|-------------|
| **Quyết định kiến trúc / ràng buộc** | `docs/decisions/decision-log.md` (+ mirror `restaurant-pi-pic/docs/decisions/decision-log.md` khi có) |
| **Mô tả DB & luồng nghiệp vụ** | `docs/architecture/db-schema.md`, `docs/architecture/pi-backend-flow.md`, `docs/architecture/pic-ingress.md` |
| **Danh sách endpoint & payload (tóm tắt)** | File này + **OpenAPI** tại `/docs` khi chạy server (khớp mã `pi-backend/app/`) |

Nếu mâu thuẫn: ưu tiên **decision-log** cho policy; **mã + OpenAPI** cho chi tiết triển khai; cập nhật lại các file `docs/architecture/*.md` khi đổi API có chủ đích.

---

**Base URL (local):** `http://127.0.0.1:8000`  
**Prefix:** `/api/v1`  
**OpenAPI:** `/docs` (tự sinh)

Tài liệu này tóm tắt endpoint cho **customer-web** / **admin-web**; chi tiết field xem OpenAPI.

## Khách (`/api/v1/customer/...`)

| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/tables/{table_id}` | Thông tin bàn theo `table_id` (số, = `dining_table.code`) |
| GET | `/menu` | Thực đơn + danh sách category cố định |
| GET | `/tables/{table_id}/orders/active` | Đơn active (hoặc `{ "order": null }`) |
| POST | `/tables/{table_id}/orders/active` | Tạo/cập nhật đơn active (thay toàn bộ dòng giỏ) |
| POST | `/tables/{table_id}/payment/request` | Khách yêu cầu thanh toán (đơn phải `DONE`) |

### POST body đơn (JSON)

Hỗ trợ **camelCase** (khớp frontend):

```json
{
  "lines": [
    { "menuItemId": "canh-rau", "quantity": 1, "lineNote": "" }
  ],
  "orderNote": ""
}
```

### Lỗi nghiệp vụ (rút gọn)

HTTP 4xx với `detail`: `{ "code": "...", "message": "..." }` — ví dụ `TABLE_CLOSED_FOR_ORDER`, `ORDER_NOT_DONE`, `NOT_SETTLED`.

## Quản trị (`/api/v1/admin/...`)

| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/tables/overview` | Tổng quan bàn (hàng + KPI có thể tính phía client) |
| GET | `/payments/queue` | Hàng chờ thanh toán (`Payment=REQUESTED`) |
| GET | `/tables/{table_id}/orders/detail` | Chi tiết đơn active + dòng + payment |
| POST | `/tables/{table_id}/reset` | Reset bàn **chỉ khi** `SETTLED` → `IDLE` |

**Lưu ý (DESIGN / A02.2):** web admin **không** là nơi chốt tiền chính; chốt qua PIC `CMD_COUNTER_PAID` (xử lý trong `pic_commands.py`, sau này gắn RF).

## Dev-only (`/api/v1/dev/...`) — **chỉ khi `PI_DEBUG=1`**

| Method | Path | Mô tả |
|--------|------|--------|
| POST | `/tables/{table_id}/kitchen-done` | Giả `CMD_KITCHEN_DONE` cho đơn **active** của bàn (test local / Swagger) |
| POST | `/tables/{table_id}/counter-paid` | Giả `CMD_COUNTER_PAID` theo `table_id` — `Payment` **REQUESTED** → **PAID**, bàn → **SETTLED** (idempotent nếu đã PAID) |

**Quy tắc:**

- Khi **`PI_DEBUG` tắt:** các route này **không được mount** → client nhận **404** (không lộ surface dev trên bản chạy “gần production”).
- **Không** dùng trên Pi demo công khai / bảo vệ nếu không chủ đích mở debug.
- Mã xử lý nghiệp vụ giống RF: HTTP dev gọi `handle_pic_ingress` → `apply_kitchen_done` / `apply_counter_paid` trong `pic_commands.py` (xem `pic-ingress.md`).

## Hệ thống

| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/health` | Health check |

## CORS

Mặc định cho phép origin Vite `localhost` / `127.0.0.1` cổng 5173–5174; chỉnh `PI_CORS_ORIGINS`.

## Frontend (Vite) — biến môi trường (A05 / A05.1)

| Biến | Ứng dụng | Mô tả |
|------|----------|--------|
| `VITE_API_BASE_URL` | customer-web, admin-web | URL gốc Pi (không có `/api/v1`). Mặc định code: `http://127.0.0.1:8000` |
| `VITE_DEFAULT_TABLE_CODE` | customer-web | Mã bàn khi không có `?table=` và không dùng path `/t/:code`. Mặc định: `1` |
| `VITE_ENABLE_E2E_DEV_PANEL` | customer-web, admin-web | Đặt `1` để hiện **UI test E2E tối thiểu** (gọi route `/dev/*`). Chỉ dùng khi backend **`PI_DEBUG=1`**. Mặc định: ẩn. |

Chi tiết chạy local: `customer-web/README.md`, `admin-web/README.md`, `pi-backend/README.md`.

## Lệnh PIC (không HTTP trong bản production — trừ dev ở trên)

`CMD_COUNTER_LOOKUP` — chỉ trong `pic_commands.py`, chờ worker NRF (không có HTTP dev trong MVP này).  
`CMD_KITCHEN_DONE`, `CMD_COUNTER_PAID` — cùng file; trên HTTP chỉ có bản **dev** khi `PI_DEBUG=1` (`kitchen-done`, `counter-paid`).
