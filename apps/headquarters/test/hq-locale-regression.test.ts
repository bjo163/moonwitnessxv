import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { registerHooks } from 'node:module'
import { dirname, resolve } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Locale } from '@moonwitness/core'
import type { ModelMeta } from '@moonwitness/moonql-client'

const testDir = dirname(fileURLToPath(import.meta.url))
const srcDir = resolve(testDir, '..', 'src')
const hqCss = readFileSync(resolve(srcDir, 'app', 'globals.css'), 'utf8')
const headersFixtureUrl = pathToFileURL(resolve(testDir, 'fixtures', 'next-headers-stub.mjs')).href

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'next/headers') return { url: headersFixtureUrl, shortCircuit: true, format: 'module' }
    if (specifier.startsWith('@/')) {
      const rest = specifier.slice(2)
      for (const extension of ['.ts', '.tsx', '.mjs', '.js', ''] as const) {
        const candidate = resolve(srcDir, `${rest}${extension}`)
        if (existsSync(candidate)) return { url: pathToFileURL(candidate).href, shortCircuit: true, format: 'module' }
      }
      throw new Error(`HQ locale regression resolver: ${specifier} is outside the Headquarters source tree`)
    }
    return nextResolve(specifier, context)
  },
})

interface SyntheticRequest {
  sessionCookie: string | null
  acceptLanguage: string | null
}

const requestScope = globalThis as typeof globalThis & { __HQ_TEST_REQUEST__?: SyntheticRequest; React?: typeof React }
requestScope.React = React
requestScope.__HQ_TEST_REQUEST__ = { sessionCookie: null, acceptLanguage: null }

const meta = {
  label: 'Sample record',
  addon: 'sample-addon',
  route: '/sample',
  operations: { list: true, get: true, create: true, update: true, remove: false },
  delete: 'soft',
  unique: [],
  maxLimit: 25,
  dataTier: 'demo',
  acl: { list: 'auth', get: 'auth', create: 'admin', update: 'admin', remove: 'none' },
  fields: {
    title: { kind: 'text', required: true },
    description: { kind: 'text', required: false },
  },
  createSchema: { properties: { title: { type: 'string' }, description: { type: 'string' } }, required: ['title'] },
  updateSchema: { properties: { title: { type: 'string' }, description: { type: 'string' } }, required: ['title'] },
  readSchema: { properties: { title: { type: 'string' }, description: { type: 'string' } } },
} as unknown as ModelMeta

async function modules() {
  const [{ default: LoginPage }, { AccessDenied }, { RecordForm }, { ModelTable }, { LiveAlert }, copy] = await Promise.all([
    import('../src/app/login/page.js'),
    import('../src/ui/widgets/AccessDenied.js'),
    import('../src/ui/widgets/RecordForm.js'),
    import('../src/ui/widgets/ModelTable.js'),
    import('../src/ui/LiveAlert.js'),
    import('../src/app/(admin)/models/locale-copy.js'),
  ])
  return { LoginPage, AccessDenied, RecordForm, ModelTable, LiveAlert, ...copy }
}

void test('HQ localized login, denial, empty and error states, and model fields render in both supported locales', async () => {
  const { LoginPage, AccessDenied, RecordForm, ModelTable, LiveAlert, editorFailureMessage, modelViewCopy } = await modules()

  assert.match(hqCss, /a:focus-visible/)
  assert.match(hqCss, /input\.m-input:focus-visible,[\s\S]*?outline:\s*3px solid var\(--accent\)/)
  assert.match(hqCss, /\.m-toggle input:focus-visible/)
  const reducedMotion = hqCss.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\}/)?.[1]
  assert.ok(reducedMotion, 'HQ must define reduced-motion behavior')
  assert.match(reducedMotion, /animation-duration:\s*0\.01ms\s*!important/)
  assert.match(reducedMotion, /transition-duration:\s*0\.01ms\s*!important/)
  assert.match(reducedMotion, /scroll-behavior:\s*auto\s*!important/)

  for (const locale of ['en', 'id'] as const satisfies readonly Locale[]) {
    requestScope.__HQ_TEST_REQUEST__ = { sessionCookie: null, acceptLanguage: locale }

    const loginNode = await LoginPage({ searchParams: Promise.resolve({ next: '/models/SampleRecord?q=synthetic' }) })
    const loginHtml = renderToStaticMarkup(loginNode)
    assert.match(loginHtml, /<form[^>]*action="\/api\/session"/)
    assert.match(loginHtml, /name="next" value="\/models\/SampleRecord\?q=synthetic"/)
    assert.match(loginHtml, locale === 'en' ? /Email or username/ : /Email atau nama pengguna/)
    assert.match(loginHtml, locale === 'en' ? /English/ : /Bahasa Indonesia/)

    const loginErrorHtml = renderToStaticMarkup(
      await LoginPage({ searchParams: Promise.resolve({ error: 'expired' }) }),
    )
    assert.match(loginErrorHtml, /role="alert"/)

    const denialHtml = renderToStaticMarkup(await AccessDenied({ code: 'forbidden' }))
    assert.match(denialHtml, /role="alert"/)
    assert.match(denialHtml, locale === 'en' ? /Not authorized/ : /Tidak berwenang/)
    assert.match(denialHtml, locale === 'en' ? /No records were loaded/ : /Tidak ada data yang dimuat/)
    assert.doesNotMatch(denialHtml, /synthetic-session|hq_token|user-synthetic/)

    const copy = modelViewCopy(locale)
    const formHtml = renderToStaticMarkup(
      React.createElement(RecordForm, {
        model: 'SampleRecord',
        meta,
        mode: 'create',
        action: () => undefined,
        error: editorFailureMessage(locale, 'invalid') ?? undefined,
        locale,
      }),
    )
    assert.match(formHtml, locale === 'en' ? /Create sample record/ : /Buat sample record/)
    assert.match(formHtml, locale === 'en' ? /The request was not accepted/ : /Permintaan tidak diterima/)
    assert.match(formHtml, /role="alert"/)
    assert.match(formHtml, /name="title::text"/)
    assert.match(formHtml, /name="description::text"/)
    assert.match(formHtml, locale === 'en' ? />Cancel</ : />Batal</)

    const emptyTableHtml = renderToStaticMarkup(
      React.createElement(ModelTable, { model: 'SampleRecord', meta, rows: [], locale }),
    )
    assert.ok(emptyTableHtml.includes(copy.noRows.replace('{model}', 'SampleRecord')))

    const populatedTableHtml = renderToStaticMarkup(
      React.createElement(ModelTable, { model: 'SampleRecord', meta, rows: [{ id: 'safe-id', title: 'synthetic value' }], locale }),
    )
    assert.match(populatedTableHtml, locale === 'en' ? />Created</ : />Dibuat</)
    assert.match(populatedTableHtml, />title</)
    assert.match(populatedTableHtml, />synthetic value</)
  }

  const statusHtml = renderToStaticMarkup(
    React.createElement(LiveAlert, { role: 'status', tone: 'ok', children: 'Saved' }),
  )
  assert.match(statusHtml, /role="status" aria-live="polite"/)
})

void test('unsupported language hints do not produce a third HQ copy set', async () => {
  const { LoginPage } = await modules()
  requestScope.__HQ_TEST_REQUEST__ = { sessionCookie: null, acceptLanguage: 'fr-CA,fr;q=0.9' }

  const html = renderToStaticMarkup(await LoginPage({ searchParams: Promise.resolve({}) }))
  assert.match(html, /Email or username/)
  assert.doesNotMatch(html, /Email ou nama pengguna/)
})
