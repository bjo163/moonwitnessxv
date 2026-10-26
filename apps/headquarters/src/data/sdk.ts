import { createServerSdk } from '@moonwitness/moonql-client'
import { RADIO_API_URL } from '@/lib/env'
import { readToken } from '@/lib/session'

/**
 * Server-only client. The token is resolved per request from the httpOnly
 * cookie, so no page or component ever handles the raw value.
 * Construction is the shared kit's job; only the token reader is HQ-specific.
 */
export function serverClient() {
  return createServerSdk({ env: { RADIO_API_URL }, token: readToken })
}
