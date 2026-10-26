import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { buildSchemaDocument, defineAddon, defineModel, defineView, generateClientSource, installAddons, m2o, sel, str } from '@moonwitness/moonql'
import { renderSdk } from '../src/tools/gen-sdk.js'

const GENERATED = fileURLToPath(new URL('../../../packages/moonql-client/src/generated.ts', import.meta.url))

test('codegen: deterministic for the same registry', () => {
  assert.equal(renderSdk(), renderSdk())
})

test('codegen: the committed SDK carries rows, relation names, names and endpoints', () => {
  const source = renderSdk()
  assert.match(source, /export interface StationsRow \{/)
  assert.match(source, /countryRefRecord\?: CountriesRow \| null/)
  assert.match(source, /statusLabel: string/)
  assert.match(source, /export type ModelName = 'currencies'/)
  assert.match(source, /export type ViewName = 'countryOptions'/)
  assert.match(source, /export const MODEL_NAMES = \[/)
  assert.match(source, /export const VIEW_NAMES = \[/)
  assert.match(source, /export const ENDPOINTS = \[\{ method: 'POST', path: '\/auth\/login'/)
})

test('codegen: never emits the any token', () => {
  assert.equal(/\bany\b/.test(renderSdk()), false)
})

test('codegen: committed generated.ts is up to date (drift gate)', () => {
  assert.equal(readFileSync(GENERATED, 'utf8'), renderSdk(), 'moonql: SDK drift — run `pnpm gen:sdk`')
})

test('codegen: enum/nullable/optional mapping from a local addon', () => {
  const mini = defineAddon({
    name: 'minisdk',
    models: {
      owners: defineModel({ label: 'Owner', rest: true, seedless: true, fields: { name: str({ maxLength: 20 }) } }),
      widgets: defineModel({
        label: 'Widget',
        rest: true,
        seedless: true,
        fields: {
          title: str({ maxLength: 30 }),
          kind: sel(['round', 'square'], { null: true }),
          ownerRef: m2o('owners'),
        },
      }),
    },
    views: {
      widgetList: defineView('widgetList', {
        from: 'widgets',
        select: { title: 'title', kind: 'kind' },
        expand: ['ownerRef'],
      }),
    },
  })

  const source = generateClientSource(buildSchemaDocument(installAddons([mini])))

  // sel -> literal union, nullable -> | null, m2o relation -> named interface
  assert.match(source, /kind: 'round' \| 'square' \| null/)
  assert.match(source, /ownerRef: string \| null/)
  assert.match(source, /ownerRefRecord\?: OwnersRow \| null/)
  // a defaulted field is optional on create, required on the row
  assert.match(source, /export interface WidgetListOutput \{[\s\S]*title: string/)
  assert.match(source, /export interface WidgetsCreate \{[\s\S]*title: string[\s\S]*kind\?: 'round' \| 'square' \| null/)
  assert.equal(/\bany\b/.test(source), false)
})
