/**
 * UI-F10 behavioural coverage: drive the shared panel contract with unavailable
 * data and read the markup back. A hub that answers wrongly is an error, a hub
 * that answers with nothing is empty, and the two must never print the same
 * sentence. The pages below use the exact predicates and catalogue keys their
 * routes pass to `readPanel`.
 */
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL, URL } from 'node:url'
import process from 'node:process'
import path from 'node:path'
import test from 'node:test'
import { MoonApiError } from '@moonwitness/moonql-client'
import { isProjectionWithheld, panelErrorMessage } from '../src/data/queries/error.ts'
import { statesCopy } from '../src/lib/states-copy.ts'

const require_ = createRequire(new URL('../package.json', import.meta.url))
const ts = require_('typescript')
const { renderToStaticMarkup } = require_('react-dom/server')
const { createElement } = require_('react')

/**
 * `states.tsx` carries JSX, which the type stripper cannot parse, so it is
 * compiled the same way the header semantics test compiles `shell.tsx`. The
 * temp module lives under `test/` so Node resolves the workspace packages.
 */
async function loadPanelContract() {
  const source = readFileSync(
    path.resolve(fileURLToPath(new URL('../src/ui/components/states.tsx', import.meta.url))),
    'utf8',
  )
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  })
  const tempPath = path.resolve(
    fileURLToPath(new URL('.', import.meta.url)),
    `.states-runtime-${process.pid}.mjs`,
  )
  writeFileSync(tempPath, outputText)
  try {
    return await import(pathToFileURL(tempPath).href)
  } finally {
    unlinkSync(tempPath)
  }
}

const panels = await loadPanelContract()
const { PanelState, OutcomePanel, readPanel } = panels

const en = statesCopy.en
const id = statesCopy.id

function render(Props) {
  return renderToStaticMarkup(createElement(PanelState, { ...Props, children: null }))
}

/** The loading placeholder the real routes pass: a MoonUI skeleton, shape only. */
function skeletonPlaceholder() {
  return createElement('div', { className: 'm-grid m-grid-3' }, createElement('span', { className: 'm-skeleton' }))
}

// ---------------------------------------------------------------- load ----

test('UI-F10 loading is announced politely and never rendered as content', () => {
  const html = render({
    state: 'loading',
    loadingLabel: en.loadingContent,
    emptyTitle: en.emptyScheduleSlots,
    emptyHint: en.emptyScheduleSlotsHint,
    errorMessage: en.errorScheduleUnavailable,
    loadingPlaceholder: skeletonPlaceholder(),
  })
  assert.match(html, /role="status"/)
  assert.match(html, /aria-live="polite"/)
  assert.match(html, /class="m-spinner"/, 'the loading state carries the MoonUI spinner')
  assert.ok(html.includes(en.loadingContent), 'the loading sentence is the catalogue sentence')
  assert.ok(html.includes('class="m-skeleton"'), 'the placeholder is a MoonUI skeleton')
  assert.ok(!html.includes(en.emptyScheduleSlots), 'a loading panel must not read as empty')
  assert.ok(!html.includes('role="alert"'), 'a loading panel must not interrupt')
})

test('UI-F10 a loading panel shows a skeleton, not a fabricated row', () => {
  const html = renderToStaticMarkup(
    createElement(PanelState, {
      state: 'loading',
      loadingLabel: en.loadingContent,
      emptyTitle: en.emptyScheduleSlots,
      errorMessage: en.errorScheduleUnavailable,
      loadingPlaceholder: skeletonPlaceholder(),
      children: 'SHOULD NOT APPEAR',
    }),
  )
  assert.ok(!html.includes('SHOULD NOT APPEAR'), 'children are not rendered while loading')
  assert.ok(html.includes('m-skeleton'), 'the placeholder is the shape of a skeleton')
})

// --------------------------------------------------------------- error ----

test('UI-F10 an unreachable hub is an error state carrying the localized notice (stations)', async () => {
  const copy = { loadingContent: en.loadingContent, emptyNoStations: en.emptyNoStations, errorStationsUnavailable: en.errorStationsUnavailable }
  const panelCopy = {
    loadingLabel: copy.loadingContent,
    emptyTitle: copy.emptyNoStations,
    errorMessage: copy.errorStationsUnavailable,
  }
  const unavailable = new Error('connect ECONNREFUSED 127.0.0.1:65535')
  const outcome = await readPanel(
    () => Promise.reject(unavailable),
    panelCopy,
    (page) => page.rows.length === 0,
    (err) => panelErrorMessage(err, copy.errorStationsUnavailable),
  )

  assert.equal(outcome.state, 'error')
  assert.equal(
    outcome.message,
    en.errorStationsUnavailable,
    'an infrastructure fault must not leak its raw text to the visitor',
  )

  const html = render({
    state: outcome.state,
    loadingLabel: panelCopy.loadingLabel,
    emptyTitle: panelCopy.emptyTitle,
    errorMessage: outcome.message,
    emptyHint: panelCopy.emptyHint,
  })
  assert.match(html, /role="alert"/, 'the error state interrupts as an alert')
  assert.ok(html.includes(en.errorStationsUnavailable))
  assert.ok(!html.includes('ECONNREFUSED'), 'the fault detail stays out of the page')
  assert.ok(!html.includes(en.emptyNoStations), 'an outage is never shown as "no stations match"')
})

test('UI-F10 an unreachable hub is an error state carrying the localized notice (schedule)', async () => {
  for (const copy of [en, id]) {
    const panelCopy = {
      loadingLabel: copy.loadingContent,
      emptyTitle: copy.emptyScheduleSlots,
      emptyHint: copy.emptyScheduleSlotsHint,
      errorMessage: copy.errorScheduleUnavailable,
    }
    const outcome = await readPanel(
      () => Promise.reject(new Error('socket hang up')),
      panelCopy,
      (week) => week.rows.length === 0,
      (err) => panelErrorMessage(err, copy.errorScheduleUnavailable),
    )
    assert.equal(outcome.state, 'error')
    const html = render({
      state: outcome.state,
      loadingLabel: panelCopy.loadingLabel,
      emptyTitle: panelCopy.emptyTitle,
      emptyHint: panelCopy.emptyHint,
      errorMessage: outcome.message,
    })
    assert.ok(html.includes(copy.errorScheduleUnavailable), `${copy === id ? 'id' : 'en'} error sentence must render`)
    assert.ok(!html.includes(copy.emptyScheduleSlots), 'a failed grid read is not an empty grid')
  }
})

test('UI-F10 a hub answer that is a real problem keeps its own message (patches)', async () => {
  const panelCopy = {
    loadingLabel: en.loadingContent,
    emptyTitle: en.emptyPatches,
    errorMessage: en.errorPatchesUnavailable,
  }
  const hubRefusal = new MoonApiError(403, 'journeyPatchesOverview is not exposed to the public role')
  const outcome = await readPanel(
    () => Promise.reject(hubRefusal),
    panelCopy,
    undefined,
    (err) => panelErrorMessage(err, en.errorPatchesUnavailable),
  )
  assert.equal(outcome.state, 'error')
  assert.match(outcome.message, /not exposed to the public role/, 'the hub answer is the honest sentence')

  const fallback = await readPanel(
    () => Promise.reject(new TypeError('fetch failed')),
    panelCopy,
    undefined,
    (err) => panelErrorMessage(err, en.errorPatchesUnavailable),
  )
  assert.equal(fallback.message, en.errorPatchesUnavailable)
})

// --------------------------------------------------------------- empty ----

test('UI-F10 an empty stations read is stated in words in both locales', async () => {
  for (const copy of [en, id]) {
    const panelCopy = {
      loadingLabel: copy.loadingContent,
      emptyTitle: copy.emptyNoStations,
      errorMessage: copy.errorStationsUnavailable,
    }
    const outcome = await readPanel(
      () => Promise.resolve({ rows: [], total: 0, catalogSize: 0, page: 1, pages: 1, genres: [], countries: [] }),
      panelCopy,
      (page) => page.rows.length === 0,
      (err) => panelErrorMessage(err, copy.errorStationsUnavailable),
    )
    assert.equal(outcome.state, 'empty', 'a successful read with nothing in it is empty')

    const html = render({
      state: outcome.state,
      loadingLabel: panelCopy.loadingLabel,
      emptyTitle: panelCopy.emptyTitle,
      errorMessage: panelCopy.errorMessage,
    })
    assert.match(html, /class="m-empty"/, 'the empty state uses the shared empty component')
    assert.ok(html.includes(copy.emptyNoStations))
    assert.ok(!html.includes(copy.errorStationsUnavailable), 'an empty catalog is not an outage')
    assert.ok(!html.includes('role="alert"'), 'an empty state does not interrupt')
  }
})

test('UI-F10 an empty grid read keeps its reason and its no-invention promise (schedule)', async () => {
  const panelCopy = {
    loadingLabel: en.loadingContent,
    emptyTitle: en.emptyScheduleSlots,
    emptyHint: en.emptyScheduleSlotsHint,
    errorMessage: en.errorScheduleUnavailable,
  }
  const outcome = await readPanel(
    () => Promise.resolve({ rows: [] }),
    panelCopy,
    (week) => week.rows.length === 0,
  )
  assert.equal(outcome.state, 'empty')
  const html = render({
    state: 'empty',
    loadingLabel: panelCopy.loadingLabel,
    emptyTitle: panelCopy.emptyTitle,
    emptyHint: panelCopy.emptyHint,
    errorMessage: panelCopy.errorMessage,
  })
  assert.ok(html.includes(en.emptyScheduleSlots))
  assert.ok(html.includes(en.emptyScheduleSlotsHint), 'the empty state says why it is empty')
})

test('UI-F10 a null read is empty while a rejected read is an error (reader)', async () => {
  const panelCopy = {
    loadingLabel: en.loadingContent,
    emptyTitle: en.emptyReaderPanel,
    errorMessage: en.errorReaderUnavailable,
  }
  const absent = await readPanel(() => Promise.resolve(null), panelCopy)
  assert.equal(absent.state, 'empty')

  const broken = await readPanel(
    () => Promise.reject(new Error('hub closed the connection')),
    panelCopy,
    undefined,
    (err) => panelErrorMessage(err, en.errorReaderUnavailable),
  )
  assert.equal(broken.state, 'error')
  assert.equal(broken.message, en.errorReaderUnavailable)

  const absentHtml = render({
    state: absent.state,
    loadingLabel: panelCopy.loadingLabel,
    emptyTitle: panelCopy.emptyTitle,
    errorMessage: panelCopy.errorMessage,
  })
  const errorHtml = render({
    state: broken.state,
    loadingLabel: panelCopy.loadingLabel,
    emptyTitle: panelCopy.emptyTitle,
    errorMessage: broken.message,
  })
  assert.notEqual(absentHtml, errorHtml, 'empty and error must be visibly different panels')
})

test('UI-F10 an outcome panel shows only the state it is in', async () => {
  const panelCopy = {
    loadingLabel: en.loadingContent,
    emptyTitle: en.emptyFiguresRegistry,
    emptyHint: en.emptyFiguresRegistryHint,
    errorMessage: en.errorFiguresUnavailable,
  }
  const empty = { state: 'empty' }
  const html = renderToStaticMarkup(
    createElement(OutcomePanel, {
      outcome: empty,
      copy: panelCopy,
      children: () => 'REGISTRY CONTENT',
    }),
  )
  assert.ok(!html.includes('REGISTRY CONTENT'), 'a non-ready outcome renders no panel body')
  assert.match(html, /class="m-empty"/)
  assert.ok(html.includes(en.emptyFiguresRegistry))
})

// ------------------------------------------------------------ boundary ----

test('UI-F10 the denpa feed distinguishes a quiet band from a failed read', async () => {
  const panelCopy = {
    loadingLabel: en.loadingTransmissions,
    emptyTitle: en.emptyDenpaTransmissions,
    errorMessage: en.errorDenpaUnavailable,
  }
  // The deck stays operable when nothing is on air, so the route passes a
  // never-empty predicate: an empty list is a ready panel, a failure is not.
  const quiet = await readPanel(
    () => Promise.resolve([]),
    panelCopy,
    () => false,
    (err) => panelErrorMessage(err, en.errorDenpaUnavailable),
  )
  assert.equal(quiet.state, 'ready', 'a quiet band is still a working deck')
  assert.deepEqual(quiet.value, [])

  const failed = await readPanel(
    () => Promise.reject(new Error('ECONNREFUSED')),
    panelCopy,
    () => false,
    (err) => panelErrorMessage(err, en.errorDenpaUnavailable),
  )
  assert.equal(failed.state, 'error', 'a rejected feed is never shown as a quiet band')
  assert.equal(failed.message, en.errorDenpaUnavailable)
})

test('UI-F10 every migrated panel sentence exists in both locales', () => {
  const keys = [
    'emptyNoStations',
    'errorStationsUnavailable',
    'emptyNowPlaying',
    'emptyScheduleSlots',
    'emptyScheduleSlotsHint',
    'errorScheduleUnavailable',
    'emptyPatches',
    'errorPatchesUnavailable',
    'emptyGraph',
    'emptyGraphHint',
    'emptyGraphRelease',
    'errorConstellationUnavailable',
    'errorGraphUnavailable',
    'errorGraphWithheld',
    'emptyDenpaTransmissions',
    'errorDenpaUnavailable',
    'emptyReaderPanel',
    'errorReaderUnavailable',
    'emptyStationNoCountry',
    'emptyStationNoSchedule',
  ]
  for (const key of keys) {
    assert.ok(typeof en[key] === 'string' && en[key].trim().length > 0, `${key} has no English copy`)
    assert.ok(typeof id[key] === 'string' && id[key].trim().length > 0, `${key} has no Indonesian copy`)
    assert.notEqual(en[key], id[key], `${key} must be translated, not duplicated`)
  }
})

test('anonymous Graph and Ontology denial is identified as withholding, not infrastructure failure', () => {
  assert.equal(isProjectionWithheld(new MoonApiError(401, 'Unauthorized')), true)
  assert.equal(isProjectionWithheld(new MoonApiError(403, 'Forbidden')), true)
  assert.equal(isProjectionWithheld(new MoonApiError(503, 'Unavailable')), false)
  assert.equal(isProjectionWithheld(new Error('ECONNREFUSED')), false)
  assert.notEqual(statesCopy.en.errorGraphWithheld, statesCopy.id.errorGraphWithheld)
})
