import assert from 'node:assert/strict'

const ACTIONS = new Set(['INTERNAL_PREVIEW', 'DOWNLOAD', 'PUBLICATION'])

function evaluatePosterRequest(poster, request) {
  if (!poster || !request) return { allowed: false, reason: 'REQUEST_MISSING' }
  if (!request.session?.active || !request.session.principalId) return { allowed: false, reason: 'SESSION_INVALID' }
  if (!ACTIONS.has(request.action)) return { allowed: false, reason: 'ACTION_INVALID' }
  if (request.principalId !== request.session.principalId) return { allowed: false, reason: 'PRINCIPAL_MISMATCH' }
  if (!poster.sceneId || !Number.isInteger(poster.sceneVersion) || poster.sceneVersion < 1
    || !poster.sceneDigest || !poster.rendererVersion || !poster.renderDigest
    || !poster.objectKey || !poster.objectDigest || poster.renderDigest !== poster.objectDigest) {
    return { allowed: false, reason: 'POSTER_BINDING_INVALID' }
  }
  const decision = request.decision
  if (!decision?.current || decision.revoked || decision.sceneDigest !== poster.sceneDigest
    || decision.renderDigest !== poster.renderDigest || decision.objectDigest !== poster.objectDigest
    || decision.principalId !== request.principalId || decision.action !== request.action) {
    return { allowed: false, reason: 'DECISION_MISSING_OR_STALE' }
  }
  if (!poster.sources?.length || poster.sources.some((source) => (
    !source.digest || !source.rights?.eligible || source.rights.revoked
    || source.rights.sourceDigest !== source.digest || !source.rights.evidenceRef
    || !source.rights.scopes?.includes(request.action)
  ))) {
    return { allowed: false, reason: 'RIGHTS_OR_SCOPE_INVALID' }
  }
  const sourceByDigest = new Map(poster.sources.map((source) => [source.digest, source]))
  if (!poster.attributions?.length || poster.attributions.length !== sourceByDigest.size
    || poster.attributions.some((credit) => (
    !credit.sourceDigest || !sourceByDigest.has(credit.sourceDigest)
    || sourceByDigest.get(credit.sourceDigest).rights.evidenceRef !== credit.rightsEvidenceRef || !credit.requiredCredit
    || !credit.visibleScopes?.includes(request.action)
  ))) {
    return { allowed: false, reason: 'ATTRIBUTION_INCOMPLETE' }
  }
  if (request.action === 'PUBLICATION'
    && (!decision.publicationApproved || decision.publicScope !== 'PUBLICATION')) {
    return { allowed: false, reason: 'PUBLICATION_NOT_APPROVED' }
  }
  return {
    allowed: true,
    reason: 'ALLOWED',
    credits: poster.attributions.map(({ requiredCredit }) => requiredCredit),
    delivery: 'TRUSTED_SERVER_ONLY',
  }
}

const poster = {
  sceneId: 'scene_synthetic_01',
  sceneVersion: 4,
  sceneDigest: 'sha256:scene-v4',
  rendererVersion: 'renderer-synthetic-v1',
  renderDigest: 'sha256:poster-v4-render',
  objectKey: 'posters/synthetic/opaque-01',
  objectDigest: 'sha256:poster-v4-render',
  sources: [{
    digest: 'sha256:source-synthetic',
    rights: {
      eligible: true,
      revoked: false,
      sourceDigest: 'sha256:source-synthetic',
      evidenceRef: 'd08:rights-synthetic-01',
      scopes: ['INTERNAL_PREVIEW'],
    },
  }],
  attributions: [{
    sourceDigest: 'sha256:source-synthetic',
    rightsEvidenceRef: 'd08:rights-synthetic-01',
    requiredCredit: 'Synthetic creator credit',
    visibleScopes: ['INTERNAL_PREVIEW'],
  }],
}

const request = {
  session: { active: true, principalId: 'principal-synthetic-reviewer' },
  principalId: 'principal-synthetic-reviewer',
  action: 'INTERNAL_PREVIEW',
  decision: {
    current: true,
    revoked: false,
    sceneDigest: 'sha256:scene-v4',
    renderDigest: 'sha256:poster-v4-render',
    objectDigest: 'sha256:poster-v4-render',
    principalId: 'principal-synthetic-reviewer',
    action: 'INTERNAL_PREVIEW',
  },
}

const positive = evaluatePosterRequest(poster, request)
assert.equal(positive.allowed, true)
assert.deepEqual(positive.credits, ['Synthetic creator credit'])
assert.equal(positive.delivery, 'TRUSTED_SERVER_ONLY')

const rejects = [
  ['anonymous request', { ...request, session: { active: false, principalId: null } }, poster, 'SESSION_INVALID'],
  ['principal mismatch', { ...request, principalId: 'principal-synthetic-other' }, poster, 'PRINCIPAL_MISMATCH'],
  ['decision for another render', { ...request, decision: { ...request.decision, renderDigest: 'sha256:stale' } }, poster, 'DECISION_MISSING_OR_STALE'],
  ['revoked rights', request, { ...poster, sources: [{ ...poster.sources[0], rights: { ...poster.sources[0].rights, revoked: true } }] }, 'RIGHTS_OR_SCOPE_INVALID'],
  ['download without download scope', { ...request, action: 'DOWNLOAD', decision: { ...request.decision, action: 'DOWNLOAD' } }, poster, 'RIGHTS_OR_SCOPE_INVALID'],
  ['missing required credit', request, { ...poster, attributions: [{ ...poster.attributions[0], requiredCredit: '' }] }, 'ATTRIBUTION_INCOMPLETE'],
  ['public credit outside publication scope', { ...request, action: 'PUBLICATION', decision: { ...request.decision, action: 'PUBLICATION', publicationApproved: true, publicScope: 'PUBLICATION' } }, poster, 'RIGHTS_OR_SCOPE_INVALID'],
  ['credit evidence mismatch', request, { ...poster, attributions: [{ ...poster.attributions[0], rightsEvidenceRef: 'd08:rights-other' }] }, 'ATTRIBUTION_INCOMPLETE'],
  ['public publication absent', { ...request, action: 'PUBLICATION', decision: { ...request.decision, action: 'PUBLICATION' } }, { ...poster, sources: [{ ...poster.sources[0], rights: { ...poster.sources[0].rights, scopes: ['PUBLICATION'] } }], attributions: [{ ...poster.attributions[0], visibleScopes: ['PUBLICATION'] }] }, 'PUBLICATION_NOT_APPROVED'],
  ['object bytes changed', request, { ...poster, objectDigest: 'sha256:other-bytes' }, 'POSTER_BINDING_INVALID'],
]

for (const [label, candidateRequest, candidatePoster, reason] of rejects) {
  assert.deepEqual(evaluatePosterRequest(candidatePoster, candidateRequest), { allowed: false, reason }, label)
}

console.log('M33-05 private poster/access attribution contract: PASS')
console.log('synthetic positive: exact scene/render/object, scoped rights, private decision and required credit accepted')
console.log(`negative vectors rejected: ${rejects.map(([label]) => label).join(', ')}`)
console.log('real-media/access verification: BLOCKED (no approved source, operational D08, or private delivery integration)')
