/**
 * nrf_bridge.h — interface/stub cho NRF24L01.
 *
 * Vòng foundation: chỉ định nghĩa API + queue RX/TX đơn giản.
 * Driver SPI/NRF thật sẽ thay thế phần implementation.
 */
#ifndef NRF_BRIDGE_H
#define NRF_BRIDGE_H

#include <stdint.h>
#include <stdbool.h>

void nrf_bridge_init(void);
void nrf_bridge_tick(void);

/* TX: gửi 1 frame (không block). */
bool nrf_bridge_send(const uint8_t *buf, uint8_t len);

/* RX: lấy 1 frame nếu có (non-blocking). */
bool nrf_bridge_try_recv(uint8_t *out, uint8_t len);

#endif /* NRF_BRIDGE_H */
