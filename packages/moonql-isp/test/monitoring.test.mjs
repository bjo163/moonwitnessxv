import assert from 'node:assert/strict'
import test from 'node:test'
import { monitoringUrl, probeTarget, sweepMonitorTargets } from '../dist/index.js'

/**
 * Every measure here is exercised through an injected dependency, so the suite
 * proves the polling contract without opening a socket or spawning a process.
 * The packet asks for synthetic targets precisely so no test can reach a network.
 */

const matches = (row, where) => Object.entries(where).every(([key, value]) => row[key] === value)

function fakeState(targetRows = [], incidentRows = []) {
  const state = {
    targets: targetRows.map((row, index) => ({ id: `tgt-${index + 1}`, ...row })),
    incidents: incidentRows.map((row, index) => ({ id: `inc-${index + 1}`, ...row })),
    calls: [],
    created: [],
    updated: [],
  }
  state.orm = {
    model(name) {
      assert.ok(name === 'isp_monitor_targets' || name === 'isp_incidents', `the sweep only reads ${name} if D20 owns it`)
      return {
        async list(query) {
          state.calls.push({ op: 'list', model: name, query })
          const pool = name === 'isp_monitor_targets' ? state.targets : state.incidents
          const limit = query?.limit ?? pool.length
          return pool.filter((row) => matches(row, query?.where ?? {})).slice(0, limit).map((row) => ({ ...row }))
        },
        async create(input) {
          assert.equal(name, 'isp_incidents', 'the sweep must never register a target of its own')
          const row = { id: `inc-new-${state.created.length + 1}`, ...input }
          state.created.push(row)
          state.incidents.push(row)
          return row
        },
        async update(id, patch) {
          state.updated.push({ model: name, id, patch })
          const pool = name === 'isp_monitor_targets' ? state.targets : state.incidents
          const row = pool.find((candidate) => candidate.id === id)
          if (!row) throw new Error(`missing ${name} ${id}`)
          Object.assign(row, patch)
          return row
        },
      }
    },
  }
  return state
}

const icmp = (answers, probed = []) => ({
  pingFn: async (address) => {
    probed.push(address)
    const answer = answers.get(address)
    if (answer === undefined) throw new Error(`no synthetic answer for ${address}`)
    if (answer instanceof Error) throw answer
    return answer
  },
  probed,
})

const registered = (overrides = {}) => ({
  tenantRef: 'tenant-a',
  nodeRef: 'node-a1',
  probeKind: 'icmp',
  targetRef: '10.20.0.1',
  enabled: true,
  status: 'unknown',
  checkedAt: null,
  freshnessSeconds: 120,
  ...overrides,
})

// ---------------------------------------------------------------- polling scope

test('only explicitly registered, enabled targets are polled', async () => {
  const live = fakeState([registered(), { ...registered(), targetRef: '10.20.0.9', enabled: false }])
  const { pingFn, probed } = icmp(new Map([['10.20.0.1', true]]))

  const summary = await sweepMonitorTargets(live.orm, { pingFn })

  assert.equal(summary.probed, 1, 'the paused target is not attempted')
  assert.deepEqual(probed, ['10.20.0.1'], 'nothing outside the registered set was touched')
  const targetLists = live.calls.filter((call) => call.model === 'isp_monitor_targets')
  assert.equal(targetLists.length, 1, 'one sweep reads the target table once')
  assert.deepEqual(targetLists[0].query.where, { enabled: true }, 'paused targets are filtered where the query is made')
  assert.ok(targetLists[0].query.limit <= 200, 'a sweep is capped, so a lost table cannot become a scanning storm')
})

test('a paused target keeps its last measurement instead of being rewritten', async () => {
  const state = fakeState([registered({ enabled: false, status: 'healthy', checkedAt: '2026-01-01T00:00:00.000Z' })])
  const { pingFn } = icmp(new Map())

  const summary = await sweepMonitorTargets(state.orm, { pingFn })

  assert.deepEqual(summary, { probed: 0, opened: 0, resolved: 0, deferred: 0 })
  assert.equal(state.targets[0].status, 'healthy')
  assert.equal(state.targets[0].checkedAt, '2026-01-01T00:00:00.000Z')
  assert.equal(state.updated.length, 0)
})

// ---------------------------------------------------------------- tenant isolation

test('incidents are opened inside the tenant and node the target belongs to', async () => {
  const state = fakeState([
    registered({ tenantRef: 'tenant-a', nodeRef: 'node-a1', targetRef: '10.20.0.1' }),
    registered({ tenantRef: 'tenant-b', nodeRef: 'node-b1', targetRef: '10.30.0.1' }),
  ])
  const { pingFn, probed } = icmp(new Map([['10.20.0.1', false], ['10.30.0.1', false]]))

  const summary = await sweepMonitorTargets(state.orm, { pingFn })

  assert.equal(summary.opened, 2)
  assert.deepEqual(
    state.created.map((row) => [row.tenantRef, row.nodeRef, row.severity]),
    [['tenant-a', 'node-a1', 'critical'], ['tenant-b', 'node-b1', 'critical']],
    'each tenant gets its own incident record',
  )
  assert.deepEqual(probed.sort(), ['10.20.0.1', '10.30.0.1'])
})

test('a healthy tenant never resolves another tenant or another node incident', async () => {
  const state = fakeState(
    [registered({ tenantRef: 'tenant-a', nodeRef: 'node-a1', targetRef: '10.20.0.1' })],
    [
      { tenantRef: 'tenant-b', nodeRef: 'node-b1', status: 'open', severity: 'critical', notifyState: 'pending' },
      { tenantRef: 'tenant-a', nodeRef: 'node-a2', status: 'open', severity: 'critical', notifyState: 'pending' },
    ],
  )
  const { pingFn } = icmp(new Map([['10.20.0.1', true]]))

  const summary = await sweepMonitorTargets(state.orm, { pingFn })

  assert.equal(summary.resolved, 0)
  assert.deepEqual(state.incidents.map((row) => row.status), ['open', 'open'])
  const openLookups = state.calls.filter((call) => call.model === 'isp_incidents')
  assert.deepEqual(openLookups.map((call) => call.query.where), [{ tenantRef: 'tenant-a', nodeRef: 'node-a1', status: 'open' }])
})

test('an existing open incident is not opened twice, and health resolves exactly it', async () => {
  const state = fakeState(
    [registered()],
    [{ tenantRef: 'tenant-a', nodeRef: 'node-a1', status: 'open', severity: 'critical', notifyState: 'pending' }],
  )
  const down = await sweepMonitorTargets(state.orm, { pingFn: async () => false })
  assert.deepEqual(down, { probed: 1, opened: 0, resolved: 0, deferred: 0 }, 'the outage is already on the books')
  assert.equal(state.incidents.length, 1)

  const up = await sweepMonitorTargets(state.orm, { pingFn: async () => true })
  assert.deepEqual(up, { probed: 1, opened: 0, resolved: 1, deferred: 0 })
  assert.equal(state.incidents[0].status, 'resolved')
  assert.ok(typeof state.incidents[0].resolvedAt === 'string')

  const again = await sweepMonitorTargets(state.orm, { pingFn: async () => true })
  assert.equal(again.resolved, 0, 'a resolved incident is not resolved a second time')
})

// ---------------------------------------------------------------- measures

test('degraded opens a major incident and unreachable opens a critical one', async () => {
  const icmpState = fakeState([registered()])
  const down = await sweepMonitorTargets(icmpState.orm, { pingFn: async () => false })
  assert.equal(down.opened, 1)
  assert.equal(icmpState.created[0].severity, 'critical')

  const httpState = fakeState([registered({ probeKind: 'http-read', targetRef: '10.20.0.5' })])
  const sick = await sweepMonitorTargets(httpState.orm, { fetchFn: async () => ({ status: 503 }) })
  assert.equal(sick.opened, 1)
  assert.equal(httpState.created[0].severity, 'major')
  assert.equal(httpState.created[0].summary, 'http-read probe of 10.20.0.5: HTTP 503 from http://10.20.0.5')
})

test('an unknown measurement records freshness but never pages anyone', async () => {
  const state = fakeState([registered({ probeKind: 'snmp-read' })])

  const summary = await sweepMonitorTargets(state.orm, {})

  assert.deepEqual(summary, { probed: 1, opened: 0, resolved: 0, deferred: 0 })
  assert.equal(state.targets[0].status, 'unknown', 'an absent measurement is shown as absent')
  assert.ok(typeof state.targets[0].checkedAt === 'string', 'freshness is reported independently of incident state')
  assert.equal(state.incidents.length, 0, 'this runtime lacking an SNMP credential source is not an outage')
})

test('the sweep defers what its budget did not reach and says so', async () => {
  const state = fakeState([registered({ targetRef: '10.20.0.1' }), registered({ targetRef: '10.20.0.2', nodeRef: 'node-a2' })])
  let clock = 0
  const now = () => {
    const current = clock
    clock += 60
    return current
  }
  const { pingFn, probed } = icmp(new Map([['10.20.0.1', true], ['10.20.0.2', true]]))

  const summary = await sweepMonitorTargets(state.orm, { pingFn, now, budgetMs: 100 })

  assert.equal(summary.probed, 1)
  assert.equal(summary.deferred, 1, 'the unattempted target is reported, not silently skipped')
  assert.deepEqual(probed, ['10.20.0.1'])
  assert.equal(state.targets[1].status, 'unknown', 'a deferred target keeps its previous measurement')
})

// ---------------------------------------------------------------- probe plumbing

test('http-read separates a sick service from silence', async () => {
  const answers = new Map([['http://10.0.0.1', 200], ['http://10.0.0.2', 503], ['http://10.0.0.3', 302]])
  const seen = []
  const deps = {
    fetchFn: async (url) => {
      seen.push(url)
      if (url === 'http://10.0.0.4') throw new Error('ECONNREFUSED')
      return { status: answers.get(url) }
    },
  }

  assert.equal((await probeTarget('http-read', '10.0.0.1', deps)).measure, 'healthy')
  assert.equal((await probeTarget('http-read', '10.0.0.2', deps)).measure, 'degraded')
  assert.equal(
    (await probeTarget('http-read', '10.0.0.3', deps)).measure,
    'degraded',
    'a redirect is an answer, and the registered address is not allowed to walk the probe elsewhere',
  )
  const silent = await probeTarget('http-read', '10.0.0.4', deps)
  assert.equal(silent.measure, 'unreachable')
  assert.match(silent.detail, /did not answer/)
  assert.deepEqual(seen, ['http://10.0.0.1', 'http://10.0.0.2', 'http://10.0.0.3', 'http://10.0.0.4'])
})

test('icmp refuses anything that is not an IP literal and reports a missing helper', async () => {
  const hostname = await probeTarget('icmp', 'core-sw-1.example.internal', { pingFn: async () => true })
  assert.equal(hostname.measure, 'unknown')
  assert.match(hostname.detail, /IP literal/)

  const noHelper = await probeTarget('icmp', '10.0.0.1', { pingFn: async () => { throw new Error('ping: command not found') } })
  assert.equal(noHelper.measure, 'unknown', 'a runtime without an ICMP helper is not a dead node')
  assert.match(noHelper.detail, /no ICMP helper/)

  assert.equal((await probeTarget('icmp', '10.0.0.1', { pingFn: async () => false })).measure, 'unreachable')
})

test('snmp-read reports itself unsupported while D20 holds no device credential', async () => {
  const outcome = await probeTarget('snmp-read', '10.0.0.1')
  assert.equal(outcome.measure, 'unknown')
  assert.match(outcome.detail, /no credential source/)
  assert.match(outcome.detail, /was not probed/)
})

test('an unregistered probe kind is unknown rather than a verdict', async () => {
  const outcome = await probeTarget('ssh-read', '10.0.0.1', { pingFn: async () => true })
  assert.equal(outcome.measure, 'unknown')
  assert.match(outcome.detail, /no measure registered/)
})

test('monitoringUrl brackets IPv6 and refuses addresses the measure cannot express', () => {
  assert.equal(monitoringUrl('2001:db8::1'), 'http://[2001:db8::1]')
  assert.equal(monitoringUrl('2001:db8::1/api/status'), 'http://[2001:db8::1]/api/status')
  assert.equal(monitoringUrl(' 10.0.0.1:8080 '), 'http://10.0.0.1:8080')
  assert.equal(monitoringUrl('10.0.0.1/status'), 'http://10.0.0.1/status')
  assert.equal(monitoringUrl('http://10.0.0.1:9080/status'), 'http://10.0.0.1:9080/status')
  assert.equal(monitoringUrl('https://[2001:db8::1]:8443/health'), 'https://[2001:db8::1]:8443/health')
  assert.equal(monitoringUrl('   '), null)
  assert.equal(monitoringUrl('/status'), null, 'a path with no host is not a target')
  assert.equal(monitoringUrl('snmp://10.0.0.1'), null, 'only http(s) is ever fetched')
  assert.equal(monitoringUrl('10.0.0.1:notaport'), null, 'a colon that is not a port is not a target either')
  assert.equal(monitoringUrl('10.0.0.1:0'), null)
  assert.equal(monitoringUrl('http://'), null)
})

test('http-read aims a registered management name at itself and reports a bad address as unknown', async () => {
  const seen = []
  const deps = {
    fetchFn: async (url) => {
      seen.push(url)
      return { status: 200 }
    },
  }
  const named = await probeTarget('http-read', 'ollink.example.internal:8080/health', deps)
  assert.equal(named.measure, 'healthy')
  assert.deepEqual(seen, ['http://ollink.example.internal:8080/health'])

  const misstored = await probeTarget('http-read', 'snmp://10.0.0.1', deps)
  assert.equal(misstored.measure, 'unknown', 'a data-entry mistake is not an outage')
  assert.equal(seen.length, 1, 'nothing was fetched for the address it could not express')
})
