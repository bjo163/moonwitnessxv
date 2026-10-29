/**
 * M19-05 rendered Reader contract. Fixtures are synthetic Unicode only; this
 * test does not load Hub data or scripture, translation, or witness material.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import { renderToStaticMarkup } from 'react-dom/server'
import { ReaderView } from '../src/ui/components/reader'
import type { ReaderResult } from '../src/data/queries/reader'
import { getStatesCopy } from '../src/lib/states-copy'

const arabic = String.fromCodePoint(0x0627, 0x064e, 0x0628, 0x0650, 0x062a, 0x064f)
const hebrew = String.fromCodePoint(0x05d0, 0x05b7, 0x05d1, 0x05b4, 0x05d2, 0x05b9)
const greek = String.fromCodePoint(0x03b1, 0x0313, 0x03b2, 0x03b3, 0x0301)
const unknownDirection = String.fromCodePoint(0x05e9, 0x05b8, 0x05dc, 0x05d5, 0x05dd)
const markCount = (value: string): number => [...value].filter((character) => /\p{M}/u.test(character)).length
const testDir = dirname(fileURLToPath(import.meta.url))
const readerStyles = readFileSync(resolve(testDir, '../src/app/globals.css'), 'utf8')

const result: ReaderResult = {
  state: 'available',
  message: null,
  citation: null,
  arabic: { text: arabic, language: 'ar', script: 'Arab', direction: 'rtl' },
  translations: [
    {
      languageCode: 'he',
      direction: 'rtl',
      translatorName: 'Synthetic fixture',
      licenseName: 'Test-only Unicode fixture',
      rightsStatus: 'SYNTHETIC_TEST_FIXTURE',
      text: hebrew,
      blocked: false,
    },
    {
      languageCode: 'el',
      direction: 'ltr',
      translatorName: 'Synthetic fixture',
      licenseName: 'Test-only Unicode fixture',
      rightsStatus: 'SYNTHETIC_TEST_FIXTURE',
      text: greek,
      blocked: false,
    },
    {
      languageCode: 'he',
      direction: null,
      translatorName: 'Synthetic direction-unknown fixture',
      licenseName: 'Test-only Unicode fixture',
      rightsStatus: 'SYNTHETIC_TEST_FIXTURE',
      text: unknownDirection,
      blocked: false,
    },
  ],
  candidates: [],
  citationText: null,
}

const markup = renderToStaticMarkup(
  <ReaderView result={result} citation="SYNTHETIC TEST ONLY" copy={getStatesCopy('en')} />,
)

void test('M19-05 Reader SSR preserves script text, marks, language and direction', () => {
  assert.match(markup, new RegExp(`<p class="dk-reader-arabic" lang="ar" dir="rtl">${arabic}</p>`))
  assert.match(markup, new RegExp(`<p lang="he" dir="rtl">${hebrew}</p>`))
  assert.match(markup, new RegExp(`<p lang="el" dir="ltr">${greek}</p>`))

  for (const sample of [arabic, hebrew, greek]) {
    const rendered = markup.match(new RegExp(`>${sample}</p>`))?.[0]
    assert.ok(rendered, 'each synthetic script sample must appear as a rendered paragraph')
    assert.equal(markCount(rendered), markCount(sample))
  }
})

void test('M19-05 unknown translation direction stays auto, not a guessed ltr', () => {
  assert.match(markup, new RegExp(`<p lang="he" dir="auto">${unknownDirection}</p>`))
  assert.doesNotMatch(markup, new RegExp(`<p lang="he" dir="ltr">${unknownDirection}</p>`))
})

void test('M19-05 rendered fixtures require no hidden bidi controls or HTML entities', () => {
  assert.doesNotMatch(markup, /[\u202a-\u202e\u2066-\u2069]/)
  assert.doesNotMatch(markup, /&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,7}|#x[0-9a-fA-F]{1,6});/)
})

void test('M19-05 browser applies native RTL/LTR direction and Dock aligns the Arabic source', async () => {
  const arabicRule = readerStyles.match(/\.dk-reader-arabic\s*\{[^}]*\}/s)?.[0]
  assert.ok(arabicRule, 'the production reader stylesheet must define Arabic alignment')
  assert.match(arabicRule, /text-align:\s*right/)

  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    await page.setContent(`<style>${arabicRule}</style>${markup}`)

    const paragraphs = await page.locator('p').evaluateAll((elements) =>
      elements.map((element) => ({
        lang: element.getAttribute('lang'),
        direction: getComputedStyle(element).direction,
        textAlign: getComputedStyle(element).textAlign,
        text: element.textContent,
      })),
    )
    const arabicParagraph = paragraphs.find((paragraph) => paragraph.text === arabic)
    const hebrewParagraph = paragraphs.find((paragraph) => paragraph.text === hebrew)
    const greekParagraph = paragraphs.find((paragraph) => paragraph.text === greek)
    const unknownParagraph = paragraphs.find((paragraph) => paragraph.text === unknownDirection)

    assert.deepEqual(
      [arabicParagraph?.lang, arabicParagraph?.direction, arabicParagraph?.textAlign],
      ['ar', 'rtl', 'right'],
    )
    assert.deepEqual([hebrewParagraph?.lang, hebrewParagraph?.direction], ['he', 'rtl'])
    assert.deepEqual([greekParagraph?.lang, greekParagraph?.direction], ['el', 'ltr'])
    assert.deepEqual([unknownParagraph?.lang, unknownParagraph?.direction], ['he', 'rtl'])
  } finally {
    await browser.close()
  }
})
