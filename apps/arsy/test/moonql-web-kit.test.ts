import { test } from 'node:test'
import assert from 'node:assert/strict'
import { HUB_API_DEFAULT } from '@moonwitness/core'
import { apiBaseUrl, openLiveStream, sameOriginSdk, type MoonClient } from '@moonwitness/moonql-client'

/**
 * The shared web kit: URL resolution, and a live feed that survives interruption.
 *
 * `openLiveStream` is the piece both frontends now depend on for reconnecting, so
 * it is tested against a fake client rather than a live hub: what matters is the
 * sequence of states, that a dropped feed comes back with a bounded delay, and that
 * the caller can make it stop for good.
 */

interface Attempt {
  opened: boolean
  aborted: boolean
}

/** a client whose stream opens, emits one frame, and ends after `holdMs` */
function fakeStreamClient(attempts: Attempt[], opts: { fail?: boolean; failAfter?: number } = {}) {
  let calls = 0
  const stream = async (_path: string, init: { onOpen?: () => void; onEvent: (d: unknown, e: string) => void; signal?: AbortSignal }): Promise<void> => {
    const attempt: Attempt = { opened: false, aborted: false }
    attempts.push(attempt)
    calls += 1
    if (opts.fail && (opts.failAfter === undefined || calls > opts.failAfter)) {
      throw new Error('upstream refused')
    }
    init.onEvent?.({ kind: 'listen', seconds: 12 }, 'message')
    attempt.opened = true
    init.onOpen?.()
    await new Promise<void>((resolve) => {
      const timer = setTimeout(done, 20)
      init.signal?.addEventListener('abort', () => {
        attempt.aborted = true
        clearTimeout(timer)
        resolve()
      })
      function done(): void {
        init.signal?.removeEventListener('abort', () => {})
        resolve()
      }
    })
  }
  return { stream } as unknown as MoonClient
}

test('apiBaseUrl: one rule for the hub URL, default and trailing slashes included', () => {
  assert.equal(apiBaseUrl({}), HUB_API_DEFAULT)
  assert.equal(apiBaseUrl({ ARSY_API_URL: 'http://arsy:3000/api/v1/' }), 'http://arsy:3000/api/v1')
  assert.equal(apiBaseUrl({ ARSY_API_URL: 'http://arsy:3000/api/v1', RADIO_API_URL: 'http://arsy:3000/api/v1' }), 'http://arsy:3000/api/v1')
  assert.equal(apiBaseUrl({ RADIO_API_URL: 'http://hub:3000/api/v1/' }), 'http://hub:3000/api/v1')
  assert.equal(apiBaseUrl({ RADIO_API_URL: 'http://hub:3000/api/v1///' }), 'http://hub:3000/api/v1')
  // an empty value is not "unset": it must not silently become the default
  assert.equal(apiBaseUrl({ RADIO_API_URL: '' }), '')
  assert.throws(
    () => apiBaseUrl({ ARSY_API_URL: 'http://arsy:3000/api/v1', RADIO_API_URL: 'http://radio:3000/api/v1' }),
    /Conflicting Hub URL settings: ARSY_API_URL and RADIO_API_URL/,
  )
})

test('openLiveStream: reports live on open, then reconnects after the feed ends', async () => {
  const attempts: Attempt[] = []
  const states: string[] = []
  const events: unknown[] = []

  const stop = openLiveStream(fakeStreamClient(attempts), {
    path: '/on-air',
    onState: (s) => states.push(s),
    onEvent: (data) => events.push(data),
    minRetryMs: 10,
    maxRetryMs: 40,
  })

  await new Promise((resolve) => setTimeout(resolve, 150))
  stop()

  assert.ok(attempts.length >= 2, `the feed came back after ending (attempts: ${attempts.length})`)
  assert.ok(events.length >= 2, 'frames from each attempt reached the caller')
  assert.equal(states[0], 'connecting', 'it starts by saying it is trying')
  assert.ok(states.includes('live'), 'a feed that opened is reported as live')
  assert.ok(states.includes('down'), 'and an ended feed is not hidden')
})

test('openLiveStream: the caller can stop it for good', async () => {
  const attempts: Attempt[] = []
  const stop = openLiveStream(fakeStreamClient(attempts), {
    path: '/on-air',
    onEvent: () => {},
    minRetryMs: 10,
  })

  await new Promise((resolve) => setTimeout(resolve, 40))
  stop()
  const seen = attempts.length
  await new Promise((resolve) => setTimeout(resolve, 120))

  assert.equal(attempts.length, seen, 'no reconnect happens after the caller stops')
})

test('openLiveStream: an abort signal from the caller ends the attempt and the retries', async () => {
  const attempts: Attempt[] = []
  const controller = new AbortController()
  openLiveStream(fakeStreamClient(attempts), {
    path: '/on-air',
    onEvent: () => {},
    signal: controller.signal,
    minRetryMs: 10,
  })

  await new Promise((resolve) => setTimeout(resolve, 15))
  controller.abort()
  const seen = attempts.length
  await new Promise((resolve) => setTimeout(resolve, 100))

  assert.equal(attempts[0]?.aborted, true, 'the in-flight stream was aborted, not abandoned')
  assert.equal(attempts.length, seen, 'and nothing reopened after the abort')
})

test('openLiveStream: backoff keeps retrying a hub that refuses, at a bounded pace', async () => {
  const attempts: Attempt[] = []
  const states: string[] = []
  const stop = openLiveStream(fakeStreamClient(attempts, { fail: true }), {
    path: '/on-air',
    onState: (s) => states.push(s),
    onEvent: () => {},
    minRetryMs: 10,
    maxRetryMs: 25,
  })

  await new Promise((resolve) => setTimeout(resolve, 130))
  stop()

  assert.ok(attempts.length >= 3, `retried on failure (attempts: ${attempts.length})`)
  assert.ok(attempts.length < 40, 'and never tighter than the backoff floor')
  assert.equal(states[0], 'connecting')
  assert.ok(states.every((s) => s === 'connecting' || s === 'down'), 'a refusing hub is never reported as live')
})

test('sameOriginSdk: a relative client for BFF routes, with no hub URL in sight', () => {
  const client = sameOriginSdk()
  assert.equal(client.baseUrl, '', 'the browser only ever addresses its own origin')
})
