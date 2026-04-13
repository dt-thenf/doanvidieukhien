/**
 * buzzer.c — beep theo tick 10ms.
 */
#include <stdint.h>

#include "../include/buzzer.h"
#include "../include/pin_map.h"

static uint8_t g_beep_ticks;

void buzzer_init(void) {
    g_beep_ticks = 0;
    BUZZ_OUT = 0;
}

void buzzer_tick(void) {
    if (g_beep_ticks > 0) {
        g_beep_ticks--;
        BUZZ_OUT = 1;
    } else {
        BUZZ_OUT = 0;
    }
}

void buzzer_beep_short(void) {
    /* ~100ms nếu tick=10ms */
    g_beep_ticks = 10;
}

