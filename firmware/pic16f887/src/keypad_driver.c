/**
 * keypad_driver.c — nền polling đơn giản.
 *
 * Mapping demo (dễ nhớ):
 * - digits 0..9: nhập mã bàn (table_code)
 * - 'A': trigger LOOKUP
 * - 'B': trigger PAID
 *
 * Vòng foundation: chưa scan matrix thật; tick() chỉ giữ chỗ.
 * Khi nối phần cứng: scan 4x4 theo pin_map.h, debounce, map key -> char.
 */
#include <stdint.h>
#include <stdbool.h>

#include "../include/keypad_driver.h"

static char g_entry[6];
static uint8_t g_len;
static keypad_event_t g_pending;
static bool g_has_pending;

static uint16_t parse_u16(const char *s) {
    uint16_t v = 0;
    uint8_t i = 0;
    while (s[i] != '\0') {
        char c = s[i];
        if (c < '0' || c > '9') break;
        v = (uint16_t)(v * 10u + (uint16_t)(c - '0'));
        i++;
    }
    return v;
}

static void set_pending(keypad_event_kind_t kind) {
    uint8_t i;
    g_pending.kind = kind;
    for (i = 0; i < 6; i++) g_pending.entry_text[i] = g_entry[i];
    g_pending.table_code = parse_u16(g_entry);
    g_has_pending = true;
}

void keypad_init(void) {
    uint8_t i;
    for (i = 0; i < 6; i++) g_entry[i] = 0;
    g_len = 0;
    g_has_pending = false;
}

void keypad_tick(void) {
    /* TODO: scan thật và gọi handle_key_char() */
}

bool keypad_pop_event(keypad_event_t *out) {
    if (!g_has_pending) return false;
    *out = g_pending;
    g_has_pending = false;
    return true;
}

/* ====== Helpers for future scan implementation ======
static void handle_key_char(char k) {
    if (k >= '0' && k <= '9') {
        if (g_len < 4) {
            g_entry[g_len++] = k;
            g_entry[g_len] = '\0';
            set_pending(KE_KIND_DIGIT);
        }
        return;
    }
    if (k == 'A') {
        set_pending(KE_KIND_LOOKUP);
        return;
    }
    if (k == 'B') {
        set_pending(KE_KIND_PAID);
        return;
    }
    if (k == '*') { // backspace
        if (g_len > 0) g_len--;
        g_entry[g_len] = '\0';
        set_pending(KE_KIND_DIGIT);
        return;
    }
    if (k == '#') { // clear
        g_len = 0;
        g_entry[0] = '\0';
        set_pending(KE_KIND_DIGIT);
        return;
    }
}
*/

