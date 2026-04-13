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

#include "../include/app_state.h"
#include "../include/protocol.h"
#include "../include/nrf_bridge.h"
#include "../include/lcd_driver.h"
#include "../include/keypad_driver.h"
#include "../include/buttons.h"
#include "../include/buzzer.h"

static void fw_init(void) {
    /* TODO: clock init nếu cần (mặc định INTOSC) */

    pin_map_init();

    lcd_init();
    keypad_init();
    buttons_init();
    buzzer_init();
    nrf_bridge_init();

    app_init();
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

    /* Super-loop đơn giản (beginner-friendly). Về sau có thể thay bằng timer ISR. */
    for (;;) {
        fw_tick_10ms();

        /* TODO: delay 10ms (timer hoặc __delay_ms với _XTAL_FREQ) */
    }
}
