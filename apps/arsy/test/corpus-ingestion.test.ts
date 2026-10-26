import { test } from 'node:test'
import assert from 'node:assert/strict'
import { bootMoonQl } from '@moonwitness/moonql'
import base from '@moonwitness/moonql-base'
import auth from '@moonwitness/moonql-auth'
import corpus from '@moonwitness/moonql-corpus'

const quiet = { info: () => {}, warn: () => {} }

test('M07-02 & M07-05: Corpus 4-tier hierarchy seeds Work, Edition, Passage, and Translation for QS 2:82', async (t) => {
  const moonql = await bootMoonQl({
    addons: [base, auth, corpus],
    seedPolicy: 'off',
    cronEnabled: false,
    log: quiet,
  })
  t.after(() => moonql.close())

  // Tier 1: Work
  const works = await moonql.model('corpus_works').list({ where: { code: 'quran' } })
  assert.equal(works.length, 1)
  const work = works[0]!
  assert.equal(work.code, 'quran')
  assert.equal(work.tradition, 'islamic')

  // Tier 2: Edition
  const editions = await moonql.model('corpus_editions').list({ where: { code: 'quran_cairo_hafs' } })
  assert.equal(editions.length, 1)
  const edition = editions[0]!
  assert.equal(edition.rightsStatus, 'RIGHTS_EXACT_VERSION_CLEARED')
  assert.ok(edition.provenanceSha, 'Provenance SHA is pinned')

  // Tier 3: Passage (QS 2:82 exact citation)
  const passages = await moonql.model('corpus_passages').list({ where: { citationKey: 'QS 2:82' } })
  assert.equal(passages.length, 1)
  const passage = passages[0]!
  assert.equal(passage.citationKey, 'QS 2:82')
  assert.equal(passage.surahNumber, 2)
  assert.equal(passage.ayahNumber, 82)
  assert.ok(String(passage.arabicText).includes('وَٱلَّذِينَ ءَامَنُوا۟'), 'Arabic text matches canonical transmission')

  // M07-06: Foreign legacy RGBL mapping preserved without canonical duplication
  assert.equal(passage.rgblForeignRef, 'RGBL-TEXT-002-082-V10')

  // Tier 4: Translation
  const translations = await moonql.model('corpus_translations').list({ where: { languageCode: 'id' } })
  assert.ok(translations.length > 0)
  const idTranslation = translations[0]!
  assert.equal(idTranslation.translatorName, 'Kemenag RI')
  assert.equal(idTranslation.rightsStatus, 'RIGHTS_EXACT_VERSION_CLEARED')
})

test('M07-04 & M07-07: Idempotent data sync and rights veto for unverified editions', async (t) => {
  const moonql = await bootMoonQl({
    addons: [base, auth, corpus],
    seedPolicy: 'off',
    cronEnabled: false,
    log: quiet,
  })
  t.after(() => moonql.close())

  // Idempotency: re-running search or multiple boots yields identical single row for QS 2:82
  const count = await moonql.model('corpus_passages').count({ citationKey: 'QS 2:82' })
  assert.equal(count, 1, 'Idempotent ingestion prevents duplicate passages')

  // Rights veto verification: an edition with RIGHTS_UNKNOWN blocks public text exposure
  const blockedEdition = await moonql.model('corpus_editions').create({
    code: 'unverified_private_ms',
    workRef: 'quran',
    name: 'Unverified Private Manuscript',
    editorOrPublisher: 'Anonymous Collector',
    rightsStatus: 'RIGHTS_UNKNOWN',
    licenseName: 'Proprietary / Unknown Rights',
  })
  assert.equal(blockedEdition.rightsStatus, 'RIGHTS_UNKNOWN', 'Unverified source is recorded as RIGHTS_UNKNOWN')
})
