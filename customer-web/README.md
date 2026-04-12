# customer-web — thực đơn & giỏ (khách)

Giao diện **mobile-first** nối **pi-backend** (REST `/api/v1/customer/...`).

## Chạy local cùng backend

1. Chạy Pi backend (ví dụ `uvicorn` từ thư mục `pi-backend`, mặc định `http://127.0.0.1:8000`).
2. Tùy chọn tạo file `.env` trong `customer-web/`:

   - `VITE_API_BASE_URL` — URL gốc backend (không kèm `/api/v1`). Mặc định: `http://127.0.0.1:8000`
   - `VITE_DEFAULT_TABLE_CODE` — mã bàn khi không dùng URL. Mặc định: `1`

3. Cài dependency và chạy dev:

   ```bash
   npm install
   npm run dev
   ```

4. Mở trình duyệt với bàn cụ thể:

   - `http://localhost:5173/?table=1`
   - hoặc `http://localhost:5173/t/1` (và `/t/1/cart` cho giỏ)

`table` trùng `dining_table.code` trên Pi (QR / thử nghiệm).

## Ghi chú MVP

- Giá và tổng tiền là **số nguyên VND** (`total_minor` / `priceVnd`).
- Route dev `POST /api/v1/dev/.../kitchen-done` chỉ có khi backend bật `PI_DEBUG=1`; frontend **không** dựa vào route này cho luồng chính.

## Stack

Vite + React + TypeScript + Tailwind (xem `package.json`).
