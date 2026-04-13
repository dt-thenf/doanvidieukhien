/**
 * nrf_bridge.c — stub implementation.
 *
 * Hiện tại không có SPI/NRF thật:
 * - send(): accept và "giả lập" thành công
 * - try_recv(): trả false (chưa có nguồn RX)
 *
 * Khi nối NRF thật:
 * - send(): ghi payload 32 byte lên NRF (TX mode)
 * - tick(): đọc IRQ, chuyển RX payload vào queue
 */
#include <stdint.h>
#include <stdbool.h>

#include "../include/nrf_bridge.h"

static volatile uint8_t g_dummy;

void nrf_bridge_init(void) {
    g_dummy = 0;
}

void nrf_bridge_tick(void) {
    /* TODO: poll IRQ / SPI state machine */
    g_dummy++;
}

bool nrf_bridge_send(const uint8_t *buf, uint8_t len) {
    (void)buf;
    (void)len;
    /* TODO: validate len == 32 for protocol v1 */
    return true;
}

bool nrf_bridge_try_recv(uint8_t *out, uint8_t len) {
    (void)out;
    (void)len;
    return false;
}

