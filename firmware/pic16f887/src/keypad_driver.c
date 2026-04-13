/**
 * keypad_driver.c — nền polling đơn giản.
 *
 * Mapping demo (dễ nhớ):
 * - digits 0..9: nhập mã bàn (table_code)
 * - 'A': trigger LOOKUP
 * - 'B': trigger PAID
 *
 * Vòng A06.2: scan matrix 4x4 + debounce đơn giản theo tick 10ms.
 * Assumption: mỗi lần chỉ 1 phím được nhấn (multi-key sẽ bỏ qua).
 */
#include <stdint.h>
#include <stdbool.h>

#include "../include/keypad_driver.h"
#include "../include/pin_map.h"
#include "../include/portb_safe.h"

static char g_entry[6];
static uint8_t g_len;
static keypad_event_t g_pending;
static bool g_has_pending;

/* Debounce state */
static char g_last_raw;
static char g_last_stable;
static uint8_t g_stable_ticks;
static bool g_was_down;

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
    if (k == '*') { /* backspace */
        if (g_len > 0) g_len--;
        g_entry[g_len] = '\0';
        set_pending(KE_KIND_DIGIT);
        return;
    }
    if (k == '#') { /* clear */
        g_len = 0;
        g_entry[0] = '\0';
        set_pending(KE_KIND_DIGIT);
        return;
    }
}

static char map_row_col_to_key(uint8_t row, uint8_t col) {
    /* Layout phổ biến:
     * R0: 1 2 3 A
     * R1: 4 5 6 B
     * R2: 7 8 9 C
     * R3: * 0 # D
     */
    static const char keys[4][4] = {
        {'1','2','3','A'},
        {'4','5','6','B'},
        {'7','8','9','C'},
        {'*','0','#','D'},
    };
    return keys[row][col];
}

static uint8_t read_cols_pressed_mask(void) {
    /* Cols are inputs with pull-ups: pressed => read 0 */
    uint8_t m = 0;
    if (KP_C0_PORT == 0) m |= 0x01;
    if (KP_C1_PORT == 0) m |= 0x02;
    if (KP_C2_PORT == 0) m |= 0x04;
    if (KP_C3_PORT == 0) m |= 0x08;
    return m;
}

static char scan_one_key_raw(void) {
    uint8_t r;
    uint8_t pressed_rows = 0;
    uint8_t pressed_cols = 0;
    uint8_t row_idx = 0xFF;
    uint8_t col_idx = 0xFF;

    /* set all rows high (inactive) */
    portb_set_keypad_rows(0x0F, true);

    for (r = 0; r < 4; r++) {
        /* drive one row low */
        portb_set_keypad_rows((uint8_t)(1u << r), false);

        /* small settle: next tick would also work; keep simple */
        pressed_cols = read_cols_pressed_mask();
        if (pressed_cols != 0) {
            pressed_rows |= (uint8_t)(1u << r);
        }

        /* restore row high before next */
        portb_set_keypad_rows((uint8_t)(1u << r), true);
    }

    /* Require exactly one row and one col pressed */
    if (pressed_rows == 0) return 0;
    if ((pressed_rows & (pressed_rows - 1u)) != 0) return 0; /* multi row */

    /* Determine which row is pressed by rescan that row to get col mask */
    for (r = 0; r < 4; r++) {
        if (pressed_rows == (uint8_t)(1u << r)) {
            row_idx = r;
            break;
        }
    }
    if (row_idx == 0xFF) return 0;

    portb_set_keypad_rows(0x0F, true);
    portb_set_keypad_rows((uint8_t)(1u << row_idx), false);
    pressed_cols = read_cols_pressed_mask();
    portb_set_keypad_rows((uint8_t)(1u << row_idx), true);

    if (pressed_cols == 0) return 0;
    if ((pressed_cols & (pressed_cols - 1u)) != 0) return 0; /* multi col */

    if (pressed_cols == 0x01) col_idx = 0;
    else if (pressed_cols == 0x02) col_idx = 1;
    else if (pressed_cols == 0x04) col_idx = 2;
    else if (pressed_cols == 0x08) col_idx = 3;
    else return 0;

    return map_row_col_to_key(row_idx, col_idx);
}

void keypad_init(void) {
    uint8_t i;
    for (i = 0; i < 6; i++) g_entry[i] = 0;
    g_len = 0;
    g_has_pending = false;

    g_last_raw = 0;
    g_last_stable = 0;
    g_stable_ticks = 0;
    g_was_down = false;
}

void keypad_tick(void) {
    char raw = scan_one_key_raw();

    if (raw == g_last_raw) {
        if (g_stable_ticks < 5) g_stable_ticks++;
    } else {
        g_last_raw = raw;
        g_stable_ticks = 0;
    }

    /* Debounce threshold: 2 ticks ~20ms */
    if (g_stable_ticks >= 2) {
        g_last_stable = g_last_raw;
    }

    /* Detect edge: stable key down event */
    if (!g_was_down && g_last_stable != 0) {
        g_was_down = true;
        handle_key_char(g_last_stable);
        return;
    }

    /* Detect release */
    if (g_was_down && g_last_stable == 0) {
        g_was_down = false;
    }
}

bool keypad_pop_event(keypad_event_t *out) {
    if (!g_has_pending) return false;
    *out = g_pending;
    g_has_pending = false;
    return true;
}

