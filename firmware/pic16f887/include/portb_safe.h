/**
 * portb_safe.h — PORTB output safety helpers (A06.1b)
 *
 * PIC16F887 có nhiều tín hiệu chung PORTB (IRQ + keypad rows + NRF CSN).
 * Mục tiêu: tránh việc "set 1 bit" rải rác gây khó debug hoặc vô tình đụng bit khác.
 *
 * Cách dùng:
 * - Init: gọi `portb_out_init()` một lần sau khi set TRISB.
 * - Thay vì viết trực tiếp `PORTBbits.RBx = ...`, hãy gọi helper tương ứng.
 */
#ifndef PORTB_SAFE_H
#define PORTB_SAFE_H

#include <stdint.h>
#include <stdbool.h>

/* PORTB outputs we own in this project:
 * - RB1..RB4: keypad rows
 * - RB5: NRF CSN
 * Inputs:
 * - RB0: NRF IRQ
 * - RB6/RB7: ICSP/debug (avoid touching)
 */
#define PORTB_OUT_MASK_KEYPAD_ROWS  ((uint8_t)0b00011110) /* RB1..RB4 */
#define PORTB_OUT_MASK_NRF_CSN      ((uint8_t)0b00100000) /* RB5 */
#define PORTB_OUT_MASK_ALL          ((uint8_t)(PORTB_OUT_MASK_KEYPAD_ROWS | PORTB_OUT_MASK_NRF_CSN))

void portb_out_init(uint8_t initial_shadow);

/* Apply current shadow to PORTB (only bits in PORTB_OUT_MASK_ALL). */
void portb_out_apply(void);

/* --- NRF CSN --- */
void portb_set_nrf_csn(bool high);

/* --- Keypad rows --- */
void portb_set_keypad_rows(uint8_t rows_mask /* bit0->RB1 ... bit3->RB4 */, bool high);
void portb_keypad_all_rows_low(void);

#endif /* PORTB_SAFE_H */
