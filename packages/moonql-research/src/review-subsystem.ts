import {
  ADMIN_ONLY,
  bool,
  defineModel,
  int,
  m2o,
  sel,
  str,
  text,
  ts,
  type EndpointCtx,
  type EndpointDef,
} from '@moonwitness/moonql'
import { badRequest, conflict, forbidden } from '@moonwitness/core'
import {
  COUNTEREVIDENCE_SEED,
  COUNTEREVIDENCE_STATUSES,
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
  PILOT_ASSESSMENTS,
  REVIEW_ACTIONS,
  REVIEW_DECISIONS,
  REVIEW_MACHINE_STATES,
  REVIEW_TARGET_KINDS,
} from './seed.js'
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
import { asText, nonEmpty } from './gates.js'
import {
  assertSha,
  checkInt,
  findCase,
  findCode,
  humanActor,
  listAll,
  repo,
  requireText,
  rowById,
  sameId,
  type HumanActor,
  type ModelOrm,
  type Orm,
  type Row,
} from './common.js'

export async function loadReviewTarget(
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

export const counterevidenceFor = async (orm: Orm | ModelOrm, review: Row): Promise<Row[]> =>
  (await listAll(orm, 'research_counterevidence')).filter(
    (entry) =>
      sameId(entry.caseRef, review.caseRef) &&
      entry.targetKind === review.targetKind &&
      entry.targetCode === review.targetCode,
  )

export const runsForReview = async (orm: Orm | ModelOrm, reviewCode: unknown): Promise<Row[]> =>
  (await listAll(orm, 'mizan_runs'))
    .filter((entry) => entry.reviewCode === reviewCode)
    .sort((left, right) => String(left.createdAt).localeCompare(String(right.createdAt)))

export async function methodForRun(orm: Orm | ModelOrm, run: Row | null): Promise<Row | null> {
  if (!run) return null
  const methods = await listAll(orm, 'mizan_methods')
  return (
    methods.find(
      (entry) => entry.methodCode === run.methodCode && entry.version === run.methodVersion,
    ) ?? null
  )
}

export async function pilotFor(orm: Orm | ModelOrm, caseRow: Row): Promise<{ pilot: PilotStatus; annotations: Row[] }> {
  const annotations = (await listAll(orm, 'research_pilot_annotations'))
    .filter((entry) => sameId(entry.caseRef, caseRow.id))
    .sort((left, right) => String(left.createdAt).localeCompare(String(right.createdAt)))
  const pilot = pilotStatus(annotations, String(caseRow.caseCode), nonEmpty(caseRow.evidenceSha))
  return { pilot, annotations }
}

export async function releaseFor(orm: Orm | ModelOrm, review: Row) {
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

export async function reviewDetail(orm: Orm | ModelOrm, review: Row) {
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

export async function transitionReview(input: {
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

export function validateReviewRow(row: Row, creating: boolean): void {
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

export function validateEventRow(row: Row): void {
  requireText(row, ['eventKey', 'reviewCode', 'action', 'fromState', 'toState', 'actorName'], 'review event')
  const action = String(row.action) as ReviewAction
  const from = String(row.fromState) as ReviewState
  if (!(REVIEW_ACTIONS as readonly string[]).includes(action)) throw badRequest('unknown review action')
  if (row.toState !== ACTION_TARGET_STATE[action]) throw badRequest('review event target state does not match its action')
  if (!canTransition(from, action)) throw badRequest(`review event cannot ${action} from ${from}`)
  if (Number(row.versionTo) !== Number(row.versionFrom) + 1) throw badRequest('review event versions must advance by one')
}

export function validateCounterevidenceRow(row: Row, creating: boolean): void {
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

export const reviewModels = {
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
}

export type ReviewHookFn = (row: Row) => Row | Promise<Row>
export type ReviewHookDef = {
  beforeCreate?: ReviewHookFn
  beforeUpdate?: ReviewHookFn
  beforeDelete?: () => void
}

export const reviewHooks: Record<string, ReviewHookDef> = {
  research_reviews: {
    beforeCreate: (row: Row) => {
      validateReviewRow(row, true)
      return row
    },
    beforeUpdate: (patch: Row) => {
      validateReviewRow(patch, false)
      return patch
    },
    beforeDelete: () => {
      throw badRequest('research reviews are never deleted; retract them with a named reason instead')
    },
  },
  research_review_events: {
    beforeCreate: (row: Row) => {
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
    beforeCreate: (row: Row) => {
      validateCounterevidenceRow(row, true)
      return row
    },
    beforeUpdate: (patch: Row) => {
      validateCounterevidenceRow(patch, false)
      return patch
    },
    beforeDelete: () => {
      throw badRequest('counterevidence is never deleted; resolve it with a named reason instead')
    },
  },
  mizan_methods: {
    beforeCreate: (row: Row) => {
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
    beforeCreate: (row: Row) => {
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
    beforeCreate: (row: Row) => {
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
}

export const reviewEndpoints: Record<string, EndpointDef> = {
  reviewsList: {
    method: 'GET',
    path: '/research/reviews',
    requires: ADMIN_ONLY,
    handler: async ({ orm }: EndpointCtx) => {
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
    handler: async ({ orm, params }: EndpointCtx) => {
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
    handler: async ({ body, orm, user, status }: EndpointCtx) => {
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
    handler: async ({ body, orm, user, params, status }: EndpointCtx) => {
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
    handler: async ({ body, orm, user, params, status }: EndpointCtx) => {
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
    handler: async ({ body, orm, user, params, status }: EndpointCtx) => {
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
    handler: async ({ body, orm, user, params, status }: EndpointCtx) => {
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
    handler: async ({ body, orm, user, params, status }: EndpointCtx) => {
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
      sourceId: str({ maxLength: 120, minLength: 1 }),
      sourceVersion: str({ maxLength: 40, minLength: 1 }),
      citationKey: str({ maxLength: 80, minLength: 1 }),
      evidenceSha: str({ maxLength: 64, minLength: 1 }),
      finding: text(),
    },
    handler: async ({ body, orm, user, status }: EndpointCtx) => {
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
    handler: async ({ body, orm, user, params, status }: EndpointCtx) => {
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
    handler: async ({ body, orm, user, status }: EndpointCtx) => {
      const actor = await humanActor(user, orm)
      const methods = await listAll(orm, 'mizan_methods')
      const duplicate = methods.find(
        (entry) => entry.methodCode === body.methodCode && entry.version === body.version,
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
    handler: async ({ body, orm, user, status }: EndpointCtx) => {
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
    handler: async ({ body, orm, user, status }: EndpointCtx) => {
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
    handler: async ({ orm, query }: EndpointCtx) => {
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
    handler: async ({ orm, params }: EndpointCtx) => {
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
}
