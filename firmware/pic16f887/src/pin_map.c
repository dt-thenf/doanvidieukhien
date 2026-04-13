/**
 * pin_map.c — init GPIO direction (TRIS) / analog disable.
 *
 * Mục tiêu vòng foundation: set pin direction “đủ chạy” theo pin_map.h.
 */
#include <xc.h>
#include <stdint.h>

#include "../include/pin_map.h"

static void disable_analog(void) {
    /* PIC16F887: tắt analog để dùng digital I/O.
     * - ANSEL: AN0..AN7 (PORTA/PORTB some pins)
     * - ANSELH: AN8..AN13 (PORTB/PORTE)
     */
#ifdef ANSEL
    ANSEL = 0x00;
#endif
#ifdef ANSELH
    ANSELH = 0x00;
#endif

    /* Một số toolchain/device header có ADCON1/ADCON0 ảnh hưởng analog;
     * set về trạng thái "an toàn" cho digital I/O.
     */
#ifdef ADCON0
    ADCON0 = 0x00;
#endif
}

void pin_map_init(void) {
    disable_analog();

    /* Clear latches (tránh glitch khi chuyển TRIS) */
    LATA = 0x00;
    LATB = 0x00;
    LATC = 0x00;
    LATD = 0x00;
    LATE = 0x00;

    /* LCD: outputs */
    LCD_RS_TRIS = 0;
    LCD_EN_K_TRIS = 0;
    LCD_EN_C_TRIS = 0;
    LCD_D4_TRIS = 0;
    LCD_D5_TRIS = 0;
    LCD_D6_TRIS = 0;
    LCD_D7_TRIS = 0;

    /* Keypad: rows outputs, cols inputs */
    KP_R0_TRIS = 0;
    KP_R1_TRIS = 0;
    KP_R2_TRIS = 0;
    KP_R3_TRIS = 0;

    KP_C0_TRIS = 1;
    KP_C1_TRIS = 1;
    KP_C2_TRIS = 1;
    KP_C3_TRIS = 1;

    /* Buttons: inputs */
    BTN_MODE_TRIS = 1;
    BTN_K_DONE_TRIS = 1;
    BTN_K_NEXT_TRIS = 1;

    /* Buzzer: output */
    BUZZ_TRIS = 0;
    BUZZ_LAT = 0;

    /* NRF control: CE/CSN outputs, IRQ input */
    NRF_CE_TRIS = 0;
    NRF_CSN_TRIS = 0;
    NRF_IRQ_TRIS = 1;
    NRF_CE_LAT = 0;
    NRF_CSN_LAT = 1;

    /* Optional: enable weak pull-ups if needed (esp. keypad cols/buttons).
     * TODO: configure OPTION_REG / WPUB / IOCB according to wiring.
     */
}

