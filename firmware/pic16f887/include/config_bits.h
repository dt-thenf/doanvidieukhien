/**
 * config_bits.h — bộ config bits đề xuất (A06.1 bring-up)
 *
 * Mục tiêu: cấu hình "an toàn, dễ debug" cho PIC16F887 khi chưa chốt mạch.
 *
 * BẮT BUỘC xem lại theo mạch thật:
 * - Nếu dùng thạch anh ngoài: FOSC phải đổi.
 * - Nếu mạch không có MCLR kéo lên đúng: MCLRE cần xem lại.
 * - Nếu cần Low Voltage Programming: LVP phải xem lại (khuyến nghị OFF cho beginner + ICSP).
 */
#ifndef CONFIG_BITS_H
#define CONFIG_BITS_H

/* XC8 expects <xc.h> included in compilation unit (main.c). */

/* =========================
 * Config bits đề xuất
 * =========================
 * - INTOSC, không xuất clock ra chân (INTRC_NOCLKOUT)
 * - Tắt WDT để debug dễ
 * - Bật power-up timer để ổn định nguồn
 * - Bật MCLR (khuyến nghị khi có mạch MCLR chuẩn)
 * - Tắt LVP (tránh kẹt ICSP/beginner)
 */

/* Oscillator Selection bits */
#pragma config FOSC = INTRC_NOCLKOUT
/* Watchdog Timer Enable bit */
#pragma config WDTE = OFF
/* Power-up Timer Enable bit */
#pragma config PWRTE = ON
/* MCLR Pin Function Select bit */
#pragma config MCLRE = ON
/* Code Protection bits */
#pragma config CP = OFF
#pragma config CPD = OFF
/* Brown-out Reset Selection bits */
#pragma config BOREN = ON
/* Internal/External Switchover Mode bit */
#pragma config IESO = OFF
/* Fail-Safe Clock Monitor Enable bit */
#pragma config FCMEN = OFF
/* Low-Voltage Programming Enable bit */
#pragma config LVP = OFF

/* TODO theo mạch thật:
 * - BORV (mức brown-out) nếu bạn muốn chỉnh.
 * - DEBUG nếu dùng ICD (thường để default).
 */

#endif /* CONFIG_BITS_H */
