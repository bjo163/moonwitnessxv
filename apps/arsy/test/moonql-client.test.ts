import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify, { type FastifyInstance } from 'fastify'
import { bootMoonQl, moonqlRest, type AnyAddon } from '@moonwitness/moonql'
import { createMoonClient, displayLabel, MoonApiError } from '@moonwitness/moonql-client'
import base from '@moonwitness/moonql-base'
import stations from '@moonwitness/moonql-stations'
import schedule from '@moonwitness/moonql-schedule'
import auth from '@moonwitness/moonql-auth'
import envelope from '../src/plugins/envelope.js'
import { TEST_ADMIN_PASSWORD } from './helpers/auth.js'

async function makeApp(addons: AnyAddon[]) {
  const app = Fastify({ logger: false })
  const moonql = await bootMoonQl({
    addons,
    seedPolicy: 'off',
    env: { MOONQL_AUTH_ADMIN_PASSWORD: TEST_ADMIN_PASSWORD },
    log: { info: () => {}, warn: () => {} },
  })
  await app.register(envelope)
  await app.register(moonqlRest, { prefix: '/orm', instance: moonql, introspectionAcl: 'public' })
  await app.ready()
  return { app, moonql }
}

/** the SDK only needs `fetch`: bridge it to Fastify's inject */
const injectFetch = (app: FastifyInstance): typeof fetch =>
  (async (input: unknown, init?: RequestInit) => {
    const url = new URL(String(input))
    const res = await app.inject({
      method: (init?.method ?? 'GET') as 'GET',
      url: url.pathname + url.search,
      headers: init?.headers as Record<string, string>,
      payload: typeof init?.body === 'string' ? init.body : undefined,
    })
    const headers: Record<string, string> = {}
    for (const [key, value] of Object.entries(res.headers)) headers[key] = String(value)
    return new Response(res.statusCode === 204 ? null : res.body, { status: res.statusCode, headers })
  }) as unknown as typeof fetch

const clientFor = (app: FastifyInstance) =>
  createMoonClient({ baseUrl: 'http://moon.local/orm', fetch: injectFetch(app) })

test('client: list with where + expand + total (one request, joined rows)', async (t) => {
  const { app } = await makeApp([base, stations])
  t.after(() => app.close())
  const client = clientFor(app)

  const page = await client.model('stations').list({ where: { genre: 'news' }, expand: ['countryRef'], total: true })
  assert.equal(page.rows.length, 10)
  assert.equal(page.total, 10)
  assert.ok(page.rows.every((row) => row.countryRefRecord?.code))
})

test('client: a missing row maps to MoonApiError with the API message', async (t) => {
  const { app } = await makeApp([base, stations])
  t.after(() => app.close())
  const client = clientFor(app)

  await assert.rejects(
    () => client.model('stations').get('11111111-1111-4111-8111-111111111111'),
    (err: unknown) => err instanceof MoonApiError && err.statusCode === 404 && err.message === 'Station not found',
  )
})

test('client: view read returns the projected rows', async (t) => {
  const { app } = await makeApp([base, stations, schedule])
  t.after(() => app.close())
  const client = clientFor(app)

  const page = await client.view('nowPlaying').read()
  assert.ok(page.rows.length >= 1, 'the demo grid is never empty')
  assert.equal(typeof page.rows[0]!.title, 'string')
})

test('client: create/update/remove round-trip (as admin)', async (t) => {
  const { app } = await makeApp([base, auth, stations])
  t.after(() => app.close())

  const login = await app.inject().post('/orm/auth/login').body({ login: 'admin', password: TEST_ADMIN_PASSWORD }).end()
  assert.equal(login.statusCode, 200)
  const client = createMoonClient({
    baseUrl: 'http://moon.local/orm',
    fetch: injectFetch(app),
    token: login.json().data.token as string,
  })

  const created = await client.model('stations').create({ name: 'SDK Station', streamUrl: 'https://example.org/sdk.mp3' })
  assert.ok(created.id)
  assert.equal(created.statusLabel, 'live')

  const updated = await client.model('stations').update(created.id, { active: false })
  assert.equal(updated.active, false)
  assert.equal(updated.statusLabel, 'off')

  await client.model('stations').remove(created.id)
  await assert.rejects(
    () => client.model('stations').get(created.id),
    (err: unknown) => err instanceof MoonApiError && err.statusCode === 404,
  )
})

test('client: schema() exposes field constraints and the menu', async (t) => {
  const { app } = await makeApp([base, stations])
  t.after(() => app.close())
  const client = clientFor(app)

  const doc = await client.schema()
  assert.equal(doc.models.stations!.fields.name!.maxLength, 120)
  assert.ok(doc.menu.length > 0, 'every feature addon contributes navigation entries')
  assert.ok(doc.menu.every((item) => typeof item.kind === 'string' && typeof item.route === 'string'))
})

test('displayLabel: name > code > id', () => {
  assert.equal(displayLabel({ id: 'x', code: 'JP', name: 'Japan' }), 'Japan')
  assert.equal(displayLabel({ id: 'x', code: 'JP' }), 'JP')
  assert.equal(displayLabel({ id: 'x' }), 'x')
  assert.equal(displayLabel(null), '')
})
