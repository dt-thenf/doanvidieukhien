/**
 * lcd_driver.c — HD44780 4-bit bring-up (2 LCD share bus, 2 EN pins)
 *
 * Pin map: see `include/pin_map.h` + `docs/architecture/pic-pin-map.md`
 * - Shared: RS + D4..D7
 * - Separate: EN_KITCHEN, EN_COUNTER
 *
 * Assumption: RW is tied to GND (write-only).
 */
#include <xc.h>
#include <stdint.h>

#include "../include/lcd_driver.h"
#include "../include/pin_map.h"

#ifndef _XTAL_FREQ
#define _XTAL_FREQ 4000000UL
#endif

typedef enum {
    LCD_T_KITCHEN = 0,
    LCD_T_COUNTER = 1
} lcd_target_t;

static lcd_target_t g_target = LCD_T_KITCHEN;

static void en_pulse(void) {
    if (g_target == LCD_T_KITCHEN) {
        LCD_EN_K_OUT = 1;
        __delay_us(2);
        LCD_EN_K_OUT = 0;
    } else {
        LCD_EN_C_OUT = 1;
        __delay_us(2);
        LCD_EN_C_OUT = 0;
    }
    __delay_us(40);
}

static void set_data_nibble(uint8_t nib) {
    LCD_D4_OUT = (nib >> 0) & 1u;
    LCD_D5_OUT = (nib >> 1) & 1u;
    LCD_D6_OUT = (nib >> 2) & 1u;
    LCD_D7_OUT = (nib >> 3) & 1u;
}

static void write4(uint8_t rs, uint8_t nib) {
    LCD_RS_OUT = rs ? 1u : 0u;
    set_data_nibble(nib & 0x0Fu);
    en_pulse();
}

static void write8(uint8_t rs, uint8_t b) {
    write4(rs, (uint8_t)(b >> 4));
    write4(rs, (uint8_t)(b & 0x0Fu));
}

static void cmd(uint8_t c) {
    write8(0, c);
    if (c == 0x01 || c == 0x02) {
        __delay_ms(2);
    }
}

static void data(uint8_t d) {
    write8(1, d);
}

static void select_target(lcd_target_t t) {
    g_target = t;
}

static void init_one_lcd(lcd_target_t t) {
    select_target(t);

    /* HD44780 init sequence for 4-bit mode */
    __delay_ms(40);

    /* 8-bit init (send high nibble 0x3 three times) */
    write4(0, 0x03);
    __delay_ms(5);
    write4(0, 0x03);
    __delay_us(150);
    write4(0, 0x03);
    __delay_us(150);

    /* switch to 4-bit */
    write4(0, 0x02);
    __delay_us(150);

    cmd(0x28); /* function set: 4-bit, 2 lines, 5x8 */
    cmd(0x0C); /* display on, cursor off */
    cmd(0x06); /* entry mode */
    cmd(0x01); /* clear */
}

static void clear(void) {
    cmd(0x01);
}

static void set_cursor(uint8_t col, uint8_t row) {
    /* 16x2 common mapping */
    static const uint8_t row_offsets[] = {0x00, 0x40};
    if (row > 1) row = 1;
    cmd((uint8_t)(0x80 | (row_offsets[row] + col)));
}

static void print_str(const char *s) {
    while (*s) {
        data((uint8_t)*s++);
    }
}

static void show_on(lcd_target_t t, const char *l1, const char *l2) {
    select_target(t);
    clear();
    set_cursor(0, 0);
    print_str(l1);
    set_cursor(0, 1);
    print_str(l2);
}

void lcd_init(void) {
    /* Ensure outputs are low */
    LCD_RS_OUT = 0;
    LCD_EN_K_OUT = 0;
    LCD_EN_C_OUT = 0;

    init_one_lcd(LCD_T_KITCHEN);
    init_one_lcd(LCD_T_COUNTER);

    show_on(LCD_T_KITCHEN, "PIC KITCHEN", "BOOT");
    show_on(LCD_T_COUNTER, "PIC COUNTER", "BOOT");
}

void lcd_show_status(const char *msg) {
    /* Status line depends on current app mode; keep it simple:
     * show on both so beginner always sees it.
     */
    show_on(LCD_T_KITCHEN, "MODE:K", msg);
    show_on(LCD_T_COUNTER, "MODE:C", msg);
}

void lcd_show_mode(app_mode_t mode) {
    if (mode == APP_MODE_KITCHEN) {
        show_on(LCD_T_KITCHEN, "MODE:K", "READY");
    } else {
        show_on(LCD_T_COUNTER, "MODE:C", "READY");
    }
}

void lcd_show_kitchen_event(const char *evt) {
    show_on(LCD_T_KITCHEN, "KITCHEN EVT", evt);
}

void lcd_show_counter_event(const char *evt) {
    show_on(LCD_T_COUNTER, "COUNTER EVT", evt);
}

void lcd_show_counter_entry(const char *text) {
    show_on(LCD_T_COUNTER, "TABLE:", text);
}

