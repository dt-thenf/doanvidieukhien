/**
 * portb_safe.c — implementation.
 *
 * Kỹ thuật: giữ 1 byte shadow cho PORTB outputs, rồi ghi PORTB theo mask.
 * Tránh RMW rải rác và giúp log/debug dễ hơn.
 */
#include <xc.h>
#include <stdint.h>
#include <stdbool.h>

#include "../include/portb_safe.h"

static volatile uint8_t g_portb_shadow;

static void write_portb_masked(uint8_t shadow) {
    /* Preserve non-owned bits by reading PORTB and masking.
     * Note: đọc PORTB lấy trạng thái chân. Với input (RB0), ta mask out nên an toàn.
     */
    uint8_t cur = PORTB;
    uint8_t next = (uint8_t)((cur & (uint8_t)~PORTB_OUT_MASK_ALL) | (shadow & PORTB_OUT_MASK_ALL));
    PORTB = next;
}

void portb_out_init(uint8_t initial_shadow) {
    g_portb_shadow = (uint8_t)(initial_shadow & PORTB_OUT_MASK_ALL);
    write_portb_masked(g_portb_shadow);
}

void portb_out_apply(void) {
    write_portb_masked(g_portb_shadow);
}

void portb_set_nrf_csn(bool high) {
    if (high) g_portb_shadow = (uint8_t)(g_portb_shadow | PORTB_OUT_MASK_NRF_CSN);
    else g_portb_shadow = (uint8_t)(g_portb_shadow & (uint8_t)~PORTB_OUT_MASK_NRF_CSN);
    write_portb_masked(g_portb_shadow);
}

void portb_set_keypad_rows(uint8_t rows_mask, bool high) {
    /* rows_mask bit0..bit3 -> RB1..RB4 */
    uint8_t m = (uint8_t)((rows_mask & 0x0Fu) << 1);
    if (high) g_portb_shadow = (uint8_t)(g_portb_shadow | m);
    else g_portb_shadow = (uint8_t)(g_portb_shadow & (uint8_t)~m);
    write_portb_masked(g_portb_shadow);
}

void portb_keypad_all_rows_low(void) {
    g_portb_shadow = (uint8_t)(g_portb_shadow & (uint8_t)~PORTB_OUT_MASK_KEYPAD_ROWS);
    write_portb_masked(g_portb_shadow);
}

