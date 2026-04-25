/**
 * app_state.c — triển khai state machine nền.
 *
 * Triết lý: beginner-friendly, polling, ít magic.
 * - Mode: KITCHEN / COUNTER (1 PIC, 2 cụm IO)
 * - PIC gửi CMD_* và chờ ACK/NACK từ Pi (seq matching).
 * - EVT_* từ Pi (ORDER_NEW / PAYMENT_PENDING) chỉ cần hiển thị + buzzer.
 */
#include <stdint.h>

#include "../include/app_state.h"
#include "../include/protocol.h"
#include "../include/nrf_bridge.h"
#include "../include/buttons.h"
#include "../include/keypad_driver.h"
#include "../include/oled_driver.h"
#include "../include/buzzer.h"

static app_ctx_t g;

/* ===== Helpers ===== */
static uint8_t next_seq(void) {
    g.seq++;
    return g.seq;
}

static void send_and_wait_ack(const uint8_t *frame32) {
    uint8_t i;
    for (i = 0; i < 32; i++) g.last_tx[i] = frame32[i];

    nrf_bridge_send(frame32, 32);

    g.state = APP_STATE_WAIT_ACK;
    g.wait_ms = 250;        /* D-2026-04-12-03 */
    g.retries_left = 3;
}

static void on_evt_order_new(const proto_frame_t *f) {
    (void)f;
    /* Stub UX: beep + show minimal text */
    buzzer_beep_short();
    oled_show_kitchen_event("EVT_ORDER_NEW");
}

static void on_evt_payment_pending(const proto_frame_t *f) {
    (void)f;
    buzzer_beep_short();
    oled_show_counter_event("EVT_PAYMENT_PENDING");
}

static void on_ack(const proto_frame_t *f) {
    (void)f;
    g.link = LINK_UP;
    g.state = APP_STATE_IDLE;
    oled_show_status("ACK");
}

static void on_nack(const proto_frame_t *f) {
    (void)f;
    g.link = LINK_UP;
    g.state = APP_STATE_IDLE;
    oled_show_status("NACK");
}

static void handle_rx_frame(const uint8_t *rx32) {
    proto_frame_t f;
    proto_status_t st = proto_parse_32(rx32, &f);
    if (st != PROTO_OK) return;

    switch (f.msg_type) {
        case PI_PIC_MSG_PONG:
            g.link = LINK_UP;
            oled_show_status("PONG");
            break;
        case PI_PIC_MSG_ACK:
            /* ACK/NACK should match last TX seq when waiting. */
            if (g.state == APP_STATE_WAIT_ACK) {
                uint8_t last_seq = g.last_tx[2];
                if (f.seq == last_seq) on_ack(&f);
            } else {
                /* not waiting: still mark link up */
                g.link = LINK_UP;
            }
            break;
        case PI_PIC_MSG_NACK:
            if (g.state == APP_STATE_WAIT_ACK) {
                uint8_t last_seq = g.last_tx[2];
                if (f.seq == last_seq) on_nack(&f);
            } else {
                g.link = LINK_UP;
            }
            break;
        case PI_PIC_MSG_EVT_ORDER_NEW:
            on_evt_order_new(&f);
            break;
        case PI_PIC_MSG_EVT_PAYMENT_PENDING:
            on_evt_payment_pending(&f);
            break;
        default:
            /* ignore unknown types in foundation */
            break;
    }
}

void app_init(void) {
    uint8_t i;
    g.mode = APP_MODE_KITCHEN;
    g.link = LINK_DOWN;
    g.state = APP_STATE_BOOT;
    g.seq = 0;
    g.wait_ms = 0;
    g.retries_left = 0;
    for (i = 0; i < 32; i++) g.last_tx[i] = 0;

    oled_show_status("BOOT");
    g.state = APP_STATE_IDLE;
}

app_mode_t app_get_mode(void) {
    return g.mode;
}

static void tick_inputs_and_actions(void) {
    /* Mode switch */
    if (buttons_was_pressed(BTN_ID_MODE)) {
        g.mode = (g.mode == APP_MODE_KITCHEN) ? APP_MODE_COUNTER : APP_MODE_KITCHEN;
        oled_show_mode(g.mode);
    }

    /* Kitchen: DONE button -> CMD_KITCHEN_DONE(table_code) */
    if (g.mode == APP_MODE_KITCHEN) {
        if (buttons_was_pressed(BTN_ID_K_NEXT)) {
            /* A06.5 test: dùng K_NEXT để gửi PING->PONG */
            uint8_t frame[32];
            uint8_t seq = next_seq();
            proto_build_ping(seq, frame);
            send_and_wait_ack(frame);
            oled_show_status("TX PING");
        }
        if (buttons_was_pressed(BTN_ID_K_DONE)) {
            uint8_t frame[32];
            uint16_t table_code = 1; /* TODO: lấy từ UI/setting */
            uint8_t seq = next_seq();
            proto_build_cmd_kitchen_done(seq, table_code, frame);
            send_and_wait_ack(frame);
            oled_show_status("TX K_DONE");
        }
    }

    /* Counter: keypad nhập table_code -> LOOKUP / PAID (stub mapping) */
    if (g.mode == APP_MODE_COUNTER) {
        keypad_event_t ke;
        if (keypad_pop_event(&ke)) {
            /* Foundation: demo cực đơn giản:
             * - Phím 'A' => LOOKUP table=entered
             * - Phím 'B' => PAID table=entered
             * - Số 0..9 => build table_code (0..9999) trong keypad driver
             */
            if (ke.kind == KE_KIND_LOOKUP) {
                uint8_t frame[32];
                uint8_t seq = next_seq();
                proto_build_cmd_counter_lookup(seq, PI_PIC_LOOKUP_BY_TABLE_CODE, ke.table_code, frame);
                send_and_wait_ack(frame);
                oled_show_status("TX LOOKUP");
            } else if (ke.kind == KE_KIND_PAID) {
                uint8_t frame[32];
                uint8_t seq = next_seq();
                proto_build_cmd_counter_paid(seq, ke.table_code, frame);
                send_and_wait_ack(frame);
                oled_show_status("TX PAID");
            } else {
                /* digits: already handled by keypad driver; lcd can show entry */
                oled_show_counter_entry(ke.entry_text);
            }
        }
    }
}

void app_tick(void) {
    uint8_t rx32[32];

    /* 1) Handle RX (non-blocking) */
    while (nrf_bridge_try_recv(rx32, 32)) {
        handle_rx_frame(rx32);
    }

    /* 2) State actions */
    if (g.state == APP_STATE_IDLE) {
        tick_inputs_and_actions();
        return;
    }

    if (g.state == APP_STATE_WAIT_ACK) {
        /* Countdown in 10ms tick */
        if (g.wait_ms >= 10) g.wait_ms = (uint8_t)(g.wait_ms - 10);
        else g.wait_ms = 0;

        if (g.wait_ms == 0) {
            if (g.retries_left > 0) {
                g.retries_left--;
                g.wait_ms = 250;
                nrf_bridge_send(g.last_tx, 32);
                oled_show_status("RETRY");
            } else {
                g.link = LINK_DOWN;
                g.state = APP_STATE_IDLE;
                oled_show_status("LINK DOWN");
            }
        }
    }
}

