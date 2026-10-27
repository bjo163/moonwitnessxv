/**
 * M08-06 drill: render the Reader without a browser and check the parts that
 * carry meaning for assistive tech and small screens — RTL/lang attributes,
 * keyboard-focusable citation controls, labelled states, responsive CSS.
 *
 * Run from apps/dock:
 *   node ../radio/node_modules/tsx/dist/cli.mjs scripts/verify-reader-ui.tsx
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { ReaderView } from '../src/ui/components/reader'
import { getStatesCopy } from '../src/lib/states-copy'
import type { ReaderResult } from '../src/data/queries/reader'

const ARABIC = 'وَٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّـٰلِحَـٰتِ'
const TRANSLATION = 'Adapun orang-orang yang beriman dan beramal saleh'

const source = {
  key: 'QS 2:82',
  workCode: 'quran',
  workTitle: "Al-Qur'an al-Karim",
  originalLanguage: 'ar',
  editionCode: 'quran_cairo_hafs',
  editionName: "Amiri Press Cairo Edition 1924 (Hafs 'an 'Asim)",
  editorOrPublisher: 'Al-Azhar / Egyptian Royal Survey',
  rightsStatus: 'RIGHTS_EXACT_VERSION_CLEARED',
  licenseName: 'Public Domain / Verified Recitation Transmission',
  sourceUri: 'https://archive.org/details/cairo-quran-1924',
  provenanceSha: 'c0a8f1e72b4d912a76f2b48911efd910a34b22c7a9182314ef821901abcf8912',
  sourceDate: '2026-10-26T00:00:00.000Z',
  retrievedAt: '2026-10-26T03:00:00.000Z',
} as const

const available: ReaderResult = {
  state: 'available',
  message: null,
  citation: source,
  arabic: { text: ARABIC, language: 'ar', script: 'Arab', direction: 'rtl' },
  translations: [
    {
      languageCode: 'id',
      translatorName: 'Kemenag RI',
      licenseName: 'Public Domain / Open Translation',
      rightsStatus: 'RIGHTS_EXACT_VERSION_CLEARED',
      text: TRANSLATION,
      blocked: false,
    },
    {
      languageCode: 'en',
      translatorName: 'Unlicensed Translator',
      licenseName: 'Unknown',
      rightsStatus: 'RIGHTS_UNKNOWN',
      text: null,
      blocked: true,
    },
  ],
  candidates: [],
  citationText:
    'QS 2:82 · Al-Qur\'an al-Karim · Amiri Press Cairo Edition 1924 [quran_cairo_hafs] · rights=RIGHTS_EXACT_VERSION_CLEARED · provenance=c0a8f1e7 · source-date=2026-10-26T00:00:00.000Z · retrieved=2026-10-26T03:00:00.000Z',
  blockedPlaceholder: null,
}

const blocked: ReaderResult = {
  state: 'rights_blocked',
  message: 'Text withheld: edition rights are RIGHTS_UNKNOWN.',
  citation: { ...source, key: 'TEST 1:1', rightsStatus: 'RIGHTS_UNKNOWN', licenseName: 'Proprietary / Unknown Rights' },
  arabic: null,
  translations: [
    {
      languageCode: 'id',
      translatorName: 'Private Translator',
      licenseName: 'Private License',
      rightsStatus: 'RIGHTS_EXACT_VERSION_CLEARED',
      text: null,
      blocked: true,
    },
  ],
  candidates: [],
  citationText: 'TEST 1:1 · rights=RIGHTS_UNKNOWN',
  blockedPlaceholder: '[TEXT_BLOCKED_PENDING_RIGHTS_CLEARANCE]',
}

const absent: ReaderResult = {
  state: 'absent',
  message: 'No passage is indexed for "QS 99:1".',
  citation: null,
  arabic: null,
  translations: [],
  candidates: [],
  citationText: null,
}

const ambiguous: ReaderResult = {
  state: 'ambiguous',
  message: '"QS 2:82" exists in more than one edition; choose one to continue.',
  citation: null,
  arabic: null,
  translations: [],
  candidates: [
    {
      citationKey: 'QS 2:82',
      workCode: 'quran',
      workTitle: "Al-Qur'an al-Karim",
      originalLanguage: 'ar',
      editionCode: 'quran_cairo_hafs',
      editionName: source.editionName,
      editorOrPublisher: source.editorOrPublisher,
      rightsStatus: 'RIGHTS_EXACT_VERSION_CLEARED',
      licenseName: source.licenseName,
      sourceUri: source.sourceUri,
      provenanceSha: source.provenanceSha,
    },
    {
      citationKey: 'QS 2:82',
      workCode: 'quran',
      workTitle: "Al-Qur'an al-Karim",
      originalLanguage: 'ar',
      editionCode: 'quran_alt_edition',
      editionName: 'Alternate Verified Edition',
      editorOrPublisher: 'Test Publisher',
      rightsStatus: 'RIGHTS_EXACT_VERSION_CLEARED',
      licenseName: 'Test License',
      sourceUri: 'https://example.org/alt-quran',
      provenanceSha: 'b'.repeat(64),
    },
  ],
  citationText: null,
}

const render = (result: ReaderResult, citation = 'QS 2:82'): string =>
  renderToStaticMarkup(<ReaderView result={result} citation={citation} copy={getStatesCopy('en')} />)

let checks = 0
function must(condition: boolean, label: string): void {
  assert.ok(condition, label)
  checks++
  console.info(`PASS ${label}`)
}

// ---- available: RTL/language, labels, keyboard, citation controls ----------
const availableHtml = render(available)
const arabicTag = /<p[^>]*class="dk-reader-arabic"[^>]*>/.exec(availableHtml)?.[0] ?? ''
must(arabicTag.includes('lang="ar"'), 'Arabic text carries lang="ar"')
must(arabicTag.includes('dir="rtl"'), 'Arabic text carries dir="rtl"')
must(availableHtml.includes(TRANSLATION), 'licensed Indonesian translation is rendered')
must(/<p[^>]*lang="id"[^>]*>/.test(availableHtml), 'Indonesian translation carries lang="id"')
must(!/<p[^>]*lang="en"[^>]*>/.test(availableHtml), 'blocked English translation renders no text node')
must(
  /<button[^>]*aria-label="Copy citation for QS 2:82"[^>]*>/.test(availableHtml),
  'copy citation control is a labelled button',
)
const preTag = /<pre[^>]*>/.exec(availableHtml)?.[0] ?? ''
must(preTag.includes('tabindex="0"'), 'citation block is keyboard-focusable')
must(availableHtml.includes('c0a8f1e72b4d912a76f2b48911efd910a34b22c7a9182314ef821901abcf8912'), 'provenance version is visible')
must(availableHtml.includes('2026-10-26T00:00:00.000Z'), 'source date is visible')
must(availableHtml.includes('aria-labelledby="reader-arabic-heading"'), 'Arabic section is labelled for assistive tech')
must(availableHtml.includes('aria-labelledby="reader-translations-heading"'), 'translation section is labelled for assistive tech')

// ---- rights blocked: metadata only, explicit placeholder -------------------
const blockedHtml = render(blocked, 'TEST 1:1')
must(blockedHtml.includes('[TEXT_BLOCKED_PENDING_RIGHTS_CLEARANCE]'), 'blocked state shows the explicit placeholder')
must(!blockedHtml.includes('dk-reader-arabic'), 'blocked state renders no Arabic text element')
must(blockedHtml.includes('Private Translator'), 'blocked translation metadata stays visible')
must(blockedHtml.includes('Translation withheld'), 'blocked translation explains the veto')
must(
  /role="note"[^>]*aria-label="Arabic text withheld pending rights clearance"/.test(blockedHtml),
  'blocked text region is announced as a note',
)
must(blockedHtml.includes('Rights unknown'), 'blocked state names the permission status')

// ---- absent/ambiguous: never invent a verse -------------------------------
const absentHtml = render(absent, 'QS 99:1')
must(absentHtml.includes('No passage is indexed'), 'absent state says no passage is indexed')
must(absentHtml.includes('never fills a gap with an invented verse'), 'absent state states the no-invention rule')
must(!absentHtml.includes('dk-reader-arabic'), 'absent state renders no Arabic element')

const ambiguousHtml = render(ambiguous)
const candidateLinks = ambiguousHtml.match(/<a[^>]*class="dk-reader-candidate"[^>]*>/g) ?? []
must(candidateLinks.length === 2, 'ambiguous state offers both editions as choices')
must(
  candidateLinks.some((link) => link.includes('edition=quran_alt_edition')),
  'candidate link carries the edition selector',
)
must(!ambiguousHtml.includes(ARABIC), 'ambiguous state exposes no text before a choice')

// ---- responsive CSS and nav entry -----------------------------------------
const css = readFileSync(new URL('../src/app/globals.css', import.meta.url), 'utf8')
must(css.includes('@media (max-width: 900px)'), 'Reader defines a small-screen breakpoint')
must(/\.dk-reader-grid\s*{[^}]*grid-template-columns:\s*1fr/s.test(css), 'Reader grid collapses to one column on mobile')
must(/\.dk-reader-candidate:focus-visible/.test(css), 'candidate links have a visible keyboard focus style')
must(/\.dk-reader-citation:focus-visible/.test(css), 'citation block has a visible keyboard focus style')

const shell = readFileSync(new URL('../src/ui/components/shell.tsx', import.meta.url), 'utf8')
must(shell.includes('href="/reader"') && shell.includes('READER'), 'public navigation links to the Reader')

console.info(`\nReader UI drill: ${checks} checks passed.`)
