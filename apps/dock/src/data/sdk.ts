import { createServerSdk } from '@moonwitness/moonql-client'
import { RADIO_API_URL } from '@/lib/env'

/**
 * No token: the Dock reads public views, posts the listen beacon, and renders
 * withholding states for private Graph/Ontology projections until D08 approval.
 * Built by the shared kit, so the base URL is resolved exactly once — the exported
 * constant stays because pages import it for cache tags and error text.
 */
export function serverClient() {
  return createServerSdk({ env: { RADIO_API_URL } })
}
