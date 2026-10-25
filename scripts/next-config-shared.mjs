// Shared pieces of the two Next.js app configs (apps/dock, apps/headquarters).
//
// Both used to carry a byte-identical copy of the .env loader, so a fix could
// land in one app and not the other. Anything the two configs agree on lives here.
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// The security-header vocabulary lives in a dependency-free module because the dock
// also needs it inside edge middleware, which may not import anything that touches
// the filesystem (like the loader below).
export { SECURITY_HEADERS, NON_FRAMING_HEADERS, securityHeaders, embedOrigins, EMBED_PATH } from './security-headers.mjs'

/**
 * Fill `process.env` from `<repo>/.env`, without overwriting what the shell (or
 * compose) already decided.
 *
 * `NODE_ENV` is skipped by default: it belongs to the Next.js mode
 * (dev/build/start), and letting .env define it made Next warn about a
 * "non-standard NODE_ENV value".
 *
 * @param {string} cwd      the app directory (its `../..` is the repo root)
 * @param {{ skip?: string[] }} [options]
 * @returns {boolean} true when a file was read (false in images, where env comes from compose)
 */
export function loadRootEnv(cwd = process.cwd(), { skip = ['NODE_ENV'] } = {}) {
  const rootEnv = resolve(cwd, '../..', '.env')
  if (!existsSync(rootEnv)) return false
  for (const line of readFileSync(rootEnv, 'utf8').split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith('#')) continue
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line)
    const key = match?.[1]
    if (!key || skip.includes(key) || process.env[key] !== undefined) continue
    process.env[key] = (match?.[2] ?? '').trim().replace(/^["']|["']$/g, '')
  }
  return true
}

/**
 * Baseline response headers are defined once, in `security-headers.mjs`, and
 * re-exported above: HQ takes the strict set, the dock takes the non-framing set
 * and decides `frame-ancestors` per path in its middleware.
 */
