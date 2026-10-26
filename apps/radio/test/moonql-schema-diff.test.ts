import { test } from 'node:test'
import assert from 'node:assert/strict'
import { classifySchema, gateDecision, parseVersion } from '@moonwitness/moonql'
import type { SchemaDocument } from '@moonwitness/core'

/**
 * F4.1: the classifier behind the gate. `gen:sdk:check` already said "something
 * changed"; what a reviewer needs is which change is allowed to ship as a minor and
 * which one is a caller's outage. These are the distinctions the gate makes.
 *
 * Dokumen `_schema` adalah kontrak JSON, jadi tes ini bekerja pada bentuk longgarnya.
 * Supaya tidak tenggelam dalam cast, akses ke model dilakukan lewat helper bertipe
 * (`modelOf`) alih-alih `as never as Record<...>` di setiap baris.
 */

interface TestField {
  kind?: string
  /** JSON Schema type seperti yang dikirim `_schema` (string atau union dengan 'null') */
  type?: string | string[]
  nullable?: boolean
  enum?: string[]
  maxLength?: number
  required?: boolean
}

interface TestSchema {
  required?: string[]
  properties?: Record<string, TestField>
}

interface TestModel {
  label?: string
  fields: Record<string, TestField>
  createSchema?: TestSchema
  updateSchema?: TestSchema
  readSchema?: TestSchema
  acl?: Record<string, unknown>
}

const modelsOf = (doc: SchemaDocument): Record<string, TestModel> => doc.models as unknown as Record<string, TestModel>
const modelOf = (doc: SchemaDocument, name: string): TestModel => modelsOf(doc)[name]!
const viewsOf = (doc: SchemaDocument): Record<string, unknown> => doc.views as unknown as Record<string, unknown>

const base = (): SchemaDocument =>
  ({
    schemaHash: '0'.repeat(16),
    apiVersion: '1.4.0',
    minDemoRows: 10,
    addons: [{ name: 'radio', version: '1.0.0', depends: [] }],
    models: {
      stations: {
        label: 'Station',
        fields: {
          name: { kind: 'str', required: true, maxLength: 120 },
          genre: { kind: 'sel', required: false, nullable: true, enum: ['lofi', 'jazz'] },
        },
        createSchema: { properties: { name: { type: 'string' } }, required: ['name'] },
        updateSchema: { properties: { name: { type: 'string' } } },
        readSchema: { properties: { name: { type: 'string' }, genre: { type: ['string', 'null'], nullable: true } } },
        acl: { list: 'public', create: ['admin'] },
      },
    },
    views: { stationCatalog: { label: 'Catalog', from: 'stations', acl: 'public' } },
    endpoints: [{ addon: 'radio', method: 'POST', path: '/listen', acl: 'public', stream: false }],
    crons: [],
    menu: [],
  }) as unknown as SchemaDocument

const withDoc = (mutate: (doc: SchemaDocument) => void): SchemaDocument => {
  const doc = structuredClone(base())
  mutate(doc)
  return doc
}

test('parseVersion: numeric core only, garbage is null not zero', () => {
  assert.deepEqual(parseVersion('1.4.0'), { major: 1, minor: 4, patch: 0 })
  assert.deepEqual(parseVersion('2.0.0-beta.1'), { major: 2, minor: 0, patch: 0 })
  assert.equal(parseVersion('latest'), null)
  assert.equal(parseVersion(undefined), null)
})

test('additive changes are classified as added, never breaking', () => {
  const next = withDoc((doc) => {
    modelsOf(doc).requests = { label: 'Request', fields: {}, acl: {} }
    viewsOf(doc).airplayDaily = { label: 'Daily', from: 'requests' }
    doc.endpoints.push({ addon: 'playlog', method: 'GET', path: '/on-air', acl: 'public', stream: true })
    modelOf(doc, 'stations').fields.probeOk = { kind: 'bool', required: false, nullable: true }
  })

  const diff = classifySchema(base(), next)
  assert.deepEqual(diff.breaking, [], `unexpected breaking: ${diff.breaking.join(', ')}`)
  // a new model, view and endpoint are each reported; a new optional field is not
  // surface worth naming, it only has to not be called breaking
  assert.equal(diff.added.length, 3)
  assert.equal(gateDecision(base(), next).ok, true)
})

test('removals and new requirements are breaking', () => {
  const next = withDoc((doc) => {
    delete viewsOf(doc).stationCatalog
    const station = modelOf(doc, 'stations')
    delete station.fields.genre
    station.createSchema?.required?.push('streamUrl')
    doc.endpoints = []
  })

  const diff = classifySchema(base(), next)
  assert.ok(diff.breaking.some((line) => line === 'views: stationCatalog removed'), diff.breaking.join(' | '))
  assert.ok(diff.breaking.some((line) => line.includes('removed field "genre"')), diff.breaking.join(' | '))
  assert.ok(diff.breaking.some((line) => line.includes('now requires streamUrl on create')), diff.breaking.join(' | '))
  assert.ok(diff.breaking.some((line) => line.includes('POST /listen removed')), diff.breaking.join(' | '))

  // same major: refused. the message names the version, because that is what to fix
  const refused = gateDecision(base(), next)
  assert.equal(refused.ok, false)
  assert.match(refused.reason, /raise the major/)

  const accepted = gateDecision(
    base(),
    withDoc((doc) => {
      delete viewsOf(doc).stationCatalog
      doc.apiVersion = '2.0.0'
    }),
  )
  assert.equal(accepted.ok, true)
  assert.match(accepted.reason, /major 1 -> 2/)
})

test('narrowing a value range is breaking even when the type name survives', () => {
  const next = withDoc((doc) => {
    const station = modelOf(doc, 'stations')
    station.fields.genre!.enum = ['lofi'] // 'jazz' is gone
    station.fields.name!.maxLength = 40 // values up to 120 already exist
  })

  const diff = classifySchema(base(), next)
  assert.ok(diff.breaking.some((line) => line.includes('no longer accepts "jazz"')), diff.breaking.join(' | '))
  assert.ok(diff.breaking.some((line) => line.includes('shrank to 40 chars')), diff.breaking.join(' | '))
})

test('widening a nullable to a plain value is breaking; the reverse is not', () => {
  const hardened = withDoc((doc) => {
    modelOf(doc, 'stations').fields.genre!.nullable = false
  })
  assert.ok(classifySchema(base(), hardened).breaking.some((line) => line.includes('became non-null')))

  // a field that starts allowing null breaks nobody: every reader already copes
  const softened = withDoc((doc) => {
    modelOf(doc, 'stations').fields.name!.nullable = true
  })
  assert.deepEqual(classifySchema(base(), softened).breaking.filter((l) => l.includes('name')), [])
})

test('acl that stops answering anonymous callers is breaking, other acl moves are noted', () => {
  const gated = withDoc((doc) => {
    modelOf(doc, 'stations').acl = { ...modelOf(doc, 'stations').acl, list: ['admin'] }
  })
  assert.ok(classifySchema(base(), gated).breaking.some((line) => line.includes('no longer public')))

  const tightenedButPrivate = withDoc((doc) => {
    modelOf(doc, 'stations').acl = { ...modelOf(doc, 'stations').acl, create: 'auth' }
  })
  const diff = classifySchema(base(), tightenedButPrivate)
  assert.deepEqual(diff.breaking, [])
  // named per operation: "acl changed" without the operation is not actionable
  assert.deepEqual(diff.changed, ['models.stations create acl'])
})

test('an unparseable version cannot authorise a breaking change', () => {
  const next = withDoc((doc) => {
    doc.apiVersion = 'next'
    delete viewsOf(doc).stationCatalog
  })
  const decision = gateDecision(base(), next)
  assert.equal(decision.ok, false)
  assert.match(decision.reason, /unparseable/)
})

test('the gate is deterministic: the same pair always gives the same verdict', () => {
  const next = withDoc((doc) => {
    delete viewsOf(doc).stationCatalog
  })
  const first = JSON.stringify(gateDecision(base(), next))
  const second = JSON.stringify(gateDecision(base(), next))
  assert.equal(first, second)
  // and comparing a document with itself is always clean
  const clean = gateDecision(base(), base())
  assert.equal(clean.ok, true)
  assert.deepEqual(clean.breaking, [])
})
