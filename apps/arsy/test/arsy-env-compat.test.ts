import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { API_PREFIX, HUB_API_DEFAULT, PORTS, SITE_NAME } from '@moonwitness/core'
import { apiBaseUrl } from '@moonwitness/moonql-client'
import { ARSY_ENV_KEYS, RADIO_ENV_KEYS, parseConfig } from '../src/config.js'

/**
 * M28-05 — the legacy-alias compatibility contract, end to end.
 *
 * The rename moved the hub's identity to ARSY, but the environment a witness
 * already has on disk keeps saying `RADIO_*`. Two rules make that safe, and both
 * are easy to break by accident, so every cell is asserted here rather than
 * trusted:
 *
 *   1. deterministic acceptance — one spelling alone is used, and equal spellings
 *      agree; the canonical `ARSY_*` name never silently changes a working value;
 *   2. fail-closed on conflict — two spellings that disagree are refused with a
 *      message naming them, because picking one would send the hub (or a BFF) to
 *      an address its owner did not write.
 *
 * The rule lives in three places that must say the same thing: the hub parser,
 * the shared client resolver both frontends use, and the dev runner's port
 * pre-flight. The scripts are plain JS and run before the workspace is built, so
 * the runner is exercised in a child `node` process instead of imported here.
 */

const ROOT = fileURLToPath(new URL('../../..', import.meta.url))
const readRepoText = (rel: string): string =>
  readFileSync(join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n')

/** Read the hub's resolved server settings for one environment snapshot. */
const hubView = (env: Record<string, string>) => {
  const config = parseConfig(env)
  return { port: config.port, prefix: config.api.prefix, title: config.api.title }
}

/** A matrix cell that must resolve to concrete values, not throw. */
const accepts = (label: string, env: Record<string, string>, expected: Record<string, unknown>) => {
  const resolved = parseConfig(env)
  for (const [path, value] of Object.entries(expected)) {
    const actual = path === 'port' ? resolved.port : path === 'prefix' ? resolved.api.prefix : resolved.api.title
    assert.equal(actual, value, `${label}: ${path} should resolve to ${String(value)}`)
  }
}

/** A matrix cell that must refuse to boot, naming every spelling it was given. */
const rejects = (label: string, env: Record<string, string>, preferredName: string, namedKeys: string[]) => {
  assert.throws(
    () => parseConfig(env),
    (error: Error) => {
      assert.match(error.message, new RegExp(`Conflicting environment aliases for ${preferredName}`), label)
      for (const key of namedKeys) assert.ok(error.message.includes(key), `${label}: error must name ${key}`)
      return true
    },
    `${label} must fail closed`,
  )
}

void test('hub aliases: one documented spelling on its own is accepted, in precedence order', () => {
  // no env at all -> the shared defaults, unchanged by the rename
  assert.deepEqual(hubView({}), {
    port: PORTS.hub,
    prefix: API_PREFIX,
    title: `${SITE_NAME} Hub API`,
  })

  // canonical only
  accepts('ARSY_PORT alone', { ARSY_PORT: '3100' }, { port: 3100 })
  accepts('ARSY_PREFIX alone', { ARSY_PREFIX: '/api/arsy' }, { prefix: '/api/arsy' })
  accepts('ARSY_TITLE alone', { ARSY_TITLE: 'ARSY Hub' }, { title: 'ARSY Hub' })

  // legacy only: the whole point of the compatibility window
  accepts('RADIO_PORT alone', { RADIO_PORT: '3100' }, { port: 3100 })
  accepts('RADIO_PREFIX alone', { RADIO_PREFIX: '/api/radio' }, { prefix: '/api/radio' })
  accepts('RADIO_TITLE alone', { RADIO_TITLE: 'Radio Hub' }, { title: 'Radio Hub' })

  // generic only: still a shared default, not a deprecated name
  accepts('PORT alone', { PORT: '3100' }, { port: 3100 })
  accepts('API_PREFIX alone', { API_PREFIX: '/api/generic' }, { prefix: '/api/generic' })
  accepts('API_TITLE alone', { API_TITLE: 'Generic Hub' }, { title: 'Generic Hub' })
})

void test('hub aliases: equal spellings agree, so a migration can set both at once', () => {
  const env = {
    ARSY_PORT: '3100',
    RADIO_PORT: '3100',
    PORT: '3100',
    ARSY_PREFIX: '/api/v1',
    RADIO_PREFIX: '/api/v1',
    API_PREFIX: '/api/v1',
    ARSY_TITLE: 'ARSY Hub',
    RADIO_TITLE: 'ARSY Hub',
    API_TITLE: 'ARSY Hub',
  }
  assert.deepEqual(hubView(env), { port: 3100, prefix: '/api/v1', title: 'ARSY Hub' })

  // canonical + legacy, without the generic name
  accepts('ARSY_PORT == RADIO_PORT', { ARSY_PORT: '3200', RADIO_PORT: '3200' }, { port: 3200 })
  accepts('ARSY_PREFIX == RADIO_PREFIX', { ARSY_PREFIX: '/a', RADIO_PREFIX: '/a' }, { prefix: '/a' })
  accepts('ARSY_TITLE == RADIO_TITLE', { ARSY_TITLE: 'T', RADIO_TITLE: 'T' }, { title: 'T' })
})

void test('hub aliases: an empty value means "not set", never a competing value', () => {
  accepts('empty canonical + legacy', { ARSY_PORT: '', RADIO_PORT: '3100' }, { port: 3100 })
  accepts('legacy blanked out', { ARSY_PREFIX: '/api/arsy', RADIO_PREFIX: '' }, { prefix: '/api/arsy' })
  assert.equal(parseConfig({ PORT: '', ARSY_TITLE: '', RADIO_TITLE: '', API_TITLE: '' }).port, PORTS.hub)
})

void test('hub aliases: each legacy spelling resolves identically to its ARSY_* name', () => {
  // Same value, one spelling at a time: the legacy key must be an alias, not a
  // differently-defaulted setting that merely happens to look similar.
  const pairs = [
    ['ARSY_PORT', 'RADIO_PORT', '3300'],
    ['ARSY_PREFIX', 'RADIO_PREFIX', '/api/parity'],
    ['ARSY_TITLE', 'RADIO_TITLE', 'Parity Hub'],
  ] as const
  for (const [preferred, legacy, value] of pairs) {
    assert.deepEqual(
      hubView({ [preferred]: value }),
      hubView({ [legacy]: value }),
      `${legacy} must resolve exactly like ${preferred}`,
    )
  }
})

/** Every spelling the hub config honours for the three aliased settings. */
const HUB_ENV_SPELLINGS = [
  'ARSY_PORT', 'RADIO_PORT', 'PORT',
  'ARSY_PREFIX', 'RADIO_PREFIX', 'API_PREFIX',
  'ARSY_TITLE', 'RADIO_TITLE', 'API_TITLE',
  'DATABASE_URL',
] as const

interface BootOutcome {
  status: number
  stdout: string
  stderr: string
}

/**
 * Run the real boot-time loader (`loadConfig()` reads process.env) in a child
 * process, so "boots" means the process exits 0 with resolved settings — not
 * merely that `parseConfig` accepts an object literal in the test's own env.
 */
function bootConfig(env: Record<string, string>): BootOutcome {
  const childEnv: Record<string, string | undefined> = { ...process.env, NODE_ENV: 'test' }
  for (const key of HUB_ENV_SPELLINGS) delete childEnv[key]
  Object.assign(childEnv, env)

  const script = `const { loadConfig } = await import('./src/config.ts')
try {
  const { port, api } = loadConfig()
  process.stdout.write(JSON.stringify({ port, prefix: api.prefix, title: api.title }))
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}`
  try {
    const stdout = execFileSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', script], {
      cwd: join(ROOT, 'apps', 'arsy'),
      env: childEnv,
      encoding: 'utf8',
    })
    return { status: 0, stdout, stderr: '' }
  } catch (error) {
    const failure = error as { status?: number; stdout?: string; stderr?: string }
    return {
      status: failure.status ?? -1,
      stdout: failure.stdout ?? '',
      stderr: failure.stderr ?? '',
    }
  }
}

void test('hub aliases: a single-spelling environment boots and resolves like its counterpart', () => {
  const settings = { ARSY_PORT: '3111', ARSY_PREFIX: '/api/arsy', ARSY_TITLE: 'ARSY Hub' }
  const legacySettings = { RADIO_PORT: '3111', RADIO_PREFIX: '/api/arsy', RADIO_TITLE: 'ARSY Hub' }
  const expected = { port: 3111, prefix: '/api/arsy', title: 'ARSY Hub' }

  const canonical = bootConfig(settings)
  assert.equal(canonical.status, 0, `ARSY_* only must boot, stderr: ${canonical.stderr}`)
  assert.deepEqual(JSON.parse(canonical.stdout), expected)

  const legacy = bootConfig(legacySettings)
  assert.equal(legacy.status, 0, `RADIO_* only must boot during the window, stderr: ${legacy.stderr}`)
  assert.deepEqual(JSON.parse(legacy.stdout), expected, 'the legacy-only process must boot to the same settings')
})

void test('hub aliases: a conflicting environment refuses to boot, names the keys and leaks no values', () => {
  const outcome = bootConfig({
    ARSY_PORT: '3100',
    RADIO_PORT: '3200',
    // Present so a lazy "dump the environment" error would have something to leak.
    DATABASE_URL: 'postgres://witness:top-secret@db:5432/witness',
  })

  assert.equal(outcome.status, 1, 'a conflicting environment must exit non-zero instead of booting')
  assert.equal(outcome.stdout, '', 'no server output may be produced before the refusal')
  assert.match(outcome.stderr, /Conflicting environment aliases for ARSY_PORT/)
  for (const key of ['ARSY_PORT', 'RADIO_PORT']) {
    assert.ok(outcome.stderr.includes(key), `refusal must name ${key}`)
  }
  assert.match(outcome.stderr, /Set only one spelling/)
  assert.doesNotMatch(outcome.stderr, /top-secret/, 'the refusal must not print unrelated secret values')
})

void test('hub aliases: conflicting values are rejected and every spelling is named', () => {
  rejects('port: canonical vs legacy', { ARSY_PORT: '3100', RADIO_PORT: '3200' }, 'ARSY_PORT', [
    'ARSY_PORT', 'RADIO_PORT',
  ])
  rejects('port: canonical vs generic', { ARSY_PORT: '3100', PORT: '3200' }, 'ARSY_PORT', ['ARSY_PORT', 'PORT'])
  rejects('port: legacy vs generic', { RADIO_PORT: '3100', PORT: '3200' }, 'ARSY_PORT', ['RADIO_PORT', 'PORT'])
  rejects('prefix: canonical vs legacy', { ARSY_PREFIX: '/a', RADIO_PREFIX: '/b' }, 'ARSY_PREFIX', [
    'ARSY_PREFIX', 'RADIO_PREFIX',
  ])
  rejects('prefix: legacy vs generic', { RADIO_PREFIX: '/a', API_PREFIX: '/b' }, 'ARSY_PREFIX', [
    'RADIO_PREFIX', 'API_PREFIX',
  ])
  rejects('title: canonical vs legacy', { ARSY_TITLE: 'A', RADIO_TITLE: 'B' }, 'ARSY_TITLE', [
    'ARSY_TITLE', 'RADIO_TITLE',
  ])
  rejects('title: legacy vs generic', { RADIO_TITLE: 'A', API_TITLE: 'B' }, 'ARSY_TITLE', [
    'RADIO_TITLE', 'API_TITLE',
  ])
})

void test('hub URL aliases: the shared client resolver applies one rule for every consumer', () => {
  // this is what Dock, Headquarters and Sentinel call; the name they export
  // locally is history, the resolution is the contract
  assert.equal(apiBaseUrl({}), HUB_API_DEFAULT)
  assert.equal(apiBaseUrl({ RADIO_API_URL: 'http://radio:3000/api/v1' }), 'http://radio:3000/api/v1')
  assert.equal(apiBaseUrl({ ARSY_API_URL: 'http://arsy:3000/api/v1' }), 'http://arsy:3000/api/v1')
  assert.equal(
    apiBaseUrl({ ARSY_API_URL: 'http://arsy:3000/api/v1', RADIO_API_URL: 'http://arsy:3000/api/v1' }),
    'http://arsy:3000/api/v1',
  )
  assert.throws(
    () => apiBaseUrl({ ARSY_API_URL: 'http://arsy:3000/api/v1', RADIO_API_URL: 'http://radio:3000/api/v1' }),
    /Conflicting Hub URL settings: ARSY_API_URL and RADIO_API_URL must have the same value\./,
  )
})

interface RunnerOutcome {
  ok: boolean
  value: number | null
  error: string | null
}

/** scripts/*.mjs cannot be imported into this project (plain JS, built-first), so node runs it. */
function hubPortFromRunner(env: Record<string, string>): RunnerOutcome {
  const helper = pathToFileURL(join(ROOT, 'scripts', 'port-utils.mjs')).href
  const script = `const { resolveHubPort } = await import(${JSON.stringify(helper)})
try {
  process.stdout.write(JSON.stringify({ ok: true, value: resolveHubPort(${JSON.stringify(env)}, 3000), error: null }))
} catch (error) {
  process.stdout.write(JSON.stringify({ ok: false, value: null, error: String(error.message) }))
}`
  const out = execFileSync(process.execPath, ['--input-type=module', '-e', script], { encoding: 'utf8' })
  return JSON.parse(out) as RunnerOutcome
}

void test('dev runner dials the same port the hub will bind', () => {
  const hubPort = (env: Record<string, string>): number | null => {
    const result = hubPortFromRunner(env)
    assert.equal(result.ok, true, `runner must accept ${JSON.stringify(env)}, got: ${String(result.error)}`)
    return result.value
  }

  assert.equal(hubPort({}), PORTS.hub)
  assert.equal(hubPort({ RADIO_PORT: '3100' }), 3100, 'legacy alias alone still works')
  assert.equal(hubPort({ ARSY_PORT: '3100' }), 3100, 'canonical name alone must work')
  assert.equal(hubPort({ PORT: '3100' }), 3100)
  assert.equal(hubPort({ ARSY_PORT: '3100', RADIO_PORT: '3100' }), 3100)
  assert.equal(hubPort({ ARSY_PORT: '', RADIO_PORT: '3100' }), 3100, 'empty means not set')

  // the runner and the hub must refuse the same environments
  const conflicting = hubPortFromRunner({ ARSY_PORT: '3100', RADIO_PORT: '3200' })
  assert.equal(conflicting.ok, false)
  assert.match(String(conflicting.error), /Conflicting environment aliases for ARSY_PORT/)
  assert.ok(String(conflicting.error).includes('RADIO_PORT'), 'conflict message must name the legacy spelling')
  assert.throws(() => parseConfig({ ARSY_PORT: '3100', RADIO_PORT: '3200' }), /Conflicting environment aliases/)

  const invalid = hubPortFromRunner({ ARSY_PORT: 'not-a-port' })
  assert.equal(invalid.ok, false)
  assert.match(String(invalid.error), /Invalid hub port in ARSY_PORT/)
})

void test('the Radio compatibility window stays documented and the domain names stay intact', () => {
  const example = readRepoText('.env.example')

  // the legacy spellings are still read by the hub, so an existing .env keeps working
  assert.equal(RADIO_ENV_KEYS, ARSY_ENV_KEYS, 'the legacy export is an alias, never a diverging key list')
  for (const key of ['RADIO_PORT', 'RADIO_PREFIX', 'RADIO_TITLE', 'ARSY_PORT', 'ARSY_PREFIX', 'ARSY_TITLE']) {
    assert.ok(ARSY_ENV_KEYS.includes(key), `${key} must stay in the hub schema (aliases are not removed)`)
  }

  // the template spells out the rule instead of leaving it to folklore
  assert.match(example, /ARSY_PORT \/ ARSY_PREFIX \/ ARSY_TITLE are preferred/, '.env.example must name the preferred keys')
  assert.match(example, /values must match/, '.env.example must document the conflict rule')
  assert.match(example, /ARSY_API_URL is preferred; RADIO_API_URL remains a compatible alias/)
  assert.match(example, /^ARSY_API_URL=/m, 'the template must ship the preferred URL spelling')
  assert.match(example, /^# RADIO_API_URL=/m, 'the legacy URL name stays documented for existing .env files')
  assert.doesNotMatch(example, /^RADIO_API_URL=/m, 'the legacy URL name is an alias, not the template default')

  // RADIO_* are deliberate override aliases, so they are not required as active lines
  const envContract = readRepoText('apps/arsy/test/env-contract.test.ts')
  assert.match(envContract, /'ARSY_PORT', 'RADIO_PORT', 'ARSY_PREFIX', 'RADIO_PREFIX'/)

  // Hub identity is ARSY; the Radio domain name survives only as a DNS alias to it
  const compose = readRepoText('docker-compose.yml')
  assert.doesNotMatch(compose, /^ {2}radio:$/m, 'a second radio service must not come back')
  assert.match(compose, /^ {2}arsy:$/m, 'the hub service is named arsy')
  assert.match(compose, /aliases:[\s\S]*?\n {10}- radio\b/, 'the radio DNS name still resolves to the one hub')

  // frontends dial through the shared resolver, so both spellings work there too
  assert.match(readRepoText('apps/dock/src/lib/env.ts'), /apiBaseUrl\(process\.env\)/)
  assert.match(readRepoText('apps/headquarters/src/lib/env.ts'), /apiBaseUrl\(process\.env\)/)
  assert.match(readRepoText('apps/sentinel/src/index.ts'), /apiBaseUrl\(env\)/)

  // the dev runner keeps `radio` only as a transition alias for the ARSY hub;
  // the alias table lives in the shared registry the runner imports
  const runner = readRepoText('scripts/dev.mjs')
  const registry = readRepoText('scripts/apps.registry.mjs')
  assert.match(registry, /export const ALIASES = \{ radio: 'arsy' \}/, 'radio must remain a transition alias only')
  assert.match(runner, /ALIASES\[tag\] \?\? tag/, 'the runner must resolve tags through the shared alias table')
  assert.match(runner, /resolveHubPort\(process\.env,/, 'the runner must not re-implement port precedence')
})
