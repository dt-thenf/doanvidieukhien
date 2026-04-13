/**
 * timebase.h — timebase 10ms (Timer0 interrupt)
 *
 * Beginner-friendly: Timer0 overflow ~10ms -> set flag -> main loop calls fw_tick_10ms().
 */
#ifndef TIMEBASE_H
#define TIMEBASE_H

#include <stdint.h>
#include <stdbool.h>

/* Init Timer0 to generate ~10ms ticks. */
void timebase_init(void);

/* Returns true once per 10ms tick (consumes the tick flag). */
bool timebase_consume_10ms_tick(void);

/* Optional: monotonic time (10ms units). */
uint32_t timebase_now_10ms(void);

#endif /* TIMEBASE_H */
