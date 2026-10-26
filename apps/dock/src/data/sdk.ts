import { createServerSdk } from '@moonwitness/moonql-client'
import { RADIO_API_URL } from '@/lib/env'

/**
 * no token: the dock only reads public views and posts the listen beacon.
 * Built by the shared kit, so the base URL is resolved exactly once — the exported
 * constant stays because pages import it for cache tags and error text.
 */
export function serverClient() {
  return createServerSdk({ env: { RADIO_API_URL } })
}
