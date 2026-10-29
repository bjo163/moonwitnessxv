import { MoonApiError } from '@moonwitness/moonql-client'

/**
 * The sentence a panel shows when a hub read fails.
 *
 * A `MoonApiError` is the hub answering with a real problem, so its message is
 * the honest one. Anything else is an infrastructure fault whose text is not
 * for the visitor: the panel shows its own localized notice instead.
 */
export function panelErrorMessage(err: unknown, fallback: string): string {
  return err instanceof MoonApiError ? err.message : fallback
}

/** Public projections that require an unapproved D08 release are withheld by the Hub. */
export function isProjectionWithheld(err: unknown): boolean {
  return err instanceof MoonApiError && (err.statusCode === 401 || err.statusCode === 403)
}

/** The public Terms route is intentionally closed while no D08 release projection exists. */
