/**
 * PIC16F887 firmware foundation (A06)
 *
 * Mục tiêu: khung module rõ ràng + state machine + protocol (parse/serialize) + stub driver.
 * Chưa yêu cầu phần cứng thật: các driver hiện là stub / polling đơn giản.
 *
 * Toolchain mục tiêu: MPLAB X IDE + XC8.
 */

#include <xc.h>
#include <stdint.h>

#include "../include/config_bits.h"
#include "../include/pin_map.h"
#include "../include/timebase.h"

#include "../include/app_state.h"
#include "../include/protocol.h"
#include "../include/nrf_bridge.h"
#include "../include/lcd_driver.h"
#include "../include/keypad_driver.h"
#include "../include/buttons.h"
#include "../include/buzzer.h"

/* Khi dùng __delay_ms, cần _XTAL_FREQ. Vòng A06.1 không phụ thuộc delay,
 * nhưng vẫn khai báo để sau này thêm debug dễ dàng.
 */
#define _XTAL_FREQ 4000000UL

static void fw_init(void) {
    /* Clock: INTOSC 4MHz (khớp timebase Timer0 preload) */
    OSCCONbits.IRCF2 = 1;
    OSCCONbits.IRCF1 = 1;
    OSCCONbits.IRCF0 = 0; /* 110 = 4MHz */
    OSCCONbits.SCS = 1;   /* internal oscillator */

    pin_map_init();

    lcd_init();
    keypad_init();
    buttons_init();
    buzzer_init();
    nrf_bridge_init();

    app_init();

    timebase_init();
}

static void fw_tick_10ms(void) {
    /* Driver tick (polling) */
    buttons_tick();
    keypad_tick();
    buzzer_tick();
    nrf_bridge_tick();

    /* App tick */
    app_tick();
}

void main(void) {
    fw_init();

    /* Super-loop đơn giản + tick 10ms từ Timer0 ISR. */
    for (;;) {
        if (timebase_consume_10ms_tick()) {
            fw_tick_10ms();
        }
    }
}
