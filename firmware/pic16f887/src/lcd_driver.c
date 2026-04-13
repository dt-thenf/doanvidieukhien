/**
 * lcd_driver.c — stub.
 *
 * Hiện tại: không điều khiển LCD thật, chỉ giữ API để app_state gọi.
 * Khi nối phần cứng: thay bằng driver HD44780 4-bit dùng pin_map.h.
 */
#include <stdint.h>

#include "../include/lcd_driver.h"

static const char *g_last;

void lcd_init(void) {
    g_last = "LCD INIT";
}

void lcd_show_status(const char *msg) {
    g_last = msg;
}

void lcd_show_mode(app_mode_t mode) {
    if (mode == APP_MODE_KITCHEN) g_last = "MODE:K";
    else g_last = "MODE:C";
}

void lcd_show_kitchen_event(const char *evt) {
    g_last = evt;
}

void lcd_show_counter_event(const char *evt) {
    g_last = evt;
}

void lcd_show_counter_entry(const char *text) {
    g_last = text;
}

