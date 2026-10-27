/**
 * M05-16 — Sentinel worker log-consumer contract.
 *
 * Sentinel ships no GUI and no interactive/`--help` CLI surface; its only output is
 * the worker process log. This suite is the bounded contract that audit
 * `docs/audit/M05-16-sentinel-locale-classification-b1c5b75.md` requires before the
 * classification can close: it pins the exact machine-parseable lines and levels a
 * log consumer may rely on, and proves those strings never travel through the shared
 * `id`/`en` locale catalog (the M05-10 mechanism) even when an operator locale is set.
 *
 * Evidence style: the real worker entrypoint is spawned as a child process against a
 * loopback stub hub, so the assertions read the bytes a log consumer actually sees.
 * No `.env` file is loaded and no external network is used; every hub response is the
 * deterministic fixture below. Child workers are always terminated in `finally`.
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { spawn, type ChildProcessByStdio } from 'node:child_process'
import type { Readable } from 'node:stream'
import http from 'node:http'
import process from 'node:process'
import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const sentinelRoot = fileURLToPath(new URL('..', import.meta.url))
const sentinelSrc = path.join(sentinelRoot, 'src')
const workerEntry = path.join('src', 'index.ts')

/**
 * CONTRACT (machine-consumer-only). A log consumer may rely on these exact line shapes
 * and on their stream/level routing: the four `info` shapes go to stdout, the single
 * `warn` shape goes to stderr. Nothing here is UI copy and nothing here may be localized.
 */
const CONTRACT = {
  banner: (workerId: string, hubUrl: string, drivers: string, egress: boolean): string =>
    `[sentinel] worker=${workerId} hub=${hubUrl} drivers=${drivers} egress=${egress}`,
  authOk: '[sentinel] successfully authenticated with hub as admin',
  collected: (sourceHandle: string, driver: string, signals: number): string =>
    `[sentinel] collected source=${sourceHandle} driver=${driver} signals=${signals}`,
  oncePrefix: '[sentinel] single cycle completed: ',
  cycleNoticePrefix: '[sentinel] cycle notice (hub starting or idle): ',
} as const

/** Every stdout line the worker may produce, in its pinned machine shape. */
const PINNED_INFO_SHAPES: readonly RegExp[] = [
  /^\[sentinel\] worker=\S+ hub=\S+ drivers=\S+ egress=(?:true|false)$/,
  /^\[sentinel\] successfully authenticated with hub as admin$/,
  /^\[sentinel\] collected source=\S+ driver=\S+ signals=\d+$/,
  /^\[sentinel\] single cycle completed: \{/,
]

/** Every stderr line the worker may produce: the cycle notice plus its raw tail. */
const PINNED_WARN_SHAPES: readonly RegExp[] = [/^\[sentinel\] cycle notice \(hub starting or idle\): .*/]

const WORKER_ID = 'sentinel-contract'
const SOURCE_HANDLE = 'contract-handle'
const TASK_ID = 'task-1'
const HUB_REJECTION = 'stub hub rejected the claim'
/** The pinned `--once` cycle record, modulo the inspector's line wrapping. */
const ONCE_RESULT = `{ claimed: true, taskId: '${TASK_ID}', driver: 'rss', sourceHandle: '${SOURCE_HANDLE}', ingested: 1 }`

const expectedBanner = (hubUrl: string): string => CONTRACT.banner(WORKER_ID, hubUrl, 'rss', false)

interface StubHub {
  /** Bound after `listen()`, so the loopback port is only known at that point. */
  baseUrl: string
  readonly requests: string[]
  claimsAvailable: boolean
  failClaims: boolean
  loginToken: string | null
  close(): Promise<void>
}

/** Deterministic stand-in for the MoonQL Hub monitor claim/ingest/auth endpoints. */
async function startStubHub(): Promise<StubHub> {
  const hub: StubHub = {
    baseUrl: '',
    requests: [],
    claimsAvailable: true,
    failClaims: false,
    loginToken: null,
    close: async () => undefined,
  }

  const server = http.createServer((req, res) => {
    const url = req.url ?? ''
    hub.requests.push(`${req.method} ${url}`)
    const json = (status: number, body: unknown): void => {
      res.writeHead(status, { 'content-type': 'application/json' })
      res.end(JSON.stringify(body))
    }

    if (url === '/api/v1/auth/login' && req.method === 'POST') {
      req.on('data', () => undefined)
      req.on('end', () => {
        if (hub.loginToken === null) {
          json(401, { ok: false, error: { statusCode: 401, message: 'no credentials' } })
          return
        }
        json(200, { ok: true, data: { token: hub.loginToken } })
      })
      return
    }

    if (url === '/api/v1/monitor/claim' && req.method === 'POST') {
      req.on('data', () => undefined)
      req.on('end', () => {
        if (hub.failClaims) {
          json(500, { ok: false, error: { statusCode: 500, message: HUB_REJECTION } })
          return
        }
        if (!hub.claimsAvailable) {
          json(200, { ok: true, data: { claimed: false, task: null, source: null, radar: null } })
          return
        }
        json(200, {
          ok: true,
          data: {
            claimed: true,
            task: { id: TASK_ID, driver: 'rss', status: 'claimed' },
            source: {
              id: 'source-1',
              handle: SOURCE_HANDLE,
              name: 'Contract Handle',
              platform: 'youtube',
              kind: 'channel',
              driver: 'rss',
              targetUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=contract',
              externalTarget: 'UCcontract',
            },
            radar: { id: 'radar-1', code: 'contract', name: 'Contract Radar', category: 'test', priority: 'normal' },
          },
        })
      })
      return
    }

    if (url === '/api/v1/monitor/ingest' && req.method === 'POST') {
      req.on('data', () => undefined)
      req.on('end', () => json(201, { ok: true, data: { ingested: true } }))
      return
    }

    json(404, { ok: false, error: { statusCode: 404, message: 'unknown stub route' } })
  })

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => resolve())
  })
  const address = server.address()
  if (address === null || typeof address === 'string') throw new Error('stub hub did not bind a TCP port')
  hub.baseUrl = `http://127.0.0.1:${address.port}/api/v1`
  hub.close = async (): Promise<void> => {
    await new Promise<void>((resolve) => {
      server.closeAllConnections()
      server.close(() => resolve())
    })
  }
  return hub
}

interface WorkerRun {
  readonly child: ChildProcessByStdio<null, Readable, Readable>
  stdout(): string
  stderr(): string
  infoLines(): string[]
  warnLines(): string[]
  waitUntil(predicate: (run: WorkerRun) => boolean, describe: string, timeoutMs?: number): Promise<void>
  stop(): Promise<void>
}

/** The contract owns its hub URL; inherited local hub/env values would conflict. */
function workerEnv(hubUrl: string, extra: Record<string, string | undefined> = {}): NodeJS.ProcessEnv {
  const base: NodeJS.ProcessEnv = { ...process.env }
  for (const key of [
    'RADIO_API_URL',
    'ARSY_API_URL',
    'SENTINEL_API_KEY',
    'SENTINEL_BEARER_TOKEN',
    'MOONQL_AUTH_ADMIN_LOGIN',
    'MOONQL_AUTH_ADMIN_USER',
    'MOONQL_AUTH_ADMIN_PASSWORD',
    'EGRESS_ENABLED',
    'MW_LOCALE',
  ]) {
    delete base[key]
  }
  return {
    ...base,
    ARSY_API_URL: hubUrl,
    SENTINEL_WORKER_ID: WORKER_ID,
    SENTINEL_DRIVERS: 'rss',
    SENTINEL_POLL_MS: '2000',
    ...extra,
  }
}

/** Spawn the real worker with an explicit environment (never a `.env` file). */
function startWorker(hubUrl: string, options: { once?: boolean; env?: Record<string, string | undefined> } = {}): WorkerRun {
  const args = ['--import', 'tsx', workerEntry, ...(options.once ? ['--once'] : [])]
  const child = spawn(process.execPath, args, {
    cwd: sentinelRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: workerEnv(hubUrl, options.env),
  })

  child.stdout.setEncoding('utf8')
  child.stderr.setEncoding('utf8')
  let out = ''
  let err = ''
  let failure: Error | null = null
  child.stdout.on('data', (chunk: string) => {
    out += chunk
  })
  child.stderr.on('data', (chunk: string) => {
    err += chunk
  })
  child.on('error', (error: Error) => {
    failure = error
  })

  const run: WorkerRun = {
    child,
    stdout: () => out,
    stderr: () => err,
    infoLines: () => out.split(/\r?\n/).filter((line) => line.length > 0),
    warnLines: () => err.split(/\r?\n/).filter((line) => line.length > 0),
    waitUntil: async (predicate, describe, timeoutMs = 30_000) => {
      const deadline = Date.now() + timeoutMs
      for (;;) {
        if (failure !== null) throw failure
        if (predicate(run)) return
        if (child.exitCode !== null) throw new Error(`worker exited (${child.exitCode}) before ${describe}\nstdout:\n${out}\nstderr:\n${err}`)
        if (Date.now() > deadline) throw new Error(`timed out waiting for ${describe}\nstdout:\n${out}\nstderr:\n${err}`)
        await new Promise((resolve) => setTimeout(resolve, 25))
      }
    },
    stop: async () => {
      if (child.exitCode === null) child.kill('SIGTERM')
      await new Promise<void>((resolve) => {
        const done = (): void => {
          clearTimeout(timer)
          resolve()
        }
        const timer = setTimeout(done, 5_000)
        if (child.exitCode !== null || child.signalCode !== null) return done()
        child.once('close', done)
      })
    },
  }
  return run
}

const TOKEN_ENV = { SENTINEL_BEARER_TOKEN: 'contract-test-token' }

void test('contract line 1: startup banner is an exact `key=value` machine record on stdout (info)', async () => {
  const hub = await startStubHub()
  const worker = startWorker(hub.baseUrl, { env: TOKEN_ENV })
  try {
    await worker.waitUntil((run) => run.infoLines().some((line) => line.startsWith('[sentinel] worker=')), 'the startup banner')
    assert.equal(worker.infoLines()[0], expectedBanner(hub.baseUrl))

    const collected = CONTRACT.collected(SOURCE_HANDLE, 'rss', 1)
    await worker.waitUntil((run) => run.infoLines().includes(collected), 'the collected-cycle line')
    assert.ok(!worker.stderr().includes('cycle notice'), 'a successful cycle must not emit a warn line')
    assert.ok(hub.requests.some((entry) => entry === 'POST /api/v1/monitor/claim'), 'the claim path is part of the contract')
  } finally {
    await worker.stop()
    await hub.close()
  }
})

void test('contract line 2: `--once` serializes the worker-cycle result as machine data, not prose', async () => {
  const hub = await startStubHub()
  const worker = startWorker(hub.baseUrl, { once: true, env: TOKEN_ENV })
  try {
    await worker.waitUntil((run) => run.stdout().includes(CONTRACT.oncePrefix), 'the single-cycle summary')
    const serialized = worker
      .stdout()
      .slice(worker.stdout().indexOf(CONTRACT.oncePrefix) + CONTRACT.oncePrefix.length)
      .replace(/\s+/g, ' ')
      .trim()
    assert.equal(serialized, ONCE_RESULT)
    await worker.waitUntil(() => worker.child.exitCode !== null, 'the worker to exit after one cycle')
  } finally {
    await worker.stop()
    await hub.close()
  }
})

void test('contract line 3: the hub-auth notice is a fixed string even under an `id` operator locale', async () => {
  const hub = await startStubHub()
  hub.loginToken = 'contract-issue-token'
  // No bearer token and no API key: the worker takes its automated-login path.
  const worker = startWorker(hub.baseUrl, { env: { MW_LOCALE: 'id' } })
  try {
    await worker.waitUntil((run) => run.infoLines().includes(CONTRACT.authOk), 'the authentication notice')
    assert.equal(worker.infoLines()[0], expectedBanner(hub.baseUrl))
    assert.ok(hub.requests.includes('POST /api/v1/auth/login'), 'the login path is exercised by the contract')
    assert.ok(!worker.stdout().includes('berhasil'), 'the info notice stays English under MW_LOCALE=id')
  } finally {
    await worker.stop()
    await hub.close()
  }
})

void test('contract line 4: the cycle notice keeps the raw hub error text verbatim on stderr (warn)', async () => {
  const hub = await startStubHub()
  hub.failClaims = true
  const worker = startWorker(hub.baseUrl, { env: { ...TOKEN_ENV, MW_LOCALE: 'id' } })
  try {
    const notice = `${CONTRACT.cycleNoticePrefix}${HUB_REJECTION}`
    await worker.waitUntil((run) => run.warnLines().includes(notice), 'the cycle notice carrying the hub message verbatim')
    assert.ok(!worker.stdout().includes('cycle notice'), 'the warn level must not be routed to stdout')
    assert.ok(!worker.stderr().includes(CONTRACT.collected(SOURCE_HANDLE, 'rss', 1)), 'a failed cycle must not emit the info result line')
  } finally {
    await worker.stop()
    await hub.close()
  }
})

void test('contract line 5: the worker emits only the pinned `[sentinel]` shapes, in the pinned levels', async () => {
  const hub = await startStubHub()
  const worker = startWorker(hub.baseUrl, { env: TOKEN_ENV })
  try {
    await worker.waitUntil((run) => run.infoLines().includes(CONTRACT.collected(SOURCE_HANDLE, 'rss', 1)), 'two cycles of output')
    await worker.waitUntil((run) => run.infoLines().filter((line) => line.startsWith('[sentinel] collected')).length >= 2, 'a second cycle')
    const unpinnedInfo = worker.infoLines().filter((line) => !PINNED_INFO_SHAPES.some((shape) => shape.test(line)))
    const unpinnedWarn = worker.warnLines().filter((line) => !PINNED_WARN_SHAPES.some((shape) => shape.test(line)))
    assert.deepEqual(unpinnedInfo, [], 'stdout may carry only the four pinned info shapes')
    assert.deepEqual(unpinnedWarn, [], 'stderr may carry only the pinned warn shape')
  } finally {
    await worker.stop()
    await hub.close()
  }
})

void test('no drift: the worker log bytes are identical under `MW_LOCALE=id` and `MW_LOCALE=en`', async () => {
  const hub = await startStubHub()
  const runOnce = async (locale: string): Promise<string> => {
    const worker = startWorker(hub.baseUrl, { once: true, env: { ...TOKEN_ENV, MW_LOCALE: locale, LANG: `${locale}_ID.UTF-8` } })
    try {
      await worker.waitUntil(() => worker.child.exitCode !== null, `the ${locale} worker to finish`)
      return `${worker.stdout()}||${worker.stderr()}`
    } finally {
      await worker.stop()
    }
  }
  try {
    const english = await runOnce('en')
    const indonesian = await runOnce('id')
    assert.ok(english.includes(expectedBanner(hub.baseUrl)))
    assert.equal(indonesian, english, 'localizing the worker log would break the machine contract')
  } finally {
    await hub.close()
  }
})

void test('negative: worker log strings are literal source text, never locale-catalog lookups', async () => {
  const files = (await readdir(sentinelSrc, { recursive: true })).filter((name) => name.endsWith('.ts'))
  assert.ok(files.length > 0, 'expected Sentinel TypeScript sources to scan')
  // Sentinel owns no catalog/locale module at all.
  assert.deepEqual(files.filter((name) => /locale|i18n|catalog|translation/i.test(name)), [])

  const localeSurface = [
    'getLocaleMessage',
    'defineLocaleCatalog',
    'assertRequiredLocaleKeys',
    'SUPPORTED_LOCALES',
    'DEFAULT_LOCALE',
    'requireLocale',
    'isLocale',
    'preferredLocale',
    'resolveLocale',
    'negotiateLocale',
    'MW_LOCALE',
    'Accept-Language',
  ] as const

  for (const name of files) {
    const source = await readFile(path.join(sentinelSrc, name), 'utf8')
    const offenders = localeSurface.filter((symbol) => source.includes(symbol))
    assert.deepEqual(offenders, [], `${name} must not route any output through the shared locale catalog`)
  }

  const workerSource = await readFile(path.join(sentinelSrc, 'index.ts'), 'utf8')
  const coreImport = /import\s*\{([^}]*)\}\s*from\s*'@moonwitness\/core'/.exec(workerSource)
  assert.notEqual(coreImport, null, 'the worker still imports its shared API-prefix contract')
  assert.deepEqual(
    (coreImport?.[1] ?? '')
      .split(',')
      .map((specimen) => specimen.trim())
      .filter((specimen) => specimen.length > 0),
    ['API_PREFIX'],
    'the worker may import machine contracts from core, never locale helpers',
  )
})
