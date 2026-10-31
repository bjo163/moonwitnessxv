import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FIELD_INPUT_SPEC, inputKindFor } from '@moonwitness/core'

/**
 * F1.3: one registry, not three — and one centralized design system (`@moonwitness/moonui`).
 *
 * The kind→control map used to live inside headquarters while the hub's Studio
 * re-derived the same decision in its own JS. Likewise, `apps/dock` and
 * `apps/headquarters` must consume `@moonwitness/moonui` primitives instead of
 * re-inventing parallel cards, buttons, inputs, progress bars, badges, or zine
 * elements in local CSS.
 */

const here = dirname(fileURLToPath(import.meta.url))
const repo = join(here, '..', '..', '..')
const source = (relative: string): string => readFileSync(resolve(repo, relative), 'utf8')

test('inputKindFor: the schema-property side of the decision', () => {
  assert.equal(inputKindFor({ enum: ['lofi', 'jazz'] }), 'enum')
  assert.equal(inputKindFor({ type: 'string', format: 'date-time' }), 'datetime')
  assert.equal(inputKindFor({ type: 'string', format: 'uuid' }), 'relation')
  assert.equal(inputKindFor({ type: 'integer' }), 'integer')
  // a nullable union is still its base type; the null is not a second control
  assert.equal(inputKindFor({ type: ['number', 'null'] }), 'number')
  // unknown shapes fall back to text rather than guessing a stricter control
  assert.equal(inputKindFor({ type: 'object' }), 'string')
  assert.equal(inputKindFor({}), 'string')
  for (const kind of Object.keys(FIELD_INPUT_SPEC)) {
    assert.ok(['text', 'number', 'select', 'checkbox', 'datetime-local'].includes(FIELD_INPUT_SPEC[kind]!.input), kind)
  }
})

test('the widget registry lives in the shared kit and covers every moonql kind', () => {
  const fields = source('packages/moonui/src/fields.tsx')
  const declared = /const FIELD_WIDGETS[^=]*=\s*\{([\s\S]*?)\n\}/.exec(fields)?.[1] ?? ''
  // these are the kinds `/_schema` publishes for fields; a missing one renders as text
  for (const kind of ['str', 'text', 'int', 'bool', 'ts', 'sel', 'm2o']) {
    assert.match(declared, new RegExp(`${kind}:\\s*\\w+Field`), `moonui maps no widget for kind "${kind}"`)
  }
  assert.match(fields, /FIELD_WIDGETS\[kind\] \?\? StrField/, 'an unknown kind must degrade to text, not crash')
  assert.match(source('packages/moonui/src/index.ts'), /FIELD_WIDGETS/, 'the kit must export the registry')
})

test('headquarters and studio consume the registry instead of owning a copy', () => {
  const hqRegistry = source('apps/headquarters/src/ui/fields/registry.tsx')
  assert.match(hqRegistry, /from '@moonwitness\/moonui'/, 'HQ must import the shared registry')
  assert.equal(/const WIDGETS\s*[:=]/.test(hqRegistry), false, 'HQ re-declared its own widget map')

  const hqWidgets = source('apps/headquarters/src/ui/fields/widgets.tsx')
  assert.equal(/function (StrField|SelField|BoolField)\(/.test(hqWidgets), false, 'HQ re-declared widget bodies')

  const studio = source('apps/arsy/src/modules/studio/index.ts')
  assert.match(studio, /FIELD_INPUT_SPEC/, 'Studio no longer receives the shared table')
  assert.match(studio, /var inputKindFor = \$\{inputKindFor\.toString\(\)\}/, 'Studio must borrow the function, not fork it')
  // the control choice must come from the shared spec. The remaining `p.type ===
  // "integer"` in the page is the submit-side coercion of a FormData string to a
  // number, which is a different question and stays.
  assert.match(studio, /type='" \+ spec\.input/, 'Studio does not render the chosen control')
  assert.equal(/var type = p\.type ===/.test(studio), false, 'Studio re-derived the control choice by hand')
})

test('the field table has exactly one home', () => {
  const moonuiFields = source('packages/moonui/src/fields.tsx')
  assert.equal(/FIELD_INPUT_SPEC\s*[:=]/.test(moonuiFields), false, 'the React kit forked the core table')
  const core = source('packages/core/src/field-spec.ts')
  assert.match(core, /export const FIELD_INPUT_SPEC/, 'core must be the owner')
})

test('moonui centralizes UI and punk-zine primitives across dock, headquarters, and cockpit', () => {
  const index = source('packages/moonui/src/index.ts')
  for (const symbol of [
    'Button',
    'LinkButton',
    'Card',
    'Panel',
    'Field',
    'TextInput',
    'SelectInput',
    'Toggle',
    'Badge',
    'Pagination',
    'LiveDot',
    'ProgressBar',
    'ChartList',
    'BrandLogo',
    'Crown',
    'Tape',
    'ZineNote',
    'ModuleCard',
    'PosterCard',
    'Tabs',
    'Pill',
    'PillGroup',
    'StationCard',
    'TerminalViewer',
  ]) {
    assert.match(index, new RegExp(`\\b${symbol}\\b`), `@moonwitness/moonui must export ${symbol}`)
  }

  // Every surface in dock, headquarters, and cockpit must import from @moonwitness/moonui
  const surfaces = [
    'apps/dock/src/ui/components/shell.tsx',
    'apps/dock/src/ui/components/sections.tsx',
    'apps/dock/src/ui/client/Player.tsx',
    'apps/dock/src/ui/client/LiveTicker.tsx',
    'apps/dock/src/app/page.tsx',
    'apps/dock/src/app/stations/page.tsx',
    'apps/dock/src/app/stations/[id]/page.tsx',
    'apps/dock/src/app/schedule/page.tsx',
    'apps/dock/src/app/embed/[id]/page.tsx',
    'apps/headquarters/src/layouts/auth.tsx',
    'apps/headquarters/src/layouts/vertical.tsx',
    'apps/headquarters/src/app/login/page.tsx',
    'apps/headquarters/src/app/(admin)/page.tsx',
    'apps/headquarters/src/app/(admin)/world-monitor/page.tsx',
    'tools/cockpit/client/App.tsx',
  ]
  for (const file of surfaces) {
    assert.match(source(file), /from '@moonwitness\/moonui'/, `${file} must consume @moonwitness/moonui`)
  }

  // Local app stylesheets must not re-declare shared primitives
  const dockCss = source('apps/dock/src/app/globals.css')
  const hqCss = source('apps/headquarters/src/app/globals.css')
  const cockpitCss = source('tools/cockpit/client/cockpit-layout.css')
  for (const forbidden of [
    /\.dk-btn-/,
    /\.dk-pager\b/,
    /\.dk-progress\b/,
    /\.dk-live-dot\b/,
    /\.dk-pill\b/,
    /\.dk-tape\b/,
    /@keyframes\b/,
  ]) {
    assert.equal(forbidden.test(dockCss), false, `dock/globals.css re-declared shared primitive ${forbidden}`)
  }
  for (const forbidden of [
    /\.hq-module-card\b/,
    /\.hq-proj-card\b/,
    /\.hq-proj-bar\b/,
    /\.hq-input-box\b/,
    /\.hq-shadow-submit\b/,
    /@keyframes\b/,
  ]) {
    assert.equal(forbidden.test(hqCss), false, `headquarters/globals.css re-declared shared primitive ${forbidden}`)
  }
  for (const forbidden of [
    /\.tab-btn\b/,
    /\.terminal-scroll\b/,
    /\.log-entry\b/,
  ]) {
    assert.equal(forbidden.test(cockpitCss), false, `cockpit-layout.css re-declared shared primitive ${forbidden}`)
  }
})
