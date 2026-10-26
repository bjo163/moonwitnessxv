import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify from 'fastify'
import { bootMoonQl, moonqlRest } from '@moonwitness/moonql'
import base from '@moonwitness/moonql-base'
import auth from '@moonwitness/moonql-auth'
import unilex from '@moonwitness/moonql-unilex'
import envelope from '../src/plugins/envelope.js'
import { adminHeaders, TEST_ADMIN_PASSWORD } from './helpers/auth.js'

/**
 * M09: the UNILEX projection and the reviewer-gated identity flow against real
 * PostgreSQL — the seed must survive the SQL engine with its scripts, senses and
 * negative decisions intact, and a match decision must land as a typed relation.
 *
 * Runs only when a disposable database is handed in (CI has none):
 *   PARITY_DATABASE_URL=postgres://... pnpm --filter @moonwitness/arsy test
 */
const DB_URL = process.env.PARITY_DATABASE_URL ?? process.env.DATABASE_URL ?? ''
const quiet = { info: () => {}, warn: () => {} }

interface TermsBody {
  state: string
  registry: { seedCount: number; rawSha256: string; notice: string }
  total: number
  terms: Array<{
    stableId: string
    forms: Array<{ languageCode: string; scriptCode: string; direction: string; headword: string }>
    senses: Array<{ scope: string; definition: string }>
    relations: Array<{ relationType: string; status: string; targetStableId: string | null }>
  }>
}

interface TermBody {
  term: { stableId: string; editorialStatus: string }
  forms: Array<{ languageCode: string; direction: string; headword: string }>
  relations: Array<{ relationType: string; status: string; targetStableId: string | null }>
}

interface PreviewBody {
  classification: string
  identityClaimed: boolean
  autoRelation: unknown
  reasons: string[]
}

interface ReviewBody {
  state: string
  review: { decision: string; classification: string }
  relation: { relationType: string; status: string } | null
}

const dataOf = <T>(res: { json(): unknown }): T => (res.json() as { data: T }).data

test(
  'M09: UNILEX seed and reviewer decisions survive PostgreSQL',
  { skip: DB_URL ? false : 'no PARITY_DATABASE_URL/DATABASE_URL — the PG slice needs a server' },
  async (t) => {
    const moonql = await bootMoonQl({
      databaseUrl: DB_URL,
      addons: [base, auth, unilex],
      env: { MOONQL_AUTH_ADMIN_PASSWORD: TEST_ADMIN_PASSWORD },
      seedPolicy: 'off',
      cronEnabled: false,
      log: quiet,
    })
    const app = Fastify({ logger: false })
    await app.register(envelope)
    await app.register(moonqlRest, { prefix: '/orm', instance: moonql })
    await app.ready()

    t.after(async () => {
      const terms = await moonql.model('unilex_terms').list({ where: { stableId: 'P090' } })
      const other = await moonql.model('unilex_terms').list({ where: { stableId: 'P091' } })
      const ids = [...terms, ...other].map((row) => String(row.id))
      if (ids.length > 0) {
        await moonql.model('unilex_relations').removeWhere({ sourceTermRef: ids[0] })
        await moonql.model('unilex_relations').removeWhere({ targetTermRef: ids[0] })
        await moonql.model('unilex_relations').removeWhere({ sourceTermRef: ids[1] })
        await moonql.model('unilex_relations').removeWhere({ targetTermRef: ids[1] })
        await moonql.model('unilex_match_reviews').removeWhere({ pairCode: 'P090:P091' })
        await moonql.model('unilex_review_log').removeWhere({ targetRef: 'P090:P091' })
        await moonql.model('unilex_forms').removeWhere({ termRef: ids[0] })
        await moonql.model('unilex_forms').removeWhere({ termRef: ids[1] })
        await moonql.model('unilex_senses').removeWhere({ termRef: ids[0] })
        await moonql.model('unilex_senses').removeWhere({ termRef: ids[1] })
        await moonql.model('unilex_terms').removeWhere({ stableId: 'P090' })
        await moonql.model('unilex_terms').removeWhere({ stableId: 'P091' })
      }
      await app.close()
      await moonql.close()
    })

    assert.equal(moonql.engine, 'pg', 'this drill must not silently fall back to memory')

    const listRes = await app.inject().get('/orm/unilex/terms').query({ limit: 100 }).end()
    assert.equal(listRes.statusCode, 200)
    const list = dataOf<TermsBody>(listRes)
    assert.equal(list.state, 'ok')
    assert.equal(list.registry.seedCount, 71)
    assert.equal(list.registry.rawSha256, '8e60fe61d35604f560c7c71330754db3e881915ce541c392e09fb99c53d05772')
    assert.match(list.registry.notice, /not a validated universal dictionary/)
    assert.equal(list.total, 73)

    const terms = await moonql.model('unilex_terms').list({ limit: 100 })
    const forms = await moonql.model('unilex_forms').list({ limit: 500 })
    const senses = await moonql.model('unilex_senses').list({ limit: 200 })
    const relations = await moonql.model('unilex_relations').list({ limit: 200 })
    const sources = await moonql.model('unilex_sources').list({ limit: 20 })
    assert.equal(terms.length, 73)
    assert.equal(forms.length, 146)
    assert.equal(senses.length, 73)
    assert.equal(relations.length, 28)
    assert.equal(sources.length, 3)

    const p004 = dataOf<TermBody>(
      await app.inject().get('/orm/unilex/term').query({ stableId: 'P004' }).end(),
    )
    const indonesian = p004.forms.find((form) => form.languageCode === 'id')
    assert.ok(indonesian, 'the Indonesian form survives the SQL round-trip')
    assert.equal(indonesian.direction, 'ltr')

    const p031 = dataOf<TermBody>(
      await app.inject().get('/orm/unilex/term').query({ stableId: 'P031' }).end(),
    )
    const distinct = p031.relations.find(
      (relation) => relation.targetStableId === 'P004' && relation.relationType === 'distinctFrom',
    )
    assert.ok(distinct, 'the approved negative identity survives the SQL round-trip')
    assert.equal(distinct.status, 'APPROVED')

    const rawReviews = await app.inject().get('/orm/unilex_match_reviews').end()
    assert.equal(rawReviews.statusCode, 401, 'match reviews stay admin-only on pg')
    const rawLog = await app.inject().get('/orm/unilex_review_log').end()
    assert.equal(rawLog.statusCode, 401, 'the review log stays admin-only on pg')

    const preview = dataOf<PreviewBody>(
      await app.inject().get('/orm/unilex/matches/preview').query({ left: 'الله', right: 'Allah' }).end(),
    )
    assert.equal(preview.classification, 'DIFFERENT')
    assert.equal(preview.identityClaimed, false)
    assert.equal(preview.autoRelation, null)
    assert.match(preview.reasons.join(' '), /transliteration is not identity/)

    const source = (
      await moonql.model('unilex_sources').list({ where: { code: 'empire-unilex-v0.1' } })
    )[0]
    assert.ok(source)
    for (const stableId of ['P090', 'P091']) {
      await moonql.model('unilex_terms').create({
        stableId,
        lane: 'PROJECT',
        kind: 'CONCEPT',
        preferredEn: `PG drill ${stableId}`,
        preferredId: `Latihan PG ${stableId}`,
        definition: `A disposable PG drill definition for ${stableId}.`,
        contextNote: 'Disposable PG fixture; removed after the drill.',
        editorialStatus: 'DRAFT_REVIEW',
        registryVersion: 'postgres-drill',
        sourceRef: String(source.id),
      })
    }
    const leftTerm = (await moonql.model('unilex_terms').list({ where: { stableId: 'P090' } }))[0]
    assert.ok(leftTerm)
    await moonql.model('unilex_forms').create({
      formCode: 'P090:ar:Arab',
      termRef: String(leftTerm.id),
      languageCode: 'ar',
      scriptCode: 'Arab',
      headword: 'زِلّ',
      transliteration: 'zill',
      sourceRef: String(source.id),
    })
    const arabicDetail = dataOf<TermBody>(
      await app.inject().get('/orm/unilex/term').query({ stableId: 'P090' }).end(),
    )
    const arabicForm = arabicDetail.forms.find((form) => form.scriptCode === 'Arab')
    assert.ok(arabicForm, 'the Arabic form survives the SQL round-trip')
    assert.equal(arabicForm.direction, 'rtl')
    assert.equal(arabicForm.headword, 'زِلّ')

    const headers = await adminHeaders(app, '/orm')
    const reviewRes = await app
      .inject()
      .post('/orm/unilex/matches/review')
      .headers(headers)
      .body({
        leftTerm: 'P090',
        rightTerm: 'P091',
        leftForm: 'Same Lemma',
        rightForm: 'same lemma',
        decision: 'APPROVED_EXACT',
        reviewer: 'PG Reviewer',
        reason: 'Same written form in the same script; senses checked in the drill.',
        evidenceRef: 'docs/audit/M09-unilex-terminology.md',
      })
      .end()
    assert.equal(reviewRes.statusCode, 201, reviewRes.body)
    const recorded = dataOf<ReviewBody>(reviewRes)
    assert.equal(recorded.state, 'recorded')
    assert.equal(recorded.review.decision, 'APPROVED_EXACT')
    assert.equal(recorded.relation?.relationType, 'exactMatch')
    assert.equal(recorded.relation?.status, 'APPROVED')

    const persisted = await moonql.model('unilex_relations').list({
      where: { relationType: 'exactMatch', status: 'APPROVED' },
    })
    assert.equal(persisted.length, 1, 'the reviewer decision is a typed SQL relation, not a display state')
    const reviews = await moonql.model('unilex_match_reviews').list({ where: { pairCode: 'P090:P091' } })
    assert.equal(reviews.length, 1)
    assert.equal(reviews[0]?.decision, 'APPROVED_EXACT')
    const log = await moonql.model('unilex_review_log').list({ where: { targetRef: 'P090:P091' } })
    assert.ok(log.length >= 1, 'the decision is logged with its reviewer and reason')
  },
)
