/**
 * oled_driver.h — driver hiển thị cho 2 OLED SSD1306 (Bếp/Quầy) qua software I2C.
 *
 * Mục tiêu: API dễ hiểu cho beginner, đủ để init/clear/print text ngắn và chọn màn hình.
 * Source of truth: `docs/architecture/pic-pin-map.md`.
 */
#ifndef OLED_DRIVER_H
#define OLED_DRIVER_H

#include <stdint.h>
#include "app_state.h"

/* I2C 7-bit addresses (SoT dự án) */
#define OLED_ADDR_KITCHEN 0x3Cu
#define OLED_ADDR_COUNTER 0x3Du

typedef enum {
    OLED_T_KITCHEN = 0,
    OLED_T_COUNTER = 1
} oled_target_t;

void oled_init(void);

/* Chọn màn hình mặc định cho các lệnh print/clear tiếp theo */
void oled_select(oled_target_t t);
void oled_select_kitchen(void);
void oled_select_counter(void);

/* Text-mode helpers (không tối ưu đồ họa) */
void oled_clear(void);
void oled_print_line(uint8_t line /*0..7*/, const char *text);

/* App-friendly helpers (tương đương lcd_driver cũ) */
void oled_show_status(const char *msg);
void oled_show_mode(app_mode_t mode);
void oled_show_kitchen_event(const char *evt);
void oled_show_counter_event(const char *evt);
void oled_show_counter_entry(const char *text);

#endif /* OLED_DRIVER_H */

