# Hợp đồng API HTTP — pi-backend (MVP)

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

## Hệ thống

| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/health` | Health check |

## CORS

Mặc định cho phép origin Vite `localhost` / `127.0.0.1` cổng 5173–5174; chỉnh `PI_CORS_ORIGINS`.

## Lệnh PIC (không HTTP trong MVP)

`CMD_KITCHEN_DONE`, `CMD_COUNTER_LOOKUP`, `CMD_COUNTER_PAID` — triển khai tại `pi-backend/app/services/pic_commands.py`, chờ worker NRF gọi.
