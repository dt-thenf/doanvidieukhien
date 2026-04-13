/**
 * buttons.h — polling + debounce tối thiểu cho các nút.
 */
#ifndef BUTTONS_H
#define BUTTONS_H

#include <stdint.h>
#include <stdbool.h>

typedef enum {
    BTN_ID_MODE = 0,
    BTN_ID_K_DONE = 1,
    BTN_ID_K_NEXT = 2,
    BTN_ID_COUNT
} button_id_t;

void buttons_init(void);
void buttons_tick(void);

bool buttons_was_pressed(button_id_t id);

#endif /* BUTTONS_H */
