/**
 * @moonwitness/web-config — the shared half of the two Next.js app configs.
 *
 * This used to live in repo-root `scripts/`, which turned that directory into an
 * unowned pseudo-package: the apps reached into it by relative path
 * (`../../scripts/next-config-shared.mjs`), the header vocabulary came back out
 * of a build-output path (`../packages/core/dist/index.js`), and `Dockerfile.web`
 * had to COPY `scripts/` into the runtime image because `next start` re-reads
 * `next.config.mjs`. A real package with a real dependency edge removes all three
 * problems at once: resolution goes through node_modules, and the rules stay in
 * exactly one owner (`@moonwitness/core`).
 */
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * The security-header vocabulary is core's, for one reason: the hub, the dock's
 * edge middleware and both Next configs must not be able to disagree about what
 * `frame-ancestors` says. It is re-exported here so an app config has one door.
 */
export { SECURITY_HEADERS, NON_FRAMING_HEADERS, securityHeaders, embedOrigins, EMBED_PATH } from '@moonwitness/core'

/**
 * Fill `process.env` from `<repo>/.env`, without overwriting what the shell (or
 * compose) already decided.
 *
 * `NODE_ENV` is skipped by default: it belongs to the Next.js mode
 * (dev/build/start), and letting .env define it made Next warn about a
 * "non-standard NODE_ENV value".
 *
 * @param cwd the app directory (its `../..` is the repo root)
 * @returns true when a file was read (false in images, where env comes from compose)
 */
export function loadRootEnv(cwd = process.cwd(), { skip = ['NODE_ENV'] }: { skip?: string[] } = {}): boolean {
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
