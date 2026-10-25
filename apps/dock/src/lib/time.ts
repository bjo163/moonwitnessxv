/**
 * Schedule time helpers.
 *
 * They live in `@moonwitness/core` — the same source the `moonql-schedule` addon
 * uses — so the week order and the "minutes since UTC midnight" convention can
 * never disagree between the hub and this site. This module only re-exports them
 * to keep one import path inside the app.
 */
export { WEEKDAYS, minutesOf, clock, slotProgress, todayWeekday, weekdayIndex, compareSlots, type Weekday } from '@moonwitness/core'
