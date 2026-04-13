/**
 * protocol.c — implementation
 */
#include <stdint.h>

#include "../include/protocol.h"

static void mem_zero(uint8_t *p, uint8_t n) {
    uint8_t i;
    for (i = 0; i < n; i++) {
        p[i] = 0;
    }
}

void proto_frame_zero(proto_frame_t *f) {
    f->ver = PI_PIC_PROTO_VER;
    f->msg_type = 0;
    f->seq = 0;
    f->flags = 0;
    mem_zero(f->payload, (uint8_t)PI_PIC_PAYLOAD_LEN);
}

proto_status_t proto_parse_32(const uint8_t *buf32, proto_frame_t *out) {
    uint8_t i;

    if (!buf32 || !out) return PROTO_ERR_BAD_LEN;

    out->ver = buf32[0];
    out->msg_type = buf32[1];
    out->seq = buf32[2];
    out->flags = buf32[3];

    for (i = 0; i < (uint8_t)PI_PIC_PAYLOAD_LEN; i++) {
        out->payload[i] = buf32[(uint8_t)(PI_PIC_HEADER_LEN + i)];
    }

    if (out->ver != PI_PIC_PROTO_VER) return PROTO_ERR_BAD_VER;

    return PROTO_OK;
}

void proto_serialize_32(const proto_frame_t *f, uint8_t *out32) {
    uint8_t i;
    out32[0] = f->ver;
    out32[1] = f->msg_type;
    out32[2] = f->seq;
    out32[3] = f->flags;

    for (i = 0; i < (uint8_t)PI_PIC_PAYLOAD_LEN; i++) {
        out32[(uint8_t)(PI_PIC_HEADER_LEN + i)] = f->payload[i];
    }
}

static void build_common(uint8_t msg_type, uint8_t seq, uint8_t *out32) {
    uint8_t i;
    for (i = 0; i < (uint8_t)PI_PIC_FRAME_LEN; i++) out32[i] = 0;
    out32[0] = PI_PIC_PROTO_VER;
    out32[1] = msg_type;
    out32[2] = seq;
    out32[3] = 0x00;
}

void proto_build_cmd_kitchen_done(uint8_t seq, uint16_t table_code, uint8_t *out32) {
    build_common(PI_PIC_MSG_CMD_KITCHEN_DONE, seq, out32);
    pi_pic_pack_u16_le(&out32[PI_PIC_HEADER_LEN + 0], table_code);
}

void proto_build_cmd_counter_lookup(uint8_t seq, uint8_t lookup_kind, uint16_t table_code, uint8_t *out32) {
    build_common(PI_PIC_MSG_CMD_COUNTER_LOOKUP, seq, out32);
    out32[PI_PIC_HEADER_LEN + 0] = lookup_kind;
    pi_pic_pack_u16_le(&out32[PI_PIC_HEADER_LEN + 1], table_code);
}

void proto_build_cmd_counter_paid(uint8_t seq, uint16_t table_code, uint8_t *out32) {
    build_common(PI_PIC_MSG_CMD_COUNTER_PAID, seq, out32);
    pi_pic_pack_u16_le(&out32[PI_PIC_HEADER_LEN + 0], table_code);
}

void proto_build_ping(uint8_t seq, uint8_t *out32) {
    build_common(PI_PIC_MSG_PING, seq, out32);
}

