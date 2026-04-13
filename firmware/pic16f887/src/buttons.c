/**
 * buttons.c — debounce rất đơn giản (10ms tick).
 *
 * Assumption: nút active-low với pull-up.
 */
#include <stdint.h>
#include <stdbool.h>

#include "../include/buttons.h"
#include "../include/pin_map.h"

typedef struct {
    uint8_t stable;   /* 0/1 sampled */
    uint8_t cnt;      /* debounce counter */
    bool pressed_latch;
} btn_state_t;

static btn_state_t g_btn[BTN_ID_COUNT];

static uint8_t read_btn(button_id_t id) {
    /* active-low -> pressed=1 */
    switch (id) {
        case BTN_ID_MODE:   return (BTN_MODE_PORT == 0) ? 1u : 0u;
        case BTN_ID_K_DONE: return (BTN_K_DONE_PORT == 0) ? 1u : 0u;
        case BTN_ID_K_NEXT: return (BTN_K_NEXT_PORT == 0) ? 1u : 0u;
        default: return 0u;
    }
}

void buttons_init(void) {
    uint8_t i;
    for (i = 0; i < BTN_ID_COUNT; i++) {
        g_btn[i].stable = 0;
        g_btn[i].cnt = 0;
        g_btn[i].pressed_latch = false;
    }
}

void buttons_tick(void) {
    uint8_t i;
    for (i = 0; i < BTN_ID_COUNT; i++) {
        uint8_t raw = read_btn((button_id_t)i);
        if (raw == g_btn[i].stable) {
            g_btn[i].cnt = 0;
        } else {
            if (g_btn[i].cnt < 3) {
                g_btn[i].cnt++;
            } else {
                /* stable change after ~30ms */
                g_btn[i].stable = raw;
                g_btn[i].cnt = 0;
                if (raw == 1u) {
                    g_btn[i].pressed_latch = true;
                }
            }
        }
    }
}

bool buttons_was_pressed(button_id_t id) {
    if (id >= BTN_ID_COUNT) return false;
    if (!g_btn[id].pressed_latch) return false;
    g_btn[id].pressed_latch = false;
    return true;
}

