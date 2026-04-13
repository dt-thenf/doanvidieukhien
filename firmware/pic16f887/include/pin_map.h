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
#define LCD_RS_LAT      LATDbits.LATD2
#define LCD_RS_TRIS     TRISDbits.TRISD2

#define LCD_D4_LAT      LATDbits.LATD4
#define LCD_D4_TRIS     TRISDbits.TRISD4
#define LCD_D5_LAT      LATDbits.LATD5
#define LCD_D5_TRIS     TRISDbits.TRISD5
#define LCD_D6_LAT      LATDbits.LATD6
#define LCD_D6_TRIS     TRISDbits.TRISD6
#define LCD_D7_LAT      LATDbits.LATD7
#define LCD_D7_TRIS     TRISDbits.TRISD7

#define LCD_EN_K_LAT    LATDbits.LATD0
#define LCD_EN_K_TRIS   TRISDbits.TRISD0
#define LCD_EN_C_LAT    LATDbits.LATD1
#define LCD_EN_C_TRIS   TRISDbits.TRISD1

/* =========================
 * Keypad 4x4 (matrix)
 * =========================
 * Rows: RB1..RB4 (outputs)
 * Cols: RC0, RC1, RC2, RE0 (inputs with pull-ups)
 *
 * Lưu ý: tránh RB6/RB7 (ICSP) để dễ nạp/debug.
 */
#define KP_R0_LAT   LATBbits.LATB1
#define KP_R0_TRIS  TRISBbits.TRISB1
#define KP_R1_LAT   LATBbits.LATB2
#define KP_R1_TRIS  TRISBbits.TRISB2
#define KP_R2_LAT   LATBbits.LATB3
#define KP_R2_TRIS  TRISBbits.TRISB3
#define KP_R3_LAT   LATBbits.LATB4
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
#define BUZZ_LAT    LATEbits.LATE1
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
 * - CSN: RA3
 * - IRQ: RB0/INT
 */
#define NRF_CE_LAT     LATAbits.LATA4
#define NRF_CE_TRIS    TRISAbits.TRISA4
#define NRF_CSN_LAT    LATAbits.LATA3
#define NRF_CSN_TRIS   TRISAbits.TRISA3

#define NRF_IRQ_PORT   PORTBbits.RB0
#define NRF_IRQ_TRIS   TRISBbits.TRISB0

void pin_map_init(void);

#endif /* PIN_MAP_H */
