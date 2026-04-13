/**
 * timebase.c — Timer0 interrupt tạo tick ~10ms.
 *
 * Assumption: INTOSC = 4MHz (instruction clock = Fosc/4 = 1MHz).
 * Timer0 8-bit với prescaler 1:256:
 * - T0 tick = 1us * 256 = 256us
 * - Cần ~10ms => 10,000us / 256us ≈ 39.06 counts
 * - Preload = 256 - 39 = 217 => overflow ~9.984ms (gần 10ms)
 *
 * Nếu bạn đổi Fosc, phải tính lại preload.
 */
#include <xc.h>
#include <stdint.h>
#include <stdbool.h>

#include "../include/timebase.h"

#define TMR0_PRELOAD_4MHZ_10MS 217u

static volatile uint8_t g_tick_10ms;
static volatile uint32_t g_now_10ms;

void timebase_init(void) {
    g_tick_10ms = 0;
    g_now_10ms = 0;

    /* Timer0 setup */
    OPTION_REGbits.T0CS = 0; /* clock = instruction cycle */
    OPTION_REGbits.T0SE = 0;
    OPTION_REGbits.PSA = 0;  /* prescaler assigned to TMR0 */
    OPTION_REGbits.PS2 = 1;
    OPTION_REGbits.PS1 = 1;
    OPTION_REGbits.PS0 = 1;  /* 1:256 */

    TMR0 = (uint8_t)TMR0_PRELOAD_4MHZ_10MS;
    INTCONbits.T0IF = 0;
    INTCONbits.T0IE = 1;

    /* Global interrupts */
    INTCONbits.PEIE = 1;
    INTCONbits.GIE = 1;
}

bool timebase_consume_10ms_tick(void) {
    if (g_tick_10ms == 0) return false;
    g_tick_10ms = 0;
    return true;
}

uint32_t timebase_now_10ms(void) {
    return g_now_10ms;
}

void __interrupt() isr(void) {
    if (INTCONbits.T0IE && INTCONbits.T0IF) {
        INTCONbits.T0IF = 0;
        TMR0 = (uint8_t)TMR0_PRELOAD_4MHZ_10MS;
        g_now_10ms++;
        g_tick_10ms = 1;
        return;
    }
}

