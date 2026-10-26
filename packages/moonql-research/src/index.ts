import {
  ADMIN_ONLY,
  ADMIN_WRITE,
  bool,
  defineAddon,
  defineModel,
  int,
  m2o,
  sel,
  str,
  text,
  ts,
  type EndpointCtx,
} from '@moonwitness/moonql'
import { badRequest, conflict, forbidden, notFound } from '@moonwitness/core'
import {
  CASE_SEED,
  CLAIM_REPRESENTATIONS,
  CLAIM_SEED,
  CLAIM_STATUSES,
  CLEARED_RIGHTS,
  COUNTEREVIDENCE_SEED,
  COUNTEREVIDENCE_STATUSES,
  DECIDED_AT,
  DEFENSIBILITY,
  EPISTEMIC_KINDS,
  FRAME_SEED,
  HYPOTHESIS_MODES,
  HYPOTHESIS_SEED,
  HYPOTHESIS_STATUSES,
  KEY_SCHEME,
  M14_POLICY,
  MIZAN_CRITERIA,
  MIZAN_METHOD_CODE,
  MIZAN_METHOD_SEED,
  MIZAN_METHOD_SHA256,
  MIZAN_METHOD_STATUS,
  MIZAN_METHOD_TEXT,
  MIZAN_METHOD_VERSION,
  MIZAN_SCALE_MAX,
  MIZAN_SCALE_MIN,
  P18_KEY_CANDIDATES,
  PILOT_ASSESSMENTS,
  QUALITY_DIMENSIONS,
  QUALITY_SEED,
  RELATION_SEED,
  RESEARCH_LENSES,
  REVIEW_ACTIONS,
  REVIEW_DECISIONS,
  REVIEW_MACHINE_STATES,
  REVIEW_STATES,
  REVIEW_TARGET_KINDS,
  RIGHTS_STATUSES,
  SOURCE_SENSES,
  SRGBL_RELATION_TYPES,
  SWING_OPERATORS,
  WITNESS_COMPONENT_MAX,
  WITNESS_SEED,
  type SwingOperator,
} from './seed.js'
import {
  asText,
  diagnoseOffside,
  isSha256,
  nonEmpty,
  proposeSwingChain,
  scoreQuality,
  scoreWitness,
} from './gates.js'
import {
  listHypotheses,
  researchCase,
  researchMetrics,
  researchOverview,
  researchTrace,
} from './projection.js'
import {
  ACTION_TARGET_STATE,
  canTransition,
  eventKeyFor,
  mizanRunIsBounded,
  pilotStatus,
  releaseVerdict,
  scoreMizan,
  withLock,
  type PilotStatus,
  type ReviewAction,
  type ReviewState,
} from './review.js'

type Row = Record<string, unknown>
type Orm = EndpointCtx['orm']
type Repo = {
  list(query?: Record<string, unknown>): Promise<Row[]>
  create(data: Row): Promise<Row>
  update(id: string, patch: Row): Promise<Row>
}
type ModelOrm = { model(name: string): Repo }

const repo = (orm: Orm | ModelOrm, name: string): Repo => (orm as ModelOrm).model(name)
const listAll = async (orm: Orm | ModelOrm, name: string, limit = 5000): Promise<Row[]> =>
  await repo(orm, name).list({ limit })

const requireText = (row: Row, keys: readonly string[], what: string): void => {
  const missing = keys.filter((key) => !nonEmpty(row[key]))
  if (missing.length) throw badRequest(`${what} requires ${missing.join(', ')}`)
}
const rejectBlank = (patch: Row, keys: readonly string[], what: string): void => {
  for (const key of keys) {
    if (key in patch && patch[key] !== undefined && !nonEmpty(patch[key])) {
      throw badRequest(`${what} cannot blank ${key}`)
    }
  }
}
const assertSha = (value: unknown, what: string): void => {
  if (!isSha256(value)) throw badRequest(`${what} needs an exact 64-hex SHA-256 digest`)
}
const checkInt = (row: Row, key: string, min: number, max: number, what: string): void => {
  const value = row[key]
  if (value === undefined) return
  if (!Number.isInteger(value) || (value as number) < min || (value as number) > max) {
    throw badRequest(`${what} ${key} must be an integer from ${min} to ${max}`)
  }
}

async function findCase(orm: Orm | ModelOrm, code: string): Promise<Row> {
  const rows = await listAll(orm, 'research_cases')
  const row = rows.find((entry) => entry.caseCode === code)
  if (!row) throw notFound(`research case "${code}" not found`)
  return row
}
async function findCode(orm: Orm | ModelOrm, model: string, field: string, code: string, what: string): Promise<Row> {
  const rows = await listAll(orm, model)
  const row = rows.find((entry) => entry[field] === code)
  if (!row) throw notFound(`${what} "${code}" not found`)
  return row
}
const sameId = (left: unknown, right: unknown): boolean => String(left) === String(right)

// ------------------------------------------------------------- review actors

type HumanActor = { id: string; name: string; role: string }

async function humanActor(user: EndpointCtx['user'], orm: Orm | ModelOrm): Promise<HumanActor> {
  if (!user) throw forbidden('a named authenticated human is required')
  const rows = await listAll(orm, 'auth_users')
  const row = rows.find((entry) => sameId(entry.id, user.id))
  const name = nonEmpty(row?.displayName)
  const role = String(row?.role ?? '')
  const roles = (user.roles ?? []).map(String)
  if (!name) throw forbidden('the acting account has no display name; machines cannot review research')
  if (role === 'guest' || !roles.some((entry) => entry === 'admin' || entry === 'user')) {
    throw forbidden('guest or anonymous accounts cannot transition research reviews')
  }
  if (role !== 'admin' && role !== 'user') {
    throw forbidden('the acting account has no review-capable role')
  }
  return { id: String(user.id), name, role }
}

async function rowById(orm: Orm | ModelOrm, model: string, id: unknown, what: string): Promise<Row> {
  const row = (await listAll(orm, model)).find((entry) => sameId(entry.id, id))
  if (!row) throw notFound(`${what} not found`)
  return row
}

async function loadReviewTarget(
  orm: Orm | ModelOrm,
  caseRow: Row,
  targetKind: string,
  targetCode: string,
): Promise<{ target: Row; caseSha: string; targetSha: string }> {
  const model = targetKind === 'HYPOTHESIS' ? 'research_hypotheses' : 'research_claims'
  const field = targetKind === 'HYPOTHESIS' ? 'hypothesisCode' : 'claimCode'
  const target = await findCode(orm, model, field, targetCode, targetKind.toLowerCase())
  if (!sameId(target.caseRef, caseRow.id)) {
    throw badRequest('the review target must belong to the declared research case')
  }
  const caseSha = nonEmpty(caseRow.evidenceSha)
  const targetSha = nonEmpty(target.evidenceSha)
  if (!caseSha) throw badRequest('the case has no exact source digest; review cannot start')
  if (targetSha !== caseSha) {
    throw badRequest('the review target is not at the exact case source digest')
  }
  return { target, caseSha, targetSha }
}

const counterevidenceFor = async (orm: Orm | ModelOrm, review: Row): Promise<Row[]> =>
  (await listAll(orm, 'research_counterevidence')).filter(
    (entry) =>
      sameId(entry.caseRef, review.caseRef) &&
      entry.targetKind === review.targetKind &&
      entry.targetCode === review.targetCode,
  )

const runsForReview = async (orm: Orm | ModelOrm, reviewCode: unknown): Promise<Row[]> =>
  (await listAll(orm, 'mizan_runs'))
    .filter((entry) => entry.reviewCode === reviewCode)
    .sort((left, right) => String(left.createdAt).localeCompare(String(right.createdAt)))

async function methodForRun(orm: Orm | ModelOrm, run: Row | null): Promise<Row | null> {
  if (!run) return null
  const methods = await listAll(orm, 'mizan_methods')
  return (
    methods.find(
      (entry) => entry.methodCode === run.methodCode && entry.version === run.methodVersion,
    ) ?? null
  )
}

async function pilotFor(orm: Orm | ModelOrm, caseRow: Row): Promise<{ pilot: PilotStatus; annotations: Row[] }> {
  const annotations = (await listAll(orm, 'research_pilot_annotations'))
    .filter((entry) => sameId(entry.caseRef, caseRow.id))
    .sort((left, right) => String(left.createdAt).localeCompare(String(right.createdAt)))
  const pilot = pilotStatus(annotations, String(caseRow.caseCode), nonEmpty(caseRow.evidenceSha))
  return { pilot, annotations }
}

async function releaseFor(orm: Orm | ModelOrm, review: Row) {
  const caseRow = await rowById(orm, 'research_cases', review.caseRef, 'review case')
  let targetSha: string | null = null
  try {
    const target = await loadReviewTarget(orm, caseRow, String(review.targetKind), String(review.targetCode))
    targetSha = target.targetSha
  } catch {
    targetSha = null
  }
  const counterevidence = await counterevidenceFor(orm, review)
  const { pilot } = await pilotFor(orm, caseRow)
  const runs = await runsForReview(orm, review.reviewCode)
  const mizanRun = runs.at(-1) ?? null
  const method = await methodForRun(orm, mizanRun)
  return releaseVerdict({
    review,
    caseSha: nonEmpty(caseRow.evidenceSha),
    targetSha,
    counterevidence,
    pilot,
    mizanRun,
    method,
  })
}

async function reviewDetail(orm: Orm | ModelOrm, review: Row) {
  const caseRow = await rowById(orm, 'research_cases', review.caseRef, 'review case')
  const events = (await listAll(orm, 'research_review_events'))
    .filter((entry) => sameId(entry.reviewRef, review.id))
    .sort((left, right) => Number(left.versionTo) - Number(right.versionTo))
  const counterevidence = await counterevidenceFor(orm, review)
  const { pilot, annotations } = await pilotFor(orm, caseRow)
  const runs = await runsForReview(orm, review.reviewCode)
  const method = await methodForRun(orm, runs.at(-1) ?? null)
  const release = await releaseFor(orm, review)
  const caseSha = nonEmpty(caseRow.evidenceSha)
  return {
    reviewCode: review.reviewCode,
    caseCode: caseRow.caseCode,
    targetKind: review.targetKind,
    targetCode: review.targetCode,
    state: review.state,
    version: review.version,
    decision: review.decision ?? null,
    submittedBy: { id: review.submittedByRef, name: review.submittedByName, at: review.submittedAt },
    reviewer: review.reviewerRef
      ? { id: review.reviewerRef, name: review.reviewerName ?? null, at: review.decidedAt ?? null }
      : null,
    evidence: {
      caseSha,
      reviewSha: review.evidenceSha,
      exactMatch: Boolean(caseSha && review.evidenceSha === caseSha),
      source: 'research_cases.evidenceSha',
    },
    notes: {
      review: review.reviewNote ?? null,
      revision: review.revisionNote ?? null,
      dispute: review.disputeReason ?? null,
      retraction: review.retractionReason ?? null,
    },
    counterevidence: counterevidence.map((entry) => ({
      ceCode: entry.ceCode,
      sourceId: entry.sourceId,
      sourceVersion: entry.sourceVersion,
      citationKey: entry.citationKey,
      evidenceSha: entry.evidenceSha,
      exactMatch: entry.evidenceSha === caseSha,
      finding: entry.finding,
      status: entry.status,
      resolutionReason: entry.resolutionReason ?? null,
      resolvedByName: entry.resolvedByName ?? null,
      resolvedAt: entry.resolvedAt ?? null,
    })),
    pilot: { ...pilot, annotations },
    mizan: {
      policy: M14_POLICY,
      method: method
        ? {
            methodCode: method.methodCode,
            version: method.version,
            methodSha: method.methodSha,
            methodText: method.methodText,
            criteria: method.criteria,
            scaleMin: method.scaleMin,
            scaleMax: method.scaleMax,
            maxScore: method.maxScore,
            status: method.status,
          }
        : null,
      runs: runs.map((entry) => ({ ...entry, bounded: mizanRunIsBounded(entry, method) })),
      scoreIsVerdict: false,
    },
    events,
    release,
    publicationAvailable: false,
  }
}

async function transitionReview(input: {
  orm: Orm
  code: string
  action: ReviewAction
  actor: HumanActor
  expectedVersion: unknown
  reason: string | null
  patch?: Row
  guard?: (review: Row) => Promise<void> | void
}): Promise<Row> {
  const { orm, code, action, actor, expectedVersion, reason, patch = {}, guard } = input
  return withLock(`research-review:${code}`, async () => {
    const review = await findCode(orm, 'research_reviews', 'reviewCode', code, 'research review')
    const current = String(review.state) as ReviewState
    const version = Number(review.version)
    if (!Number.isInteger(expectedVersion) || expectedVersion !== version) {
      throw conflict(
        `review "${code}" changed concurrently: expected version ${String(expectedVersion)}, found ${version}`,
      )
    }
    if (!canTransition(current, action)) {
      throw badRequest(`review "${code}" cannot ${action} from ${current}`)
    }
    if (guard) await guard(review)
    const to = ACTION_TARGET_STATE[action]
    const versionTo = version + 1
    const saved = await repo(orm, 'research_reviews').update(String(review.id), {
      ...patch,
      state: to,
      version: versionTo,
    })
    await repo(orm, 'research_review_events').create({
      eventKey: eventKeyFor(code, action, versionTo),
      reviewRef: String(review.id),
      reviewCode: code,
      action,
      fromState: current,
      toState: to,
      versionFrom: version,
      versionTo,
      actorRef: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      reason: reason ?? '',
      at: new Date().toISOString(),
    })
    return saved
  })
}

function validateReviewRow(row: Row, creating: boolean): void {
  if (creating) {
    requireText(row, ['reviewCode', 'caseCode', 'targetKind', 'targetCode', 'submittedByName'], 'research review')
    assertSha(row.evidenceSha, 'a research review')
    if (row.state !== 'DRAFT' || Number(row.version) !== 1) {
      throw badRequest('a review starts as DRAFT at version 1; approval only happens through a decision transition')
    }
    if (row.reviewerRef || row.decision) {
      throw badRequest('a review cannot be created with a reviewer or decision')
    }
  } else {
    const immutable = [
      'reviewCode',
      'caseRef',
      'caseCode',
      'targetKind',
      'targetCode',
      'evidenceSha',
      'submittedByRef',
      'submittedByName',
      'submittedAt',
    ]
    for (const key of immutable) {
      if (key in row) throw badRequest(`review identity field ${key} is immutable`)
    }
    checkInt(row, 'version', 1, 1_000_000, 'research review')
  }
}

function validateEventRow(row: Row): void {
  requireText(row, ['eventKey', 'reviewCode', 'action', 'fromState', 'toState', 'actorName'], 'review event')
  const action = String(row.action) as ReviewAction
  const from = String(row.fromState) as ReviewState
  if (!(REVIEW_ACTIONS as readonly string[]).includes(action)) throw badRequest('unknown review action')
  if (row.toState !== ACTION_TARGET_STATE[action]) throw badRequest('review event target state does not match its action')
  if (!canTransition(from, action)) throw badRequest(`review event cannot ${action} from ${from}`)
  if (Number(row.versionTo) !== Number(row.versionFrom) + 1) throw badRequest('review event versions must advance by one')
}

function validateCounterevidenceRow(row: Row, creating: boolean): void {
  if (creating) {
    requireText(row, ['ceCode', 'caseCode', 'targetKind', 'targetCode', 'sourceId', 'sourceVersion', 'citationKey', 'finding'], 'counterevidence')
    assertSha(row.evidenceSha, 'counterevidence')
    if (row.status !== 'OPEN' || row.resolutionReason || row.resolvedByName) {
      throw badRequest('counterevidence starts OPEN; resolution is a named transition')
    }
  } else {
    for (const key of ['ceCode', 'caseRef', 'caseCode', 'targetKind', 'targetCode', 'sourceId', 'sourceVersion', 'citationKey', 'evidenceSha', 'finding', 'registeredByName']) {
      if (key in row) throw badRequest(`counterevidence identity field ${key} is immutable`)
    }
    if (row.status !== undefined && !(COUNTEREVIDENCE_STATUSES as readonly string[]).includes(String(row.status))) {
      throw badRequest('unknown counterevidence status')
    }
  }
}

export type { ReviewAction, ReviewState }

// ---------------------------------------------------------------- seed rows

const caseRows = async ({ orm }: { orm: Orm }) => {
  const [editions, passages, translations] = await Promise.all([
    listAll(orm, 'corpus_editions'),
    listAll(orm, 'corpus_passages'),
    listAll(orm, 'corpus_translations'),
  ])
  return CASE_SEED.map((entry) => {
    const edition = entry.editionCode ? editions.find((row) => row.code === entry.editionCode) ?? null : null
    const passage = passages.find(
      (row) =>
        row.citationKey === entry.citationKey &&
        edition !== null &&
        sameId(row.editionRef, edition.id),
    ) ?? null
    const translation = entry.translationCode
      ? translations.find((row) => row.code === entry.translationCode) ?? null
      : null
    return {
      caseCode: entry.caseCode,
      title: entry.title,
      citationKey: entry.citationKey,
      passageRef: passage ? String(passage.id) : null,
      editionRef: edition ? String(edition.id) : null,
      translationRef: translation ? String(translation.id) : null,
      sourceSense: entry.sourceSense,
      evidenceSha: entry.evidenceSha,
      rightsSnapshot: entry.rightsSnapshot,
      lens: entry.lens,
      researchStatus: entry.researchStatus,
      openedAt: DECIDED_AT,
    }
  })
}

const frameRows = FRAME_SEED.map((frame) => ({
  frameCode: frame.frameCode,
  caseRef: `@research_cases:${frame.caseCode}`,
  agentLabel: frame.agentLabel,
  agentBasis: frame.agentBasis,
  agentActorRef: null,
  agentNote: frame.agentNote,
  recipientLabel: frame.recipientLabel,
  recipientBasis: frame.recipientBasis,
  domain: frame.domain,
  scope: frame.scope,
  genre: frame.genre,
  tradition: frame.tradition,
  lens: frame.lens,
  lensNote: frame.lensNote,
  reviewState: frame.reviewState,
}))

const claimRows = CLAIM_SEED.map((claim) => ({
  claimCode: claim.claimCode,
  caseRef: `@research_cases:${claim.caseCode}`,
  claim: claim.claim,
  level: 'R2',
  epistemic: claim.epistemic,
  representation: claim.representation,
  status: claim.status,
  citationKey: claim.citationKey,
  evidenceSpan: claim.evidenceSpan,
  evidenceSha: claim.evidenceSha,
}))

const relationRows = RELATION_SEED.map((relation) => ({
  relationCode: relation.relationCode,
  caseRef: `@research_cases:${relation.caseCode}`,
  fromClaimRef: `@research_claims:${relation.fromClaimCode}`,
  toClaimRef: `@research_claims:${relation.toClaimCode}`,
  relationType: relation.relationType,
  lens: relation.lens,
  defensibility: relation.defensibility,
  evidenceSpan: relation.evidenceSpan,
  evidenceSha: relation.evidenceSha,
  counterReading: relation.counterReading,
  presentedAsSource: relation.presentedAsSource,
}))

const witnessRows = WITNESS_SEED.map((witness) => ({
  witnessCode: witness.witnessCode,
  caseRef: `@research_cases:${witness.caseCode}`,
  frameRef: `@research_frames:${witness.frameCode}`,
  claimRef: `@research_claims:${witness.claimCode}`,
  keyToken: witness.keyToken,
  scheme: witness.scheme,
  direction: witness.direction,
  intensity: witness.intensity,
  confidencePct: witness.confidencePct,
  weight: witness.weight,
  conclusion: witness.conclusion,
  limits: witness.limits,
  contextNote: witness.contextNote,
  boundaryNote: witness.boundaryNote,
  evidenceRef: witness.evidenceRef,
  citationKey: witness.citationKey,
  evidenceSha: witness.evidenceSha,
  sourceFidelity: witness.sourceFidelity,
  observability: witness.observability,
  semanticConsistency: witness.semanticConsistency,
  crossReference: witness.crossReference,
  nonOverlapping: witness.nonOverlapping,
  claimKind: witness.claimKind,
  reviewState: witness.reviewState,
  humanReviewed: false,
}))

const qualityRows = QUALITY_SEED.map((run) => ({
  runCode: run.runCode,
  caseRef: `@research_cases:${run.caseCode}`,
  method: run.method,
  profile: run.profile,
  sGrounding: run.sGrounding,
  rAccuracy: run.rAccuracy,
  gSupport: run.gSupport,
  bDiscipline: run.bDiscipline,
  lResponsibility: run.lResponsibility,
  provenance: run.provenance,
  unknownHonesty: run.unknownHonesty,
  alternativeCoverage: run.alternativeCoverage,
  confidenceCalibration: run.confidenceCalibration,
  actionUsefulness: run.actionUsefulness,
}))

const hypothesisRows = HYPOTHESIS_SEED.map((hypothesis) => ({
  hypothesisCode: hypothesis.hypothesisCode,
  caseRef: `@research_cases:${hypothesis.caseCode}`,
  frameRef: `@research_frames:${hypothesis.frameCode}`,
  mode: hypothesis.mode,
  operator: hypothesis.operator,
  question: hypothesis.question,
  citationKey: hypothesis.citationKey,
  evidenceSpan: hypothesis.evidenceSpan,
  evidenceSha: hypothesis.evidenceSha,
  lens: hypothesis.lens,
  counterReadings: hypothesis.counterReadings,
  mismatchNote: hypothesis.mismatchNote,
  proposedFrameNote: hypothesis.proposedFrameNote,
  proposedBy: hypothesis.proposedBy,
  status: hypothesis.status,
  selfValidated: hypothesis.selfValidated,
  inheritedScore: hypothesis.inheritedScore,
  independentSourceRef: hypothesis.independentSourceRef,
  validatedBy: hypothesis.validatedBy,
  verificationNote: hypothesis.verificationNote,
  verified: false,
}))

const counterevidenceRows = async ({ orm }: { orm: Orm }) => {
  const cases = await listAll(orm, 'research_cases')
  return COUNTEREVIDENCE_SEED.map((entry) => {
    const caseRow = cases.find((row) => row.caseCode === entry.caseCode)
    if (!caseRow) throw new Error(`M14 seed counterevidence references unknown case ${entry.caseCode}`)
    return {
      ...entry,
      caseRef: String(caseRow.id),
      registeredByRef: null,
    }
  })
}

const mizanMethodRows = async () =>
  MIZAN_METHOD_SEED.map((entry) => ({
    ...entry,
    registeredByRef: null,
  }))

// ------------------------------------------------------------------ helpers

const FRAME_TEXT_FIELDS = ['agentLabel', 'recipientLabel', 'domain', 'scope', 'genre', 'lensNote'] as const
const CLAIM_TEXT_FIELDS = ['claimCode', 'claim', 'citationKey'] as const
const HYPOTHESIS_TEXT_FIELDS = ['question', 'citationKey', 'evidenceSpan', 'lens', 'proposedBy'] as const

function validateFrameRow(row: Row, creating: boolean): void {
  if (creating) requireText(row, FRAME_TEXT_FIELDS, 'research frame')
  else rejectBlank(row, FRAME_TEXT_FIELDS, 'research frame')
  if (creating) requireText(row, ['agentBasis', 'recipientBasis', 'lens'], 'research frame')
  if (row.agentBasis === 'ACTOR_REGISTRY' && !nonEmpty(row.agentActorRef)) {
    throw badRequest('an ACTOR_REGISTRY frame needs a resolved actor reference')
  }
  if (row.agentBasis === 'UNSPECIFIED' && !nonEmpty(row.agentNote)) {
    throw badRequest('an UNSPECIFIED actor needs an explicit reason in agentNote')
  }
}

function validateClaimRow(row: Row, creating: boolean): void {
  if (creating) requireText(row, CLAIM_TEXT_FIELDS, 'R2 claim')
  else rejectBlank(row, CLAIM_TEXT_FIELDS, 'R2 claim')
  if (creating) requireText(row, ['epistemic', 'representation', 'status'], 'R2 claim')
  if (row.representation === 'INFERENCE' && !['INFERRED', 'INTERPRETED'].includes(String(row.epistemic))) {
    throw badRequest('an INFERENCE representation needs an inferred or interpreted epistemic status')
  }
  if (['INFERRED', 'INTERPRETED'].includes(String(row.epistemic)) && row.representation !== 'INFERENCE') {
    throw badRequest('an inferred or interpreted claim must use the INFERENCE representation')
  }
  if (row.status === 'SUPPORTED') {
    if (row.epistemic !== 'OBSERVED_TEXT') throw badRequest('only an observed text claim can be SUPPORTED')
    if (row.representation === 'INFERENCE') throw badRequest('an inference can never be a supported text claim')
    if (!nonEmpty(row.evidenceSpan)) throw badRequest('a supported R2 claim needs an exact evidence span')
    assertSha(row.evidenceSha, 'a supported R2 claim')
  }
}

function validateRelationRow(row: Row, creating: boolean): void {
  if (creating) requireText(row, ['relationCode', 'relationType', 'lens'], 'G3 relation')
  else rejectBlank(row, ['relationCode', 'relationType', 'lens'], 'G3 relation')
  if (row.fromClaimRef !== undefined && row.toClaimRef !== undefined && sameId(row.fromClaimRef, row.toClaimRef)) {
    throw badRequest('a G3 relation needs two different claims')
  }
  if (row.defensibility === 'DEFENSIBLE') {
    if (!nonEmpty(row.evidenceSpan)) throw badRequest('a defensible relation needs an evidence span')
    assertSha(row.evidenceSha, 'a defensible relation')
  }
  if (row.relationType === 'CORRECTS_WITHIN_FRAME') {
    if (row.lens === 'COMPARATIVE_NEUTRAL') throw badRequest('a correction cannot be presented as neutral comparison')
    if (!nonEmpty(row.counterReading)) throw badRequest('a correction must preserve a competing interpretation')
  }
  if (row.presentedAsSource === true && row.defensibility !== 'DEFENSIBLE') {
    throw badRequest('speculation can never be presented as source')
  }
}

function validateWitnessRow(row: Row, creating: boolean): void {
  if (creating) {
    requireText(row, ['witnessCode', 'conclusion', 'limits', 'contextNote', 'boundaryNote', 'evidenceRef', 'citationKey'], 'Key Witness')
    requireText(row, ['keyToken', 'scheme', 'claimKind', 'reviewState'], 'Key Witness')
  } else {
    rejectBlank(row, ['witnessCode', 'conclusion', 'limits', 'contextNote', 'boundaryNote', 'evidenceRef', 'citationKey'], 'Key Witness')
  }
  if (row.claimKind !== undefined && row.claimKind !== 'BOUNDED_DERIVED_READING') {
    throw badRequest('a Key Witness conclusion must be a bounded derived reading, not a divine judgment')
  }
  if (row.humanReviewed === true) {
    throw badRequest('M13 cannot record human review; that path belongs to M14')
  }
  checkInt(row, 'direction', -2, 2, 'Key Witness')
  checkInt(row, 'intensity', 1, 3, 'Key Witness')
  checkInt(row, 'confidencePct', 0, 100, 'Key Witness')
  checkInt(row, 'weight', 0, 1_000_000, 'Key Witness')
  for (const [key, maximum] of Object.entries(WITNESS_COMPONENT_MAX)) {
    checkInt(row, key, 0, maximum, 'Key Witness')
  }
  if (creating || row.evidenceSha !== undefined) assertSha(row.evidenceSha, 'a Key Witness conclusion')
}

function validateQualityRow(row: Row): void {
  requireText(row, ['runCode', 'method', 'profile'], 'quality run')
  for (const key of QUALITY_DIMENSIONS) {
    const value = row[key]
    if (!Number.isInteger(value) || (value as number) < 0 || (value as number) > 4) {
      throw badRequest(`quality ${key} must be an integer from 0 to 4`)
    }
  }
}

function validateHypothesisRow(row: Row, creating: boolean): void {
  if (creating) {
    requireText(row, ['hypothesisCode', ...HYPOTHESIS_TEXT_FIELDS, 'mode'], 'research hypothesis')
    assertSha(row.evidenceSha, 'a research hypothesis')
  } else {
    rejectBlank(row, HYPOTHESIS_TEXT_FIELDS, 'research hypothesis')
  }
  if (row.selfValidated === true) throw badRequest('a hypothesis cannot self-validate')
  if (row.inheritedScore !== undefined && row.inheritedScore !== null) {
    throw badRequest('a hypothesis cannot inherit a score from its source relation')
  }
  if (row.verified === true) throw badRequest('a hypothesis is never verified by its generator')
  if (row.mode === 'SWING') {
    if (!(SWING_OPERATORS as readonly string[]).includes(String(row.operator))) {
      throw badRequest('a SWING hypothesis needs one of the seven declared operators')
    }
  }
  if (row.mode === 'POSITIVE_CORRECTION') {
    if (row.lens === 'COMPARATIVE_NEUTRAL') throw badRequest('Positive Correction requires a declared, non-neutral lens')
    if (!nonEmpty(row.counterReadings)) throw badRequest('Positive Correction must preserve competing interpretations')
  }
  if (row.mode === 'OFFSIDE') {
    requireText(row, ['mismatchNote', 'proposedFrameNote'], 'OFFSIDE hypothesis')
  }
  if (row.status === 'CORROBORATED') {
    const validatedBy = nonEmpty(row.validatedBy)
    const proposedBy = nonEmpty(row.proposedBy)
    if (!validatedBy || !proposedBy || validatedBy === proposedBy) {
      throw badRequest('a corroborated hypothesis needs a different validator')
    }
    if (!nonEmpty(row.independentSourceRef)) {
      throw badRequest('a corroborated hypothesis needs an independent source reference')
    }
  }
  if (row.status === 'REJECTED' && !nonEmpty(row.verificationNote)) {
    throw badRequest('a rejected hypothesis needs a verification note')
  }
}

// -------------------------------------------------------------------- addon

export const research = defineAddon({
  name: 'research',
  version: '1.0.0',
  depends: ['base', 'auth', 'corpus', 'actors'],
  models: {
    research_cases: defineModel({
      label: 'Research Case',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'Research', icon: 'RC', order: 10 },
      fields: {
        caseCode: str({ maxLength: 60, unique: true }),
        title: str({ maxLength: 200, minLength: 1 }),
        citationKey: str({ maxLength: 60, minLength: 1 }),
        passageRef: m2o('corpus_passages'),
        editionRef: m2o('corpus_editions'),
        translationRef: m2o('corpus_translations'),
        sourceSense: sel(SOURCE_SENSES),
        evidenceSha: str({ maxLength: 64, null: true }),
        rightsSnapshot: sel(RIGHTS_STATUSES),
        lens: sel(RESEARCH_LENSES),
        researchStatus: sel(['OPEN', 'CLOSED', 'WITHDRAWN'], { default: 'OPEN' }),
        openedAt: ts(),
      },
      unique: [['caseCode']],
      data: { matchBy: ['caseCode'], noupdate: true, rows: caseRows },
    }),

    research_frames: defineModel({
      label: 'Research Frame',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'Research', icon: 'FR', order: 20 },
      fields: {
        frameCode: str({ maxLength: 60, unique: true }),
        caseRef: m2o('research_cases', { index: true }),
        agentLabel: str({ maxLength: 200, minLength: 1 }),
        agentBasis: sel(['TEXTUAL_SPEAKER', 'ACTOR_REGISTRY', 'UNSPECIFIED']),
        agentActorRef: m2o('actor_figures'),
        agentNote: text({ null: true }),
        recipientLabel: str({ maxLength: 200, minLength: 1 }),
        recipientBasis: sel(['TEXTUAL_ADDRESS', 'ACTOR_REGISTRY', 'UNSPECIFIED']),
        domain: str({ maxLength: 200, minLength: 1 }),
        scope: str({ maxLength: 240, minLength: 1 }),
        genre: str({ maxLength: 80, minLength: 1 }),
        tradition: str({ maxLength: 80, null: true }),
        lens: sel(RESEARCH_LENSES),
        lensNote: text(),
        reviewState: sel(REVIEW_STATES, { default: 'ENGINEERING_ONLY' }),
      },
      unique: [['frameCode']],
      data: { matchBy: ['frameCode'], noupdate: true, rows: frameRows },
    }),

    research_claims: defineModel({
      label: 'Research R2 Text Claim',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'Research', icon: 'CL', order: 30 },
      fields: {
        claimCode: str({ maxLength: 80, unique: true }),
        caseRef: m2o('research_cases', { index: true }),
        claim: text(),
        level: sel(['R2'], { default: 'R2' }),
        epistemic: sel(EPISTEMIC_KINDS),
        representation: sel(CLAIM_REPRESENTATIONS),
        status: sel(CLAIM_STATUSES, { default: 'UNKNOWN' }),
        citationKey: str({ maxLength: 60 }),
        evidenceSpan: text({ null: true }),
        evidenceSha: str({ maxLength: 64, null: true }),
      },
      unique: [['claimCode']],
      data: { matchBy: ['claimCode'], noupdate: true, rows: claimRows },
    }),

    research_relations: defineModel({
      label: 'Research G3 Relation',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'Research', icon: 'RL', order: 40 },
      fields: {
        relationCode: str({ maxLength: 100, unique: true }),
        caseRef: m2o('research_cases', { index: true }),
        fromClaimRef: m2o('research_claims', { index: true }),
        toClaimRef: m2o('research_claims', { index: true }),
        relationType: sel(SRGBL_RELATION_TYPES),
        lens: sel(RESEARCH_LENSES),
        defensibility: sel(DEFENSIBILITY, { default: 'UNKNOWN' }),
        evidenceSpan: text({ null: true }),
        evidenceSha: str({ maxLength: 64, null: true }),
        counterReading: text({ null: true }),
        presentedAsSource: bool({ default: false }),
      },
      unique: [['relationCode']],
      data: { matchBy: ['relationCode'], noupdate: true, rows: relationRows },
    }),

    research_witnesses: defineModel({
      label: 'Key Witness',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'Research', icon: 'KW', order: 50 },
      fields: {
        witnessCode: str({ maxLength: 80, unique: true }),
        caseRef: m2o('research_cases', { index: true }),
        frameRef: m2o('research_frames', { index: true }),
        claimRef: m2o('research_claims', { index: true }),
        keyToken: sel(P18_KEY_CANDIDATES),
        scheme: sel([KEY_SCHEME]),
        direction: int(),
        intensity: int(),
        confidencePct: int(),
        weight: int(),
        conclusion: text(),
        limits: text(),
        contextNote: text(),
        boundaryNote: text(),
        evidenceRef: str({ maxLength: 240 }),
        citationKey: str({ maxLength: 60 }),
        evidenceSha: str({ maxLength: 64 }),
        sourceFidelity: int(),
        observability: int(),
        semanticConsistency: int(),
        crossReference: int(),
        nonOverlapping: int(),
        claimKind: sel(['BOUNDED_DERIVED_READING', 'DIVINE_JUDGMENT', 'SALVATION_VERDICT'], {
          default: 'BOUNDED_DERIVED_READING',
        }),
        reviewState: sel(REVIEW_STATES, { default: 'ENGINEERING_ONLY' }),
        humanReviewed: bool({ default: false }),
      },
      unique: [['witnessCode']],
      data: { matchBy: ['witnessCode'], noupdate: true, rows: witnessRows },
    }),

    research_quality_runs: defineModel({
      label: 'Research Quality Run',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'Research', icon: 'QR', order: 60 },
      fields: {
        runCode: str({ maxLength: 80, unique: true }),
        caseRef: m2o('research_cases', { index: true }),
        method: str({ maxLength: 80 }),
        profile: str({ maxLength: 80 }),
        sGrounding: int(),
        rAccuracy: int(),
        gSupport: int(),
        bDiscipline: int(),
        lResponsibility: int(),
        provenance: int(),
        unknownHonesty: int(),
        alternativeCoverage: int(),
        confidenceCalibration: int(),
        actionUsefulness: int(),
      },
      unique: [['runCode']],
      data: { matchBy: ['runCode'], noupdate: true, rows: qualityRows },
    }),

    research_hypotheses: defineModel({
      label: 'Research Hypotheses',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'Research', icon: 'HY', order: 70 },
      fields: {
        hypothesisCode: str({ maxLength: 80, unique: true }),
        caseRef: m2o('research_cases', { index: true }),
        frameRef: m2o('research_frames'),
        mode: sel(HYPOTHESIS_MODES),
        operator: sel(SWING_OPERATORS, { null: true }),
        question: text(),
        citationKey: str({ maxLength: 60 }),
        evidenceSpan: text(),
        evidenceSha: str({ maxLength: 64 }),
        lens: sel(RESEARCH_LENSES),
        counterReadings: text({ null: true }),
        mismatchNote: text({ null: true }),
        proposedFrameNote: text({ null: true }),
        proposedBy: str({ maxLength: 80 }),
        status: sel(HYPOTHESIS_STATUSES, { default: 'CANDIDATE' }),
        selfValidated: bool({ default: false }),
        inheritedScore: int({ null: true }),
        independentSourceRef: str({ maxLength: 240, null: true }),
        validatedBy: str({ maxLength: 80, null: true }),
        verificationNote: text({ null: true }),
        verified: bool({ default: false }),
      },
      unique: [['hypothesisCode']],
      data: { matchBy: ['hypothesisCode'], noupdate: true, rows: hypothesisRows },
    }),

    research_reviews: defineModel({
      label: 'Research Review',
      rest: false,
      menu: { group: 'Research', icon: 'RV', order: 80 },
      fields: {
        reviewCode: str({ maxLength: 100, unique: true }),
        caseRef: m2o('research_cases', { index: true }),
        caseCode: str({ maxLength: 60 }),
        targetKind: sel(REVIEW_TARGET_KINDS),
        targetCode: str({ maxLength: 80 }),
        evidenceSha: str({ maxLength: 64 }),
        state: sel(REVIEW_MACHINE_STATES, { default: 'DRAFT' }),
        version: int({ default: 1 }),
        submittedByRef: m2o('auth_users', { index: true }),
        submittedByName: str({ maxLength: 120 }),
        submittedAt: ts(),
        reviewerRef: m2o('auth_users', { null: true }),
        reviewerName: str({ maxLength: 120, null: true }),
        decision: sel(REVIEW_DECISIONS, { null: true }),
        decidedAt: ts({ null: true }),
        reviewNote: text({ null: true }),
        revisionNote: text({ null: true }),
        disputeReason: text({ null: true }),
        retractionReason: text({ null: true }),
      },
      unique: [['reviewCode']],
    }),

    research_review_events: defineModel({
      label: 'Research Review Event',
      rest: false,
      menu: { group: 'Research', icon: 'RE', order: 85 },
      fields: {
        eventKey: str({ maxLength: 180, unique: true }),
        reviewRef: m2o('research_reviews', { index: true }),
        reviewCode: str({ maxLength: 100 }),
        action: sel(REVIEW_ACTIONS),
        fromState: sel(REVIEW_MACHINE_STATES),
        toState: sel(REVIEW_MACHINE_STATES),
        versionFrom: int(),
        versionTo: int(),
        actorRef: m2o('auth_users'),
        actorName: str({ maxLength: 120 }),
        actorRole: str({ maxLength: 20 }),
        reason: text(),
        at: ts(),
      },
      unique: [['eventKey']],
    }),

    research_counterevidence: defineModel({
      label: 'Research Counterevidence',
      rest: false,
      menu: { group: 'Research', icon: 'CE', order: 90 },
      fields: {
        ceCode: str({ maxLength: 100, unique: true }),
        caseRef: m2o('research_cases', { index: true }),
        caseCode: str({ maxLength: 60 }),
        targetKind: sel(REVIEW_TARGET_KINDS),
        targetCode: str({ maxLength: 80 }),
        sourceId: str({ maxLength: 200 }),
        sourceVersion: str({ maxLength: 80 }),
        citationKey: str({ maxLength: 60 }),
        evidenceSha: str({ maxLength: 64 }),
        finding: text(),
        registeredByRef: m2o('auth_users', { null: true }),
        registeredByName: str({ maxLength: 120 }),
        status: sel(COUNTEREVIDENCE_STATUSES, { default: 'OPEN' }),
        resolutionReason: text({ null: true }),
        resolvedByRef: m2o('auth_users', { null: true }),
        resolvedByName: str({ maxLength: 120, null: true }),
        resolvedAt: ts({ null: true }),
      },
      unique: [['ceCode']],
      data: { matchBy: ['ceCode'], noupdate: true, rows: counterevidenceRows },
    }),

    mizan_methods: defineModel({
      label: 'MIZAN Method',
      rest: false,
      menu: { group: 'Research', icon: 'MZ', order: 95 },
      fields: {
        methodCode: str({ maxLength: 100 }),
        version: str({ maxLength: 20 }),
        methodSha: str({ maxLength: 64, unique: true }),
        methodText: text(),
        criteria: text(),
        scaleMin: int(),
        scaleMax: int(),
        maxScore: int(),
        status: sel([MIZAN_METHOD_STATUS]),
        registeredByRef: m2o('auth_users', { null: true }),
        registeredByName: str({ maxLength: 120 }),
      },
      unique: [['methodCode', 'version'], ['methodSha']],
      data: { matchBy: ['methodSha'], noupdate: true, rows: mizanMethodRows },
    }),

    mizan_runs: defineModel({
      label: 'MIZAN Run',
      rest: false,
      menu: { group: 'Research', icon: 'MR', order: 96 },
      fields: {
        runCode: str({ maxLength: 100, unique: true }),
        reviewRef: m2o('research_reviews', { index: true }),
        reviewCode: str({ maxLength: 100 }),
        methodCode: str({ maxLength: 100 }),
        methodVersion: str({ maxLength: 20 }),
        methodSha: str({ maxLength: 64 }),
        targetKind: sel(REVIEW_TARGET_KINDS),
        targetCode: str({ maxLength: 80 }),
        evidenceSha: str({ maxLength: 64 }),
        scoresJson: text(),
        totalScore: int(),
        maxScore: int(),
        explanation: text(),
        context: text(),
        unknowns: text(),
        assessedByRef: m2o('auth_users'),
        assessedByName: str({ maxLength: 120 }),
      },
      unique: [['runCode']],
    }),

    research_pilot_annotations: defineModel({
      label: 'Research Pilot Annotation',
      rest: false,
      menu: { group: 'Research', icon: 'PA', order: 97 },
      fields: {
        annotationKey: str({ maxLength: 220, unique: true }),
        caseRef: m2o('research_cases', { index: true }),
        caseCode: str({ maxLength: 60 }),
        evidenceSha: str({ maxLength: 64 }),
        annotatorRef: m2o('auth_users', { index: true }),
        annotatorName: str({ maxLength: 120 }),
        assessment: sel(PILOT_ASSESSMENTS),
        note: text(),
      },
      unique: [['annotationKey']],
    }),
  },

  hooks: {
    research_cases: {
      beforeCreate: (row) => {
        requireText(row, ['caseCode', 'title', 'citationKey'], 'research case')
        requireText(row, ['sourceSense', 'rightsSnapshot', 'lens'], 'research case')
        if (row.evidenceSha !== undefined) assertSha(row.evidenceSha, 'a research case')
        if (row.rightsSnapshot === CLEARED_RIGHTS) assertSha(row.evidenceSha, 'a cleared research case')
        return row
      },
      beforeUpdate: (patch) => {
        rejectBlank(patch, ['caseCode', 'title', 'citationKey'], 'research case')
        if ('caseCode' in patch || 'citationKey' in patch || 'sourceSense' in patch) {
          throw badRequest('research case identity fields are immutable')
        }
        if (patch.evidenceSha !== undefined) assertSha(patch.evidenceSha, 'a research case')
        return patch
      },
      beforeDelete: () => {
        throw badRequest('research cases are never deleted; close or withdraw them instead')
      },
    },
    research_frames: {
      beforeCreate: (row) => {
        validateFrameRow(row, true)
        return row
      },
      beforeUpdate: (patch) => {
        validateFrameRow(patch, false)
        return patch
      },
      beforeDelete: () => {
        throw badRequest('research frames are never deleted; declare a competing frame instead')
      },
    },
    research_claims: {
      beforeCreate: (row) => {
        validateClaimRow(row, true)
        return row
      },
      beforeUpdate: (patch) => {
        validateClaimRow(patch, false)
        return patch
      },
      beforeDelete: () => {
        throw badRequest('research claims are never deleted; record an UNKNOWN or REJECTED status instead')
      },
    },
    research_relations: {
      beforeCreate: (row) => {
        validateRelationRow(row, true)
        return row
      },
      beforeUpdate: (patch) => {
        validateRelationRow(patch, false)
        return patch
      },
      beforeDelete: () => {
        throw badRequest('research relations are never deleted; mark them UNRESOLVED instead')
      },
    },
    research_witnesses: {
      beforeCreate: (row) => {
        validateWitnessRow(row, true)
        return row
      },
      beforeUpdate: (patch) => {
        validateWitnessRow(patch, false)
        return patch
      },
      beforeDelete: () => {
        throw badRequest('Key Witness conclusions are never deleted; mark them DISPUTED instead')
      },
    },
    research_quality_runs: {
      beforeCreate: (row) => {
        validateQualityRow(row)
        return row
      },
      beforeUpdate: () => {
        throw badRequest('quality runs are append-only; register a new labelled run instead')
      },
      beforeDelete: () => {
        throw badRequest('quality runs are append-only and cannot be deleted')
      },
    },
    research_hypotheses: {
      beforeCreate: (row) => {
        validateHypothesisRow(row, true)
        return row
      },
      beforeUpdate: (patch) => {
        validateHypothesisRow(patch, false)
        return patch
      },
      beforeDelete: () => {
        throw badRequest('research hypotheses are never deleted; reject or supersede them instead')
      },
    },
    research_reviews: {
      beforeCreate: (row) => {
        validateReviewRow(row, true)
        return row
      },
      beforeUpdate: (patch) => {
        validateReviewRow(patch, false)
        return patch
      },
      beforeDelete: () => {
        throw badRequest('research reviews are never deleted; retract them with a named reason instead')
      },
    },
    research_review_events: {
      beforeCreate: (row) => {
        validateEventRow(row)
        return row
      },
      beforeUpdate: () => {
        throw badRequest('review events are immutable')
      },
      beforeDelete: () => {
        throw badRequest('review events are immutable and cannot be deleted')
      },
    },
    research_counterevidence: {
      beforeCreate: (row) => {
        validateCounterevidenceRow(row, true)
        return row
      },
      beforeUpdate: (patch) => {
        validateCounterevidenceRow(patch, false)
        return patch
      },
      beforeDelete: () => {
        throw badRequest('counterevidence is never deleted; resolve it with a named reason instead')
      },
    },
    mizan_methods: {
      beforeCreate: (row) => {
        requireText(row, ['methodCode', 'version', 'methodSha', 'methodText', 'criteria', 'registeredByName'], 'MIZAN method')
        assertSha(row.methodSha, 'a MIZAN method')
        if (row.methodCode !== MIZAN_METHOD_CODE || row.version !== MIZAN_METHOD_VERSION) {
          throw badRequest('M14 binds the MIZAN workbench to its single declared method version')
        }
        if (row.methodSha !== MIZAN_METHOD_SHA256 || row.methodText !== MIZAN_METHOD_TEXT) {
          throw badRequest('the MIZAN method digest must match the canonical bounded method text')
        }
        if (row.criteria !== MIZAN_CRITERIA.map((entry) => entry.key).join(',')) {
          throw badRequest('the MIZAN criteria list is fixed and cannot be extended')
        }
        if (row.scaleMin !== MIZAN_SCALE_MIN || row.scaleMax !== MIZAN_SCALE_MAX) {
          throw badRequest(`the MIZAN scale is fixed at ${MIZAN_SCALE_MIN}..${MIZAN_SCALE_MAX}`)
        }
        if (row.maxScore !== MIZAN_CRITERIA.length * MIZAN_SCALE_MAX) {
          throw badRequest('the MIZAN maximum score must equal criteria multiplied by scale maximum')
        }
        if (row.status !== MIZAN_METHOD_STATUS) {
          throw badRequest('the MIZAN method remains a candidate; M14 cannot adopt or ratify it')
        }
        return row
      },
      beforeUpdate: () => {
        throw badRequest('MIZAN methods are versioned and immutable; register a new version instead')
      },
      beforeDelete: () => {
        throw badRequest('MIZAN methods are immutable and cannot be deleted')
      },
    },
    mizan_runs: {
      beforeCreate: (row) => {
        requireText(
          row,
          ['runCode', 'reviewCode', 'methodCode', 'methodVersion', 'targetKind', 'targetCode', 'scoresJson', 'explanation', 'context', 'unknowns', 'assessedByName'],
          'MIZAN run',
        )
        assertSha(row.methodSha, 'a MIZAN run')
        assertSha(row.evidenceSha, 'a MIZAN run')
        let scored
        try {
          scored = scoreMizan(row.scoresJson)
        } catch (error) {
          throw badRequest(error instanceof Error ? error.message : 'invalid MIZAN scores')
        }
        if (row.totalScore !== scored.totalScore || row.maxScore !== scored.maxScore) {
          throw badRequest('the MIZAN total must be computed from the six bounded criteria')
        }
        return row
      },
      beforeUpdate: () => {
        throw badRequest('MIZAN runs are append-only; record a new run instead')
      },
      beforeDelete: () => {
        throw badRequest('MIZAN runs are append-only and cannot be deleted')
      },
    },
    research_pilot_annotations: {
      beforeCreate: (row) => {
        requireText(row, ['annotationKey', 'caseCode', 'annotatorName', 'assessment', 'note'], 'pilot annotation')
        assertSha(row.evidenceSha, 'a pilot annotation')
        return row
      },
      beforeUpdate: () => {
        throw badRequest('pilot annotations are append-only; a changed assessment is a new annotation')
      },
      beforeDelete: () => {
        throw badRequest('pilot annotations are append-only and cannot be deleted')
      },
    },
  },

  endpoints: {
    overview: {
      method: 'GET',
      path: '/research/overview',
      requires: 'public',
      menu: { group: 'Research', icon: 'OV', order: 10 },
      handler: async ({ orm }) => researchOverview(orm),
    },

    case: {
      method: 'GET',
      path: '/research/case',
      requires: 'public',
      handler: async ({ query, orm }) => {
        const code = asText(query.code)
        if (!code) throw badRequest('research case code is required')
        return researchCase(orm, code)
      },
    },

    metrics: {
      method: 'GET',
      path: '/research/metrics',
      requires: 'public',
      handler: async ({ query, orm }) => {
        const code = asText(query.code)
        if (!code) throw badRequest('research case code is required')
        return researchMetrics(orm, code)
      },
    },

    trace: {
      method: 'GET',
      path: '/research/trace',
      requires: 'public',
      handler: async ({ query, orm }) => {
        const code = asText(query.code)
        if (!code) throw badRequest('research case code is required')
        return researchTrace(orm, code)
      },
    },

    hypotheses: {
      method: 'GET',
      path: '/research/hypotheses',
      requires: 'public',
      handler: async ({ query, orm }) => listHypotheses(orm, nonEmpty(query.code) ?? undefined),
    },

    claimsRegister: {
      method: 'POST',
      path: '/research/claims/register',
      requires: ADMIN_ONLY,
      body: {
        claimCode: str({ maxLength: 80, minLength: 1 }),
        caseCode: str({ maxLength: 60, minLength: 1 }),
        claim: text(),
        epistemic: sel(EPISTEMIC_KINDS),
        representation: sel(CLAIM_REPRESENTATIONS),
        status: sel(CLAIM_STATUSES),
        citationKey: str({ maxLength: 60, null: true }),
        evidenceSpan: text({ null: true }),
        evidenceSha: str({ maxLength: 64, null: true }),
      },
      handler: async ({ body, orm, status }) => {
        const caseRow = await findCase(orm, asText(body.caseCode))
        const representation = asText(body.representation)
        if (caseRow.sourceSense === 'LICENSED_TRANSLATION' && representation === 'SOURCE_TEXT') {
          throw badRequest('translation cannot masquerade as original source text')
        }
        if (caseRow.sourceSense === 'ORIGINAL_ARABIC' && representation === 'TRANSLATION') {
          throw badRequest('this case declares the original Arabic source sense, not a translation sense')
        }
        const row = {
          claimCode: asText(body.claimCode),
          caseRef: String(caseRow.id),
          claim: asText(body.claim),
          level: 'R2',
          epistemic: asText(body.epistemic),
          representation,
          status: asText(body.status),
          citationKey: asText(body.citationKey) || String(caseRow.citationKey),
          evidenceSpan: nonEmpty(body.evidenceSpan),
          evidenceSha: nonEmpty(body.evidenceSha),
        }
        if (row.status === 'SUPPORTED' && row.evidenceSha !== caseRow.evidenceSha) {
          throw badRequest('a supported R2 claim must cite the case exact source digest')
        }
        const saved = await repo(orm, 'research_claims').create(row)
        status(201)
        return {
          state: 'recorded',
          claim: {
            claimCode: saved.claimCode,
            status: saved.status,
            epistemic: saved.epistemic,
            representation: saved.representation,
            exactSha: saved.evidenceSha === caseRow.evidenceSha,
          },
          notice: 'An observed text claim needs exact evidence; inference stays unpromoted.',
        }
      },
    },

    relationsRegister: {
      method: 'POST',
      path: '/research/relations/register',
      requires: ADMIN_ONLY,
      body: {
        relationCode: str({ maxLength: 100, minLength: 1 }),
        caseCode: str({ maxLength: 60, minLength: 1 }),
        fromClaimCode: str({ maxLength: 80, minLength: 1 }),
        toClaimCode: str({ maxLength: 80, minLength: 1 }),
        relationType: sel(SRGBL_RELATION_TYPES),
        lens: sel(RESEARCH_LENSES),
        defensibility: sel(DEFENSIBILITY),
        evidenceSpan: text({ null: true }),
        evidenceSha: str({ maxLength: 64, null: true }),
        counterReading: text({ null: true }),
        presentedAsSource: bool({ default: false }),
      },
      handler: async ({ body, orm, status }) => {
        const caseRow = await findCase(orm, asText(body.caseCode))
        const from = await findCode(orm, 'research_claims', 'claimCode', asText(body.fromClaimCode), 'R2 claim')
        const to = await findCode(orm, 'research_claims', 'claimCode', asText(body.toClaimCode), 'R2 claim')
        if (!sameId(from.caseRef, caseRow.id) || !sameId(to.caseRef, caseRow.id)) {
          throw badRequest('both claims must belong to the same research case')
        }
        const row = {
          relationCode: asText(body.relationCode),
          caseRef: String(caseRow.id),
          fromClaimRef: String(from.id),
          toClaimRef: String(to.id),
          relationType: asText(body.relationType),
          lens: asText(body.lens),
          defensibility: asText(body.defensibility),
          evidenceSpan: nonEmpty(body.evidenceSpan),
          evidenceSha: nonEmpty(body.evidenceSha),
          counterReading: nonEmpty(body.counterReading),
          presentedAsSource: body.presentedAsSource === true,
        }
        if (row.defensibility === 'DEFENSIBLE' && row.evidenceSha !== caseRow.evidenceSha) {
          throw badRequest('a defensible relation must cite the case exact source digest')
        }
        const saved = await repo(orm, 'research_relations').create(row)
        status(201)
        return {
          state: 'recorded',
          relation: {
            relationCode: saved.relationCode,
            relationType: saved.relationType,
            lens: saved.lens,
            defensibility: saved.defensibility,
            exactSha: saved.evidenceSha === caseRow.evidenceSha,
          },
          notice: 'Speculation is stored as speculation; it never becomes source evidence.',
        }
      },
    },

    framesRegister: {
      method: 'POST',
      path: '/research/frames/register',
      requires: ADMIN_ONLY,
      body: {
        frameCode: str({ maxLength: 60, minLength: 1 }),
        caseCode: str({ maxLength: 60, minLength: 1 }),
        agentLabel: str({ maxLength: 200, minLength: 1 }),
        agentBasis: sel(['TEXTUAL_SPEAKER', 'ACTOR_REGISTRY', 'UNSPECIFIED']),
        agentActorCode: str({ maxLength: 8, null: true }),
        agentNote: text({ null: true }),
        recipientLabel: str({ maxLength: 200, minLength: 1 }),
        recipientBasis: sel(['TEXTUAL_ADDRESS', 'ACTOR_REGISTRY', 'UNSPECIFIED']),
        domain: str({ maxLength: 200, minLength: 1 }),
        scope: str({ maxLength: 240, minLength: 1 }),
        genre: str({ maxLength: 80, minLength: 1 }),
        tradition: str({ maxLength: 80, null: true }),
        lens: sel(RESEARCH_LENSES),
        lensNote: text(),
        reviewState: sel(REVIEW_STATES),
      },
      handler: async ({ body, orm, status }) => {
        const caseRow = await findCase(orm, asText(body.caseCode))
        const basis = asText(body.agentBasis)
        let agentActorRef: string | null = null
        if (basis === 'ACTOR_REGISTRY') {
          const actorCode = asText(body.agentActorCode)
          if (!actorCode) throw badRequest('an ACTOR_REGISTRY frame needs an actor figure code')
          const actors = await listAll(orm, 'actor_figures')
          const actor = actors.find((row) => row.figureCode === actorCode)
          if (!actor) throw badRequest(`unsupported actor identity "${actorCode}": not present in the figure registry`)
          agentActorRef = String(actor.id)
        }
        const row = {
          frameCode: asText(body.frameCode),
          caseRef: String(caseRow.id),
          agentLabel: asText(body.agentLabel),
          agentBasis: basis,
          agentActorRef,
          agentNote: nonEmpty(body.agentNote),
          recipientLabel: asText(body.recipientLabel),
          recipientBasis: asText(body.recipientBasis),
          domain: asText(body.domain),
          scope: asText(body.scope),
          genre: asText(body.genre),
          tradition: nonEmpty(body.tradition),
          lens: asText(body.lens),
          lensNote: asText(body.lensNote),
          reviewState: asText(body.reviewState),
        }
        const saved = await repo(orm, 'research_frames').create(row)
        status(201)
        return {
          state: 'recorded',
          frame: {
            frameCode: saved.frameCode,
            agentBasis: saved.agentBasis,
            agentActorRef: saved.agentActorRef ?? null,
            lens: saved.lens,
            reviewState: saved.reviewState,
          },
          notice: 'A blank frame is refused; an actor-registry identity must resolve to a real figure.',
        }
      },
    },

    witnessesRegister: {
      method: 'POST',
      path: '/research/witnesses/register',
      requires: ADMIN_ONLY,
      body: {
        witnessCode: str({ maxLength: 80, minLength: 1 }),
        caseCode: str({ maxLength: 60, minLength: 1 }),
        frameCode: str({ maxLength: 60, minLength: 1 }),
        claimCode: str({ maxLength: 80, minLength: 1 }),
        keyToken: sel(P18_KEY_CANDIDATES),
        direction: int(),
        intensity: int(),
        confidencePct: int(),
        weight: int(),
        conclusion: text(),
        limits: text(),
        contextNote: text(),
        boundaryNote: text(),
        evidenceRef: str({ maxLength: 240, minLength: 1 }),
        citationKey: str({ maxLength: 60, null: true }),
        evidenceSha: str({ maxLength: 64, minLength: 1 }),
        sourceFidelity: int(),
        observability: int(),
        semanticConsistency: int(),
        crossReference: int(),
        nonOverlapping: int(),
        claimKind: sel(['BOUNDED_DERIVED_READING', 'DIVINE_JUDGMENT', 'SALVATION_VERDICT']),
        reviewState: sel(REVIEW_STATES),
      },
      handler: async ({ body, orm, status }) => {
        const caseRow = await findCase(orm, asText(body.caseCode))
        const frame = await findCode(orm, 'research_frames', 'frameCode', asText(body.frameCode), 'research frame')
        const claim = await findCode(orm, 'research_claims', 'claimCode', asText(body.claimCode), 'R2 claim')
        if (!sameId(frame.caseRef, caseRow.id) || !sameId(claim.caseRef, caseRow.id)) {
          throw badRequest('the witness frame and claim must belong to the case')
        }
        if (asText(body.claimKind) !== 'BOUNDED_DERIVED_READING') {
          throw badRequest('a Key Witness conclusion cannot be a divine judgment or salvation verdict')
        }
        if (asText(body.evidenceSha) !== caseRow.evidenceSha) {
          throw badRequest('a Key Witness conclusion must cite the case exact source digest')
        }
        const row = {
          witnessCode: asText(body.witnessCode),
          caseRef: String(caseRow.id),
          frameRef: String(frame.id),
          claimRef: String(claim.id),
          keyToken: asText(body.keyToken),
          scheme: KEY_SCHEME,
          direction: body.direction,
          intensity: body.intensity,
          confidencePct: body.confidencePct,
          weight: body.weight,
          conclusion: asText(body.conclusion),
          limits: asText(body.limits),
          contextNote: asText(body.contextNote),
          boundaryNote: asText(body.boundaryNote),
          evidenceRef: asText(body.evidenceRef),
          citationKey: asText(body.citationKey) || String(caseRow.citationKey),
          evidenceSha: asText(body.evidenceSha),
          sourceFidelity: body.sourceFidelity,
          observability: body.observability,
          semanticConsistency: body.semanticConsistency,
          crossReference: body.crossReference,
          nonOverlapping: body.nonOverlapping,
          claimKind: asText(body.claimKind),
          reviewState: asText(body.reviewState),
          humanReviewed: false,
        }
        const saved = await repo(orm, 'research_witnesses').create(row)
        status(201)
        return {
          state: 'recorded',
          witness: {
            witnessCode: saved.witnessCode,
            claimKind: saved.claimKind,
            reviewState: saved.reviewState,
            humanReviewed: false,
            candidateSupport: scoreWitness(saved),
          },
          notice: 'One bounded conclusion with limits; it is not a divine judgment, and it is not human reviewed.',
        }
      },
    },

    qualityRegister: {
      method: 'POST',
      path: '/research/quality/register',
      requires: ADMIN_ONLY,
      body: {
        runCode: str({ maxLength: 80, minLength: 1 }),
        caseCode: str({ maxLength: 60, minLength: 1 }),
        method: str({ maxLength: 80, minLength: 1 }),
        profile: str({ maxLength: 80, minLength: 1 }),
        sGrounding: int(),
        rAccuracy: int(),
        gSupport: int(),
        bDiscipline: int(),
        lResponsibility: int(),
        provenance: int(),
        unknownHonesty: int(),
        alternativeCoverage: int(),
        confidenceCalibration: int(),
        actionUsefulness: int(),
      },
      handler: async ({ body, orm, status }) => {
        const caseRow = await findCase(orm, asText(body.caseCode))
        const row = {
          runCode: asText(body.runCode),
          caseRef: String(caseRow.id),
          method: asText(body.method),
          profile: asText(body.profile),
          ...Object.fromEntries(QUALITY_DIMENSIONS.map((key) => [key, body[key]])),
        }
        validateQualityRow(row)
        const saved = await repo(orm, 'research_quality_runs').create(row)
        status(201)
        return {
          state: 'recorded',
          run: { runCode: saved.runCode, score: scoreQuality(saved), max: 40 },
          notice: 'The 0..40 rubric exists only on a complete labelled bundle; a missing dimension is not zero.',
        }
      },
    },

    hypothesesRegister: {
      method: 'POST',
      path: '/research/hypotheses/register',
      requires: ADMIN_ONLY,
      body: {
        hypothesisCode: str({ maxLength: 80, minLength: 1 }),
        caseCode: str({ maxLength: 60, minLength: 1 }),
        frameCode: str({ maxLength: 60, null: true }),
        mode: sel(HYPOTHESIS_MODES),
        operator: sel(SWING_OPERATORS, { null: true }),
        question: text(),
        citationKey: str({ maxLength: 60, null: true }),
        evidenceSpan: text(),
        evidenceSha: str({ maxLength: 64, minLength: 1 }),
        lens: sel(RESEARCH_LENSES),
        counterReadings: text({ null: true }),
        mismatchNote: text({ null: true }),
        proposedFrameNote: text({ null: true }),
        proposedBy: str({ maxLength: 80, minLength: 1 }),
      },
      handler: async ({ body, orm, status }) => {
        const caseRow = await findCase(orm, asText(body.caseCode))
        const frameCode = nonEmpty(body.frameCode)
        const frame = frameCode
          ? await findCode(orm, 'research_frames', 'frameCode', frameCode, 'research frame')
          : null
        if (frame && !sameId(frame.caseRef, caseRow.id)) throw badRequest('the frame must belong to the case')
        if (asText(body.evidenceSha) !== caseRow.evidenceSha) {
          throw badRequest('a hypothesis must cite the case exact source digest')
        }
        const row = {
          hypothesisCode: asText(body.hypothesisCode),
          caseRef: String(caseRow.id),
          frameRef: frame ? String(frame.id) : null,
          mode: asText(body.mode),
          operator: nonEmpty(body.operator),
          question: asText(body.question),
          citationKey: asText(body.citationKey) || String(caseRow.citationKey),
          evidenceSpan: asText(body.evidenceSpan),
          evidenceSha: asText(body.evidenceSha),
          lens: asText(body.lens),
          counterReadings: nonEmpty(body.counterReadings),
          mismatchNote: nonEmpty(body.mismatchNote),
          proposedFrameNote: nonEmpty(body.proposedFrameNote),
          proposedBy: asText(body.proposedBy),
          status: 'CANDIDATE',
          selfValidated: false,
          inheritedScore: null,
          independentSourceRef: null,
          validatedBy: null,
          verificationNote: null,
          verified: false,
        }
        validateHypothesisRow(row, true)
        const saved = await repo(orm, 'research_hypotheses').create(row)
        status(201)
        return {
          state: 'recorded',
          hypothesis: {
            hypothesisCode: saved.hypothesisCode,
            mode: saved.mode,
            status: saved.status,
            selfValidated: false,
            inheritedScore: null,
            verified: false,
          },
          notice: 'A SWING, correction or OFFSIDE hypothesis is a cited question, never truth and never self-validated.',
        }
      },
    },

    hypothesesValidate: {
      method: 'POST',
      path: '/research/hypotheses/validate',
      requires: ADMIN_ONLY,
      body: {
        hypothesisCode: str({ maxLength: 80, minLength: 1 }),
        validatedBy: str({ maxLength: 80, minLength: 1 }),
        decision: sel(['CORROBORATE', 'REJECT', 'KEEP_CANDIDATE']),
        independentSourceRef: str({ maxLength: 240, null: true }),
        reason: text(),
      },
      handler: async ({ body, orm, status }) => {
        const hypothesis = await findCode(
          orm,
          'research_hypotheses',
          'hypothesisCode',
          asText(body.hypothesisCode),
          'research hypothesis',
        )
        const validatedBy = asText(body.validatedBy)
        const reason = asText(body.reason)
        const decision = asText(body.decision)
        if (!validatedBy || !reason) throw badRequest('validation needs a validator and a reason')
        if (validatedBy === hypothesis.proposedBy) {
          throw badRequest('a hypothesis cannot be validated by its own proposer')
        }
        const independentSourceRef = nonEmpty(body.independentSourceRef)
        if (decision === 'CORROBORATE' && !independentSourceRef) {
          throw badRequest('corroboration needs an independent source reference')
        }
        const nextStatus =
          decision === 'CORROBORATE' ? 'CORROBORATED' : decision === 'REJECT' ? 'REJECTED' : 'CANDIDATE'
        const patch = {
          status: nextStatus,
          validatedBy,
          independentSourceRef,
          verificationNote: reason,
          proposedBy: hypothesis.proposedBy,
          inheritedScore: null,
          selfValidated: false,
          verified: false,
        }
        validateHypothesisRow(patch, false)
        const saved = await repo(orm, 'research_hypotheses').update(String(hypothesis.id), patch)
        status(200)
        return {
          state: 'recorded',
          hypothesis: {
            hypothesisCode: saved.hypothesisCode,
            status: saved.status,
            validatedBy: saved.validatedBy,
            independentSourceRef: saved.independentSourceRef ?? null,
            inheritedScore: null,
            verified: false,
            humanReviewed: false,
          },
          notice:
            'Corroboration is structural. It is not truth by inversion, not a human review and not a theological verdict.',
        }
      },
    },

    swingPropose: {
      method: 'POST',
      path: '/research/swing/propose',
      requires: ADMIN_ONLY,
      body: {
        subject: str({ maxLength: 160, minLength: 1 }),
        relation: str({ maxLength: 160, minLength: 1 }),
        object: str({ maxLength: 160, minLength: 1 }),
        operators: text(),
      },
      handler: async ({ body, status }) => {
        const operators = asText(body.operators)
          .split(',')
          .map((entry) => entry.trim())
          .filter(Boolean)
        if (!operators.length || operators.length > 3) {
          throw badRequest('SWING accepts one to three operators; depth four does not exist')
        }
        for (const operator of operators) {
          if (!(SWING_OPERATORS as readonly string[]).includes(operator)) {
            throw badRequest(`unknown SWING operator "${operator}"`)
          }
        }
        try {
          const result = proposeSwingChain(
            { subject: asText(body.subject), relation: asText(body.relation), object: asText(body.object) },
            operators as SwingOperator[],
          )
          status(200)
          return {
            state: 'proposed',
            ...result,
            inheritedScore: null,
            policy: {
              state: 'CANDIDATE',
              evidenceStatus: 'UNVERIFIED',
              reverseTransformationIsTruth: false,
              maximumDepth: 3,
            },
            notice: 'Each Swing hop is a candidate question. A reversal never becomes truth by inversion.',
          }
        } catch (error) {
          throw badRequest(error instanceof Error ? error.message : 'invalid SWING request')
        }
      },
    },

    offsideDiagnose: {
      method: 'POST',
      path: '/research/offside/diagnose',
      requires: ADMIN_ONLY,
      body: {
        frameCode: str({ maxLength: 60, minLength: 1 }),
        agent: str({ maxLength: 200, null: true }),
        recipient: str({ maxLength: 200, null: true }),
        domain: str({ maxLength: 200, null: true }),
        scope: str({ maxLength: 240, null: true }),
        genre: str({ maxLength: 80, null: true }),
      },
      handler: async ({ body, orm, status }) => {
        const frame = await findCode(orm, 'research_frames', 'frameCode', asText(body.frameCode), 'research frame')
        const result = diagnoseOffside(frame, {
          agent: nonEmpty(body.agent),
          recipient: nonEmpty(body.recipient),
          domain: nonEmpty(body.domain),
          scope: nonEmpty(body.scope),
          genre: nonEmpty(body.genre),
        })
        status(200)
        return {
          state: result.status,
          frameCode: frame.frameCode,
          ...result,
          storedFrameUnchanged: true,
        }
      },
    },

    reviewsList: {
      method: 'GET',
      path: '/research/reviews',
      requires: ADMIN_ONLY,
      handler: async ({ orm }) => {
        const reviews = (await listAll(orm, 'research_reviews')).sort((left, right) =>
          String(left.reviewCode).localeCompare(String(right.reviewCode)),
        )
        const items = []
        for (const review of reviews) {
          const release = await releaseFor(orm, review)
          items.push({
            reviewCode: review.reviewCode,
            caseCode: review.caseCode,
            targetKind: review.targetKind,
            targetCode: review.targetCode,
            state: review.state,
            version: review.version,
            decision: review.decision ?? null,
            submittedByName: review.submittedByName,
            reviewerName: review.reviewerName ?? null,
            humanReviewed: release.humanReviewed,
            publicationAvailable: false,
          })
        }
        return {
          count: items.length,
          reviews: items,
          policy: { autoApprove: false, publicationAvailable: false, namedHumanActorsOnly: true },
          notice: 'A review list is not a publication surface; approval remains a named human decision.',
        }
      },
    },

    reviewGet: {
      method: 'GET',
      path: '/research/reviews/:reviewCode',
      requires: ADMIN_ONLY,
      handler: async ({ orm, params }) => {
        const review = await findCode(orm, 'research_reviews', 'reviewCode', String(params.reviewCode ?? ''), 'research review')
        return await reviewDetail(orm, review)
      },
    },

    reviewsRegister: {
      method: 'POST',
      path: '/research/reviews/register',
      requires: 'auth',
      body: {
        reviewCode: str({ maxLength: 100, minLength: 1 }),
        caseCode: str({ maxLength: 60, minLength: 1 }),
        targetKind: sel(REVIEW_TARGET_KINDS),
        targetCode: str({ maxLength: 80, minLength: 1 }),
      },
      handler: async ({ body, orm, user, status }) => {
        const actor = await humanActor(user, orm)
        const caseRow = await findCase(orm, asText(body.caseCode))
        const targetKind = asText(body.targetKind)
        const targetCode = asText(body.targetCode)
        const target = await loadReviewTarget(orm, caseRow, targetKind, targetCode)
        const code = asText(body.reviewCode)
        const existing = (await listAll(orm, 'research_reviews')).find((entry) => entry.reviewCode === code)
        if (existing) throw conflict(`review "${code}" already exists; a revision creates a new versioned decision, not a duplicate`)
        const now = new Date().toISOString()
        const saved = await repo(orm, 'research_reviews').create({
          reviewCode: code,
          caseRef: String(caseRow.id),
          caseCode: String(caseRow.caseCode),
          targetKind,
          targetCode,
          evidenceSha: target.caseSha,
          state: 'DRAFT',
          version: 1,
          submittedByRef: actor.id,
          submittedByName: actor.name,
          submittedAt: now,
          reviewerRef: null,
          reviewerName: null,
          decision: null,
          decidedAt: null,
          reviewNote: null,
          revisionNote: null,
          disputeReason: null,
          retractionReason: null,
        })
        status(201)
        return {
          state: saved.state,
          reviewCode: saved.reviewCode,
          version: saved.version,
          evidenceSha: saved.evidenceSha,
          exactSha: true,
          autoApproved: false,
          publicationAvailable: false,
          notice: 'A draft is not a review: only a different named human can approve it.',
        }
      },
    },

    reviewSubmit: {
      method: 'POST',
      path: '/research/reviews/:reviewCode/submit',
      requires: 'auth',
      body: {
        expectedVersion: int(),
        note: text({ null: true }),
      },
      handler: async ({ body, orm, user, params, status }) => {
        const actor = await humanActor(user, orm)
        const code = String(params.reviewCode ?? '')
        const review = await findCode(orm, 'research_reviews', 'reviewCode', code, 'research review')
        if (!sameId(review.submittedByRef, actor.id)) {
          throw forbidden('only the named submitter can submit this review')
        }
        const saved = await transitionReview({
          orm,
          code,
          action: 'SUBMIT',
          actor,
          expectedVersion: body.expectedVersion,
          reason: nonEmpty(body.note) ?? 'submitted for named human review',
        })
        status(200)
        return {
          state: saved.state,
          reviewCode: saved.reviewCode,
          version: saved.version,
          autoApproved: false,
          notice: 'Submitted for review; no state change approves the claim.',
        }
      },
    },

    reviewDecide: {
      method: 'POST',
      path: '/research/reviews/:reviewCode/decide',
      requires: 'auth',
      body: {
        decision: sel(REVIEW_DECISIONS),
        note: text(),
        expectedVersion: int(),
        acknowledgeDisagreement: bool({ default: false }),
      },
      handler: async ({ body, orm, user, params, status }) => {
        const actor = await humanActor(user, orm)
        const code = String(params.reviewCode ?? '')
        const decision = asText(body.decision)
        const note = nonEmpty(body.note)
        if (!note) throw badRequest('every decision needs a named explanation note')
        const review = await findCode(orm, 'research_reviews', 'reviewCode', code, 'research review')
        if (sameId(review.submittedByRef, actor.id)) {
          throw forbidden('four eyes: the submitter cannot decide their own review')
        }
        if (decision === 'APPROVED') {
          const guard = async (fresh: Row) => {
            const caseRow = await rowById(orm, 'research_cases', fresh.caseRef, 'review case')
            const target = await loadReviewTarget(orm, caseRow, String(fresh.targetKind), String(fresh.targetCode))
            const counterevidence = await counterevidenceFor(orm, fresh)
            const { pilot } = await pilotFor(orm, caseRow)
            const runs = await runsForReview(orm, code)
            const run = runs.at(-1) ?? null
            const method = await methodForRun(orm, run)
            const verdict = releaseVerdict({
              review: { ...fresh, state: 'REVIEWED', decision: 'APPROVED', reviewerRef: actor.id },
              caseSha: target.caseSha,
              targetSha: target.targetSha,
              counterevidence,
              pilot,
              mizanRun: run,
              method,
            })
            if (!verdict.eligible) {
              throw badRequest(`approval blocked: ${verdict.blockers.join(', ')}`)
            }
            if (pilot.agreement === false && body.acknowledgeDisagreement !== true) {
              throw badRequest('pilot annotations disagree; acknowledge the disagreement explicitly before approval')
            }
          }
          const saved = await transitionReview({
            orm,
            code,
            action: 'APPROVE',
            actor,
            expectedVersion: body.expectedVersion,
            reason: note,
            guard,
            patch: {
              reviewerRef: actor.id,
              reviewerName: actor.name,
              decision: 'APPROVED',
              decidedAt: new Date().toISOString(),
              reviewNote: note,
            },
          })
          status(200)
          return {
            state: saved.state,
            reviewCode: saved.reviewCode,
            version: saved.version,
            decision: saved.decision,
            humanReviewed: true,
            publicationAvailable: false,
            notice: 'Reviewed at the exact source SHA by a named human; this is not a publication.',
          }
        }
        const revision = decision === 'REVISION_REQUESTED'
        const saved = await transitionReview({
          orm,
          code,
          action: revision ? 'REQUEST_REVISION' : 'REJECT',
          actor,
          expectedVersion: body.expectedVersion,
          reason: note,
          patch: {
            reviewerRef: actor.id,
            reviewerName: actor.name,
            decision,
            decidedAt: new Date().toISOString(),
            revisionNote: revision ? note : null,
            reviewNote: note,
          },
        })
        status(200)
        return {
          state: saved.state,
          reviewCode: saved.reviewCode,
          version: saved.version,
          decision: saved.decision,
          humanReviewed: false,
          publicationAvailable: false,
          notice: revision
            ? 'Revision requested; the old decision stays in the immutable trail.'
            : 'Rejected with a named reason; nothing is published.',
        }
      },
    },

    reviewDispute: {
      method: 'POST',
      path: '/research/reviews/:reviewCode/dispute',
      requires: 'auth',
      body: {
        reason: text(),
        expectedVersion: int(),
      },
      handler: async ({ body, orm, user, params, status }) => {
        const actor = await humanActor(user, orm)
        const reason = nonEmpty(body.reason)
        if (!reason) throw badRequest('a dispute needs a named reason')
        const code = String(params.reviewCode ?? '')
        const saved = await transitionReview({
          orm,
          code,
          action: 'DISPUTE',
          actor,
          expectedVersion: body.expectedVersion,
          reason,
          patch: { disputeReason: reason },
        })
        status(200)
        return { state: saved.state, reviewCode: saved.reviewCode, version: saved.version, publicationAvailable: false }
      },
    },

    reviewResolveDispute: {
      method: 'POST',
      path: '/research/reviews/:reviewCode/resolve',
      requires: 'auth',
      body: {
        reason: text(),
        expectedVersion: int(),
      },
      handler: async ({ body, orm, user, params, status }) => {
        const actor = await humanActor(user, orm)
        const reason = nonEmpty(body.reason)
        if (!reason) throw badRequest('resolving a dispute needs a named reason')
        const code = String(params.reviewCode ?? '')
        const review = await findCode(orm, 'research_reviews', 'reviewCode', code, 'research review')
        const events = (await listAll(orm, 'research_review_events')).filter(
          (entry) => sameId(entry.reviewRef, review.id) && entry.action === 'DISPUTE',
        )
        const last = events.sort((left, right) => Number(left.versionTo) - Number(right.versionTo)).at(-1)
        if (!last) throw badRequest('this review has no dispute event to resolve')
        if (sameId(last.actorRef, actor.id)) {
          throw forbidden('the disputing actor cannot resolve their own dispute')
        }
        const saved = await transitionReview({
          orm,
          code,
          action: 'RESOLVE_DISPUTE',
          actor,
          expectedVersion: body.expectedVersion,
          reason,
        })
        status(200)
        return { state: saved.state, reviewCode: saved.reviewCode, version: saved.version, publicationAvailable: false }
      },
    },

    reviewRetract: {
      method: 'POST',
      path: '/research/reviews/:reviewCode/retract',
      requires: 'auth',
      body: {
        reason: text(),
        expectedVersion: int(),
      },
      handler: async ({ body, orm, user, params, status }) => {
        const actor = await humanActor(user, orm)
        const reason = nonEmpty(body.reason)
        if (!reason) throw badRequest('retraction needs a named reason')
        const code = String(params.reviewCode ?? '')
        const review = await findCode(orm, 'research_reviews', 'reviewCode', code, 'research review')
        const allowed =
          actor.role === 'admin' ||
          sameId(review.submittedByRef, actor.id) ||
          (review.reviewerRef ? sameId(review.reviewerRef, actor.id) : false)
        if (!allowed) {
          throw forbidden('only the submitter, the reviewer, or an admin may retract this review')
        }
        const saved = await transitionReview({
          orm,
          code,
          action: 'RETRACT',
          actor,
          expectedVersion: body.expectedVersion,
          reason,
          patch: { retractionReason: reason },
        })
        status(200)
        return {
          state: saved.state,
          reviewCode: saved.reviewCode,
          version: saved.version,
          decisionPreserved: review.decision ?? null,
          publicationAvailable: false,
          notice: 'Retraction supersedes without deleting: earlier decisions remain in the trail.',
        }
      },
    },

    counterevidenceRegister: {
      method: 'POST',
      path: '/research/counterevidence/register',
      requires: 'auth',
      body: {
        ceCode: str({ maxLength: 100, minLength: 1 }),
        caseCode: str({ maxLength: 60, minLength: 1 }),
        targetKind: sel(REVIEW_TARGET_KINDS),
        targetCode: str({ maxLength: 80, minLength: 1 }),
        sourceId: str({ maxLength: 200, minLength: 1 }),
        sourceVersion: str({ maxLength: 80, minLength: 1 }),
        citationKey: str({ maxLength: 60, minLength: 1 }),
        evidenceSha: str({ maxLength: 64, minLength: 1 }),
        finding: text(),
      },
      handler: async ({ body, orm, user, status }) => {
        const actor = await humanActor(user, orm)
        const caseRow = await findCase(orm, asText(body.caseCode))
        const targetKind = asText(body.targetKind)
        const target = await loadReviewTarget(orm, caseRow, targetKind, asText(body.targetCode))
        const sha = asText(body.evidenceSha)
        assertSha(sha, 'counterevidence')
        if (sha !== target.caseSha) {
          throw badRequest('counterevidence must cite the exact case source digest, not a paraphrase digest')
        }
        const code = asText(body.ceCode)
        const existing = (await listAll(orm, 'research_counterevidence')).find((entry) => entry.ceCode === code)
        if (existing) throw conflict(`counterevidence "${code}" already exists`)
        const saved = await repo(orm, 'research_counterevidence').create({
          ceCode: code,
          caseRef: String(caseRow.id),
          caseCode: String(caseRow.caseCode),
          targetKind,
          targetCode: asText(body.targetCode),
          sourceId: asText(body.sourceId),
          sourceVersion: asText(body.sourceVersion),
          citationKey: asText(body.citationKey),
          evidenceSha: sha,
          finding: asText(body.finding),
          registeredByRef: actor.id,
          registeredByName: actor.name,
          status: 'OPEN',
          resolutionReason: null,
          resolvedByRef: null,
          resolvedByName: null,
          resolvedAt: null,
        })
        status(201)
        return {
          state: saved.status,
          ceCode: saved.ceCode,
          exactSha: true,
          notice: 'Counterevidence stays OPEN until a named reviewer acknowledges or rejects it with a reason.',
        }
      },
    },

    counterevidenceResolve: {
      method: 'POST',
      path: '/research/counterevidence/:ceCode/resolve',
      requires: 'auth',
      body: {
        status: sel(['ACKNOWLEDGED', 'REJECTED']),
        reason: text(),
      },
      handler: async ({ body, orm, user, params, status }) => {
        const actor = await humanActor(user, orm)
        const reason = nonEmpty(body.reason)
        if (!reason) throw badRequest('resolving counterevidence needs a named reason')
        const code = String(params.ceCode ?? '')
        const resolved = await withLock(`counterevidence:${code}`, async () => {
          const entry = await findCode(orm, 'research_counterevidence', 'ceCode', code, 'counterevidence')
          if (entry.status !== 'OPEN') throw conflict(`counterevidence "${code}" is already resolved`)
          return await repo(orm, 'research_counterevidence').update(String(entry.id), {
            status: asText(body.status),
            resolutionReason: reason,
            resolvedByRef: actor.id,
            resolvedByName: actor.name,
            resolvedAt: new Date().toISOString(),
          })
        })
        status(200)
        return {
          state: resolved.status,
          ceCode: resolved.ceCode,
          resolvedByName: resolved.resolvedByName,
          notice: 'The resolution is recorded once; it cannot be silently withdrawn.',
        }
      },
    },

    mizanMethodRegister: {
      method: 'POST',
      path: '/research/mizan/methods',
      requires: 'auth',
      body: {
        methodCode: str({ maxLength: 100, minLength: 1 }),
        version: str({ maxLength: 20, minLength: 1 }),
        methodSha: str({ maxLength: 64, minLength: 1 }),
        methodText: text(),
        criteria: text(),
        scaleMin: int(),
        scaleMax: int(),
        maxScore: int(),
      },
      handler: async ({ body, orm, user, status }) => {
        const actor = await humanActor(user, orm)
        const methods = await listAll(orm, 'mizan_methods')
        const duplicate = methods.find(
          (entry) =>
            (entry.methodCode === asText(body.methodCode) && entry.version === asText(body.version)) ||
            entry.methodSha === asText(body.methodSha),
        )
        if (duplicate) throw conflict('this MIZAN method version is already registered')
        const saved = await repo(orm, 'mizan_methods').create({
          methodCode: asText(body.methodCode),
          version: asText(body.version),
          methodSha: asText(body.methodSha),
          methodText: asText(body.methodText),
          criteria: asText(body.criteria),
          scaleMin: body.scaleMin,
          scaleMax: body.scaleMax,
          maxScore: body.maxScore,
          status: MIZAN_METHOD_STATUS,
          registeredByRef: actor.id,
          registeredByName: actor.name,
        })
        status(201)
        return {
          state: 'registered',
          methodCode: saved.methodCode,
          version: saved.version,
          methodSha: saved.methodSha,
          status: saved.status,
          notice: 'The method is versioned and still a candidate; registration is not ratification.',
        }
      },
    },

    mizanRunCreate: {
      method: 'POST',
      path: '/research/mizan/runs',
      requires: 'auth',
      body: {
        runCode: str({ maxLength: 100, minLength: 1 }),
        reviewCode: str({ maxLength: 100, minLength: 1 }),
        methodCode: str({ maxLength: 100, null: true }),
        methodVersion: str({ maxLength: 20, null: true }),
        scores: text(),
        explanation: text(),
        context: text(),
        unknowns: text(),
      },
      handler: async ({ body, orm, user, status }) => {
        const actor = await humanActor(user, orm)
        const review = await findCode(orm, 'research_reviews', 'reviewCode', asText(body.reviewCode), 'research review')
        const caseRow = await rowById(orm, 'research_cases', review.caseRef, 'review case')
        const target = await loadReviewTarget(orm, caseRow, String(review.targetKind), String(review.targetCode))
        const methodCode = nonEmpty(body.methodCode) ?? MIZAN_METHOD_CODE
        const methodVersion = nonEmpty(body.methodVersion) ?? MIZAN_METHOD_VERSION
        const method = (await listAll(orm, 'mizan_methods')).find(
          (entry) => entry.methodCode === methodCode && entry.version === methodVersion,
        )
        if (!method || method.methodSha !== MIZAN_METHOD_SHA256) {
          throw badRequest('a MIZAN run must bind to the registered bounded method version')
        }
        let scored
        try {
          scored = scoreMizan(body.scores)
        } catch (error) {
          throw badRequest(error instanceof Error ? error.message : 'invalid MIZAN scores')
        }
        const code = asText(body.runCode)
        const existing = (await listAll(orm, 'mizan_runs')).find((entry) => entry.runCode === code)
        if (existing) throw conflict(`MIZAN run "${code}" already exists`)
        const saved = await repo(orm, 'mizan_runs').create({
          runCode: code,
          reviewRef: String(review.id),
          reviewCode: String(review.reviewCode),
          methodCode,
          methodVersion,
          methodSha: method.methodSha,
          targetKind: review.targetKind,
          targetCode: review.targetCode,
          evidenceSha: target.caseSha,
          scoresJson: scored.scoresJson,
          totalScore: scored.totalScore,
          maxScore: scored.maxScore,
          explanation: asText(body.explanation),
          context: asText(body.context),
          unknowns: asText(body.unknowns),
          assessedByRef: actor.id,
          assessedByName: actor.name,
        })
        status(201)
        return {
          state: 'recorded',
          runCode: saved.runCode,
          methodSha: saved.methodSha,
          scores: scored.scores,
          totalScore: saved.totalScore,
          maxScore: saved.maxScore,
          explanation: saved.explanation,
          context: saved.context,
          unknowns: saved.unknowns,
          scoreIsVerdict: false,
          publicationAvailable: false,
          notice: 'The score is a bounded description of evidence work, not a divine or theological verdict.',
        }
      },
    },

    pilotAnnotate: {
      method: 'POST',
      path: '/research/pilot/annotations',
      requires: 'auth',
      body: {
        caseCode: str({ maxLength: 60, minLength: 1 }),
        evidenceSha: str({ maxLength: 64, minLength: 1 }),
        assessment: sel(PILOT_ASSESSMENTS),
        note: text(),
      },
      handler: async ({ body, orm, user, status }) => {
        const actor = await humanActor(user, orm)
        const caseRow = await findCase(orm, asText(body.caseCode))
        const caseSha = nonEmpty(caseRow.evidenceSha)
        if (!caseSha) throw badRequest('the case has no exact digest; the pilot cannot annotate')
        const sha = asText(body.evidenceSha)
        assertSha(sha, 'a pilot annotation')
        if (sha !== caseSha) throw badRequest('a pilot annotation must target the exact case source digest')
        const annotationKey = `${String(caseRow.caseCode)}:${actor.id}:${sha}`
        const existing = (await listAll(orm, 'research_pilot_annotations')).find(
          (entry) => entry.annotationKey === annotationKey,
        )
        if (existing) throw conflict('this annotator already annotated this case at this digest; independence is not repeatability')
        const saved = await repo(orm, 'research_pilot_annotations').create({
          annotationKey,
          caseRef: String(caseRow.id),
          caseCode: String(caseRow.caseCode),
          evidenceSha: sha,
          annotatorRef: actor.id,
          annotatorName: actor.name,
          assessment: asText(body.assessment),
          note: asText(body.note),
        })
        const { pilot } = await pilotFor(orm, caseRow)
        status(201)
        return {
          state: 'recorded',
          annotation: {
            annotationKey: saved.annotationKey,
            annotatorName: saved.annotatorName,
            assessment: saved.assessment,
            evidenceSha: saved.evidenceSha,
          },
          pilot,
          publicationAvailable: false,
          notice: 'Agreement is recorded only when independent named annotators assess the same exact digest.',
        }
      },
    },

    pilotGet: {
      method: 'GET',
      path: '/research/pilot',
      requires: ADMIN_ONLY,
      handler: async ({ orm, query }) => {
        const caseRow = await findCase(orm, String(query.caseCode ?? ''))
        const { pilot, annotations } = await pilotFor(orm, caseRow)
        return {
          caseCode: caseRow.caseCode,
          evidenceSha: caseRow.evidenceSha ?? null,
          pilot,
          annotations,
          publicationAvailable: false,
          notice: 'A recorded pilot is evidence of human annotation, not a publication decision.',
        }
      },
    },

    reviewRelease: {
      method: 'GET',
      path: '/research/reviews/:reviewCode/release',
      requires: ADMIN_ONLY,
      handler: async ({ orm, params }) => {
        const review = await findCode(orm, 'research_reviews', 'reviewCode', String(params.reviewCode ?? ''), 'research review')
        const release = await releaseFor(orm, review)
        return {
          reviewCode: review.reviewCode,
          state: review.state,
          decision: review.decision ?? null,
          ...release,
          notice: release.notice,
        }
      },
    },
  },
})

export default research
export {
  CASE_SEED,
  COUNTEREVIDENCE_SEED,
  HYPOTHESIS_MODES,
  HYPOTHESIS_SEED,
  KEY_SCHEME,
  M14_POLICY,
  MIZAN_CRITERIA,
  MIZAN_METHOD_CODE,
  MIZAN_METHOD_SHA256,
  MIZAN_METHOD_STATUS,
  MIZAN_METHOD_TEXT,
  MIZAN_METHOD_VERSION,
  P18_KEY_CANDIDATES,
  PILOT_ASSESSMENTS,
  QURAN_SHA256,
  RESEARCH_ISSUE_REGISTER,
  RESEARCH_META,
  RESEARCH_PINS,
  RESEARCH_POLICY,
  REVIEW_DECISIONS,
  REVIEW_MACHINE_STATES,
  REVIEW_STATES,
  REVIEW_TARGET_KINDS,
  SRGBL_LEVELS,
  SWING_OPERATORS,
  WITNESS_COMPONENT_MAX,
} from './seed.js'
export {
  buildMetrics,
  diagnoseOffside,
  evaluateStages,
  proposeSwing,
  proposeSwingChain,
  scoreDirection,
  scoreMaturity,
  scoreQuality,
  scoreWitness,
} from './gates.js'
export { caseDetail, researchCase, researchMetrics, researchOverview, researchTrace } from './projection.js'
export {
  ACTION_TARGET_STATE,
  canTransition,
  mizanRunIsBounded,
  parseMizanScores,
  pilotStatus,
  releaseVerdict,
  scoreMizan,
  withLock,
} from './review.js'
