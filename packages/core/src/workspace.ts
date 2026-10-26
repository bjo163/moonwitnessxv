/**
 * One place for the numbers and names the whole workspace shares.
 *
 * These used to be re-typed in the hub config, both frontends, the compose
 * files and the dev scripts — so a port or a product name could (and did) drift
 * between dev, build and deploy. Import from here instead.
 */

/** Product name: shown by the hub, the public site and the command center. */
export const SITE_NAME = 'Moonwitness'

/** API mount prefix of the hub (every REST route lives under it). */
export const API_PREFIX = '/api/v1'

/** Fixed dev/preview ports: hub :3000, public site :3001, command center :3002, ai gateway :3003, cockpit :3004. */
export const PORTS = { hub: 3000, dock: 3001, headquarters: 3002, aigateway: 3003, cockpit: 3004 } as const

/** Loopback origin of the hub, as the host-side frontends reach it. */
export const HUB_API_DEFAULT = `http://127.0.0.1:${PORTS.hub}${API_PREFIX}`

/** Default loopback origin of the AI Gateway router. */
export const AI_GATEWAY_URL_DEFAULT = `http://127.0.0.1:${PORTS.aigateway}`

/** Default loopback origin of the Moondeck GUI Cockpit. */
export const COCKPIT_URL_DEFAULT = `http://127.0.0.1:${PORTS.cockpit}`

/** Public URLs the hub advertises on its service index. */
export const FRONTEND_URLS = {
  dock: `http://localhost:${PORTS.dock}`,
  headquarters: `http://localhost:${PORTS.headquarters}`,
} as const

/**
 * Session lifetime, shared by the hub (which writes the expiry) and the command
 * center (which sets the cookie): two numbers used to be one decision.
 */
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60

/** Table page sizes per surface (deliberately different, but named once). */
export const PAGE_SIZE = { headquarters: 20, dock: 12 } as const
