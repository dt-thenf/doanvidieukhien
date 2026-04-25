/**
 * app_state.h — state machine nền (Kitchen/Counter)
 */
#ifndef APP_STATE_H
#define APP_STATE_H

#include <stdint.h>

typedef enum {
    APP_MODE_KITCHEN = 0,
    APP_MODE_COUNTER = 1
} app_mode_t;

typedef enum {
    LINK_DOWN = 0,
    LINK_UP = 1
} link_state_t;

typedef enum {
    APP_STATE_BOOT = 0,
    APP_STATE_IDLE,
    APP_STATE_WAIT_ACK
} app_state_id_t;

typedef struct {
    app_mode_t mode;
    link_state_t link;
    app_state_id_t state;

    uint8_t seq;

    /* Simple retry policy (demo): timeout 250ms, retry 3 */
    uint8_t wait_ms;
    uint8_t retries_left;

    /* Last sent frame for retry */
    uint8_t last_tx[32];
} app_ctx_t;

void app_init(void);
void app_tick(void);

/* Expose current mode for UI drivers (OLED) */
app_mode_t app_get_mode(void);

#endif /* APP_STATE_H */
