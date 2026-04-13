/**
 * pin_map.h — pin map đề xuất (A06 foundation)
 *
 * Source of truth: `docs/architecture/pic-pin-map.md`.
 * Khi đổi dây, chỉ cần đổi file này + (nếu cần) driver.
 */
#ifndef PIN_MAP_H
#define PIN_MAP_H

#include <stdint.h>
#include <xc.h>

/* =========================
 * LCD (HD44780, 4-bit mode)
 * =========================
 * Chiến lược: dùng chung bus dữ liệu + RS, tách 2 chân EN cho 2 LCD (Bếp/Quầy).
 * RW nối GND (write-only) để tiết kiệm pin.
 *
 * - Data nibble: RD4..RD7
 * - RS: RD2
 * - EN_KITCHEN: RD0
 * - EN_COUNTER: RD1
 */
#define LCD_RS_OUT      PORTDbits.RD2
#define LCD_RS_TRIS     TRISDbits.TRISD2

#define LCD_D4_OUT      PORTDbits.RD4
#define LCD_D4_TRIS     TRISDbits.TRISD4
#define LCD_D5_OUT      PORTDbits.RD5
#define LCD_D5_TRIS     TRISDbits.TRISD5
#define LCD_D6_OUT      PORTDbits.RD6
#define LCD_D6_TRIS     TRISDbits.TRISD6
#define LCD_D7_OUT      PORTDbits.RD7
#define LCD_D7_TRIS     TRISDbits.TRISD7

#define LCD_EN_K_OUT    PORTDbits.RD0
#define LCD_EN_K_TRIS   TRISDbits.TRISD0
#define LCD_EN_C_OUT    PORTDbits.RD1
#define LCD_EN_C_TRIS   TRISDbits.TRISD1

/* =========================
 * Keypad 4x4 (matrix)
 * =========================
 * Rows: RB1..RB4 (outputs)
 * Cols: RC0, RC1, RC2, RE0 (inputs with pull-ups)
 *
 * Lưu ý: tránh RB6/RB7 (ICSP) để dễ nạp/debug.
 *
 * Khuyến nghị: khi điều khiển rows, ưu tiên dùng `portb_safe.*` (shadow) thay vì
 * ghi rải rác `PORTBbits.RBx` để tránh đụng `RB5(CSN)` và `RB0(IRQ)`.
 */
#define KP_R0_OUT   PORTBbits.RB1
#define KP_R0_TRIS  TRISBbits.TRISB1
#define KP_R1_OUT   PORTBbits.RB2
#define KP_R1_TRIS  TRISBbits.TRISB2
#define KP_R2_OUT   PORTBbits.RB3
#define KP_R2_TRIS  TRISBbits.TRISB3
#define KP_R3_OUT   PORTBbits.RB4
#define KP_R3_TRIS  TRISBbits.TRISB4

#define KP_C0_PORT  PORTCbits.RC0
#define KP_C0_TRIS  TRISCbits.TRISC0
#define KP_C1_PORT  PORTCbits.RC1
#define KP_C1_TRIS  TRISCbits.TRISC1
#define KP_C2_PORT  PORTCbits.RC2
#define KP_C2_TRIS  TRISCbits.TRISC2
#define KP_C3_PORT  PORTEbits.RE0
#define KP_C3_TRIS  TRISEbits.TRISE0

/* =========================
 * Buttons (Kitchen)
 * =========================
 * BTN_MODE: RA0 (chuyển Bếp/Quầy)
 * BTN_K_DONE: RA1 (bếp xác nhận DONE)
 * BTN_K_NEXT: RA2 (duyệt item/đơn - stub)
 */
#define BTN_MODE_PORT    PORTAbits.RA0
#define BTN_MODE_TRIS    TRISAbits.TRISA0

#define BTN_K_DONE_PORT  PORTAbits.RA1
#define BTN_K_DONE_TRIS  TRISAbits.TRISA1

#define BTN_K_NEXT_PORT  PORTAbits.RA2
#define BTN_K_NEXT_TRIS  TRISAbits.TRISA2

/* =========================
 * Buzzer
 * =========================
 * BUZZER: RE1 (output)
 */
#define BUZZ_OUT    PORTEbits.RE1
#define BUZZ_TRIS   TRISEbits.TRISE1

/* =========================
 * NRF24L01 (SPI)
 * =========================
 * SPI pins (MSSP):
 * - SCK: RC3
 * - MISO: RC4
 * - MOSI: RC5
 *
 * Control:
 * - CE:  RA4
 * - CSN: RB5 (không dùng RA3 vì giữ MCLRE=ON)
 * - IRQ: RB0/INT
 */
#define NRF_CE_OUT     PORTAbits.RA4
#define NRF_CE_TRIS    TRISAbits.TRISA4
#define NRF_CSN_OUT    PORTBbits.RB5 /* prefer portb_set_nrf_csn() */
#define NRF_CSN_TRIS   TRISBbits.TRISB5

#define NRF_IRQ_PORT   PORTBbits.RB0
#define NRF_IRQ_TRIS   TRISBbits.TRISB0

void pin_map_init(void);

#endif /* PIN_MAP_H */
