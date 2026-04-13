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

- [ ] SPI NRF: đọc đúng 32 byte từ IRQ; đưa vào `handle_nrf_ingress_frame` (không qua HTTP).
- [ ] `SEQ` request/response: Pi trả `ACK`/`NACK` cùng `SEQ` (khi encoder Pi→PIC đã nối).
- [ ] End-to-end: PIC gửi `CMD_KITCHEN_DONE` → DB đơn `DONE`.  
- [ ] PIC gửi `CMD_COUNTER_PAID` sau `Payment REQUESTED` → `PAID` + bàn `SETTLED`.

## Firmware (PIC)

- [ ] Frame built trên PIC khớp `pi_pic_proto.h` (hex `MSG_TYPE` giống Python).
- [ ] Retry timeout (D-19) phía Pi chỉ cho `EVT_*`; PIC retry CMD theo `pi-pic-protocol.md` §7.
- [ ] Tick nền 10ms chạy thật bằng Timer0 (không dùng delay busy-loop), debounce nút ổn định.
- [ ] Nút `MODE` chuyển Bếp/Quầy, không bounce gây đổi mode liên tục.
- [ ] Keypad 4×4 scan cơ bản: nhấn `1 2 3` thấy chuỗi tích luỹ trên LCD quầy; `#` clear; `*` backspace.
- [ ] LCD 4-bit init + clear + print: khi reset thấy “PIC KITCHEN/COUNTER BOOT”; nhấn MODE đổi màn hình hiển thị “READY”.
