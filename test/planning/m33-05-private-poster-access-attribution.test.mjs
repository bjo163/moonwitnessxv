import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { buildSourceLabel } from '../../packages/moonql-research/src/source-label.ts'
import {
  RELEASE_CONTENT_TYPES,
  buildReleaseManifest,
  createCurrentPointer,
  resolvePublicRevision,
} from '../../packages/moonql-research/src/release-manifest.ts'
import { createDownloadGrant, verifyDownloadGrant } from '../../apps/echolog/src/grants.ts'
import { rightsLabel } from '../../apps/dock/src/lib/provenance-copy.ts'

// M33-05 — private poster access and attribution, checked against committed code.
//
// No poster store, D08 decision service or poster renderer exists (see the
// M33-05 audit). This file therefore verifies the real committed contracts the
// poster path must reuse, and asserts the written poster contract structurally:
//   * attribution/licence labels  -> packages/moonql-research/src/source-label.ts
//                                    and apps/dock/src/lib/provenance-copy.ts
//   * public projection gate      -> packages/moonql-research/src/release-manifest.ts
//   * exact-object grant binding  -> apps/echolog/src/grants.ts
//   * private media ACL/consent   -> apps/arsy/test/m33-05-private-poster-access.test.ts
//                                    (the committed D06 gate plus ECHOLOG marker)
// Every fixture is synthetic. No source bytes, licence document, consent record,
// witness material, credential or production identifier is used.

const testDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(testDir, '..', '..')
const read = (relative) => fs.readFileSync(path.resolve(repoRoot, relative), 'utf8')

const CREDIT_REF = 'credit:fixture:poster-artist-001'
const CREDIT_VERSION = '1.0.0'
const RIGHTS_REVIEWER = 'principal:fixture:poster-rights-reviewer-001'
const CLEARED_LICENCE = 'Rights cleared for this exact version'
const UNKNOWN_LICENCE_EN = 'Rights unknown'
const UNKNOWN_LICENCE_ID = 'Status hak cipta belum diketahui'

/** A synthetic poster credit record: named uploader/credit, licence kind, reviewer. */
const posterCredit = (overrides = {}) => ({
  sourceKind: 'THIRD_PARTY_COPYRIGHT',
  sourceSense: 'ORIGINAL_ARABIC',
  sourceRef: CREDIT_REF,
  sourceVersion: CREDIT_VERSION,
  aiInvolvement: 'NONE',
  reviewerRef: RIGHTS_REVIEWER,
  reviewerScopes: ['RIGHTS'],
  ...overrides,
})

function allLabelTexts(label) {
  return [
    label.badge,
    label.recordedProvenanceLabel,
    label.sourceKindLabel,
    label.reviewerScope.label,
    label.sourceIdentity.label,
    label.aiDisclosure.label,
    label.translationDisclosure.label,
  ]
}

test('M33-05 positive: a licensed, credited poster carries its credit and licence label', () => {
  const label = buildSourceLabel(posterCredit())

  // Credit: the exact named creator, never inferred and never replaced by a renderer name.
  assert.equal(label.sourceIdentity.state, 'NAMED')
  assert.equal(label.sourceIdentity.ref, CREDIT_REF)
  assert.equal(label.sourceIdentity.version, CREDIT_VERSION)
  assert.equal(label.sourceIdentity.label.text, `Source identity: ${CREDIT_REF}@${CREDIT_VERSION}`)

  // Licence kind: stated as third-party copyright, not as an original or AI claim.
  assert.equal(label.sourceKind, 'THIRD_PARTY_COPYRIGHT')
  assert.equal(label.sourceKindLabel.text, 'Third-party copyrighted content')
  assert.equal(label.displayProvenance, 'DERIVATIVE', 'licensed third-party artwork is not the project original')
  assert.equal(label.mayRenderOriginal, false)
  assert.ok(label.reasons.includes('THIRD_PARTY_COPYRIGHT'))
  assert.equal(label.aiDisclosure.state, 'NONE')

  // A rights reviewer is named for the licensing decision.
  assert.equal(label.reviewerScope.state, 'VERIFIED')
  assert.equal(label.reviewerScope.reviewerRef, RIGHTS_REVIEWER)

  // Licence label in both rendered locales, from the committed public vocabulary.
  assert.equal(rightsLabel('RIGHTS_EXACT_VERSION_CLEARED', 'en'), CLEARED_LICENCE)
  assert.notEqual(rightsLabel('RIGHTS_EXACT_VERSION_CLEARED', 'id'), '')
  for (const text of allLabelTexts(label)) {
    assert.equal(typeof text.text, 'string')
    assert.ok(text.text.trim().length > 0, `label ${text.key} must never be blank`)
  }
})

test('M33-05 negative: an unlicensed or attribution-missing poster never renders as cleared or original', () => {
  // Unlicensed: every non-cleared rights status renders a non-claim, never the cleared label.
  for (const status of ['RIGHTS_UNKNOWN', 'METADATA_ONLY', 'RESTRICTED', 'PUBLIC_DOMAIN', 'LICENCE_ASSUMED']) {
    const rendered = rightsLabel(status, 'en')
    assert.ok(rendered.trim().length > 0, `${status} must never render a blank licence label`)
    assert.notEqual(rendered, CLEARED_LICENCE, `${status} must not borrow the cleared licence label`)
    assert.ok(!/cleared|approved/i.test(rendered) || status === 'PUBLIC_DOMAIN', `${status} must not imply clearance`)
  }
  assert.equal(rightsLabel('RIGHTS_UNKNOWN', 'en'), UNKNOWN_LICENCE_EN)
  assert.equal(rightsLabel('RIGHTS_UNKNOWN', 'id'), UNKNOWN_LICENCE_ID)

  // Missing credit: the label says the source is unavailable; it never invents a name.
  for (const missing of [null, undefined, '', '   ']) {
    const label = buildSourceLabel(posterCredit({ sourceRef: missing }))
    assert.equal(label.sourceIdentity.state, 'UNAVAILABLE')
    assert.equal(label.sourceIdentity.ref, null)
    assert.equal(label.sourceIdentity.label.text, 'SOURCE UNAVAILABLE — no source identity recorded')
    assert.ok(label.reasons.includes('SOURCE_IDENTITY_MISSING'))
    assert.equal(label.mayRenderOriginal, false)
  }

  // Missing licence kind and missing rights reviewer both downgrade rather than pass.
  const noKind = buildSourceLabel(posterCredit({ sourceKind: null }))
  assert.equal(noKind.sourceKind, 'UNVERIFIED')
  assert.equal(noKind.sourceKindLabel.text, 'Source kind not recorded')
  assert.equal(noKind.mayRenderOriginal, false)

  const noReviewer = buildSourceLabel(posterCredit({ reviewerRef: null }))
  assert.equal(noReviewer.reviewerScope.state, 'UNVERIFIED')
  assert.equal(noReviewer.reviewerScope.reason, 'REVIEWER_MISSING')
  assert.equal(noReviewer.mayRenderOriginal, false)

  // Unrecorded AI involvement is never evidence that no AI was involved.
  const noAiRecord = buildSourceLabel(posterCredit({ aiInvolvement: null }))
  assert.equal(noAiRecord.aiDisclosure.state, 'UNRECORDED')
  assert.equal(noAiRecord.aiDisclosure.label.text, 'AI INVOLVEMENT UNRECORDED — ORIGINAL STATUS UNVERIFIED')

  // The written contract, not this commit, owns the refusal: no renderer exists.
  const design = read('docs/design/M33-05-private-poster-access-attribution.md')
  assert.match(
    design,
    /Missing\/ambiguous required credit, mismatched source digest, attribution scope mismatch, revoked rights, or withdrawn consent blocks the request\./,
    'the poster contract must refuse an attribution-incomplete poster',
  )
  assert.match(design, /Attribution is not a license and does not grant access\./)
})

test('M33-05 negative: no credit/reviewer/AI combination can render a positive badge', () => {
  const creditValues = [CREDIT_REF, null, '', '   ']
  const reviewerVariants = [
    { reviewerRef: RIGHTS_REVIEWER, reviewerScopes: ['RIGHTS'] },
    { reviewerRef: null, reviewerScopes: ['RIGHTS'] },
    { reviewerRef: RIGHTS_REVIEWER, reviewerScopes: [] },
    { reviewerRef: RIGHTS_REVIEWER, reviewerScopes: ['NOT_A_SCOPE'] },
  ]
  const aiValues = ['NONE', null, 'UNKNOWN', 'GENERATED']

  let positives = 0
  let thirdPartyPositives = 0
  for (const sourceRef of creditValues) {
    for (const reviewer of reviewerVariants) {
      for (const aiInvolvement of aiValues) {
        // Third-party artwork is derivative by kind, so no combination may be positive.
        const artwork = buildSourceLabel({ ...posterCredit(reviewer), sourceRef, aiInvolvement })
        if (artwork.mayRenderOriginal) thirdPartyPositives += 1

        // Project-original artwork exercises the positive gate: only the complete
        // evidence set may badge it, and any missing axis must state a reason.
        const label = buildSourceLabel({
          ...posterCredit(reviewer),
          sourceRef,
          aiInvolvement,
          sourceKind: 'ORIGINAL_SOURCE',
        })
        if (label.mayRenderOriginal) {
          positives += 1
          assert.equal(sourceRef, CREDIT_REF)
          assert.equal(reviewer.reviewerRef, RIGHTS_REVIEWER)
          assert.notEqual(reviewer.reviewerScopes.length, 0)
          assert.equal(aiInvolvement, 'NONE')
          assert.equal(label.reasons.length, 0)
        } else {
          assert.ok(label.reasons.length > 0, 'a downgraded poster credit must state a reason')
          assert.notEqual(label.badge.key, 'displayOriginal')
        }
        for (const text of allLabelTexts(label)) {
          assert.ok(text.text.trim().length > 0, `label ${text.key} must never be blank`)
        }
      }
    }
  }
  assert.equal(thirdPartyPositives, 0, 'licensed third-party artwork is never badged as an original')
  assert.equal(positives, 1, 'only one complete evidence combination may render a positive badge')
})

/** Synthetic public-projection revision for a poster-bearing release. */
const publicRevision = (overrides = {}) => ({
  contentRef: 'fixture:content:poster-release-01',
  contentType: 'STORY',
  editionRef: 'fixture:edition:poster-release-01',
  version: '1.0.0',
  rightsStatus: 'RIGHTS_EXACT_VERSION_CLEARED',
  rightsScope: 'public',
  consentScope: 'public',
  consentExpiresAt: '2027-10-01T00:00:00.000Z',
  reviewerRef: 'principal:fixture:publisher-001',
  decidedAt: '2026-10-20T00:00:00.000Z',
  approvalState: 'PUBLISHED',
  ...overrides,
})

function resolveWith(overrides) {
  const manifest = buildReleaseManifest({
    releaseRef: 'fixture:release:poster-01',
    releaseVersion: 1,
    revisions: [publicRevision(overrides)],
  })
  const pointer = createCurrentPointer(manifest, {
    approvedAt: '2026-10-27T00:00:00.000Z',
    setBy: 'principal:fixture:release-setter-001',
  })
  return resolvePublicRevision(pointer, [manifest])
}

test('M33-05 negative: a public projection refuses a private or unlicensed poster revision', () => {
  const refusals = [
    ['draft', { approvalState: 'DRAFT' }, 'REVISION_UNAPPROVED'],
    ['in review', { approvalState: 'IN_REVIEW' }, 'REVISION_UNAPPROVED'],
    ['rights unknown', { rightsStatus: 'RIGHTS_UNKNOWN' }, 'RIGHTS_UNKNOWN'],
    ['metadata only', { rightsStatus: 'METADATA_ONLY' }, 'RIGHTS_NOT_CLEARED'],
    ['restricted', { rightsStatus: 'RESTRICTED' }, 'RIGHTS_NOT_CLEARED'],
    ['private rights scope', { rightsScope: 'INTERNAL_PREVIEW' }, 'RIGHTS_SCOPE_MISMATCH'],
    ['download-only rights scope', { rightsScope: 'DOWNLOAD' }, 'RIGHTS_SCOPE_MISMATCH'],
    ['private consent scope', { consentScope: 'PRIVATE_ARCHIVE' }, 'CONSENT_SCOPE_MISMATCH'],
    ['no consent scope', { consentScope: null }, 'CONSENT_MISSING'],
    ['expired consent', { consentExpiresAt: '2026-10-01T00:00:00.000Z' }, 'CONSENT_EXPIRED'],
  ]
  for (const [label, overrides, expected] of refusals) {
    const resolution = resolveWith(overrides)
    assert.equal(resolution.resolved, false, `${label} must not resolve publicly`)
    assert.equal(resolution.refusal, expected, label)
    assert.deepEqual(Object.keys(resolution).sort(), ['refusal', 'resolved'], 'a refusal carries no content reference')
    const serialized = JSON.stringify(resolution)
    assert.equal(serialized.includes('poster-release-01'), false, 'a refusal must not leak the poster content ref')
  }
})

test('M33-05 positive: only an exact-version, publicly cleared poster revision can project, and it carries no media bytes', () => {
  const resolution = resolveWith({})
  assert.equal(resolution.resolved, true)
  assert.equal(resolution.refusal, null)
  assert.deepEqual(Object.keys(resolution.revision).sort(), [
    'approvalState',
    'consentScope',
    'contentRef',
    'contentType',
    'decidedAt',
    'editionRef',
    'manifestHash',
    'pointerVersion',
    'reviewerRef',
    'rightsStatus',
    'version',
  ])
  const serialized = JSON.stringify(resolution)
  for (const forbidden of ['objectKey', 'digest', 'credit', 'media', 'imageBytes', 'signedUrl', 'grant']) {
    assert.equal(
      Object.keys(resolution.revision).some((key) => key.toLowerCase() === forbidden.toLowerCase()),
      false,
      `a public projection revision must not carry a "${forbidden}" field`,
    )
  }
  assert.ok(serialized.length < 2_048, 'a public projection revision carries references only, never bytes')

  // The public projection vocabulary has no media/artwork type at all: a private
  // poster has no projection path until a reviewed contract adds one.
  assert.deepEqual([...RELEASE_CONTENT_TYPES], ['TEXT', 'TESTIMONY', 'STORY'])
  assert.equal(RELEASE_CONTENT_TYPES.includes('POSTER'), false)
  assert.equal(RELEASE_CONTENT_TYPES.includes('IMAGE'), false)

  // Every non-cleared rights status stays out of the public projection.
  for (const status of ['METADATA_ONLY', 'RESTRICTED', 'RIGHTS_UNKNOWN']) {
    assert.equal(resolveWith({ rightsStatus: status }).resolved, false, status)
  }
})

test('M33-05 negative: a download grant is bound to one exact object and expires', async () => {
  const secret = 'fixture-only-grant-secret-00000000000000000001'
  const objectKeyA = `sha256/${'a'.repeat(64)}`
  const objectKeyB = `sha256/${'b'.repeat(64)}`
  const now = 1_800_000_000_000
  const grant = await createDownloadGrant(secret, objectKeyA, now)

  assert.equal(grant.expiresAt, Math.floor(now / 1000) + 300, 'grants live at most five minutes')
  assert.equal(await verifyDownloadGrant(secret, grant.token, objectKeyA, now + 1_000), true)

  // Expiry boundary and beyond.
  assert.equal(await verifyDownloadGrant(secret, grant.token, objectKeyA, now + 300_000), false)
  assert.equal(await verifyDownloadGrant(secret, grant.token, objectKeyA, now + 900_000), false)
  // Cross-draft/cross-object reuse.
  assert.equal(await verifyDownloadGrant(secret, grant.token, objectKeyB, now + 1_000), false)
  // Wrong signing key, tampered signature, extra segment, opaque token.
  assert.equal(await verifyDownloadGrant('another-fixture-secret-0000000000000001', grant.token, objectKeyA, now + 1_000), false)
  const tampered = grant.token.slice(0, -1) + (grant.token.endsWith('A') ? 'B' : 'A')
  assert.equal(await verifyDownloadGrant(secret, tampered, objectKeyA, now + 1_000), false)
  assert.equal(await verifyDownloadGrant(secret, `${grant.token}.extra`, objectKeyA, now + 1_000), false)
  assert.equal(await verifyDownloadGrant(secret, 'opaque', objectKeyA, now + 1_000), false)

  // The grant token itself is the only capability; it carries the object key, so
  // it must never be persisted in a projection, URL listing or audit record.
  const decoded = Buffer.from(grant.token.split('.')[0], 'base64url').toString('utf8')
  assert.ok(decoded.startsWith(objectKeyA))
})

test('M33-05 structural: the poster contract requires scoped access, leak-free denial and attribution', () => {
  const design = read('docs/design/M33-05-private-poster-access-attribution.md')
  assert.match(design, /INTERNAL_PREVIEW` and `DOWNLOAD`, each requiring its own explicit decision scope/)
  assert.match(design, /Client-supplied roles, object URLs, cache state, and a prior poster approval are not authority\./)
  assert.match(design, /Only after that check may a trusted server retrieve bytes from ECHOLOG\./)
  assert.match(design, /must not be mislabeled as witness media to obtain that marker's behavior/)
  assert.match(design, /Public credit is emitted only with the separate exact-version publication decision\./)
  assert.match(design, /runtime private access is \*\*BLOCKED\*\*/)

  const handoff = read('docs/design/M33-04-single-renderer-review-handoff.md')
  assert.match(handoff, /sceneId \+ positive sceneVersion \+ sceneVersionDigest/)
  assert.match(handoff, /Repeating the same tuple with the same renderer version must produce the same output digest/)
  assert.match(handoff, /A D08 review approval is not publication/)

  const rights = read('docs/design/M33-03-d07-scene-version-media-rights.md')
  assert.match(rights, /`RIGHTS_UNKNOWN`, `METADATA_ONLY`, `RESTRICTED`, missing evidence, scope mismatch, digest mismatch, or withdrawn\/unknown consent is non-exportable by default\./)
  assert.match(rights, /Return no bytes or access grant when any check fails\./)

  // The public Dock generator stays a demo: it has no private upload, rights,
  // licence or credit surface into which project artwork could be misplaced.
  const generator = read('apps/dock/src/ui/client/GeneratorStudio.tsx')
  for (const forbidden of ['upload', 'attach', 'poster', 'licen', 'credit', 'rights', 'echolog', 'objectKey']) {
    assert.equal(
      generator.toLowerCase().includes(forbidden.toLowerCase()),
      false,
      `the public generator must not reference "${forbidden}"`,
    )
  }
})
