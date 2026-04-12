# Luồng xử lý pi-backend (MVP local)

**Phạm vi:** HTTP + SQLite trên Pi; **chưa** NRF thật. Bám `restaurant-pi-pic/docs/architecture/golden-demo-flow.md`, `event-mapping.md`, `decision-log.md` (D-16–D-19).

**Nguồn sự thật (góc luồng):** file này mô tả **hành vi** tổng thể; chi tiết endpoint (kể cả **dev-only**) xem `api-contract.md` + `/docs`. Schema bảng xem `db-schema.md`.

## Khởi động

1. `uvicorn app.main:app` → `lifespan` gọi `init_db` (SQLite `create_all`).  
2. `seed_if_empty` nếu chưa có bàn → dữ liệu demo.  
3. `StubPicBridge` singleton ghi log sự kiện Pi→PIC.

## Khách quét QR (`table_id` = `dining_table.code`)

1. **GET bàn / menu / đơn active** — đọc DB, không đổi trạng thái.  
2. **POST đơn active**  
   - Nếu bàn `IDLE` → `OPEN`, tạo `restaurant_order`, gán `active_order_id`.  
   - Nếu đơn đang `NEW`/`IN_KITCHEN` → xóa dòng cũ, ghi dòng mới (một `order_id` — D-16).  
   - Không cho cập nhật khi bàn `PAYMENT_REQUESTED` / `SETTLED` hoặc đơn đã `DONE`.  
   - Sau commit: **`StubPicBridge.emit_order_new`** (retry 1 lần sau ngủ ngắn — D-19).  
3. **POST yêu cầu thanh toán**  
   - Điều kiện: đơn `DONE`.  
   - `Payment`: `NONE` → `REQUESTED` (hoặc tạo mới), `dining_table.state` → `PAYMENT_REQUESTED`.  
   - Lần đầu chuyển sang `REQUESTED`: **`emit_payment_pending`** (retry 1 lần).  
   - Gọi lặp idempotent: không gửi EVT thêm.

## Bếp / quầy (PIC → Pi) — code sẵn, chưa RF

| Lệnh | Hàm | Tác động DB (tóm tắt) |
|------|-----|------------------------|
| `CMD_KITCHEN_DONE` | `apply_kitchen_done` | `IN_KITCHEN` → `DONE` |
| `CMD_COUNTER_LOOKUP` | `apply_counter_lookup` | Đọc snapshot `total_minor`, trạng thái thanh toán (lookup mặc định theo `table_id` — D-17) |
| `CMD_COUNTER_PAID` | `apply_counter_paid` | `Payment` → `PAID`, bàn → `SETTLED` |

### Dev local (`PI_DEBUG=1`)

- **`POST /api/v1/dev/tables/{table_id}/kitchen-done`:** gọi `apply_kitchen_done` cho đơn **active** của bàn — chỉ để test/Swagger, **không** thay PIC thật trên production.

## Admin reset bàn

- **POST** `/api/v1/admin/tables/{table_id}/reset` chỉ khi `SETTLED` → `IDLE`, xóa `active_order_id` để vòng demo tiếp theo (bước 15 golden flow).

## Ghi chú đồ án

- **Tiền:** mọi tổng/giá là **VND nguyên** (D-18).  
- **Web admin:** chỉ đọc hàng chờ thanh toán; không thay PIC chốt tiền.  
- **Tích hợp sau:** worker NRF gọi `pic_commands` + thay `StubPicBridge` bằng gửi frame `EVT_*` thật.
