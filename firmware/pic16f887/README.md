# Firmware PIC16F887 — foundation (A06)

Mục tiêu vòng này: dựng **nền firmware rõ ràng theo module** cho PIC16F887, ưu tiên **dễ hiểu/dễ debug**:

- **State machine**: 2 chế độ **Bếp** / **Quầy** (1 MCU).
- **Protocol**: parser/serializer khung 32 byte theo `docs/architecture/pi-pic-protocol.md`.
- **Driver**: LCD/Keypad/Buttons/Buzzer/NRF = **stub interface** (chưa cần phần cứng thật).

## Toolchain

- MPLAB X IDE
- MPLAB XC8
- Target: PIC16F887

## Bring-up (A06.1)

- Firmware đã có **tick 10ms thật** bằng **Timer0 interrupt** (`timebase.*`).
- Clock mặc định: **INTOSC 4MHz** (khớp preload Timer0).
- **Lưu ý pin:** giữ `MCLRE = ON` nên **không dùng RA3 làm output**. Pin map hiện dùng **RB5** cho NRF `CSN` (xem `docs/architecture/pic-pin-map.md`).

## Source of truth

- **Giao thức wire**: `docs/architecture/pi-pic-protocol.md`
- **Tham chiếu phía Pi**: `pi-backend/app/services/pic_ingress/nrf_binary.py`
- **Pin map / architecture firmware**: `docs/architecture/pic-pin-map.md`, `docs/architecture/pic-firmware-architecture.md`, `docs/architecture/pic-state-machine.md`

## Cấu trúc thư mục

```
firmware/pic16f887/
  include/
    config_bits.h        # placeholder fuse config (dán #pragma config vào đây)
    pin_map.h            # pin map đề xuất (đổi dây sửa ở đây)
    pi_pic_proto.h       # constants giao thức (MSG_TYPE, LEN, LE helpers)
    protocol.h           # build/parse frame 32 byte
    app_state.h          # state machine nền
    nrf_bridge.h         # interface/stub NRF24
    lcd_driver.h         # interface/stub LCD
    keypad_driver.h      # interface/stub keypad
    buttons.h            # polling+debounce nút
    buzzer.h             # beep đơn giản
  src/
    main.c
    pin_map.c
    protocol.c
    app_state.c
    nrf_bridge.c
    lcd_driver.c
    keypad_driver.c
    buttons.c
    buzzer.c
```

## “Chỉnh ở đâu khi đổi pin?”

- **Đổi chân**: sửa `include/pin_map.h` (và nếu đổi nhóm PORT/logic, có thể cần cập nhật driver tương ứng).
- **Config bits (fuse)**: dán `#pragma config ...` vào `include/config_bits.h`.

## Hướng dẫn build nhanh (MPLAB X + XC8)

1. Tạo project **Standalone Project** → Device **PIC16F887** → Compiler **XC8**.
2. Add file source: toàn bộ `firmware/pic16f887/src/*.c`.
3. Add include path: `firmware/pic16f887/include`.
4. Build. Nếu bạn đổi clock khác 4MHz, cần cập nhật phần timebase (xem `src/timebase.c`).

## Test logic khi chưa có phần cứng thật

Hiện tại driver phần cứng là **stub**, nên:

- Build chủ yếu để kiểm tra **cấu trúc module** và **compile**.
- Khi muốn test logic state machine/protocol:
  - Bắt đầu bằng việc implement tối thiểu `nrf_bridge_try_recv()` để “bơm” frame giả (ACK/NACK/EVT) vào `app_state.c`.
  - Hoặc nối UART debug (ngoài scope vòng foundation) để in log trạng thái.
