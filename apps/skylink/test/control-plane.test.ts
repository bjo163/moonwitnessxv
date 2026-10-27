import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { test } from 'node:test'
import Fastify from 'fastify'
import { bootMoonQl, moonqlRest } from '@moonwitness/moonql'
import auth, { hashPassword, newToken } from '@moonwitness/moonql-auth'
import {
  createChannelAccount,
  createSkylinkStore,
  findConversation,
  listConversations,
  listMessages,
  migrateSkylinkStore,
  recordDeliveryAttempt,
} from '@moonwitness/skylink-store'
import { TelegramAdapter } from '@moonwitness/skylink-telegram'
import type { SkylinkChannel } from '../src/channels.js'
import { createTelegramSkylinkChannel, DuplicateSkylinkChannelIdError, SkylinkChannelRegistry } from '../src/channels.js'
import type { SkylinkConfig } from '../src/config.js'
import { createSkylinkServer } from '../src/server.js'
import { SkylinkEventBus } from '../src/ws.js'

const SERVICE_KEY = 'synthetic-skylink-service-key-value-00001'
const TELEGRAM_SECRET = 'synthetic-skylink-telegram-webhook-secret-01'
const ARSY_PASSWORD = 'synthetic-skylink-test-password'
const databaseUrl = process.env.DATABASE_URL

class TestChannel extends EventEmitter implements SkylinkChannel {
  readonly id: string
  readonly label = 'Telegram fixture'
  state = 'configured'
  sends = 0

  constructor(readonly channelAccountId: string, id = 'telegram') {
    super()
    this.id = id
  }

  status() {
    return { state: this.state, detail: { qr: 'synthetic-private-qr' } }
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

void test('SKYLINK channel registry fails on duplicate ids with a named error', () => {
  const registry = new SkylinkChannelRegistry()
  const first = new TestChannel('unused')
  registry.register(first)
  assert.throws(() => registry.register(new TestChannel('unused')), DuplicateSkylinkChannelIdError)
  assert.equal(registry.get('telegram'), first)
})

void test('SKYLINK registers Telegram transport as a sendable control-plane channel', async () => {
  const adapter = new TelegramAdapter({
    botToken: 'synthetic-token-never-used',
    webhookSecret: TELEGRAM_SECRET,
    externalAccountId: 'default',
    authRef: 'secret://test/telegram-bot',
    store: {} as never,
    api: { sendMessage: async () => ({ message_id: 42 }) } as never,
  })
  const registry = new SkylinkChannelRegistry()
  registry.register(createTelegramSkylinkChannel(adapter, 'synthetic-account-id'))
  const channel = registry.get('telegram')
  assert.ok(channel)
  assert.equal(channel.channelAccountId, 'synthetic-account-id')
  assert.deepEqual(await channel.status(), { state: 'configured' })
  assert.deepEqual(await channel.send({ to: 'chat-fixture', text: 'synthetic send' }), {
    status: 'accepted', providerMessageId: '42',
  })
  await channel.logout?.()
  assert.deepEqual(await channel.status(), { state: 'stopped' })
})

void test('SKYLINK limits service-key scope and cleans up WebSockets closed during ARSY auth', { timeout: 10_000 }, async (t) => {
  const events = new SkylinkEventBus()
  let releaseAuth: (() => void) | undefined
  let authStarted: () => void = () => {}
  const started = new Promise<void>((resolve) => { authStarted = resolve })
  const app = createSkylinkServer({
    host: '127.0.0.1', port: 3005, databaseUrl: '', arsyUrl: 'http://127.0.0.1:3000',
    serviceKey: SERVICE_KEY, telegramBotToken: '', telegramWebhookSecret: '',
  }, {
    events,
    fetcher: (_input, init) => {
      const authorization = new Headers(init?.headers).get('authorization')
      const role = authorization === 'Bearer synthetic-viewer-token' ? 'user' : 'admin'
      const response = () => new Response(JSON.stringify({ data: { login: 'operator', role } }), {
        status: 200, headers: { 'content-type': 'application/json' },
      })
      if (authorization !== 'Bearer synthetic-pending-auth-token') return Promise.resolve(response())
      return new Promise<Response>((resolve) => {
        releaseAuth = () => resolve(response())
        authStarted()
      })
    },
  })
  const serverUrl = await app.listen({ host: '127.0.0.1', port: 0 })
  t.after(async () => app.close())

  const serviceSocket = new WebSocket(serverUrl.replace(/^http/, 'ws') + '/ws')
  await waitForOpen(serviceSocket)
  const serviceAuth = nextFrame(serviceSocket)
  const serviceClosed = waitForClose(serviceSocket)
  serviceSocket.send(JSON.stringify({ type: 'auth', serviceKey: SERVICE_KEY }))
  assert.deepEqual(await within(serviceAuth, 'service-key WebSocket rejection'), { type: 'auth', ok: false, error: 'forbidden' })
  assert.equal(await within(serviceClosed, 'service-key WebSocket close'), 1008)
  assert.equal(events.listenerCount('event'), 0, 'service keys never subscribe to the event stream')

  const viewerSocket = new WebSocket(serverUrl.replace(/^http/, 'ws') + '/ws')
  await waitForOpen(viewerSocket)
  const viewerAuth = nextFrame(viewerSocket)
  const viewerClosed = waitForClose(viewerSocket)
  viewerSocket.send(JSON.stringify({ type: 'auth', authorization: 'Bearer synthetic-viewer-token' }))
  assert.deepEqual(await within(viewerAuth, 'non-admin WebSocket rejection'), { type: 'auth', ok: false, error: 'forbidden' })
  assert.equal(await within(viewerClosed, 'non-admin WebSocket close'), 1008)
  assert.equal(events.listenerCount('event'), 0, 'non-admin sessions never subscribe to the event stream')

  const closingSocket = new WebSocket(serverUrl.replace(/^http/, 'ws') + '/ws')
  await waitForOpen(closingSocket)
  const closing = waitForClose(closingSocket)
  closingSocket.send(JSON.stringify({ type: 'auth', authorization: 'Bearer synthetic-pending-auth-token' }))
  await within(started, 'ARSY auth request start')
  closingSocket.close()
  const closeCode = await within(closing, 'socket closed while ARSY auth is pending')
  assert.ok(closeCode === 1000 || closeCode === 1005, `unexpected disconnect close code ${closeCode}`)
  assert.ok(releaseAuth)
  releaseAuth()
  await new Promise((resolve) => setTimeout(resolve, 25))
  assert.equal(events.listenerCount('event'), 0, 'closed sockets are not subscribed after ARSY auth resolves')
})

void test('SKYLINK keeps tokens, QR payloads and message bodies out of info logs', async (t) => {
  const logged: string[] = []
  const channel = new TestChannel('unused')
  const channels = new SkylinkChannelRegistry()
  channels.register(channel)
  const app = createSkylinkServer({
    host: '127.0.0.1', port: 3005, databaseUrl: '', arsyUrl: 'http://127.0.0.1:3000',
    serviceKey: SERVICE_KEY, telegramBotToken: '', telegramWebhookSecret: '',
  }, {
    channels,
    // No store: /send answers 503 but still exercises body parsing and logging.
    fetcher: () => Promise.resolve(new Response(JSON.stringify({ data: { login: 'operator', role: 'admin' } }), {
      status: 200, headers: { 'content-type': 'application/json' },
    })),
    logger: { level: 'info', stream: { write: (line: string) => { logged.push(line) } } as never },
  })
  const serverUrl = await app.listen({ host: '127.0.0.1', port: 0 })
  t.after(async () => app.close())

  const anonymous = await app.inject().get('/api/v1/channels')
  assert.equal(anonymous.statusCode, 401)
  assert.equal(anonymous.body.includes('synthetic-private-qr'), false)

  const admin = await app.inject().get('/api/v1/channels').headers({ authorization: 'Bearer synthetic-arsy-token' })
  assert.equal(admin.statusCode, 200)
  assert.equal(admin.json().data.length, 1, 'the QR-exposing fixture channel is listed')
  assert.equal(admin.body.includes('synthetic-private-qr'), false, 'QR detail is not part of the channel projection')

  const send = await app.inject({
    method: 'POST', url: '/api/v1/send', headers: { 'x-skylink-key': SERVICE_KEY },
    payload: { channel: 'telegram', to: 'chat-fixture', text: 'synthetic outbound body' },
  })
  assert.equal(send.statusCode, 503)

  const socket = new WebSocket(serverUrl.replace(/^http/, 'ws') + '/ws')
  await waitForOpen(socket)
  const authFrame = nextFrame(socket)
  socket.send(JSON.stringify({ type: 'auth', authorization: 'Bearer synthetic-arsy-token' }))
  assert.deepEqual(await within(authFrame, 'admin WebSocket auth'), { type: 'auth', ok: true })
  const qrFrame = nextFrame(socket)
  channel.emit('qr', 'synthetic-private-qr')
  assert.equal((await within(qrFrame, 'channel.qr frame') as { type: string }).type, 'channel.qr')
  socket.close()

  const output = logged.join('')
  assert.ok(output.length > 0, 'the info logger actually captured output')
  for (const secret of [SERVICE_KEY, 'synthetic-arsy-token', 'synthetic-private-qr', 'synthetic outbound body']) {
    assert.equal(output.includes(secret), false, `info logs must not contain ${secret}`)
  }
})

void test('SKYLINK REST and WS enforce service/ARSY auth and publish channel events', {
  timeout: 30_000,
  // Skips only where no local Postgres is configured (the test is local-only below);
  // a configured DATABASE_URL must make this run, never report green silently.
  skip: databaseUrl ? false : 'DATABASE_URL is not set, so the ARSY/Postgres control-plane evidence cannot run',
}, async (t) => {
  assert.ok(databaseUrl)
  const database = new URL(databaseUrl)
  assert.ok(['localhost', '127.0.0.1', '::1'].includes(database.hostname), 'database test is local-only')

  const arsy = Fastify({ logger: false })
  const moonql = await bootMoonQl({
    addons: [auth],
    env: { MOONQL_AUTH_ADMIN_PASSWORD: ARSY_PASSWORD },
    log: { info: () => {}, warn: () => {} } as never,
  })
  await arsy.register(moonqlRest, { prefix: '/api/v1', instance: moonql })
  const arsyUrl = await arsy.listen({ host: '127.0.0.1', port: 0 })
  const users = await moonql.model('auth_users').search({ limit: 1, where: { login: 'admin' } })
  const admin = users.rows[0]
  assert.ok(admin)
  const validToken = newToken()
  const expiredToken = newToken()
  const cacheToken = newToken()
  const closingToken = newToken()
  const viewer = await moonql.model('auth_users').create({
    login: `viewer-${Math.floor(Math.random() * 1_000_000)}`,
    displayName: 'SKYLINK fixture viewer',
    passwordHash: hashPassword(ARSY_PASSWORD),
    role: 'user',
  })
  const viewerToken = newToken()
  const validSession = await moonql.model('auth_sessions').create({
    userRef: admin.id,
    token: validToken,
    expiresAt: new Date(Date.now() + 120_000).toISOString(),
  })
  const expiredSession = await moonql.model('auth_sessions').create({
    userRef: admin.id,
    token: expiredToken,
    expiresAt: new Date(0).toISOString(),
  })
  const cacheSession = await moonql.model('auth_sessions').create({
    userRef: admin.id,
    token: cacheToken,
    expiresAt: new Date(Date.now() + 120_000).toISOString(),
  })
  const closingSession = await moonql.model('auth_sessions').create({
    userRef: admin.id,
    token: closingToken,
    expiresAt: new Date(Date.now() + 120_000).toISOString(),
  })
  const viewerSession = await moonql.model('auth_sessions').create({
    userRef: viewer.id,
    token: viewerToken,
    expiresAt: new Date(Date.now() + 120_000).toISOString(),
  })

  const store = createSkylinkStore(databaseUrl)
  await migrateSkylinkStore(store)
  const account = await createChannelAccount(store.db, {
    provider: 'telegram',
    externalAccountId: `m38-11-test-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`,
    authRef: 'secret://test/telegram-bot',
    status: 'connected',
  })
  const fixtureAccount = await createChannelAccount(store.db, {
    provider: 'fixture',
    externalAccountId: `m38-11-fixture-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`,
    authRef: 'secret://test/fixture',
    status: 'connected',
  })
  const telegram = new TelegramAdapter({
    botToken: 'synthetic-token-never-used',
    webhookSecret: TELEGRAM_SECRET,
    externalAccountId: account.externalAccountId,
    authRef: account.authRef,
    store: store.db,
    api: { sendMessage: async () => ({ message_id: 42 }) } as never,
  })
  const channel = new TestChannel(fixtureAccount.id, 'fixture')
  const channels = new SkylinkChannelRegistry()
  channels.register(createTelegramSkylinkChannel(telegram, account.id))
  channels.register(channel)

  let now = Date.now()
  let upstreamReads = 0
  let releaseDelayedAuth: (() => void) | undefined
  let resolveDelayedAuthStarted: () => void = () => {}
  let resolveDelayedAuthFinished: () => void = () => {}
  const delayedAuthStarted = new Promise<void>((resolve) => { resolveDelayedAuthStarted = resolve })
  const delayedAuthFinished = new Promise<void>((resolve) => { resolveDelayedAuthFinished = resolve })
  const events = new SkylinkEventBus()
  const config: SkylinkConfig = {
    host: '127.0.0.1', port: 3005, databaseUrl, arsyUrl,
    serviceKey: SERVICE_KEY, telegramBotToken: 'synthetic-token-never-used', telegramWebhookSecret: TELEGRAM_SECRET,
  }
  const app = createSkylinkServer(config, {
    store: store.db,
    channels,
    telegram,
    events,
    now: () => now,
    fetcher: (input, init) => {
      upstreamReads += 1
      if (new Headers(init?.headers).get('authorization') === `Bearer ${closingToken}`) {
        return new Promise<Response>((resolve, reject) => {
          releaseDelayedAuth = () => {
            void fetch(input, init).then((response) => {
              resolve(response)
              resolveDelayedAuthFinished()
            }, reject)
          }
          resolveDelayedAuthStarted()
        })
      }
      return fetch(input, init)
    },
  })
  t.after(async () => {
    await app.close()
    await store.client`DELETE FROM skylink.channel_accounts WHERE id IN (${account.id}, ${fixtureAccount.id})`
    await store.client.end({ timeout: 5 })
    await moonql.model('auth_sessions').remove(String(validSession.id))
    await moonql.model('auth_sessions').remove(String(expiredSession.id))
    await moonql.model('auth_sessions').remove(String(cacheSession.id))
    await moonql.model('auth_sessions').remove(String(closingSession.id))
    await moonql.model('auth_sessions').remove(String(viewerSession.id))
    await moonql.model('auth_users').remove(String(viewer.id))
    await arsy.close()
    await moonql.close()
  })

  const anonymous = await app.inject().get('/api/v1/channels')
  assert.equal(anonymous.statusCode, 401)
  assert.equal(anonymous.body.includes('synthetic-private-qr'), false)
  const cookieOnly = await app.inject().get('/api/v1/channels').headers({ cookie: `session=${validToken}` })
  assert.equal(cookieOnly.statusCode, 401)
  const expired = await app.inject().get('/api/v1/channels').headers({ authorization: `Bearer ${expiredToken}` })
  assert.equal(expired.statusCode, 401)

  const serviceChannels = await app.inject().get('/api/v1/channels').headers({ 'x-skylink-key': SERVICE_KEY })
  assert.equal(serviceChannels.statusCode, 403, 'service credentials are scoped to machine send only')

  const validChannels = await app.inject().get('/api/v1/channels').headers({ authorization: `Bearer ${validToken}` })
  assert.equal(validChannels.statusCode, 200)
  assert.equal(validChannels.json().data[0].label, 'Telegram')

  let cacheStart = upstreamReads
  assert.equal((await app.inject().get('/api/v1/channels').headers({ authorization: `Bearer ${cacheToken}` })).statusCode, 200)
  assert.equal((await app.inject().get('/api/v1/channels').headers({ authorization: `Bearer ${cacheToken}` })).statusCode, 200)
  assert.equal(upstreamReads - cacheStart, 1, 'a warm session is resolved once through ARSY')
  cacheStart = upstreamReads
  now += 15_001
  assert.equal((await app.inject().get('/api/v1/channels').headers({ authorization: `Bearer ${cacheToken}` })).statusCode, 200)
  assert.equal(upstreamReads - cacheStart, 1, 'session cache expires within the required 15 second ceiling')

  const sent = await app.inject({
    method: 'POST',
    url: '/api/v1/send',
    headers: { 'x-skylink-key': SERVICE_KEY },
    payload: { channel: 'telegram', to: 'chat-fixture', text: 'synthetic outbound body' },
  })
  assert.equal(sent.statusCode, 200)
  assert.equal(sent.json().data.status, 'accepted')
  const conversations = await within(listConversations(store.db, account.id), 'persisted conversations')
  assert.equal(conversations.length, 1)
  const conversation = conversations[0]
  assert.ok(conversation)
  const outbound = await within(listMessages(store.db, conversation.id), 'persisted messages')
  assert.equal(outbound[0]?.body, 'synthetic outbound body')
  const outboundMessage = outbound[0]
  assert.ok(outboundMessage)
  await within(recordDeliveryAttempt(store.db, {
    messageId: outboundMessage.id,
    attemptNumber: 2,
    status: 'failed',
    providerMessageId: 'sensitive-provider-reference',
    errorCode: 'provider_error',
    errorSummary: 'Sensitive provider response must not be projected.',
  }), 'persisted retry attempt')

  const conversationRead = await app.inject().get('/api/v1/conversations').headers({ authorization: `Bearer ${validToken}` })
  assert.equal(conversationRead.statusCode, 200)
  const projectedConversation = conversationRead.json().data[0] as Record<string, unknown>
  assert.deepEqual(Object.keys(projectedConversation).sort(), [
    'channelAccountId', 'createdAt', 'externalId', 'id', 'lastMessageAt', 'status', 'title', 'updatedAt',
  ])
  const messageRead = await app.inject().get(`/api/v1/conversations/${conversation.id}/messages`).headers({ authorization: `Bearer ${validToken}` })
  assert.equal(messageRead.statusCode, 200)
  const projectedMessage = messageRead.json().data[0] as Record<string, unknown>
  assert.deepEqual(Object.keys(projectedMessage).sort(), [
    'body', 'conversationId', 'createdAt', 'direction', 'externalMessageId', 'id', 'senderId', 'status',
  ])
  const attemptRead = await app.inject().get(`/api/v1/conversations/${conversation.id}/delivery-attempts`).headers({ authorization: `Bearer ${validToken}` })
  assert.equal(attemptRead.statusCode, 200)
  const attempts = attemptRead.json().data as Array<Record<string, unknown>>
  assert.equal(attempts.length, 2)
  assert.equal(attempts[0]?.attemptNumber, 2, 'attempts are listed newest first')
  assert.deepEqual(Object.keys(attempts[0] ?? {}).sort(), ['attemptNumber', 'attemptedAt', 'id', 'messageId', 'status'])
  assert.equal(JSON.stringify(attempts).includes('sensitive-provider-reference'), false)
  assert.equal(JSON.stringify(attempts).includes('Sensitive provider response'), false)
  const accountRead = await app.inject().get('/api/v1/channels/accounts').headers({ authorization: `Bearer ${validToken}` })
  assert.equal(accountRead.statusCode, 200)
  assert.equal('authRef' in (accountRead.json().data[0] as object), false)

  const viewerHeaders = { authorization: `Bearer ${viewerToken}` }
  const forbiddenRequests = [
    app.inject().get('/api/v1/channels').headers(viewerHeaders),
    app.inject().post('/api/v1/send').headers(viewerHeaders).payload({ channel: 'telegram', to: 'chat-fixture', text: 'denied' }),
    app.inject().post('/api/v1/broadcast').headers(viewerHeaders).payload({ to: 'chat-fixture', text: 'denied' }),
    app.inject().post('/api/v1/channels/telegram/start').headers(viewerHeaders),
    app.inject().post('/api/v1/channels/telegram/logout').headers(viewerHeaders),
    app.inject().get('/api/v1/conversations').headers(viewerHeaders),
    app.inject().get(`/api/v1/conversations/${conversation.id}/messages`).headers(viewerHeaders),
    app.inject().get(`/api/v1/conversations/${conversation.id}/delivery-attempts`).headers(viewerHeaders),
    app.inject().get('/api/v1/channels/accounts').headers(viewerHeaders),
  ]
  for (const request of forbiddenRequests) assert.equal((await request).statusCode, 403)
  for (const path of ['/api/v1/conversations', `/api/v1/conversations/${conversation.id}/messages`, `/api/v1/conversations/${conversation.id}/delivery-attempts`, '/api/v1/channels/accounts']) {
    assert.equal((await app.inject().get(path).headers({ 'x-skylink-key': SERVICE_KEY })).statusCode, 403)
  }
  assert.equal((await app.inject().post('/api/v1/broadcast').headers({ 'x-skylink-key': SERVICE_KEY }).payload({ to: 'chat-fixture', text: 'denied' })).statusCode, 403)
  assert.equal((await app.inject().post('/api/v1/channels/telegram/start').headers({ 'x-skylink-key': SERVICE_KEY })).statusCode, 403)

  const deniedTelegram = await app.inject({
    method: 'POST', url: '/api/v1/webhooks/telegram',
    headers: { 'content-type': 'application/json', 'x-telegram-bot-api-secret-token': 'wrong' },
    payload: '{invalid json',
  })
  assert.equal(deniedTelegram.statusCode, 401, 'webhook secret is checked before JSON parsing')

  const inboundUpdate = JSON.stringify({
    update_id: Date.now(),
    message: { from: { id: 77 }, chat: { id: 88 }, text: 'synthetic inbound body' },
  })
  const acceptedTelegram = await app.inject({
    method: 'POST', url: '/api/v1/webhooks/telegram',
    headers: { 'content-type': 'application/json', 'x-telegram-bot-api-secret-token': TELEGRAM_SECRET },
    payload: inboundUpdate,
  })
  assert.equal(acceptedTelegram.statusCode, 202)
  const inboundConversation = await findConversation(store.db, account.id, '88')
  assert.ok(inboundConversation)
  const inboundMessages = await listMessages(store.db, inboundConversation.id)
  assert.equal(inboundMessages[0]?.body, 'synthetic inbound body')
  const replayTelegram = await app.inject({
    method: 'POST', url: '/api/v1/webhooks/telegram',
    headers: { 'content-type': 'application/json', 'x-telegram-bot-api-secret-token': TELEGRAM_SECRET },
    payload: inboundUpdate,
  })
  assert.equal(replayTelegram.statusCode, 202)
  assert.equal(replayTelegram.json().data.duplicate, true)

  const serverUrl = await app.listen({ host: '127.0.0.1', port: 0 })
  const closingSocket = new WebSocket(serverUrl.replace(/^http/, 'ws') + '/ws')
  await waitForOpen(closingSocket)
  const closingSocketClosed = waitForClose(closingSocket)
  closingSocket.send(JSON.stringify({ type: 'auth', authorization: `Bearer ${closingToken}` }))
  await within(delayedAuthStarted, 'upstream authentication start')
  closingSocket.close()
  const disconnectCode = await within(closingSocketClosed, 'client disconnect during authentication')
  assert.ok(disconnectCode === 1000 || disconnectCode === 1005, `unexpected disconnect close code ${disconnectCode}`)
  assert.ok(releaseDelayedAuth)
  releaseDelayedAuth()
  await within(delayedAuthFinished, 'upstream authentication completion')
  await new Promise((resolve) => setTimeout(resolve, 50))
  assert.equal(events.listenerCount('event'), 0, 'closed clients are not subscribed after upstream auth resolves')

  const operatorSocket = new WebSocket(serverUrl.replace(/^http/, 'ws') + '/ws')
  await waitForOpen(operatorSocket)
  const firstOperatorFrame = nextFrame(operatorSocket)
  operatorSocket.send(JSON.stringify({ type: 'auth', authorization: `Bearer ${validToken}` }))
  assert.deepEqual(await firstOperatorFrame, { type: 'auth', ok: true })

  const stateFrame = nextFrame(operatorSocket)
  const start = await app.inject({
    method: 'POST', url: '/api/v1/channels/fixture/start',
    headers: { authorization: `Bearer ${validToken}` },
  })
  assert.equal(start.statusCode, 200)
  const stateEvent = await within(stateFrame, 'channel.state frame') as { type: string; channelId: string; state: string; timestamp: string }
  assert.equal(stateEvent.type, 'channel.state')
  assert.equal(stateEvent.channelId, 'fixture')
  assert.equal(stateEvent.state, 'open')
  assert.ok(stateEvent.timestamp)

  const deniedSocket = new WebSocket(serverUrl.replace(/^http/, 'ws') + '/ws')
  await waitForOpen(deniedSocket)
  const deniedAuth = nextFrame(deniedSocket)
  const deniedClosed = waitForClose(deniedSocket)
  deniedSocket.send(JSON.stringify({ type: 'auth', serviceKey: 'wrong-service-key' }))
  assert.deepEqual(await within(deniedAuth, 'unauthorized auth acknowledgement'), { type: 'auth', ok: false, error: 'unauthorized' })
  assert.equal(await within(deniedClosed, 'unauthorized socket close'), 1008)

  const qrFrame = nextFrame(operatorSocket)
  channel.emit('qr', 'synthetic-qr-payload')
  const qrEvent = await within(qrFrame, 'admin channel.qr frame') as { type: string; qr: string }
  assert.equal(qrEvent.type, 'channel.qr')
  assert.equal(qrEvent.qr, 'synthetic-qr-payload')
  const viewerSocket = new WebSocket(serverUrl.replace(/^http/, 'ws') + '/ws')
  await waitForOpen(viewerSocket)
  const viewerAuth = nextFrame(viewerSocket)
  const viewerClosed = waitForClose(viewerSocket)
  viewerSocket.send(JSON.stringify({ type: 'auth', authorization: `Bearer ${viewerToken}` }))
  assert.deepEqual(await viewerAuth, { type: 'auth', ok: false, error: 'forbidden' })
  assert.equal(await within(viewerClosed, 'non-admin WebSocket close'), 1008)
  operatorSocket.close()
})

function waitForOpen(socket: WebSocket): Promise<void> {
  return within(new Promise<void>((resolve, reject) => {
    socket.addEventListener('open', () => resolve(), { once: true })
    socket.addEventListener('error', () => reject(new Error('WebSocket failed to open')), { once: true })
  }), 'WebSocket open')
}

function nextFrame(socket: WebSocket): Promise<unknown> {
  return new Promise((resolve, reject) => {
    socket.addEventListener('message', (event) => {
      try {
        resolve(JSON.parse(String(event.data)) as unknown)
      } catch {
        reject(new Error('WebSocket sent invalid JSON'))
      }
    }, { once: true })
    socket.addEventListener('error', () => reject(new Error('WebSocket errored')), { once: true })
  })
}

function waitForClose(socket: WebSocket): Promise<number> {
  return new Promise((resolve) => {
    socket.addEventListener('close', (event) => resolve(event.code), { once: true })
  })
}

async function within<T>(promise: Promise<T>, label: string, timeoutMs = 5_000): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        timeout = setTimeout(() => reject(new Error(`Timed out waiting for ${label}`)), timeoutMs)
      }),
    ])
  } finally {
    if (timeout !== undefined) clearTimeout(timeout)
  }
}
