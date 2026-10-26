import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify from 'fastify'
import { bootMoonQl, moonqlRest } from '@moonwitness/moonql'
import base from '@moonwitness/moonql-base'
import auth from '@moonwitness/moonql-auth'
import corpus from '@moonwitness/moonql-corpus'
import envelope from '../src/plugins/envelope.js'

/**
 * M08-07: the Reader vertical slice against real PostgreSQL — the same source
 * identity (work → edition → passage → translation) must survive the SQL engine,
 * and a rights-unknown edition must stay metadata-only there too.
 *
 * Runs only when a disposable database is handed in (CI has none):
 *   PARITY_DATABASE_URL=postgres://... pnpm --filter @moonwitness/radio test
 */
const DB_URL = process.env.PARITY_DATABASE_URL ?? process.env.DATABASE_URL ?? ''
const quiet = { info: () => {}, warn: () => {} }

test(
  'M08-07: QS 2:82 keeps its source identity and rights veto on PostgreSQL',
  { skip: DB_URL ? false : 'no PARITY_DATABASE_URL/DATABASE_URL — the PG slice needs a server' },
  async (t) => {
    const moonql = await bootMoonQl({
      databaseUrl: DB_URL,
      addons: [base, auth, corpus],
      seedPolicy: 'off',
      cronEnabled: false,
      log: quiet,
    })
    const app = Fastify({ logger: false })
    await app.register(envelope)
    await app.register(moonqlRest, { prefix: '/orm', instance: moonql })
    await app.ready()

    const unique = `m08_${Date.now()}`
    t.after(async () => {
      await moonql.model('corpus_translations').removeWhere({ code: `${unique}_tr` })
      await moonql.model('corpus_passages').removeWhere({ citationKey: `${unique} 1:1` })
      await moonql.model('corpus_editions').removeWhere({ code: `${unique}_ed` })
      await app.close()
      await moonql.close()
    })

    assert.equal(moonql.engine, 'pg', 'this drill must not silently fall back to memory')

    const res = await app.inject().get('/orm/corpus/reader').query({ citation: 'QS 2:82' }).end()
    assert.equal(res.statusCode, 200)
    const body = res.json().data
    assert.equal(body.state, 'available')
    assert.equal(body.citation.key, 'QS 2:82')
    assert.equal(body.citation.workTitle, "Al-Qur'an al-Karim")
    assert.equal(body.citation.editionCode, 'quran_cairo_hafs')
    assert.equal(body.citation.rightsStatus, 'RIGHTS_EXACT_VERSION_CLEARED')
    assert.match(body.citation.provenanceSha, /^[a-f0-9]{64}$/)
    assert.equal(body.citation.sourceDate, '2026-10-26T00:00:00.000Z')
    assert.ok(body.arabic.text.includes('وَٱلَّذِينَ ءَامَنُوا۟'))
    const indonesian = body.translations.find((row: { languageCode: string }) => row.languageCode === 'id')
    assert.ok(indonesian, 'the licensed Indonesian translation survives the SQL join')
    assert.ok(indonesian.text.includes('penghuni surga'))

    const locked = await app.inject().get('/orm/corpus_passages').end()
    assert.equal(locked.statusCode, 401, 'raw passage bytes stay admin-only on pg')

    const works = await moonql.model('corpus_works').list({ where: { code: 'quran' } })
    const work = works[0]!
    const edition = await moonql.model('corpus_editions').create({
      code: `${unique}_ed`,
      workRef: work.id,
      name: 'M08 Unverified Edition',
      editorOrPublisher: 'Drill',
      rightsStatus: 'RIGHTS_UNKNOWN',
      licenseName: 'Unknown',
    })
    const passage = await moonql.model('corpus_passages').create({
      citationKey: `${unique} 1:1`,
      editionRef: edition.id,
      surahNumber: 1,
      ayahNumber: 1,
      arabicText: 'PRIVATE PG ARABIC BYTES',
    })
    await moonql.model('corpus_translations').create({
      code: `${unique}_tr`,
      passageRef: passage.id,
      languageCode: 'id',
      translatorName: 'Private PG Translator',
      translationText: 'PRIVATE PG TRANSLATION BYTES',
      rightsStatus: 'RIGHTS_EXACT_VERSION_CLEARED',
      licenseName: 'Private',
    })

    const blocked = await app.inject().get('/orm/corpus/reader').query({ citation: `${unique} 1:1` }).end()
    assert.equal(blocked.statusCode, 200)
    const blockedBody = blocked.json().data
    assert.equal(blockedBody.state, 'rights_blocked')
    assert.equal(blockedBody.arabic, null)
    assert.equal(blockedBody.citation.rightsStatus, 'RIGHTS_UNKNOWN')
    assert.equal(blockedBody.translations[0].text, null)
    assert.equal(blockedBody.blockedPlaceholder, '[TEXT_BLOCKED_PENDING_RIGHTS_CLEARANCE]')
    assert.ok(!blocked.body.includes('PRIVATE PG ARABIC BYTES'))
    assert.ok(!blocked.body.includes('PRIVATE PG TRANSLATION BYTES'))

    const missing = await app.inject().get('/orm/corpus/reader').query({ citation: 'QS 99:1' }).end()
    assert.equal(missing.statusCode, 200)
    assert.equal(missing.json().data.state, 'absent')
    assert.equal(missing.json().data.arabic, null)
  },
)
