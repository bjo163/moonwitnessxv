import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify from 'fastify'
import { bootMoonQl, moonqlRest } from '@moonwitness/moonql'
import base from '@moonwitness/moonql-base'
import auth, { hashPassword } from '@moonwitness/moonql-auth'
import ontology from '@moonwitness/moonql-ontology'
import corpus from '@moonwitness/moonql-corpus'
import actors from '@moonwitness/moonql-actors'
import research, {
  MIZAN_CRITERIA,
  MIZAN_METHOD_SHA256,
  QURAN_SHA256,
} from '@moonwitness/moonql-research'
import envelope from '../src/plugins/envelope.js'
import { adminHeaders, TEST_ADMIN_PASSWORD } from './helpers/auth.js'

/**
 * M14 against real PostgreSQL: the review machine, immutable event trail,
 * counterevidence, pilot annotations and MIZAN runs must survive SQL with the
 * same fail-closed answer. A concurrent approval still yields exactly one
 * decision, and even a reviewed claim is never reported as published.
 *
 * Runs only when a disposable database is handed in (CI has none):
 *   PARITY_DATABASE_URL=postgres://... pnpm --filter @moonwitness/radio test
 */
const DB_URL = process.env.PARITY_DATABASE_URL ?? process.env.DATABASE_URL ?? ''
const quiet = { info: () => {}, warn: () => {} }
const dataOf = <T>(res: { json(): unknown }): T => (res.json() as { data: T }).data

const AR_CASE = 'RC-QS-002-082-AR'
const AR_CLAIM = 'CLM-QS2-82-COND'
const REVIEW_ONE = 'RV-PG-M14-01'
const REVIEW_TWO = 'RV-PG-M14-02'
const RUN_ONE = 'MZR-PG-M14-01'
const RUN_TWO = 'MZR-PG-M14-02'
const ALICE_LOGIN = 'alice-pg-m14'
const BOB_LOGIN = 'bob-pg-m14'

type Row = Record<string, unknown>
type Headers = Record<string, string>

interface ReleaseView {
  eligible: boolean
  humanReviewed: boolean
  reviewedAtExactSha: boolean
  publicationAvailable: boolean
  autoApproved: boolean
  scoreIsVerdict: boolean
  blockers: string[]
}

interface ReviewView {
  state: string
  version: number
  decision: string | null
  evidence: { caseSha: string; exactMatch: boolean }
  pilot: { status: string; annotationCount: number; agreement: boolean | null }
  mizan: { runs: Array<{ bounded: boolean; totalScore: number; methodSha: string }> }
  events: Array<{ action: string; versionTo: number; actorName: string }>
  release: ReleaseView
  publicationAvailable: boolean
}

const scores = (value: number): string =>
  JSON.stringify(Object.fromEntries(MIZAN_CRITERIA.map((entry) => [entry.key, value])))

test(
  'M14: review machine, pilot and MIZAN survive PostgreSQL with one winning approval',
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

    const post = (path: string, body: Row, headers: Headers) =>
      app.inject().post(`/orm/${path}`).headers(headers).body(body).end()
    const get = (path: string, headers: Headers) => app.inject().get(`/orm/${path}`).headers(headers).end()
    const detail = async (code: string, headers: Headers): Promise<ReviewView> => {
      const res = await get(`research/reviews/${code}`, headers)
      assert.equal(res.statusCode, 200, res.body)
      return dataOf<ReviewView>(res)
    }

    const reviewCodes = [REVIEW_ONE, REVIEW_TWO]
    const runCodes = [RUN_ONE, RUN_TWO]
    const cleanup = async (): Promise<void> => {
      await moonql.model('mizan_runs').removeWhere({ reviewCode: REVIEW_ONE })
      await moonql.model('mizan_runs').removeWhere({ reviewCode: REVIEW_TWO })
      await moonql.model('research_review_events').removeWhere({ reviewCode: REVIEW_ONE })
      await moonql.model('research_review_events').removeWhere({ reviewCode: REVIEW_TWO })
      await moonql.model('research_reviews').removeWhere({ reviewCode: REVIEW_ONE })
      await moonql.model('research_reviews').removeWhere({ reviewCode: REVIEW_TWO })
      await moonql.model('research_pilot_annotations').removeWhere({ caseCode: AR_CASE })
      for (const login of [ALICE_LOGIN, BOB_LOGIN]) {
        const users = (await moonql.model('auth_users').list({ where: { login }, limit: 1 })) as Row[]
        for (const user of users) {
          await moonql.model('auth_sessions').removeWhere({ userRef: user.id })
          await moonql.model('auth_users').removeWhere({ login })
        }
      }
      for (const code of ['CE-QS2-82-RECIPIENT', 'CE-QS2-82-DEFINITION']) {
        const rows = (await moonql.model('research_counterevidence').list({ where: { ceCode: code }, limit: 1 })) as Row[]
        if (rows[0]) {
          await moonql.model('research_counterevidence').update(String(rows[0].id), {
            status: 'OPEN',
            resolutionReason: null,
            resolvedByRef: null,
            resolvedByName: null,
            resolvedAt: null,
          })
        }
      }
      assert.ok(reviewCodes.length === 2 && runCodes.length === 2)
    }

    await cleanup()
    t.after(async () => {
      await cleanup()
      await app.close()
      await moonql.close()
    })

    assert.equal(moonql.engine, 'pg', 'this drill must not silently fall back to memory')
    const admin = await adminHeaders(app, '/orm')

    const makeUser = async (login: string, displayName: string): Promise<Headers> => {
      await moonql.model('auth_users').create({
        login,
        displayName,
        passwordHash: hashPassword(`${login}-pw`),
        role: 'user',
      })
      const res = await app.inject().post('/orm/auth/login').body({ login, password: `${login}-pw` }).end()
      assert.equal(res.statusCode, 200, res.body)
      return { authorization: `Bearer ${dataOf<{ token: string }>(res).token}` }
    }
    const alice = await makeUser(ALICE_LOGIN, 'Alice PG Reviewer')
    const bob = await makeUser(BOB_LOGIN, 'Bob PG Reviewer')

    const seededMethods = (await moonql.model('mizan_methods').list({ limit: 10 })) as Row[]
    const method = seededMethods.find((entry) => entry.methodSha === MIZAN_METHOD_SHA256)
    assert.ok(method, 'the bounded MIZAN method seed must exist in PostgreSQL')

    const register = (code: string) =>
      post(
        'research/reviews/register',
        { reviewCode: code, caseCode: AR_CASE, targetKind: 'CLAIM', targetCode: AR_CLAIM },
        admin,
      )
    assert.equal((await register(REVIEW_ONE)).statusCode, 201)
    assert.equal((await register(REVIEW_TWO)).statusCode, 201)

    for (const code of reviewCodes) {
      const submit = await post(`research/reviews/${code}/submit`, { expectedVersion: 1 }, admin)
      assert.equal(submit.statusCode, 200, submit.body)
    }

    for (const ceCode of ['CE-QS2-82-RECIPIENT', 'CE-QS2-82-DEFINITION']) {
      const resolve = await post(
        `research/counterevidence/${ceCode}/resolve`,
        { status: 'ACKNOWLEDGED', reason: 'Preserved as a bound on the claim.' },
        alice,
      )
      assert.equal(resolve.statusCode, 200, resolve.body)
    }

    const annotate = (caseCode: string, headers: Headers, assessment: string) =>
      post(
        'research/pilot/annotations',
        {
          caseCode,
          evidenceSha: QURAN_SHA256,
          assessment,
          note: 'Inspected the exact source digest independently.',
        },
        headers,
      )
    assert.equal((await annotate(AR_CASE, admin, 'SUPPORTED')).statusCode, 201)
    assert.equal((await annotate(AR_CASE, bob, 'SUPPORTED')).statusCode, 201)

    for (const [code, runCode] of [
      [REVIEW_ONE, RUN_ONE],
      [REVIEW_TWO, RUN_TWO],
    ] as const) {
      const run = await post(
        'research/mizan/runs',
        {
          runCode,
          reviewCode: code,
          scores: scores(3),
          explanation: 'Each criterion was checked against the exact digest.',
          context: 'Bounded QS 2:82 case.',
          unknowns: 'Belief and righteous action remain undefined by this verse.',
        },
        alice,
      )
      assert.equal(run.statusCode, 201, run.body)
    }

    const approved = await post(
      `research/reviews/${REVIEW_ONE}/decide`,
      { decision: 'APPROVED', note: 'Approved at the exact digest.', expectedVersion: 2 },
      alice,
    )
    assert.equal(approved.statusCode, 200, approved.body)
    const one = await detail(REVIEW_ONE, admin)
    assert.equal(one.state, 'REVIEWED')
    assert.equal(one.decision, 'APPROVED')
    assert.equal(one.evidence.caseSha, QURAN_SHA256)
    assert.equal(one.evidence.exactMatch, true)
    assert.equal(one.pilot.status, 'RECORDED')
    assert.equal(one.pilot.annotationCount, 2)
    assert.equal(one.pilot.agreement, true)
    assert.equal(one.mizan.runs.length, 1)
    assert.equal(one.mizan.runs[0]?.bounded, true)
    assert.equal(one.mizan.runs[0]?.totalScore, 18)
    assert.equal(one.mizan.runs[0]?.methodSha, MIZAN_METHOD_SHA256)
    assert.equal(one.release.eligible, true)
    assert.equal(one.release.publicationAvailable, false)
    assert.equal(one.events.length, 2)
    assert.deepEqual(
      one.events.map((entry) => entry.action),
      ['SUBMIT', 'APPROVE'],
    )

    const approve = (headers: Headers) =>
      post(
        `research/reviews/${REVIEW_TWO}/decide`,
        {
          decision: 'APPROVED',
          note: 'Concurrent named approval at the exact digest.',
          expectedVersion: 2,
        },
        headers,
      )
    const [first, second] = await Promise.all([approve(alice), approve(bob)])
    assert.deepEqual([first.statusCode, second.statusCode].sort(), [200, 409])
    const race = await detail(REVIEW_TWO, admin)
    assert.equal(race.state, 'REVIEWED')
    assert.equal(race.version, 3)
    assert.equal(race.events.filter((entry) => entry.action === 'APPROVE').length, 1)
    assert.equal(race.release.eligible, true)
    assert.equal(race.release.publicationAvailable, false)

    const list = dataOf<{ reviews: Array<{ reviewCode: string; publicationAvailable: boolean }> }>(
      await get('research/reviews', admin),
    )
    assert.ok(list.reviews.every((entry) => entry.publicationAvailable === false))
  },
)
