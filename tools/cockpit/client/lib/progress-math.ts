import type { FlipTotals } from '../types'

/**
 * Net tasks closed since the panel opened.
 *
 * The server's counters are lifetime totals, so the panel subtracts the pair it
 * saw first. Keeping this as a pure function makes the badge's arithmetic
 * testable without a DOM, and keeps the hook's dedupe logic uncluttered.
 */
export function netClosedSince(baseline: FlipTotals, totals: FlipTotals): number {
  return totals.closed - baseline.closed - (totals.reopened - baseline.reopened)
}

/** Badge text for the session counter; empty when nothing moved. */
export function sessionBadgeText(net: number, suffix: string): string | null {
  if (net === 0) return null
  return `${net > 0 ? `+${String(net)}` : String(net)} ${suffix}`
}
