import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadConfig } from '../src/config.js'
import { buildApp } from '../src/app.js'
import { adminHeaders, withTestAdmin } from './helpers/auth.js'

/**
 * M08-07: the reviewer and the public Reader must describe the SAME source.
 * Reviewers reach the corpus through the admin REST surface (HQ's generic model
 * browser), while readers reach `/corpus/reader`; if those two ever disagree on
 * the edition or its provenance, the vertical slice is broken.
 */
test('M08-07: reviewer admin REST and public Reader agree on QS 2:82 identity', async (t) => {
  withTestAdmin()
  const config = loadConfig()
  config.logLevel = 'silent'
  config.channels.whatsapp.enabled = false
  config.denpa.enabled = false
  config.database.url = ''
  const app = await buildApp(config)
  t.after(() => app.close())
  const headers = await adminHeaders(app)

  const anonymous = await app
    .inject()
    .get('/api/v1/corpus_passages')
    .query({ where: JSON.stringify({ citationKey: 'QS 2:82' }) })
    .end()
  assert.equal(anonymous.statusCode, 401, 'source bytes stay behind an admin session')
  assert.ok(!anonymous.body.includes('وَٱلَّذِينَ'), 'the rejection leaks no Arabic bytes')

  const passages = await app
    .inject()
    .get('/api/v1/corpus_passages')
    .query({ where: JSON.stringify({ citationKey: 'QS 2:82' }), expand: 'editionRef' })
    .headers(headers)
    .end()
  assert.equal(passages.statusCode, 200)
  const rows = passages.json().data as Array<{
    citationKey: string
    arabicText: string
    verifiedAt: string
    editionRefRecord: { code: string; provenanceSha: string; rightsStatus: string; sourceUri: string }
  }>
  assert.equal(rows.length, 1)
  const row = rows[0]!
  assert.equal(row.citationKey, 'QS 2:82')
  assert.ok(row.arabicText.includes('وَٱلَّذِينَ ءَامَنُوا۟'))
  assert.equal(row.editionRefRecord.code, 'quran_cairo_hafs')
  assert.equal(row.editionRefRecord.rightsStatus, 'RIGHTS_EXACT_VERSION_CLEARED')

  const reader = await app.inject().get('/api/v1/corpus/reader').query({ citation: 'QS 2:82' }).end()
  assert.equal(reader.statusCode, 200)
  const publicBody = reader.json().data
  assert.equal(publicBody.state, 'available')
  assert.equal(publicBody.citation.editionCode, row.editionRefRecord.code, 'both layers name the same edition')
  assert.equal(publicBody.citation.provenanceSha, row.editionRefRecord.provenanceSha, 'both layers pin the same version')
  assert.equal(publicBody.citation.sourceUri, row.editionRefRecord.sourceUri)
  assert.equal(publicBody.citation.sourceDate, row.verifiedAt, 'the displayed source date is the reviewer row date')
})
