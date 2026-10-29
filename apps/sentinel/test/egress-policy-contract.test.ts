import assert from 'node:assert/strict'
import test from 'node:test'
import { decideOutboundIntent, type OutboundIntent } from './egress-policy-contract.js'

function providerIntent(overrides: Partial<OutboundIntent> = {}): OutboundIntent {
  return {
    capability: 'READ_ONLY_PROVIDER',
    egressEnabled: true,
    capabilityEnabled: true,
    rights: 'CLEARED',
    method: 'GET',
    url: 'https://feed.example.test/v1/observations',
    allowedOrigins: ['https://feed.example.test'],
    allowedPaths: ['/v1/observations'],
    resolvedAddresses: ['8.8.8.8'],
    redirects: [],
    budgetAvailable: true,
    ...overrides,
  }
}

void test('permits a rights-cleared read-only provider request at an allowlisted public origin', () => {
  assert.deepEqual(decideOutboundIntent(providerIntent()), { allowed: true, reason: 'PERMITTED_BY_DESIGN' })
  assert.equal(decideOutboundIntent(providerIntent({ retryAttempt: 2 })).allowed, true)
})

void test('permits a separately configured exact internal service origin', () => {
  const result = decideOutboundIntent(providerIntent({
    capability: 'INTERNAL_SERVICE',
    rights: 'UNKNOWN',
    url: 'http://127.0.0.1:3003/v1/chat/completions',
    allowedOrigins: ['http://127.0.0.1:3003'],
    allowedPaths: ['/v1/chat/completions'],
    resolvedAddresses: ['127.0.0.1'],
  }))
  assert.deepEqual(result, { allowed: true, reason: 'PERMITTED_BY_DESIGN' })
})

void test('denies requests when egress or capability is disabled or not recognized', () => {
  assert.equal(decideOutboundIntent(providerIntent({ egressEnabled: false })).reason, 'EGRESS_DISABLED')
  assert.equal(decideOutboundIntent(providerIntent({ capabilityEnabled: false })).reason, 'CAPABILITY_DISABLED')
  assert.equal(decideOutboundIntent(providerIntent({ capability: 'UNKNOWN' })).reason, 'UNKNOWN_CAPABILITY')
})

void test('denies unknown rights, unapproved origins, unsafe URL parts, and redirects', () => {
  assert.equal(decideOutboundIntent(providerIntent({ rights: 'UNKNOWN' })).reason, 'RIGHTS_NOT_CLEARED')
  assert.equal(decideOutboundIntent(providerIntent({ url: 'https://other.example.test/feed' })).reason, 'ORIGIN_NOT_ALLOWED')
  assert.equal(decideOutboundIntent(providerIntent({ url: 'https://feed.example.test/other' })).reason, 'PATH_NOT_ALLOWED')
  assert.equal(decideOutboundIntent(providerIntent({ url: 'http://feed.example.test/v1/observations' })).reason, 'HTTPS_REQUIRED')
  assert.equal(decideOutboundIntent(providerIntent({ url: 'https://feed.example.test:8443/v1/observations' })).reason, 'ORIGIN_NOT_ALLOWED')
  assert.equal(decideOutboundIntent(providerIntent({ url: 'https://user:secret@feed.example.test/feed' })).reason, 'URL_CREDENTIALS_OR_FRAGMENT')
  assert.equal(decideOutboundIntent(providerIntent({ redirects: ['https://private.example.test'] })).reason, 'REDIRECT_DENIED')
})

void test('denies private, loopback, link-local, and metadata destinations for external classes', () => {
  for (const address of ['10.0.0.1', '127.0.0.1', '169.254.169.254', '192.168.1.5', 'fd00::1']) {
    assert.equal(decideOutboundIntent(providerIntent({ resolvedAddresses: [address] })).reason, 'NON_PUBLIC_ADDRESS')
  }
})

void test('denies non-GET provider methods, exhausted budgets, and provider fallback', () => {
  assert.equal(decideOutboundIntent(providerIntent({ method: 'POST' })).reason, 'PROVIDER_METHOD_NOT_READ_ONLY')
  assert.equal(decideOutboundIntent(providerIntent({ budgetAvailable: false })).reason, 'BUDGET_EXHAUSTED')
  assert.equal(decideOutboundIntent(providerIntent({ fallbackProvider: true })).reason, 'FALLBACK_FORBIDDEN')
  assert.equal(decideOutboundIntent(providerIntent({ retryAttempt: 3 })).reason, 'RETRY_LIMIT_EXCEEDED')
})

void test('permits one approved notification but suppresses duplicate or retried alerts', () => {
  const alert: OutboundIntent = {
    ...providerIntent(),
    capability: 'ALERT_SINK',
    method: 'POST',
    url: 'https://hooks.example.test/notify',
    allowedOrigins: ['https://hooks.example.test'],
    allowedPaths: ['/notify'],
    contentApproved: true,
    alertAction: 'NOTIFICATION',
  }
  assert.equal(decideOutboundIntent(alert).allowed, true)
  assert.equal(decideOutboundIntent({ ...alert, alertAlreadySent: true }).reason, 'ALERT_DUPLICATE')
  assert.equal(decideOutboundIntent({ ...alert, retryAttempt: 1 }).reason, 'ALERT_RETRY_FORBIDDEN')
  assert.equal(decideOutboundIntent({ ...alert, rights: 'EXPIRED' }).reason, 'RIGHTS_NOT_CLEARED')
  assert.equal(decideOutboundIntent({ ...alert, contentApproved: false }).reason, 'ALERT_CONTENT_NOT_APPROVED')
  assert.equal(decideOutboundIntent({ ...alert, alertAction: 'PUNITIVE' }).reason, 'PUNITIVE_ALERT_FORBIDDEN')
})

void test('rejects URL fragments and invalid URLs before any network operation', () => {
  assert.equal(decideOutboundIntent(providerIntent({ url: 'https://feed.example.test/path#token' })).reason, 'URL_CREDENTIALS_OR_FRAGMENT')
  assert.equal(decideOutboundIntent(providerIntent({ url: 'not a URL' })).reason, 'INVALID_URL')
})
