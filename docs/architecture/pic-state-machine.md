# PIC16F887 — state machine (A06 foundation)

**Mục tiêu:** mô tả state machine nền để mọi agent thống nhất khi nối NRF thật.

## 1) Mode level (UI routing)

PIC có 2 **mode** (1 MCU, 2 cụm I/O):

- **Mode Bếp (`APP_MODE_KITCHEN`)**
  - Input chính: nút bếp (`DONE`, `NEXT`)
  - Output chính: LCD bếp + buzzer
  - Gửi lệnh: `CMD_KITCHEN_DONE`
- **Mode Quầy (`APP_MODE_COUNTER`)**
  - Input chính: keypad 4×4 (nhập `table_code`)
  - Output chính: LCD quầy + buzzer
  - Gửi lệnh: `CMD_COUNTER_LOOKUP`, `CMD_COUNTER_PAID`

**Chuyển mode:** nút `BTN_MODE` (toggle).

## 2) Link/transaction state

Mỗi mode dùng chung một state machine transaction tối thiểu:

- **`IDLE`**
  - Poll input (nút/keypad)
  - Nếu có thao tác cần gửi `CMD_*` → build frame → `SEND` → vào `WAIT_ACK`
  - Nếu nhận `EVT_*` từ Pi → hiển thị + buzzer (không đổi state)

- **`WAIT_ACK`**
  - Chờ `ACK` hoặc `NACK` với **cùng `SEQ`** (theo `pi-pic-protocol.md`)
  - Nếu hết timeout: retry (tối đa 3 lần)
  - Hết retry: `LINK_DOWN`, quay lại `IDLE`

## 3) Tham số retry (demo)

Theo `docs/decisions/decision-log.md` **D-2026-04-12-03**:

- **Timeout**: 250 ms
- **Retry**: 3 lần (tổng 4 lần phát: 1 + 3)
- **Backoff**: cố định (vòng foundation hiện chưa thêm delay riêng, dùng lại timeout)

## 4) Mapping bản tin tối thiểu

- **Pi → PIC**
  - `EVT_ORDER_NEW` → ưu tiên hiển thị ở Mode Bếp (buzzer + text)
  - `EVT_PAYMENT_PENDING` → ưu tiên hiển thị ở Mode Quầy (buzzer + text)
  - `ACK`/`NACK` → kết thúc `WAIT_ACK`
  - `PONG` → xác nhận link (tuỳ dùng)
- **PIC → Pi**
  - `PING` (tuỳ chọn: chẩn đoán link)
  - `CMD_KITCHEN_DONE`
  - `CMD_COUNTER_LOOKUP`
  - `CMD_COUNTER_PAID`

## 5) Ghi chú “không tự quyết nghiệp vụ”

PIC **không** tự chuyển trạng thái nghiệp vụ (bàn/đơn/thanh toán).  
PIC chỉ hiển thị và gửi lệnh ý định; Pi mới là nguồn sự thật (SoT).
