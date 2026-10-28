#!/usr/bin/env node
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const specPath = resolve('docs/design/M33-04-single-renderer-review-handoff.md')
const DIGEST = /^[a-f0-9]{64}$/
const ELIGIBLE_RIGHTS = new Set(['PUBLIC_DOMAIN', 'RIGHTS_EXACT_VERSION_CLEARED'])
const OUTPUT_FORMATS = new Set(['image/svg+xml', 'image/png'])

function validateHandoff(value) {
  const errors = []
  const scene = value?.scene
  const render = value?.renderReceipt
  const rights = value?.rightsReceipt
  const review = value?.d08Review
  if (!scene?.sceneId || !Number.isInteger(scene?.version) || scene.version < 1 || !DIGEST.test(scene?.versionDigest ?? '')) errors.push('SCENE_VERSION_INVALID')
  if (!render?.contractId || !render?.rendererVersion || !DIGEST.test(render?.inputDigest ?? '') || !DIGEST.test(render?.outputDigest ?? '')) errors.push('RENDER_RECEIPT_INVALID')
  if (render?.inputDigest !== scene?.versionDigest) errors.push('RENDER_INPUT_VERSION_MISMATCH')
  if (!OUTPUT_FORMATS.has(render?.mimeType)) errors.push('RENDER_FORMAT_NOT_ALLOWED')
  if (!DIGEST.test(render?.optionsDigest ?? '') || !Number.isInteger(render?.width) || render.width < 1 || !Number.isInteger(render?.height) || render.height < 1) errors.push('RENDER_OPTIONS_OR_DIMENSIONS_INVALID')
  if (!rights?.evidenceRef || rights?.sceneVersionDigest !== scene?.versionDigest || !DIGEST.test(rights?.evidenceDigest ?? '') || rights?.scope !== 'public') errors.push('RIGHTS_RECEIPT_INVALID')
  if (rights?.decision !== 'ALLOW' || !ELIGIBLE_RIGHTS.has(rights?.rightsStatus) || rights?.revoked === true || !['ACTIVE', 'NOT_REQUIRED'].includes(rights?.consentState)) errors.push('RIGHTS_GATE_DENIED')
  if (!review?.requestRef || review?.sceneVersionDigest !== scene?.versionDigest || review?.renderOutputDigest !== render?.outputDigest || review?.rightsEvidenceRef !== rights?.evidenceRef || review?.scope !== 'public') errors.push('REVIEW_BINDING_MISMATCH')
  if (!review?.authorRef || !review?.reviewerRef || review.authorRef === review.reviewerRef) errors.push('FOUR_EYES_REVIEW_REQUIRED')
  if (!review?.d00AuthorizationRef || !Number.isFinite(Date.parse(review?.decidedAt ?? '')) || review?.approvalState !== 'APPROVED_WITHIN_SCOPE') errors.push('D08_REVIEW_EVIDENCE_INVALID')
  return [...new Set(errors)]
}

function validFixture(overrides = {}) {
  const sceneDigest = 'a'.repeat(64)
  const outputDigest = 'b'.repeat(64)
  const optionsDigest = 'c'.repeat(64)
  const rightsDigest = 'd'.repeat(64)
  const rightsEvidenceRef = 'synthetic:d08:rights:receipt-1'
  return {
    scene: { sceneId: 'synthetic:d07:scene-1', version: 1, versionDigest: sceneDigest },
    renderReceipt: {
      contractId: 'synthetic:renderer-contract-v1', rendererVersion: 'synthetic-renderer-1',
      inputDigest: sceneDigest, outputDigest, optionsDigest, mimeType: 'image/svg+xml', width: 640, height: 480,
    },
    rightsReceipt: {
      evidenceRef: rightsEvidenceRef, evidenceDigest: rightsDigest, sceneVersionDigest: sceneDigest,
      decision: 'ALLOW', rightsStatus: 'RIGHTS_EXACT_VERSION_CLEARED', scope: 'public', revoked: false, consentState: 'ACTIVE',
    },
    d08Review: {
      requestRef: 'synthetic:d08:review-request-1', authorRef: 'synthetic:d00:author-1',
      reviewerRef: 'synthetic:d00:reviewer-2', d00AuthorizationRef: 'synthetic:d00:reviewer-authorization-1', decidedAt: '2026-10-28T00:00:00.000Z',
      approvalState: 'APPROVED_WITHIN_SCOPE', sceneVersionDigest: sceneDigest, renderOutputDigest: outputDigest,
      rightsEvidenceRef, scope: 'public',
    },
    ...overrides,
  }
}

async function main() {
  const spec = await readFile(specPath, 'utf8')
  for (const phrase of [
    'Status: scoped specification; no host decision, accepted ADR, or runtime implementation',
    'There is one authoritative renderer implementation/version',
    'D00', 'D08', 'D19 / ECHOLOG', 'M33-03 gates remain in force',
    "M33-02's `HOST-HQ` remains a recommendation only",
    'Real-media validation remains **BLOCKED**',
  ]) assert.ok(spec.includes(phrase), `required contract clause missing: ${phrase}`)

  assert.deepEqual(validateHandoff(validFixture()), [], 'valid synthetic handoff was rejected')

  const wrongRender = validFixture({ renderReceipt: { ...validFixture().renderReceipt, inputDigest: 'e'.repeat(64) } })
  assert.ok(validateHandoff(wrongRender).includes('RENDER_INPUT_VERSION_MISMATCH'))

  const missingRights = validFixture({ rightsReceipt: null })
  assert.ok(validateHandoff(missingRights).includes('RIGHTS_RECEIPT_INVALID'))
  assert.ok(validateHandoff(missingRights).includes('RIGHTS_GATE_DENIED'))

  const unknownRights = validFixture({ rightsReceipt: { ...validFixture().rightsReceipt, rightsStatus: 'RIGHTS_UNKNOWN' } })
  assert.ok(validateHandoff(unknownRights).includes('RIGHTS_GATE_DENIED'))

  const wrongRightsScope = validFixture({ rightsReceipt: { ...validFixture().rightsReceipt, scope: 'download' } })
  assert.ok(validateHandoff(wrongRightsScope).includes('RIGHTS_RECEIPT_INVALID'))

  const revoked = validFixture({ rightsReceipt: { ...validFixture().rightsReceipt, revoked: true } })
  assert.ok(validateHandoff(revoked).includes('RIGHTS_GATE_DENIED'))

  const withdrawnConsent = validFixture({ rightsReceipt: { ...validFixture().rightsReceipt, consentState: 'WITHDRAWN' } })
  assert.ok(validateHandoff(withdrawnConsent).includes('RIGHTS_GATE_DENIED'))

  const selfReview = validFixture({ d08Review: { ...validFixture().d08Review, reviewerRef: 'synthetic:d00:author-1' } })
  assert.ok(validateHandoff(selfReview).includes('FOUR_EYES_REVIEW_REQUIRED'))

  const unauthenticatedReviewer = validFixture({ d08Review: { ...validFixture().d08Review, d00AuthorizationRef: null } })
  assert.ok(validateHandoff(unauthenticatedReviewer).includes('D08_REVIEW_EVIDENCE_INVALID'))

  const wrongOutput = validFixture({ d08Review: { ...validFixture().d08Review, renderOutputDigest: 'f'.repeat(64) } })
  assert.ok(validateHandoff(wrongOutput).includes('REVIEW_BINDING_MISMATCH'))

  const untrustedFormat = validFixture({ renderReceipt: { ...validFixture().renderReceipt, mimeType: 'text/html' } })
  assert.ok(validateHandoff(untrustedFormat).includes('RENDER_FORMAT_NOT_ALLOWED'))

  console.log('M33-04 renderer/review contract: PASS')
  console.log('synthetic positive: exact scene, renderer receipt, rights gate and distinct D08 reviewer bind successfully')
  console.log('negative vectors rejected: render digest mismatch, absent/unknown/scoped/revoked rights, withdrawn consent, self-review, missing D00 reviewer authorization, output mismatch, disallowed format')
  console.log('real-media validation: BLOCKED (synthetic fixtures only; no source or rights evidence supplied)')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
