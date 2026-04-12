# Hợp đồng API HTTP — pi-backend (MVP)

## Nguồn sự thật (tránh nhiều bản “hợp đồng” lệch nhau)

| Loại | Nguồn chính |
|------|-------------|
| **Quyết định kiến trúc / ràng buộc** | `docs/decisions/decision-log.md` (+ mirror `restaurant-pi-pic/docs/decisions/decision-log.md` khi có) |
| **Mô tả DB & luồng nghiệp vụ** | `docs/architecture/db-schema.md`, `docs/architecture/pi-backend-flow.md` |
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

**Quy tắc:**

- Khi **`PI_DEBUG` tắt:** các route này **không được mount** → client nhận **404** (không lộ surface dev trên bản chạy “gần production”).
- **Không** dùng trên Pi demo công khai / bảo vệ nếu không chủ đích mở debug.
- Mã xử lý nghiệp vụ giống RF: gọi `apply_kitchen_done` trong `pic_commands.py`.

## Hệ thống

| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/health` | Health check |

## CORS

Mặc định cho phép origin Vite `localhost` / `127.0.0.1` cổng 5173–5174; chỉnh `PI_CORS_ORIGINS`.

## Lệnh PIC (không HTTP trong MVP — trừ dev ở trên)

`CMD_COUNTER_LOOKUP`, `CMD_COUNTER_PAID` — chỉ trong `pi-backend/app/services/pic_commands.py`, chờ worker NRF gọi.  
`CMD_KITCHEN_DONE` — cùng file; trên HTTP chỉ có bản **dev** khi `PI_DEBUG=1`.
