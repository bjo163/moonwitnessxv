/**
 * apps/orbit/src/lib/server/review-surface.ts
 *
 * M40-09: the 100CENTER review origin is configuration, so it is read only on
 * the server. Client components receive the already-resolved surface as
 * projection data; nothing in this module may be imported by browser code,
 * otherwise the bundle would carry both a `process.env` reader and the default
 * origin it resolves to.
 */

import { FRONTEND_URLS } from '@moonwitness/core'
import type { ReviewSurface } from '../projections/types.ts'

/**
 * Loopback review surface used when the deployment configures nothing.
 *
 * Same shared port table the hub's service index advertises, so ORBIT cannot
 * drift onto a different 100CENTER origin than the rest of the workspace.
 */
export const LOOPBACK_REVIEW_SURFACE: ReviewSurface = {
  available: true,
  origin: FRONTEND_URLS.headquarters,
}

const ABSENT_REVIEW_SURFACE: ReviewSurface = {
  available: false,
  denial: 'ORIGIN_UNRESOLVED',
}

/**
 * Validate one configured 100CENTER origin.
 *
 * An empty value is an explicit denial rather than a guess, and a
 * credential-bearing or non-http(s) value can never become a link target.
 */
export function validateReviewOrigin(raw: string | undefined): ReviewSurface {
  if (raw === undefined || raw.trim() === '') return ABSENT_REVIEW_SURFACE
  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    return { available: false, denial: 'ORIGIN_MALFORMED' }
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { available: false, denial: 'ORIGIN_SCHEME_UNSUPPORTED' }
  }
  if (parsed.username.length > 0 || parsed.password.length > 0) {
    return { available: false, denial: 'ORIGIN_CREDENTIALS_FORBIDDEN' }
  }
  return { available: true, origin: parsed.origin }
}

/** Resolve the review surface from a server environment. */
export function resolveReviewSurface(
  env: Record<string, string | undefined> = process.env,
): ReviewSurface {
  const configured = env.NEXT_PUBLIC_HEADQUARTERS_URL
  if (configured === undefined) return LOOPBACK_REVIEW_SURFACE
  return validateReviewOrigin(configured)
}
