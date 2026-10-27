import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify from 'fastify'
import { bootMoonQl, moonqlRest } from '@moonwitness/moonql'
import base from '@moonwitness/moonql-base'
import auth from '@moonwitness/moonql-auth'
import corpus from '@moonwitness/moonql-corpus'
import envelope from '../src/plugins/envelope.js'

const quiet = { info: () => {}, warn: () => {} }

async function makeApp() {
  const app = Fastify({ logger: false })
  const moonql = await bootMoonQl({
    addons: [base, auth, corpus],
    seedPolicy: 'off',
    cronEnabled: false,
    log: quiet,
  })
  await app.register(envelope)
  await app.register(moonqlRest, { prefix: '/orm', instance: moonql })
  await app.ready()
  return { app, moonql }
}

test('M08-02/03/04: reader returns exact work, edition, rights, translation and citation', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })

  const res = await app.inject().get('/orm/corpus/reader').query({ citation: 'qs 2:82' }).end()
  assert.equal(res.statusCode, 200)
  const body = res.json().data

  assert.equal(body.state, 'available')
  assert.equal(body.citation.key, 'QS 2:82')
  assert.equal(body.citation.workTitle, "Al-Qur'an al-Karim")
  assert.equal(body.citation.editionCode, 'quran_cairo_hafs')
  assert.equal(body.citation.editionName, "Amiri Press Cairo Edition 1924 (Hafs 'an 'Asim)")
  assert.equal(body.citation.rightsStatus, 'RIGHTS_EXACT_VERSION_CLEARED')
  assert.equal(body.citation.licenseName, 'Public Domain / Verified Recitation Transmission')
  assert.equal(body.citation.sourceUri, 'https://archive.org/details/cairo-quran-1924')
  assert.match(body.citation.provenanceSha, /^[a-f0-9]{64}$/)
  assert.equal(body.citation.sourceDate, '2026-10-26T00:00:00.000Z')

  assert.equal(body.arabic.direction, 'rtl')
  assert.equal(body.arabic.script, 'Arab')
  assert.equal(body.arabic.language, 'ar')
  assert.ok(body.arabic.text.includes('وَٱلَّذِينَ ءَامَنُوا۟'))

  const indonesian = body.translations.find((row: { languageCode: string }) => row.languageCode === 'id')
  assert.ok(indonesian)
  assert.equal(indonesian.direction, 'ltr')
  assert.equal(indonesian.translatorName, 'Kemenag RI')
  assert.ok(indonesian.text.includes('penghuni surga'))

  assert.match(body.citationText, /QS 2:82/)
  assert.match(body.citationText, /quran_cairo_hafs/)
  assert.match(body.citationText, /provenance=c0a8f1e7/)
  assert.match(body.citationText, /source-date=2026-10-26T00:00:00\.000Z/)
})

test('translation direction is supplied by Corpus and legacy rows remain unknown', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })

  const passage = (await moonql.model('corpus_passages').list({ where: { citationKey: 'QS 2:82' } }))[0]!
  const hebrew = await moonql.model('corpus_translations').create({
    code: 'legacy_hebrew_direction', passageRef: passage.id, languageCode: 'he', translatorName: 'Synthetic fixture',
    translationText: 'שָׁלוֹם', rightsStatus: 'RIGHTS_EXACT_VERSION_CLEARED', licenseName: 'Synthetic test fixture',
  })
  await moonql.model('corpus_translations').create({
    code: 'greek_ltr_direction', passageRef: passage.id, languageCode: 'el', direction: 'ltr', translatorName: 'Synthetic fixture',
    translationText: 'ἄνθρωπος', rightsStatus: 'RIGHTS_EXACT_VERSION_CLEARED', licenseName: 'Synthetic test fixture',
  })
  const response = await app.inject().get('/orm/corpus/reader').query({ citation: 'QS 2:82' }).end()
  assert.equal(response.statusCode, 200)
  const projected = response.json().data.translations.find((item: { languageCode: string; text: string | null; direction: string | null }) => item.languageCode === 'he')
  assert.equal(projected.text, 'שָׁלוֹם')
  assert.equal(projected.direction, null, 'missing authoritative direction stays unknown rather than being guessed')

  await moonql.model('corpus_translations').update(String(hebrew.id), { direction: 'rtl' })
  const rtlResponse = await app.inject().get('/orm/corpus/reader').query({ citation: 'QS 2:82' }).end()
  const rtl = rtlResponse.json().data.translations.find((item: { languageCode: string; text: string | null; direction: string | null }) => item.languageCode === 'he')
  const greek = rtlResponse.json().data.translations.find((item: { languageCode: string; text: string | null; direction: string | null }) => item.languageCode === 'el')
  assert.equal(rtl.direction, 'rtl', 'the explicit Corpus field controls source direction')
  assert.equal(rtl.text, 'שָׁלוֹם', 'diacritics and exact text remain unchanged')
  assert.equal(greek.direction, 'ltr', 'Greek direction comes from the explicit Corpus field')
  assert.equal(greek.text, 'ἄνθρωπος', 'Greek text and diacritics remain unchanged')
  assert.match(rtlResponse.json().data.citationText, /QS 2:82/)
  assert.ok(!rtlResponse.json().data.citationText.includes('שָׁלוֹם'))
  assert.ok(!rtlResponse.json().data.citationText.includes('ἄνθρωπος'))
})

test('M08-05: absent and malformed citations never invent a verse', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })

  const missing = await app.inject().get('/orm/corpus/reader').query({ citation: 'QS 99:1' }).end()
  assert.equal(missing.statusCode, 200)
  assert.equal(missing.json().data.state, 'absent')
  assert.equal(missing.json().data.arabic, null)

  const empty = await app.inject().get('/orm/corpus/reader').end()
  assert.equal(empty.statusCode, 400)
  assert.match(empty.json().error.message, /citation/)
})

test('M07-04 & M08-05: generic REST and views never expose corpus bytes without a session', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })

  for (const path of ['/orm/corpus_passages', '/orm/corpus_translations', '/orm/corpusPassageOverview']) {
    const res = await app.inject().get(path).end()
    assert.equal(res.statusCode, 401, `${path} must require an admin session`)
    assert.ok(!res.body.includes('وَٱلَّذِينَ'), `${path} leaked Arabic bytes`)
    assert.ok(!res.body.includes('penghuni surga'), `${path} leaked translation bytes`)
  }
})

test('M08-05: rights-unknown edition is metadata-only, including its translations', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })

  const work = (await moonql.model('corpus_works').list({ where: { code: 'quran' } }))[0]!
  const edition = await moonql.model('corpus_editions').create({
    code: 'blocked_private_ms',
    workRef: work.id,
    name: 'Unverified Private Manuscript',
    editorOrPublisher: 'Anonymous Collector',
    rightsStatus: 'RIGHTS_UNKNOWN',
    licenseName: 'Proprietary / Unknown Rights',
  })
  const passage = await moonql.model('corpus_passages').create({
    citationKey: 'TEST 1:1',
    editionRef: edition.id,
    surahNumber: 1,
    ayahNumber: 1,
    arabicText: 'PRIVATE ARABIC BYTES',
  })
  await moonql.model('corpus_translations').create({
    code: 'TEST_1_1_private',
    passageRef: passage.id,
    languageCode: 'id',
    translatorName: 'Private Translator',
    translationText: 'PRIVATE TRANSLATION BYTES',
    rightsStatus: 'RIGHTS_EXACT_VERSION_CLEARED',
    licenseName: 'Private License',
  })

  const res = await app.inject().get('/orm/corpus/reader').query({ citation: 'TEST 1:1' }).end()
  assert.equal(res.statusCode, 200)
  const body = res.json().data
  assert.equal(body.state, 'rights_blocked')
  assert.equal(body.arabic, null)
  assert.equal(body.blockedPlaceholder, '[TEXT_BLOCKED_PENDING_RIGHTS_CLEARANCE]')
  assert.equal(body.citation.rightsStatus, 'RIGHTS_UNKNOWN')
  assert.equal(body.translations[0].text, null)
  assert.equal(body.translations[0].blocked, true)
  assert.ok(!res.body.includes('PRIVATE ARABIC BYTES'))
  assert.ok(!res.body.includes('PRIVATE TRANSLATION BYTES'))
})

test('M08-05: a rights-unknown translation is withheld even on a cleared edition', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })

  const passage = (await moonql.model('corpus_passages').list({ where: { citationKey: 'QS 2:82' } }))[0]!
  await moonql.model('corpus_translations').create({
    code: 'QS_2_82_private',
    passageRef: passage.id,
    languageCode: 'en',
    translatorName: 'Unlicensed Translator',
    translationText: 'PRIVATE ENGLISH BYTES',
    rightsStatus: 'RIGHTS_UNKNOWN',
    licenseName: 'Unknown',
  })

  const res = await app.inject().get('/orm/corpus/reader').query({ citation: 'QS 2:82' }).end()
  assert.equal(res.statusCode, 200)
  const body = res.json().data
  const english = body.translations.find((row: { languageCode: string }) => row.languageCode === 'en')
  assert.equal(english.text, null)
  assert.equal(english.blocked, true)
  assert.ok(!res.body.includes('PRIVATE ENGLISH BYTES'))
  assert.ok(body.translations.some((row: { languageCode: string; text: string | null }) => row.languageCode === 'id' && row.text))
})

test('M08-01: two editions for one address become an explicit ambiguous choice', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })

  const work = (await moonql.model('corpus_works').list({ where: { code: 'quran' } }))[0]!
  const second = await moonql.model('corpus_editions').create({
    code: 'quran_alt_edition',
    workRef: work.id,
    name: 'Alternate Verified Edition',
    editorOrPublisher: 'Test Publisher',
    rightsStatus: 'RIGHTS_EXACT_VERSION_CLEARED',
    licenseName: 'Test License',
    sourceUri: 'https://example.org/alt-quran',
    provenanceSha: 'b'.repeat(64),
  })
  await moonql.model('corpus_passages').create({
    citationKey: 'QS 2:82',
    editionRef: second.id,
    surahNumber: 2,
    ayahNumber: 82,
    arabicText: 'ALTERNATE ARABIC BYTES',
  })

  const ambiguous = await app.inject().get('/orm/corpus/reader').query({ citation: 'QS 2:82' }).end()
  assert.equal(ambiguous.statusCode, 200)
  assert.equal(ambiguous.json().data.state, 'ambiguous')
  assert.equal(ambiguous.json().data.candidates.length, 2)
  assert.equal(ambiguous.json().data.arabic, null)
  assert.ok(!ambiguous.body.includes('ALTERNATE ARABIC BYTES'))
  assert.ok(!ambiguous.body.includes('وَٱلَّذِينَ'))

  const chosen = await app.inject()
    .get('/orm/corpus/reader')
    .query({ citation: 'QS 2:82', edition: 'quran_cairo_hafs' })
    .end()
  assert.equal(chosen.statusCode, 200)
  assert.equal(chosen.json().data.state, 'available')
  assert.equal(chosen.json().data.citation.editionCode, 'quran_cairo_hafs')
  assert.ok(chosen.json().data.arabic.text.includes('وَٱلَّذِينَ'))
})
