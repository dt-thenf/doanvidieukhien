/**
 * keypad_driver.h — keypad 4x4 driver (polling) + event model.
 */
#ifndef KEYPAD_DRIVER_H
#define KEYPAD_DRIVER_H

#include <stdint.h>
#include <stdbool.h>

typedef enum {
    KE_KIND_DIGIT = 0,
    KE_KIND_LOOKUP = 1,
    KE_KIND_PAID = 2
} keypad_event_kind_t;

typedef struct {
    keypad_event_kind_t kind;
    uint16_t table_code;         /* valid for LOOKUP/PAID, and for DIGIT after parse */
    char entry_text[6];          /* "1234\0" */
} keypad_event_t;

void keypad_init(void);
void keypad_tick(void);

bool keypad_pop_event(keypad_event_t *out);

#endif /* KEYPAD_DRIVER_H */
