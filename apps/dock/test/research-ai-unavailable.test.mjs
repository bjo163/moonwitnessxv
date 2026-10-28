/**
 * M21-06 — "No critical path depends on AI inference" for the source/research UI.
 *
 * What this file proves, executably:
 *   1. Positive: with `AI_ENABLED` absent and no AI gateway URL anywhere in the
 *      environment, the Dock Reader and UNILEX Terms data layer (the exact
 *      functions `src/app/reader/page.tsx` and `src/app/terms/page.tsx` await)
 *      returns deterministic, renderable owner content over a real HTTP hop.
 *   2. Negative: an AI-only endpoint is made unreachable and is never contacted;
 *      a hub 503 surfaces as the hub's own message; a closed hub rejects inside a
 *      bounded window and maps to the localized panel notice, not to an AI claim
 *      and not to a hang.
 *   3. No source/research view reads an `aiSummary`-style field, and the Research
 *      route is still the M19-19 withholding notice, so there is nothing for a
 *      model to fabricate.
 *
 * The alias hook exists because the Dock data layer imports through the `@/`
 * TypeScript path alias, which Node's type stripping does not resolve. It maps
 * only `@/` into `apps/dock/src`; every other specifier resolves normally.
 */
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { registerHooks } from 'node:module'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { clearTimeout, setTimeout } from 'node:timers'
import { fileURLToPath, pathToFileURL, URL } from 'node:url'
import test from 'node:test'
import { MoonApiError } from '@moonwitness/moonql-client'
import { getStatesCopy } from '../src/lib/states-copy.ts'

const testDir = dirname(fileURLToPath(import.meta.url))
const appRoot = resolve(testDir, '..')
const srcRoot = resolve(appRoot, 'src')

const sourceOf = (...segments) => readFileSync(resolve(srcRoot, ...segments), 'utf8')

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      return { url: `${pathToFileURL(resolve(srcRoot, specifier.slice(2))).href}.ts`, shortCircuit: true }
    }
    return nextResolve(specifier, context)
  },
})

/* ------------------------------------------------------------------ fixtures */

const PROVENANCE_SHA = 'f'.repeat(64)
const ARABIC = 'Fixture Arabic bytes for QS 2:82 — deterministic, owner-supplied.'
const TRANSLATION = 'Fixture licensed translation for QS 2:82.'

const READER_PAYLOAD = {
  state: 'available',
  message: null,
  citation: {
    key: 'QS 2:82',
    workCode: 'quran',
    workTitle: 'Qur’an',
    originalLanguage: 'ar',
    editionCode: 'quran_cairo_hafs',
    editionName: "Amiri Press Cairo Edition 1924 (Hafs 'an 'Asim)",
    editorOrPublisher: 'Amiri Press',
    rightsStatus: 'CLEARED',
    licenseName: 'PUBLIC_DOMAIN',
    sourceUri: 'https://example.invalid/corpus/qs2-82',
    provenanceSha: PROVENANCE_SHA,
    sourceDate: '1924',
    retrievedAt: '2026-10-27T00:00:00.000Z',
  },
  arabic: { text: ARABIC, language: 'ar', script: 'Arab', direction: 'rtl' },
  translations: [
    {
      languageCode: 'en',
      direction: 'ltr',
      translatorName: 'Fixture translator',
      licenseName: 'PUBLIC_DOMAIN',
      rightsStatus: 'CLEARED',
      text: TRANSLATION,
      blocked: false,
    },
  ],
  candidates: [],
  citationText: 'QS 2:82',
  blockedPlaceholder: null,
}

const BROWSE_PAYLOAD = {
  citation: 'QS 2:82',
  edition: null,
  resolved: true,
  work: { code: 'quran', title: 'Qur’an', originalLanguage: 'ar' },
  works: [{ code: 'quran', title: 'Qur’an', tradition: 'islam', originalLanguage: 'ar', editionCount: 1 }],
  editions: [
    {
      code: 'quran_cairo_hafs',
      name: "Amiri Press Cairo Edition 1924 (Hafs 'an 'Asim)",
      editorOrPublisher: 'Amiri Press',
      rightsStatus: 'CLEARED',
      licenseName: 'PUBLIC_DOMAIN',
      sourceUri: 'https://example.invalid/corpus/qs2-82',
      provenanceSha: PROVENANCE_SHA,
      passageCount: 1,
      cleared: true,
    },
  ],
  passages: [
    { citationKey: 'QS 2:82', surahNumber: 2, ayahNumber: 82, editionCode: 'quran_cairo_hafs', verifiedAt: '2026-10-01', textAvailable: true },
  ],
  translations: [
    { languageCode: 'en', translatorName: 'Fixture translator', licenseName: 'PUBLIC_DOMAIN', rightsStatus: 'CLEARED', editionCode: 'fixture_en', textAvailable: true },
  ],
  // The corpus owner reports the lane from the live registry; it is labelled, not inferred.
  interpretation: {
    available: false,
    reason:
      'INTERPRETATION: LABELED — no commentary/interpretation model is registered in the corpus addon. ' +
      'This row may be labelled "no interpretation layer is wired up" — never "none for this verse".',
  },
  export: { citationAvailable: true, textExportAllowed: false, reason: 'No cleared export licence is recorded.' },
}

const TERMS_PAYLOAD = {
  state: 'ready',
  registry: {
    version: '1.0.0',
    status: 'PINNED',
    seedCount: 2,
    pin: 'fixture-pin',
    path: 'packages/moonql-unilex/src/data/registry.json',
    rawSha256: 'a'.repeat(64),
    notice: 'Fixture registry: pinned, versioned and not a validated universal dictionary.',
    addenda: { version: '1.0.0', ids: [], notice: 'No addenda in the fixture.' },
  },
  filters: { q: '', lane: '', scope: '', status: '', source: '' },
  options: { lanes: ['CORE'], scopes: ['GENERAL'], statuses: ['DRAFT'], sources: [{ code: 'FIXTURE', title: 'Fixture source', sourceType: 'BOOK' }] },
  total: 1,
  offset: 0,
  limit: 12,
  terms: [
    {
      stableId: 'TERM-0001',
      lane: 'CORE',
      kind: 'CONCEPT',
      preferredEn: 'Witness',
      preferredId: 'Saksi',
      definition: 'Fixture definition with an exact recorded source.',
      contextNote: 'Fixture context.',
      editorialStatus: 'DRAFT',
      registryVersion: '1.0.0',
      deprecated: false,
      senses: [],
      forms: [],
      sources: [],
      relations: [],
    },
  ],
}

const TERM_PAYLOAD = {
  state: 'ready',
  registry: TERMS_PAYLOAD.registry,
  term: {
    stableId: 'TERM-0001',
    lane: 'CORE',
    kind: 'CONCEPT',
    preferredEn: 'Witness',
    preferredId: 'Saksi',
    definition: 'Fixture definition with an exact recorded source.',
    contextNote: 'Fixture context.',
    editorialStatus: 'DRAFT',
    registryVersion: '1.0.0',
    deprecationReason: null,
    supersededBy: null,
  },
  forms: [],
  senses: [],
  sources: [],
  relations: [],
  identityReviews: [],
  reviewLog: [],
}

/* ------------------------------------------------------------ fake hub + env */

const hubRequests = []
const aiRequests = []

const json = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json' })
  res.end(JSON.stringify(body))
}

const hub = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1')
  hubRequests.push(`${url.pathname}${url.search}`)

  // Any AI-shaped surface is recorded and answered with a fabricated summary.
  // A passing test proves the source/research path never asks for it.
  if (url.pathname.startsWith('/v1/')) {
    aiRequests.push(url.pathname)
    return json(res, 200, { id: 'chatcmpl-fixture', choices: [{ message: { role: 'assistant', content: 'FABRICATED AI SUMMARY' } }] })
  }

  if (url.pathname === '/api/v1/corpus/reader') {
    const citation = url.searchParams.get('citation')
    if (citation === 'QS 99:99') {
      return json(res, 503, { ok: false, error: { message: 'Corpus projection is unavailable; the owner did not answer.' } })
    }
    return json(res, 200, { ok: true, data: READER_PAYLOAD })
  }
  if (url.pathname === '/api/v1/corpus/browse') return json(res, 200, { ok: true, data: BROWSE_PAYLOAD })
  if (url.pathname === '/api/v1/unilex/terms') return json(res, 200, { ok: true, data: TERMS_PAYLOAD })
  if (url.pathname === '/api/v1/unilex/term') {
    if (url.searchParams.get('stableId') === 'TERM-MISSING') {
      return json(res, 404, { ok: false, error: { message: 'Term not found.' } })
    }
    return json(res, 200, { ok: true, data: TERM_PAYLOAD })
  }
  return json(res, 404, { ok: false, error: { message: `unexpected fixture path ${url.pathname}` } })
})

await new Promise((resolveListen) => hub.listen(0, '127.0.0.1', resolveListen))
const hubBase = `http://127.0.0.1:${hub.address().port}/api/v1`

const savedEnv = {
  RADIO_API_URL: process.env.RADIO_API_URL,
  ARSY_API_URL: process.env.ARSY_API_URL,
  AI_ENABLED: process.env.AI_ENABLED,
  AI_GATEWAY_URL: process.env.AI_GATEWAY_URL,
}
// AI is absent: no opt-in switch and no gateway address in the environment.
delete process.env.AI_ENABLED
delete process.env.AI_GATEWAY_URL
delete process.env.ARSY_API_URL
process.env.RADIO_API_URL = hubBase

// Imported only after the environment is pinned; `src/lib/env.ts` reads
// RADIO_API_URL at module evaluation.
const { readPassage, readBrowse } = await import('../src/data/queries/reader.ts')
const { readTerms, readTerm } = await import('../src/data/queries/terms.ts')

const within = async (promise, ms, label) => {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} did not settle within ${ms}ms`)), ms)
  })
  try {
    return await Promise.race([promise, timeout])
  } finally {
    clearTimeout(timer)
  }
}

test.after(async () => {
  if (hub.listening) await new Promise((done) => hub.close(done))
  for (const [key, value] of Object.entries(savedEnv)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
})

/* -------------------------------------------------------------------- tests */

test('M21-06 positive: Reader returns deterministic, rights-gated source content with AI absent', async () => {
  assert.equal(process.env.AI_ENABLED, undefined, 'the test must run with the AI opt-in absent')
  assert.equal(process.env.AI_GATEWAY_URL, undefined, 'the test must run with no AI gateway address')

  const result = await within(readPassage('QS 2:82'), 3000, 'readPassage')

  assert.equal(result.state, 'available')
  assert.equal(result.citationText, 'QS 2:82')
  assert.equal(result.arabic?.text, ARABIC)
  assert.equal(result.arabic?.direction, 'rtl')
  assert.equal(result.translations.length, 1)
  assert.equal(result.translations[0].text, TRANSLATION)
  assert.equal(result.citation?.editionCode, 'quran_cairo_hafs')
  assert.equal(result.citation?.provenanceSha, PROVENANCE_SHA)
  assert.equal(result.citation?.rightsStatus, 'CLEARED')

  assert.equal(Object.hasOwn(result, 'aiSummary'), false, 'the reader projection carries no AI summary field')
  assert.doesNotMatch(JSON.stringify(result), /FABRICATED AI SUMMARY/)
})

test('M21-06 positive: the Reader contents rail browses the catalog and states the missing lane in words', async () => {
  const browse = await within(readBrowse('QS 2:82'), 3000, 'readBrowse')

  assert.equal(browse.resolved, true)
  assert.equal(browse.work?.code, 'quran')
  assert.equal(browse.works.length, 1)
  assert.equal(browse.editions[0].cleared, true)
  assert.equal(browse.passages[0].citationKey, 'QS 2:82')
  assert.equal(browse.translations[0].textAvailable, true)
  assert.equal(browse.interpretation.available, false)
  assert.match(browse.interpretation.reason, /LABELED/)
  assert.equal(browse.export.textExportAllowed, false)
  assert.ok(browse.export.reason.length > 0)
  assert.doesNotMatch(JSON.stringify(browse), /FABRICATED AI SUMMARY|aiSummary/)
})

test('M21-06 positive: UNILEX Terms and a term detail render from the registry with AI absent', async () => {
  const page = await within(readTerms({ q: 'witness' }), 3000, 'readTerms')
  assert.equal(page.total, 1)
  assert.equal(page.terms[0].stableId, 'TERM-0001')
  assert.equal(page.registry.version, '1.0.0')

  const detail = await within(readTerm('TERM-0001'), 3000, 'readTerm')
  assert.equal(detail?.term.stableId, 'TERM-0001')

  // A missing term is a null for the route (notFound), never a fabricated record.
  assert.equal(await within(readTerm('TERM-MISSING'), 3000, 'readTerm missing'), null)
})

test('M21-06 positive: every request the source/research path made went to the hub owner, none to AI', () => {
  assert.ok(hubRequests.length >= 4, `expected real HTTP hops, saw ${hubRequests.length}`)
  for (const path of hubRequests) {
    assert.match(path, /^\/api\/v1\/(corpus|unilex)\//, `unexpected outbound path ${path}`)
  }
  assert.deepEqual(aiRequests, [], 'the source/research path must never call an AI endpoint')
})

test('M21-06 negative: an unreachable AI gateway cannot block or alter a Reader read', async () => {
  const realFetch = globalThis.fetch
  let aiAttempts = 0
  globalThis.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input?.url ?? String(input)
    if (/aigateway|:3003|chat\/completions/i.test(url)) {
      aiAttempts += 1
      return Promise.reject(new TypeError('fetch failed'))
    }
    return realFetch(input, init)
  }
  try {
    const result = await within(readPassage('QS 2:82'), 3000, 'readPassage with AI down')
    assert.equal(result.citationText, 'QS 2:82')
    assert.equal(aiAttempts, 0, 'no AI gateway request was attempted')
  } finally {
    globalThis.fetch = realFetch
  }
})

test('M21-06 negative: a hub 503 surfaces as the hub message, not as an AI claim', async () => {
  const failure = await readPassage('QS 99:99').then(
    () => assert.fail('a 503 must not resolve as content'),
    (error) => error,
  )
  assert.ok(failure instanceof MoonApiError, `expected MoonApiError, got ${failure?.constructor?.name}`)
  assert.equal(failure.statusCode, 503)

  const { panelErrorMessage } = await import('../src/data/queries/error.ts')
  const message = panelErrorMessage(failure, getStatesCopy('en').errorReaderUnavailable)
  assert.equal(message, 'Corpus projection is unavailable; the owner did not answer.')
  assert.doesNotMatch(message, /\bAI\b|\bmodel\b|\bsummary\b|FABRICATED/i)
})

test('M21-06 negative: a closed hub rejects inside a bounded window and falls back to the localized notice', async () => {
  await new Promise((done) => hub.close(done))

  const failure = await within(
    readPassage('QS 2:82').then(
      () => assert.fail('a closed hub must not resolve'),
      (error) => error,
    ),
    3000,
    'readPassage against a closed hub',
  )
  assert.ok(failure instanceof TypeError, `expected a transport failure, got ${failure?.constructor?.name}`)

  const { panelErrorMessage } = await import('../src/data/queries/error.ts')
  const fallback = getStatesCopy('en').errorReaderUnavailable
  assert.equal(panelErrorMessage(failure, fallback), fallback)
  assert.match(fallback, /could not be loaded|unavailable/i)
  assert.doesNotMatch(fallback, /\bAI\b|\bmodel\b|\bsummary\b|FABRICATED/i)

  const termsFailure = await within(
    readTerms().then(
      () => assert.fail('a closed hub must not resolve'),
      (error) => error,
    ),
    3000,
    'readTerms against a closed hub',
  )
  assert.ok(termsFailure instanceof TypeError)
})

test('M21-06: no source/research route or view reads an AI field or names the AI gateway', () => {
  const files = [
    'app/reader/page.tsx',
    'app/reader/compare/page.tsx',
    'app/research/page.tsx',
    'app/terms/page.tsx',
    'app/terms/[stableId]/page.tsx',
    'data/queries/reader.ts',
    'data/queries/terms.ts',
    'ui/components/reader.tsx',
    'ui/components/reader-rail.tsx',
    'ui/components/terms.tsx',
    'lib/env.ts',
  ]
  for (const file of files) {
    const text = sourceOf(...file.split('/'))
    assert.doesNotMatch(
      text,
      /aigateway|AI_ENABLED|chat\/completions|aiSummary|OPENAI|OLLAMA|:3003/,
      `${file} must not depend on AI inference`,
    )
  }
  // The public Research route is still the M19-19 withholding notice: there is
  // no AI-derived claim on screen to be taken as fact.
  const research = sourceOf('app', 'research', 'page.tsx')
  assert.match(research, /<Alert tone="hot">\{copy\.errorResearchUnavailable\}<\/Alert>/)
  assert.doesNotMatch(research, /serverClient|ResearchExplorer|readResearch/)
  // The reader and terms routes keep an error boundary around every owner read.
  const readerPage = sourceOf('app', 'reader', 'page.tsx')
  assert.match(readerPage, /readPanel<ReaderResult>/)
  assert.match(readerPage, /panelErrorMessage\(err, copy\.errorReaderUnavailable\)/)
  const termsPage = sourceOf('app', 'terms', 'page.tsx')
  assert.match(termsPage, /readPanel<TermsPage>/)
  assert.match(termsPage, /panelErrorMessage\(err, copy\.errorTermsUnavailable\)/)
})
