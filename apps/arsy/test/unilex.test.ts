import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify, { type FastifyInstance } from 'fastify'
import { bootMoonQl, moonqlRest } from '@moonwitness/moonql'
import base from '@moonwitness/moonql-base'
import auth from '@moonwitness/moonql-auth'
import unilex from '@moonwitness/moonql-unilex'
import envelope from '../src/plugins/envelope.js'
import { adminHeaders, TEST_ADMIN_PASSWORD } from './helpers/auth.js'

/**
 * M09 — UNILEX and multilingual terminology.
 *
 * The 71 Empire concepts are a pinned seed, not a dictionary. These tests keep
 * the boundaries honest: source + context + editorial status on every term,
 * theological and fictional referents apart, surface resemblance never silently
 * sameAs, a projection rather than a second vocabulary, scripts/directions kept,
 * and stable IDs with a reviewable deprecation path.
 */

const quiet = { info: () => {}, warn: () => {} }

interface FormView {
  formCode?: string
  languageCode: string
  scriptCode: string
  direction: 'ltr' | 'rtl'
  headword: string
  transliteration?: string | null
  normalized?: string
  sourceCode?: string | null
}

interface SenseView {
  key: string
  scope: string
  definition: string
  editorialStatus: string
  sourceCode?: string | null
  reviewer?: string | null
  reviewerNote?: string | null
  deprecatedAt?: string | null
  supersedes?: string | null
  supersededBy?: string | null
  current?: boolean
}

interface SourceView {
  code: string | null
  title?: string | null
  sourceType?: string | null
  reviewStatus: string | null
  citation?: string | null
  provenanceSha?: string | null
  approvalNote?: string | null
}

interface RelationView {
  relationType: string
  status: string
  direction: 'outgoing' | 'incoming'
  targetStableId: string | null
  targetLabel?: string | null
  reviewer?: string | null
  reason?: string | null
  evidenceRef?: string | null
}

interface TermRow {
  stableId: string
  lane: string
  kind: string
  preferredEn: string
  preferredId: string
  definition: string
  contextNote: string
  editorialStatus: string
  registryVersion: string
  deprecated?: boolean
  senses: SenseView[]
  forms: FormView[]
  sources: SourceView[]
  relations: RelationView[]
}

interface TermsBody {
  state: string
  registry: {
    version: string
    status: string
    seedCount: number
    pin: string
    path: string
    rawSha256: string
    notice: string
    addenda: { version: string; ids: string[]; notice: string }
  }
  filters: Record<string, string>
  options: { lanes: string[]; scopes: string[]; statuses: string[]; sources: SourceView[] }
  total: number
  offset: number
  limit: number
  terms: TermRow[]
}

interface TermBody {
  state: string
  registry: TermsBody['registry']
  term: {
    stableId: string
    lane: string
    kind: string
    preferredEn: string
    preferredId: string
    definition: string
    contextNote: string
    editorialStatus: string
    registryVersion: string
    deprecationReason: string | null
    supersededBy: { stableId: string; preferredEn: string } | null
  }
  forms: FormView[]
  senses: SenseView[]
  sources: SourceView[]
  relations: RelationView[]
  identityReviews: Array<{
    pairCode: string
    leftStableId: string | null
    rightStableId: string | null
    classification: string
    decision: string
    reviewer: string | null
    reason: string | null
  }>
  reviewLog: Array<{ action: string; targetRef: string; reviewer: string; reason: string }>
}

interface MatchPreview {
  classification: 'EXACT' | 'NEAR' | 'DIFFERENT'
  sameSurface: boolean
  suggestedAction: string
  requiresReview: boolean
  identityClaimed: boolean
  autoRelation: null
  reasons: string[]
  notice?: string
  left: { normalized: string; script: string; direction: string; mixedScripts: boolean; diacriticsPresent: boolean }
  right: { normalized: string; script: string; direction: string }
}

interface MatchReviewResult {
  state: string
  review: { pairCode: string; decision: string; classification: string; reviewer: string }
  relation: { relationType: string; status: string } | null
  preview: MatchPreview
  notice: string
}

type Mq = Awaited<ReturnType<typeof bootMoonQl>>

const dataOf = <T>(res: { json(): unknown }): T => (res.json() as { data: T }).data

async function makeApp() {
  const app = Fastify({ logger: false })
  const moonql = await bootMoonQl({
    addons: [base, auth, unilex],
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

async function registrySource(moonql: Mq): Promise<Record<string, unknown>> {
  const sources = await moonql.model('unilex_sources').list({ where: { code: 'empire-unilex-v0.1' } })
  const source = sources[0]
  if (!source) throw new Error('registry source missing')
  return source
}

async function getTermDetail(app: FastifyInstance, stableId: string) {
  const headers = await adminHeaders(app, '/orm')
  return app
    .inject()
    .get('/orm/unilex/term')
    .headers(headers)
    .query({ stableId })
    .end()
}

async function getTerms(app: FastifyInstance, query: Record<string, string> = {}) {
  const headers = await adminHeaders(app, '/orm')
  return app.inject().get('/orm/unilex/terms').headers(headers).query(query).end()
}

async function makeTerm(moonql: Mq, stableId: string, extra: Record<string, unknown> = {}) {
  const source = await registrySource(moonql)
  return moonql.model('unilex_terms').create({
    stableId,
    lane: 'PROJECT',
    kind: 'CONCEPT',
    preferredEn: `Test term ${stableId}`,
    preferredId: `Istilah uji ${stableId}`,
    definition: `A test-only definition for ${stableId}.`,
    contextNote: 'Test fixture context; not part of the pinned registry.',
    editorialStatus: 'DRAFT_REVIEW',
    registryVersion: 'test-fixture',
    sourceRef: String(source.id),
    ...extra,
  })
}

test('M09-01/02: 71 pinned concepts keep source, context and editorial status', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })

  const res = await getTerms(app, { limit: '100' })
  assert.equal(res.statusCode, 200)
  const body = dataOf<TermsBody>(res)

  assert.equal(body.state, 'ok')
  assert.equal(body.registry.version, '0.1.0')
  assert.equal(body.registry.status, 'PROPOSED_NOT_ADOPTED')
  assert.equal(body.registry.seedCount, 71)
  assert.equal(body.registry.pin, 'bjo163/empire-of-the-light@38354ffff077d4ee1e17d40b39d86e41ce769817')
  assert.equal(body.registry.path, 'data/unilex/terms.v0.1.json')
  assert.equal(body.registry.rawSha256, '8e60fe61d35604f560c7c71330754db3e881915ce541c392e09fb99c53d05772')
  assert.match(body.registry.notice, /not a validated universal dictionary/)
  assert.deepEqual(body.registry.addenda.ids, ['P030', 'P031'])
  assert.equal(body.registry.addenda.version, 'xv-addendum-1')

  // 71 registry concepts + 2 XV addenda, kept explicitly separate.
  assert.equal(body.total, 73)
  assert.equal(body.terms.length, 73)

  for (const term of body.terms) {
    assert.ok(term.contextNote.length > 0, `${term.stableId} needs context`)
    assert.equal(term.editorialStatus, 'DRAFT_REVIEW', `${term.stableId} is a draft, not an approved dictionary entry`)
    assert.ok(term.senses.length > 0, `${term.stableId} needs a sense`)
    assert.ok(term.forms.length >= 2, `${term.stableId} needs language forms`)
    assert.ok(
      term.sources.some((source) => source.reviewStatus === 'APPROVED_FOR_CITATION'),
      `${term.stableId} needs an approved citation source`,
    )
    for (const form of term.forms) {
      assert.ok(form.languageCode, `${term.stableId} form needs a language`)
      assert.ok(form.scriptCode, `${term.stableId} form needs a script`)
      assert.match(form.direction, /^(ltr|rtl)$/)
      assert.ok(form.headword.length > 0)
    }
  }

  const sufi = body.terms.find((term) => term.stableId === 'P030')
  const fiction = body.terms.find((term) => term.stableId === 'P031')
  assert.ok(sufi && fiction)
  assert.equal(sufi.senses[0]?.scope, 'SUFI_STUDY')
  assert.equal(fiction.senses[0]?.scope, 'CREATIVE_FICTION')
  assert.equal(sufi.registryVersion, 'xv-addendum-1')
  assert.notEqual(sufi.definition, fiction.definition)

  const s001 = dataOf<TermBody>(
    await getTermDetail(app, 's001'),
  )
  assert.equal(s001.term.lane, 'SCRIPTURE')
  assert.equal(s001.senses[0]?.scope, 'ISLAMIC_SCRIPTURE')
  const registryCitation = s001.sources.find((source) => source.code === 'empire-unilex-v0.1')
  assert.ok(registryCitation)
  assert.equal(registryCitation.provenanceSha, body.registry.rawSha256)
  assert.match(registryCitation.citation ?? '', /38354ffff077d4ee1e17d40b39d86e41ce769817/)
  assert.match(registryCitation.approvalNote ?? '', /citation only/i)
})

test('M09-03/04: ALLAH/ARSY/ZILL confusions stay separate and never auto-match', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })

  const s009 = dataOf<TermBody>(
    await getTermDetail(app, 'S009'),
  )
  const arsy = s009.relations.find(
    (relation) => relation.targetStableId === 'P002' && relation.relationType === 'distinctFrom',
  )
  assert.ok(arsy)
  assert.equal(arsy.status, 'APPROVED')
  assert.equal(arsy.reviewer, 'M09 terminology review')
  assert.ok(arsy.reason && arsy.evidenceRef)

  const p001 = dataOf<TermBody>(
    await getTermDetail(app, 'P001'),
  )
  const allah = p001.relations.find(
    (relation) => relation.targetStableId === 'S001' && relation.relationType === 'distinctFrom',
  )
  assert.ok(allah)
  assert.equal(allah.status, 'APPROVED')
  assert.equal(p001.term.lane, 'PROJECT')
  assert.equal(p001.senses[0]?.scope, 'PROJECT_INTERNAL')

  const zill = dataOf<TermBody>(
    await getTermDetail(app, 'P031'),
  )
  const zillReview = zill.identityReviews.find((review) => review.pairCode === 'P004:P031')
  assert.ok(zillReview)
  assert.equal(zillReview.decision, 'REJECTED')
  assert.equal(zillReview.classification, 'NEAR')
  assert.match(zillReview.reason ?? '', /resemblance/i)
  assert.ok(zill.reviewLog.some((entry) => entry.action === 'REJECT_IDENTITY'))
  const zillDistinct = zill.relations.find(
    (relation) => relation.targetStableId === 'P004' && relation.relationType === 'distinctFrom',
  )
  assert.ok(zillDistinct)
  assert.equal(zillDistinct.status, 'APPROVED')
  assert.ok(!zill.relations.some((relation) => ['exactMatch', 'closeMatch'].includes(relation.relationType)))

  const before = await moonql.model('unilex_relations').count()
  const previewRes = await app
    .inject()
    .get('/orm/unilex/matches/preview')
    .query({ left: 'ZILL', right: 'ZIIL' })
    .end()
  assert.equal(previewRes.statusCode, 200)
  const preview = dataOf<MatchPreview>(previewRes)
  assert.equal(preview.classification, 'NEAR')
  assert.equal(preview.requiresReview, true)
  assert.equal(preview.identityClaimed, false)
  assert.equal(preview.autoRelation, null)
  assert.match(preview.notice ?? '', /No relation is created/)
  assert.match(preview.reasons.join(' '), /not a sense or identity claim/)
  assert.equal(await moonql.model('unilex_relations').count(), before, 'preview must not write a relation')

  const diacritics = dataOf<MatchPreview>(
    await app.inject().get('/orm/unilex/matches/preview').query({ left: 'Allah', right: 'Allāh' }).end(),
  )
  assert.equal(diacritics.classification, 'EXACT')
  assert.equal(diacritics.sameSurface, true)

  const crossScript = dataOf<MatchPreview>(
    await app.inject().get('/orm/unilex/matches/preview').query({ left: 'الله', right: 'Allah' }).end(),
  )
  assert.equal(crossScript.classification, 'DIFFERENT')
  assert.match(crossScript.reasons.join(' '), /transliteration is not identity/)
  assert.equal(crossScript.left.direction, 'rtl')
})

test('M09-04: only a reviewer with evidence can record identity, and contradictions are refused', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  const headers = await adminHeaders(app, '/orm')
  const left = await makeTerm(moonql, 'P090')
  const right = await makeTerm(moonql, 'P091')

  const anonymous = await app
    .inject()
    .post('/orm/unilex/matches/review')
    .body({ leftTerm: 'P090', rightTerm: 'P091', decision: 'APPROVED_EXACT', reviewer: 'nobody', reason: 'x' })
    .end()
  assert.equal(anonymous.statusCode, 401)

  const exact = await app
    .inject()
    .post('/orm/unilex/matches/review')
    .headers(headers)
    .body({
      leftTerm: 'P090',
      rightTerm: 'P091',
      leftForm: 'Same Lemma',
      rightForm: 'same lemma',
      decision: 'APPROVED_EXACT',
      reviewer: 'Reviewer A',
      reason: 'Same written form in the same script; senses checked.',
      evidenceRef: 'docs/audit/M09-unilex-terminology.md',
    })
    .end()
  assert.equal(exact.statusCode, 201, exact.body)
  const recorded = dataOf<MatchReviewResult>(exact)
  assert.equal(recorded.state, 'recorded')
  assert.equal(recorded.review.decision, 'APPROVED_EXACT')
  assert.equal(recorded.review.classification, 'EXACT')
  assert.equal(recorded.relation?.relationType, 'exactMatch')
  assert.equal(recorded.relation?.status, 'APPROVED')
  assert.match(recorded.notice, /preview alone never asserts identity/)

  const relationRows = await moonql.model('unilex_relations').list({ limit: 5000 })
  const exactRelation = relationRows.find(
    (row) =>
      String(row.sourceTermRef) === String(left.id) &&
      String(row.targetTermRef) === String(right.id) &&
      row.relationType === 'exactMatch',
  )
  assert.ok(exactRelation)
  assert.equal(exactRelation.status, 'APPROVED')
  assert.equal(exactRelation.reviewer, 'Reviewer A')
  assert.ok(exactRelation.evidenceRef)

  const notExact = await app
    .inject()
    .post('/orm/unilex/matches/review')
    .headers(headers)
    .body({
      leftTerm: 'P090',
      rightTerm: 'P091',
      leftForm: 'Alpha',
      rightForm: 'Beta',
      decision: 'APPROVED_EXACT',
      reviewer: 'Reviewer A',
      reason: 'Claims exactness without a surface match.',
      evidenceRef: 'evidence',
    })
    .end()
  assert.equal(notExact.statusCode, 400)
  assert.match(notExact.json().error.message, /EXACT surface comparison/)

  const contradicted = await app
    .inject()
    .post('/orm/unilex/matches/review')
    .headers(headers)
    .body({
      leftTerm: 'S001',
      rightTerm: 'P001',
      leftForm: 'Allah',
      rightForm: 'Allah',
      decision: 'APPROVED_EXACT',
      reviewer: 'Reviewer A',
      reason: 'Attempting to collapse theology into a product name.',
      evidenceRef: 'evidence',
    })
    .end()
  assert.equal(contradicted.statusCode, 400)
  assert.match(contradicted.json().error.message, /distinctFrom/)

  const noEvidence = await app
    .inject()
    .post('/orm/unilex/matches/review')
    .headers(headers)
    .body({
      leftTerm: 'P090',
      rightTerm: 'P091',
      decision: 'APPROVED_CLOSE',
      reviewer: 'Reviewer A',
      reason: 'Near form, no evidence attached.',
    })
    .end()
  assert.equal(noEvidence.statusCode, 400)
  assert.match(noEvidence.json().error.message, /evidenceRef/)

  const rejected = await app
    .inject()
    .post('/orm/unilex/matches/review')
    .headers(headers)
    .body({
      leftTerm: 'P090',
      rightTerm: 'P091',
      decision: 'REJECTED',
      reviewer: 'Reviewer B',
      reason: 'The surfaces match but the senses do not; keep them separate.',
    })
    .end()
  assert.equal(rejected.statusCode, 201)
  const revocation = dataOf<MatchReviewResult>(rejected)
  assert.equal(revocation.review.decision, 'REJECTED')
  assert.equal(revocation.relation?.status, 'REJECTED', 'the prior identity relation is revoked, not left approved')
})

test('M09-05: operator Terms Table is a projection filtered by approved source and scope', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })

  const registry = dataOf<TermsBody>(
    await getTerms(app, { source: 'empire-unilex-v0.1', limit: '100' }),
  )
  assert.equal(registry.total, 71)
  assert.ok(!registry.terms.some((term) => term.stableId === 'P030' || term.stableId === 'P031'))

  const vision = dataOf<TermsBody>(
    await getTerms(app, { source: 'xv-master-vision' }),
  )
  assert.equal(vision.total, 2)
  assert.deepEqual(vision.terms.map((term) => term.stableId).sort(), ['P030', 'P031'])

  const sufi = dataOf<TermsBody>(
    await getTerms(app, { scope: 'SUFI_STUDY' }),
  )
  assert.equal(sufi.total, 1)
  assert.equal(sufi.terms[0]?.stableId, 'P030')

  const fiction = dataOf<TermsBody>(
    await getTerms(app, { scope: 'CREATIVE_FICTION' }),
  )
  assert.equal(fiction.total, 1)
  assert.equal(fiction.terms[0]?.stableId, 'P031')

  const scripture = dataOf<TermsBody>(
    await getTerms(app, { lane: 'SCRIPTURE', limit: '100' }),
  )
  assert.ok(scripture.total > 0)
  assert.ok(scripture.terms.every((term) => term.lane === 'SCRIPTURE'))

  const mismatched = dataOf<TermsBody>(
    await getTerms(app, { lane: 'SCRIPTURE', scope: 'GENERAL' }),
  )
  assert.equal(mismatched.total, 0, 'scope is applied to senses, not just labels')

  const page = dataOf<TermsBody>(
    await getTerms(app, { limit: '2', offset: '1' }),
  )
  assert.equal(page.total, 73)
  assert.equal(page.terms.length, 2)
  assert.equal(page.limit, 2)
  assert.equal(page.offset, 1)

  const searched = dataOf<TermsBody>(
    await getTerms(app, { q: 'Truth' }),
  )
  assert.ok(searched.total > 0)
  assert.equal(searched.terms[0]?.stableId, 'U001')

  const draft = await moonql.model('unilex_sources').create({
    code: 'draft-source',
    title: 'Unapproved working source',
    sourceType: 'SCHOLARLY',
    citation: 'A source that has not passed review.',
    reviewStatus: 'PROPOSED',
  })
  await makeTerm(moonql, 'P089', {
    preferredEn: 'Projection Draft Only',
    sourceRef: String(draft.id),
  })

  const headers = await adminHeaders(app, '/orm')
  const rejectedSource = await app
    .inject()
    .get('/orm/unilex/terms')
    .headers(headers)
    .query({ source: 'draft-source' })
    .end()
  assert.equal(rejectedSource.statusCode, 400)
  assert.match(rejectedSource.json().error.message, /not approved for citation/)

  const hidden = dataOf<TermsBody>(
    await getTerms(app, { q: 'Projection Draft Only' }),
  )
  assert.equal(hidden.total, 0, 'a term backed only by an unapproved source is not projected')

  const afterDraft = dataOf<TermsBody>(await getTerms(app, { limit: '100' }))
  assert.equal(afterDraft.total, 73, 'the draft term stays out of the operator projection')

  const badLane = await getTerms(app, { lane: 'NOPE' })
  assert.equal(badLane.statusCode, 400)
  const unknownSource = await getTerms(app, { source: 'nope' })
  assert.equal(unknownSource.statusCode, 400)

  const anon = await app.inject().get('/orm/unilex_match_reviews').end()
  assert.equal(anon.statusCode, 401)
  const anonLog = await app.inject().get('/orm/unilex_review_log').end()
  assert.equal(anonLog.statusCode, 401)
})

test('M09-06: Arabic, Hebrew and Greek forms keep diacritics, script and direction', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  const source = await registrySource(moonql)
  const sourceRef = String(source.id)

  const arabic = await makeTerm(moonql, 'P094')
  const hebrew = await makeTerm(moonql, 'P095')
  const greek = await makeTerm(moonql, 'P096')

  const arabicForm = await moonql.model('unilex_forms').create({
    formCode: 'P094:ar:Arab',
    termRef: String(arabic.id),
    languageCode: 'ar',
    scriptCode: 'Arab',
    headword: 'زِلّ',
    transliteration: 'zill',
    sourceRef,
  })
  assert.equal(arabicForm.direction, 'rtl', 'Arabic defaults to RTL')
  assert.equal(arabicForm.headword, 'زِلّ', 'the raw headword keeps its shadda')
  assert.equal(arabicForm.normalized, 'زل')

  const hebrewForm = await moonql.model('unilex_forms').create({
    formCode: 'P095:he:Hebr',
    termRef: String(hebrew.id),
    languageCode: 'he',
    scriptCode: 'Hebr',
    headword: 'צֵל',
    transliteration: 'tzel',
    sourceRef,
  })
  assert.equal(hebrewForm.direction, 'rtl')
  assert.equal(hebrewForm.headword, 'צֵל')
  assert.equal(hebrewForm.normalized, 'צל')

  const greekForm = await moonql.model('unilex_forms').create({
    formCode: 'P096:el:Grek',
    termRef: String(greek.id),
    languageCode: 'el',
    scriptCode: 'Grek',
    headword: 'σκιά',
    transliteration: 'skia',
    sourceRef,
  })
  assert.equal(greekForm.direction, 'ltr')
  assert.equal(greekForm.headword, 'σκιά')
  assert.equal(greekForm.normalized, 'σκια')

  await assert.rejects(
    moonql.model('unilex_forms').create({
      formCode: 'P094:ar:ltr',
      termRef: String(arabic.id),
      languageCode: 'ar',
      scriptCode: 'Arab',
      direction: 'ltr',
      headword: 'زِلّ',
      sourceRef,
    }),
    /must be written rtl/,
  )

  const detail = dataOf<TermBody>(
    await getTermDetail(app, 'P094'),
  )
  const arabicView = detail.forms.find((form) => form.scriptCode === 'Arab')
  assert.ok(arabicView)
  assert.equal(arabicView.headword, 'زِلّ')
  assert.equal(arabicView.direction, 'rtl')
  assert.equal(arabicView.transliteration, 'zill')
  assert.equal(arabicView.normalized, 'زل')

  const hebrewView = dataOf<TermBody>(
    await getTermDetail(app, 'P095'),
  ).forms.find((form) => form.scriptCode === 'Hebr')
  assert.ok(hebrewView)
  assert.equal(hebrewView.direction, 'rtl')
  assert.equal(hebrewView.headword, 'צֵל')

  const greekView = dataOf<TermBody>(
    await getTermDetail(app, 'P096'),
  ).forms.find((form) => form.scriptCode === 'Grek')
  assert.ok(greekView)
  assert.equal(greekView.direction, 'ltr')
  assert.equal(greekView.headword, 'σκιά')

  const arabicDiacritics = dataOf<MatchPreview>(
    await app.inject().get('/orm/unilex/matches/preview').query({ left: 'زِلّ', right: 'زل' }).end(),
  )
  assert.equal(arabicDiacritics.classification, 'EXACT')
  assert.equal(arabicDiacritics.left.diacriticsPresent, true)
  assert.equal(arabicDiacritics.left.direction, 'rtl')

  const greekDiacritics = dataOf<MatchPreview>(
    await app.inject().get('/orm/unilex/matches/preview').query({ left: 'σκιά', right: 'σκια' }).end(),
  )
  assert.equal(greekDiacritics.classification, 'EXACT')
  assert.equal(greekDiacritics.left.direction, 'ltr')

  const hebrewDiacritics = dataOf<MatchPreview>(
    await app.inject().get('/orm/unilex/matches/preview').query({ left: 'צֵל', right: 'צל' }).end(),
  )
  assert.equal(hebrewDiacritics.classification, 'EXACT')

  const mixed = dataOf<MatchPreview>(
    await app
      .inject()
      .get('/orm/unilex/matches/preview')
      .query({ left: 'زِلّ (zill)', right: 'צֵל' })
      .end(),
  )
  assert.equal(mixed.left.mixedScripts, true)
  assert.equal(mixed.left.script, 'Arab')
  assert.equal(mixed.left.direction, 'rtl')

  const transliterationOnly = dataOf<MatchPreview>(
    await app.inject().get('/orm/unilex/matches/preview').query({ left: 'צֵל', right: 'tzel' }).end(),
  )
  assert.equal(transliterationOnly.classification, 'DIFFERENT')
  assert.match(transliterationOnly.reasons.join(' '), /transliteration is not identity/)
})

test('M09-07: stable IDs are immutable and deprecation preserves old senses with reasons', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  const source = await registrySource(moonql)
  const sourceRef = String(source.id)
  const term = await makeTerm(moonql, 'P097')

  const original = await moonql.model('unilex_senses').create({
    senseKey: 'legacy',
    termRef: String(term.id),
    contextScope: 'GENERAL',
    definition: 'The original sense that will be revised.',
    editorialStatus: 'DRAFT_REVIEW',
    sourceRef,
  })

  await assert.rejects(
    moonql.model('unilex_senses').update(String(original.id), { editorialStatus: 'DEPRECATED' }),
    /reviewer and reviewerNote/,
  )

  const deprecated = await moonql.model('unilex_senses').update(String(original.id), {
    editorialStatus: 'DEPRECATED',
    reviewer: 'Reviewer A',
    reviewerNote: 'Revised sense narrows the scope to the project; keep the old wording for audit.',
  })
  assert.ok(deprecated.deprecatedAt)
  assert.equal(deprecated.definition, original.definition, 'the old sense is preserved, not overwritten')

  const revised = await moonql.model('unilex_senses').create({
    senseKey: 'revised',
    termRef: String(term.id),
    contextScope: 'PROJECT_INTERNAL',
    definition: 'The revised sense.',
    editorialStatus: 'SOURCE_CHECK',
    sourceRef,
    supersedesRef: String(original.id),
    reviewer: 'Reviewer B',
    reviewerNote: 'Revision approved; the earlier sense remains visible as history.',
  })
  assert.equal(revised.supersedesRef, original.id)

  await assert.rejects(
    moonql.model('unilex_terms').update(String(term.id), { stableId: 'P098' }),
    /stable IDs are immutable/,
  )

  const successor = await makeTerm(moonql, 'P098', { preferredEn: 'Successor term' })
  await assert.rejects(
    moonql.model('unilex_terms').update(String(term.id), { supersededByRef: String(successor.id) }),
    /only be attached while deprecating/,
  )

  const deprecatedTerm = await moonql.model('unilex_terms').update(String(term.id), {
    editorialStatus: 'DEPRECATED',
    supersededByRef: String(successor.id),
    deprecationReason: 'Stable ID retired; meaning moved to P098.',
  })
  assert.equal(deprecatedTerm.editorialStatus, 'DEPRECATED')

  await moonql.model('unilex_review_log').create({
    targetType: 'TERM',
    targetRef: 'P097',
    action: 'DEPRECATE',
    reason: 'Stable ID retired; meaning moved to P098.',
    reviewer: 'Reviewer C',
    evidenceRef: 'docs/audit/M09-unilex-terminology.md',
    decidedAt: '2026-10-26T00:00:00.000Z',
  })

  const detail = dataOf<TermBody>(
    await getTermDetail(app, 'P097'),
  )
  assert.equal(detail.term.editorialStatus, 'DEPRECATED')
  assert.equal(detail.term.supersededBy?.stableId, 'P098')
  assert.equal(detail.term.deprecationReason, 'Stable ID retired; meaning moved to P098.')
  assert.equal(detail.senses.length, 2, 'the old sense survives deprecation')
  const oldSense = detail.senses.find((sense) => sense.key === 'legacy')
  assert.ok(oldSense)
  assert.equal(oldSense.current, false)
  assert.equal(oldSense.supersededBy, 'revised')
  assert.match(oldSense.reviewerNote ?? '', /keep the old wording/)
  assert.ok(oldSense.deprecatedAt)
  const newSense = detail.senses.find((sense) => sense.key === 'revised')
  assert.ok(newSense)
  assert.equal(newSense.current, true)
  assert.equal(newSense.supersedes, 'legacy')
  assert.ok(detail.reviewLog.some((entry) => entry.action === 'DEPRECATE' && entry.reviewer === 'Reviewer C'))
})
