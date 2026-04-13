/**
 * config_bits.h
 *
 * Mục tiêu: gom cấu hình fuse để beginner dễ tìm.
 *
 * Lưu ý quan trọng:
 * - CONFIG bits phụ thuộc phần cứng cụ thể (clock, watchdog, MCLR...).
 * - Ở vòng foundation, file này chỉ để "placeholder" có cấu trúc rõ ràng.
 * - Khi tạo project MPLAB X, bạn có thể dùng MCC hoặc GUI để sinh #pragma config,
 *   sau đó dán vào đây.
 */
#ifndef CONFIG_BITS_H
#define CONFIG_BITS_H

/* XC8 expects <xc.h> included in compilation unit (main.c). */

/* Example (CHỈ MINH HỌA — đừng bật nếu chưa hiểu):
 *
 * #pragma config FOSC = INTRC_NOCLKOUT
 * #pragma config WDTE = OFF
 * #pragma config PWRTE = ON
 * #pragma config MCLRE = ON
 * #pragma config CP = OFF
 * #pragma config CPD = OFF
 * #pragma config BOREN = ON
 * #pragma config IESO = OFF
 * #pragma config FCMEN = OFF
 * #pragma config LVP = OFF
 *
 * Tùy mạch thật, bạn sẽ chốt lại giá trị.
 */

#endif /* CONFIG_BITS_H */
