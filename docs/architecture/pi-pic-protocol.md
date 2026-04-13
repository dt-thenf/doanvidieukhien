# Giao thức Pi ↔ PIC — binary `v1` (đồ án)

**Source of truth:** file này trong repo gốc (`docs/architecture/pi-pic-protocol.md`) + `docs/decisions/decision-log.md` (mục A06).  
**Triển khai tham chiếu:** `pi-backend/app/services/pic_ingress/nrf_binary.py` (parser + hằng `MsgType`).

**Tham chiếu:** `AGENTS.md`, `pic-ingress.md`, `golden-demo-flow.md` (mirror `restaurant-pi-pic` nếu có).

---

## 1. Nguyên tắc (không đổi)

| Nguyên tắc | Nội dung |
|------------|----------|
| Nguồn sự thật nghiệp vụ | **Pi** (web + DB); PIC chỉ gửi **lệnh ý định** (`CMD_*`). |
| Transport | **NRF24L01**, payload **≤ 32 byte**/gói; demo **không** phân mảnh. |
| Định danh bàn trên dây | Trường **`table_code`** (`u16`, little-endian) = `dining_table.code` (QR / **D-17**). Đồng tên với `PicIngressIn.table_code`. |
| Ghép cặp request/response | Response **lặp lại cùng `SEQ`** (byte 2 header). |

---

## 2. Frame 32 byte (mọi gói)

| Offset | Trường | Kiểu | Mô tả |
|--------|--------|------|--------|
| 0 | `VER` | `u8` | Phiên bản giao thức: **1**. |
| 1 | `MSG_TYPE` | `u8` | Bảng mục 3. |
| 2 | `SEQ` | `u8` | 0–255, tăng mỗi phiên giao dịch phía gửi. |
| 3 | `FLAGS` | `u8` | Demo: **0x00** (dự phòng). |
| 4..31 | `PAYLOAD` | bytes | Tối đa **28** byte có nghĩa; phần còn lại **0x00** (padding). |

Endian số đa byte: **little-endian**.

---

## 3. `MSG_TYPE` — giá trị số chốt (A06.1)

| Hex | Tên | Hướng chủ đạo |
|-----|-----|----------------|
| `0x01` | `PING` | PIC → Pi |
| `0x02` | `PONG` | Pi → PIC |
| `0x03` | `ACK` | Pi → PIC |
| `0x04` | `NACK` | Pi → PIC |
| `0x10` | `EVT_ORDER_NEW` | Pi → PIC |
| `0x11` | `EVT_PAYMENT_PENDING` | Pi → PIC |
| `0x20` | `CMD_KITCHEN_DONE` | PIC → Pi |
| `0x21` | `CMD_COUNTER_LOOKUP` | PIC → Pi |
| `0x22` | `CMD_COUNTER_PAID` | PIC → Pi |

Ingress Pi (`decode_pic_command_binary`) hiện chỉ nhận **`0x20` / `0x21` / `0x22`**.

---

## 4. Payload tối thiểu — PIC → Pi (`CMD_*`)

### 4.1 `CMD_KITCHEN_DONE` (`0x20`)

| Offset trong PAYLOAD | Trường | Kiểu |
|----------------------|--------|------|
| 0 | `table_code` | `u16` LE |

Byte payload index 2..27 = 0. Một đơn active trên bàn (**D-16**); Pi resolve `order_id` trong DB.

### 4.2 `CMD_COUNTER_LOOKUP` (`0x21`)

| Offset | Trường | Kiểu |
|--------|--------|------|
| 0 | `lookup_kind` | `u8` — **0** = theo `table_code` (MVP duy nhất) |
| 1 | `table_code` | `u16` LE |

### 4.3 `CMD_COUNTER_PAID` (`0x22`)

| Offset | Trường | Kiểu |
|--------|--------|------|
| 0 | `table_code` | `u16` LE |

---

## 5. Pi → PIC (`EVT_*`, `PONG`, `ACK`/`NACK`)

Định dạng payload chi tiết cho `EVT_ORDER_NEW`, `EVT_PAYMENT_PENDING`, snapshot trong `ACK` giữ nguyên tinh thần bản trước (**order_id u32 + table_code u16** cho EVT, v.v.); encoder phía Pi sẽ bổ sung cùng module `pic_bridge` / lớp gửi khi thay stub.

**Ghi chú bring-up (A06.5):** để test link RF thật, Pi có thể gửi `PONG`/`ACK`/`NACK`/`EVT_*` với **payload rỗng** (tức 28 byte padding = 0). PIC hiện tại phản ứng theo `MSG_TYPE` và `SEQ` (ACK/NACK).

Quy tắc retry **`EVT_*`** tối đa một lần: **D-19**.

---

## 6. Worker Pi

- **Parse + domain:** `handle_nrf_ingress_frame` (`app/services/pic_ingress/worker.py`) = decode + `handle_pic_ingress`.
- **Vòng lặp:** `run_ingress_loop` nhận `read_frame` inject được (SPI/queue) — xem file trên.

---

## 7. Test & tích hợp

Checklist: `docs/planning/A06-test-checklist.md`.
