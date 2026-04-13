/**
 * nrf_bridge.c — NRF24L01 TX-first bring-up (PIC16F887, MSSP SPI)
 *
 * Mục tiêu A06.3:
 * - Init SPI/MSSP
 * - Cấu hình NRF24 mức tối thiểu để TX 32 byte payload
 * - Gửi frame (TX-first), polling STATUS (chưa dùng IRQ/RX)
 *
 * Pin map (SoT): `docs/architecture/pic-pin-map.md`
 * - SPI: RC3=SCK, RC4=MISO, RC5=MOSI
 * - CE: RA4
 * - CSN: RB5 (đi qua `portb_safe` shadow)
 * - IRQ: RB0 (chưa dùng ở vòng này)
 */
#include <xc.h>
#include <stdint.h>
#include <stdbool.h>

#include "../include/nrf_bridge.h"
#include "../include/pin_map.h"
#include "../include/portb_safe.h"

#ifndef _XTAL_FREQ
#define _XTAL_FREQ 4000000UL
#endif

/* NRF24 commands */
#define NRF_CMD_R_REGISTER      0x00u
#define NRF_CMD_W_REGISTER      0x20u
#define NRF_CMD_W_TX_PAYLOAD    0xA0u
#define NRF_CMD_FLUSH_TX        0xE1u
#define NRF_CMD_NOP             0xFFu

/* NRF24 registers */
#define NRF_REG_CONFIG          0x00u
#define NRF_REG_EN_AA           0x01u
#define NRF_REG_EN_RXADDR       0x02u
#define NRF_REG_SETUP_AW        0x03u
#define NRF_REG_SETUP_RETR      0x04u
#define NRF_REG_RF_CH           0x05u
#define NRF_REG_RF_SETUP        0x06u
#define NRF_REG_STATUS          0x07u
#define NRF_REG_RX_ADDR_P0      0x0Au
#define NRF_REG_TX_ADDR         0x10u
#define NRF_REG_RX_PW_P0        0x11u
#define NRF_REG_FIFO_STATUS     0x17u

/* STATUS bits */
#define NRF_STATUS_RX_DR        (1u << 6)
#define NRF_STATUS_TX_DS        (1u << 5)
#define NRF_STATUS_MAX_RT       (1u << 4)

static bool g_hw_ready = false;

/* ===== SPI (MSSP) ===== */
static void spi_init_mssp(void) {
    /* SCK (RC3) + MOSI (RC5) outputs, MISO (RC4) input */
    TRISCbits.TRISC3 = 0;
    TRISCbits.TRISC5 = 0;
    TRISCbits.TRISC4 = 1;

    /* SPI mode 0: CKP=0, CKE=1 (data changes on falling edge, sampled on rising) */
    SSPSTATbits.SMP = 0; /* input sampled in middle */
    SSPSTATbits.CKE = 1;

    SSPCONbits.CKP = 0;
    SSPCONbits.SSPM3 = 0;
    SSPCONbits.SSPM2 = 0;
    SSPCONbits.SSPM1 = 0;
    SSPCONbits.SSPM0 = 1; /* Master, Fosc/16 */
    SSPCONbits.SSPEN = 1;
}

static uint8_t spi_xfer(uint8_t b) {
    SSPBUF = b;
    while (!SSPSTATbits.BF) {
        /* wait */
    }
    return SSPBUF;
}

/* ===== NRF low-level ===== */
static void csn_low(void) { portb_set_nrf_csn(false); }
static void csn_high(void) { portb_set_nrf_csn(true); }

static void ce_low(void) { NRF_CE_OUT = 0; }
static void ce_high(void) { NRF_CE_OUT = 1; }

static uint8_t nrf_cmd(uint8_t cmd) {
    csn_low();
    uint8_t status = spi_xfer(cmd);
    csn_high();
    return status;
}

static uint8_t nrf_read_reg(uint8_t reg) {
    uint8_t v;
    csn_low();
    spi_xfer((uint8_t)(NRF_CMD_R_REGISTER | (reg & 0x1Fu)));
    v = spi_xfer(NRF_CMD_NOP);
    csn_high();
    return v;
}

static void nrf_write_reg(uint8_t reg, uint8_t value) {
    csn_low();
    spi_xfer((uint8_t)(NRF_CMD_W_REGISTER | (reg & 0x1Fu)));
    spi_xfer(value);
    csn_high();
}

static void nrf_write_reg_multi(uint8_t reg, const uint8_t *buf, uint8_t n) {
    uint8_t i;
    csn_low();
    spi_xfer((uint8_t)(NRF_CMD_W_REGISTER | (reg & 0x1Fu)));
    for (i = 0; i < n; i++) spi_xfer(buf[i]);
    csn_high();
}

static void nrf_write_tx_payload(const uint8_t *buf, uint8_t n) {
    uint8_t i;
    csn_low();
    spi_xfer(NRF_CMD_W_TX_PAYLOAD);
    for (i = 0; i < n; i++) spi_xfer(buf[i]);
    csn_high();
}

static void nrf_clear_irq_flags(void) {
    /* Clear RX_DR/TX_DS/MAX_RT by writing 1s to those bits */
    nrf_write_reg(NRF_REG_STATUS, (uint8_t)(NRF_STATUS_RX_DR | NRF_STATUS_TX_DS | NRF_STATUS_MAX_RT));
}

static void nrf_tx_init_defaults(void) {
    /* Minimal, demo-friendly defaults */
    static const uint8_t addr[5] = {0xE7, 0xE7, 0xE7, 0xE7, 0xE7};

    ce_low();
    csn_high();
    __delay_ms(5);

    /* Disable auto-ack/retry in HW (PIC handles retry at app level later) */
    nrf_write_reg(NRF_REG_EN_AA, 0x00);
    nrf_write_reg(NRF_REG_SETUP_RETR, 0x00);

    /* Address width: 5 bytes */
    nrf_write_reg(NRF_REG_SETUP_AW, 0x03);

    /* RF channel and data rate/power */
    nrf_write_reg(NRF_REG_RF_CH, 76);      /* common default 2.476GHz */
    nrf_write_reg(NRF_REG_RF_SETUP, 0x06); /* 1Mbps, 0dBm */

    /* Set TX address + RX_ADDR_P0 (required for auto-ack, but keep consistent anyway) */
    nrf_write_reg_multi(NRF_REG_TX_ADDR, addr, 5);
    nrf_write_reg_multi(NRF_REG_RX_ADDR_P0, addr, 5);
    nrf_write_reg(NRF_REG_RX_PW_P0, 32);
    nrf_write_reg(NRF_REG_EN_RXADDR, 0x01); /* enable pipe0 */

    nrf_clear_irq_flags();
    nrf_cmd(NRF_CMD_FLUSH_TX);

    /* CONFIG: CRC enabled (2 bytes), PWR_UP=1, PRIM_RX=0 */
    nrf_write_reg(NRF_REG_CONFIG, 0x0Eu);
    __delay_ms(2); /* PWR_UP settling */
}

static bool nrf_tx_send_32(const uint8_t *buf32) {
    uint16_t guard;
    uint8_t status;

    if (!g_hw_ready) return false;

    ce_low();
    nrf_clear_irq_flags();
    nrf_cmd(NRF_CMD_FLUSH_TX);

    nrf_write_tx_payload(buf32, 32);

    /* Pulse CE to start transmission (>10us) */
    ce_high();
    __delay_us(15);
    ce_low();

    /* Poll STATUS until TX_DS or MAX_RT (no IRQ usage in this phase) */
    for (guard = 0; guard < 2000u; guard++) {
        status = nrf_read_reg(NRF_REG_STATUS);
        if (status & NRF_STATUS_TX_DS) {
            nrf_clear_irq_flags();
            return true;
        }
        if (status & NRF_STATUS_MAX_RT) {
            nrf_clear_irq_flags();
            nrf_cmd(NRF_CMD_FLUSH_TX);
            return false;
        }
        __delay_us(50);
    }
    return false;
}

void nrf_bridge_init(void) {
    /* GPIO directions handled in pin_map_init(); ensure CE low, CSN high */
    ce_low();
    csn_high();

    spi_init_mssp();
    nrf_tx_init_defaults();
    g_hw_ready = true;
}

void nrf_bridge_tick(void) {
    /* TX-first: nothing periodic required */
}

bool nrf_bridge_send(const uint8_t *buf, uint8_t len) {
    if (!buf) return false;
    if (len != 32u) return false; /* protocol v1 fixed */
    return nrf_tx_send_32(buf);
}

bool nrf_bridge_try_recv(uint8_t *out, uint8_t len) {
    (void)out;
    (void)len;
    /* RX/IRQ flow is out of scope for A06.3 */
    return false;
}

