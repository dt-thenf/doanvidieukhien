/**
 * lcd_driver.h — stub driver cho 2 LCD (Bếp/Quầy).
 *
 * Vòng foundation: API rõ ràng + hiển thị text tối thiểu.
 * Khi có phần cứng thật: implement HD44780 4-bit, chọn EN theo màn hình.
 */
#ifndef LCD_DRIVER_H
#define LCD_DRIVER_H

#include <stdint.h>
#include "app_state.h"

void lcd_init(void);

void lcd_show_status(const char *msg);
void lcd_show_mode(app_mode_t mode);

void lcd_show_kitchen_event(const char *evt);
void lcd_show_counter_event(const char *evt);
void lcd_show_counter_entry(const char *text);

#endif /* LCD_DRIVER_H */
