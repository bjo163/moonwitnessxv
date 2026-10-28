import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify, { type FastifyInstance } from 'fastify'
import { bootMoonQl, moonqlRest } from '@moonwitness/moonql'
import base from '@moonwitness/moonql-base'
import auth from '@moonwitness/moonql-auth'
import corpus from '@moonwitness/moonql-corpus'
import actors from '@moonwitness/moonql-actors'
import unilex from '@moonwitness/moonql-unilex'
import ontology from '@moonwitness/moonql-ontology'
import graph from '@moonwitness/moonql-graph'
import research from '@moonwitness/moonql-research'
import envelope from '../src/plugins/envelope.js'
import { adminHeaders, TEST_ADMIN_PASSWORD } from './helpers/auth.js'

/**
 * UI-P05e / UI-F20 — the honest negative matrix for the PUBLIC projections the Dock
 * Reader, Explorer and Research views are built on.
 *
 * The question this file answers is narrow: "can a guessed UI link reach material the
 * hub has not cleared?" Every assertion below is made against the real in-process hub
 * (real HTTP injection, no mocks) and every claim is labelled for what it actually is:
 *
 *   DENIED            — the hub refuses the anonymous caller (asserted as 401/400/404,
 *                       or as a withheld field with no bytes in the body).
 *   LABELLED-PERMISSIVE — the hub answers, but the answer cannot be mistaken for a
 *                       cleared/released item because the payload states its status.
 *   PERMISSIVE-TODAY  — the hub answers and the payload carries material that has not
 *                       been reviewed. Recorded as-is; the denial is NOT asserted here.
 *
 * D08 (Publication & Governance) is a PLANNED domain only
 * (docs/decisions/M02-02-domain-assignments.md:27). There is no release-approval gate
 * to deny at yet, which test 1 proves from the live model registry instead of asserting.
 *
 * ALL FIXTURE DATA BELOW IS SYNTHETIC AND SELF-DECLARING ("SYNTH-" prefixed). It is not
 * witness material, not testimony, and not a religious text. The only real text touched
 * is the public-domain Cairo 1924 seed already exercised by corpus-reader.test.ts.
 */

const quiet = { info: () => {}, warn: () => {} }

type Row = Record<string, unknown>
type Res = { statusCode: number; body: string; json(): { data?: unknown; error?: { message?: string } } }

const dataOf = <T>(res: { json(): unknown }): T => (res.json() as { data: T }).data
const messageOf = (res: { json(): unknown }): string =>
  String((res.json() as { error?: { message?: string } }).error?.message ?? '')

async function makeApp() {
  const app = Fastify({ logger: false })
  const moonql = await bootMoonQl({
    addons: [base, auth, corpus, actors, unilex, ontology, graph, research],
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

/** Synthetic payloads that must never surface on a cleared/false projection. */
const SYNTH = {
  rightsUnknown: 'SYNTH-RIGHTS-UNKNOWN-ARABIC-NOT-FOR-PUBLICATION',
  metadataOnly: 'SYNTH-METADATA-ONLY-ARABIC-NOT-FOR-PUBLICATION',
  restricted: 'SYNTH-RESTRICTED-ARABIC-NOT-FOR-PUBLICATION',
  publicDomainStatus: 'SYNTH-PUBLIC-DOMAIN-LABEL-ARABIC-NOT-CLEARED',
  blockedTranslation: 'SYNTH-BLOCKED-TRANSLATION-NOT-FOR-PUBLICATION',
  ambiguousRival: 'SYNTH-RIVAL-EDITION-ARABIC-NOT-FOR-PUBLICATION',
  unapprovedDefinition: 'SYNTH-DEFINITION-BACKED-ONLY-BY-UNAPPROVED-SOURCE',
  unapprovedHeadword: 'SYNTH-HEADWORD-BACKED-ONLY-BY-UNAPPROVED-SOURCE',
  unapprovedCitation: 'SYNTH-CITATION-STRING-NOT-APPROVED-FOR-CITATION',
  unreviewedEdge: 'SYNTH-UNREVIEWED-EDGE-REASON-NOT-VERIFIED',
  pendingCandidate: 'SYNTH-PENDING-CANDIDATE-REASON-NOT-A-GRAPH-EDGE',
  researchClaim: 'SYNTH-RESEARCH-CLAIM-TEXT-QUOTING-UNCLEARED-SOURCE',
  researchSpan: 'SYNTH-RESEARCH-EVIDENCE-SPAN-UNCLEARED-SOURCE',
} as const

const allSynthMarkers = Object.values(SYNTH) as string[]

/**
 * Cleared seed bytes that must never appear in a denied/blocked/absent response.
 * Built from codepoints, not typed as an Arabic literal: through a source encoding
 * round-trip the shadda/fathah cluster reorders, and a marker that silently stops
 * matching would make every absence claim in this file vacuous. Test 1 asserts this
 * exact string IS inside the cleared seed response before any of that matters.
 */
const CLEARED_BYTES = String.fromCodePoint(
  0x648, 0x64e, 0x671, 0x644, 0x651, 0x64e, 0x630, 0x650, 0x64a, 0x646, 0x64e, 0x20,
  0x621, 0x64e, 0x627, 0x645, 0x64e, 0x646, 0x64f, 0x648, 0x627, 0x6df,
)
const CLEARED_TRANSLATION_BYTES = 'penghuni surga'

function assertNoBytesIn(label: string, body: string, markers: string[]): void {
  for (const marker of markers) {
    assert.ok(!body.includes(marker), `${label}: response body leaked ${JSON.stringify(marker)}`)
  }
}

async function get(app: FastifyInstance, path: string, query?: Record<string, string>): Promise<Res> {
  const req = app.inject().get(path)
  return (query ? req.query(query) : req).end() as unknown as Res
}

/** The blocked edition fixture: one address, four uncleared rights statuses. */
async function seedBlockedEditions(moonql: Awaited<ReturnType<typeof bootMoonQl>>) {
  const work = (await moonql.model('corpus_works').list({ where: { code: 'quran' } }))[0] as Row
  const created: Array<{ code: string; status: string; citation: string; bytes: string }> = []
  const plan: Array<[string, string, string, string]> = [
    ['synth_rights_unknown', 'RIGHTS_UNKNOWN', 'SYNTH 1:1', SYNTH.rightsUnknown],
    ['synth_metadata_only', 'METADATA_ONLY', 'SYNTH 1:2', SYNTH.metadataOnly],
    ['synth_restricted', 'RESTRICTED', 'SYNTH 1:3', SYNTH.restricted],
    // 'PUBLIC_DOMAIN' is a rights LABEL, not the cleared invariant; the veto must hold here too.
    ['synth_public_domain', 'PUBLIC_DOMAIN', 'SYNTH 1:4', SYNTH.publicDomainStatus],
  ]
  for (const [code, rightsStatus, citation, bytes] of plan) {
    const edition = await moonql.model('corpus_editions').create({
      code,
      workRef: String(work.id),
      name: `Synthetic uncleared edition (${rightsStatus})`,
      editorOrPublisher: 'Synthetic Fixture Publisher',
      rightsStatus,
      licenseName: 'Synthetic / Not Cleared',
    })
    await moonql.model('corpus_passages').create({
      citationKey: citation,
      editionRef: String(edition.id),
      surahNumber: 1,
      ayahNumber: Number(citation.slice(-1)),
      arabicText: bytes,
    })
    await moonql.model('corpus_translations').create({
      code: `SYNTH_T_${code}`,
      passageRef: String((await moonql.model('corpus_passages').list({ where: { citationKey: citation } }))[0]!.id),
      languageCode: 'en',
      translatorName: 'Synthetic Translator',
      translationText: SYNTH.blockedTranslation,
      rightsStatus: 'RIGHTS_EXACT_VERSION_CLEARED',
      licenseName: 'Synthetic Cleared Translation On Uncleared Edition',
    })
    created.push({ code, status: rightsStatus, citation, bytes })
  }
  return created
}

/** A term whose ONLY source is unapproved, plus a marker source row. */
async function seedUnapprovedTerm(moonql: Awaited<ReturnType<typeof bootMoonQl>>) {
  const draft = await moonql.model('unilex_sources').create({
    code: 'synth-unapproved-source',
    title: 'Synthetic unapproved working source',
    sourceType: 'SCHOLARLY',
    citation: SYNTH.unapprovedCitation,
    reviewStatus: 'PROPOSED',
  })
  const taken = new Set((await moonql.model('unilex_terms').list({ limit: 5000 })).map((row) => String(row.stableId)))
  const stableId = ['P', 'U', 'T', 'S']
    .flatMap((letter) => Array.from({ length: 1000 }, (_, i) => `${letter}${String(i).padStart(3, '0')}`))
    .find((id) => !taken.has(id))
  assert.ok(stableId, 'no free UNILEX stable id available for the fixture')
  const term = await moonql.model('unilex_terms').create({
    stableId,
    lane: 'PROJECT',
    kind: 'CONCEPT',
    preferredEn: 'Synthetic Hidden Concept',
    preferredId: 'Konsep sintetis tersembunyi',
    definition: SYNTH.unapprovedDefinition,
    contextNote: 'Synthetic fixture only; not registry material.',
    editorialStatus: 'DRAFT_REVIEW',
    registryVersion: 'synthetic-fixture',
    sourceRef: String(draft.id),
  })
  await moonql.model('unilex_forms').create({
    formCode: `${stableId}:en:Latn`,
    termRef: String(term.id),
    languageCode: 'en',
    scriptCode: 'Latn',
    direction: 'ltr',
    headword: SYNTH.unapprovedHeadword,
    sourceRef: String(draft.id),
  })
  await moonql.model('unilex_senses').create({
    senseKey: 'synthetic-sense',
    termRef: String(term.id),
    contextScope: 'PROJECT_INTERNAL',
    definition: SYNTH.unapprovedDefinition,
    editorialStatus: 'DRAFT_REVIEW',
    sourceRef: String(draft.id),
  })
  return { stableId: String(stableId), term, draft }
}

// --------------------------------------------------------------------------- 1
test('UI-P05e/D08: the publication-governance gate does not exist yet, so nothing can be proven denied by it', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })

  const modelNames = [...moonql.registry.models.keys()]
  for (const planned of ['release_manifests', 'rights_approvals', 'editorial_signoffs', 'takedown_logs']) {
    assert.ok(!modelNames.includes(planned), `D08 table "${planned}" must not exist yet (planned domain only)`)
  }
  const addonNames = moonql.registry.addons.map((addon: { name: string }) => addon.name)
  assert.ok(!addonNames.includes('governance'), 'the planned @moonwitness/governance addon must not be installed')
  assert.throws(() => moonql.model('release_manifests'), /unknown model/, 'a guessed D08 model name resolves to no repository')

  // What that means for the projection: the reader publishes cleared text on the
  // RIGHTS invariant alone. There is no approval field to check, and none is present.
  const res = await get(app, '/orm/corpus/reader', { citation: 'QS 2:82' })
  assert.equal(res.statusCode, 200)
  const body = res.body
  for (const key of ['publicationAvailable', 'releaseManifest', 'rightsApproval', 'editorialSignoff', 'takedown']) {
    assert.ok(!body.includes(key), `${key} must not appear: D08 is unimplemented, not merely false here`)
  }
  assert.equal(dataOf<{ state: string }>(res).state, 'available')

  // The control that makes every later absence claim in this file mean something:
  // the marker bytes must actually be inside a *successful* reader response. If a
  // source encoding round-trip ever reorders them, `assertNoBytesIn` would pass
  // against a marker that matches nothing, and the file would prove nothing.
  assert.ok(body.includes(CLEARED_BYTES), 'the cleared Arabic marker must match the stored seed bytes')
  assert.ok(
    body.includes(CLEARED_TRANSLATION_BYTES),
    'the cleared translation marker must match the stored seed wording',
  )
})

// --------------------------------------------------------------------------- 2
test('UI-P05e: a guessed citation can never turn an uncleared edition into cleared text', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  const fixtures = await seedBlockedEditions(moonql)

  for (const fixture of fixtures) {
    const variants = [
      fixture.citation,
      fixture.citation.toLowerCase(),
      fixture.citation.replace(' ', '  '),
      ` ${fixture.citation} `,
      fixture.citation.toUpperCase(),
    ]
    for (const citation of variants) {
      const res = await get(app, '/orm/corpus/reader', { citation })
      assert.equal(res.statusCode, 200, `guessed ${JSON.stringify(citation)} must not error out`)
      const data = dataOf<Record<string, Row | string | null>>(res)
      assert.equal(data.state, 'rights_blocked', `${citation} (${fixture.status}) must stay blocked`)
      assert.equal(data.arabic, null, `${citation} (${fixture.status}) must serialize no arabic object`)
      assert.equal(data.blockedPlaceholder, '[TEXT_BLOCKED_PENDING_RIGHTS_CLEARANCE]')
      assert.equal((data.citation as Row).rightsStatus, fixture.status)
      assert.match(String(data.message), /Text withheld/)
      assertNoBytesIn(`reader ${citation} ${fixture.status}`, res.body, [
        fixture.bytes,
        SYNTH.blockedTranslation,
        CLEARED_BYTES,
        CLEARED_TRANSLATION_BYTES,
      ])
      const translations = dataOf<{ translations: Array<{ text: string | null; blocked: boolean }> }>(res).translations
      assert.ok(translations.length > 0, 'the blocked edition still lists its translation metadata')
      for (const row of translations) {
        assert.equal(row.text, null, 'a cleared translation on an uncleared edition stays withheld')
        assert.equal(row.blocked, true)
      }
    }
  }
})

// --------------------------------------------------------------------------- 3
test('UI-P05e: malformed, arbitrary and injection-shaped citations return absent and never a verse', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  await seedBlockedEditions(moonql)

  const guessed = [
    'QS 2:999', // absent address in a live range
    'QS 999:1',
    'GEN 1:1', // another work's scheme entirely
    'book:chapter:verse',
    '2:82', // no prefix
    'QS-2-82',
    'QS 2:082', // zero-padded, not the stored key
    'QS 2:8',
    'QS2:82',
    'QS 2:82 ', // trailing whitespace is normalised, then resolves — asserted separately below
    '%',
    '*',
    '_',
    'NULL',
    "' OR 1=1--",
    'QS 2:82; DROP TABLE corpus_passages',
    'QS 2:82 UNION SELECT arabicText FROM corpus_passages',
    '../../etc/passwd',
    'QS 2:82\u0000suffix',
    '<script>QS 2:82</script>',
    'SYNTH 1:1 OR QS 2:82',
    'a'.repeat(60),
  ]

  for (const citation of guessed) {
    const res = await get(app, '/orm/corpus/reader', { citation })
    const trimmed = citation.trim().replace(/\s+/g, ' ')
    // the handler collapses internal whitespace, so 'QS 2:82 ' resolves to the cleared seed.
    const expectResolved = trimmed === 'QS 2:82'
    assert.equal(res.statusCode, 200, `${JSON.stringify(citation)} must not 500`)
    const data = dataOf<{ state: string; arabic: unknown; candidates: unknown[]; translations: unknown[] }>(res)
    if (expectResolved) {
      assert.equal(data.state, 'available', 'whitespace-normalised canonical address still resolves')
      continue
    }
    assert.equal(data.state, 'absent', `${JSON.stringify(citation)} must be absent, not invented`)
    assert.equal(data.arabic, null)
    assert.deepEqual(data.candidates, [])
    assert.deepEqual(data.translations, [])
    assertNoBytesIn(`reader guessed ${JSON.stringify(citation)}`, res.body, [
      ...allSynthMarkers,
      CLEARED_BYTES,
      CLEARED_TRANSLATION_BYTES,
    ])
  }

  // The two input-level refusals, recorded rather than asserted as an authorization win.
  const empty = await get(app, '/orm/corpus/reader', {})
  assert.equal(empty.statusCode, 400)
  assert.match(messageOf(empty), /citation/)
  const tooLong = await get(app, '/orm/corpus/reader', { citation: 'QS 2:82 '.repeat(8) })
  assert.equal(tooLong.statusCode, 400)
  assert.match(messageOf(tooLong), /longer than 60/)
  assertNoBytesIn('reader too-long', tooLong.body, allSynthMarkers)
})

// --------------------------------------------------------------------------- 4
test('UI-P05e: guessing an edition identifier, a stable id or a passage id does not bypass the veto', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  await seedBlockedEditions(moonql)

  const blockedPassage = (await moonql.model('corpus_passages').list({ where: { citationKey: 'SYNTH 1:1' } }))[0] as Row
  const clearedEdition = (await moonql.model('corpus_editions').list({ where: { code: 'quran_cairo_hafs' } }))[0] as Row

  // id-shaped guesses on the edition/params a UI link would carry
  const guesses: Array<Record<string, string>> = [
    { citation: 'SYNTH 1:1', edition: String(blockedPassage.editionRef) }, // uuid, not a code
    { citation: 'SYNTH 1:1', edition: String(blockedPassage.id) }, // passage id in the edition slot
    { citation: 'SYNTH 1:1', edition: 'quran_cairo_hafs' }, // a cleared sibling's code
    { citation: 'SYNTH 1:1', edition: 'synth_metadata_only' }, // another uncleared code
    { citation: 'SYNTH 1:1', edition: '*' },
    { citation: String(blockedPassage.id), edition: '' }, // guessing passage ids as addresses
    { citation: String(blockedPassage.editionRef), edition: '' },
    { citation: 'QS 2:82', edition: 'synth_rights_unknown' }, // cleared address, uncleared code
    { citation: 'QS 2:82', edition: String(clearedEdition.id) },
  ]
  for (const query of guesses) {
    const trimmed = Object.fromEntries(Object.entries(query).filter(([, value]) => value !== ''))
    const res = await get(app, '/orm/corpus/reader', trimmed)
    assert.equal(res.statusCode, 200, `${JSON.stringify(trimmed)} must answer, not error`)
    const data = dataOf<{ state: string; arabic: unknown }>(res)
    if (data.state === 'available') {
      // the ONLY allowed success: the canonical address with the genuinely cleared code.
      assert.equal(trimmed.citation, 'QS 2:82')
      assert.equal(trimmed.edition ?? 'quran_cairo_hafs', 'quran_cairo_hafs')
      continue
    }
    assert.equal(data.arabic, null, `${JSON.stringify(trimmed)} must not serialize arabic`)
    assertNoBytesIn(`reader id-guess ${JSON.stringify(trimmed)}`, res.body, [
      SYNTH.rightsUnknown,
      SYNTH.blockedTranslation,
      CLEARED_BYTES,
      CLEARED_TRANSLATION_BYTES,
    ])
  }

  // A blocked address sharing an edition with the cleared one stays metadata-only: the
  // ambiguous branch must not smuggle either edition's bytes out.
  const work = (await moonql.model('corpus_works').list({ where: { code: 'quran' } }))[0] as Row
  const rival = await moonql.model('corpus_editions').create({
    code: 'synth_rival_uncleared',
    workRef: String(work.id),
    name: 'Synthetic rival uncleared edition',
    editorOrPublisher: 'Synthetic Fixture Publisher',
    rightsStatus: 'RIGHTS_UNKNOWN',
    licenseName: 'Synthetic / Not Cleared',
  })
  await moonql.model('corpus_passages').create({
    citationKey: 'QS 2:82',
    editionRef: String(rival.id),
    surahNumber: 2,
    ayahNumber: 82,
    arabicText: SYNTH.ambiguousRival,
  })
  const ambiguous = await get(app, '/orm/corpus/reader', { citation: 'QS 2:82' })
  assert.equal(ambiguous.statusCode, 200)
  const ambiguousData = dataOf<{ state: string; arabic: unknown; candidates: Row[] }>(ambiguous)
  assert.equal(ambiguousData.state, 'ambiguous')
  assert.equal(ambiguousData.arabic, null)
  assert.equal(ambiguousData.candidates.length, 2)
  assertNoBytesIn('reader ambiguous', ambiguous.body, [
    SYNTH.ambiguousRival,
    SYNTH.rightsUnknown,
    CLEARED_BYTES,
    CLEARED_TRANSLATION_BYTES,
  ])
  // Choosing the cleared edition explicitly is allowed; choosing the uncleared one is not.
  const chooseBlocked = await get(app, '/orm/corpus/reader', { citation: 'QS 2:82', edition: 'synth_rival_uncleared' })
  assert.equal(dataOf<{ arabic: unknown }>(chooseBlocked).arabic, null)
  assert.equal(dataOf<{ state: string }>(chooseBlocked).state, 'rights_blocked')
  assertNoBytesIn('reader choose blocked edition', chooseBlocked.body, [SYNTH.ambiguousRival, CLEARED_BYTES])
})

// --------------------------------------------------------------------------- 5
test('UI-P05e: anonymous Terms Table reads stay denied until a reviewed public projection exists', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  const { stableId } = await seedUnapprovedTerm(moonql)

  // Every anonymous list/search/filter entry point stays private. This includes
  // drafts backed by an otherwise citation-approved source: source clearance is
  // not a D08 publication decision.
  const searches: Array<Record<string, string>> = [
    { limit: '200' },
    { q: 'Synthetic Hidden Concept' },
    { q: stableId },
    { q: stableId.toLowerCase() },
    { lane: 'PROJECT', limit: '200' },
    { scope: 'PROJECT_INTERNAL', limit: '200' },
    { status: 'DRAFT_REVIEW', limit: '200' },
    { source: 'synth-unapproved-source' },
  ]
  for (const query of searches) {
    const res = await get(app, '/orm/unilex/terms', query)
    assert.equal(res.statusCode, 401, `${JSON.stringify(query)} must not read the private projection`)
    assertNoBytesIn(`terms ${JSON.stringify(query)}`, res.body, [
      SYNTH.unapprovedDefinition,
      SYNTH.unapprovedHeadword,
      SYNTH.unapprovedCitation,
    ])
  }

  // Attaching an approved citation source still does not grant anonymous publication.
  const approved = (await moonql.model('unilex_sources').list({ where: { code: 'empire-unilex-v0.1' } }))[0] as Row
  const term = (await moonql.model('unilex_terms').list({ where: { stableId } }))[0] as Row
  await moonql.model('unilex_terms').update(String(term.id), { sourceRef: String(approved.id) })
  const stillDenied = await get(app, '/orm/unilex/terms', { q: stableId })
  assert.equal(stillDenied.statusCode, 401, 'an approved source cannot bypass the missing D08 release gate')
  assertNoBytesIn('approved-source draft denial', stillDenied.body, allSynthMarkers)

  const headers = await adminHeaders(app, '/orm')
  const operatorView = await app
    .inject()
    .get('/orm/unilex/terms')
    .headers(headers)
    .query({ q: stableId })
    .end()
  assert.equal(operatorView.statusCode, 200, 'the existing admin role retains private review access')
  assert.match(operatorView.body, new RegExp(SYNTH.unapprovedDefinition))
})

// --------------------------------------------------------------------------- 6
test('UI-P05e: /unilex/term denies anonymous access until a reviewed public projection exists', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  const { stableId } = await seedUnapprovedTerm(moonql)

  // The list is private as well as detail; guessed list filters cannot expose drafts.
  const hidden = await get(app, '/orm/unilex/terms', { q: stableId })
  assert.equal(hidden.statusCode, 401)
  assertNoBytesIn('anonymous UNILEX list denial', hidden.body, allSynthMarkers)

  const detail = await get(app, '/orm/unilex/term', { stableId })
  assert.equal(detail.statusCode, 401, 'a guessed detail link cannot bypass the public list filter')
  assertNoBytesIn('anonymous UNILEX detail denial', detail.body, allSynthMarkers)

  const headers = await adminHeaders(app, '/orm')
  const adminDetail = await app
    .inject()
    .get('/orm/unilex/term')
    .headers(headers)
    .query({ stableId })
    .end()
  assert.equal(adminDetail.statusCode, 200, 'authorized reviewers retain access to private detail')
  assert.match(adminDetail.body, new RegExp(SYNTH.unapprovedDefinition))

  // Query validation is hidden behind auth so anonymous callers cannot distinguish stored IDs.
  assert.equal((await get(app, '/orm/unilex/term', { stableId: stableId.toLowerCase() })).statusCode, 401)
  assert.equal((await get(app, '/orm/unilex/term', { stableId: 'P999' })).statusCode, 401)
  assert.equal((await get(app, '/orm/unilex/term', { stableId: "P' OR 1=1" })).statusCode, 401)
})

test('UI-P05e: raw UNILEX models deny anonymous list/get; admin retains review access', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  await seedUnapprovedTerm(moonql)

  const models = [
    '/orm/unilex_sources',
    '/orm/unilex_terms',
    '/orm/unilex_forms',
    '/orm/unilex_senses',
    '/orm/unilex_relations',
  ]
  const admin = await adminHeaders(app, '/orm')
  for (const path of models) {
    const modelName = path.slice('/orm/'.length)
    const acl = moonql.registry.models.get(modelName)?.acl
    assert.deepEqual(acl?.create, ['admin'], `${modelName} create stays admin-only`)
    assert.deepEqual(acl?.update, ['admin'], `${modelName} update stays admin-only`)
    assert.deepEqual(acl?.remove, ['admin'], `${modelName} remove stays admin-only`)

    const anonymousList = await get(app, path)
    assert.equal(anonymousList.statusCode, 401, `${path} must deny anonymous list access`)
    assertNoBytesIn(`anonymous ${path} list`, anonymousList.body, allSynthMarkers)

    const operatorList = await app.inject().get(path).headers(admin).end()
    assert.equal(operatorList.statusCode, 200, `${path} must retain admin review access`)
    const rows = operatorList.json().data as Row[]
    assert.ok(rows.length > 0, `${path} has seeded rows for the admin positive control`)
    const id = String(rows[0]?.id ?? '')
    assert.ok(id, `${path} admin list includes a row id`)

    const operatorDetail = await app.inject().get(`${path}/${encodeURIComponent(id)}`).headers(admin).end()
    assert.equal(operatorDetail.statusCode, 200, `${path}/:id remains available to admins`)
    const anonymousDetail = await app.inject().get(`${path}/${encodeURIComponent(id)}`).end()
    assert.equal(anonymousDetail.statusCode, 401, `${path}/:id must deny anonymous access`)
    assertNoBytesIn(`anonymous ${path}/:id`, anonymousDetail.body, allSynthMarkers)
  }
})

// --------------------------------------------------------------------------- 7
test('UI-P05e: UNILEX detail keeps admin-only audit rows private', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })

  // The tables themselves are ADMIN_FULL, so anonymous REST reads are genuinely denied.
  for (const path of ['/orm/unilex_match_reviews', '/orm/unilex_review_log']) {
    const res = await get(app, path)
    assert.equal(res.statusCode, 401, `${path} requires an admin session`)
  }

  // The private projection is closed before it can serialize the same rows.
  const detail = await get(app, '/orm/unilex/term', { stableId: 'P031' })
  assert.equal(detail.statusCode, 401)
  assertNoBytesIn('anonymous UNILEX review denial', detail.body, allSynthMarkers)

  // Authorized reviewers still need the detail projection for private workflows.
  const headers = await adminHeaders(app, '/orm')
  const adminDetail = await app
    .inject()
    .get('/orm/unilex/term')
    .headers(headers)
    .query({ stableId: 'P031' })
    .end()
  assert.equal(adminDetail.statusCode, 200)
  const body = dataOf<{
    identityReviews: Array<{ pairCode: string; decision: string; reviewer: string | null; reason: string | null }>
    reviewLog: Array<{ action: string; reviewer: string; reason: string }>
    relations: Array<{ relationType: string; status: string; reviewer: string | null; evidenceRef: string | null }>
  }>(adminDetail)
  assert.ok(body.identityReviews.length > 0, 'admin reviewers can inspect match-review rows')
  assert.ok(body.reviewLog.length > 0, 'admin reviewers can inspect review-log rows')
  assert.ok(
    body.identityReviews.some((review) => review.reviewer && review.reason),
    'authorized detail includes reviewer attribution and reasons',
  )

  // Positive control on the other side: the write path really is gated.
  const anonymousReview = await app
    .inject()
    .post('/orm/unilex/matches/review')
    .body({
      leftTerm: 'P031',
      rightTerm: 'P030',
      decision: 'APPROVED_EXACT',
      reviewer: 'Synthetic Attempt',
      reason: 'attempting an unreviewed identity claim anonymously',
    })
    .end()
  assert.equal(anonymousReview.statusCode, 401, 'recording an identity decision requires admin')
})

type RelationRow = {
  relationType: string
  status: string
  assertedBy: string
  reviewer: string | null
  reason: string | null
  evidenceRef: string | null
  direction: string
  targetStableId: string | null
}

// --------------------------------------------------------------------------- 8
test('UI-P05e: UNILEX relations stay labelled in admin detail; GAP (PERMISSIVE-TODAY) on the create-to-APPROVED path', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  const { stableId, term } = await seedUnapprovedTerm(moonql)

  // Attach a synthetic relation to a projected term: PENDING, not APPROVED.
  const s001 = (await moonql.model('unilex_terms').list({ where: { stableId: 'S001' } }))[0] as Row
  await moonql.model('unilex_relations').create({
    sourceTermRef: String(s001.id),
    targetTermRef: String(term.id),
    relationType: 'relatedTo',
    status: 'SEED_PROPOSED',
    assertedBy: 'SYNTHETIC',
    reason: 'synthetic unapproved relation for the negative matrix',
  })

  const headers = await adminHeaders(app, '/orm')
  const detailResponse = await app
    .inject()
    .get('/orm/unilex/term')
    .headers(headers)
    .query({ stableId: 'S001' })
    .end()
  const detail = dataOf<{ relations: RelationRow[] }>(detailResponse)
  const synthetic = detail.relations.filter((relation) => relation.targetStableId === stableId)
  assert.equal(synthetic.length, 1, detail.relations.length + ' relations on S001; none pointed at ' + stableId)
  for (const relation of synthetic) {
    assert.equal(relation.status, 'SEED_PROPOSED', 'LABELLED-PERMISSIVE: status is explicit')
    assert.notEqual(relation.status, 'APPROVED')
  }
  // An unapproved relation does not become an approved one by guessing a different term id.
  const otherResponse = await app
    .inject()
    .get('/orm/unilex/term')
    .headers(headers)
    .query({ stableId: 'P030' })
    .end()
  const other = dataOf<{ relations: RelationRow[] }>(otherResponse)
  assert.ok(other.relations.every((relation) => relation.status !== undefined))

  // DENIED, for real: the two identity relation types cannot be created as APPROVED without
  // reviewer + reason + evidenceRef (assertReviewedIdentity, moonql-unilex/src/index.ts:395-402).
  for (const relationType of ['exactMatch', 'closeMatch']) {
    await assert.rejects(
      moonql.model('unilex_relations').create({
        sourceTermRef: String(s001.id),
        targetTermRef: String(term.id),
        relationType,
        status: 'APPROVED',
        assertedBy: 'SYNTHETIC',
        reason: 'trying to approve an identity claim with no reviewer and no evidence',
      }),
      /requires reviewer, reason and evidence before APPROVED/,
      `${relationType} must not be creatable as APPROVED unreviewed`,
    )
  }

  // DENIED, for real, on the update path — and it gates EVERY relation type.
  const pending = await moonql.model('unilex_relations').create({
    sourceTermRef: String(s001.id),
    targetTermRef: String(term.id),
    relationType: 'broaderThan',
    status: 'REVIEW_PENDING',
    assertedBy: 'SYNTHETIC',
    reason: 'synthetic row used to probe the approval gate',
  })
  await assert.rejects(
    moonql.model('unilex_relations').update(String(pending.id), { status: 'APPROVED' }),
    /approving a relation needs/,
    'promoting to APPROVED on update must need reviewer, reason and evidence',
  )
  await moonql.model('unilex_relations').update(String(pending.id), {
    status: 'APPROVED',
    reviewer: 'SYNTHETIC REVIEWER',
    reason: 'synthetic approval carrying full evidence, to show the gate is satisfiable',
    evidenceRef: 'synthetic://evidence/not-real',
  })

  // GAP (PERMISSIVE-TODAY): beforeCreate calls assertReviewedIdentity, which returns early for
  // anything that is not exactMatch/closeMatch (index.ts:397). A NON-identity relation can
  // therefore be CREATED straight into APPROVED with no reviewer and no evidence — the create
  // path is looser than the update path. Admin detail still exposes the inconsistency for review.
  const selfApproved = await moonql.model('unilex_relations').create({
    sourceTermRef: String(s001.id),
    targetTermRef: String(term.id),
    relationType: 'narrowerThan',
    status: 'APPROVED',
    assertedBy: 'SYNTHETIC',
    reason: 'created directly as APPROVED with no reviewer and no evidence',
  })
  assert.equal(String(selfApproved.status), 'APPROVED', 'PERMISSIVE-TODAY: an unreviewed create reached APPROVED')

  const afterResponse = await app
    .inject()
    .get('/orm/unilex/term')
    .headers(headers)
    .query({ stableId: 'S001' })
    .end()
  const after = dataOf<{ relations: RelationRow[] }>(afterResponse)
  const unreviewedApproval = after.relations.find((relation) => relation.relationType === 'narrowerThan')
  assert.ok(unreviewedApproval, 'the relation is visible to an authorized reviewer')
  assert.equal(unreviewedApproval.status, 'APPROVED')
  assert.equal(unreviewedApproval.reviewer, null, 'LEAK: presented as APPROVED with no reviewer recorded')
  assert.equal(unreviewedApproval.evidenceRef, null, 'LEAK: presented as APPROVED with no evidence recorded')
})

// --------------------------------------------------------------------------- 9
test('UI-P05e: released graph projections carry only the active release, never a pending candidate', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })

  // Register a fresh, deliberately UNREVIEWED candidate through the gated admin path.
  const headers = await adminHeaders(app, '/orm')
  const registered = await app
    .inject()
    .post('/orm/graph/candidates/register')
    .headers(headers)
    .body({
      from: 'O001',
      to: 'O002',
      relationType: 'partOf',
      perspective: 'GENERAL',
      sourceCode: 'm02-01-disambiguation',
      evidenceFrame: 'SIMILARITY',
      evidenceSpan: 'synthetic span, no exact sha',
      reason: SYNTH.pendingCandidate,
    })
    .end()
  assert.equal(registered.statusCode, 200, registered.body)
  const candidateCode = dataOf<{ candidate: { candidateCode: string; status: string } }>(registered).candidate.candidateCode
  assert.equal(dataOf<{ candidate: { status: string } }>(registered).candidate.status, 'PENDING')

  const overview = dataOf<{
    candidates: Array<{ candidateCode: string; status: string; inActiveRelease: boolean }>
    active: { releaseCode: string; edgeCount: number } | null
    separation: { candidates: { pending: number }; reviewed: { edgeCount: number } }
    counts: { edgesInActiveRelease: number; reviewedRelations: number }
  }>(await get(app, '/orm/graph/overview'))
  const mine = overview.candidates.find((row) => row.candidateCode === candidateCode)
  assert.ok(mine, 'the candidate is in the review queue')
  assert.equal(mine.status, 'PENDING')
  assert.equal(mine.inActiveRelease, false)
  assert.ok(overview.separation.candidates.pending > 0, 'the fixture keeps the matrix meaningful')

  const adjacency = dataOf<{
    stale: boolean
    items: Array<{ code: string; kind: string }>
  }>(await get(app, '/orm/graph/adjacency'))
  assert.ok(!adjacency.items.some((item) => item.code === candidateCode), 'a candidate is never a released adjacency row')
  assert.ok(
    adjacency.items.every((item) => item.kind === 'ONTOLOGY' || item.kind === 'CANDIDATE'),
    'adjacency rows declare their kind',
  )
  // every CANDIDATE-kind adjacency row must trace back to an APPROVED candidate
  const approvedCodes = new Set(
    overview.candidates.filter((row) => row.status === 'APPROVED').map((row) => row.candidateCode),
  )
  for (const item of adjacency.items.filter((row) => row.kind === 'CANDIDATE')) {
    assert.ok(approvedCodes.has(item.code), `${item.code} appears in adjacency but is not an approved candidate`)
  }

  const searched = dataOf<{ items: Array<{ code: string }>; notice?: string }>(
    await get(app, '/orm/graph/search', { q: candidateCode }),
  )
  assert.ok(!searched.items.some((item) => item.code === candidateCode), 'search covers the release, not candidates')
  assert.match(searched.notice ?? '', /candidates appear in the review queue, not here/)

  const exported = dataOf<{
    manifest: { edges: Array<[string, string]> }
    lineage: { candidates: string[]; ontologyEdges: string[] }
  }>(await get(app, '/orm/graph/export'))
  assert.ok(!exported.manifest.edges.some((edge) => edge[0] === candidateCode), 'the manifest excludes the pending claim')
  assert.ok(!exported.lineage.candidates.includes(candidateCode))

  const releases = dataOf<{ items: Array<{ releaseCode: string; graphSha: string }> }>(await get(app, '/orm/graph/releases'))
  for (const release of releases.items) {
    const detail = dataOf<{ manifest: { edges: Array<[string, string]> } }>(
      await get(app, '/orm/graph/release', { code: release.releaseCode }),
    )
    for (const edge of detail.manifest.edges) {
      if (edge[1] !== 'CANDIDATE') continue
      assert.ok(approvedCodes.has(edge[0]), `release ${release.releaseCode} ships a non-approved candidate ${edge[0]}`)
    }
  }

  // Positive control: the released, reviewed edges ARE reachable — that is the point.
  assert.ok(adjacency.items.length > 0)
  assert.equal(adjacency.items.length, exported.manifest.edges.length, 'adjacency is exactly the active manifest')
  assert.equal(adjacency.stale, false, 'the seeded adjacency is in step with the active release')
  assert.equal(overview.active?.edgeCount, exported.manifest.edges.length)
})

// --------------------------------------------------------------------------- 10
test('UI-P05e GAP (PERMISSIVE-TODAY): /graph/relation serves an unreviewed candidate to an anonymous caller', async (t) => {
  const { app } = await makeApp()
  t.after(async () => {
    await app.close()
  })

  // A seeded, never-reviewed sameAs claim, fetched by guessing its deterministic code.
  const pendingCode = 'GC-O003-O005-sameAs-SUFI_STUDY'
  const res = await get(app, '/orm/graph/relation', { code: pendingCode })
  assert.equal(res.statusCode, 200, 'PERMISSIVE-TODAY: the public relation projection serves a PENDING candidate')
  const body = dataOf<{
    relation: {
      code: string
      kind: string
      status: string
      statusLabel: string
      inActiveRelease: boolean
      pending: boolean
      approved: boolean
      relationType: string
      epistemicStatus: string
      evidence: { span: string | null; present: boolean }
      reason: string | null
    }
    release: unknown
    policy: { automaticApproval: boolean }
  }>(res)
  assert.equal(body.relation.kind, 'CANDIDATE', 'LABELLED-PERMISSIVE: it is typed as a claim, not an edge')
  assert.equal(body.relation.status, 'PENDING')
  assert.equal(body.relation.pending, true)
  assert.equal(body.relation.approved, false)
  assert.equal(body.relation.inActiveRelease, false)
  assert.match(body.relation.statusLabel, /pending review/)
  assert.equal(body.relation.epistemicStatus, 'UNKNOWN')
  assert.equal(body.policy.automaticApproval, false)
  // the unreviewed evidence span is nonetheless public
  assert.ok(body.relation.evidence.span, 'PERMISSIVE-TODAY: unreviewed evidence text is public')

  // What is NOT possible: making it look released by guessing another code shape.
  assert.equal((await get(app, '/orm/graph/relation', { code: 'EDG-NOPE' })).statusCode, 404)
  assert.equal((await get(app, '/orm/graph/relation', {})).statusCode, 400)
  assert.ok(!res.body.includes('"kind":"REVIEWED"'), 'a candidate is never reported as a reviewed edge')
  assert.ok(!res.body.includes('"verified":true'), 'a candidate is never reported as verified')
})

// --------------------------------------------------------------------------- 11
test('UI-P05e GAP (PERMISSIVE-TODAY): /ontology/constellation publishes the reviewer queue that /ontology/conflicts guards', async (t) => {
  const { app } = await makeApp()
  t.after(async () => {
    await app.close()
  })

  // Register an explicitly UNREVIEWED edge through the admin path, then read it anonymously.
  const headers = await adminHeaders(app, '/orm')
  const registered = await app
    .inject()
    .post('/orm/ontology/edges/register')
    .headers(headers)
    .body({
      sourceEntity: 'O004',
      targetEntity: 'O005',
      relationType: 'partOf',
      perspective: 'GENERAL',
      sourceCode: 'm09-unilex-review',
      epistemicStatus: 'UNKNOWN',
      reason: SYNTH.unreviewedEdge,
    })
    .end()
  assert.equal(registered.statusCode, 201, registered.body)
  const registeredBody = dataOf<{ state: string; edge: { edgeCode: string; epistemicStatus: string; verified: boolean } }>(
    registered,
  )
  assert.equal(registeredBody.state, 'recorded')
  assert.equal(registeredBody.edge.epistemicStatus, 'UNKNOWN')
  assert.equal(registeredBody.edge.verified, false)
  const edgeCode = registeredBody.edge.edgeCode

  const gated = await get(app, '/orm/ontology/conflicts')
  assert.equal(gated.statusCode, 401, '/ontology/conflicts is admin-only')

  const publicView = await get(app, '/orm/ontology/constellation')
  assert.equal(publicView.statusCode, 200)
  const body = dataOf<{
    edges: Array<{ edgeCode: string; epistemicStatus: string; verified: boolean; reason: string | null }>
    identityDecisions: Array<{ decision: string; candidate: boolean }>
    conflicts: Array<{ type: string; code: string; status: string }>
    counts: { edges: number; verifiedEdges: number; unresolvedConflicts: number }
    authority: { readOnly: boolean }
  }>(publicView)

  const mine = body.edges.find((edge) => edge.edgeCode === edgeCode)
  assert.ok(mine, 'PERMISSIVE-TODAY: the unreviewed edge is served by the public constellation')
  assert.equal(mine.epistemicStatus, 'UNKNOWN')
  assert.equal(mine.verified, false, 'LABELLED-PERMISSIVE: it is explicitly not verified')
  assert.match(publicView.body, new RegExp(SYNTH.unreviewedEdge), 'PERMISSIVE-TODAY: the unreviewed reason is public')
  assert.ok(
    body.conflicts.some((conflict) => conflict.code === edgeCode && conflict.status === 'UNKNOWN'),
    'the reviewer-queue item itself is inside the public payload',
  )
  assert.ok(
    body.identityDecisions.every((decision) => typeof decision.decision === 'string'),
    'identity decisions carry their decision status',
  )
  assert.equal(body.authority.readOnly, true)
  assert.ok(body.counts.verifiedEdges < body.counts.edges, 'the projection mixes verified and unverified material')
})

// --------------------------------------------------------------------------- 12
test('M34-04: raw Research REST requires an admin; unrelated projection-source ACLs are unchanged', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  await seedBlockedEditions(moonql)
  const researchReads: Array<{ path: string; why: string }> = [
    { path: '/orm/research_cases', why: 'case codes, citation keys and rights snapshots' },
    { path: '/orm/research_frames', why: 'unreviewed frame claims' },
    { path: '/orm/research_claims', why: 'unreviewed claim rows' },
    { path: '/orm/research_relations', why: 'unreviewed claim relations' },
    { path: '/orm/research_witnesses', why: 'narrative witness conclusions' },
    { path: '/orm/research_quality_runs', why: 'case-linked quality evidence' },
    { path: '/orm/research_hypotheses', why: 'CANDIDATE hypotheses' },
  ]
  const otherPublicReads: Array<{ path: string; why: string }> = [
    { path: '/orm/onto_entities', why: 'CONTESTED entities' },
    { path: '/orm/onto_aliases', why: 'CANDIDATE aliases' },
    { path: '/orm/onto_relations', why: 'UNKNOWN/DISPUTED edges' },
    { path: '/orm/graph_candidates', why: 'PENDING candidates' },
    { path: '/orm/graph_releases', why: 'full release manifests' },
    { path: '/orm/graph_adjacency', why: 'derived adjacency' },
    { path: '/orm/corpus_editions', why: 'edition metadata (no text field exists here)' },
  ]

  const nonEmpty = new Set([
    '/orm/research_cases',
    '/orm/onto_entities',
    '/orm/onto_relations',
    '/orm/onto_aliases',
    '/orm/graph_candidates',
    '/orm/graph_releases',
    '/orm/graph_adjacency',
    '/orm/corpus_editions',
  ])
  const admin = await adminHeaders(app, '/orm')
  for (const { path, why } of researchReads) {
    const res = await get(app, path)
    assert.equal(res.statusCode, 401, `${path} must deny anonymous raw Research reads: ${why}`)
    assertNoBytesIn(`anonymous ${path}`, res.body, [...allSynthMarkers, CLEARED_BYTES, CLEARED_TRANSLATION_BYTES])
    const privateRes = await app.inject().get(path).headers(admin).end()
    assert.equal(privateRes.statusCode, 200, `${path} remains available to an authenticated admin`)
    const rows = privateRes.json().data as unknown[]
    assert.ok(Array.isArray(rows), `${path} returns an admin row list`)
    if (path === '/orm/research_cases' || path === '/orm/research_claims' || path === '/orm/research_hypotheses') {
      assert.ok(rows.length > 0, `${path} has seeded rows for the positive control`)
    }
    const row = rows[0] as Row | undefined
    if (row && typeof row.id === 'string') {
      const privateDetail = await app.inject().get(`${path}/${encodeURIComponent(row.id)}`).headers(admin).end()
      assert.equal(privateDetail.statusCode, 200, `${path}/:id remains available to an authenticated admin`)
      const anonymousDetail = await app.inject().get(`${path}/${encodeURIComponent(row.id)}`).end()
      assert.equal(anonymousDetail.statusCode, 401, `${path}/:id must deny anonymous raw Research reads`)
      assertNoBytesIn(`anonymous ${path}/:id`, anonymousDetail.body, [...allSynthMarkers, CLEARED_BYTES, CLEARED_TRANSLATION_BYTES])
    }
  }
  for (const { path, why } of otherPublicReads) {
    const res = await get(app, path)
    assert.equal(res.statusCode, 200, `${path} behavior is outside M34-04: ${why}`)
    const rows = res.json().data as unknown[]
    assert.ok(Array.isArray(rows), `${path} returns a row list`)
    if (nonEmpty.has(path)) assert.ok(rows.length > 0, `${path} returns rows`)
  }

  // Concrete proof that the raw routes reach material the projections withheld.
  const candidatesRaw = await get(app, '/orm/graph_candidates')
  assert.ok(
    (candidatesRaw.body as string).includes('"PENDING"'),
    'raw REST lists PENDING graph candidates',
  )
  const aliasesRaw = await get(app, '/orm/onto_aliases')
  assert.ok(aliasesRaw.body.includes('"CANDIDATE"'), 'raw REST lists CANDIDATE aliases')
  const entitiesRaw = await get(app, '/orm/onto_entities')
  assert.ok(entitiesRaw.body.includes('"CONTESTED"'), 'raw REST lists CONTESTED entities')

  // The one thing these public reads must never carry: uncleared corpus bytes.
  const corpusMarkers = [
    SYNTH.rightsUnknown,
    SYNTH.metadataOnly,
    SYNTH.restricted,
    SYNTH.publicDomainStatus,
    SYNTH.blockedTranslation,
    SYNTH.ambiguousRival,
  ]
  for (const { path } of otherPublicReads) {
    const body = (await get(app, path)).body
    assertNoBytesIn(`raw ${path}`, body, corpusMarkers)
    assertNoBytesIn(`raw ${path}`, body, [CLEARED_BYTES, CLEARED_TRANSLATION_BYTES])
  }
  // Positive controls: the tables that opted out of public reads really opted out.
  for (const path of [
    '/orm/corpus_passages',
    '/orm/corpus_translations',
    '/orm/onto_identity_reviews',
    '/orm/onto_review_log',
    '/orm/unilex_match_reviews',
    '/orm/unilex_review_log',
    '/orm/graph_release_pointer',
  ]) {
    const res = await get(app, path)
    assert.equal(res.statusCode, 401, `${path} must require an admin session`)
    assertNoBytesIn(`denied raw ${path}`, res.body, [...allSynthMarkers, CLEARED_BYTES, CLEARED_TRANSLATION_BYTES])
  }
  // And the models that declared no REST surface at all are not routable.
  for (const path of [
    '/orm/research_reviews',
    '/orm/research_review_events',
    '/orm/research_counterevidence',
    '/orm/research_pilot_annotations',
  ]) {
    assert.equal((await get(app, path)).statusCode, 404, `${path} exposes no REST routes (rest: false)`)
  }
  // Writes are the half ADMIN_WRITE does gate. NOTE: as in test 14, Fastify validates the
  // body schema before the `requires` guard runs (packages/moonql/src/rest.ts:428-430), so an
  // empty anonymous body can surface 400 rather than 401 — either way it never reaches the
  // handler, and a valid-shaped body from a real UI would be 401. What matters is that no
  // anonymous write is ever accepted.
  for (const path of ['/orm/unilex_terms', '/orm/graph_candidates', '/orm/onto_entities', '/orm/research_cases']) {
    const write = await app.inject().post(path).body({}).end()
    assert.ok([400, 401].includes(write.statusCode), `${path} must refuse an anonymous write, got ${write.statusCode}`)
    assert.ok(write.statusCode >= 400, `${path} accepted an anonymous write`)
    assertNoBytesIn(`anonymous write ${path}`, write.body, allSynthMarkers)
  }
})

// --------------------------------------------------------------------------- 13
test('M34-04: anonymous Research reads deny without leaking sensitive bytes; admin retains raw access', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  // creates the SYNTH 1:n passages, so the reader cross-check at the end has an address to veto
  await seedBlockedEditions(moonql)

  // A. The gate that does exist, as a positive control.
  const gated = await get(app, '/orm/corpus_translations')
  assert.equal(gated.statusCode, 401, 'corpus_translations is ADMIN_FULL: anonymous REST reads are denied')
  assertNoBytesIn('denied /orm/corpus_translations', gated.body, [CLEARED_TRANSLATION_BYTES])
  const licensed = (await moonql.model('corpus_translations').list({ where: { code: 'QS_2_82_id_kemenag' } }))[0] as Row
  assert.ok(licensed, 'the licensed Indonesian seed row exists (read in-process, where ACL does not apply)')
  assert.match(String(licensed.translationText), new RegExp(CLEARED_TRANSLATION_BYTES))

  // Anonymous raw Research reads deny; admin controls demonstrate existing private workflows.
  const admin = await adminHeaders(app, '/orm')
  for (const path of ['/orm/research_claims', '/orm/research_witnesses']) {
    const denied = await get(app, path)
    assert.equal(denied.statusCode, 401)
    assertNoBytesIn(`denied ${path}`, denied.body, [...allSynthMarkers, CLEARED_BYTES, CLEARED_TRANSLATION_BYTES])
    const privateRead = await app.inject().get(path).headers(admin).end()
    assert.equal(privateRead.statusCode, 200, privateRead.body)
    assert.match(privateRead.body, new RegExp(CLEARED_TRANSLATION_BYTES), `${path} remains available in private admin workflow`)
  }

  const endpointCases = [
    { path: '/orm/research/overview' },
    { path: '/orm/research/hypotheses' },
    { path: '/orm/research/case', query: { code: 'RC-QS-002-082-ID' } },
    { path: '/orm/research/metrics', query: { code: 'RC-QS-002-082-ID' } },
    { path: '/orm/research/trace', query: { code: 'RC-QS-002-082-ID' } },
    { path: '/orm/research/comparative-case' },
    { path: '/orm/research/comparative-case/jerusalem-70ce' },
  ]
  for (const { path, query } of endpointCases) {
    const denied = await get(app, path, query)
    assert.equal(denied.statusCode, 401, `${path} denies anonymous Research access`)
    assertNoBytesIn(`denied ${path}`, denied.body, [...allSynthMarkers, CLEARED_BYTES, CLEARED_TRANSLATION_BYTES])
    const req = app.inject().get(path).headers(admin)
    const privateRead = await (query ? req.query(query) : req).end()
    assert.equal(privateRead.statusCode, 200, `${path} remains available to authenticated admin`)
  }

  // Verify the licensed text remains readable only behind the admin boundary.
  const adminCase = await app.inject().get('/orm/research/case').query({ code: 'RC-QS-002-082-ID' }).headers(admin).end()
  assert.match(adminCase.body, new RegExp(CLEARED_TRANSLATION_BYTES))

  // Which private research surfaces carry the licensed bytes, measured rather than guessed.
  const cases = (await moonql.model('research_cases').list({ limit: 50 })) as Row[]
  const scanTargets: Array<{ label: string; path: string; query?: Record<string, string> }> = [
    { label: 'admin /orm/research/overview', path: '/orm/research/overview' },
    { label: 'admin /orm/research/hypotheses', path: '/orm/research/hypotheses' },
    ...cases.map((row) => ({
      label: `admin /orm/research/case ${String(row.caseCode)}`,
      path: '/orm/research/case',
      query: { code: String(row.caseCode) },
    })),
    ...cases.map((row) => ({
      label: `admin /orm/research/trace ${String(row.caseCode)}`,
      path: '/orm/research/trace',
      query: { code: String(row.caseCode) },
    })),
  ]
  const perCaseLeaks: string[] = []
  const aggregateLeaks: string[] = []
  for (const { label, path, query } of scanTargets) {
    const req = app.inject().get(path).headers(admin)
    const res = await (query ? req.query(query) : req).end() as unknown as Res
    assert.equal(res.statusCode, 200, `${label} answered`)
    if (!res.body.includes(CLEARED_TRANSLATION_BYTES)) continue
    ;(query ? perCaseLeaks : aggregateLeaks).push(label)
  }
  assert.ok(
    perCaseLeaks.length > 0,
    `the authenticated admin control no longer contains expected case text ${CLEARED_TRANSLATION_BYTES}`,
  )
  assert.ok(
    perCaseLeaks.every((label) => label.includes('RC-QS-002-082-ID')),
    `a case outside the licensed-translation lane leaked: ${perCaseLeaks.join(', ')}`,
  )
  // Aggregate payloads do not carry the licensed translation bytes either.
  assert.deepEqual(aggregateLeaks, [], `aggregate research surfaces also leaked licensed text: ${aggregateLeaks.join(', ')}`)

  // The admin may inspect synthetic uncleared research, while anonymous callers receive no bytes.
  const synthCase = await moonql.model('research_cases').create({
    caseCode: 'SYNTH-RC-RIGHTS-UNKNOWN',
    title: 'Synthetic uncleared case (fixture, not testimony)',
    citationKey: 'SYNTH 1:1',
    sourceSense: 'ORIGINAL_ARABIC',
    rightsSnapshot: 'RIGHTS_UNKNOWN',
    lens: 'COMPARATIVE_NEUTRAL',
    researchStatus: 'OPEN',
    openedAt: '2026-10-26T00:00:00.000Z',
  })
  await moonql.model('research_claims').create({
    claimCode: 'SYNTH-CLM-RIGHTS-UNKNOWN',
    caseRef: String(synthCase.id),
    claim: SYNTH.researchClaim,
    level: 'R2',
    epistemic: 'OBSERVED_TEXT',
    representation: 'TRANSLATION',
    status: 'UNKNOWN',
    citationKey: 'SYNTH 1:1',
    evidenceSpan: SYNTH.researchSpan,
    evidenceSha: null,
  })
  const synthRaw = await get(app, '/orm/research_claims')
  assert.equal(synthRaw.statusCode, 401)
  assertNoBytesIn('anonymous uncleared raw Research', synthRaw.body, [SYNTH.researchClaim, SYNTH.researchSpan])
  const synthCaseRes = await get(app, '/orm/research/case', { code: 'SYNTH-RC-RIGHTS-UNKNOWN' })
  assert.equal(synthCaseRes.statusCode, 401)
  assertNoBytesIn('anonymous uncleared Research projection', synthCaseRes.body, [SYNTH.researchClaim, SYNTH.researchSpan])
  const privateSynth = await app.inject().get('/orm/research/case').query({ code: 'SYNTH-RC-RIGHTS-UNKNOWN' }).headers(admin).end()
  assert.equal(privateSynth.statusCode, 200)
  assert.match(privateSynth.body, new RegExp(SYNTH.researchClaim))
  assert.match(privateSynth.body, new RegExp(SYNTH.researchSpan))
  assert.equal(dataOf<{ source: { rawTextExposed: boolean } }>(privateSynth).source.rawTextExposed, false)
  // ...while the identical address through the corpus reader is still withheld.
  const readerView = await get(app, '/orm/corpus/reader', { citation: 'SYNTH 1:1' })
  assert.equal(dataOf<{ state: string }>(readerView).state, 'rights_blocked')
  assertNoBytesIn('reader vs research cross-check', readerView.body, [SYNTH.rightsUnknown, SYNTH.blockedTranslation])
})

// --------------------------------------------------------------------------- 14
test('M34-04/M19-19/M27-08: no anonymous research projection or release state is exposed', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })

  const cases = (await moonql.model('research_cases').list({ limit: 50 })) as Row[]
  assert.ok(cases.length > 0, 'research fixtures are seeded for the scan')
  const researchPaths: Array<{ path: string; query?: Record<string, string> }> = [
    { path: '/orm/research/overview' },
    { path: '/orm/research/metrics', query: { code: String(cases[0]!.caseCode) } },
    { path: '/orm/research/trace', query: { code: String(cases[0]!.caseCode) } },
    { path: '/orm/research/hypotheses' },
    ...cases.map((row) => ({ path: '/orm/research/case', query: { code: String(row.caseCode) } })),
  ]

  /** Any key claiming publication/release, at any depth, with a truthy reading. */
  const truthyPublicationFlags = (node: unknown, path = '$'): string[] => {
    const found: string[] = []
    if (Array.isArray(node)) {
      for (const [index, item] of node.entries()) found.push(...truthyPublicationFlags(item, `${path}[${index}]`))
      return found
    }
    if (node && typeof node === 'object') {
      for (const [key, value] of Object.entries(node)) {
        const here = `${path}.${key}`
        const publicationKey = /publication|publish|released/i.test(key)
        if (publicationKey && (value === true || (typeof value === 'string' && /^(PUBLISHED|RELEASED|APPROVED_FOR_RELEASE|APPROVED_FOR_PUBLICATION)$/i.test(value)))) {
          found.push(`${here}=${String(value)}`)
        }
        if (publicationKey && /available/i.test(key)) {
          assert.equal(value, false, `${here} must be exactly false, got ${String(value)}`)
        }
        found.push(...truthyPublicationFlags(value, here))
      }
    }
    return found
  }

  const admin = await adminHeaders(app, '/orm')
  for (const { path, query } of researchPaths) {
    const res = await get(app, path, query)
    assert.equal(res.statusCode, 401, `${path} denies anonymous Research reads`)
    assertNoBytesIn(`research ${path}`, res.body, [...allSynthMarkers])
    const req = app.inject().get(path).headers(admin)
    const privateRes = await (query ? req.query(query) : req).end()
    assert.equal(privateRes.statusCode, 200, `${path} remains admin-readable`)
    assert.equal(truthyPublicationFlags(privateRes.json().data).length, 0, `${path} must report nothing as published`)
    assertNoBytesIn(`admin research ${path}`, privateRes.body, [...allSynthMarkers])
  }

  // The withholding is stated, not merely absent.
  const overview = dataOf<{ meta: { p19ReleaseDecision: string }; policy: Record<string, unknown> }>(
    await app.inject().get('/orm/research/overview').headers(admin).end(),
  )
  assert.equal(overview.meta.p19ReleaseDecision, 'BLOCKED')
  assert.equal(overview.policy.humanReviewAvailableInMilestone, false)
  assert.equal(overview.policy.engineeringCommitIsNotHumanReview, true)

  const firstCase = dataOf<{
    review: { humanReviewed: boolean; state: string; label: string }
    source: { rawTextExposed: boolean }
  }>(await app.inject().get('/orm/research/case').query({ code: String(cases[0]!.caseCode) }).headers(admin).end())
  assert.equal(firstCase.review.humanReviewed, false, 'a private case never claims human review')
  assert.equal(firstCase.source.rawTextExposed, false, 'the case projection never exposes raw source bytes')

  const hypotheses = dataOf<{ items: Array<{ verified: boolean; humanReviewed: boolean; status: string }> }>(
    await app.inject().get('/orm/research/hypotheses').headers(admin).end(),
  )
  assert.ok(hypotheses.items.length > 0)
  for (const item of hypotheses.items) {
    assert.equal(item.verified, false, 'a seeded hypothesis stays unverified in the private research view')
    assert.equal(item.humanReviewed, false)
    assert.equal(item.status, 'CANDIDATE')
  }

  // Every research endpoint that carries the flag is admin/auth gated, so the UI
  // cannot reach the gated surface anonymously at all.
  for (const path of ['/orm/research/reviews', '/orm/research/reviews/rr-synth-none/release', '/orm/research/pilot']) {
    const res = await get(app, path)
    assert.ok([401, 404].includes(res.statusCode), `${path} is not publicly readable (${res.statusCode})`)
  }
  // NOTE (recorded, not papered over): Fastify validates the request body BEFORE the
  // endpoint's `requires` guard runs (packages/moonql/src/rest.ts:428-430), so an
  // anonymous POST with an empty body gets 400 from schema validation rather than 401
  // from the session check. It is still refused — it never reaches the handler.
  for (const path of [
    '/orm/research/reviews/register',
    '/orm/research/counterevidence/register',
    '/orm/research/mizan/runs',
    '/orm/research/pilot/annotations',
  ]) {
    const res = await app.inject().post(path).body({}).end()
    assert.ok([400, 401].includes(res.statusCode), `${path} must refuse an anonymous caller, got ${res.statusCode}`)
    assert.ok(res.statusCode >= 400, `${path} must not be 2xx for an anonymous caller`)
    assertNoBytesIn(`anonymous post ${path}`, res.body, allSynthMarkers)
  }
  // With a session the list still states the withholding.
  const headers = await adminHeaders(app, '/orm')
  const list = await app.inject().get('/orm/research/reviews').headers(headers).end()
  assert.equal(list.statusCode, 200, list.body)
  const listBody = dataOf<{
    reviews: Array<{ publicationAvailable: boolean }>
    policy: { publicationAvailable: boolean; autoApprove: boolean }
  }>(list)
  assert.equal(listBody.policy.publicationAvailable, false)
  assert.equal(listBody.policy.autoApprove, false)
  assert.ok(listBody.reviews.every((row) => row.publicationAvailable === false))
  assert.match(String(list.body), /not a publication surface/)
})

// --------------------------------------------------------------------------- 15
test.skip('UI-P05e NOT SATISFIED: guessing a public link must be denied for every unapproved projection', async () => {
  // Precise reason this is skipped rather than asserted:
  //   D08 (Publication & Governance) is planned-only — no @moonwitness/governance addon and
  //   none of release_manifests / rights_approvals / editorial_signoffs / takedown_logs exist
  //   (proved above from moonql.registry.models). Until that gate exists there is no
  //   "approved public projection" concept for the hub to deny against, and three surfaces are
  //   demonstrably permissive today:
  //     1. GET /orm/ontology/constellation returns the same conflicts array as the ADMIN_ONLY
  //        /orm/ontology/conflicts (packages/moonql-ontology/src/index.ts:457-470).
  //     2. GET /orm/graph/relation?code=<candidateCode> serves PENDING candidates anonymously
  //        (packages/moonql-graph/src/projection.ts:480-500).
  //     3. GET /orm/research/case + /orm/research/trace publish licensed translation text whose
  //        own table (corpus_translations) is ADMIN_FULL, i.e. denied (test 13 above).
  //   Plus the documented ADMIN_WRITE hole: raw REST list/get on research_cases, onto_entities,
  //   onto_aliases and graph_* are public-by-model (packages/moonql/src/model.ts:30-42,
  //   docs/architecture/SECURITY.md). Enabling this test requires a D08 approval model plus read
  //   gating on those routes; M27-08 stays BLOCKED until then.
})
