#!/usr/bin/env node
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const specPath = resolve('docs/design/M33-03-d07-scene-version-media-rights.md')
const HEX_SHA256 = /^[a-f0-9]{64}$/
const ALLOWED_USES = new Set(['INTERNAL_PREVIEW', 'DOWNLOAD', 'SHARE', 'PUBLICATION'])
const ALLOWED_ORIGINS = new Set(['ORIGINAL', 'THIRD_PARTY', 'WITNESS_DERIVED', 'UNKNOWN'])
const EXPORT_ELIGIBLE_RIGHTS = new Set(['PUBLIC_DOMAIN', 'RIGHTS_EXACT_VERSION_CLEARED'])

function validateForUse(version, requestedUse) {
  const errors = []
  if (!ALLOWED_USES.has(requestedUse)) errors.push('USE_INVALID')
  if (!version || !Number.isInteger(version.version) || version.version < 1) errors.push('VERSION_INVALID')
  if (!version?.sceneId) errors.push('SCENE_ID_MISSING')
  if (!HEX_SHA256.test(version?.snapshotSha256 ?? '')) errors.push('SNAPSHOT_DIGEST_INVALID')
  if (!EXPORT_ELIGIBLE_RIGHTS.has(version?.body?.rightsStatus ?? 'RIGHTS_UNKNOWN')) errors.push('BODY_RIGHTS_NOT_RELEASE_ELIGIBLE')
  if (version?.body?.rightsRevoked === true) errors.push('BODY_RIGHTS_REVOKED')
  validateEvidence(version?.body, 'BODY', requestedUse, errors)
  if (!version?.body?.objectRef || !HEX_SHA256.test(version?.body?.sha256 ?? '') || !version?.body?.mimeType || !Number.isInteger(version?.body?.byteLength) || version.body.byteLength < 0) {
    errors.push('BODY_OBJECT_METADATA_INVALID')
  }
  if (!ALLOWED_ORIGINS.has(version?.body?.origin)) errors.push('BODY_ORIGIN_INVALID')
  if (!Array.isArray(version?.assets) || version.assets.length === 0) errors.push('ASSET_MANIFEST_MISSING')
  for (const asset of version?.assets ?? []) {
    if (!asset?.objectRef || !HEX_SHA256.test(asset?.sha256 ?? '') || !asset?.mimeType || !Number.isInteger(asset?.byteLength) || asset.byteLength < 0) errors.push('ASSET_IDENTITY_INVALID')
    if (!ALLOWED_ORIGINS.has(asset?.origin)) errors.push('ASSET_ORIGIN_INVALID')
    if (!EXPORT_ELIGIBLE_RIGHTS.has(asset?.rightsStatus ?? 'RIGHTS_UNKNOWN')) errors.push('ASSET_RIGHTS_NOT_RELEASE_ELIGIBLE')
    if (asset?.rightsRevoked === true) errors.push('ASSET_RIGHTS_REVOKED')
    validateEvidence(asset, 'ASSET', requestedUse, errors)
  }
  if (requestedUse === 'PUBLICATION') {
    const approval = version?.d08Approval
    if (!approval || approval.versionDigest !== version?.snapshotSha256 || approval.scope !== 'public' || !approval.reviewerRef || !Number.isFinite(Date.parse(approval?.decisionAt ?? ''))) {
      errors.push('D08_EXACT_VERSION_APPROVAL_REQUIRED')
    }
  }
  return [...new Set(errors)]
}

function validateEvidence(subject, label, requestedUse, errors) {
  if (!EXPORT_ELIGIBLE_RIGHTS.has(subject?.rightsStatus ?? 'RIGHTS_UNKNOWN')) return
  if (!subject?.rightsEvidenceRef || !HEX_SHA256.test(subject?.rightsEvidenceSha256 ?? '') || !subject?.rightsReviewerRef || !Number.isFinite(Date.parse(subject?.rightsDecisionAt ?? ''))) {
    errors.push(`${label}_RIGHTS_EVIDENCE_INVALID`)
  }
  if (!Array.isArray(subject?.allowedUses) || !subject.allowedUses.includes(requestedUse)) errors.push(`${label}_USE_SCOPE_MISSING`)
  if (subject?.origin === 'WITNESS_DERIVED') {
    if (subject?.consentStatus !== 'ACTIVE' || !subject?.consentRef || !HEX_SHA256.test(subject?.consentEvidenceSha256 ?? '')) {
      errors.push(`${label}_CONSENT_NOT_ACTIVE`)
    }
    if (!subject?.consentReviewerRef || !Number.isFinite(Date.parse(subject?.consentDecisionAt ?? ''))) errors.push(`${label}_CONSENT_EVIDENCE_INVALID`)
    if (!Array.isArray(subject?.consentScopes) || !subject.consentScopes.includes(requestedUse)) errors.push(`${label}_CONSENT_SCOPE_MISSING`)
  }
}

function fixture(overrides = {}) {
  const digest = 'a'.repeat(64)
  const baseEvidence = {
    rightsStatus: 'RIGHTS_EXACT_VERSION_CLEARED',
    rightsEvidenceRef: 'synthetic:d08:rights:fixture-1',
    rightsEvidenceSha256: digest,
    rightsReviewerRef: 'synthetic:principal:reviewer',
    rightsDecisionAt: '2026-10-28T00:00:00.000Z',
    allowedUses: ['DOWNLOAD'],
  }
  return {
    sceneId: 'synthetic:scene:1',
    version: 1,
    snapshotSha256: digest,
    body: { ...baseEvidence, origin: 'ORIGINAL', objectRef: 'synthetic:object:body', sha256: digest, mimeType: 'text/plain', byteLength: 12 },
    assets: [{ ...baseEvidence, origin: 'ORIGINAL', objectRef: 'synthetic:object:asset-1', sha256: digest, mimeType: 'image/svg+xml', byteLength: 24 }],
    ...overrides,
  }
}

async function main() {
  const spec = await readFile(specPath, 'utf8')
  const requiredClauses = [
    'Status: scoped specification; not an accepted ADR and not an implementation',
    'D07 / Story & Media owns story, scene, scene-version and media-manifest metadata',
    'ECHOLOG (D19) owns isolated object bytes and content digests',
    '`RIGHTS_UNKNOWN`, `METADATA_ONLY`, `RESTRICTED`, missing evidence, scope mismatch, digest mismatch, or withdrawn/unknown consent is non-exportable by default',
    'Reuse the existing `ReleaseRightsStatus` vocabulary from M18-03',
    'Real source and rights verification remains BLOCKED',
  ]
  for (const clause of requiredClauses) assert.ok(spec.includes(clause), `specification clause missing: ${clause}`)

  const positive = validateForUse(fixture(), 'DOWNLOAD')
  assert.deepEqual(positive, [], `synthetic positive vector rejected: ${positive.join(',')}`)

  const digest = 'a'.repeat(64)
  const publication = fixture({
    body: { ...fixture().body, allowedUses: ['PUBLICATION'] },
    assets: [{ ...fixture().assets[0], allowedUses: ['PUBLICATION'] }],
    d08Approval: { reviewerRef: 'synthetic:principal:reviewer', versionDigest: digest, scope: 'public', decisionAt: '2026-10-28T00:00:00.000Z' },
  })
  assert.deepEqual(validateForUse(publication, 'PUBLICATION'), [], 'synthetic exact-version publication vector rejected')

  const unknownRights = fixture({ body: { ...fixture().body, rightsStatus: 'RIGHTS_UNKNOWN' } })
  assert.ok(validateForUse(unknownRights, 'DOWNLOAD').includes('BODY_RIGHTS_NOT_RELEASE_ELIGIBLE'))

  const restrictedRights = fixture({ body: { ...fixture().body, rightsStatus: 'RESTRICTED' } })
  assert.ok(validateForUse(restrictedRights, 'DOWNLOAD').includes('BODY_RIGHTS_NOT_RELEASE_ELIGIBLE'))

  const revokedRights = fixture({ body: { ...fixture().body, rightsRevoked: true } })
  assert.ok(validateForUse(revokedRights, 'DOWNLOAD').includes('BODY_RIGHTS_REVOKED'))

  const missingEvidence = fixture({ body: { ...fixture().body, rightsEvidenceRef: null } })
  assert.ok(validateForUse(missingEvidence, 'DOWNLOAD').includes('BODY_RIGHTS_EVIDENCE_INVALID'))

  const withdrawnConsent = fixture({ assets: [{
    ...fixture().assets[0], origin: 'WITNESS_DERIVED', consentStatus: 'WITHDRAWN',
    consentRef: 'synthetic:d08:consent:fixture-1', consentEvidenceSha256: 'b'.repeat(64), consentScopes: ['DOWNLOAD'],
    consentReviewerRef: 'synthetic:principal:reviewer', consentDecisionAt: '2026-10-28T00:00:00.000Z',
  }] })
  assert.ok(validateForUse(withdrawnConsent, 'DOWNLOAD').includes('ASSET_CONSENT_NOT_ACTIVE'))

  const noConsentScope = fixture({ assets: [{
    ...fixture().assets[0], origin: 'WITNESS_DERIVED', consentStatus: 'ACTIVE',
    consentRef: 'synthetic:d08:consent:fixture-1', consentEvidenceSha256: 'b'.repeat(64), consentScopes: ['INTERNAL_PREVIEW'],
    consentReviewerRef: 'synthetic:principal:reviewer', consentDecisionAt: '2026-10-28T00:00:00.000Z',
  }] })
  assert.ok(validateForUse(noConsentScope, 'DOWNLOAD').includes('ASSET_CONSENT_SCOPE_MISSING'))

  const wrongApproval = fixture({ d08Approval: {
    reviewerRef: 'synthetic:principal:reviewer', versionDigest: 'c'.repeat(64), scope: 'public',
  } })
  assert.ok(validateForUse(wrongApproval, 'PUBLICATION').includes('BODY_USE_SCOPE_MISSING'))
  assert.ok(validateForUse(wrongApproval, 'PUBLICATION').includes('D08_EXACT_VERSION_APPROVAL_REQUIRED'))

  console.log('M33-03 scene-rights contract: PASS')
  console.log('synthetic positive vectors accepted for scoped download and exact-version publication approval')
  console.log('negative vectors rejected: RIGHTS_UNKNOWN, RESTRICTED, D08 revocation, missing evidence, withdrawn consent, consent-scope mismatch, missing publication scope/exact-version approval')
  console.log('real-source rights/consent verification: BLOCKED (no real source or evidence supplied)')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
