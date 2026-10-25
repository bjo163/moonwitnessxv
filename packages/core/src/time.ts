/**
 * The schedule's time conventions, defined once.
 *
 * `moonql-schedule` (server side) and the public site both need to know that a
 * weekday is stored as a three-letter code, that the week starts on Sunday and
 * that slot times are minutes since UTC midnight. Two copies of that rule is how
 * a grid ends up sorted alphabetically (fri, mon, sat…) instead of chronologically.
 */

/** Calendar week order — index 0 is Sunday, matching `Date.getUTCDay()`. */
export const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const

export type Weekday = (typeof WEEKDAYS)[number]

/** Position of a weekday code in the calendar week (-1 when unknown). */
export const weekdayIndex = (weekday: unknown): number => WEEKDAYS.indexOf(String(weekday) as Weekday)

/** minutes since UTC midnight — the unit the schedule stores */
export const minutesOf = (now: Date): number => now.getUTCHours() * 60 + now.getUTCMinutes()

export const todayWeekday = (now = new Date()): Weekday => WEEKDAYS[now.getUTCDay()]!

/** 07:30 for 450 — the schedule's display format */
export const clock = (minutes: number): string => {
  const hh = String(Math.floor(minutes / 60) % 24).padStart(2, '0')
  const mm = String(minutes % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

export interface WeekSlot {
  dayIndex?: number
  weekday?: unknown
  startMin?: number
}

/** Chronological order across the week: Sunday first, then time of day. */
export const compareSlots = (a: WeekSlot, b: WeekSlot): number => {
  const dayA = typeof a.dayIndex === 'number' ? a.dayIndex : weekdayIndex(a.weekday)
  const dayB = typeof b.dayIndex === 'number' ? b.dayIndex : weekdayIndex(b.weekday)
  return dayA - dayB || Number(a.startMin ?? 0) - Number(b.startMin ?? 0)
}

/**
 * How far into a slot we are, in percent (0-100, clamped).
 *
 * The dock renders this on the server for the first paint and again in the browser
 * to keep the bar moving without polling — which is exactly why it lives here: two
 * copies of the formula is how a progress bar starts disagreeing with the times
 * printed next to it. A zero-length slot returns 0 rather than dividing by nothing.
 */
export const slotProgress = (startMin: number, endMin: number, now: Date): number => {
  const span = endMin - startMin
  if (span <= 0) return 0
  return Math.max(0, Math.min(100, Math.round(((minutesOf(now) - startMin) / span) * 100)))
}
