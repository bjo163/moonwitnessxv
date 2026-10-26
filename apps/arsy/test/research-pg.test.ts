import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify from 'fastify'
import { bootMoonQl, moonqlRest } from '@moonwitness/moonql'
import base from '@moonwitness/moonql-base'
import auth from '@moonwitness/moonql-auth'
import ontology from '@moonwitness/moonql-ontology'
import corpus from '@moonwitness/moonql-corpus'
import actors from '@moonwitness/moonql-actors'
import research, { QURAN_SHA256 } from '@moonwitness/moonql-research'
import envelope from '../src/plugins/envelope.js'
import { adminHeaders, TEST_ADMIN_PASSWORD } from './helpers/auth.js'

/**
 * M13 against real PostgreSQL: the SRGBL stages, Key Witness and hypotheses must
 * survive SQL with the same fail-closed result. A stale digest still fails S1,
 * zero evidence weight still yields UNKNOWN direction, a hypothesis still cannot
 * validate itself, and no row ever claims human review.
 *
 * Runs only when a disposable database is handed in (CI has none):
 *   PARITY_DATABASE_URL=postgres://... pnpm --filter @moonwitness/arsy test
 */
const DB_URL = process.env.PARITY_DATABASE_URL ?? process.env.DATABASE_URL ?? ''
const quiet = { info: () => {}, warn: () => {} }
const dataOf = <T>(res: { json(): unknown }): T => (res.json() as { data: T }).data
const errorOf = (res: { json(): unknown }): string => (res.json() as { error: { message: string } }).error.message

const AR_CASE = 'RC-QS-002-082-AR'
const ID_CASE = 'RC-QS-002-082-ID'
const OPEN_CASE = 'RC-QS-037-030-AR'
const TEST_WITNESS = 'KW-PG-01'
const TEST_HYPOTHESIS = 'HYP-PG-01'

interface StageView {
  stage: string
  status: 'PASS' | 'UNKNOWN' | 'FAIL'
  code: string
  evidenceRefs: string[]
}

interface PgCaseView {
  caseCode: string
  source: { edition: { code: string } | null; rawTextExposed: boolean }
  review: { humanReviewed: boolean; humanReviewAvailableInMilestone: boolean; label: string }
  stages: StageView[]
  maturity: { score: number; max: number; verifiedLevel: string | null }
  metrics: {
    maturity: { score: number; max: number }
    quality: { status: string; score: number | null; max: number }
    witness: { status: string; aggregate: null; assessments: Array<{ raw: number; reviewEligibility: string }> }
    direction: { status: string; value: number | null; reason?: string }
    combined: null
    ranking: boolean
    merged: boolean
  }
  witnesses: Array<{ witnessCode: string; humanReviewed: boolean; limits: string; claimKind: string }>
  hypotheses: Array<{ hypothesisCode: string; status: string; selfValidated: boolean; inheritedScore: number | null }>
}

interface PgOverview {
  counts: Record<string, number>
  review: { humanReviewed: boolean; label: string }
  meta: { p19ReleaseDecision: string; pins: { p19Specs: { sha256: string } } }
  policy: { failClosedUnknown: boolean; exactShaRequired: boolean; combinedScore: null }
}

test(
  'M13: SRGBL stages, Key Witness and hypotheses survive PostgreSQL',
  { skip: DB_URL ? false : 'no PARITY_DATABASE_URL/DATABASE_URL — the PG slice needs a server' },
  async (t) => {
    const moonql = await bootMoonQl({
      databaseUrl: DB_URL,
      addons: [base, auth, ontology, corpus, actors, research],
      env: { MOONQL_AUTH_ADMIN_PASSWORD: TEST_ADMIN_PASSWORD },
      seedPolicy: 'off',
      cronEnabled: false,
      log: quiet,
    })
    const app = Fastify({ logger: false })
    await app.register(envelope)
    await app.register(moonqlRest, { prefix: '/orm', instance: moonql })
    await app.ready()

    const caseRows = (await moonql.model('research_cases').list({ where: { caseCode: AR_CASE }, limit: 1 })) as Array<
      Record<string, unknown>
    >
    const caseId = String(caseRows[0]?.id)
    assert.ok(caseRows[0], 'the seed case must exist in PostgreSQL')

    const cleanup = async (): Promise<void> => {
      await moonql.model('research_hypotheses').removeWhere({ hypothesisCode: TEST_HYPOTHESIS })
      await moonql.model('research_witnesses').removeWhere({ witnessCode: TEST_WITNESS })
      await moonql.model('research_cases').update(caseId, { evidenceSha: QURAN_SHA256 })
    }

    await cleanup()
    t.after(async () => {
      await cleanup()
      await app.close()
      await moonql.close()
    })

    assert.equal(moonql.engine, 'pg', 'this drill must not silently fall back to memory')

    const headers = await adminHeaders(app, '/orm')
    const getCase = async (code: string): Promise<PgCaseView> => {
      const res = await app.inject().get(`/orm/research/case?code=${encodeURIComponent(code)}`).end()
      assert.equal(res.statusCode, 200, res.body)
      return dataOf<PgCaseView>(res)
    }

    const overviewRes = await app.inject().get('/orm/research/overview').end()
    assert.equal(overviewRes.statusCode, 200, overviewRes.body)
    const overview = dataOf<PgOverview>(overviewRes)
    assert.equal(overview.meta.pins.p19Specs.sha256, 'c87c2a498dbe5340fe5a4ef3680f9c55d858beb89362f88d28832f314fa8c456')
    assert.equal(overview.meta.p19ReleaseDecision, 'BLOCKED')
    assert.equal(overview.policy.failClosedUnknown, true)
    assert.equal(overview.policy.exactShaRequired, true)
    assert.equal(overview.policy.combinedScore, null)
    assert.equal(overview.review.humanReviewed, false)
    assert.equal(overview.counts.cases, 3)
    assert.equal(overview.counts.witnesses, 2)

    const arabic = await getCase(AR_CASE)
    assert.deepEqual(
      arabic.stages.map((stage) => stage.status),
      ['PASS', 'PASS', 'PASS', 'PASS', 'PASS'],
    )
    assert.equal(arabic.maturity.score, 15)
    assert.equal(arabic.metrics.quality.score, 28)
    assert.equal(arabic.metrics.quality.max, 40)
    assert.equal(arabic.metrics.witness.assessments[0]?.raw, 75)
    assert.equal(arabic.metrics.witness.assessments[0]?.reviewEligibility, 'eligible-for-review')
    assert.equal(arabic.metrics.witness.aggregate, null)
    assert.equal(arabic.metrics.direction.status, 'scored')
    assert.equal(arabic.metrics.direction.value, 2)
    assert.equal(arabic.metrics.combined, null)
    assert.equal(arabic.metrics.ranking, false)
    assert.equal(arabic.metrics.merged, false)
    assert.equal(arabic.source.rawTextExposed, false)
    assert.equal(arabic.review.humanReviewed, false)
    assert.match(arabic.review.label, /not a human review/i)
    assert.equal(arabic.review.humanReviewAvailableInMilestone, false)

    const translation = await getCase(ID_CASE)
    assert.equal(translation.maturity.score, 3)
    assert.equal(translation.metrics.direction.status, 'unknown')
    assert.equal(translation.metrics.direction.value, null)
    assert.match(translation.metrics.direction.reason ?? '', /no positive evidence weight/)

    const unresolved = await getCase(OPEN_CASE)
    assert.deepEqual(
      unresolved.stages.map((stage) => stage.status),
      ['UNKNOWN', 'UNKNOWN', 'UNKNOWN', 'UNKNOWN', 'UNKNOWN'],
    )
    assert.equal(unresolved.source.edition, null)
    assert.equal(unresolved.maturity.score, 0)

    const postWitness = await app
      .inject()
      .post('/orm/research/witnesses/register')
      .headers(headers)
      .body({
        witnessCode: TEST_WITNESS,
        caseCode: AR_CASE,
        frameCode: 'FR-QS2-82-ISLAMIC',
        claimCode: 'CLM-QS2-82-COND',
        keyToken: 'trust',
        direction: 1,
        intensity: 1,
        confidencePct: 50,
        weight: 1,
        conclusion: 'A PostgreSQL drill conclusion tied to the exact verse digest.',
        limits: 'One verse only; no person-level verdict.',
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
      })
      .end()
    assert.equal(postWitness.statusCode, 201, postWitness.body)
    assert.equal(dataOf<{ witness: { humanReviewed: boolean } }>(postWitness).witness.humanReviewed, false)

    const duplicateWitness = await app
      .inject()
      .post('/orm/research/witnesses/register')
      .headers(headers)
      .body({
        witnessCode: TEST_WITNESS,
        caseCode: AR_CASE,
        frameCode: 'FR-QS2-82-ISLAMIC',
        claimCode: 'CLM-QS2-82-COND',
        keyToken: 'trust',
        direction: 1,
        intensity: 1,
        confidencePct: 50,
        weight: 1,
        conclusion: 'Duplicate code must not win.',
        limits: 'One verse only.',
        contextNote: 'Immediate verse context.',
        boundaryNote: 'Not a divine judgment.',
        evidenceRef: 'QS 2:82 @ quran_cairo_hafs',
        evidenceSha: QURAN_SHA256,
        sourceFidelity: 5,
        observability: 5,
        semanticConsistency: 5,
        crossReference: 5,
        nonOverlapping: 5,
        claimKind: 'BOUNDED_DERIVED_READING',
        reviewState: 'UNREVIEWED',
      })
      .end()
    assert.equal(duplicateWitness.statusCode, 409)

    const afterWitness = await getCase(AR_CASE)
    assert.equal(afterWitness.stages[4]?.status, 'PASS')
    assert.ok(afterWitness.witnesses.some((witness) => witness.witnessCode === TEST_WITNESS))
    assert.ok(afterWitness.witnesses.every((witness) => witness.limits.length > 0 && !witness.humanReviewed))

    const hypothesis = await app
      .inject()
      .post('/orm/research/hypotheses/register')
      .headers(headers)
      .body({
        hypothesisCode: TEST_HYPOTHESIS,
        caseCode: AR_CASE,
        frameCode: 'FR-QS2-82-ISLAMIC',
        mode: 'POSITIVE_CORRECTION',
        question: 'Does the verse correct the identity-only reading within its declared lens?',
        evidenceSpan: 'QS 2:82 — conditional clause',
        evidenceSha: QURAN_SHA256,
        lens: 'ISLAMIC_QURAN_ANCHORED',
        counterReadings: 'Preserve the competing reading that the verse does not define every term.',
        proposedBy: 'M13 PG proposer',
      })
      .end()
    assert.equal(hypothesis.statusCode, 201, hypothesis.body)
    assert.equal(dataOf<{ hypothesis: { status: string; inheritedScore: null; verified: boolean } }>(hypothesis).hypothesis.status, 'CANDIDATE')

    const selfValidation = await app
      .inject()
      .post('/orm/research/hypotheses/validate')
      .headers(headers)
      .body({
        hypothesisCode: TEST_HYPOTHESIS,
        validatedBy: 'M13 PG proposer',
        decision: 'KEEP_CANDIDATE',
        reason: 'self',
      })
      .end()
    assert.equal(selfValidation.statusCode, 400)
    assert.match(errorOf(selfValidation), /own proposer/)

    const corroborated = await app
      .inject()
      .post('/orm/research/hypotheses/validate')
      .headers(headers)
      .body({
        hypothesisCode: TEST_HYPOTHESIS,
        validatedBy: 'Independent PG check',
        decision: 'CORROBORATE',
        independentSourceRef: 'QS 2:82 @ quran_cairo_hafs (second pass)',
        reason: 'The conditional structure is confirmed at the same exact digest.',
      })
      .end()
    assert.equal(corroborated.statusCode, 200, corroborated.body)
    const corroboratedView = dataOf<{
      hypothesis: { status: string; humanReviewed: boolean; inheritedScore: null; verified: boolean }
    }>(corroborated)
    assert.equal(corroboratedView.hypothesis.status, 'CORROBORATED')
    assert.equal(corroboratedView.hypothesis.verified, false)
    assert.equal(corroboratedView.hypothesis.humanReviewed, false)
    assert.equal(corroboratedView.hypothesis.inheritedScore, null)

    const swing = await app
      .inject()
      .post('/orm/research/swing/propose')
      .headers(headers)
      .body({
        subject: 'conditional belief',
        relation: 'conditions',
        object: 'garden reward',
        operators: 'direction,polarity,subject-object',
      })
      .end()
    assert.equal(swing.statusCode, 200, swing.body)
    const swingData = dataOf<{
      candidates: Array<{ depth: number; state: string; evidenceStatus: string; inheritedScore: null }>
      stop: string
    }>(swing)
    assert.equal(swingData.stop, 'complete')
    assert.equal(swingData.candidates.length, 3)
    assert.ok(swingData.candidates.every((candidate) => candidate.state === 'CANDIDATE'))
    assert.ok(swingData.candidates.every((candidate) => candidate.evidenceStatus === 'UNVERIFIED'))
    assert.ok(swingData.candidates.every((candidate) => candidate.inheritedScore === null))

    const tooDeep = await app
      .inject()
      .post('/orm/research/swing/propose')
      .headers(headers)
      .body({
        subject: 'a',
        relation: 'points to',
        object: 'b',
        operators: 'direction,polarity,perspective,temporal',
      })
      .end()
    assert.equal(tooDeep.statusCode, 400)

    await moonql.model('research_cases').update(caseId, { evidenceSha: 'a'.repeat(64) })
    const tampered = await getCase(AR_CASE)
    assert.equal(tampered.stages[0]?.status, 'FAIL')
    assert.equal(tampered.stages[0]?.code, 'EVIDENCE_SHA_MISMATCH')
    assert.equal(tampered.metrics.maturity.score, 0)
    await moonql.model('research_cases').update(caseId, { evidenceSha: QURAN_SHA256 })
  },
)
