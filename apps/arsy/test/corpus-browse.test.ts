import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify, { type FastifyInstance } from 'fastify'
import { bootMoonQl, moonqlRest } from '@moonwitness/moonql'
import base from '@moonwitness/moonql-base'
import auth from '@moonwitness/moonql-auth'
import corpus from '@moonwitness/moonql-corpus'
import envelope from '../src/plugins/envelope.js'
import { TEST_ADMIN_PASSWORD } from './helpers/auth.js'

/**
 * UI-P05b — the contract of the metadata rail that unblocks the CORPUS READER's
 * `WORKS / CONTENTS` column (docs/audit/ui-screen-audits-d54ad43.md §3.5).
 *
 * `/corpus/browse` exists only because the reader screen had no browse data at all.
 * That makes it the one corpus surface with a structural promise to keep: it must be
 * impossible to use it as a text exit. Every assertion below is made against the real
 * in-process hub (real HTTP injection, no mocks), and the promise is tested two ways —
 * no source bytes anywhere in the body, and no text-bearing key in the projection at all.
 *
 * ALL FIXTURE DATA HERE IS SYNTHETIC AND SELF-DECLARING ("SYNTH-" prefixed). It is not
 * witness material, not testimony, and not a religious text. The only real text touched
 * is the public-domain Cairo 1924 seed already exercised by corpus-reader.test.ts.
 */

const quiet = { info: () => {}, warn: () => {} }

type Row = Record<string, unknown>
type Res = { statusCode: number; body: string; json(): { data?: unknown; error?: { message?: string } } }

type BrowseBody = {
  citation: string
  edition: string | null
  resolved: boolean
  work: { code: string | null; title: string | null; originalLanguage: string | null } | null
  works: Array<{ code: string; title: string; tradition: string | null; originalLanguage: string | null; editionCount: number }>
  editions: Array<{
    code: string
    name: string | null
    editorOrPublisher: string | null
    rightsStatus: string
    licenseName: string | null
    sourceUri: string | null
    provenanceSha: string | null
    passageCount: number
    cleared: boolean
  }>
  passages: Array<{
    citationKey: string
    surahNumber: number | null
    ayahNumber: number | null
    editionCode: string | null
    verifiedAt: string | null
    textAvailable: boolean
  }>
  translations: Array<{
    languageCode: string
    translatorName: string | null
    licenseName: string | null
    rightsStatus: string
    editionCode: string | null
    textAvailable: boolean
  }>
  interpretation: { available: boolean; reason: string }
  export: { citationAvailable: boolean; textExportAllowed: boolean; reason: string }
}

const dataOf = <T>(res: { json(): unknown }): T => (res.json() as { data: T }).data
const messageOf = (res: { json(): unknown }): string =>
  String((res.json() as { error?: { message?: string } }).error?.message ?? '')

async function makeApp() {
  const app = Fastify({ logger: false })
  const moonql = await bootMoonQl({
    addons: [base, auth, corpus],
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

async function browse(app: FastifyInstance, query: Record<string, string>): Promise<Res> {
  return app.inject().get('/orm/corpus/browse').query(query).end() as unknown as Res
}

/**
 * The cleared seed's opening clause, built from codepoints. Written as an Arabic
 * literal it survives no source encoding round-trip — the shadda/fathah cluster gets
 * reordered and the byte check below silently stops checking anything. Test 1 proves
 * this marker is really inside the seed row before trusting its absence from browse.
 */
const CLEARED_BYTES = String.fromCodePoint(
  0x648, 0x64e, 0x671, 0x644, 0x651, 0x64e, 0x630, 0x650, 0x64a, 0x646, 0x64e, 0x20,
  0x621, 0x64e, 0x627, 0x645, 0x64e, 0x646, 0x64f, 0x648, 0x627, 0x6df,
)
const CLEARED_TRANSLATION_BYTES = 'penghuni surga'

const SYNTH = {
  unknownBytes: 'SYNTH-BROWSE-RIGHTS-UNKNOWN-BYTES-NOT-FOR-PUBLICATION',
  metadataBytes: 'SYNTH-BROWSE-METADATA-ONLY-BYTES-NOT-FOR-PUBLICATION',
  translationBytes: 'SYNTH-BROWSE-TRANSLATION-BYTES-NOT-FOR-PUBLICATION',
} as const

/** Source wording only — edition metadata such as the fixture publisher may be public. */
const ALL_MARKERS = [...Object.values(SYNTH), CLEARED_BYTES, CLEARED_TRANSLATION_BYTES]
const PUBLISHER = 'SYNTH-FIXTURE-PUBLISHER'

/** Every key name at any depth — the projection's shape, not just its values. */
function keysOf(node: unknown, out: string[] = []): string[] {
  if (Array.isArray(node)) {
    for (const item of node) keysOf(item, out)
    return out
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      out.push(key)
      keysOf(value, out)
    }
  }
  return out
}

function assertNoTextExit(label: string, res: Res): void {
  for (const marker of ALL_MARKERS) {
    assert.ok(!res.body.includes(marker), `${label}: browse leaked ${JSON.stringify(marker)}`)
  }
  for (const forbidden of ['arabicText', 'translationText', 'blockedPlaceholder']) {
    assert.ok(!keysOf(dataOf<unknown>(res)).includes(forbidden), `${label}: browse carried the text field "${forbidden}"`)
  }
  const body = dataOf<BrowseBody | undefined>(res)
  for (const row of body?.passages ?? []) assert.ok(!('text' in row), `${label}: a passage row carries a text field`)
  for (const row of body?.translations ?? []) assert.ok(!('text' in row), `${label}: a translation row carries a text field`)
}

/** One uncleared edition (3 addresses) + one METADATA_ONLY edition, both SYNTH-only. */
async function seedUncleared(moonql: Awaited<ReturnType<typeof bootMoonQl>>) {
  const work = (await moonql.model('corpus_works').list({ where: { code: 'quran' } }))[0] as Row
  const unknown = await moonql.model('corpus_editions').create({
    code: 'synth_browse_unknown',
    workRef: String(work.id),
    name: 'Synthetic browse edition (RIGHTS_UNKNOWN)',
    editorOrPublisher: PUBLISHER,
    rightsStatus: 'RIGHTS_UNKNOWN',
    licenseName: 'Synthetic / Not Cleared',
  })
  for (const ayah of [1, 2, 3]) {
    await moonql.model('corpus_passages').create({
      citationKey: `SYNTH-BROWSE 1:${ayah}`,
      editionRef: String(unknown.id),
      surahNumber: 1,
      ayahNumber: ayah,
      arabicText: `${SYNTH.unknownBytes} ${ayah}`,
    })
  }
  const passage = (await moonql.model('corpus_passages').list({ where: { citationKey: 'SYNTH-BROWSE 1:2' } }))[0] as Row
  // a CLEARED translation sitting on an UNCleared edition: the reader refuses it, so must browse
  await moonql.model('corpus_translations').create({
    code: 'SYNTH-BROWSE-TRANS',
    passageRef: String(passage.id),
    languageCode: 'en',
    translatorName: 'Synthetic Translator',
    translationText: SYNTH.translationBytes,
    rightsStatus: 'RIGHTS_EXACT_VERSION_CLEARED',
    licenseName: 'Synthetic Cleared Translation On Uncleared Edition',
  })

  const metadataOnly = await moonql.model('corpus_editions').create({
    code: 'synth_browse_metadata_only',
    workRef: String(work.id),
    name: 'Synthetic browse edition (METADATA_ONLY)',
    editorOrPublisher: PUBLISHER,
    rightsStatus: 'METADATA_ONLY',
    licenseName: 'Synthetic / Metadata Only',
  })
  await moonql.model('corpus_passages').create({
    citationKey: 'SYNTH-BROWSE 2:1',
    editionRef: String(metadataOnly.id),
    surahNumber: 2,
    ayahNumber: 1,
    arabicText: SYNTH.metadataBytes,
  })
  return { unknownCode: 'synth_browse_unknown', metadataCode: 'synth_browse_metadata_only' }
}

// --------------------------------------------------------------------------- 1
test('UI-P05b: anonymous /corpus/browse answers, and cannot be used as a text exit', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })

  const res = await browse(app, { citation: 'QS 2:82' })
  assert.equal(res.statusCode, 200, 'the rail is public, like the reader')
  const body = dataOf<BrowseBody>(res)

  // the marker really is the stored seed wording (read in-process, where ACL does not
  // apply): without this control, "no bytes in the body" could be satisfied by a typo
  const seedPassage = (await moonql.model('corpus_passages').list({ where: { citationKey: 'QS 2:82' } }))[0] as Row
  assert.ok(String(seedPassage.arabicText).includes(CLEARED_BYTES), 'the byte marker must match the stored seed')
  const seedTranslation = (await moonql.model('corpus_translations').list({ where: { code: 'QS_2_82_id_kemenag' } }))[0] as Row
  assert.ok(String(seedTranslation.translationText).includes(CLEARED_TRANSLATION_BYTES))

  // the structural promise, measured on the wire rather than asserted in a comment
  assert.ok(!res.body.includes('arabicText'), 'the field name itself must not be part of this projection')
  assert.ok(!res.body.includes('translationText'), 'the field name itself must not be part of this projection')
  assertNoTextExit('browse of the cleared address', res)

  // ...while the same address through the reader does carry those bytes (control)
  const reader = await app.inject().get('/orm/corpus/reader').query({ citation: 'QS 2:82' }).end()
  assert.equal(reader.statusCode, 200)
  assert.ok(reader.body.includes(CLEARED_BYTES), 'the cleared text still leaves through /corpus/reader only')
  assert.ok(reader.body.includes(CLEARED_TRANSLATION_BYTES))

  // the metadata identity the rail needs, with the reader's own clearance invariant
  assert.equal(body.citation, 'QS 2:82')
  assert.equal(body.edition, null, 'no edition filter was sent')
  assert.equal(body.resolved, true)
  assert.equal(body.work?.code, 'quran')
  assert.equal(body.work?.originalLanguage, 'ar')
  assert.equal(body.editions.find((row) => row.code === 'quran_cairo_hafs')?.cleared, true)
  const window = body.passages.find((row) => row.citationKey === 'QS 2:82')
  assert.ok(window, 'the requested address is inside its own window')
  assert.equal(window.surahNumber, 2)
  assert.equal(window.ayahNumber, 82)
  assert.equal(window.editionCode, 'quran_cairo_hafs')
  assert.equal(window.verifiedAt, '2026-10-26T00:00:00.000Z')
  assert.equal(window.textAvailable, true, 'a cleared edition is flagged without shipping its bytes')

  const indonesian = body.translations.find((row) => row.languageCode === 'id')
  assert.ok(indonesian, 'the translation inventory names the language')
  assert.equal(indonesian.translatorName, 'Kemenag RI')
  assert.equal(indonesian.rightsStatus, 'RIGHTS_EXACT_VERSION_CLEARED')
  assert.equal(indonesian.textAvailable, true)
  assert.equal(body.export.textExportAllowed, true)
  // the sentence must agree with the boolean it describes: telling a caller that a
  // cleared edition is "GUARDED" while the flag says export is allowed is a claim
  // the data contradicts, and the rail renders both on the same line
  assert.match(body.export.reason, /^EXPORT: PERMITTED/)
  assert.doesNotMatch(body.export.reason, /GUARDED/)
  assert.equal(body.export.citationAvailable, true)

  // the window is bounded and centred, not a dump
  assert.ok(body.passages.length <= 15, `window must stay at 15 rows, got ${body.passages.length}`)
})

// --------------------------------------------------------------------------- 2
test('UI-P05b: the catalog rows the WORKS/CONTENTS rail lists are the seeded ones', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })

  const body = dataOf<BrowseBody>(await browse(app, { citation: 'QS 2:82' }))

  const quran = body.works.find((row) => row.code === 'quran')
  assert.ok(quran, 'the seeded work is in the catalog')
  assert.equal(quran.title, "Al-Qur'an al-Karim")
  assert.equal(quran.tradition, 'islamic')
  assert.equal(quran.originalLanguage, 'ar')
  assert.ok(quran.editionCount >= 1, 'the work reports its editions')

  const edition = body.editions.find((row) => row.code === 'quran_cairo_hafs')
  assert.ok(edition, 'the seeded edition is in the catalog')
  assert.equal(edition.cleared, true)
  assert.ok(edition.passageCount > 0, 'a passage index count above zero, taken from the engine')
  assert.equal(edition.rightsStatus, 'RIGHTS_EXACT_VERSION_CLEARED')
  assert.equal(edition.licenseName, 'Public Domain / Verified Recitation Transmission')
  assert.equal(edition.sourceUri, 'https://archive.org/details/cairo-quran-1924')
  assert.match(String(edition.provenanceSha), /^[a-f0-9]{64}$/)
  assert.equal(edition.editorOrPublisher, 'Al-Azhar / Egyptian Royal Survey')

  // deterministic order, so the rail does not reshuffle between requests
  const codes = body.editions.map((row) => row.code)
  assert.deepEqual(codes, [...codes].sort(), 'editions are sorted by code')
  const workCodes = body.works.map((row) => row.code)
  assert.deepEqual(workCodes, [...workCodes].sort(), 'works are sorted by code')
  const again = dataOf<BrowseBody>(await browse(app, { citation: 'QS 2:82' }))
  assert.deepEqual(again.editions.map((row) => row.code), codes, 'the same request gives the same list')
})

// --------------------------------------------------------------------------- 3
test('UI-P05b: an address that does not exist resolves nothing, and a garbage one never 500s', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  await seedUncleared(moonql)

  const guessed = [
    'QS 999:1',
    'QS 2:999',
    'SYNTH-BROWSE 9:9',
    'GEN 1:1',
    '2:82',
    'QS-2-82',
    'book:chapter:verse',
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
    'SYNTH-BROWSE 1:1 OR QS 2:82',
    'a'.repeat(60),
  ]
  for (const citation of guessed) {
    const res = await browse(app, { citation })
    assert.equal(res.statusCode, 200, `${JSON.stringify(citation)} must answer, not error`)
    const body = dataOf<BrowseBody>(res)
    assert.equal(body.citation, citation.trim().replace(/\s+/g, ' '), 'the address is echoed as normalised')
    assert.equal(body.resolved, false, `${JSON.stringify(citation)} must not resolve`)
    assert.equal(body.work, null, 'no work may be invented for an unindexed address')
    assert.deepEqual(body.passages, [], 'no window may be invented for an unindexed address')
    assert.deepEqual(body.translations, [])
    assert.equal(body.export.citationAvailable, false, 'nothing indexed, so nothing to cite')
    assert.equal(body.export.textExportAllowed, false)
    assert.match(body.export.reason, /no edition resolved/i)
    assertNoTextExit(`guessed ${JSON.stringify(citation)}`, res)
  }

  // whitespace inside an address is normalised exactly like the reader does
  const spaced = dataOf<BrowseBody>(await browse(app, { citation: '  qs   2:82  ' }))
  assert.equal(spaced.citation, 'qs 2:82')
  assert.equal(spaced.resolved, true, 'the reader is case-insensitive on the fallback pass, so browse is too')

  // the two input-level refusals, with the same explicit 400 shape as the reader
  const empty = await browse(app, {})
  assert.equal(empty.statusCode, 400)
  assert.match(messageOf(empty), /citation/)
  assertNoTextExit('empty citation', empty)
  const blank = await browse(app, { citation: '   ' })
  assert.equal(blank.statusCode, 400)
  assert.match(messageOf(blank), /citation is required/)
  const tooLong = await browse(app, { citation: 'QS 2:82 '.repeat(8) })
  assert.equal(tooLong.statusCode, 400)
  assert.match(messageOf(tooLong), /longer than 60/)
  assertNoTextExit('too-long citation', tooLong)
})

// --------------------------------------------------------------------------- 4
test('UI-P05b: an uncleared edition is listed as uncleared, and EXPORT: GUARDED says why', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  const { unknownCode, metadataCode } = await seedUncleared(moonql)

  const listed = dataOf<BrowseBody>(await browse(app, { citation: 'SYNTH-BROWSE 1:2' }))
  const synth = listed.editions.find((row) => row.code === unknownCode)
  assert.ok(synth, 'the synthetic edition is in the catalog')
  assert.equal(synth.cleared, false, 'RIGHTS_UNKNOWN is not clearance')
  assert.equal(synth.rightsStatus, 'RIGHTS_UNKNOWN')
  assert.equal(synth.passageCount, 3, 'the count is the edition\'s own, not a scan artefact')
  assert.equal(synth.editorOrPublisher, PUBLISHER)
  assert.equal(synth.provenanceSha, null, 'unrecorded provenance stays null, never a fake hash')
  assert.equal(synth.licenseName, 'Synthetic / Not Cleared')

  const metadataOnly = listed.editions.find((row) => row.code === metadataCode)
  assert.ok(metadataOnly)
  assert.equal(metadataOnly.cleared, false)
  assert.equal(metadataOnly.passageCount, 1)

  // PUBLIC_DOMAIN is a label, not the invariant: prove it on a fresh edition
  const work = (await moonql.model('corpus_works').list({ where: { code: 'quran' } }))[0] as Row
  await moonql.model('corpus_editions').create({
    code: 'synth_browse_public_domain',
    workRef: String(work.id),
    name: 'Synthetic browse edition (PUBLIC_DOMAIN label)',
    editorOrPublisher: PUBLISHER,
    rightsStatus: 'PUBLIC_DOMAIN',
    licenseName: 'Synthetic / Label Only',
  })
  const relabelled = dataOf<BrowseBody>(await browse(app, { citation: 'SYNTH-BROWSE 1:2' }))
  const publicDomain = relabelled.editions.find((row) => row.code === 'synth_browse_public_domain')
  assert.ok(publicDomain)
  assert.equal(publicDomain.cleared, false, 'a PUBLIC_DOMAIN label must not read as cleared')

  assert.equal(listed.resolved, true)
  assert.equal(listed.work?.code, 'quran')
  assert.ok(listed.passages.length > 0, 'the window is the uncleared edition\'s own addresses')
  for (const row of listed.passages) {
    assert.equal(row.editionCode, unknownCode, 'the window never drifts into another edition')
    assert.equal(row.textAvailable, false, `${row.citationKey} must be flagged as no text`)
  }
  const english = listed.translations.find((row) => row.languageCode === 'en')
  assert.ok(english, 'the language is inventoried even when its wording is refused')
  assert.equal(english.rightsStatus, 'RIGHTS_EXACT_VERSION_CLEARED')
  assert.equal(english.textAvailable, false, 'a cleared translation on an uncleared edition stays refused')
  assert.equal(english.editionCode, unknownCode)

  assert.equal(listed.export.citationAvailable, true, 'the metadata citation line is allowed regardless')
  assert.equal(listed.export.textExportAllowed, false)
  assert.match(listed.export.reason, /text export withheld/i)
  assert.match(listed.export.reason, /RIGHTS_UNKNOWN/)
  assert.match(listed.export.reason, /not RIGHTS_EXACT_VERSION_CLEARED/)
  assertNoTextExit('uncleared edition', await browse(app, { edition: unknownCode, citation: 'SYNTH-BROWSE 1:2' }))

  // an edition filter alone still bounds the window to that edition's first addresses
  const filtered = dataOf<BrowseBody>(await browse(app, { citation: 'SYNTH-BROWSE 9:9', edition: unknownCode }))
  assert.equal(filtered.edition, unknownCode, 'the filter is echoed')
  assert.equal(filtered.resolved, false)
  assert.deepEqual(
    filtered.passages.map((row) => row.citationKey),
    ['SYNTH-BROWSE 1:1', 'SYNTH-BROWSE 1:2', 'SYNTH-BROWSE 1:3'],
  )
  assert.ok(filtered.passages.every((row) => row.textAvailable === false))
  assert.equal(filtered.export.textExportAllowed, false)
})

// --------------------------------------------------------------------------- 5
test('UI-P05b: INTERPRETATION: LABELED is read from the live registry, not written into the handler', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })

  const body = dataOf<BrowseBody>(await browse(app, { citation: 'QS 2:82' }))
  assert.equal(body.interpretation.available, false, 'no commentary lane exists yet')
  assert.match(body.interpretation.reason, /no commentary\/interpretation model is registered/i)
  assert.match(body.interpretation.reason, /corpus_commentary/, 'the reason names what it looked for')
  assert.match(body.interpretation.reason, /INTERPRETATION: LABELED/)

  // the count in the reason is the running registry's, which is what makes this derived
  const advertised = [...moonql.registry.models.values()].filter((model) => model.rest !== false).length
  const named = Number(body.interpretation.reason.match(/among the (\d+) installed models/)?.[1] ?? -1)
  assert.equal(named, advertised, 'the handler counted the live models, it did not hardcode a number')
  assert.ok(
    [...moonql.registry.models.keys()].every((name) => !/commentar|interpret|tafsir|exegesis/i.test(name)),
    'a commentary model has landed: browse must now report interpretation as available',
  )

  // the same honest answer for an address that resolves to nothing
  const absentBody = dataOf<BrowseBody>(await browse(app, { citation: 'QS 999:1' }))
  assert.equal(absentBody.interpretation.available, false)
  assert.equal(absentBody.interpretation.reason, body.interpretation.reason)
})

// --------------------------------------------------------------------------- 6
test('UI-P05b: browse keeps /corpus/reader as the only text exit under attack', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  const { unknownCode } = await seedUncleared(moonql)

  const clearedEdition = (await moonql.model('corpus_editions').list({ where: { code: 'quran_cairo_hafs' } }))[0] as Row
  const attacks: Array<Record<string, string>> = [
    { citation: 'QS 2:82', edition: 'quran_cairo_hafs' },
    { citation: 'qs 2:82' },
    { citation: 'QS  2:82' },
    { citation: '*', edition: 'quran_cairo_hafs' },
    { citation: 'SYNTH-BROWSE 1:1', edition: unknownCode },
    { citation: 'SYNTH-BROWSE 1:1', edition: 'quran_cairo_hafs' },
    { citation: 'QS 2:82', edition: String(clearedEdition.id) },
    { citation: String(clearedEdition.id) },
    { citation: 'QS 2:82 UNION SELECT arabicText FROM corpus_passages' },
  ]
  for (const query of attacks) {
    const res = await browse(app, query)
    assert.equal(res.statusCode, 200, `${JSON.stringify(query)} must answer`)
    assertNoTextExit(`browse ${JSON.stringify(query)}`, res)
    const body = dataOf<BrowseBody>(res)
    if (body.export.textExportAllowed) {
      // the flag may only ever point at a genuinely cleared edition, and it still
      // does not buy a byte: the window rows carry addresses, not wording
      assert.equal(body.editions.find((row) => row.code === body.passages[0]?.editionCode)?.cleared, true)
    }
    for (const row of body.passages) {
      assert.match(row.citationKey, /./)
      assert.equal(typeof row.textAvailable, 'boolean')
    }
  }
})
