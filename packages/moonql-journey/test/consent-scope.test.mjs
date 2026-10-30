import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { authoriseScopeAction, impliesAuthorityOverOthers, SCOPE_ORDER } from '../src/consent-scope.ts'

void test('the contract lists the same audiences the model publishes', () => {
  const seed = readFileSync(new URL('../src/seed.ts', import.meta.url), 'utf8')
  const published = seed.match(/CONSENT_SCOPES = \[([^\]]*)\]/)[1].split(',').map((s) => s.trim().replace(/'/g, ''))
  assert.deepEqual([...SCOPE_ORDER], published, 'the consent contract must not invent or drop an audience')
})

const PERSONAL = { kind: 'personal-account', ownerRef: 'member-b', declaredScope: 'SELF' }
const SHARED_GLOBAL = { kind: 'shared-record', ownerRef: 'member-b', declaredScope: 'GLOBAL' }
const SHARED_COMMUNITY = { kind: 'shared-record', ownerRef: 'member-a', declaredScope: 'COMMUNITY' }
const OWN_SELF = { kind: 'shared-record', ownerRef: 'member-a', declaredScope: 'SELF' }

const globalGrant = { principalRef: 'member-a', scope: 'GLOBAL', state: 'ACTIVE' }

void test('a global consent is an audience for the holder, never authority over another member', () => {
  assert.deepEqual([...SCOPE_ORDER], ['SELF', 'COMMUNITY', 'GLOBAL'])
  for (const scope of SCOPE_ORDER) {
    assert.equal(impliesAuthorityOverOthers(scope), false, `${scope} must never imply authority over others`)
    for (const action of ['read', 'publish', 'act']) {
      const denial = authoriseScopeAction(action, PERSONAL, { ...globalGrant, scope })
      assert.deepEqual(denial, { allowed: false, code: 'PERSONAL_AUTHORITY_PROHIBITED' }, `${scope} ${action} on a personal account`)
    }
  }
})

void test('positive: the owner publishes inside their own consented audience', () => {
  assert.deepEqual(authoriseScopeAction('publish', SHARED_COMMUNITY, globalGrant), { allowed: true, basis: 'owner' })
  assert.deepEqual(authoriseScopeAction('read', { ...PERSONAL, ownerRef: 'member-a' }, globalGrant), { allowed: true, basis: 'owner' })
  // the owner may surface their own SELF record without inventing a wider audience
  assert.deepEqual(authoriseScopeAction('publish', OWN_SELF, { ...globalGrant, scope: 'SELF' }), { allowed: true, basis: 'owner' })
})

void test('negative: dead grants, wider-than-declared audiences and unreadable scopes all fail closed', () => {
  for (const state of ['REVOKED', 'EXPIRED']) {
    assert.deepEqual(authoriseScopeAction('read', SHARED_GLOBAL, { ...globalGrant, state }), { allowed: false, code: 'GRANT_NOT_ACTIVE' }, `${state} grant`)
  }
  // a community member cannot surface a record the owner declared for the world
  assert.deepEqual(authoriseScopeAction('publish', SHARED_GLOBAL, { ...globalGrant, scope: 'COMMUNITY' }), { allowed: false, code: 'SCOPE_TOO_NARROW' })
  // nor read somebody else's SELF record merely because the platform at large is global
  assert.deepEqual(authoriseScopeAction('read', OWN_SELF, { ...globalGrant, scope: 'COMMUNITY', principalRef: 'member-c' }), { allowed: false, code: 'SCOPE_TOO_NARROW' })
  assert.deepEqual(authoriseScopeAction('read', SHARED_GLOBAL, { ...globalGrant, scope: 'EVERYONE' }), { allowed: false, code: 'GRANT_SCOPE_UNREADABLE' })
  assert.deepEqual(authoriseScopeAction('read', { ...SHARED_GLOBAL, declaredScope: 'world' }, globalGrant), { allowed: false, code: 'GRANT_SCOPE_UNREADABLE' })
})

void test('a refusal names only its reason and echoes no member reference', () => {
  const rendered = JSON.stringify([
    authoriseScopeAction('read', PERSONAL, globalGrant),
    authoriseScopeAction('publish', SHARED_GLOBAL, { ...globalGrant, scope: 'COMMUNITY' }),
    authoriseScopeAction('act', SHARED_GLOBAL, { ...globalGrant, state: 'REVOKED' }),
  ])
  for (const marker of ['member-a', 'member-b', 'personal-account', 'GLOBAL', 'SELF']) {
    assert.ok(!rendered.includes(marker), `the denial payload leaked ${marker}`)
  }
})
