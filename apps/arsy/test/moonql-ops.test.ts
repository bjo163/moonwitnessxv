import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify, { type FastifyInstance } from 'fastify'
import { bootMoonQl, moonqlRest } from '@moonwitness/moonql'
import base from '@moonwitness/moonql-base'
import auth from '@moonwitness/moonql-auth'
import stations from '@moonwitness/moonql-stations'
import ops from '@moonwitness/moonql-ops'
import envelope from '../src/plugins/envelope.js'

const ADMIN_PASSWORD = 'ops-admin-pass'

async function makeApp() {
  const app = Fastify({ logger: false })
  const moonql = await bootMoonQl({
    addons: [base, auth, stations, ops],
    seedPolicy: 'off',
    env: { MOONQL_AUTH_ADMIN_PASSWORD: ADMIN_PASSWORD },
    log: { info: () => {}, warn: () => {} },
  })
  await app.register(envelope)
  await app.register(moonqlRest, { prefix: '/orm', instance: moonql })
  await app.ready()

  const login = await app.inject().post('/orm/auth/login').body({ login: 'admin', password: ADMIN_PASSWORD }).end()
  const token = login.json().data.token as string
  const headers = { authorization: `Bearer ${token}` }
  return { app, moonql, token, headers }
}

async function waitFor(condition: () => Promise<boolean>, label: string, timeoutMs = 1500): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await condition()) return
    await new Promise((resolve) => setTimeout(resolve, 20))
  }
  throw new Error(`timed out waiting for ${label}`)
}

const auditRows = async (app: FastifyInstance, headers: Record<string, string>) =>
  (await app.inject().get('/orm/ops_audit?limit=50&order=-createdAt').headers(headers).end()).json().data as Array<Record<string, unknown>>

test('ops: every write becomes an audit entry with the right action', async (t) => {
  const { app, headers } = await makeApp()
  t.after(() => app.close())

  const created = await app.inject().post('/orm/stations').headers(headers).body({ name: 'Audited FM', streamUrl: 'https://example.org/a.mp3' }).end()
  assert.equal(created.statusCode, 201)
  const id = created.json().data.id as string

  await app.inject().patch(`/orm/stations/${id}`).headers(headers).body({ genre: 'jazz' }).end()
  await app.inject().delete(`/orm/stations/${id}`).headers(headers).end()

  await waitFor(async () => (await auditRows(app, headers)).length >= 3, 'three audit rows')

  const rows = await auditRows(app, headers)
  const actions = rows.map((row) => row.action)
  assert.ok(actions.includes('create') && actions.includes('update') && actions.includes('delete'))
  const create = rows.find((row) => row.action === 'create' && row.model === 'stations')!
  assert.equal(create.recordId, id)
  assert.match(String(create.summary), /name/)
})

test('ops: the audit trail never audits itself (feedback guard)', async (t) => {
  const { app, headers } = await makeApp()
  t.after(() => app.close())

  await app.inject().post('/orm/stations').body({ name: 'Guarded FM', streamUrl: 'https://example.org/g.mp3' }).end()
  await waitFor(async () => (await auditRows(app, headers)).length >= 1, 'one audit row')

  const rows = await auditRows(app, headers)
  assert.ok(rows.every((row) => !String(row.model).startsWith('ops_')), 'ops_* writes are excluded')
})

test('ops: dashboard aggregates counts, tiers, addons, bus events and crons', async (t) => {
  const { app, headers } = await makeApp()
  t.after(() => app.close())

  const res = await app.inject().get('/orm/ops/dashboard').headers(headers).end()
  assert.equal(res.statusCode, 200)
  const body = res.json().data

  assert.equal(body.engine, 'memory')
  assert.equal(body.minDemoRows, 10)
  assert.equal(body.busEvents.length, 6)
  assert.ok(body.addons.some((a: { name: string }) => a.name === 'ops'))
  assert.ok(body.crons.some((c: { addon: string; name: string }) => c.addon === 'ops' && c.name === 'purge-audit'))

  const byName = new Map((body.models as Array<Record<string, unknown>>).map((m) => [m.name, m]))
  assert.equal((byName.get('stations') as Record<string, unknown>).count, 36)
  assert.equal((byName.get('stations') as Record<string, unknown>).dataTier, 'demo')
  assert.equal((byName.get('countries') as Record<string, unknown>).count, 248)
  assert.equal((byName.get('countries') as Record<string, unknown>).dataTier, 'reference')
  assert.ok(Array.isArray(body.audit))
  assert.ok(Array.isArray(body.jobs))
})

test('ops: the dashboard is admin-only', async (t) => {
  const { app } = await makeApp()
  t.after(() => app.close())

  const anon = await app.inject().get('/orm/ops/dashboard').end()
  assert.equal(anon.statusCode, 401)
})

test('ops: the live stream delivers a real write as one SSE frame', async (t) => {
  const { app, headers } = await makeApp()
  t.after(() => app.close())

  const streamPromise = app.inject().get('/orm/ops/stream?limit=1&seconds=5').headers(headers).end()
  await new Promise((resolve) => setTimeout(resolve, 60)) // subscriber attached

  await app.inject().post('/orm/stations').headers(headers).body({ name: 'Streamed FM', streamUrl: 'https://example.org/s.mp3' }).end()

  const res = await streamPromise
  assert.equal(res.statusCode, 200)
  assert.match(String(res.headers['content-type']), /text\/event-stream/)

  const frames = res.body.split('\n\n').filter((chunk) => chunk.startsWith('data: '))
  assert.equal(frames.length, 1)
  const event = JSON.parse(frames[0]!.slice('data: '.length))
  assert.equal(event.type, 'bus')
  assert.equal(event.event, 'model.created')
  assert.equal(event.payload.model, 'stations')
})

test('ops: crons and the stream endpoint are part of the metadata contract', async (t) => {
  const { app, headers, moonql } = await makeApp()
  t.after(() => app.close())

  const anon = await app.inject().get('/orm/_schema').end()
  assert.equal(anon.statusCode, 401, 'introspection stays gated by default')

  const doc = (await app.inject().get('/orm/_schema').headers(headers).end()).json().data
  assert.ok(doc.crons.some((c: { addon: string; name: string; every: string }) => c.addon === 'ops' && c.name === 'purge-audit' && c.every === '1d'))

  const stream = (doc.endpoints as Array<Record<string, unknown>>).find((e) => e.path === '/ops/stream')!
  assert.equal(stream.stream, true)
  assert.deepEqual(stream.acl, ['admin'])
  assert.equal(moonql.bus.events.length, 6)
})
