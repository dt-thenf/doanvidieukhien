/**
 * Pi ↔ PIC binary protocol v1 — constants only (SoT)
 *
 * Source of truth: `docs/architecture/pi-pic-protocol.md`
 * Reference implementation (Pi): `pi-backend/app/services/pic_ingress/nrf_binary.py`
 *
 * Lưu ý: Header/MSG_TYPE phải KHỚP với tài liệu; mọi parser/serializer nên nằm ở `protocol.*`.
 */
#ifndef PI_PIC_PROTO_H
#define PI_PIC_PROTO_H

#include <stdint.h>

#define PI_PIC_PROTO_VER     1u
#define PI_PIC_FRAME_LEN     32u
#define PI_PIC_HEADER_LEN    4u
#define PI_PIC_PAYLOAD_LEN   (PI_PIC_FRAME_LEN - PI_PIC_HEADER_LEN) /* 28 */

/* MSG_TYPE (u8) — values are fixed by docs */
#define PI_PIC_MSG_PING                0x01u
#define PI_PIC_MSG_PONG                0x02u
#define PI_PIC_MSG_ACK                 0x03u
#define PI_PIC_MSG_NACK                0x04u
#define PI_PIC_MSG_EVT_ORDER_NEW       0x10u
#define PI_PIC_MSG_EVT_PAYMENT_PENDING 0x11u
#define PI_PIC_MSG_CMD_KITCHEN_DONE    0x20u
#define PI_PIC_MSG_CMD_COUNTER_LOOKUP  0x21u
#define PI_PIC_MSG_CMD_COUNTER_PAID    0x22u

/* CMD_COUNTER_LOOKUP.lookup_kind */
#define PI_PIC_LOOKUP_BY_TABLE_CODE 0u

/* Helpers (little-endian) */
static inline void pi_pic_pack_u16_le(uint8_t *buf, uint16_t v) {
    buf[0] = (uint8_t)(v & 0xFFu);
    buf[1] = (uint8_t)((v >> 8) & 0xFFu);
}

static inline uint16_t pi_pic_unpack_u16_le(const uint8_t *buf) {
    return (uint16_t)((uint16_t)buf[0] | ((uint16_t)buf[1] << 8));
}

#endif /* PI_PIC_PROTO_H */
