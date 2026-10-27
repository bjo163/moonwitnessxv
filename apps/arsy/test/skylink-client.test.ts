import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { test } from 'node:test'
import { SKYLINK_URL_DEFAULT } from '@moonwitness/core'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../src/app.js'
import { parseConfig } from '../src/config.js'
import { registerSkylinkChannels, SkylinkRuntime } from '../src/lib/skylink.js'
import { SkylinkChannelRegistry } from '../../skylink/src/channels.js'
import type { SkylinkChannel } from '../../skylink/src/channels.js'
import { createSkylinkServer } from '../../skylink/src/server.js'
import {
  createChannelAccount,
  createSkylinkStore,
  listConversations,
  listMessages,
  migrateSkylinkStore,
} from '../../../packages/skylink-store/src/index.js'
import type { SkylinkDatabase, SkylinkStore } from '../../../packages/skylink-store/src/index.js'
import { adminHeaders, TEST_ADMIN_PASSWORD, withTestAdmin } from './helpers/auth.js'

/**
 * M38-12 — ARSY as a SKYLINK client behind `SKYLINK_ENABLED`.
 *
 * The positive half runs the shipped SKYLINK Fastify plugin (`createSkylinkServer`)
 * against the real local Postgres, exactly as M38-11 does, because no shipped
 * provider can deliver to a real chat in a test. The negative half proves the flag
 * off path makes no SKYLINK call, and that a missing service key is a 401 the hub
 * surfaces instead of crashing on.
 */

const SERVICE_KEY = 'synthetic-m38-12-skylink-service-key-0001'
const REGISTER_PATH = '/api/v1/channels/register'
const databaseUrl = process.env.DATABASE_URL

class FixtureChannel extends EventEmitter implements SkylinkChannel {
  readonly id = 'telegram'
  readonly label = 'Telegram fixture'
  state = 'configured'
  sends = 0

  constructor(readonly channelAccountId: string) {
    super()
  }

  status() {
    return { state: this.state }
  }

  async send({ text }: { to: string; text: string }) {
    this.sends += 1
    assert.ok(text.length > 0)
    return { status: 'accepted' as const, providerMessageId: `provider-${this.sends}` }
  }

  async start() {
    this.state = 'open'
  }

  async logout() {
    this.state = 'logged-out'
  }
}

interface SkylinkHarness {
  app: FastifyInstance
  baseUrl: string
  seen: Array<{ url: string; key: boolean; authorization: boolean; cookie: boolean }>
  setArsyUrl: (url: string) => void
}

/**
 * A real SKYLINK instance. `arsyUrl` is a fixed placeholder rewritten by the
 * injected fetcher, because ARSY can only listen after SKYLINK booted: session
 * validation is a real HTTP round trip to the real hub.
 */
async function startSkylink(options: {
  store?: SkylinkDatabase
  channels?: SkylinkChannel[]
  fetcher?: typeof fetch
}): Promise<SkylinkHarness> {
  const registry = new SkylinkChannelRegistry()
  for (const channel of options.channels ?? []) registry.register(channel)
  let arsyUrl = 'http://127.0.0.1:1'
  const seen: SkylinkHarness['seen'] = []
  const app = createSkylinkServer({
    host: '127.0.0.1',
    port: 0,
    databaseUrl: '',
    arsyUrl: 'http://arsy.test',
    serviceKey: SERVICE_KEY,
    telegramBotToken: '',
    telegramWebhookSecret: '',
  }, {
    store: options.store,
    channels: registry,
    fetcher: options.fetcher ?? ((input, init) => fetch(String(input).replace('http://arsy.test', arsyUrl), init)),
  })
  app.addHook('onRequest', async (request) => {
    seen.push({
      url: request.url,
      key: request.headers['x-skylink-key'] !== undefined,
      authorization: request.headers.authorization !== undefined,
      cookie: request.headers.cookie !== undefined,
    })
  })
  const baseUrl = await app.listen({ host: '127.0.0.1', port: 0 })
  return { app, baseUrl, seen, setArsyUrl: (url) => { arsyUrl = url } }
}

function hubConfig(overrides: Record<string, string> = {}) {
  withTestAdmin()
  // `parseConfig` is fed an explicit object: the seed password must travel through
  // the addon allow-list (`ctx.env`), not `process.env`.
  return parseConfig({
    NODE_ENV: 'test',
    LOG_LEVEL: 'silent',
    MOONQL_AUTH_ADMIN_PASSWORD: TEST_ADMIN_PASSWORD,
    ...overrides,
  })
}

/** Record every outbound fetch so "flag off makes no SKYLINK call" is measurable. */
function spyFetch(): { calls: string[]; restore: () => void } {
  const original = globalThis.fetch
  const calls: string[] = []
  globalThis.fetch = (async (...args: Parameters<typeof fetch>) => {
    const input: unknown = args[0]
    calls.push(typeof input === 'string' ? input : input instanceof URL ? input.href : String(input))
    return original(...args)
  }) as typeof fetch
  return { calls, restore: () => { globalThis.fetch = original } }
}

void test('SKYLINK_ENABLED defaults to off and carries no credential by default', () => {
  const off = parseConfig({})
  assert.equal(off.skylink.enabled, false)
  assert.equal(off.skylink.url, SKYLINK_URL_DEFAULT)
  assert.equal(off.skylink.serviceKey, '')

  const on = parseConfig({ SKYLINK_ENABLED: 'true', SKYLINK_URL: 'http://127.0.0.1:3999', SKYLINK_SERVICE_KEY: 'synthetic' })
  assert.equal(on.skylink.enabled, true)
  assert.equal(on.skylink.url, 'http://127.0.0.1:3999')
  assert.equal(on.skylink.serviceKey, 'synthetic')
})

void test('malformed SKYLINK registry fails closed without aborting ARSY boot', async () => {
  const malformed = [
    { id: 'telegram', label: 'Telegram', state: 'configured' },
    { id: 'telegram', label: 'Telegram', state: '' },
  ]
  const malformedBodies: unknown[] = [
    { id: 'telegram', label: 'Telegram', state: 'configured' },
    [{ id: 'telegram', label: 'Telegram', state: 'configured' }, malformed[1]],
    [malformed[0], malformed[0]],
  ]

  for (const data of malformedBodies) {
    const runtime = new SkylinkRuntime({
      baseUrl: 'http://skylink.test',
      serviceKey: SERVICE_KEY,
      fetcher: async () => new Response(JSON.stringify({ ok: true, data }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    })
    const registered: unknown[] = []
    const errors: unknown[] = []
    const app = {
      channels: { register: (channel: unknown) => registered.push(channel) },
      log: { error: (context: unknown) => errors.push(context), info: () => {} },
    } as unknown as FastifyInstance

    await assert.doesNotReject(registerSkylinkChannels(app, runtime))
    assert.equal(runtime.state, 'unavailable')
    assert.equal(runtime.error, 'skylink_invalid_response')
    assert.equal(registered.length, 0, 'malformed data must not invent a channel')
    assert.equal(errors.length, 1, 'the failure is logged once with a stable code')
  }
})

void test('flag on: ARSY registers, lists, sends and controls through a real SKYLINK', {
  skip: databaseUrl === undefined || databaseUrl === '' ? 'DATABASE_URL is required for the D18-backed SKYLINK send path' : false,
  timeout: 30_000,
}, async (t) => {
  const store: SkylinkStore = createSkylinkStore(databaseUrl as string)
  await migrateSkylinkStore(store)
  const account = await createChannelAccount(store.db, {
    provider: 'telegram',
    externalAccountId: `m38-12-${Date.now()}`,
    authRef: 'secret://test/m38-12',
    status: 'disconnected',
  })
  const fixture = new FixtureChannel(account.id)
  const skylink = await startSkylink({ store: store.db, channels: [fixture] })
  t.after(async () => {
    await skylink.app.close()
    await store.client`DELETE FROM skylink.channel_accounts WHERE id = ${account.id}`
    await store.client.end({ timeout: 5 })
  })

  const arsy = await buildApp(hubConfig({
    SKYLINK_ENABLED: 'true',
    SKYLINK_URL: skylink.baseUrl,
    SKYLINK_SERVICE_KEY: SERVICE_KEY,
  }))
  t.after(() => arsy.close())

  // Channel identity is SKYLINK's: the hub registered exactly what SKYLINK reported,
  // and no local factory ran.
  assert.deepEqual(arsy.channels.list().map((channel) => channel.id), ['telegram'])
  assert.equal(arsy.channels.list()[0]?.label, 'Telegram fixture')
  assert.ok(arsy.skylink)

  const arsyUrl = await arsy.listen({ host: '127.0.0.1', port: 0 })
  skylink.setArsyUrl(arsyUrl)
  const headers = await adminHeaders(arsy)

  const registered = skylink.seen.find((entry) => entry.url === REGISTER_PATH)
  assert.ok(registered, 'boot must call the SKYLINK registration handshake')
  assert.equal(registered.key, true, 'registration uses the x-skylink-key service mode')
  assert.equal(registered.authorization, false, 'the service mode never sends a session')

  const list = await arsy.inject().get('/api/v1/channels').headers(headers).end()
  assert.equal(list.statusCode, 200, list.body)
  assert.equal(list.json().data[0].id, 'telegram')
  assert.equal(list.json().data[0].state, 'configured')
  assert.equal('detail' in list.json().data[0], false, 'no QR/JID ever reaches the hub')

  const send = await arsy.inject()
    .post('/api/v1/channels/telegram/send')
    .headers(headers)
    .body({ to: 'chat-fixture', text: 'synthetic m38-12 outbound body' })
    .end()
  assert.equal(send.statusCode, 200, send.body)
  assert.equal(send.json().data.ok, true)
  assert.equal(typeof send.json().data.id, 'string')

  // The send really went through SKYLINK's /send with the service key, and D18 recorded it.
  const sendCall = skylink.seen.find((entry) => entry.url === '/api/v1/send')
  assert.ok(sendCall, 'the hub sends through SKYLINK, not in-process')
  assert.equal(sendCall.key, true)
  assert.equal(sendCall.authorization, false)
  const conversations = await listConversations(store.db, account.id)
  assert.equal(conversations.length, 1)
  const persisted = await listMessages(store.db, conversations[0]!.id)
  assert.equal(persisted[0]?.body, 'synthetic m38-12 outbound body')
  assert.equal(persisted[0]?.id, send.json().data.id)

  const broadcast = await arsy.inject()
    .post('/api/v1/channels/broadcast')
    .headers(headers)
    .body({ to: 'chat-fixture', text: 'synthetic m38-12 broadcast' })
    .end()
  assert.equal(broadcast.statusCode, 200, broadcast.body)
  assert.equal(broadcast.json().data[0].ok, true)

  // Control stays an operator action: the caller's ARSY session is forwarded and
  // SKYLINK validates it against the real hub. The service key is not used here.
  const started = await arsy.inject().post('/api/v1/channels/telegram/start').headers(headers).end()
  assert.equal(started.statusCode, 200, started.body)
  assert.equal(started.json().data.state, 'open')
  assert.equal(fixture.state, 'open')
  const controlCall = skylink.seen.filter((entry) => entry.url === '/api/v1/channels/telegram/start')
  assert.equal(controlCall.at(-1)?.authorization, true, 'control forwards the operator session')
  assert.equal(controlCall.at(-1)?.key, false, 'the service key is never widened to control')

  assert.equal(skylink.seen.some((entry) => entry.cookie), false, 'no cookie is ever sent to SKYLINK')
  const anonymous = await arsy.inject().post('/api/v1/channels/telegram/send').body({ to: 'chat-fixture', text: 'x' }).end()
  assert.equal(anonymous.statusCode, 401)
})

void test('flag on: a missing service key is a 401 the hub surfaces without crashing', {
  timeout: 20_000,
}, async (t) => {
  const skylink = await startSkylink({
    channels: [new FixtureChannel('unused-account')],
    // A real upstream lookup is not the subject here: this stands in for the ARSY
    // session resolver so the route policy itself can be asserted.
    fetcher: () => Promise.resolve(new Response(JSON.stringify({ data: { login: 'operator', role: 'admin' } }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })),
  })
  t.after(() => skylink.app.close())

  const noKey = await skylink.app.inject().post(REGISTER_PATH).end()
  assert.equal(noKey.statusCode, 401, 'the registration handshake is not anonymous')
  const wrongKey = await skylink.app.inject().post(REGISTER_PATH).headers({ 'x-skylink-key': `${SERVICE_KEY}-wrong` }).end()
  assert.equal(wrongKey.statusCode, 401, 'a wrong service key is a 401')
  const adminSession = await skylink.app.inject().post(REGISTER_PATH).headers({ authorization: 'Bearer synthetic-session' }).end()
  assert.equal(adminSession.statusCode, 403, 'registration is service-only, even for an administrator')

  const arsy = await buildApp(hubConfig({
    SKYLINK_ENABLED: 'true',
    SKYLINK_URL: skylink.baseUrl,
    SKYLINK_SERVICE_KEY: '',
  }))
  t.after(() => arsy.close())

  assert.equal(arsy.skylink?.state, 'unavailable')
  assert.deepEqual(arsy.channels.list(), [], 'no channel is invented when registration fails')

  const headers = await adminHeaders(arsy)
  const list = await arsy.inject().get('/api/v1/channels').headers(headers).end()
  assert.equal(list.statusCode, 503, 'an unknown registry is not an empty registry')
  assert.match(list.json().error.message, /skylink_unauthorized/)

  const health = await arsy.inject().get('/api/v1/health').end()
  assert.equal(health.statusCode, 200, 'the hub keeps booting and serving when SKYLINK rejects it')
  assert.equal((await arsy.inject().get('/api/v1/channels').end()).statusCode, 401, 'the proxy stays admin-only')

  const missing = await arsy.inject()
    .post('/api/v1/channels/telegram/send')
    .headers(headers)
    .body({ to: 'chat-fixture', text: 'x' })
    .end()
  assert.equal(missing.statusCode, 404)
})

void test('flag off: boot, list, send and start make zero SKYLINK calls', { timeout: 20_000 }, async (t) => {
  const spy = spyFetch()
  t.after(spy.restore)

  const arsy = await buildApp(hubConfig({
    // Worse than absent: a URL that would fail loudly if anything used it.
    SKYLINK_URL: 'http://127.0.0.1:9',
    SKYLINK_SERVICE_KEY: SERVICE_KEY,
  }))
  t.after(() => arsy.close())
  assert.equal(arsy.skylink, null, 'flag off constructs no SKYLINK client')

  const headers = await adminHeaders(arsy)
  arsy.channels.register({
    id: 'fake',
    label: 'Fake IM',
    status: () => ({ state: 'open' }),
    send: async ({ to }) => ({ channel: 'fake', to, ok: true, id: 'local-1' }),
    start: async () => {},
  })

  assert.equal((await arsy.inject().get('/api/v1/channels').headers(headers).end()).statusCode, 200)
  const send = await arsy.inject()
    .post('/api/v1/channels/fake/send')
    .headers(headers)
    .body({ to: 'user-1', text: 'hi' })
    .end()
  assert.equal(send.statusCode, 200)
  assert.equal(send.json().data.ok, true)
  assert.equal(send.json().data.id, 'local-1', 'the local channel still owns delivery')
  assert.equal((await arsy.inject().post('/api/v1/channels/fake/start').headers(headers).end()).statusCode, 200)

  assert.deepEqual(spy.calls.filter((url) => url.includes('127.0.0.1:9')), [], 'no SKYLINK call with the flag off')
  assert.equal(spy.calls.some((url) => url.includes(REGISTER_PATH)), false, 'no registration with the flag off')
})
