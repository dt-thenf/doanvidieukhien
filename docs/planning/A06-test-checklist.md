# Checklist test — A06 (protocol + worker + integration)

## Unit — parser (Python)

- [ ] `decode_pic_command_binary` — `CMD_KITCHEN_DONE` đúng `table_code` (u16 LE).
- [ ] `CMD_COUNTER_LOOKUP` với `lookup_kind=0` + `table_code`.
- [ ] `CMD_COUNTER_PAID` chỉ `table_code`.
- [ ] `VER != 1` → `PicIngressDecodeError`.
- [ ] Độ dài ≠ 32 → lỗi.
- [ ] `MSG_TYPE` không thuộc CMD ingress → lỗi.
- [ ] Padding sau payload có byte ≠ 0 → lỗi (tránh frame bẩn).

## Unit — domain (đã có + binary)

- [ ] `handle_nrf_ingress_frame` + frame bếp → `apply_kitchen_done` (bàn seed IN_KITCHEN).
- [ ] `handle_nrf_ingress_frame` + frame quầy lookup → snapshot `total_minor` / `payment_state`.

## Tích hợp (lab / Pi thật)

- [ ] Pi tool RF: chạy `pi-backend/tools/rf24_link_test.py --listen` (channel 76, addr E7E7E7E7E7, payload 32, 1Mbps, auto-ack off).
- [ ] PING/PONG: trên PIC (mode Bếp) bấm `K_NEXT` → Pi trả `PONG` cùng `SEQ` → PIC hiện “PONG”.
- [ ] ACK cho `CMD_KITCHEN_DONE`: bấm `K_DONE` → Pi trả `ACK` cùng `SEQ` → PIC hiện “ACK”.
- [ ] ACK cho `CMD_COUNTER_LOOKUP`: mode Quầy nhập số + `A` → Pi trả `ACK` cùng `SEQ` → PIC hiện “ACK”.
- [ ] ACK cho `CMD_COUNTER_PAID`: mode Quầy nhập số + `B` → Pi trả `ACK` cùng `SEQ` → PIC hiện “ACK”.
- [ ] EVT_ORDER_NEW: trên Pi chạy tool với `--send-evt-order-new` → PIC beep + LCD bếp hiện “EVT_ORDER_NEW”.
- [ ] EVT_PAYMENT_PENDING: trên Pi chạy tool với `--send-evt-payment-pending` → PIC beep + LCD quầy hiện “EVT_PAYMENT_PENDING”.
- [ ] SPI NRF ingress: đọc đúng 32 byte từ IRQ; đưa vào `handle_nrf_ingress_frame` (không qua HTTP) (vòng sau nếu muốn gắn DB thật).
- [ ] End-to-end: PIC gửi `CMD_KITCHEN_DONE` → DB đơn `DONE`.  
- [ ] PIC gửi `CMD_COUNTER_PAID` sau `Payment REQUESTED` → `PAID` + bàn `SETTLED`.

## Firmware (PIC)

- [ ] Frame built trên PIC khớp `pi_pic_proto.h` (hex `MSG_TYPE` giống Python).
- [ ] Retry timeout (D-19) phía Pi chỉ cho `EVT_*`; PIC retry CMD theo `pi-pic-protocol.md` §7.
- [ ] Tick nền 10ms chạy thật bằng Timer0 (không dùng delay busy-loop), debounce nút ổn định.
- [ ] Nút `MODE` chuyển Bếp/Quầy, không bounce gây đổi mode liên tục.
- [ ] Keypad 4×4 scan cơ bản: nhấn `1 2 3` thấy chuỗi tích luỹ trên LCD quầy; `#` clear; `*` backspace.
- [ ] LCD 4-bit init + clear + print: khi reset thấy “PIC KITCHEN/COUNTER BOOT”; nhấn MODE đổi màn hình hiển thị “READY”.
- [ ] NRF TX-first: nhấn `K_DONE` / `A` / `B` tạo frame 32 byte và `nrf_bridge_send()` trả true khi TX_DS (poll STATUS).
- [ ] NRF RX cơ bản: khi Pi gửi `EVT_ORDER_NEW` / `EVT_PAYMENT_PENDING`, PIC nhận frame 32 byte và cập nhật LCD/buzzer tương ứng.
- [ ] ACK/NACK: khi Pi trả `ACK`/`NACK` cùng `SEQ`, PIC thoát `WAIT_ACK` và hiển thị “ACK/NACK”.
