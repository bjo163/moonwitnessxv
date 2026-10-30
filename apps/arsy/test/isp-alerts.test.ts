import assert from 'node:assert/strict'
import test from 'node:test'
import type { ModelRepo } from '@moonwitness/moonql'
import { loadConfig } from '../src/config.js'
import { buildApp } from '../src/app.js'
import { withTestAdmin } from './helpers/auth.js'
import {
  ALERT_DESTINATION_SETTING,
  FALLBACK_DESTINATION_SETTING,
  MAX_ALERT_ATTEMPTS,
  deliverIncidentAlert,
  pendingAlertIds,
} from '../src/lib/isp-alerts.js'
import type { AlertChannelResult, AlertDeps } from '../src/lib/isp-alerts.js'
import type { Channel, SendInput, SendResult } from '../src/lib/channels.js'

/**
 * M51-07 — the D18 leg of ISP alerting, tested against a fake messenger.
 *
 * Real provider delivery is still gated by M38, so nothing here may depend on a
 * chat network: the service answers with the shapes the contract actually defines
 * (`accepted`, or a refusal naming the channel) and the assertions are made
 * against what the incident row recorded afterwards.
 */

interface FakeRow extends Record<string, unknown> {
  id: string
}

const incidentRow = (overrides: Partial<FakeRow> = {}): FakeRow => ({
  id: 'inc-1',
  tenantRef: 'tenant-a',
  nodeRef: 'node-a1',
  severity: 'critical',
  status: 'open',
  summary: 'icmp probe of 10.20.0.1: 10.20.0.1 did not answer ICMP within 3000ms',
  openedAt: '2026-10-30T00:00:00.000Z',
  notifyState: 'pending',
  notifyAttempts: 0,
  notifiedAt: null,
  notifyDetail: null,
  ...overrides,
})

const matches = (row: FakeRow, where: Record<string, unknown>): boolean =>
  Object.entries(where).every(([key, value]) => row[key] === value)

function fakeRepo<T extends FakeRow>(name: string, rows: T[]) {
  const store = rows.map((row) => ({ ...row }))
  let next = store.length
  const calls: Array<{ op: string; detail: unknown }> = []
  return {
    rows: store,
    calls,
    async list(query: { where?: Record<string, unknown>; limit?: number } = {}) {
      calls.push({ op: 'list', detail: query })
      const limit = query.limit ?? store.length
      return store.filter((row) => matches(row, query.where ?? {})).slice(0, limit)
    },
    async create(input: Record<string, unknown>) {
      calls.push({ op: 'create', detail: input })
      const row = { id: `${name}-${++next}`, ...input } as T
      store.push(row)
      return row
    },
    async update(id: string, patch: Record<string, unknown>) {
      calls.push({ op: 'update', detail: { id, patch } })
      const row = store.find((candidate) => candidate.id === id)
      if (!row) throw new Error(`missing ${name} ${id}`)
      Object.assign(row, patch)
      return row
    },
  }
}

type FakeRepo = ReturnType<typeof fakeRepo>
type OrmArg = Parameters<typeof deliverIncidentAlert>[0]

function harness(options: {
  incidents?: FakeRow[]
  settings?: Record<string, string>
  tenants?: FakeRow[]
  results?: AlertChannelResult[]
  now?: () => number
} = {}) {
  const settings = fakeRepo('settings_entries', Object.entries(options.settings ?? {}).map(([key, value], index) => ({
    id: `set-${index + 1}`,
    key,
    value,
  })))
  const tenants = fakeRepo('isp_tenants', options.tenants ?? [{ id: 'tenant-a', name: 'Alpha Networks' }])
  const incidents = fakeRepo('isp_incidents', options.incidents ?? [incidentRow()])
  const sent: Array<{ to: string; text: string }> = []
  const warnings: string[] = []
  const orm = {
    model(name: string): ModelRepo {
      if (name === 'settings_entries') return settings as unknown as ModelRepo
      if (name === 'isp_tenants') return tenants as unknown as ModelRepo
      throw new Error(`the alert leg has no reason to read ${name}`)
    },
  } as unknown as OrmArg
  const deps: AlertDeps = {
    broadcast: async (input) => {
      sent.push(input)
      return options.results ?? [{ channel: 'skylink-telegram', ok: true }]
    },
    now: options.now ?? (() => Date.parse('2026-10-30T00:05:00.000Z')),
    warn: (message) => warnings.push(message),
  }
  const repo = incidents as unknown as ModelRepo
  return { orm, incidents, repo, sent, warnings, deps }
}

const patched = (incidents: FakeRepo): Record<string, unknown> => {
  const update = incidents.calls.filter((call) => call.op === 'update').at(-1)
  return { ...(update?.detail as { patch: Record<string, unknown> })?.patch }
}

const both = { [ALERT_DESTINATION_SETTING]: 'ops-oncall', [FALLBACK_DESTINATION_SETTING]: '' }

// ------------------------------------------------------------ accepted / refused

void test('a delivered alert marks the incident notified once and carries the tenant name', async () => {
  const h = harness({ settings: both })

  assert.equal(await deliverIncidentAlert(h.orm, h.repo, 'inc-1', h.deps), 'sent')
  assert.equal(h.sent.length, 1, 'one incident, one message')
  assert.equal(h.sent[0]?.to, 'ops-oncall')
  assert.equal(h.sent[0]?.text, '[ISP critical] Alpha Networks: icmp probe of 10.20.0.1: 10.20.0.1 did not answer ICMP within 3000ms')

  const row = h.incidents.rows[0]
  assert.equal(row?.notifyState, 'sent')
  assert.equal(row?.notifyAttempts, 1)
  assert.equal(row?.notifiedAt, '2026-10-30T00:05:00.000Z')
  assert.equal(row?.notifyDetail, 'sent to ops-oncall')
})

void test('a refusal is retried and the attempts are capped', async () => {
  const refused: AlertChannelResult[] = [
    { channel: 'skylink-telegram', ok: false, error: 'delivery_failed' },
    { channel: 'skylink-whatsapp', ok: false, error: 'channel_account_unavailable' },
  ]
  const h = harness({ settings: both, results: refused })

  for (const [attempt, expected] of [[1, 'retry'], [2, 'retry'], [3, 'exhausted']] as const) {
    assert.equal(await deliverIncidentAlert(h.orm, h.repo, 'inc-1', h.deps), expected, `attempt ${attempt}`)
    assert.equal(h.incidents.rows[0]?.notifyAttempts, attempt)
  }

  assert.equal(h.sent.length, MAX_ALERT_ATTEMPTS, 'the messenger was asked exactly the capped number of times')
  assert.equal(h.incidents.rows[0]?.notifyState, 'failed')
  const detail = String(h.incidents.rows[0]?.notifyDetail)
  assert.match(detail, /skylink-telegram: delivery_failed/)
  assert.match(detail, /skylink-whatsapp: channel_account_unavailable/)

  assert.equal(await deliverIncidentAlert(h.orm, h.repo, 'inc-1', h.deps), 'pending')
  assert.equal(h.sent.length, MAX_ALERT_ATTEMPTS, 'an exhausted incident is never sent a fourth time')
})

void test('one channel answering is enough', async () => {
  const h = harness({
    settings: both,
    results: [
      { channel: 'skylink-telegram', ok: false, error: 'delivery_failed' },
      { channel: 'skylink-whatsapp', ok: true },
    ],
  })

  assert.equal(await deliverIncidentAlert(h.orm, h.repo, 'inc-1', h.deps), 'sent')
  assert.equal(patched(h.incidents).notifyDetail, 'sent to ops-oncall')
})

void test('the retry sweep revisits only a row still owed on an incident still open', async () => {
  const h = harness({
    incidents: [
      incidentRow(),
      incidentRow({ id: 'inc-2', notifyState: 'sent' }),
      incidentRow({ id: 'inc-3', notifyState: 'pending', status: 'resolved' }),
      incidentRow({ id: 'inc-4', notifyState: 'failed' }),
    ],
  })

  assert.deepEqual(await pendingAlertIds(h.repo), ['inc-1'])
})

// ------------------------------------------------------------ configuration gaps

void test('an unconfigured destination leaves the alert owed without burning an attempt', async () => {
  const h = harness({ settings: { [ALERT_DESTINATION_SETTING]: '', [FALLBACK_DESTINATION_SETTING]: '' } })

  assert.equal(await deliverIncidentAlert(h.orm, h.repo, 'inc-1', h.deps), 'pending')
  assert.equal(h.sent.length, 0, 'nothing is sent anywhere')
  assert.equal(h.incidents.rows[0]?.notifyAttempts, 0, 'a missing destination is not a delivery failure')
  assert.equal(h.incidents.rows[0]?.notifyState, 'pending')
  assert.match(h.warnings.join(' '), /no alert destination/)
})

void test('the announce destination is used when the ISP one does not exist', async () => {
  const h = harness({ settings: { [FALLBACK_DESTINATION_SETTING]: 'studio-control' } })

  assert.equal(await deliverIncidentAlert(h.orm, h.repo, 'inc-1', h.deps), 'sent')
  assert.equal(h.sent[0]?.to, 'studio-control', 'an operator who configured only the desk still gets paged')
})

void test('a row already notified is never sent twice', async () => {
  const h = harness({ settings: both, incidents: [incidentRow({ notifyState: 'sent' })] })

  assert.equal(await deliverIncidentAlert(h.orm, h.repo, 'inc-1', h.deps), 'pending')
  assert.equal(h.sent.length, 0)

  assert.equal(await deliverIncidentAlert(h.orm, h.repo, 'inc-missing', h.deps), 'unknown-incident')
  assert.equal(h.sent.length, 0, 'a bus event naming a deleted row sends nothing')
})

// ------------------------------------------------------------ the consumer wiring

function stubChannel(results: AlertChannelResult[], sent: Array<{ to: string; text: string }>): Channel {
  return {
    id: 'stub',
    label: 'Stub channel',
    status: () => ({ state: 'open' }),
    async send(input: SendInput): Promise<SendResult> {
      sent.push({ to: input.to, text: input.text })
      const refused = results.some((result) => !result.ok)
      return refused
        ? { channel: 'stub', to: input.to, ok: false, error: 'delivery_failed' }
        : { channel: 'stub', to: input.to, ok: true }
    },
  }
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 150))

async function appWith(results: AlertChannelResult[], sent: Array<{ to: string; text: string }>) {
  withTestAdmin()
  const config = loadConfig()
  config.logLevel = 'silent'
  config.channels.whatsapp.enabled = false
  const app = await buildApp(config)
  app.channels.register(stubChannel(results, sent))
  const settings = app.moonql.model('settings_entries')
  const row = (await settings.list({ where: { key: ALERT_DESTINATION_SETTING }, limit: 1 }))[0]
  if (row) await settings.update(String(row.id), { value: 'ops-oncall' })
  else await settings.create({ key: ALERT_DESTINATION_SETTING, group: 'system', value: 'ops-oncall' })
  return app
}

void test('an incident written by the monitoring sweep reaches the alert leg once', async (t) => {
  const sent: Array<{ to: string; text: string }> = []
  const app = await appWith([{ channel: 'stub', ok: true }], sent)
  t.after(() => app.close())

  const incidents = app.moonql.model('isp_incidents')
  const created = await incidents.create({
    tenantRef: 'tenant-a',
    nodeRef: 'node-a1',
    severity: 'critical',
    status: 'open',
    summary: 'icmp probe of 10.20.0.1 did not answer',
    openedAt: new Date().toISOString(),
    notifyState: 'pending',
  })
  await settle()

  assert.equal(sent.length, 1, 'the bus event and the retry sweep cannot both page the operator for one incident')
  assert.match(sent[0]?.text ?? '', /\[ISP critical\]/)
  const row = await incidents.get(String(created.id))
  assert.equal(row.notifyState, 'sent')
  assert.equal(row.notifyAttempts, 1)
})

void test('a refused messenger leaves the incident owed on the row, not in memory', async (t) => {
  const sent: Array<{ to: string; text: string }> = []
  const app = await appWith([{ channel: 'stub', ok: false, error: 'delivery_failed' }], sent)
  t.after(() => app.close())

  const incidents = app.moonql.model('isp_incidents')
  const created = await incidents.create({
    tenantRef: 'tenant-b',
    nodeRef: 'node-b1',
    severity: 'major',
    status: 'open',
    summary: 'http-read probe of 10.30.0.5 answered 503',
    openedAt: new Date().toISOString(),
    notifyState: 'pending',
  })
  await settle()

  const row = await incidents.get(String(created.id))
  assert.equal(sent.length, 1)
  assert.equal(row.notifyState, 'pending', 'a messenger that is down is not a notified operator')
  assert.equal(row.notifyAttempts, 1)
  assert.match(String(row.notifyDetail), /delivery_failed/)

  // The state lives on the row, so a consumer that comes back can pick it up again.
  assert.deepEqual(await pendingAlertIds(incidents as unknown as ModelRepo), [String(created.id)])
})
