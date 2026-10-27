import test from 'node:test'
import assert from 'node:assert/strict'

// This is a reference check of M20-02's written predicate only. It is not used
// by the application and does not prove that a future queue enforces the rule.
function evaluateDecision(input) {
  const { principal, submitter, requiredScope, grants } = input
  if (
    principal.kind !== 'human'
    || !principal.name?.trim()
    || !['admin', 'user'].includes(principal.role)
    || principal.meta?.keyId
  ) return 'DENY_MACHINE'

  if (principal.id === submitter.id) return 'DENY_SELF'

  const approverGrants = grants.filter((grant) => grant.accountId === principal.id)
  const approverScopes = new Set(approverGrants.map((grant) => grant.scope))
  const submitterScopes = new Set(
    grants.filter((grant) => grant.accountId === submitter.id).map((grant) => grant.scope),
  )
  if (!approverScopes.has(requiredScope)) return 'DENY_SCOPE'
  if ([...approverScopes].some((scope) => submitterScopes.has(scope))) return 'DENY_OVERLAP'
  if (!approverGrants.some((grant) => grant.scope === requiredScope && grant.issuedBy !== submitter.id)) {
    return 'DENY_DELEGATED'
  }

  if (
    input.submittedTargetDigest !== input.currentTargetDigest
    || input.expectedVersion !== input.currentVersion
  ) return 'STALE_OR_CHANGED'

  return 'ALLOW'
}

const baseInput = {
  principal: { id: 'C', kind: 'human', name: 'Reviewer C', role: 'user' },
  submitter: { id: 'A' },
  requiredScope: 'approve:D05.RESEARCH',
  grants: [
    { accountId: 'A', scope: 'approve:D08.RIGHTS', issuedBy: 'admin' },
    { accountId: 'C', scope: 'approve:D05.RESEARCH', issuedBy: 'admin' },
  ],
  submittedTargetDigest: 'sha256:revision-a',
  currentTargetDigest: 'sha256:revision-a',
  expectedVersion: 3,
  currentVersion: 3,
}

test('M20-02 reference predicate allows a disjoint human with the required scope', () => {
  assert.equal(evaluateDecision(baseInput), 'ALLOW')
})

test('M20-02 reference predicate rejects self, overlap, missing scope, machines and delegated grants', () => {
  assert.equal(evaluateDecision({
    ...baseInput,
    principal: { id: 'A', kind: 'human', name: 'Submitter A', role: 'admin' },
  }), 'DENY_SELF')

  assert.equal(evaluateDecision({
    ...baseInput,
    principal: { id: 'B', kind: 'human', name: 'Reviewer B', role: 'user' },
    grants: [
      ...baseInput.grants,
      { accountId: 'B', scope: 'approve:D05.RESEARCH', issuedBy: 'admin' },
      { accountId: 'B', scope: 'approve:D08.RIGHTS', issuedBy: 'admin' },
    ],
  }), 'DENY_OVERLAP')

  assert.equal(evaluateDecision({
    ...baseInput,
    principal: { id: 'D', kind: 'human', name: 'Reviewer D', role: 'user' },
    grants: [
      ...baseInput.grants,
      { accountId: 'D', scope: 'approve:D08.RIGHTS', issuedBy: 'admin' },
    ],
  }), 'DENY_SCOPE')

  assert.equal(evaluateDecision({
    ...baseInput,
    principal: { id: 'B', kind: 'machine', name: 'Reviewer B', role: 'user', meta: { keyId: 'key-1' } },
  }), 'DENY_MACHINE')

  assert.equal(evaluateDecision({
    ...baseInput,
    principal: { id: 'G', kind: 'human', name: 'Guest G', role: 'guest' },
  }), 'DENY_MACHINE')

  assert.equal(evaluateDecision({
    ...baseInput,
    principal: { id: 'E', kind: 'human', name: 'Reviewer E', role: 'user' },
    grants: [
      ...baseInput.grants,
      { accountId: 'E', scope: 'approve:D05.RESEARCH', issuedBy: 'A' },
    ],
  }), 'DENY_DELEGATED')
})

test('M20-02 reference predicate rejects a stale revision or version', () => {
  assert.equal(evaluateDecision({ ...baseInput, submittedTargetDigest: 'sha256:old' }), 'STALE_OR_CHANGED')
  assert.equal(evaluateDecision({ ...baseInput, expectedVersion: 2 }), 'STALE_OR_CHANGED')
})

test('M20-02 admin receives no implicit approval scope', () => {
  assert.equal(evaluateDecision({
    ...baseInput,
    principal: { id: 'admin', kind: 'human', name: 'Admin', role: 'admin' },
  }), 'DENY_SCOPE')
})
