# admin-web — tổng quan bàn & chờ thanh toán

**Dashboard-first**, chỉ đọc / reset trạng thái; **không** chốt tiền trên web (chốt tại PIC theo kiến trúc đồ án).

## Chạy local cùng backend

1. Chạy **pi-backend** (mặc định `http://127.0.0.1:8000`).
2. Tùy chọn `.env` trong `admin-web/`:

   - `VITE_API_BASE_URL` — URL gốc backend. Mặc định: `http://127.0.0.1:8000`
   - `VITE_ENABLE_E2E_DEV_PANEL=1` — chỉ khi học E2E local: hiện thanh **Dev: bếp xong / quầy đã thu** trên **Tổng quan bàn** (gọi `/api/v1/dev/...`). Backend cần **`PI_DEBUG=1`**. Mặc định: không đặt → **ẩn**.

3. Chạy:

   ```bash
   npm install
   npm run dev
   ```

   Nếu **customer-web** đã chiếm cổng 5173, chạy admin trên 5174: `npm run dev -- --port 5174` — backend CORS đã cho phép 5173–5174.

## API dùng

- `GET /api/v1/admin/tables/overview`
- `GET /api/v1/admin/payments/queue`
- `GET /api/v1/admin/tables/{table_id}/orders/detail`
- `POST /api/v1/admin/tables/{table_id}/reset` (chỉ khi bàn **SETTLED**)

Luồng test đầy đủ (gồm bước giả PIC): **`pi-backend/README.md`**. Web admin **không** chốt tiền thật; nút dev chỉ mô phỏng PIC khi bạn bật env.

## Stack

Vite + React + TypeScript + Tailwind (xem `package.json`).
