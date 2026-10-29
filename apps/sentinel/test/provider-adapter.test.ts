import assert from 'node:assert/strict'
import test from 'node:test'
import { decideOutboundIntent } from './egress-policy-contract.js'
import {
  fetchObservation,
  type ProviderAdapterConfig,
  type ProviderAdapterDeps,
  type ProviderAdapterReason,
  type ProviderObservationInput,
} from '../src/provider-adapter.js'

const PROVIDER_ID = 'prototype-feed'
const OBSERVATION_URL = 'https://feed.example.test/v1/observations'

/** Synthetic fixture only: a provider payload, not a real observation. */
const validPayload = {
  observedAt: '2026-02-03T04:05:06.000Z',
  source: { id: 'synthetic-feed', name: 'Synthetic Example Feed' },
  metadata: { revision: 'r7', kind: 'observation' },
  data: { headline: 'synthetic fixture headline' },
} as const

interface FetchCall {
  url: string
  init: RequestInit | undefined
}

interface HarnessOptions {
  config?: Partial<ProviderAdapterConfig>
  input?: Partial<ProviderObservationInput>
  addresses?: string[]
  resolveError?: Error
  response?: () => Response
  fetchError?: Error
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function baseConfig(overrides: Partial<ProviderAdapterConfig> = {}): ProviderAdapterConfig {
  return {
    enabled: true,
    egressEnabled: true,
    capabilityEnabled: true,
    providerId: PROVIDER_ID,
    allowedOrigins: ['https://feed.example.test'],
    allowedPaths: ['/v1/observations'],
    rights: 'CLEARED',
    termsApproved: true,
    requestTimeoutMs: 2_000,
    maxResponseBytes: 4_096,
    budget: { maxRequests: 3, requestsUsed: 0 },
    ...overrides,
  }
}

function createHarness(options: HarnessOptions = {}) {
  const fetchCalls: FetchCall[] = []
  const resolveCalls: string[] = []
  const deps: ProviderAdapterDeps = {
    fetchImpl: async (url, init) => {
      fetchCalls.push({ url: String(url), init })
      if (options.fetchError) throw options.fetchError
      return (options.response ?? (() => jsonResponse(validPayload)))()
    },
    resolveHost: async (hostname) => {
      resolveCalls.push(hostname)
      if (options.resolveError) throw options.resolveError
      return options.addresses ?? ['198.51.100.10']
    },
    // Injected here because a src/ module cannot import test/ (TS6059/TS6307).
    decideIntent: decideOutboundIntent,
  }
  const input: ProviderObservationInput = { providerId: PROVIDER_ID, url: OBSERVATION_URL, ...options.input }
  return {
    fetchCalls,
    resolveCalls,
    run: () => fetchObservation(input, baseConfig(options.config), deps),
  }
}

async function expectDenied(
  options: HarnessOptions,
  reason: ProviderAdapterReason,
  expectedFetchCalls = 0,
): Promise<ReturnType<typeof createHarness>> {
  const harness = createHarness(options)
  const result = await harness.run()
  if (result.ok) assert.fail(`expected denial ${reason}, received success`)
  assert.equal(result.reason, reason)
  assert.equal(harness.fetchCalls.length, expectedFetchCalls)
  return harness
}

void test('permits exactly one allowlisted GET and returns payload provenance without wall-clock fallback', async () => {
  const harness = createHarness()
  const result = await harness.run()

  if (!result.ok) assert.fail(`expected success, received ${result.reason}`)
  assert.equal(harness.fetchCalls.length, 1)
  assert.deepEqual(harness.resolveCalls, ['feed.example.test'])

  const call = harness.fetchCalls[0]
  assert.ok(call)
  assert.equal(call.url, OBSERVATION_URL)
  assert.equal(call.init?.method, 'GET')
  assert.equal(call.init?.redirect, 'manual')

  assert.equal(result.observation.providerId, PROVIDER_ID)
  assert.deepEqual(result.observation.source, validPayload.source)
  assert.deepEqual(result.observation.metadata, validPayload.metadata)
  assert.deepEqual(result.observation.data, validPayload.data)
  // Exact payload timestamp proves provenance; `new Date()` is never consulted.
  assert.equal(result.observation.observedAt, '2026-02-03T04:05:06.000Z')
})

void test('fails without any network when the feature flag is off', async () => {
  const harness = await expectDenied({ config: { enabled: false } }, 'FEATURE_FLAG_DISABLED')
  assert.deepEqual(harness.resolveCalls, [])
})

void test('fails without any network when provider terms are not approved', async () => {
  const harness = await expectDenied({ config: { termsApproved: false } }, 'TERMS_NOT_APPROVED')
  assert.deepEqual(harness.resolveCalls, [])
})

void test('fails without any network on unknown or expired rights', async () => {
  await expectDenied({ config: { rights: 'UNKNOWN' } }, 'RIGHTS_UNKNOWN')
  await expectDenied({ config: { rights: 'EXPIRED' } }, 'RIGHTS_EXPIRED')
})

void test('fails without any network when capability or global egress is disabled', async () => {
  await expectDenied({ config: { capabilityEnabled: false } }, 'CAPABILITY_DISABLED')
  await expectDenied({ config: { egressEnabled: false } }, 'EGRESS_DISABLED')
})

void test('refuses non-allowlisted origins and paths, non-HTTPS, ports, credentials, fragments and malformed URLs', async () => {
  await expectDenied({ input: { url: 'https://other.example.test/v1/observations' } }, 'ORIGIN_NOT_ALLOWED')
  await expectDenied({ input: { url: 'https://feed.example.test/other' } }, 'PATH_NOT_ALLOWED')
  await expectDenied({ input: { url: 'http://feed.example.test/v1/observations' } }, 'HTTPS_REQUIRED')
  await expectDenied({ input: { url: 'https://feed.example.test:8443/v1/observations' } }, 'ORIGIN_NOT_ALLOWED')
  await expectDenied({ input: { url: 'https://user:secret@feed.example.test/v1/observations' } }, 'URL_CREDENTIALS_OR_FRAGMENT')
  await expectDenied({ input: { url: `${OBSERVATION_URL}#token` } }, 'URL_CREDENTIALS_OR_FRAGMENT')
  await expectDenied({ input: { url: 'not a URL' } }, 'INVALID_URL')
})

void test('refuses private, loopback, link-local and metadata addresses after DNS but before fetch', async () => {
  for (const address of ['10.0.0.1', '127.0.0.1', '169.254.169.254', '192.168.1.5', '::1', 'fd00::1']) {
    const harness = await expectDenied({ addresses: [address] }, 'NON_PUBLIC_ADDRESS')
    assert.deepEqual(harness.resolveCalls, ['feed.example.test'])
  }
})

void test('fails without any network when the request budget is exhausted', async () => {
  const harness = await expectDenied({ config: { budget: { maxRequests: 3, requestsUsed: 3 } } }, 'BUDGET_EXHAUSTED')
  assert.deepEqual(harness.resolveCalls, [])
})

void test('refuses a second or fallback provider before any network', async () => {
  const harness = await expectDenied({ input: { providerId: 'second-provider' } }, 'FALLBACK_PROVIDER_FORBIDDEN')
  assert.deepEqual(harness.resolveCalls, [])
})

void test('refuses a non-JSON body after exactly one GET', async () => {
  await expectDenied(
    { response: () => new Response('<html>not json</html>', { status: 200 }) },
    'RESPONSE_NOT_JSON',
    1,
  )
})

void test('refuses an oversized body after exactly one GET', async () => {
  const oversized = { ...validPayload, data: { padding: 'x'.repeat(512) } }
  await expectDenied({ config: { maxResponseBytes: 64 }, response: () => jsonResponse(oversized) }, 'RESPONSE_TOO_LARGE', 1)
})

void test('refuses a payload without a valid observedAt instead of substituting the wall clock', async () => {
  await expectDenied(
    { response: () => jsonResponse({ source: validPayload.source, metadata: {}, data: {} }) },
    'PAYLOAD_CONTRACT_INVALID',
    1,
  )
  await expectDenied(
    { response: () => jsonResponse({ ...validPayload, observedAt: 'yesterday' }) },
    'PAYLOAD_CONTRACT_INVALID',
    1,
  )
})

void test('refuses non-2xx responses after one GET without echoing the body', async () => {
  const marker = 'provider-body-marker-do-not-leak'
  const harness = createHarness({ response: () => new Response(`{"secret":"${marker}"}`, { status: 500 }) })
  const result = await harness.run()
  if (result.ok) assert.fail('expected HTTP rejection')
  assert.equal(result.reason, 'HTTP_STATUS_REJECTED')
  assert.equal(harness.fetchCalls.length, 1)
  const serialized = JSON.stringify(result)
  assert.equal(serialized, '{"ok":false,"reason":"HTTP_STATUS_REJECTED"}')
  assert.equal(serialized.includes(marker), false)
  assert.equal(serialized.includes('feed.example.test'), false)
})

void test('maps transport and timeout failures to stable codes after one attempt', async () => {
  await expectDenied({ fetchError: new Error('socket reset') }, 'TRANSPORT_FAILED', 1)
  const timeout = new Error('timed out')
  timeout.name = 'TimeoutError'
  await expectDenied({ fetchError: timeout }, 'REQUEST_TIMEOUT', 1)
})

void test('fails closed before any network when the decision model is not injected', async () => {
  let fetchCalls = 0
  let resolveCalls = 0
  const deps = {
    fetchImpl: async () => {
      fetchCalls += 1
      return jsonResponse(validPayload)
    },
    resolveHost: async () => {
      resolveCalls += 1
      return ['198.51.100.10']
    },
  } as unknown as ProviderAdapterDeps

  const result = await fetchObservation({ providerId: PROVIDER_ID, url: OBSERVATION_URL }, baseConfig(), deps)
  if (result.ok) assert.fail('expected DECISION_MODEL_MISSING')
  assert.equal(result.reason, 'DECISION_MODEL_MISSING')
  assert.equal(fetchCalls, 0)
  assert.equal(resolveCalls, 0)
})
