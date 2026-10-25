/**
 * URL search params arrive as untrusted strings. Handing `Number('abc')` straight
 * to the API produced a `NaN` offset that the hub rejected with a 400 — an error
 * page for a typo in the address bar. Clamp here instead, once.
 */

/** Integer >= 1, falling back when the value is missing, blank or nonsense. */
export function toPositiveInt(value: unknown, fallback = 1, max?: number): number {
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value ?? ''), 10)
  if (!Number.isFinite(parsed) || parsed < 1) return fallback
  return max === undefined ? Math.trunc(parsed) : Math.min(Math.trunc(parsed), max)
}

/** Zero-based row offset for a 1-based page number. */
export const toOffset = (page: unknown, pageSize: number, fallback = 1): number =>
  (toPositiveInt(page, fallback) - 1) * pageSize
