import assert from 'node:assert/strict'
import test from 'node:test'
import { SERVICE_CAPABILITIES, models } from '../src/models.ts'

const entries = Object.entries(models)

test('every D20 model is private to ARSY and ships no seeded rows', () => {
  assert.ok(entries.length >= 14, 'the D20 registry declares organization, RADIUS, NAS, session and monitor records')
  for (const [name, model] of entries) {
    assert.equal(name.startsWith('isp_'), true, `${name} stays inside the D20 prefix`)
    assert.equal(model.rest, false, `${name} must not be reachable through generic auto-REST`)
    assert.equal(model.seedless, true, `${name} ships no production rows`)
    assert.ok('tenantRef' in model.fields || name === 'isp_tenants', `${name} is tenant-scoped or is the tenant itself`)
  }
})

test('exactly the credential, NAS secret reference and syslog text fields are private', () => {
  const privates = entries
    .flatMap(([name, model]) => Object.entries(model.fields)
      .filter(([, field]) => field.private === true)
      .map(([field]) => `${name}.${field}`))
    .sort()
  assert.deepEqual(privates, [
    'isp_nas.secretRef',
    'isp_radius_users.credentialHash',
    'isp_syslog_events.message',
  ])
})

test('D20 declares no customer, invoice, payment or billing row of its own', () => {
  const forbidden = /invoice|payment|customer|billing|tariff|price|amount/i
  for (const [name, model] of entries) {
    for (const field of Object.keys(model.fields)) {
      assert.equal(forbidden.test(field), false, `${name}.${field} would copy a D15/D16 record into D20`)
    }
    if ('subscriptionRef' in model.fields) {
      assert.equal(model.fields.subscriptionRef.kind, 'str', 'the subscription stays an opaque D15 reference')
    }
  }
})

test('the service capability set matches the documented isp-radius route family', () => {
  assert.deepEqual([...SERVICE_CAPABILITIES], [
    'radius.resolve',
    'radius.authorize',
    'radius.accounting',
    'radius.session-action',
  ])
})

test('unique keys keep tenant scope inside every identity', () => {
  const tenantScoped = ['isp_radius_profiles', 'isp_radius_users', 'isp_nas', 'isp_network_nodes', 'isp_ipam_pools', 'isp_sessions', 'isp_session_actions']
  for (const name of tenantScoped) {
    const unique = models[name].unique ?? []
    assert.ok(unique.some((pair) => pair.includes('tenantRef')), `${name} cannot collide across tenants`)
  }
  assert.deepEqual(models.isp_accounting_events.unique, [['eventKey']], 'accounting idempotency is a global key')
})

test('only machine telemetry tables opt out of the ops audit trail', () => {
  const telemetry = entries.filter(([, model]) => model.audit === false).map(([name]) => name).sort()
  assert.deepEqual(telemetry, ['isp_accounting_events', 'isp_monitor_targets', 'isp_sessions', 'isp_syslog_events'])
  for (const [name, model] of entries) {
    assert.equal(model.audit === false || model.audit === true, true, `${name} states its audit preference explicitly`)
  }
})
