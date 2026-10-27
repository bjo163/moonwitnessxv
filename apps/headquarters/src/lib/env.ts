import { apiBaseUrl } from '@moonwitness/moonql-client'
import { PAGE_SIZE as SHARED_PAGE_SIZE, SITE_NAME as BRAND } from '@moonwitness/core'
import { validatedDockUrl } from './locale-preference'

/**
 * where the radio hub lives — server-side only (never exposed to the browser).
 * Same resolution rule as the dock, from the shared web kit.
 */
export const RADIO_API_URL = apiBaseUrl(process.env)

/** the brand is shared; this surface adds its own suffix */
export const SITE_NAME = process.env.SITE_NAME ? `${process.env.SITE_NAME} HQ` : `${BRAND} HQ`

/** Optional public Dock origin; malformed or credential-bearing values are omitted. */
export const DOCK_URL = validatedDockUrl(process.env.DOCK_URL)

/** rows per table page (shared contract, command-center flavour) */
export const PAGE_SIZE = SHARED_PAGE_SIZE.headquarters
