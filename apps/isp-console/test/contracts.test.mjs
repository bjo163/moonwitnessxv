import assert from 'node:assert/strict'
import { test } from 'node:test'
import { allowedIspPath } from '../src/lib/bff-policy.ts'
import { COPY, consoleLocale } from '../src/lib/copy.ts'

test('ISP console locale dictionaries stay in parity', () => {
  assert.deepEqual(Object.keys(COPY.id).sort(), Object.keys(COPY.en).sort())
  assert.equal(consoleLocale('id'), 'id')
  assert.equal(consoleLocale('fr'), 'en')
})

test('ISP BFF exposes only granted operator routes and safe actions', () => {
  assert.equal(allowedIspPath('GET', ['tenants']), '/isp/tenants')
  assert.equal(allowedIspPath('GET', ['tenants', 'tenant_a', 'radius', 'profiles']), '/isp/tenants/tenant_a/radius/profiles')
  assert.equal(allowedIspPath('POST', ['tenants', 'tenant_a', 'sessions', 'session_a', 'actions']), '/isp/tenants/tenant_a/sessions/session_a/actions')
  assert.equal(allowedIspPath('GET', ['isp', 'radius', 'authenticate']), null)
  assert.equal(allowedIspPath('POST', ['tenants', 'tenant_a', 'service-grants']), null)
  assert.equal(allowedIspPath('GET', ['tenants', 'tenant_a', 'nas', 'secret']), null)
  assert.equal(allowedIspPath('GET', ['tenants', '..', 'nas']), null)
  assert.equal(allowedIspPath('DELETE', ['tenants', 'tenant_a']), null)
})
