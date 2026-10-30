import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  MEDIA_ACCESS_POLICY_VERSION,
  evaluateMediaAccess,
  evaluateMediaAccessList,
} from '../dist/media-access.js'

const AT = '2026-10-28T12:00:00.000Z'
const SCOPE = 'witness-media-private'
const MEDIA_ID = 'wmedia_synthetic_0001'
const OWNER = 'principal_synthetic_witness_owner'
const GRANTEE = 'principal_synthetic_reviewer'
const STRANGER = 'principal_synthetic_stranger'
const CONSENT_GRANTOR = 'principal_synthetic_consent_registrar'
const OBJECT_KEY = 'sha256/opaque-witness-original-0001-NEVER-LEAK'
const MEDIA_URL = 'https://echolog.invalid/api/v1/objects/sha256/secret-grant-NEVER-LEAK'

/** Synthetic witness media metadata. Includes hostile locator fields on purpose. */
const media = (overrides = {}) => ({
  id: MEDIA_ID,
  ownerPrincipalRef: OWNER,
  visibility: 'PRIVATE',
  consentScope: SCOPE,
  rightsStatus: 'RIGHTS_CLEARED',
  rightsScope: SCOPE,
  // Not part of the contract: a gate must never echo these.
  objectKey: OBJECT_KEY,
  url: MEDIA_URL,
  ...overrides,
})

const consent = (overrides = {}) => ({
  mediaId: MEDIA_ID,
  consentScope: SCOPE,
  grantedBy: CONSENT_GRANTOR,
  ...overrides,
})

const acl = (principalRef, permission = 'view', overrides = {}) => ({
  mediaId: MEDIA_ID,
  principalRef,
  permission,
  ...overrides,
})

const request = (principalRef, action = 'view', overrides = {}) => ({
  principal: { principalRef },
  action,
  requestedScope: SCOPE,
  evaluatedAt: AT,
  acl: [acl(principalRef, action)],
  consent: consent(),
  ...overrides,
})

test('M16-04: owner may upload only with cleared rights, live consent and an explicit upload ACL', () => {
  const decision = evaluateMediaAccess(media(), request(OWNER, 'upload'))
  assert.deepEqual(decision, {
    mediaId: MEDIA_ID,
    action: 'upload',
    allowed: true,
    visibility: 'PRIVATE',
    consentScope: SCOPE,
    rightsStatus: 'RIGHTS_CLEARED',
    policyVersion: MEDIA_ACCESS_POLICY_VERSION,
  })
})

test('M16-04: an explicitly ACL-granted, consent-backed principal may view', () => {
  const decision = evaluateMediaAccess(media(), request(GRANTEE, 'view', {
    acl: [acl(GRANTEE, 'view', { expiresAt: '2026-10-28T12:05:00.000Z' })],
  }))
  assert.equal(decision.allowed, true)
  assert.equal(decision.action, 'view')
  assert.equal(decision.mediaId, MEDIA_ID)
})

test('M16-04: anonymous, absent and unknown principals never pass', () => {
  // Absent request.
  assert.deepEqual(evaluateMediaAccess(media(), null), { mediaId: MEDIA_ID, allowed: false, reason: 'REQUEST_FIELD_MISSING' })
  // Absent principal.
  assert.equal(evaluateMediaAccess(media(), { ...request(OWNER, 'upload'), principal: null }).reason, 'PRINCIPAL_MISSING')
  // Empty / whitespace / non-string principal refs.
  assert.equal(evaluateMediaAccess(media(), request('')).reason, 'PRINCIPAL_MISSING')
  assert.equal(evaluateMediaAccess(media(), request('   ')).reason, 'PRINCIPAL_MISSING')
  assert.equal(
    evaluateMediaAccess(media(), { ...request(OWNER, 'upload'), principal: { principalRef: 42 } }).reason,
    'PRINCIPAL_MISSING',
  )
  // Unknown principal with no matching ACL entry.
  assert.equal(
    evaluateMediaAccess(media(), request(STRANGER, 'upload', { acl: [acl(OWNER, 'upload')] })).reason,
    'ACL_OTHER_PRINCIPAL',
  )
})

test('M16-04: ownership is not authority, roles and scopes never authorize', () => {
  // Owner with an upload ACL but no consent record on file.
  assert.equal(
    evaluateMediaAccess(media({ consentScope: null }), request(OWNER, 'upload')).reason,
    'CONSENT_MISSING',
  )
  // Owner with ACL and consent but no ACL entry for the upload action.
  assert.equal(
    evaluateMediaAccess(media(), request(OWNER, 'upload', { acl: [acl(OWNER, 'view')] })).reason,
    'ACL_PERMISSION_MISMATCH',
  )
  // Platform roles and scopes are recorded only; without an ACL the owner fails.
  const privileged = request(OWNER, 'upload', {
    principal: { principalRef: OWNER, roles: ['admin', 'owner'], scopes: ['witness:write', 'witness:admin'] },
    acl: [],
  })
  assert.equal(evaluateMediaAccess(media(), privileged).reason, 'ACL_MISSING')
  // Same privileged principal, ACL still pointing at someone else.
  const privilegedOther = request(OWNER, 'upload', {
    principal: { principalRef: OWNER, roles: ['admin'], scopes: ['witness:admin'] },
    acl: [acl(GRANTEE, 'upload')],
  })
  assert.equal(evaluateMediaAccess(media(), privilegedOther).reason, 'ACL_OTHER_PRINCIPAL')
})

test('M16-04: ACL must be explicit, principal-bound, permission-bound and unexpired', () => {
  assert.equal(evaluateMediaAccess(media(), request(GRANTEE, 'view', { acl: [] })).reason, 'ACL_MISSING')
  assert.equal(
    evaluateMediaAccess(media(), request(GRANTEE, 'view', { acl: [acl(GRANTEE, 'view', { mediaId: 'other-media' })] })).reason,
    'ACL_MISSING',
  )
  assert.equal(
    evaluateMediaAccess(media(), request(GRANTEE, 'view', { acl: [acl(STRANGER, 'view')] })).reason,
    'ACL_OTHER_PRINCIPAL',
  )
  // Right principal, wrong operation.
  assert.equal(
    evaluateMediaAccess(media(), request(GRANTEE, 'upload', { acl: [acl(GRANTEE, 'view')] })).reason,
    'ACL_PERMISSION_MISMATCH',
  )
  assert.equal(
    evaluateMediaAccess(media(), request(GRANTEE, 'view', { acl: [acl(GRANTEE, 'upload')] })).reason,
    'ACL_PERMISSION_MISMATCH',
  )
  // Expired at exactly the evaluation instant, and before it.
  assert.equal(
    evaluateMediaAccess(media(), request(GRANTEE, 'view', { acl: [acl(GRANTEE, 'view', { expiresAt: AT })] })).reason,
    'ACL_EXPIRED',
  )
  assert.equal(
    evaluateMediaAccess(media(), request(GRANTEE, 'view', { acl: [acl(GRANTEE, 'view', { expiresAt: '2026-10-28T11:59:59.000Z' })] })).reason,
    'ACL_EXPIRED',
  )
})

test('M16-04: consent must exist, match this media and scope, and be unexpired', () => {
  assert.equal(evaluateMediaAccess(media(), request(GRANTEE, 'view', { consent: null })).reason, 'CONSENT_MISSING')
  assert.equal(evaluateMediaAccess(media(), request(GRANTEE, 'view', { consent: undefined })).reason, 'CONSENT_MISSING')
  assert.equal(
    evaluateMediaAccess(media(), request(GRANTEE, 'view', { consent: consent({ mediaId: 'other-media' }) })).reason,
    'CONSENT_MEDIA_MISMATCH',
  )
  assert.equal(
    evaluateMediaAccess(media(), request(GRANTEE, 'view', { consent: consent({ consentScope: 'PUBLIC_ATTRIBUTED' }) })).reason,
    'CONSENT_SCOPE_MISMATCH',
  )
  // Consent narrower than the object's recorded scope.
  assert.equal(
    evaluateMediaAccess(media(), request(GRANTEE, 'view', {
      consent: consent({ consentScope: 'PRIVATE_ARCHIVE' }),
      requestedScope: 'PRIVATE_ARCHIVE',
    })).reason,
    'CONSENT_SCOPE_MISMATCH',
  )
  assert.equal(
    evaluateMediaAccess(media(), request(GRANTEE, 'view', { consent: consent({ expiresAt: AT }) })).reason,
    'CONSENT_EXPIRED',
  )
  assert.equal(
    evaluateMediaAccess(media(), request(GRANTEE, 'view', { consent: consent({ expiresAt: '2026-10-28T11:00:00.000Z' }) })).reason,
    'CONSENT_EXPIRED',
  )
  assert.equal(
    evaluateMediaAccess(media(), request(GRANTEE, 'view', { consent: consent({ grantedBy: '' }) })).reason,
    'CONSENT_INVALID',
  )
})

test('M16-04: rights must be cleared for the requested scope, and withdrawn media never passes', () => {
  assert.equal(
    evaluateMediaAccess(media({ rightsStatus: 'RIGHTS_UNKNOWN' }), request(GRANTEE, 'view')).reason,
    'RIGHTS_UNKNOWN',
  )
  assert.equal(
    evaluateMediaAccess(media({ rightsStatus: 'PUBLIC_DOMAIN' }), request(GRANTEE, 'view')).reason,
    'RIGHTS_STATUS_INVALID',
  )
  assert.equal(
    evaluateMediaAccess(media({ rightsScope: 'public-derivative' }), request(GRANTEE, 'view')).reason,
    'RIGHTS_SCOPE_MISMATCH',
  )
  assert.equal(
    evaluateMediaAccess(media({ rightsScope: 'witness-media-upload' }), request(GRANTEE, 'view')).reason,
    'RIGHTS_SCOPE_MISMATCH',
  )
  assert.equal(
    evaluateMediaAccess(media({ visibility: 'WITHDRAWN' }), request(OWNER, 'upload')).reason,
    'MEDIA_WITHDRAWN',
  )
  // There is no public witness media: an unknown visibility is rejected, not trusted.
  assert.equal(
    evaluateMediaAccess(media({ visibility: 'PUBLIC' }), request(OWNER, 'upload')).reason,
    'MEDIA_VISIBILITY_INVALID',
  )
})

test('M16-04: malformed unknown input is rejected rather than trusted', () => {
  const malformedMedia = [null, undefined, 42, 'wmedia', [], [{ id: MEDIA_ID }], { ...media(), id: '' }, { ...media(), consentScope: 7 }]
  for (const candidate of malformedMedia) {
    const decision = evaluateMediaAccess(candidate, request(OWNER, 'upload'))
    assert.equal(decision.allowed, false, `malformed media ${JSON.stringify(candidate)} must be denied`)
  }
  assert.equal(evaluateMediaAccess(null, request(OWNER, 'upload')).reason, 'MEDIA_FIELD_MISSING')
  assert.equal(evaluateMediaAccess([], request(OWNER, 'upload')).reason, 'MEDIA_FIELD_MISSING')

  const malformedRequests = [
    {},
    'request',
    [],
    { ...request(OWNER, 'upload'), action: 'delete' },
    { ...request(OWNER, 'upload'), action: undefined },
    { ...request(OWNER, 'upload'), requestedScope: '' },
    { ...request(OWNER, 'upload'), evaluatedAt: 'not-a-date' },
    { ...request(OWNER, 'upload'), evaluatedAt: undefined },
    { ...request(OWNER, 'upload'), principal: { principalRef: OWNER, roles: 'admin' } },
    { ...request(OWNER, 'upload'), acl: 'grant-everything' },
    { ...request(OWNER, 'upload'), acl: [{ ...acl(OWNER, 'upload'), permission: 'admin' }] },
    { ...request(OWNER, 'upload'), acl: [{ ...acl(OWNER, 'upload'), principalRef: '' }] },
    { ...request(OWNER, 'upload'), acl: ['grant'] },
    { ...request(OWNER, 'upload'), acl: [{ ...acl(OWNER, 'upload'), expiresAt: 'tomorrow' }] },
    { ...request(OWNER, 'upload'), consent: 'granted' },
    { ...request(OWNER, 'upload'), consent: { ...consent(), grantedBy: 1 } },
    { ...request(OWNER, 'upload'), consent: { ...consent(), expiresAt: 'later' } },
  ]
  for (const candidate of malformedRequests) {
    const decision = evaluateMediaAccess(media(), candidate)
    assert.equal(decision.allowed, false, `malformed request ${JSON.stringify(candidate)} must be denied`)
  }
})

test('M16-04: every denial is link-free — no URL, object key, digest or locator leaks', () => {
  const denials = [
    evaluateMediaAccess(media(), null),
    evaluateMediaAccess(media(), { ...request(OWNER, 'upload'), principal: null }),
    evaluateMediaAccess(media({ consentScope: null }), request(OWNER, 'upload')),
    evaluateMediaAccess(media(), request(OWNER, 'upload', { acl: [acl(OWNER, 'view')] })),
    evaluateMediaAccess(media(), request(STRANGER, 'view', { acl: [acl(GRANTEE, 'view')] })),
    evaluateMediaAccess(media(), request(GRANTEE, 'view', { acl: [acl(GRANTEE, 'view', { expiresAt: '2020-01-01T00:00:00.000Z' })] })),
    evaluateMediaAccess(media(), request(GRANTEE, 'view', { consent: consent({ expiresAt: '2020-01-01T00:00:00.000Z' }) })),
    evaluateMediaAccess(media({ rightsStatus: 'RIGHTS_UNKNOWN' }), request(GRANTEE, 'view')),
    evaluateMediaAccess(media({ rightsScope: 'public-derivative' }), request(GRANTEE, 'view')),
    evaluateMediaAccess(media({ visibility: 'WITHDRAWN' }), request(OWNER, 'upload')),
    evaluateMediaAccessList([media(), media({ id: 'wmedia_synthetic_0002', consentScope: null })], request(OWNER, 'upload'))[1],
  ]
  assert.ok(denials.length > 0)
  for (const denial of denials) {
    assert.equal(denial.allowed, false)
    // Allow-list of fields: nothing else may be present.
    assert.deepEqual(Object.keys(denial).sort(), ['allowed', 'mediaId', 'reason'])
    const serialized = JSON.stringify(denial)
    for (const secret of [OBJECT_KEY, MEDIA_URL, SCOPE, 'sha256', 'echolog', 'grant', 'objectKey', 'url', 'locator']) {
      assert.equal(serialized.includes(secret), false, `denial must not contain "${secret}"`)
    }
    assert.equal(/https?:\/\//i.test(serialized), false, 'denial must not contain a URL')
    assert.equal(/^[a-f0-9]{32,}$/i.test(String(denial.mediaId)), false, 'mediaId must never be a digest')
  }
  // An authorized decision must not smuggle the locator either.
  const allowed = evaluateMediaAccess(media(), request(OWNER, 'upload'))
  assert.equal(JSON.stringify(allowed).includes(OBJECT_KEY), false)
  assert.equal(JSON.stringify(allowed).includes(MEDIA_URL), false)
})
