# Kiến trúc firmware PIC16F887 (foundation)

**Phạm vi:** nền firmware cho đồ án demo (A06) — ưu tiên đơn giản, dễ debug cho beginner.  
**Ràng buộc:** 1 PIC16F887 cho 2 cụm I/O (Bếp + Quầy); Pi là nguồn sự thật nghiệp vụ; link Pi↔PIC theo `pi-pic-protocol.md` (NRF24L01, frame 32 byte).

## Mục tiêu vòng foundation

- **Module hóa**: tách `protocol`, `app_state`, `drivers`, `pin_map`.
- **State machine rõ ràng**: Mode Bếp / Mode Quầy và trạng thái liên kết (ACK/timeout/retry).
- **Parser/serializer**: build/parse frame 32 byte cho các bản tin tối thiểu:
  - **EVT**: `EVT_ORDER_NEW`, `EVT_PAYMENT_PENDING`
  - **CMD**: `CMD_KITCHEN_DONE`, `CMD_COUNTER_LOOKUP`, `CMD_COUNTER_PAID`
  - **SYS**: `ACK`, `NACK`, `PING`, `PONG`
- **Stub driver**: chưa cần phần cứng thật/NRF thật; interface rõ để gắn sau.

## Cấu trúc module (firmware)

Nằm trong `firmware/pic16f887/`:

- **`include/pin_map.h` + `src/pin_map.c`**: chốt pin map đề xuất + init TRIS/analog.
- **`include/pi_pic_proto.h`**: hằng số wire (`MSG_TYPE`, length, LE helpers) — phải khớp SoT.
- **`include/protocol.h` + `src/protocol.c`**: parse/serialize frame 32 byte; build `CMD_*`, `PING`.
- **`include/app_state.h` + `src/app_state.c`**: state machine & retry policy (D-2026-04-12-03).
- **Drivers (stub)**:
  - `oled_driver.*` (SSD1306 128x64, software I2C bit-bang; 2 màn theo địa chỉ)
  - `keypad_driver.*`
  - `buttons.*`
  - `buzzer.*`
  - `nrf_bridge.*` (interface/stub; thay bằng SPI/IRQ thật ở vòng sau)
  - `portb_safe.*` (I/O safety: shadow PORTB outputs, tránh ghi rải rác)

## Bring-up ngoại vi (A06.2)

- `oled_driver.*`: SSD1306 text-mode tối thiểu: init/clear/print text ngắn, chọn kitchen/counter theo address.
- `keypad_driver.*`: scan 4×4 + debounce theo tick 10ms, phát event ký tự đơn giản cho `app_state`.

## Bring-up NRF TX-first (A06.3)

- `nrf_bridge.*`: TX-first qua MSSP SPI (PIC16F887). Hỗ trợ init NRF + gửi payload 32 byte (polling STATUS), **chưa** làm RX/IRQ flow.

## Bring-up NRF RX + ACK cơ bản (A06.4)

- `nrf_bridge.*`: polling RX (`STATUS.RX_DR`), đọc payload 32 byte, trả qua `nrf_bridge_try_recv()` để `app_state` parse `ACK/NACK/PONG/EVT_*`.

## Luồng dữ liệu (tối thiểu)

- **PIC → Pi (CMD)**:
  - `app_state` tạo frame qua `protocol` → gửi `nrf_bridge_send()` → vào `WAIT_ACK`.
  - Nếu hết timeout: retry tối đa 3 lần; hết retry: `LINK_DOWN` (hiển thị “mất liên lạc”).
- **Pi → PIC (EVT/ACK/NACK/PONG)**:
  - `nrf_bridge_try_recv()` trả frame → `app_state` parse → cập nhật UI (OLED + buzzer).

## Vì sao chọn super-loop + tick 10ms?

- Dễ hiểu với beginner (ít ISR, ít race).
- Dễ thay thế: về sau có thể chuyển `fw_tick_10ms()` sang timer ISR mà không đổi kiến trúc module.

## Liên quan

- Wire protocol: `docs/architecture/pi-pic-protocol.md`
- Pin map: `docs/architecture/pic-pin-map.md`
- State machine: `docs/architecture/pic-state-machine.md`
