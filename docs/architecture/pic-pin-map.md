# PIC16F887 — pin map đề xuất (A06 foundation)

**Mục tiêu:** chốt một pin map *demo-friendly* để dựng firmware nền, dễ đổi sau.  
**Lưu ý:** Đây là **đề xuất**, không phải “bản mạch cuối cùng”. Khi thay dây, ưu tiên đổi ở `firmware/pic16f887/include/pin_map.h`.

## Nguyên tắc chọn pin

- Tránh đụng **ICSP** (RB6/RB7) để nạp/debug thuận lợi.
- Dùng **MSSP SPI** mặc định cho NRF24 (RC3/RC4/RC5).
- LCD dùng **4-bit mode** để tiết kiệm pin.
- 2 LCD (Bếp/Quầy): **dùng chung bus data + RS**, tách **2 chân EN**.

## Bảng pin map (đề xuất)

### 1) NRF24L01 (SPI)

- **SCK**: RC3  
- **MISO**: RC4  
- **MOSI**: RC5  
- **CE**: RA4  
- **CSN**: RB5  
- **IRQ**: RB0/INT

> **Lưu ý:** giữ `MCLRE = ON` nên **không dùng RA3 làm output** (tránh xung đột MCLR trên một số mạch/thiết kế). Vì vậy CSN được chuyển sang RB5.

### 2) LCD (HD44780, 4-bit) — dùng chung bus

**Bus chung:**

- **RS**: RD2  
- **D4..D7**: RD4..RD7  
- **RW**: nối GND

**Enable riêng:**

- **EN_KITCHEN**: RD0  
- **EN_COUNTER**: RD1

> Chiến lược này giúp tiết kiệm pin và vẫn giữ được 2 màn hình độc lập theo mode.

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
