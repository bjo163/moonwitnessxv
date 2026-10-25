import { apiBaseUrl } from '@moonwitness/moonql-client'
import { PAGE_SIZE as SHARED_PAGE_SIZE, SITE_NAME as BRAND } from '@moonwitness/core'

/**
 * server-only: the browser only ever talks to this Next app.
 * One resolution rule for both surfaces, in the shared kit — the trailing-slash
 * handling and the fallback default used to be typed twice, in two files.
 */
export const RADIO_API_URL = apiBaseUrl(process.env)

export const SITE_NAME = process.env.SITE_NAME ?? BRAND

export const SITE_TAGLINE = 'Late-night radio, catalogued by the hub itself.'

/** page size for the public grids (shared contract, dock flavour) */
export const PAGE_SIZE = SHARED_PAGE_SIZE.dock
