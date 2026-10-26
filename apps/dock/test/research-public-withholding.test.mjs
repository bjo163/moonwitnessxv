import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import test from 'node:test'
import { getStatesCopy } from '../src/lib/states-copy.ts'

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pageSource = readFileSync(resolve(appRoot, 'src/app/research/page.tsx'), 'utf8')

test('M19-19 public Research page withholds raw records and renders the D08 notice', () => {
  assert.doesNotMatch(pageSource, /readResearchRegistry|ResearchExplorer|serverClient|\.model\(/)
  assert.doesNotMatch(pageSource, /research_(?:cases|frames|witnesses|hypotheses)/)
  assert.match(pageSource, /<Alert tone="hot">\{copy\.errorResearchUnavailable\}<\/Alert>/)
})

test('M19-19 withholding notice is explicit and localized in both supported languages', () => {
  assert.equal(
    getStatesCopy('en').errorResearchUnavailable,
    'The research ledger is withheld until an approved D08 public projection is available.',
  )
  assert.equal(
    getStatesCopy('id').errorResearchUnavailable,
    'Buku besar penelitian ditahan sampai proyeksi publik D08 yang disetujui tersedia.',
  )
})
