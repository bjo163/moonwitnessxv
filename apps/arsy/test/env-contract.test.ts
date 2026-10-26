import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { assertPublicHttpUrl, ECHOLOG_URL_DEFAULT, PORTS, SKYLINK_URL_DEFAULT } from '@moonwitness/core'
import { ADDON_ENV_KEY_LIST, RADIO_ENV_KEYS } from '../src/config.js'

/**
 * The env contract.
 *
 * `.env.example` used to document a variable the hub never read, omit half of
 * what the frontends need, and carry a different API title than the defaults —
 * exactly the drift that makes "works on my machine" permanent. These tests tie
 * the template (and the local .env) to the schema that actually validates them.
 */

/** Variables consumed outside apps/arsy (compose + Next apps). */
const FOREIGN_ENV_KEYS = [
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DB',
  'SITE_NAME',
  'RADIO_API_URL',
  'ARSY_API_URL',
  'HQ_COOKIE_SECURE',
  // read by apps/dock/src/middleware.ts to allow-list framers of /embed/*
  'EMBED_ORIGINS',
  // read by the compose backup sidecar's shell loop, never by the hub
  'BACKUP_INTERVAL_SECONDS',
  'BACKUP_KEEP',
  // read by apps/echolog/src/config.ts; never aliases the hub PORT
  'ECHOLOG_HOST',
  'ECHOLOG_PORT',
  'ECHOLOG_ARSY_URL',
  'ECHOLOG_SERVICE_KEY',
  'ECHOLOG_GRANT_SECRET',
  'ECHOLOG_STORAGE_ROOT',
  'ECHOLOG_STORAGE_QUOTA_BYTES',
  'ECHOLOG_MAX_UPLOAD_BYTES',
  'ECHOLOG_ALLOWED_MIME_TYPES',
  'ECHOLOG_MINIO_ROOT_USER',
  'ECHOLOG_MINIO_ROOT_PASSWORD',
] as const

const ALLOWED = new Set<string>([...RADIO_ENV_KEYS, ...ADDON_ENV_KEY_LIST, ...FOREIGN_ENV_KEYS])

function keysOf(file: string): string[] | null {
  const path = join(process.cwd(), '..', '..', file)
  if (!existsSync(path)) return null
  return readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .map((line) => /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(line)?.[1])
    .filter((key): key is string => Boolean(key))
}

test('.env.example only names variables the code actually reads', () => {
  const keys = keysOf('.env.example')
  assert.ok(keys, '.env.example must exist at the repo root')
  const unknown = keys!.filter((key) => !ALLOWED.has(key))
  assert.deepEqual(unknown, [], `undocumented/renamed keys in .env.example: ${unknown.join(', ')}`)
})

test('.env.example documents every hub variable (no hidden defaults)', () => {
  // ARSY_* and RADIO_* are deliberate override aliases of the generic defaults;
  // documenting every spelling as active would invite conflicting values.
  const OVERRIDE_ALIASES = new Set([
    'ARSY_PORT', 'RADIO_PORT', 'ARSY_PREFIX', 'RADIO_PREFIX',
    'ARSY_TITLE', 'RADIO_TITLE',
  ])
  const keys = new Set(keysOf('.env.example') ?? [])
  const missing = RADIO_ENV_KEYS.filter((key) => !keys.has(key) && !OVERRIDE_ALIASES.has(key))
  assert.deepEqual(missing, [], `.env.example is missing: ${missing.join(', ')}`)
})

test('the retired WHATSAPP_PREFIX does not come back', () => {
  for (const file of ['.env.example', '.env']) {
    assert.ok(!(keysOf(file) ?? []).includes('WHATSAPP_PREFIX'), `${file} still sets WHATSAPP_PREFIX`)
  }
})

test('.env.example ships placeholders, not credentials', () => {
  const path = join(process.cwd(), '..', '..', '.env.example')
  const text = readFileSync(path, 'utf8')
  for (const key of ['POSTGRES_PASSWORD', 'MOONQL_AUTH_ADMIN_PASSWORD', 'DENPA_TOKEN', 'ECHOLOG_SERVICE_KEY', 'ECHOLOG_GRANT_SECRET', 'ECHOLOG_MINIO_ROOT_PASSWORD']) {
    const value = new RegExp(`^${key}=(.*)$`, 'm').exec(text)?.[1] ?? null
    assert.ok(value !== null, `${key} must be documented`)
    assert.ok(value === '' || value === 'change-me', `${key} must stay a placeholder, found "${value}"`)
  }
})

test('a local .env (when present) uses only known keys', () => {
  const keys = keysOf('.env')
  if (!keys) return // CI and container builds have no .env — that is the point
  const unknown = keys.filter((key) => !ALLOWED.has(key))
  assert.deepEqual(unknown, [], `unknown keys in .env: ${unknown.join(', ')}`)
})

test('the dev scripts agree with the shared port contract', () => {
  // scripts/*.mjs are plain JS: they cannot import core before it is built, so
  // they keep literals. This test is what keeps those literals honest.
  const root = join(process.cwd(), '..', '..')
  for (const file of ['scripts/dev.mjs', 'scripts/free-ports.mjs']) {
    const text = readFileSync(join(root, file), 'utf8')
    for (const port of Object.values(PORTS)) {
      assert.ok(text.includes(String(port)), `${file} no longer mentions port ${port}`)
    }
  }
})

test('SKYLINK has a shared client URL and is blocked as an egress destination', () => {
  assert.equal(PORTS.skylink, 3005)
  assert.equal(SKYLINK_URL_DEFAULT, `http://127.0.0.1:${PORTS.skylink}`)
  assert.throws(() => assertPublicHttpUrl('http://skylink:3005/health'), /refused private target/)
})

test('ECHOLOG has a dedicated shared port and cannot inherit the hub PORT', () => {
  assert.equal(PORTS.echolog, 3006)
  assert.equal(ECHOLOG_URL_DEFAULT, `http://127.0.0.1:${PORTS.echolog}`)
  assert.throws(() => assertPublicHttpUrl('http://echolog:3006/health'), /refused private target/)

  const runner = readFileSync(join(process.cwd(), '..', '..', 'scripts/dev.mjs'), 'utf8')
  assert.match(runner, /tag: 'echolog',[\s\S]*?port: 3006,[\s\S]*?env: \{ ECHOLOG_PORT: '3006' \}/)
  assert.match(runner, /if \(app\.tag === 'echolog'\) delete childEnv\.PORT/)
})

test('root build and test scripts include ECHOLOG while build:libs remains derived', () => {
  const root = join(process.cwd(), '..', '..')
  const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
    scripts: Record<string, string>
  }
  assert.match(manifest.scripts.build ?? '', /@moonwitness\/echolog build/)
  assert.match(manifest.scripts.test ?? '', /@moonwitness\/echolog test/)
  assert.equal(manifest.scripts['build:libs'], 'pnpm --filter "./packages/**" build')
})
