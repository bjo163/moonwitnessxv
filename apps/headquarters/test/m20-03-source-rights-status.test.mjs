import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'

const dashboardPath = resolve(dirname(fileURLToPath(import.meta.url)), '../src/app/(admin)/page.tsx')

async function loadPagePolicy(name, nextName, signature) {
  const source = await readFile(dashboardPath, 'utf8')
  const start = source.indexOf(`export const ${name} =`)
  const end = source.indexOf(`export const ${nextName} =`, start)
  assert.ok(start >= 0 && end > start, `${name} source policy exists`)
  const code = source.slice(start, end).replace(/^export /m, '').replace(signature, '(status, locale) =>')
  const context = {}
  runInNewContext(`${code}\nthis.policy = ${name}`, context)
  return context.policy
}

const rightsPolicy = () => loadPagePolicy(
  'sourceRightsLabel',
  'sourceReviewLabel',
  "(status: unknown, locale: Locale): { label: string; tone: 'ok' | 'hot' | 'night' } =>",
)

const reviewPolicy = async () => {
  const source = await readFile(dashboardPath, 'utf8')
  const start = source.indexOf('export const sourceReviewLabel =')
  const end = source.indexOf('\nfunction SourceRightsPanel', start)
  assert.ok(start >= 0 && end > start, 'source review policy exists')
  const code = source.slice(start, end)
    .replace(/^export /m, '')
    .replace('(provenanceSha: unknown, locale: Locale): string =>', '(provenanceSha, locale) =>')
  const context = {}
  runInNewContext(`${code}\nthis.policy = sourceReviewLabel`, context)
  return context.policy
}

void test('HQ source status reads the real D01 edition inventory only after its schema ACL check', async () => {
  const source = await readFile(dashboardPath, 'utf8')
  const schemaIndex = source.indexOf("const sourceModel = doc.models.corpus_editions")
  const aclIndex = source.indexOf("guardModel(sourceModel, 'list')", schemaIndex)
  const queryIndex = source.indexOf("listRecords('corpus_editions'", schemaIndex)

  assert.ok(schemaIndex >= 0, 'the dashboard selects the D01 corpus edition model')
  assert.ok(aclIndex > schemaIndex, 'the page asks the existing HQ guard for list access')
  assert.ok(queryIndex > aclIndex, 'edition rows are fetched after the model ACL check')
  assert.match(source, /rows=\{sources\.rows\}/, 'the table renders fetched model rows, not hand-authored source records')
  assert.match(source, /D01 does not store a review or publication status/)
})

void test('only exact-version clearance is release eligible; all other and unknown rights fail closed', async () => {
  const sourceRightsLabel = await rightsPolicy()
  const cleared = sourceRightsLabel('RIGHTS_EXACT_VERSION_CLEARED', 'en')
  assert.equal(cleared.label, 'Exact-version rights cleared · release eligible')
  assert.equal(cleared.tone, 'ok')
  assert.equal(sourceRightsLabel('METADATA_ONLY', 'en').label, 'Metadata only · text withheld')
  assert.equal(sourceRightsLabel('RIGHTS_UNKNOWN', 'en').label, 'Rights unknown · text withheld')
  assert.equal(sourceRightsLabel('RESTRICTED', 'en').label, 'Restricted · text withheld')
  for (const unknownStatus of ['PUBLIC_DOMAIN', 'UNRECOGNIZED', null, undefined]) {
    const status = sourceRightsLabel(unknownStatus, 'en')
    assert.match(status.label, /text withheld/i, `${String(unknownStatus)} is never release eligible`)
    assert.notEqual(status.tone, 'ok')
  }
  assert.match(sourceRightsLabel('RIGHTS_EXACT_VERSION_CLEARED', 'id').label, /Hak versi persis jelas/)
  assert.match(sourceRightsLabel('METADATA_ONLY', 'id').label, /Metadata saja · teks ditahan/)
})

void test('provenance digest is not treated as a review or publication decision', async () => {
  const sourceReviewLabel = await reviewPolicy()
  assert.match(sourceReviewLabel('a'.repeat(64), 'en'), /digest present; D01 does not record a review or publication decision/i)
  assert.match(sourceReviewLabel(null, 'en'), /no provenance digest; D01 does not record/i)
  assert.match(sourceReviewLabel('not-a-digest', 'id'), /Digest provenance tidak tersedia/)
  assert.match(sourceReviewLabel('b'.repeat(64), 'id'), /keputusan review\/rilis tidak dicatat di model D01/)
})
