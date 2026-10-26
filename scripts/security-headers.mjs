// The framing decision, in one dependency-free module.
//
// It has to be importable from two very different places: the Next configs (Node,
// at build time) and `apps/dock/src/middleware.ts` (edge runtime, per request).
// Anything reading the filesystem — like the .env loader next to this file — cannot
// be imported by middleware, so this module stays pure strings and arrays.

/**
 * Baseline response headers for both surfaces.
 *
 * The CSP keeps Next's own inline bootstrap payloads ('unsafe-inline' is what
 * hydration needs without a per-request nonce plumbing) but refuses scripts,
 * frames and form targets from anywhere else — the part that matters for a BFF
 * that carries the admin session cookie.
 *
 * `ancestors` controls `frame-ancestors` only. It is a parameter because the dock
 * wants one path (`/embed/*`) to be frameable while the rest — the catalog, and
 * anything that could carry a session — must stay unframeable.
 *
 * `options.dev` exists because React Refresh compiles each module with `eval()`:
 * under the production script-src the dock's client tree never mounts in `next dev`
 * (the page looks rendered and no button works). It is off unless the caller asks,
 * so no release can ship `unsafe-eval` by forgetting to remove it.
 *
 * @param {string[]} [ancestors]
 * @param {{ dev?: boolean }} [options]
 */
export function securityHeaders(ancestors = ["'none'"], options = {}) {
  const list = ancestors.length ? ancestors : ["'none'"]
  // X-Frame-Options has no allow-list: DENY would override the CSP for exactly the
  // pages the allow-list exists to permit, so it travels with the strict policy.
  const strict = list.length === 1 && list[0] === "'none'"
  return [
    {
      key: 'content-security-policy',
      value:
        `default-src 'self'; script-src 'self' 'unsafe-inline'${options.dev ? " 'unsafe-eval'" : ''}; ` +
        "style-src 'self' 'unsafe-inline'; " +
        `img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ws: wss:; ` +
        // Audio is fetched by the media element, not by fetch/XHR, so it needs its
        // own directive: without it <audio src="https://…"> falls back to
        // default-src 'self' and the station is silently unplayable. https: only —
        // the one plain-HTTP station in the seed catalog stays unplayable on
        // purpose, and the player says so instead of failing silently.
        `media-src 'self' https:; frame-ancestors ${list.join(' ')}; base-uri 'self'; form-action 'self'`,
    },
    { key: 'x-content-type-options', value: 'nosniff' },
    { key: 'referrer-policy', value: 'strict-origin-when-cross-origin' },
    ...(strict ? [{ key: 'x-frame-options', value: 'DENY' }] : []),
    { key: 'permissions-policy', value: 'camera=(), microphone=(), geolocation=()' },
  ]
}

/**
 * Headers that carry no framing decision, for a surface that decides framing per
 * path in middleware. The strict CSP and X-Frame-Options stay out of the static
 * config so the two rules can never contradict each other on the same response.
 */
export const NON_FRAMING_HEADERS = securityHeaders().filter(
  (header) => header.key !== 'content-security-policy' && header.key !== 'x-frame-options',
)

/**
 * Who may embed the dock's `/embed/*` pages, from `EMBED_ORIGINS` (comma list).
 * Empty means nobody: the default is a closed door, opened only by an explicit
 * origin — and `*` is refused, because framing the catalog from anywhere is the
 * exact risk this allow-list exists to control.
 *
 * @param {Record<string, string | undefined>} [env]
 * @returns {string[]}
 */
export function embedOrigins(env = {}) {
  return String(env.EMBED_ORIGINS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value && value !== '*')
}

/** Paths whose response may be framed, when an allow-list exists. */
export const EMBED_PATH = /^\/embed(?:\/|$)/

/** The strict default: nothing may frame anything. */
export const SECURITY_HEADERS = securityHeaders()
