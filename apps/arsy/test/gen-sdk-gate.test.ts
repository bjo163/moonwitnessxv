import { test } from 'node:test'
import assert from 'node:assert/strict'
import { appendHistory, planWrite } from '../src/tools/gen-sdk.js'
import type { HistoryEntry } from '../src/tools/gen-sdk.js'
import type { SchemaDocument } from '@moonwitness/core'

/**
 * M1.2: the write path was the hole. `gen:sdk` rewrote `schema-snapshot.json`
 * *before* asking whether the difference broke anyone, so the gate compared the
 * new document against itself and always answered "no breaking change". These are
 * the decisions the CLI now takes before it is allowed to touch the committed
 * files — with the snapshot as the baseline, and the breaking classification as
 * the thing a human has to acknowledge.
 */

interface TestField {
  kind?: string
  type?: string | string[]
  nullable?: boolean
  enum?: string[]
  maxLength?: number
  required?: boolean
}

interface TestModel {
  fields: Record<string, TestField>
  createSchema?: { required?: string[]; properties?: Record<string, TestField> }
  updateSchema?: { required?: string[]; properties?: Record<string, TestField> }
  readSchema?: { properties?: Record<string, TestField> }
  acl?: Record<string, unknown>
}

const modelsOf = (doc: SchemaDocument): Record<string, TestModel> => doc.models as unknown as Record<string, TestModel>
const modelOf = (doc: SchemaDocument, name: string): TestModel => modelsOf(doc)[name]!
const viewsOf = (doc: SchemaDocument): Record<string, unknown> => doc.views as unknown as Record<string, unknown>

const doc = (apiVersion = '1.0.0'): SchemaDocument =>
  ({
    schemaHash: 'aaaaaaaaaaaaaaaa',
    apiVersion,
    minDemoRows: 10,
    addons: [{ name: 'radio', version: '1.0.0', depends: [] }],
    models: {
      stations: {
        label: 'Station',
        fields: { name: { kind: 'str', required: true, maxLength: 120 } },
        createSchema: { properties: { name: { type: 'string' } }, required: ['name'] },
        updateSchema: { properties: { name: { type: 'string' } } },
        readSchema: { properties: { name: { type: 'string' } } },
        acl: { list: 'public', create: ['admin'] },
      },
    },
    views: { stationCatalog: { label: 'Catalog', from: 'stations', acl: 'public' } },
    endpoints: [{ addon: 'radio', method: 'POST', path: '/listen', acl: 'public', stream: false }],
    crons: [],
    menu: [],
  }) as unknown as SchemaDocument

/** the smallest change a caller notices: a published view disappears */
const breakingNext = (apiVersion: string): SchemaDocument => {
  const next = structuredClone(doc(apiVersion))
  delete viewsOf(next).stationCatalog
  return next
}

test('a breaking difference stops the write until the version is raised', () => {
  const refused = planWrite(doc(), breakingNext('1.0.0'), {})
  assert.equal(refused.write, false, 'the gate must not be satisfied by the snapshot it just wrote')
  assert.ok(refused.breaking.some((line) => line.includes('stationCatalog')), refused.breaking.join(' | '))
  assert.match(refused.reason, /raise API_VERSION's major/)
})

test('--allow-breaking is an acknowledgement, not a substitute for a major bump', () => {
  const noBump = planWrite(doc(), breakingNext('1.0.0'), { allowBreaking: true })
  assert.equal(noBump.write, false)
  assert.match(noBump.reason, /needs API_VERSION at major 2/)

  const bumped = planWrite(doc(), breakingNext('2.0.0'), { allowBreaking: true })
  assert.equal(bumped.write, true, bumped.reason)
  assert.match(bumped.reason, /major 1 -> 2/)
  assert.equal(bumped.breaking.length, 1, 'the break is still reported when it is accepted')
})

test('a bumped major alone does not slip past the human decision', () => {
  // `gateDecision` says ok; the write path still asks, because rewriting the record
  // of what callers depend on is a release act, not a side effect of `pnpm gen:sdk`
  const plan = planWrite(doc(), breakingNext('2.0.0'), {})
  assert.equal(plan.write, false)
  assert.match(plan.reason, /--allow-breaking/)
})

test('--force is the documented escape hatch, and says so in the reason', () => {
  const forced = planWrite(doc(), breakingNext('1.0.0'), { force: true })
  assert.equal(forced.write, true)
  assert.match(forced.reason, /forced past the gate/)
})

test('additive work needs no ceremony; a missing snapshot is a first release', () => {
  const additive = structuredClone(doc())
  viewsOf(additive).airplayDaily = { label: 'Daily', from: 'stations' }
  assert.equal(planWrite(doc(), additive, {}).write, true)
  assert.equal(planWrite(null, doc(), {}).write, true)
})

test('every kind of breaking change is refused, not just a dropped view', () => {
  const dropField = structuredClone(doc())
  delete modelOf(dropField, 'stations').fields.name
  const newRequirement = structuredClone(doc())
  modelOf(newRequirement, 'stations').createSchema?.required?.push('streamUrl')
  const closedRead = structuredClone(doc())
  modelOf(closedRead, 'stations').acl = { ...modelOf(closedRead, 'stations').acl, list: ['admin'] }
  const dropEndpoint = structuredClone(doc())
  dropEndpoint.endpoints = []

  for (const [label, next] of Object.entries({ dropField, newRequirement, closedRead, dropEndpoint })) {
    const plan = planWrite(doc(), next, {})
    assert.equal(plan.write, false, `${label} must be refused`)
    assert.ok(plan.breaking.length > 0, `${label} must be named`)
  }
})

test('the release history only grows, and only when the contract changes', () => {
  const history: HistoryEntry[] = [{ apiVersion: '1.0.0', schemaHash: 'aaaaaaaaaaaaaaaa', date: '2026-01-01T00:00:00.000Z' }]
  assert.deepEqual(appendHistory(history, doc(), '2026-02-01T00:00:00.000Z'), history, 'same hash, same release')

  const next = structuredClone(doc('1.1.0'))
  next.schemaHash = 'bbbbbbbbbbbbbbbb'
  const grown = appendHistory(history, next, '2026-02-01T00:00:00.000Z')
  assert.equal(grown.length, 2)
  assert.deepEqual(grown[1], { apiVersion: '1.1.0', schemaHash: 'bbbbbbbbbbbbbbbb', date: '2026-02-01T00:00:00.000Z' })
  assert.deepEqual(grown[0], history[0], 'earlier releases are never rewritten')
})
