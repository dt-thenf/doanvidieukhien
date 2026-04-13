/**
 * protocol.h — parser/serializer frame 32 byte (Pi↔PIC v1)
 */
#ifndef PROTOCOL_H
#define PROTOCOL_H

#include <stdint.h>

#include "pi_pic_proto.h"

typedef enum {
    PROTO_OK = 0,
    PROTO_ERR_BAD_VER = 1,
    PROTO_ERR_BAD_LEN = 2,
    PROTO_ERR_UNSUPPORTED = 3
} proto_status_t;

typedef struct {
    uint8_t ver;
    uint8_t msg_type;
    uint8_t seq;
    uint8_t flags;
    uint8_t payload[PI_PIC_PAYLOAD_LEN];
} proto_frame_t;

/* Generic helpers */
void proto_frame_zero(proto_frame_t *f);
proto_status_t proto_parse_32(const uint8_t *buf32, proto_frame_t *out);
void proto_serialize_32(const proto_frame_t *f, uint8_t *out32);

/* Build minimal PIC→Pi commands */
void proto_build_cmd_kitchen_done(uint8_t seq, uint16_t table_code, uint8_t *out32);
void proto_build_cmd_counter_lookup(uint8_t seq, uint8_t lookup_kind, uint16_t table_code, uint8_t *out32);
void proto_build_cmd_counter_paid(uint8_t seq, uint16_t table_code, uint8_t *out32);
void proto_build_ping(uint8_t seq, uint8_t *out32);

#endif /* PROTOCOL_H */
