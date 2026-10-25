import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FIELD_INPUT_SPEC, inputKindFor } from '@moonwitness/core'

/**
 * F1.3: one registry, not three.
 *
 * The kind→control map used to live inside headquarters while the hub's Studio
 * re-derived the same decision in its own JS. That is the quiet kind of duplication
 * that never breaks a test — it just makes the two surfaces render the same metadata
 * differently. These assertions pin where each decision lives, and fail if a copy
 * reappears.
 *
 * The hub does not depend on the React kit (and should not), so the kit's side is
 * checked as source structure rather than by importing it.
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

  const studio = source('apps/radio/src/modules/studio/index.ts')
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
