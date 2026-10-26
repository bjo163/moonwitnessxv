import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify, { type FastifyInstance } from 'fastify'
import { bootMoonQl, moonqlRest } from '@moonwitness/moonql'
import base from '@moonwitness/moonql-base'
import auth from '@moonwitness/moonql-auth'
import ontology from '@moonwitness/moonql-ontology'
import corpus from '@moonwitness/moonql-corpus'
import actors from '@moonwitness/moonql-actors'
import research, {
  P18_KEY_CANDIDATES,
  QURAN_SHA256,
  RESEARCH_META,
  RESEARCH_POLICY,
  SWING_OPERATORS,
  proposeSwing,
} from '@moonwitness/moonql-research'
import envelope from '../src/plugins/envelope.js'
import { adminHeaders, TEST_ADMIN_PASSWORD } from './helpers/auth.js'

/**
 * M13 — SRGBL v8 stages, Key Witness, and adversarial SWING hypotheses.
 *
 * The suite keeps the method honest: a missing edition/rights/exact SHA is
 * UNKNOWN (never fabricated), translation never masquerades as source,
 * speculation never becomes evidence, one bounded conclusion carries its limits,
 * the four scores never merge, and a hypothesis is a cited question that cannot
 * validate itself. Everything here is an engineering contract — not a human
 * review, rights clearance, or theological verdict.
 */

const quiet = { info: () => {}, warn: () => {} }
const dataOf = <T>(res: { json(): unknown }): T => (res.json() as { data: T }).data
const errorOf = (res: { json(): unknown }): string => (res.json() as { error: { message: string } }).error.message

type Mq = Awaited<ReturnType<typeof bootMoonQl>>
type Row = Record<string, unknown>

const AR_CASE = 'RC-QS-002-082-AR'
const ID_CASE = 'RC-QS-002-082-ID'
const OPEN_CASE = 'RC-QS-037-030-AR'

interface StageView {
  stage: string
  name: string
  question: string
  cannotProve: string
  status: 'PASS' | 'UNKNOWN' | 'FAIL'
  code: string
  reason: string
  evidenceRefs: string[]
}

interface MaturityView {
  score: number
  max: number
  verifiedLevel: string | null
  nextLevel: string | null
  pending: string[]
}

interface WitnessAssessment {
  witnessCode: string
  raw: number
  max: number
  reviewEligibility: string
  automaticCanonicalApproval: boolean
  scale: string
}

interface MetricsView {
  maturity: { status: string; score: number; max: number; verifiedLevel: string | null; pending: string[] }
  quality: {
    status: string
    score: number | null
    max: number
    profile: string | null
    method: string | null
    dimensions: Record<string, number> | null
  }
  witness: { status: string; max: number; aggregate: null; assessments: WitnessAssessment[] }
  direction: { status: string; value: number | null; range: [number, number]; count: number; reason?: string }
  combined: null
  ranking: boolean
  merged: boolean
  note: string
}

interface ReviewView {
  state: string
  label: string
  humanReviewed: boolean
  engineeringCommitIsNotHumanReview: boolean
  humanReviewAvailableInMilestone: boolean
}

interface CaseView {
  caseCode: string
  title: string
  citationKey: string
  sourceSense: string
  evidenceSha: string | null
  rightsSnapshot: string
  lens: string
  status: string
  source: {
    edition: { code: string; rightsStatus: string; provenanceSha: string | null } | null
    passage: { citationKey: string; rawTextExposed: boolean } | null
    translation: { code: string; rightsStatus: string } | null
    rawTextExposed: boolean
  }
  review: ReviewView
  stages: StageView[]
  maturity: MaturityView
  metrics: MetricsView
  frame: {
    frameCode: string
    agent: { label: string; basis: string; agentActorRef: string | null; identityClaimed: boolean }
    recipient: { label: string; basis: string }
    domain: string
    scope: string
    genre: string
    lens: string
    lensNote: string
    reviewState: string
  } | null
  frames: Array<{ frameCode: string; agent: { basis: string; agentActorRef: string | null } }>
  claims: Array<{ claimCode: string; status: string; epistemic: string; exactSha: boolean; observed: boolean }>
  relations: Array<{
    relationCode: string
    relationType: string
    lens: string
    defensibility: string
    counterReading: string | null
    presentedAsSource: boolean
    defensible: boolean
    speculative: boolean
    exactSha: boolean
  }>
  witnesses: Array<{
    witnessCode: string
    conclusion: string
    limits: string
    boundaryNote: string
    citations: string[]
    keySchemeStatus: string
    candidateSupport: WitnessAssessment | null
    claimKind: string
    humanReviewed: boolean
    reviewLabel: string
  }>
  hypotheses: Array<{
    hypothesisCode: string
    mode: string
    status: string
    lens: string
    counterReadings: string | null
    mismatchNote: string | null
    proposedFrameNote: string | null
    selfValidated: boolean
    inheritedScore: number | null
    verified: boolean
  }>
  separation: {
    defensibleRelations: number
    speculativeRelations: number
    speculativeHeldApart: boolean
    inferenceClaims: number
    unpromotedInferences: number
  }
  limits: Array<{ witnessCode: string; limits: string }>
}

interface Policies {
  failClosedUnknown: boolean
  exactShaRequired: boolean
  engineeringCommitIsNotHumanReview: boolean
  humanReviewAvailableInMilestone: boolean
  scoringSeparated: boolean
  combinedScore: null
  theologicalRanking: string
  qualityRequiresCompleteBundle: boolean
  directionRange: [number, number]
  swingMaximumDepth: number
  hypothesisSelfValidation: string
  offsideVerified: boolean
  keySchemeStatus: string
  mergedWithFaithVerdict: boolean
}

interface OverviewView {
  meta: {
    version: string
    method: string
    methodStatus: string
    p19ReleaseDecision: string
    ownerNotice: string
    pins: Record<string, { ref: string; sha256: string | null; status: string }>
  }
  policy: Policies
  issueRegister: Array<{ id: string; finding: string; status: string }>
  review: { state: string; label: string; humanReviewed: boolean; engineeringCommitIsNotHumanReview: boolean; note: string }
  counts: Record<string, number>
  stages: Array<{ stage: string; name: string; question: string; cannotProve: string; results: Record<string, number> }>
  cases: Array<{ caseCode: string; stages: Array<{ stage: string; status: string; code: string }>; maturity: MaturityView; review: ReviewView; source: { rawTextExposed: boolean } }>
  options: { keyTokens: string[]; keySchemeStatus: string; swingOperators: string[]; hypothesisModes: string[] }
}

interface TraceView {
  state: string
  trace: StageView[]
  conclusions: Array<{ witnessCode: string; conclusion: string; limits: string; boundaryNote: string; citations: string[]; humanReviewed: boolean }>
  claims: Array<{ claimCode: string; exactSha: boolean }>
  review: ReviewView & { humanReviewAvailableInMilestone: boolean }
  notice: string
}

interface HypothesisList {
  total: number
  items: CaseView['hypotheses']
  policy: { selfValidation: string; verified: boolean; inheritedScore: null }
}

interface MetricsEnvelope {
  metrics: MetricsView
  policy: {
    scoringSeparated: boolean
    combined: null
    ranking: boolean
    theologicalRanking: string
    maturityMax: number
    qualityMax: number
    witnessMax: number
    directionRange: [number, number]
  }
  review: ReviewView
}

async function makeApp() {
  const app = Fastify({ logger: false })
  const moonql = await bootMoonQl({
    addons: [base, auth, ontology, corpus, actors, research],
    env: { MOONQL_AUTH_ADMIN_PASSWORD: TEST_ADMIN_PASSWORD },
    seedPolicy: 'off',
    cronEnabled: false,
    log: quiet,
  })
  await app.register(envelope)
  await app.register(moonqlRest, { prefix: '/orm', instance: moonql })
  await app.ready()
  return { app, moonql }
}

async function getCase(app: FastifyInstance, code: string): Promise<CaseView> {
  const res = await app.inject().get(`/orm/research/case?code=${encodeURIComponent(code)}`).end()
  assert.equal(res.statusCode, 200, res.body)
  return dataOf<CaseView>(res)
}

async function idOf(moonql: Mq, model: string, where: Record<string, unknown>): Promise<string> {
  const rows = (await moonql.model(model).list({ where, limit: 1 })) as Row[]
  const row = rows[0]
  assert.ok(row, `${model} row not found for ${JSON.stringify(where)}`)
  return String(row.id)
}

test('M13-01: pinned P19 contract, issue register and engineering-only review boundary', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })

  const res = await app.inject().get('/orm/research/overview').end()
  assert.equal(res.statusCode, 200, res.body)
  const overview = dataOf<OverviewView>(res)

  assert.equal(overview.meta.method, 'srgbl-v8')
  assert.equal(overview.meta.methodStatus, 'ENGINEERING_CONTRACT_NOT_HUMAN_REVIEW')
  assert.equal(overview.meta.p19ReleaseDecision, 'BLOCKED')
  assert.equal(overview.meta.pins.p19Specs?.sha256, RESEARCH_META.pins.p19Specs.sha256)
  assert.equal(overview.meta.pins.p19Register?.status, 'READ_AT_EXACT_SHA')
  assert.equal(overview.meta.pins.p19Status?.status, 'READ_AT_EXACT_SHA')
  assert.equal(overview.meta.pins.sourceEditionMatrix?.status, 'AUDIT_ONLY_NO_CLEARANCE')
  assert.equal(overview.meta.pins.srgblXiv?.status, 'UNAVAILABLE_AT_PIN')
  assert.equal(overview.meta.pins.srgblXiv?.sha256, null, 'the unavailable XIV pin is never invented')

  assert.equal(overview.policy.failClosedUnknown, true)
  assert.equal(overview.policy.exactShaRequired, true)
  assert.equal(overview.policy.engineeringCommitIsNotHumanReview, true)
  assert.equal(overview.policy.humanReviewAvailableInMilestone, false)
  assert.equal(overview.policy.combinedScore, null)
  assert.equal(overview.policy.theologicalRanking, 'FORBIDDEN')
  assert.equal(overview.policy.scoringSeparated, true)
  assert.equal(overview.policy.directionRange[0], -2)
  assert.equal(overview.policy.directionRange[1], 2)
  assert.equal(overview.policy.swingMaximumDepth, 3)
  assert.equal(overview.policy.hypothesisSelfValidation, 'FORBIDDEN')
  assert.equal(overview.policy.offsideVerified, false)
  assert.equal(overview.policy.mergedWithFaithVerdict, false)
  assert.equal(overview.policy.keySchemeStatus, 'CANDIDATE_NOT_RATIFIED')

  assert.equal(overview.review.state, 'ENGINEERING_ONLY')
  assert.equal(overview.review.humanReviewed, false)
  assert.match(overview.review.label, /not a human review/i)
  assert.match(overview.review.note, /not a human reviewer attestation/i)

  assert.deepEqual(
    overview.issueRegister.map((entry) => entry.id).sort(),
    ['P19-REG-CI', 'P19-REG-L13', 'P19-REG-L18-L19', 'P19-REG-L25'],
  )

  assert.equal(overview.counts.cases, 3)
  assert.equal(overview.counts.frames, 3)
  assert.equal(overview.counts.claims, 5)
  assert.equal(overview.counts.relations, 2)
  assert.equal(overview.counts.witnesses, 2)
  assert.equal(overview.counts.qualityRuns, 1)
  assert.equal(overview.counts.hypotheses, 3)
  assert.equal(overview.counts.failedStageResults, 0)
  assert.ok((overview.counts.unknownStageResults ?? 0) > 0, 'an unresolved case must stay UNKNOWN')

  assert.deepEqual(
    overview.stages.map((stage) => stage.stage),
    ['S1', 'R2', 'G3', 'B4', 'L5'],
  )
  for (const stage of overview.stages) {
    assert.ok(stage.question.length > 0)
    assert.match(stage.cannotProve, /^Cannot /)
  }

  const arabic = await getCase(app, AR_CASE)
  assert.equal(arabic.stages[0]?.status, 'PASS')
  assert.equal(arabic.stages[0]?.code, 'EXACT_EDITION_SOURCE')
  assert.ok(arabic.stages[0]?.evidenceRefs.includes('quran_cairo_hafs'))
  assert.ok(arabic.stages[0]?.evidenceRefs.includes(QURAN_SHA256))
  assert.equal(arabic.source.rawTextExposed, false)
  assert.equal(arabic.source.passage?.rawTextExposed, false)
  assert.equal(arabic.review.humanReviewed, false)
  assert.equal(arabic.maturity.score, 15)
  assert.equal(JSON.stringify(arabic.source).includes('ءَامَنُوا'), false, 'source bytes are never exposed')

  const translation = await getCase(app, ID_CASE)
  assert.equal(translation.stages[0]?.status, 'PASS')
  assert.equal(translation.stages[0]?.code, 'EXACT_EDITION_TRANSLATION')
  assert.equal(translation.source.translation?.code, 'QS_2_82_id_kemenag')

  const unresolved = await getCase(app, OPEN_CASE)
  assert.equal(unresolved.stages[0]?.status, 'UNKNOWN')
  assert.equal(unresolved.stages[0]?.code, 'EDITION_UNRESOLVED')
  assert.deepEqual(
    unresolved.stages.map((stage) => stage.status),
    ['UNKNOWN', 'UNKNOWN', 'UNKNOWN', 'UNKNOWN', 'UNKNOWN'],
  )
  assert.equal(unresolved.maturity.score, 0)
  assert.equal(unresolved.maturity.verifiedLevel, null)
  assert.equal(unresolved.source.edition, null)
  assert.equal(unresolved.source.rawTextExposed, false)
})

test('M13-02: S1 fails closed on stale SHA, unresolved rights and blocked translation rights', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })

  const caseId = await idOf(moonql, 'research_cases', { caseCode: AR_CASE })
  const editionId = await idOf(moonql, 'corpus_editions', { code: 'quran_cairo_hafs' })
  const translationId = await idOf(moonql, 'corpus_translations', { code: 'QS_2_82_id_kemenag' })

  await moonql.model('research_cases').update(caseId, { evidenceSha: 'a'.repeat(64) })
  const tampered = await getCase(app, AR_CASE)
  assert.equal(tampered.stages[0]?.status, 'FAIL')
  assert.equal(tampered.stages[0]?.code, 'EVIDENCE_SHA_MISMATCH')
  assert.equal(tampered.stages[1]?.status, 'UNKNOWN')
  assert.equal(tampered.stages[1]?.code, 'UPSTREAM_S1_NOT_PASS')

  await moonql.model('research_cases').update(caseId, { evidenceSha: QURAN_SHA256 })

  await moonql.model('corpus_translations').update(translationId, { rightsStatus: 'RESTRICTED' })
  const blockedTranslation = await getCase(app, ID_CASE)
  assert.equal(blockedTranslation.stages[0]?.status, 'FAIL')
  assert.equal(blockedTranslation.stages[0]?.code, 'TRANSLATION_RIGHTS_UNRESOLVED')

  await moonql.model('corpus_translations').update(translationId, { rightsStatus: 'RIGHTS_EXACT_VERSION_CLEARED' })
  await moonql.model('corpus_editions').update(editionId, { rightsStatus: 'METADATA_ONLY' })

  const metadataOnly = await getCase(app, AR_CASE)
  assert.equal(metadataOnly.stages[0]?.status, 'UNKNOWN')
  assert.equal(metadataOnly.stages[0]?.code, 'RIGHTS_UNRESOLVED')
  assert.equal(metadataOnly.maturity.score, 0)
  assert.equal(metadataOnly.metrics.maturity.score, 0)
})

test('M13-03: translation never becomes source, and a relation is not evidence by wish', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  const headers = await adminHeaders(app, '/orm')

  const post = async (path: string, body: Record<string, unknown>) =>
    await app.inject().post(`/orm/research/${path}`).headers(headers).body(body).end()

  const inferredSupported = await post('claims/register', {
    claimCode: 'CLM-TEST-INFER-SUPPORTED',
    caseCode: AR_CASE,
    claim: 'An inference promoted to a supported text claim.',
    epistemic: 'INFERRED',
    representation: 'INFERENCE',
    status: 'SUPPORTED',
    evidenceSpan: 'inference',
    evidenceSha: QURAN_SHA256,
  })
  assert.equal(inferredSupported.statusCode, 400)
  assert.match(errorOf(inferredSupported), /only an observed text claim can be SUPPORTED/)

  const translationAsSource = await post('claims/register', {
    claimCode: 'CLM-TEST-TRANS-SOURCE',
    caseCode: ID_CASE,
    claim: 'A translation presented as original source text.',
    epistemic: 'OBSERVED_TEXT',
    representation: 'SOURCE_TEXT',
    status: 'UNKNOWN',
  })
  assert.equal(translationAsSource.statusCode, 400)
  assert.match(errorOf(translationAsSource), /translation cannot masquerade as original source text/)

  const sourceInTranslationCase = await post('claims/register', {
    claimCode: 'CLM-TEST-AR-TRANS',
    caseCode: AR_CASE,
    claim: 'A translation sense claimed for an original-Arabic case.',
    epistemic: 'OBSERVED_TEXT',
    representation: 'TRANSLATION',
    status: 'UNKNOWN',
  })
  assert.equal(sourceInTranslationCase.statusCode, 400)
  assert.match(errorOf(sourceInTranslationCase), /not a translation sense/)

  const supported = await post('claims/register', {
    claimCode: 'CLM-TEST-OBSERVED',
    caseCode: AR_CASE,
    claim: 'QS 2:82 names companions of the garden in its closing clause.',
    epistemic: 'OBSERVED_TEXT',
    representation: 'SOURCE_TEXT',
    status: 'SUPPORTED',
    evidenceSpan: 'QS 2:82 — closing reward clause',
    evidenceSha: QURAN_SHA256,
  })
  assert.equal(supported.statusCode, 201, supported.body)
  assert.equal(dataOf<{ claim: { exactSha: boolean } }>(supported).claim.exactSha, true)

  const speculationAsSource = await post('relations/register', {
    relationCode: 'REL-TEST-SPEC-AS-SOURCE',
    caseCode: AR_CASE,
    fromClaimCode: 'CLM-QS2-82-REWARD',
    toClaimCode: 'CLM-QS2-82-INFER',
    relationType: 'PARALLELS',
    lens: 'ISLAMIC_QURAN_ANCHORED',
    defensibility: 'SPECULATIVE',
    evidenceSpan: 'an extension beyond the verse',
    presentedAsSource: true,
  })
  assert.equal(speculationAsSource.statusCode, 400)
  assert.match(errorOf(speculationAsSource), /speculation can never be presented as source/)

  const neutralCorrection = await post('relations/register', {
    relationCode: 'REL-TEST-NEUTRAL-CORRECTION',
    caseCode: AR_CASE,
    fromClaimCode: 'CLM-QS2-82-COND',
    toClaimCode: 'CLM-QS2-82-REWARD',
    relationType: 'CORRECTS_WITHIN_FRAME',
    lens: 'COMPARATIVE_NEUTRAL',
    defensibility: 'SPECULATIVE',
    counterReading: 'A competing reading.',
  })
  assert.equal(neutralCorrection.statusCode, 400)
  assert.match(errorOf(neutralCorrection), /correction cannot be presented as neutral comparison/)

  const correctionWithoutCounter = await post('relations/register', {
    relationCode: 'REL-TEST-NO-COUNTER',
    caseCode: AR_CASE,
    fromClaimCode: 'CLM-QS2-82-COND',
    toClaimCode: 'CLM-QS2-82-REWARD',
    relationType: 'CORRECTS_WITHIN_FRAME',
    lens: 'ISLAMIC_QURAN_ANCHORED',
    defensibility: 'SPECULATIVE',
  })
  assert.equal(correctionWithoutCounter.statusCode, 400)
  assert.match(errorOf(correctionWithoutCounter), /must preserve a competing interpretation/)

  const crossCase = await post('relations/register', {
    relationCode: 'REL-TEST-CROSS-CASE',
    caseCode: AR_CASE,
    fromClaimCode: 'CLM-QS2-82-COND',
    toClaimCode: 'CLM-QS2-82-ID-TRANS',
    relationType: 'PARALLELS',
    lens: 'ISLAMIC_QURAN_ANCHORED',
    defensibility: 'SPECULATIVE',
  })
  assert.equal(crossCase.statusCode, 400)
  assert.match(errorOf(crossCase), /same research case/)

  const defensible = await post('relations/register', {
    relationCode: 'REL-TEST-DEFENSIBLE',
    caseCode: AR_CASE,
    fromClaimCode: 'CLM-QS2-82-COND',
    toClaimCode: 'CLM-QS2-82-REWARD',
    relationType: 'AFFIRMS',
    lens: 'ISLAMIC_QURAN_ANCHORED',
    defensibility: 'DEFENSIBLE',
    evidenceSpan: 'QS 2:82 — conditional clause to reward clause',
    evidenceSha: QURAN_SHA256,
  })
  assert.equal(defensible.statusCode, 201, defensible.body)
  assert.equal(dataOf<{ relation: { exactSha: boolean } }>(defensible).relation.exactSha, true)

  const detail = await getCase(app, AR_CASE)
  assert.equal(detail.stages[1]?.status, 'PASS')
  assert.equal(detail.stages[2]?.status, 'PASS')
  assert.equal(detail.stages[2]?.code, 'DEFENSIBLE_RELATIONS')
  assert.equal(detail.separation.defensibleRelations, 2)
  assert.equal(detail.separation.speculativeRelations, 1)
  assert.equal(detail.separation.speculativeHeldApart, true)
  assert.equal(detail.separation.inferenceClaims, 1)
  assert.equal(detail.separation.unpromotedInferences, 1)
  const speculative = detail.relations.find((relation) => relation.relationCode === 'REL-QS2-82-REWARD-INFER')
  assert.equal(speculative?.defensibility, 'SPECULATIVE')
  assert.equal(speculative?.presentedAsSource, false)
  assert.equal(speculative?.defensible, false)
})

test('M13-04: blank frames and unsupported identities are refused; OFFSIDE never edits the frame', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  const headers = await adminHeaders(app, '/orm')
  const post = async (path: string, body: Record<string, unknown>) =>
    await app.inject().post(`/orm/research/${path}`).headers(headers).body(body).end()

  const baseFrame = {
    frameCode: 'FR-TEST-ACTOR',
    caseCode: AR_CASE,
    agentLabel: 'A figure asserted by a test frame',
    agentBasis: 'ACTOR_REGISTRY',
    agentActorCode: 'fg_999',
    recipientLabel: 'A declared audience',
    recipientBasis: 'TEXTUAL_ADDRESS',
    domain: 'Test domain',
    scope: 'One bounded verse',
    genre: 'scripture',
    lens: 'ACADEMIC_HISTORICAL',
    lensNote: 'Declared test lens.',
    reviewState: 'UNREVIEWED',
  }

  const unknownActor = await post('frames/register', baseFrame)
  assert.equal(unknownActor.statusCode, 400)
  assert.match(errorOf(unknownActor), /unsupported actor identity/)

  const blankIdentity = await post('frames/register', {
    ...baseFrame,
    frameCode: 'FR-TEST-UNSPECIFIED',
    agentBasis: 'UNSPECIFIED',
    agentActorCode: null,
    agentLabel: 'UNSPECIFIED',
  })
  assert.equal(blankIdentity.statusCode, 400)
  assert.match(errorOf(blankIdentity), /explicit reason/)

  const resolvedActor = await post('frames/register', {
    ...baseFrame,
    agentActorCode: 'fg_001',
  })
  assert.equal(resolvedActor.statusCode, 201, resolvedActor.body)
  const resolved = dataOf<{ frame: { agentBasis: string; agentActorRef: string | null; reviewState: string } }>(
    resolvedActor,
  )
  assert.equal(resolved.frame.agentBasis, 'ACTOR_REGISTRY')
  assert.ok(resolved.frame.agentActorRef, 'a real figure registry id resolves')
  assert.equal(resolved.frame.reviewState, 'UNREVIEWED')

  const before = await getCase(app, AR_CASE)
  assert.equal(before.stages[3]?.status, 'PASS')
  assert.equal(before.stages[3]?.code, 'FRAMES_DECLARED')
  assert.equal(before.frames.length, 2)
  assert.ok(before.frames.some((frame) => frame.frameCode === 'FR-TEST-ACTOR'))

  const mismatch = await post('offside/diagnose', {
    frameCode: 'FR-QS2-82-ISLAMIC',
    recipient: 'A different audience asserted by a proposed reading',
  })
  assert.equal(mismatch.statusCode, 200, mismatch.body)
  const diag = dataOf<{
    state: string
    reason: string
    differences: string[]
    proposedFrame: Record<string, string>
    verified: boolean
    storedFrameUnchanged: boolean
  }>(mismatch)
  assert.equal(diag.state, 'candidate-offside')
  assert.equal(diag.reason, 'evidence_mismatch')
  assert.deepEqual(diag.differences, ['recipient'])
  assert.equal(diag.proposedFrame.recipient, 'A different audience asserted by a proposed reading')
  assert.equal(diag.proposedFrame.agent, before.frame?.agent.label)
  assert.equal(diag.verified, false)
  assert.equal(diag.storedFrameUnchanged, true)

  const matchingFrame = {
    agent: before.frame?.agent.label ?? '',
    recipient: before.frame?.recipient.label ?? '',
    domain: before.frame?.domain ?? '',
    scope: before.frame?.scope ?? '',
    genre: before.frame?.genre ?? '',
  }
  const noMismatch = await post('offside/diagnose', { frameCode: 'FR-QS2-82-ISLAMIC', ...matchingFrame })
  assert.equal(noMismatch.statusCode, 200, noMismatch.body)
  assert.equal(dataOf<{ state: string }>(noMismatch).state, 'no-detected-mismatch')

  const after = await getCase(app, AR_CASE)
  assert.equal(after.frame?.recipient.label, before.frame?.recipient.label, 'stored frame is untouched')
  assert.equal(after.frame?.frameCode, 'FR-QS2-82-ISLAMIC')
})

test('M13-05: a Key Witness is one cited bounded reading with explicit limits', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  const headers = await adminHeaders(app, '/orm')
  const post = async (path: string, body: Record<string, unknown>) =>
    await app.inject().post(`/orm/research/${path}`).headers(headers).body(body).end()

  const baseWitness = {
    witnessCode: 'KW-TEST-01',
    caseCode: AR_CASE,
    frameCode: 'FR-QS2-82-ISLAMIC',
    claimCode: 'CLM-QS2-82-COND',
    keyToken: 'trust',
    direction: -1,
    intensity: 1,
    confidencePct: 50,
    weight: 2,
    conclusion: 'A single bounded test conclusion tied to the verse.',
    limits: 'One verse only; no person-level verdict and no ranking.',
    contextNote: 'Immediate verse context.',
    boundaryNote: 'Not a divine judgment and not a salvation verdict.',
    evidenceRef: 'QS 2:82 @ quran_cairo_hafs',
    evidenceSha: QURAN_SHA256,
    sourceFidelity: 5,
    observability: 5,
    semanticConsistency: 5,
    crossReference: 5,
    nonOverlapping: 5,
    claimKind: 'BOUNDED_DERIVED_READING',
    reviewState: 'UNREVIEWED',
  }

  const divineJudgment = await post('witnesses/register', { ...baseWitness, claimKind: 'DIVINE_JUDGMENT' })
  assert.equal(divineJudgment.statusCode, 400)
  assert.match(errorOf(divineJudgment), /cannot be a divine judgment/)

  const wrongSha = await post('witnesses/register', { ...baseWitness, evidenceSha: 'b'.repeat(64) })
  assert.equal(wrongSha.statusCode, 400)
  assert.match(errorOf(wrongSha), /exact source digest/)

  const blankConclusion = await post('witnesses/register', { ...baseWitness, conclusion: '   ' })
  assert.equal(blankConclusion.statusCode, 400)
  assert.match(errorOf(blankConclusion), /requires conclusion/)

  const created = await post('witnesses/register', baseWitness)
  assert.equal(created.statusCode, 201, created.body)
  const saved = dataOf<{
    witness: { witnessCode: string; humanReviewed: boolean; candidateSupport: WitnessAssessment }
  }>(created)
  assert.equal(saved.witness.humanReviewed, false)
  assert.equal(saved.witness.candidateSupport.raw, 25)
  assert.equal(saved.witness.candidateSupport.max, 100)
  assert.equal(saved.witness.candidateSupport.reviewEligibility, 'needs-more-evidence')
  assert.equal(saved.witness.candidateSupport.automaticCanonicalApproval, false)

  const detail = await getCase(app, AR_CASE)
  assert.equal(detail.stages[4]?.status, 'PASS')
  assert.equal(detail.stages[4]?.code, 'BOUNDED_READING')
  assert.equal(detail.witnesses.length, 2)
  for (const witness of detail.witnesses) {
    assert.ok(witness.limits.length > 0)
    assert.equal(witness.humanReviewed, false)
    assert.match(witness.reviewLabel, /not a human review/i)
    assert.equal(witness.claimKind, 'BOUNDED_DERIVED_READING')
  }

  const traceRes = await app.inject().get(`/orm/research/trace?code=${encodeURIComponent(AR_CASE)}`).end()
  assert.equal(traceRes.statusCode, 200, traceRes.body)
  const trace = dataOf<TraceView>(traceRes)
  assert.equal(trace.trace.length, 5)
  assert.equal(trace.conclusions.length, 2)
  for (const conclusion of trace.conclusions) {
    assert.ok(conclusion.limits.length > 0)
    assert.ok(conclusion.citations.length > 0)
    assert.equal(conclusion.humanReviewed, false)
  }
  assert.match(trace.notice, /checksum is not a human signature/i)
  assert.equal(trace.review.humanReviewAvailableInMilestone, false)
})

test('M13-06: maturity, quality, witness support and direction stay independent', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  const headers = await adminHeaders(app, '/orm')

  const metricsRes = await app.inject().get(`/orm/research/metrics?code=${encodeURIComponent(AR_CASE)}`).end()
  assert.equal(metricsRes.statusCode, 200, metricsRes.body)
  const metrics = dataOf<MetricsEnvelope>(metricsRes)
  assert.equal(metrics.metrics.maturity.score, 15)
  assert.equal(metrics.metrics.maturity.max, 15)
  assert.equal(metrics.metrics.quality.status, 'scored')
  assert.equal(metrics.metrics.quality.score, 28)
  assert.equal(metrics.metrics.quality.max, 40)
  assert.equal(Object.keys(metrics.metrics.quality.dimensions ?? {}).length, 10)
  assert.equal(metrics.metrics.witness.status, 'scored')
  assert.equal(metrics.metrics.witness.aggregate, null)
  assert.equal(metrics.metrics.witness.assessments[0]?.raw, 75)
  assert.equal(metrics.metrics.witness.assessments[0]?.reviewEligibility, 'eligible-for-review')
  assert.equal(metrics.metrics.witness.assessments[0]?.automaticCanonicalApproval, false)
  assert.equal(metrics.metrics.direction.status, 'scored')
  assert.equal(metrics.metrics.direction.value, 2)
  assert.equal(metrics.metrics.direction.range[0], -2)
  assert.equal(metrics.metrics.direction.range[1], 2)
  assert.equal(metrics.metrics.combined, null)
  assert.equal(metrics.metrics.ranking, false)
  assert.equal(metrics.metrics.merged, false)
  assert.equal(metrics.policy.combined, null)
  assert.equal(metrics.policy.maturityMax, 15)
  assert.equal(metrics.policy.qualityMax, 40)
  assert.equal(metrics.policy.witnessMax, 100)

  const translationMetrics = dataOf<MetricsEnvelope>(
    await app.inject().get(`/orm/research/metrics?code=${encodeURIComponent(ID_CASE)}`).end(),
  )
  assert.equal(translationMetrics.metrics.maturity.score, 3)
  assert.equal(translationMetrics.metrics.quality.status, 'unknown')
  assert.equal(translationMetrics.metrics.quality.score, null)
  assert.equal(translationMetrics.metrics.witness.assessments[0]?.raw, 0)
  assert.equal(translationMetrics.metrics.witness.assessments[0]?.reviewEligibility, 'needs-more-evidence')
  assert.equal(translationMetrics.metrics.direction.status, 'unknown')
  assert.equal(translationMetrics.metrics.direction.value, null)
  assert.match(translationMetrics.metrics.direction.reason ?? '', /no positive evidence weight/)
  assert.equal(translationMetrics.metrics.combined, null)

  const postQuality = async (body: Record<string, unknown>) =>
    await app.inject().post('/orm/research/quality/register').headers(headers).body(body).end()

  const qualityBase = {
    runCode: 'QR-TEST-01',
    caseCode: AR_CASE,
    method: 'srgbl-v8',
    profile: 'test-profile',
  }
  const outOfRange = await postQuality({
    ...qualityBase,
    sGrounding: 5,
    rAccuracy: 4,
    gSupport: 4,
    bDiscipline: 4,
    lResponsibility: 4,
    provenance: 4,
    unknownHonesty: 4,
    alternativeCoverage: 4,
    confidenceCalibration: 4,
    actionUsefulness: 4,
  })
  assert.equal(outOfRange.statusCode, 400)

  const missingDimension = await postQuality({
    ...qualityBase,
    runCode: 'QR-TEST-02',
    sGrounding: 4,
    rAccuracy: 4,
    gSupport: 4,
    bDiscipline: 4,
    lResponsibility: 4,
    provenance: 4,
    unknownHonesty: 4,
    alternativeCoverage: 4,
    confidenceCalibration: 4,
  })
  assert.equal(missingDimension.statusCode, 400, 'missing is not zero')

  const full = await postQuality({
    ...qualityBase,
    runCode: 'QR-TEST-03',
    sGrounding: 4,
    rAccuracy: 4,
    gSupport: 4,
    bDiscipline: 4,
    lResponsibility: 4,
    provenance: 4,
    unknownHonesty: 4,
    alternativeCoverage: 4,
    confidenceCalibration: 4,
    actionUsefulness: 4,
  })
  assert.equal(full.statusCode, 201, full.body)
  assert.equal(dataOf<{ run: { score: { raw: number; max: number } } }>(full).run.score.raw, 40)

  const qualityId = await idOf(moonql, 'research_quality_runs', { runCode: 'QR-TEST-03' })
  await assert.rejects(
    () => moonql.model('research_quality_runs').update(qualityId, { sGrounding: 0 }),
    /append-only/,
  )
})

test('M13-07: SWING is bounded, deterministic and never inherits truth', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  const headers = await adminHeaders(app, '/orm')

  const swing = async (
    operators: string,
    triple: { subject?: string; relation?: string; object?: string } = {},
  ) =>
    await app.inject()
      .post('/orm/research/swing/propose')
      .headers(headers)
      .body({
        subject: triple.subject ?? 'conditional belief',
        relation: triple.relation ?? 'conditions',
        object: triple.object ?? 'garden reward',
        operators,
      })
      .end()

  for (const operator of SWING_OPERATORS) {
    const res = await swing(operator)
    assert.equal(res.statusCode, 200, res.body)
    const proposed = dataOf<{
      candidates: Array<{
        operator: string
        depth: number
        state: string
        evidenceStatus: string
        inheritedScore: null
      }>
      policy: { reverseTransformationIsTruth: boolean; maximumDepth: number }
      inheritedScore: null
    }>(res)
    assert.equal(proposed.candidates.length, 1)
    assert.equal(proposed.candidates[0]?.operator, operator)
    assert.equal(proposed.candidates[0]?.depth, 1)
    assert.equal(proposed.candidates[0]?.state, 'CANDIDATE')
    assert.equal(proposed.candidates[0]?.evidenceStatus, 'UNVERIFIED')
    assert.equal(proposed.candidates[0]?.inheritedScore, null)
    assert.equal(proposed.inheritedScore, null)
    assert.equal(proposed.policy.reverseTransformationIsTruth, false)
    assert.equal(proposed.policy.maximumDepth, 3)
  }

  const tooDeep = await swing('direction,polarity,perspective,temporal')
  assert.equal(tooDeep.statusCode, 400)
  assert.match(errorOf(tooDeep), /one to three/)

  const unknownOperator = await swing('reverse')
  assert.equal(unknownOperator.statusCode, 400)
  assert.match(errorOf(unknownOperator), /unknown SWING operator/)

  const duplicate = await swing('cause-effect,cause-effect,cause-effect')
  assert.equal(duplicate.statusCode, 200, duplicate.body)
  const duplicateData = dataOf<{ candidates: unknown[]; stop: string }>(duplicate)
  assert.equal(duplicateData.stop, 'duplicate-candidate')
  assert.equal(duplicateData.candidates.length, 2, 'no hidden fourth hop')

  const cycle = await swing('cause-effect', {
    subject: 'same node',
    relation: 'candidate-possible-cause-of',
    object: 'same node',
  })
  assert.equal(cycle.statusCode, 200, cycle.body)
  const cycleData = dataOf<{ candidates: unknown[]; stop: string }>(cycle)
  assert.equal(cycleData.stop, 'cycle')
  assert.equal(cycleData.candidates.length, 0)

  const depthFour = () =>
    proposeSwing({
      operator: 'direction',
      subject: 'a',
      relation: 'points to',
      object: 'b',
      depth: 4,
    })
  assert.throws(depthFour, /maximum swing depth is 3/)

  const first = proposeSwing({ operator: 'polarity', subject: 'a', relation: 'points to', object: 'b', depth: 1 })
  assert.throws(
    () =>
      proposeSwing({
        operator: 'polarity',
        subject: 'a',
        relation: 'points to',
        object: 'b',
        depth: 1,
        seenSignatures: [first.signature],
      }),
    /duplicate/,
  )
})

test('M13-07: Positive Correction/OFFSIDE require a declared lens, preserved counter-readings and independent corroboration', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  const headers = await adminHeaders(app, '/orm')
  const post = async (path: string, body: Record<string, unknown>) =>
    await app.inject().post(`/orm/research/${path}`).headers(headers).body(body).end()

  const listRes = await app.inject().get('/orm/research/hypotheses').end()
  assert.equal(listRes.statusCode, 200, listRes.body)
  const list = dataOf<HypothesisList>(listRes)
  assert.equal(list.total, 3)
  assert.deepEqual(
    list.items.map((entry) => entry.mode).sort(),
    ['OFFSIDE', 'POSITIVE_CORRECTION', 'SWING'],
  )
  for (const item of list.items) {
    assert.equal(item.status, 'CANDIDATE')
    assert.equal(item.selfValidated, false)
    assert.equal(item.inheritedScore, null)
    assert.equal(item.verified, false)
  }
  assert.equal(list.policy.selfValidation, 'FORBIDDEN')
  assert.equal(list.policy.inheritedScore, null)

  const positive = list.items.find((entry) => entry.mode === 'POSITIVE_CORRECTION')
  assert.equal(positive?.lens, 'ISLAMIC_QURAN_ANCHORED')
  assert.ok(positive?.counterReadings)
  const offside = list.items.find((entry) => entry.mode === 'OFFSIDE')
  assert.ok(offside?.mismatchNote)
  assert.ok(offside?.proposedFrameNote)

  const hypothesisBase = {
    hypothesisCode: 'HYP-TEST-PC',
    caseCode: AR_CASE,
    frameCode: 'FR-QS2-82-ISLAMIC',
    mode: 'POSITIVE_CORRECTION',
    question: 'Within the declared lens, does the verse correct the identity-only reading?',
    evidenceSpan: 'QS 2:82 — conditional clause',
    evidenceSha: QURAN_SHA256,
    lens: 'ISLAMIC_QURAN_ANCHORED',
    counterReadings: 'Preserve the reading that defines neither belief nor righteous action.',
    proposedBy: 'M13 test proposer',
  }

  const neutralCorrection = await post('hypotheses/register', {
    ...hypothesisBase,
    hypothesisCode: 'HYP-TEST-PC-NEUTRAL',
    lens: 'COMPARATIVE_NEUTRAL',
  })
  assert.equal(neutralCorrection.statusCode, 400)
  assert.match(errorOf(neutralCorrection), /declared, non-neutral lens/)

  const missingCounter = await post('hypotheses/register', {
    ...hypothesisBase,
    hypothesisCode: 'HYP-TEST-PC-NO-COUNTER',
    counterReadings: null,
  })
  assert.equal(missingCounter.statusCode, 400)
  assert.match(errorOf(missingCounter), /preserve competing interpretations/)

  const wrongSha = await post('hypotheses/register', {
    ...hypothesisBase,
    hypothesisCode: 'HYP-TEST-PC-SHA',
    evidenceSha: 'c'.repeat(64),
  })
  assert.equal(wrongSha.statusCode, 400)
  assert.match(errorOf(wrongSha), /exact source digest/)

  const invalidOperator = await post('hypotheses/register', {
    hypothesisCode: 'HYP-TEST-SWING-BAD',
    caseCode: AR_CASE,
    mode: 'SWING',
    operator: 'reverse',
    question: 'An undeclared operator.',
    evidenceSpan: 'QS 2:82 — conditional clause',
    evidenceSha: QURAN_SHA256,
    lens: 'ISLAMIC_QURAN_ANCHORED',
    proposedBy: 'M13 test proposer',
  })
  assert.equal(invalidOperator.statusCode, 400)

  const offsideMissingNote = await post('hypotheses/register', {
    hypothesisCode: 'HYP-TEST-OFFSIDE-BAD',
    caseCode: AR_CASE,
    mode: 'OFFSIDE',
    question: 'Is the evidence frame assigned to another recipient?',
    evidenceSpan: 'QS 2:82 — frame comparison',
    evidenceSha: QURAN_SHA256,
    lens: 'ISLAMIC_QURAN_ANCHORED',
    proposedFrameNote: 'Examine the recipient; human-only decision.',
    proposedBy: 'M13 test proposer',
  })
  assert.equal(offsideMissingNote.statusCode, 400)
  assert.match(errorOf(offsideMissingNote), /requires mismatchNote/)

  const created = await post('hypotheses/register', hypothesisBase)
  assert.equal(created.statusCode, 201, created.body)
  const createdView = dataOf<{
    hypothesis: { status: string; selfValidated: boolean; inheritedScore: null; verified: boolean }
  }>(created)
  assert.equal(createdView.hypothesis.status, 'CANDIDATE')
  assert.equal(createdView.hypothesis.selfValidated, false)
  assert.equal(createdView.hypothesis.inheritedScore, null)
  assert.equal(createdView.hypothesis.verified, false)

  const selfValidation = await post('hypotheses/validate', {
    hypothesisCode: 'HYP-POSCORR-QS2-82-01',
    validatedBy: 'M13 engineering seed',
    decision: 'KEEP_CANDIDATE',
    reason: 'I agree with myself.',
  })
  assert.equal(selfValidation.statusCode, 400)
  assert.match(errorOf(selfValidation), /own proposer/)

  const corroborateWithoutSource = await post('hypotheses/validate', {
    hypothesisCode: 'HYP-POSCORR-QS2-82-01',
    validatedBy: 'Independent structural check',
    decision: 'CORROBORATE',
    reason: 'A second independent source should be named.',
  })
  assert.equal(corroborateWithoutSource.statusCode, 400)
  assert.match(errorOf(corroborateWithoutSource), /independent source reference/)

  const rejectWithoutReason = await post('hypotheses/validate', {
    hypothesisCode: 'HYP-OFFSIDE-QS2-82-01',
    validatedBy: 'Independent structural check',
    decision: 'REJECT',
    reason: '   ',
  })
  assert.equal(rejectWithoutReason.statusCode, 400)

  const corroborated = await post('hypotheses/validate', {
    hypothesisCode: 'HYP-POSCORR-QS2-82-01',
    validatedBy: 'Independent structural check',
    decision: 'CORROBORATE',
    independentSourceRef: 'QS 2:82 @ quran_cairo_hafs (second structural pass)',
    reason: 'The conditional structure is confirmed against the same exact digest.',
  })
  assert.equal(corroborated.statusCode, 200, corroborated.body)
  const corroboratedView = dataOf<{
    hypothesis: { status: string; verified: boolean; humanReviewed: boolean; inheritedScore: null }
    notice: string
  }>(corroborated)
  assert.equal(corroboratedView.hypothesis.status, 'CORROBORATED')
  assert.equal(corroboratedView.hypothesis.verified, false)
  assert.equal(corroboratedView.hypothesis.humanReviewed, false)
  assert.equal(corroboratedView.hypothesis.inheritedScore, null)
  assert.match(corroboratedView.notice, /not truth by inversion/i)

  const rejected = await post('hypotheses/validate', {
    hypothesisCode: 'HYP-OFFSIDE-QS2-82-01',
    validatedBy: 'Independent structural check',
    decision: 'REJECT',
    reason: 'The proposed frame is not supported by the exact text.',
  })
  assert.equal(rejected.statusCode, 200, rejected.body)
  assert.equal(dataOf<{ hypothesis: { status: string } }>(rejected).hypothesis.status, 'REJECTED')

  const after = dataOf<HypothesisList>(await app.inject().get('/orm/research/hypotheses').end())
  assert.equal(after.total, 4)
  assert.ok(after.items.some((entry) => entry.hypothesisCode === 'HYP-TEST-PC' && entry.status === 'CANDIDATE'))
  assert.ok(after.items.every((entry) => entry.selfValidated === false))
  assert.equal(P18_KEY_CANDIDATES.length, 20)
  assert.equal(RESEARCH_POLICY.positiveCorrectionRequiresDeclaredLens, true)
})
