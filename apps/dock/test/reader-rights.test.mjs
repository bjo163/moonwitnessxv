import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const appDir = path.resolve(testDir, '..')
const readerSource = fs.readFileSync(
  path.resolve(appDir, 'src', 'ui', 'components', 'reader.tsx'),
  'utf8',
)
const readerPage = fs.readFileSync(
  path.resolve(appDir, 'src', 'app', 'reader', 'page.tsx'),
  'utf8',
)

test('a rights-blocked result can never render passage text', () => {
  assert.match(
    readerSource,
    /const withheld = result\.state === 'rights_blocked'/,
    'the renderer must derive a withheld flag from the reader state',
  )
  assert.match(
    readerSource,
    /\{!withheld && result\.arabic \? \(/,
    'the Arabic block must be guarded by the withheld flag, not only by null data',
  )
  assert.match(
    readerSource,
    /\{row\.text && !withheld \? \(/,
    'licenced translations must be guarded by the withheld flag',
  )
  assert.match(readerSource, /<Alert tone="hot">/, 'the denial must be stated in words')
})

test('provenance names edition, rights and hash without hiding them behind a dialog', () => {
  assert.match(readerSource, /className="dk-reader-provenance-strip"/)
  assert.match(readerSource, /Edition <strong>\{source\?\.editionCode \?\? 'UNRESOLVED'\}<\/strong>/)
  assert.match(readerSource, /rightsLabel\(source\?\.rightsStatus \?\? 'RIGHTS_UNKNOWN'\)/)
  assert.match(readerSource, /SHA <code>\{provenanceShort\}<\/code>/)
  assert.match(readerSource, /provenanceShort = source\?\.provenanceSha \? source\.provenanceSha\.slice\(0, 12\)/)
})

test('the full provenance record is a native disclosure with a visible focus ring', () => {
  assert.match(readerSource, /<details className="dk-provenance">/)
  assert.match(readerSource, /<summary>Full provenance, licence and retrieval record<\/summary>/)
  const css = fs.readFileSync(path.resolve(appDir, 'src', 'app', 'globals.css'), 'utf8')
  assert.match(css, /\.dk-provenance > summary:focus-visible \{[^}]*outline: 2px solid var\(--cyan\)/)
})

test('source language and direction stay on the source text', () => {
  assert.match(readerSource, /lang=\{result\.arabic\.language\} dir=\{result\.arabic\.direction\}/)
  assert.match(readerSource, /dir=\{row\.languageCode === 'ar' \? 'rtl' : 'ltr'\}/)
})

test('the reader header names the requested citation when it is not the default', () => {
  assert.match(readerPage, /citation === DEFAULT_CITATION && !edition/)
  assert.match(readerPage, /\$\{citation\}/)
})
