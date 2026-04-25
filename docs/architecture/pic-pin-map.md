# PIC16F887 — pin map đề xuất (A06 foundation)

**Mục tiêu:** chốt một pin map *demo-friendly* để dựng firmware nền, dễ đổi sau.  
**Lưu ý:** Đây là **đề xuất**, không phải “bản mạch cuối cùng”. Khi thay dây, ưu tiên đổi ở `firmware/pic16f887/include/pin_map.h`.

## Nguyên tắc chọn pin

- Tránh đụng **ICSP** (RB6/RB7) để nạp/debug thuận lợi.
- Dùng **MSSP SPI** mặc định cho NRF24 (RC3/RC4/RC5).
- Vì RC3/RC4/RC5 đã dành cho NRF SPI, OLED phải dùng **software I2C (bit-bang)** trên pin khác.
- 2 OLED (Bếp/Quầy) dùng chung bus I2C, **tách theo địa chỉ**.

## Bảng pin map (đề xuất)

### 1) NRF24L01 (SPI)

- **SCK**: RC3  
- **MISO**: RC4  
- **MOSI**: RC5  
- **CE**: RA4  
- **CSN**: RB5  
- **IRQ**: RB0/INT

> **Lưu ý:** giữ `MCLRE = ON` nên **không dùng RA3 làm output** (tránh xung đột MCLR trên một số mạch/thiết kế). Vì vậy CSN được chuyển sang RB5.

### 2) 2 OLED 0.96 inch (SSD1306 128x64) — software I2C (bit-bang)

**Pin bus (chung cho cả 2 OLED):**

- **OLED_SCL**: `RD0`  
- **OLED_SDA**: `RD1`

**Địa chỉ I2C (7-bit) — Source of Truth dự án:**

- **kitchen OLED**: `0x3C`
- **counter OLED**: `0x3D`

**Lưu ý phần cứng quan trọng:**

- Bus I2C cần **pull-up** (ví dụ 4.7k) cho SCL/SDA.
- Nếu thực tế 2 module OLED bạn mua **cùng địa chỉ** (thường cả hai đều `0x3C`):
  - Cần **đổi jumper/address** (nếu module hỗ trợ), hoặc
  - Dùng **I2C mux** (ví dụ TCA9548A).
  - Dù vậy, tài liệu/firmware của dự án vẫn **giữ giả định** `0x3C/0x3D` như SoT.

### 3) Keypad 4×4 (matrix)

- **Rows (output)**: RB1, RB2, RB3, RB4  
- **Cols (input)**: RC0, RC1, RC2, RE0

### 4) Nút bếp + chuyển chế độ

- **BTN_MODE** (chuyển Bếp/Quầy): RA0  
- **BTN_K_DONE** (bếp DONE): RA1  
- **BTN_K_NEXT** (duyệt/next — stub): RA2

### 5) Buzzer

- **BUZZER**: RE1

## Ghi chú triển khai

- Cần **tắt analog** trên các chân dùng digital (đã làm trong `pin_map.c`).
- Nút/Keypad giả định **active-low + pull-up**. Nếu dùng pull-up nội, cần cấu hình `OPTION_REG`/`WPUB` tương ứng (để vòng sau).
- **PORTB safety (khuyến nghị trước khi làm NRF/keypad thật):** vì `RB0` (IRQ), `RB1..RB4` (rows), `RB5` (CSN) cùng nằm trên PORTB, firmware nên điều khiển output qua **shadow byte** (module `portb_safe.*`) thay vì ghi rải rác `PORTBbits.RBx`.
