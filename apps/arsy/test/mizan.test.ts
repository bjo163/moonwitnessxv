import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify, { type FastifyInstance } from 'fastify'
import { bootMoonQl, moonqlRest } from '@moonwitness/moonql'
import base from '@moonwitness/moonql-base'
import auth, { hashPassword } from '@moonwitness/moonql-auth'
import ontology from '@moonwitness/moonql-ontology'
import corpus from '@moonwitness/moonql-corpus'
import actors from '@moonwitness/moonql-actors'
import research, {
  M14_POLICY,
  MIZAN_CRITERIA,
  MIZAN_METHOD_SHA256,
  MIZAN_METHOD_TEXT,
  QURAN_SHA256,
} from '@moonwitness/moonql-research'
import envelope from '../src/plugins/envelope.js'
import { adminHeaders, TEST_ADMIN_PASSWORD } from './helpers/auth.js'

/**
 * M14 — named human review, counterevidence, pilot annotations and the bounded
 * MIZAN workbench. Every test pins the fail-closed boundary: no source or AI
 * candidate is auto-approved, evidence must sit at the exact digest, and a
 * reviewed claim is still not published by this milestone.
 */

const quiet = { info: () => {}, warn: () => {} }
const dataOf = <T>(res: { json(): unknown }): T => (res.json() as { data: T }).data
const errorOf = (res: { json(): unknown }): string => (res.json() as { error: { message: string } }).error.message

type Row = Record<string, unknown>
type Mq = Awaited<ReturnType<typeof bootMoonQl>>
type Headers = Record<string, string>

const AR_CASE = 'RC-QS-002-082-AR'
const ID_CASE = 'RC-QS-002-082-ID'
const AR_CLAIM = 'CLM-QS2-82-COND'
const ID_CLAIM = 'CLM-QS2-82-ID-TRANS'

interface ReviewDetail {
  reviewCode: string
  caseCode: string
  targetKind: string
  targetCode: string
  state: string
  version: number
  decision: string | null
  submittedBy: { id: unknown; name: string; at: string }
  reviewer: { id: unknown; name: string | null } | null
  evidence: { caseSha: string; reviewSha: string; exactMatch: boolean; source: string }
  counterevidence: Array<{
    ceCode: string
    sourceId: string
    sourceVersion: string
    citationKey: string
    evidenceSha: string
    exactMatch: boolean
    status: string
    resolutionReason: string | null
    resolvedByName: string | null
  }>
  pilot: {
    status: string
    annotationCount: number
    distinctAnnotators: number
    independent: boolean
    sameSha: boolean
    agreement: boolean | null
    blockers: string[]
    annotations: Array<{ annotatorName: string; assessment: string; evidenceSha: string }>
  }
  mizan: {
    method: { methodCode: string; version: string; methodSha: string; status: string; maxScore: number } | null
    runs: Array<{
      runCode: string
      totalScore: number
      maxScore: number
      methodSha: string
      bounded: boolean
      explanation: string
      context: string
      unknowns: string
    }>
    scoreIsVerdict: boolean
  }
  events: Array<{
    action: string
    fromState: string
    toState: string
    versionFrom: number
    versionTo: number
    actorName: string
    actorRole: string
    reason: string
    eventKey: string
  }>
  release: ReleaseView
  publicationAvailable: boolean
}

interface ReleaseView {
  eligible: boolean
  humanReviewed: boolean
  reviewedAtExactSha: boolean
  publicationAvailable: boolean
  autoApproved: boolean
  scoreIsVerdict: boolean
  blockers: string[]
  notice: string
}

let app: FastifyInstance
let moonql: Mq
let admin: Headers
let alice: Headers
let bob: Headers
let guest: Headers

const post = (path: string, body: Row, headers: Headers = admin) =>
  app.inject().post(`/orm/${path}`).headers(headers).body(body).end()
const get = (path: string, headers: Headers = admin) => app.inject().get(`/orm/${path}`).headers(headers).end()
const detail = async (code: string): Promise<ReviewDetail> => {
  const res = await get(`research/reviews/${encodeURIComponent(code)}`)
  assert.equal(res.statusCode, 200, res.body)
  return dataOf<ReviewDetail>(res)
}

async function makeUser(login: string, displayName: string, role = 'user'): Promise<Headers> {
  await moonql.model('auth_users').create({
    login,
    displayName,
    passwordHash: hashPassword(`${login}-pw`),
    role,
  })
  const loginRes = await app
    .inject()
    .post('/orm/auth/login')
    .body({ login, password: `${login}-pw` })
    .end()
  assert.equal(loginRes.statusCode, 200, loginRes.body)
  return { authorization: `Bearer ${dataOf<{ token: string }>(loginRes).token}` }
}

const registerReview = (code: string, caseCode: string, targetCode: string, targetKind = 'CLAIM') =>
  post('research/reviews/register', { reviewCode: code, caseCode, targetKind, targetCode })

const scores = (value: number): string =>
  JSON.stringify(Object.fromEntries(MIZAN_CRITERIA.map((entry) => [entry.key, value])))

const mizanRun = (runCode: string, reviewCode: string, value = 3) =>
  post('research/mizan/runs', {
    runCode,
    reviewCode,
    scores: scores(value),
    explanation: 'Each criterion was inspected against the exact digest and the recorded counterevidence.',
    context: 'Bounded QS 2:82 case; no outside corpus and no claim of divine judgment.',
    unknowns: 'The verse does not define belief or righteous action; that remains unknown here.',
  })

async function resolveOpenCounterevidence(headers: Headers = alice): Promise<void> {
  const review = await detail('RV-M14-ROLE')
  for (const entry of review.counterevidence.filter((item) => item.status === 'OPEN')) {
    const res = await post(
      `research/counterevidence/${encodeURIComponent(entry.ceCode)}/resolve`,
      { status: 'ACKNOWLEDGED', reason: 'The counter-reading is preserved and constrains the bounded claim.' },
      headers,
    )
    assert.equal(res.statusCode, 200, res.body)
  }
}

before(async () => {
  app = Fastify({ logger: false })
  moonql = await bootMoonQl({
    addons: [base, auth, ontology, corpus, actors, research],
    env: { MOONQL_AUTH_ADMIN_PASSWORD: TEST_ADMIN_PASSWORD },
    seedPolicy: 'off',
    cronEnabled: false,
    log: quiet,
  })
  await app.register(envelope)
  await app.register(moonqlRest, { prefix: '/orm', instance: moonql })
  await app.ready()
  admin = await adminHeaders(app, '/orm')
  alice = await makeUser('alice-reviewer', 'Alice Reviewer')
  bob = await makeUser('bob-reviewer', 'Bob Independent')
  guest = await makeUser('guest-viewer', 'Guest Viewer', 'guest')
})

after(async () => {
  await app.close()
  await moonql.close()
})

test('M14-01: named role-scoped draft/submitted/reviewed machine, no auto approval', async () => {
  assert.equal(M14_POLICY.autoApprove, false)
  assert.equal(M14_POLICY.publicationAvailable, false)
  assert.equal(M14_POLICY.fourEyes, true)

  const anon = await app
    .inject()
    .post('/orm/research/reviews/register')
    .body({ reviewCode: 'RV-ANON', caseCode: AR_CASE, targetKind: 'CLAIM', targetCode: AR_CLAIM })
    .end()
  assert.equal(anon.statusCode, 401)

  const guestRes = await post(
    'research/reviews/register',
    { reviewCode: 'RV-GUEST', caseCode: AR_CASE, targetKind: 'CLAIM', targetCode: AR_CLAIM },
    guest,
  )
  assert.equal(guestRes.statusCode, 403, guestRes.body)
  assert.match(errorOf(guestRes), /guest or anonymous/i)

  const registered = await registerReview('RV-M14-ROLE', AR_CASE, AR_CLAIM)
  assert.equal(registered.statusCode, 201, registered.body)
  const draft = dataOf<{ state: string; version: number; exactSha: boolean; autoApproved: boolean }>(registered)
  assert.equal(draft.state, 'DRAFT')
  assert.equal(draft.version, 1)
  assert.equal(draft.exactSha, true)
  assert.equal(draft.autoApproved, false)

  const notSubmitter = await post('research/reviews/RV-M14-ROLE/submit', { expectedVersion: 1 }, alice)
  assert.equal(notSubmitter.statusCode, 403)
  assert.match(errorOf(notSubmitter), /named submitter/i)

  const submitted = await post('research/reviews/RV-M14-ROLE/submit', {
    expectedVersion: 1,
    note: 'Submitted to a different named human.',
  })
  assert.equal(submitted.statusCode, 200, submitted.body)
  assert.equal(dataOf<{ state: string; version: number }>(submitted).state, 'SUBMITTED')
  assert.equal(dataOf<{ state: string; version: number }>(submitted).version, 2)

  const premature = await post(
    'research/reviews/RV-M14-ROLE/decide',
    { decision: 'APPROVED', note: 'Looks fine.', expectedVersion: 2 },
    alice,
  )
  assert.equal(premature.statusCode, 400, premature.body)
  assert.match(errorOf(premature), /approval blocked/)
  assert.match(errorOf(premature), /COUNTEREVIDENCE_OPEN/)
  assert.match(errorOf(premature), /MIZAN_RUN_REQUIRED/)

  const selfApprove = await post('research/reviews/RV-M14-ROLE/decide', {
    decision: 'APPROVED',
    note: 'I approve my own work.',
    expectedVersion: 2,
  })
  assert.equal(selfApprove.statusCode, 403)
  assert.match(errorOf(selfApprove), /four eyes/i)

  const view = await detail('RV-M14-ROLE')
  assert.equal(view.state, 'SUBMITTED')
  assert.equal(view.decision, null)
  assert.equal(view.reviewer, null)
  assert.equal(view.release.eligible, false)
  assert.equal(view.release.publicationAvailable, false)
  assert.equal(view.events.length, 1)
  assert.deepEqual(
    view.events.map((entry) => entry.action),
    ['SUBMIT'],
  )
  assert.equal(view.events[0]?.actorName, 'Administrator')
  assert.equal(view.events[0]?.fromState, 'DRAFT')
  assert.equal(view.events[0]?.toState, 'SUBMITTED')
  assert.equal(view.events[0]?.reason, 'Submitted to a different named human.')

  const caseRow = (
    await moonql.model('research_cases').list({ where: { caseCode: AR_CASE }, limit: 1 })
  )[0] as Row
  const forced = moonql.model('research_reviews').create({
    reviewCode: 'RV-FORCED',
    caseRef: String(caseRow.id),
    caseCode: AR_CASE,
    targetKind: 'CLAIM',
    targetCode: AR_CLAIM,
    evidenceSha: QURAN_SHA256,
    state: 'REVIEWED',
    version: 1,
    submittedByName: 'Forged Actor',
  })
  await assert.rejects(forced, /DRAFT at version 1/i)

  const raw = await get('research_reviews')
  assert.equal(raw.statusCode, 404, 'review rows are not a raw CRUD surface')
})

test('M14-02: exact-SHA reviewer detail and counterevidence resolution', async () => {
  const view = await detail('RV-M14-ROLE')
  assert.equal(view.evidence.caseSha, QURAN_SHA256)
  assert.equal(view.evidence.reviewSha, QURAN_SHA256)
  assert.equal(view.evidence.exactMatch, true)
  assert.equal(view.evidence.source, 'research_cases.evidenceSha')
  assert.equal(view.counterevidence.length, 2)
  for (const entry of view.counterevidence) {
    assert.equal(entry.evidenceSha, QURAN_SHA256)
    assert.equal(entry.exactMatch, true)
    assert.equal(entry.sourceVersion, 'v1')
    assert.equal(entry.citationKey, 'QS 2:82')
  }

  const forgedCe = await post('research/counterevidence/register', {
    ceCode: 'CE-FORGED',
    caseCode: AR_CASE,
    targetKind: 'CLAIM',
    targetCode: AR_CLAIM,
    sourceId: 'invented:counter',
    sourceVersion: 'v1',
    citationKey: 'QS 2:82',
    evidenceSha: 'b'.repeat(64),
    finding: 'A forged digest should never enter the review record.',
  })
  assert.equal(forgedCe.statusCode, 400)
  assert.match(errorOf(forgedCe), /exact case source digest/i)

  const forgedTarget = await registerReview('RV-FORGED-TARGET', AR_CASE, 'CLM-QS2-82-INFER')
  assert.equal(forgedTarget.statusCode, 400)
  assert.match(errorOf(forgedTarget), /not at the exact case source digest/i)

  const missingCaseSha = await registerReview('RV-NO-SHA', 'RC-QS-037-030-AR', 'CLM-QS37-30-POINTER')
  assert.equal(missingCaseSha.statusCode, 400)
  assert.match(errorOf(missingCaseSha), /exact source digest/i)

  const unresolved = await detail('RV-M14-ROLE')
  assert.ok(unresolved.counterevidence.every((entry) => entry.status === 'OPEN'))

  const blankReason = await post('research/counterevidence/CE-QS2-82-RECIPIENT/resolve', {
    status: 'ACKNOWLEDGED',
    reason: '   ',
  })
  assert.equal(blankReason.statusCode, 400)

  await resolveOpenCounterevidence()
  const resolved = await detail('RV-M14-ROLE')
  assert.ok(resolved.counterevidence.every((entry) => entry.status === 'ACKNOWLEDGED'))
  assert.ok(resolved.counterevidence.every((entry) => entry.resolvedByName === 'Alice Reviewer'))
  assert.ok(resolved.counterevidence.every((entry) => (entry.resolutionReason ?? '').length > 0))
  assert.equal(resolved.release.eligible, false)
  assert.ok(resolved.release.blockers.includes('MIZAN_RUN_REQUIRED'))
  assert.ok(resolved.release.blockers.some((blocker) => blocker.startsWith('PILOT_')))

  const again = await post('research/counterevidence/CE-QS2-82-RECIPIENT/resolve', {
    status: 'REJECTED',
    reason: 'Change my mind.',
  })
  assert.equal(again.statusCode, 409)
})

test('M14-03: independent paired pilot recording, disagreement preserved', async () => {
  const empty = await get(`research/pilot?caseCode=${AR_CASE}`)
  assert.equal(empty.statusCode, 200, empty.body)
  assert.equal(dataOf<{ pilot: { status: string } }>(empty).pilot.status, 'BLOCKED')

  const wrongSha = await post(
    'research/pilot/annotations',
    {
      caseCode: AR_CASE,
      evidenceSha: 'c'.repeat(64),
      assessment: 'SUPPORTED',
      note: 'This must be rejected.',
    },
    alice,
  )
  assert.equal(wrongSha.statusCode, 400)
  assert.match(errorOf(wrongSha), /exact case source digest/i)

  const first = await post(
    'research/pilot/annotations',
    {
      caseCode: AR_CASE,
      evidenceSha: QURAN_SHA256,
      assessment: 'SUPPORTED',
      note: 'The conditional clause is visible in the exact source span.',
    },
    alice,
  )
  assert.equal(first.statusCode, 201, first.body)
  const afterFirst = dataOf<{ pilot: { status: string; annotationCount: number; blockers: string[] } }>(first)
  assert.equal(afterFirst.pilot.status, 'BLOCKED')
  assert.equal(afterFirst.pilot.annotationCount, 1)
  assert.ok(afterFirst.pilot.blockers.includes('PILOT_NEEDS_TWO_INDEPENDENT_ANNOTATIONS'))

  const repeated = await post(
    'research/pilot/annotations',
    {
      caseCode: AR_CASE,
      evidenceSha: QURAN_SHA256,
      assessment: 'SUPPORTED',
      note: 'A repeated self-annotation is not independence.',
    },
    alice,
  )
  assert.equal(repeated.statusCode, 409)
  assert.match(errorOf(repeated), /independence is not repeatability/i)

  const second = await post(
    'research/pilot/annotations',
    {
      caseCode: AR_CASE,
      evidenceSha: QURAN_SHA256,
      assessment: 'CONTRADICTED',
      note: 'The conditional description does not settle the audience beyond the verse.',
    },
    bob,
  )
  assert.equal(second.statusCode, 201, second.body)
  const pilot = dataOf<{
    pilot: { status: string; annotationCount: number; distinctAnnotators: number; agreement: boolean | null }
  }>(second).pilot
  assert.equal(pilot.status, 'RECORDED')
  assert.equal(pilot.annotationCount, 2)
  assert.equal(pilot.distinctAnnotators, 2)
  assert.equal(pilot.agreement, false)

  const view = await detail('RV-M14-ROLE')
  assert.equal(view.pilot.status, 'RECORDED')
  assert.equal(view.pilot.agreement, false)
  assert.deepEqual(
    view.pilot.annotations.map((entry) => entry.annotatorName),
    ['Alice Reviewer', 'Bob Independent'],
  )
})

test('M14-04: bounded MIZAN method, explicit criteria and explanation', async () => {
  assert.match(MIZAN_METHOD_SHA256, /^[0-9a-f]{64}$/)
  assert.equal(MIZAN_METHOD_TEXT.includes('not divine judgment'), true)
  assert.equal(MIZAN_CRITERIA.length, 6)

  const duplicate = await post('research/mizan/methods', {
    methodCode: 'MIZAN-EVIDENCE-RISK-CONSISTENCY',
    version: '1',
    methodSha: MIZAN_METHOD_SHA256,
    methodText: MIZAN_METHOD_TEXT,
    criteria: MIZAN_CRITERIA.map((entry) => entry.key).join(','),
    scaleMin: 0,
    scaleMax: 4,
    maxScore: 24,
  })
  assert.equal(duplicate.statusCode, 409)

  const unbound = await post('research/mizan/methods', {
    methodCode: 'MIZAN-CUSTOM',
    version: '9',
    methodSha: 'd'.repeat(64),
    methodText: 'A custom method that must not be accepted.',
    criteria: 'vibes',
    scaleMin: 0,
    scaleMax: 4,
    maxScore: 24,
  })
  assert.equal(unbound.statusCode, 400)
  assert.match(errorOf(unbound), /single declared method version/i)

  const missingText = await post('research/mizan/runs', {
    runCode: 'MZR-NO-TEXT',
    reviewCode: 'RV-M14-ROLE',
    scores: scores(3),
    explanation: '   ',
    context: 'Bounded case.',
    unknowns: 'Unknown boundaries remain.',
  })
  assert.equal(missingText.statusCode, 400)

  const outOfRange = await mizanRun('MZR-BAD-SCORE', 'RV-M14-ROLE', 5)
  assert.equal(outOfRange.statusCode, 400)
  assert.match(errorOf(outOfRange), /0 to 4/)

  const unknownMethod = await post('research/mizan/runs', {
    runCode: 'MZR-UNKNOWN-METHOD',
    reviewCode: 'RV-M14-ROLE',
    methodCode: 'MIZAN-CUSTOM',
    methodVersion: '9',
    scores: scores(3),
    explanation: 'Explanation.',
    context: 'Context.',
    unknowns: 'Unknowns.',
  })
  assert.equal(unknownMethod.statusCode, 400)
  assert.match(errorOf(unknownMethod), /registered bounded method/i)

  const run = await mizanRun('MZR-M14-ROLE', 'RV-M14-ROLE', 3)
  assert.equal(run.statusCode, 201, run.body)
  const runView = dataOf<{
    totalScore: number
    maxScore: number
    methodSha: string
    scoreIsVerdict: boolean
    explanation: string
    context: string
    unknowns: string
  }>(run)
  assert.equal(runView.totalScore, 18)
  assert.equal(runView.maxScore, 24)
  assert.equal(runView.methodSha, MIZAN_METHOD_SHA256)
  assert.equal(runView.scoreIsVerdict, false)
  assert.ok(runView.explanation.length > 0)
  assert.ok(runView.context.length > 0)
  assert.ok(runView.unknowns.length > 0)

  const duplicateRun = await mizanRun('MZR-M14-ROLE', 'RV-M14-ROLE', 3)
  assert.equal(duplicateRun.statusCode, 409)

  const unacknowledged = await post(
    'research/reviews/RV-M14-ROLE/decide',
    { decision: 'APPROVED', note: 'Approving despite disagreement.', expectedVersion: 2 },
    alice,
  )
  assert.equal(unacknowledged.statusCode, 400)
  assert.match(errorOf(unacknowledged), /acknowledge the disagreement/i)

  const approved = await post(
    'research/reviews/RV-M14-ROLE/decide',
    {
      decision: 'APPROVED',
      note: 'Approved at the exact digest; the recorded disagreement is preserved and acknowledged.',
      expectedVersion: 2,
      acknowledgeDisagreement: true,
    },
    alice,
  )
  assert.equal(approved.statusCode, 200, approved.body)
  const approvedView = dataOf<{
    state: string
    decision: string
    humanReviewed: boolean
    publicationAvailable: boolean
  }>(approved)
  assert.equal(approvedView.state, 'REVIEWED')
  assert.equal(approvedView.decision, 'APPROVED')
  assert.equal(approvedView.humanReviewed, true)
  assert.equal(approvedView.publicationAvailable, false)

  const view = await detail('RV-M14-ROLE')
  assert.equal(view.mizan.method?.methodCode, 'MIZAN-EVIDENCE-RISK-CONSISTENCY')
  assert.equal(view.mizan.method?.version, '1')
  assert.equal(view.mizan.method?.methodSha, MIZAN_METHOD_SHA256)
  assert.equal(view.mizan.method?.status, 'CANDIDATE_NOT_RATIFIED')
  assert.equal(view.mizan.method?.maxScore, 24)
  assert.equal(view.mizan.runs.length, 1)
  assert.equal(view.mizan.runs[0]?.bounded, true)
  assert.equal(view.mizan.scoreIsVerdict, false)
  assert.equal(view.release.eligible, true)
  assert.equal(view.release.publicationAvailable, false)
})

test('M14-05: rejection, revision and retraction preserve the immutable trail', async () => {
  const registered = await registerReview('RV-M14-TRAIL', ID_CASE, ID_CLAIM)
  assert.equal(registered.statusCode, 201, registered.body)
  const submitted = await post('research/reviews/RV-M14-TRAIL/submit', { expectedVersion: 1 })
  assert.equal(submitted.statusCode, 200)

  const revision = await post(
    'research/reviews/RV-M14-TRAIL/decide',
    {
      decision: 'REVISION_REQUESTED',
      note: 'Name the translation edition and version in the claim text before approval.',
      expectedVersion: 2,
    },
    alice,
  )
  assert.equal(revision.statusCode, 200, revision.body)
  assert.equal(dataOf<{ state: string; decision: string }>(revision).state, 'DRAFT')
  assert.equal(dataOf<{ state: string; decision: string }>(revision).decision, 'REVISION_REQUESTED')

  const resubmitted = await post('research/reviews/RV-M14-TRAIL/submit', {
    expectedVersion: 3,
    note: 'The claim now names the licensed edition and version.',
  })
  assert.equal(resubmitted.statusCode, 200)

  const rejected = await post(
    'research/reviews/RV-M14-TRAIL/decide',
    {
      decision: 'REJECTED',
      note: 'The translation sense cannot be promoted without a rights review.',
      expectedVersion: 4,
    },
    alice,
  )
  assert.equal(rejected.statusCode, 200, rejected.body)
  assert.equal(dataOf<{ state: string; decision: string }>(rejected).state, 'REJECTED')

  const retracted = await post('research/reviews/RV-M14-TRAIL/retract', {
    reason: 'Superseded by a new review; the old decision must stay visible.',
    expectedVersion: 5,
  })
  assert.equal(retracted.statusCode, 200, retracted.body)
  const retractView = dataOf<{ state: string; decisionPreserved: string; publicationAvailable: boolean }>(retracted)
  assert.equal(retractView.state, 'RETRACTED')
  assert.equal(retractView.decisionPreserved, 'REJECTED')
  assert.equal(retractView.publicationAvailable, false)

  const view = await detail('RV-M14-TRAIL')
  assert.equal(view.state, 'RETRACTED')
  assert.equal(view.decision, 'REJECTED')
  assert.equal(view.release.eligible, false)
  assert.equal(view.release.publicationAvailable, false)
  assert.deepEqual(
    view.events.map((entry) => entry.action),
    ['SUBMIT', 'REQUEST_REVISION', 'SUBMIT', 'REJECT', 'RETRACT'],
  )
  assert.deepEqual(
    view.events.map((entry) => entry.actorName),
    ['Administrator', 'Alice Reviewer', 'Administrator', 'Alice Reviewer', 'Administrator'],
  )
  assert.ok(view.events.some((entry) => entry.reason.includes('translation edition')))
  assert.ok(view.events.some((entry) => entry.reason.includes('Superseded')))

  const wrongVersion = await post(
    'research/reviews/RV-M14-TRAIL/retract',
    { reason: 'Stale version.', expectedVersion: 3 },
    admin,
  )
  assert.equal(wrongVersion.statusCode, 409)

  const reviewRow = (await moonql.model('research_reviews').list({ where: { reviewCode: 'RV-M14-TRAIL' }, limit: 1 }))[0] as Row
  await assert.rejects(
    moonql.model('research_reviews').update(String(reviewRow.id), { targetCode: 'CLM-FORGED' }),
    /immutable/i,
  )
  const eventRow = (
    await moonql.model('research_review_events').list({ where: { reviewCode: 'RV-M14-TRAIL' }, limit: 1 })
  )[0] as Row
  await assert.rejects(moonql.model('research_review_events').remove(String(eventRow.id)), /immutable/i)
  await assert.rejects(moonql.model('research_reviews').remove(String(reviewRow.id)), /never deleted/i)

  const dispute = await post(
    'research/reviews/RV-M14-ROLE/dispute',
    { reason: 'The disagreement needs a formal dispute record.', expectedVersion: 3 },
    bob,
  )
  assert.equal(dispute.statusCode, 200, dispute.body)
  const selfResolve = await post(
    'research/reviews/RV-M14-ROLE/resolve',
    { reason: 'I resolve my own dispute.', expectedVersion: 4 },
    bob,
  )
  assert.equal(selfResolve.statusCode, 403)
  const resolved = await post(
    'research/reviews/RV-M14-ROLE/resolve',
    { reason: 'The dispute was reviewed against the exact digest and closed.', expectedVersion: 4 },
    alice,
  )
  assert.equal(resolved.statusCode, 200, resolved.body)
  const afterResolve = await detail('RV-M14-ROLE')
  assert.equal(afterResolve.state, 'REVIEWED')
  assert.equal(afterResolve.release.eligible, true)
  assert.deepEqual(
    afterResolve.events.map((entry) => entry.action),
    ['SUBMIT', 'APPROVE', 'DISPUTE', 'RESOLVE_DISPUTE'],
  )
})

test('M14-06: wrong role, forged evidence and a concurrent approval race', async () => {
  const wrongRole = await post(
    'research/reviews/RV-M14-ROLE/decide',
    { decision: 'APPROVED', note: 'Guest tries to approve.', expectedVersion: 5 },
    guest,
  )
  assert.equal(wrongRole.statusCode, 403)

  const forgedCe = await post('research/counterevidence/register', {
    ceCode: 'CE-RACE-FORGED',
    caseCode: AR_CASE,
    targetKind: 'CLAIM',
    targetCode: AR_CLAIM,
    sourceId: 'invented:race',
    sourceVersion: 'v1',
    citationKey: 'QS 2:82',
    evidenceSha: 'e'.repeat(64),
    finding: 'Forged.',
  })
  assert.equal(forgedCe.statusCode, 400)

  const noTarget = await registerReview('RV-RACE-NO-TARGET', AR_CASE, 'CLM-DOES-NOT-EXIST')
  assert.equal(noTarget.statusCode, 404)
  const noRunTarget = await post('research/mizan/runs', {
    runCode: 'MZR-NO-REVIEW',
    reviewCode: 'RV-DOES-NOT-EXIST',
    scores: scores(3),
    explanation: 'Explanation.',
    context: 'Context.',
    unknowns: 'Unknowns.',
  })
  assert.equal(noRunTarget.statusCode, 404)

  assert.equal((await registerReview('RV-M14-RACE', AR_CASE, AR_CLAIM)).statusCode, 201)
  assert.equal(
    (await post('research/reviews/RV-M14-RACE/submit', { expectedVersion: 1 })).statusCode,
    200,
  )
  const run = await mizanRun('MZR-M14-RACE', 'RV-M14-RACE', 4)
  assert.equal(run.statusCode, 201, run.body)

  const approve = (headers: Headers) =>
    post(
      'research/reviews/RV-M14-RACE/decide',
      {
        decision: 'APPROVED',
        note: 'Approved at the exact digest with the recorded pilot disagreement acknowledged.',
        expectedVersion: 2,
        acknowledgeDisagreement: true,
      },
      headers,
    )
  const [first, second] = await Promise.all([approve(alice), approve(bob)])
  const codes = [first.statusCode, second.statusCode].sort()
  assert.deepEqual(codes, [200, 409])
  const winner = first.statusCode === 200 ? first : second
  const loser = first.statusCode === 200 ? second : first
  assert.match(errorOf(loser), /changed concurrently/i)

  const view = await detail('RV-M14-RACE')
  assert.equal(view.state, 'REVIEWED')
  assert.equal(view.version, 3)
  assert.equal(view.decision, 'APPROVED')
  const approvalEvents = view.events.filter((entry) => entry.action === 'APPROVE')
  assert.equal(approvalEvents.length, 1)
  assert.equal(approvalEvents[0]?.versionTo, 3)
  assert.ok(['Alice Reviewer', 'Bob Independent'].includes(approvalEvents[0]?.actorName ?? ''))
  assert.equal(view.reviewer?.name, approvalEvents[0]?.actorName)
  assert.equal(view.release.eligible, true)
  assert.equal(view.release.publicationAvailable, false)
  assert.equal(dataOf<{ humanReviewed: boolean }>(winner).humanReviewed, true)
})

test('M14-07: release criteria stay fail-closed while publication is unavailable', async () => {
  const roleRelease = await get('research/reviews/RV-M14-ROLE/release')
  assert.equal(roleRelease.statusCode, 200, roleRelease.body)
  const role = dataOf<ReleaseView & { notice: string }>(roleRelease)
  assert.equal(role.eligible, true)
  assert.equal(role.humanReviewed, true)
  assert.equal(role.reviewedAtExactSha, true)
  assert.equal(role.publicationAvailable, false)
  assert.equal(role.autoApproved, false)
  assert.equal(role.scoreIsVerdict, false)
  assert.deepEqual(role.blockers, [])

  assert.equal((await registerReview('RV-M14-INCOMPLETE', ID_CASE, ID_CLAIM)).statusCode, 201)
  assert.equal(
    (await post('research/reviews/RV-M14-INCOMPLETE/submit', { expectedVersion: 1 })).statusCode,
    200,
  )
  const incompleteRun = await mizanRun('MZR-M14-INCOMPLETE', 'RV-M14-INCOMPLETE', 3)
  assert.equal(incompleteRun.statusCode, 201, incompleteRun.body)

  const blocked = await post(
    'research/reviews/RV-M14-INCOMPLETE/decide',
    {
      decision: 'APPROVED',
      note: 'Attempt without a paired pilot or counterevidence.',
      expectedVersion: 2,
      acknowledgeDisagreement: true,
    },
    alice,
  )
  assert.equal(blocked.statusCode, 400, blocked.body)
  assert.match(errorOf(blocked), /COUNTEREVIDENCE_MISSING/)
  assert.match(errorOf(blocked), /PILOT_NEEDS_TWO_INDEPENDENT_ANNOTATIONS/)

  const release = dataOf<ReleaseView>(
    await get('research/reviews/RV-M14-INCOMPLETE/release'),
  )
  assert.equal(release.eligible, false)
  assert.equal(release.humanReviewed, false)
  assert.equal(release.publicationAvailable, false)
  assert.ok(release.blockers.includes('COUNTEREVIDENCE_MISSING'))
  assert.ok(release.blockers.includes('PILOT_NEEDS_TWO_INDEPENDENT_ANNOTATIONS'))

  const pilot = dataOf<{ pilot: { status: string; blockers: string[] } }>(
    await get(`research/pilot?caseCode=${ID_CASE}`),
  )
  assert.equal(pilot.pilot.status, 'BLOCKED')
  assert.ok(pilot.pilot.blockers.includes('PILOT_NEEDS_TWO_INDEPENDENT_ANNOTATIONS'))

  const list = dataOf<{ count: number; reviews: Array<{ publicationAvailable: boolean; humanReviewed: boolean }> }>(
    await get('research/reviews'),
  )
  assert.ok(list.count >= 3)
  assert.ok(list.reviews.every((entry) => entry.publicationAvailable === false))
  assert.ok(list.reviews.some((entry) => entry.humanReviewed === true))
  assert.ok(list.reviews.some((entry) => entry.humanReviewed === false))

  const trailRelease = dataOf<ReleaseView>(await get('research/reviews/RV-M14-TRAIL/release'))
  assert.equal(trailRelease.eligible, false)
  assert.equal(trailRelease.publicationAvailable, false)
  assert.ok(trailRelease.blockers.includes('REVIEW_STATE_NOT_REVIEWED'))
})
