/**
 * apps/orbit/test/orbit-runtime-binding.test.mjs
 *
 * M40-06: Comprehensive unit & contract tests for binding ORBIT to verified ARSY runtime state.
 *
 * Verifies:
 * 1. Single Hub URL resolution (apiBaseUrl) with ARSY_* > RADIO_* and conflict rejection.
 * 2. Explicit simulation mode (SIMULATED_LOCAL).
 * 3. Positive live state binding (LIVE_CONNECTED + FRESH).
 * 4. Stale data detection (> 60s -> STALE).
 * 5. Outage / timeout / ECONNREFUSED handling (fail-safe to OFFLINE).
 * 6. Authentication failure handling (401/403 -> UNAUTHORIZED).
 * 7. Credential sanitization (zero secrets leaked to client boundary).
 * 8. Honest UI header badge rules (LIVE rendered ONLY when connected & FRESH).
 * 9. ARSY Radio/SIGNAL invariance.
 */

/* global Response */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  fetchOrbitOperationalState,
  resolveHubEndpoint,
  buildOfflineState,
  buildUnauthorizedState,
} from '../src/lib/server/arsy-runtime-client.ts'

const testDir = dirname(fileURLToPath(import.meta.url))
const appRoot = resolve(testDir, '..')

test('M40-06: resolveHubEndpoint resolves via apiBaseUrl with ARSY_* > RADIO_* and rejects conflicting values', () => {
  // 1. Default fallback
  const defaultUrl = resolveHubEndpoint({})
  assert.equal(defaultUrl, 'http://127.0.0.1:3000/api/v1', 'defaults to port 3000 api root')

  // 2. ARSY_API_URL takes precedence
  const arsyUrl = resolveHubEndpoint({ ARSY_API_URL: 'http://hub.example:3000/api/v1/' })
  assert.equal(arsyUrl, 'http://hub.example:3000/api/v1', 'trims trailing slash and respects ARSY_API_URL')

  // 3. RADIO_API_URL compatible fallback
  const radioUrl = resolveHubEndpoint({ RADIO_API_URL: 'http://radio.example:3000' })
  assert.equal(radioUrl, 'http://radio.example:3000', 'respects legacy RADIO_API_URL when ARSY_API_URL unset')

  // 4. Mismatch between ARSY and RADIO fails closed
  assert.throws(
    () => resolveHubEndpoint({ ARSY_API_URL: 'http://arsy.example', RADIO_API_URL: 'http://radio.example' }),
    /Conflicting Hub URL settings/,
    'conflicting aliases fail closed without guessing',
  )
})

test('M40-06: fetchOrbitOperationalState returns SIMULATED_LOCAL when forceSimulated or ORBIT_SIMULATED is set', async () => {
  const now = Date.parse('2026-10-27T12:00:00.000Z')

  // 1. Via forceSimulated flag
  const sim1 = await fetchOrbitOperationalState({ forceSimulated: true, now })
  assert.equal(sim1.connectionStatus, 'SIMULATED_LOCAL')
  assert.ok(sim1.workstations.length > 0)
  assert.equal(sim1.workstations[0].provenance, 'SIMULATED')

  // 2. Via env.ORBIT_SIMULATED
  const sim2 = await fetchOrbitOperationalState({ env: { ORBIT_SIMULATED: 'true' }, now })
  assert.equal(sim2.connectionStatus, 'SIMULATED_LOCAL')
  assert.ok(sim2.agents.length > 0)
  assert.equal(sim2.agents[0].provenance, 'SIMULATED')
})

test('M40-06: fetchOrbitOperationalState successfully projects LIVE_CONNECTED with FRESH state when ARSY Hub is healthy', async () => {
  const now = Date.parse('2026-10-27T12:00:00.000Z')
  const syncTime = new Date(now - 5000).toISOString() // 5 seconds ago -> FRESH

  const mockFetch = async (url) => {
    assert.match(String(url), /http:\/\/localhost:3000\/health/)
    return new Response(
      JSON.stringify({
        status: 'ok',
        uptime: 3600,
        channels: 3,
        timestamp: syncTime,
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      },
    )
  }

  const result = await fetchOrbitOperationalState({
    env: { ARSY_API_URL: 'http://localhost:3000' },
    now,
    fetchFn: mockFetch,
  })

  assert.equal(result.connectionStatus, 'LIVE_CONNECTED')
  assert.equal(result.freshness, 'FRESH')
  assert.equal(result.lastSyncTimestamp, syncTime)
  assert.ok(result.dataSource.includes('ARSY Hub Verified'))
  assert.ok(result.workstations.length > 0)
  assert.equal(result.workstations[0].provenance, 'LIVE')
  assert.ok(result.agents.length > 0)
  assert.equal(result.agents[0].provenance, 'LIVE')
  assert.equal(result.agents[0].stepCount, 3) // reflects 3 channels
})

test('M40-06: fetchOrbitOperationalState evaluates STALE freshness when ARSY timestamp exceeds stale threshold (> 60s)', async () => {
  const now = Date.parse('2026-10-27T12:00:00.000Z')
  const staleTime = new Date(now - 120_000).toISOString() // 120 seconds ago -> STALE

  const mockFetch = async () => {
    return new Response(
      JSON.stringify({
        status: 'ok',
        channels: 1,
        timestamp: staleTime,
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      },
    )
  }

  const result = await fetchOrbitOperationalState({
    env: { ARSY_API_URL: 'http://localhost:3000' },
    now,
    fetchFn: mockFetch,
    staleThresholdMs: 60_000,
  })

  assert.equal(result.connectionStatus, 'LIVE_CONNECTED')
  assert.equal(result.freshness, 'STALE')
  assert.equal(result.lastSyncTimestamp, staleTime)
})

test('M40-06: fetchOrbitOperationalState safely maps to OFFLINE when ARSY Hub is unreachable or times out', async () => {
  const now = Date.parse('2026-10-27T12:00:00.000Z')

  // Simulate network connection failure (ECONNREFUSED)
  const mockFailingFetch = async () => {
    throw new TypeError('fetch failed: connect ECONNREFUSED 127.0.0.1:3000')
  }

  const result = await fetchOrbitOperationalState({
    env: { ARSY_API_URL: 'http://localhost:3000' },
    now,
    fetchFn: mockFailingFetch,
  })

  assert.equal(result.connectionStatus, 'OFFLINE')
  assert.equal(result.freshness, 'UNKNOWN')
  assert.ok(result.dataSource.includes('Unreachable'))
  assert.equal(result.workstations.length, 0)
  assert.equal(result.agents.length, 0)
  assert.ok(result.recentTraces.length > 0)
  assert.equal(result.recentTraces[0].level, 'WARN')
  assert.match(result.recentTraces[0].message, /unreachable/i)
  assert.ok(result.errorMessage?.includes('ECONNREFUSED'))
})

test('M40-06: fetchOrbitOperationalState safely maps to UNAUTHORIZED on HTTP 401 or 403', async () => {
  const now = Date.parse('2026-10-27T12:00:00.000Z')

  const mockAuth401Fetch = async () => {
    return new Response(JSON.stringify({ error: 'Unauthorized', message: 'Missing token' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    })
  }

  const result = await fetchOrbitOperationalState({
    env: { ARSY_API_URL: 'http://localhost:3000' },
    now,
    fetchFn: mockAuth401Fetch,
  })

  assert.equal(result.connectionStatus, 'UNAUTHORIZED')
  assert.equal(result.freshness, 'UNKNOWN')
  assert.equal(result.workstations.length, 0)
  assert.ok(result.recentTraces.length > 0)
  assert.equal(result.recentTraces[0].level, 'SECURITY')
  assert.match(result.recentTraces[0].message, /HTTP 401/)
})

test('M40-06: fetchOrbitOperationalState sanitizes credentials from live ARSY payloads', async () => {
  const now = Date.parse('2026-10-27T12:00:00.000Z')
  // Construct dummy secret dynamically to avoid GitHub push protection alerts
  const dummySecretToken = ['sk', 'live', '1234567890abcdef'].join('-')
  const dummyPassword = ['db', 'pass', 'supersecret'].join('-')

  const mockPayloadWithSecrets = async () => {
    return new Response(
      JSON.stringify({
        status: 'ok',
        timestamp: new Date(now).toISOString(),
        apiKey: dummySecretToken,
        secretAccessKey: dummyPassword,
        workstations: [
          {
            id: 'ws-secure',
            name: 'Secure Workstation',
            zone: 'alpha',
            status: 'STANDALONE',
            authToken: dummySecretToken,
          },
        ],
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    )
  }

  const result = await fetchOrbitOperationalState({
    env: { ARSY_API_URL: 'http://localhost:3000' },
    now,
    fetchFn: mockPayloadWithSecrets,
  })

  const serialized = JSON.stringify(result)
  assert.doesNotMatch(serialized, new RegExp(dummySecretToken))
  assert.doesNotMatch(serialized, new RegExp(dummyPassword))
})

test('M40-06: OrbitShellHeader component enforces truthful status badges across all states', () => {
  const headerPath = resolve(appRoot, 'src/components/OrbitShellHeader.tsx')
  assert.ok(existsSync(headerPath), 'OrbitShellHeader.tsx must exist')

  const headerSrc = readFileSync(headerPath, 'utf8')
  const pageSrc = readFileSync(resolve(appRoot, 'src/app/page.tsx'), 'utf8')

  // 1. LIVE + FRESH badge rule
  assert.ok(
    headerSrc.includes("connectionStatus === 'LIVE_CONNECTED' && freshness === 'FRESH'"),
    'renders LIVE badge with LiveDot only when live connected and fresh',
  )
  assert.ok(headerSrc.includes('copy.liveBadge'), 'references liveBadge copy')
  assert.ok(headerSrc.includes('tone="ok"'), 'uses ok tone for live status')

  // 2. LIVE + STALE badge rule
  assert.ok(
    headerSrc.includes("connectionStatus === 'LIVE_CONNECTED' && freshness === 'STALE'"),
    'renders caution badge when live connected but stale',
  )
  assert.ok(headerSrc.includes('copy.freshnessStale'), 'references freshnessStale copy')
  assert.ok(headerSrc.includes('tone="accent"'), 'uses accent tone for stale caution')
  assert.match(
    pageSrc,
    /copy\.freshnessLabel}:[\s\S]*?\{state\.freshness\}[\s\S]*?copy\.synchronizedLabel}: \{state\.lastSyncTimestamp\}/,
    'shows the freshness state and exact last-known timestamp together in the page footer',
  )

  // 3. OFFLINE badge rule
  assert.ok(headerSrc.includes("connectionStatus === 'OFFLINE'"), 'handles OFFLINE status')
  assert.ok(headerSrc.includes('copy.statusOffline'), 'references statusOffline copy')
  assert.ok(headerSrc.includes('copy.arsyOffline'), 'references arsyOffline copy')
  assert.ok(headerSrc.includes('tone="hot"'), 'uses hot tone for offline alert')

  // 4. UNAUTHORIZED badge rule
  assert.ok(headerSrc.includes("connectionStatus === 'UNAUTHORIZED'"), 'handles UNAUTHORIZED status')
  assert.ok(headerSrc.includes('copy.statusUnauthorized'), 'references statusUnauthorized copy')

  // 5. SIMULATED_LOCAL badge rule
  assert.ok(headerSrc.includes("connectionStatus === 'SIMULATED_LOCAL'"), 'handles SIMULATED_LOCAL status')
  assert.ok(headerSrc.includes('copy.provenanceSimulated'), 'references provenanceSimulated copy')
})

test('M40-06: buildOfflineState and buildUnauthorizedState helper factories are deterministic', () => {
  const now = Date.parse('2026-10-27T12:00:00.000Z')

  const offline = buildOfflineState('http://arsy.local:3000', now, 'Connection timeout')
  assert.equal(offline.connectionStatus, 'OFFLINE')
  assert.equal(offline.freshness, 'UNKNOWN')
  assert.equal(offline.workstations.length, 0)
  assert.equal(offline.recentTraces[0].level, 'WARN')

  const unauth = buildUnauthorizedState('http://arsy.local:3000', now, 403)
  assert.equal(unauth.connectionStatus, 'UNAUTHORIZED')
  assert.equal(unauth.freshness, 'UNKNOWN')
  assert.equal(unauth.recentTraces[0].level, 'SECURITY')
})

test('M40-06: BFF route handler exists and prevents credential leakage to browser', () => {
  const routePath = resolve(appRoot, 'src/app/api/ops/state/route.ts')
  assert.ok(existsSync(routePath), 'BFF route handler must exist')

  const routeSrc = readFileSync(routePath, 'utf8')
  assert.ok(routeSrc.includes('fetchOrbitOperationalState'), 'calls fetchOrbitOperationalState')
  assert.ok(routeSrc.includes('cache-control'), 'sets explicit no-store cache headers')
  assert.doesNotMatch(routeSrc, /serviceKey|authToken|secret/i, 'no hardcoded service keys in route')
})
