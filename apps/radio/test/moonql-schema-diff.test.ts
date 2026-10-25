import { test } from 'node:test'
import assert from 'node:assert/strict'
import { classifySchema, gateDecision, parseVersion, type SchemaDocument } from '@moonwitness/moonql'

/**
 * F4.1: the classifier behind the gate. `gen:sdk:check` already said "something
 * changed"; what a reviewer needs is which change is allowed to ship as a minor and
 * which one is a caller's outage. These are the distinctions the gate makes.
 */

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
        createSchema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] },
        updateSchema: { type: 'object', properties: { name: { type: 'string' } } },
        readSchema: {
          type: 'object',
          properties: { name: { type: 'string' }, genre: { type: ['string', 'null'] } },
        },
        acl: { list: 'public', create: ['admin'] },
      },
    } as never,
    views: { stationCatalog: { label: 'Catalog', from: 'stations', acl: 'public' } } as never,
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
    ;(doc.models as never as Record<string, unknown>).requests = { label: 'Request', fields: {}, acl: {} }
    ;(doc.views as never as Record<string, unknown>).airplayDaily = { label: 'Daily', from: 'requests' }
    doc.endpoints.push({ addon: 'playlog', method: 'GET', path: '/on-air', acl: 'public', stream: true })
    const station = (doc.models as never as Record<string, { fields: Record<string, unknown> }>).stations
    station.fields.probeOk = { kind: 'bool', required: false, nullable: true }
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
    delete (doc.views as never as Record<string, unknown>).stationCatalog
    const station = (doc.models as never as Record<string, { fields: Record<string, unknown>; createSchema: { required: string[] } }>).stations
    delete station.fields.genre
    station.createSchema.required.push('streamUrl')
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

  const accepted = gateDecision(base(), withDoc((doc) => {
    delete (doc.views as never as Record<string, unknown>).stationCatalog
    doc.apiVersion = '2.0.0'
  }))
  assert.equal(accepted.ok, true)
  assert.match(accepted.reason, /major 1 -> 2/)
})

test('narrowing a value range is breaking even when the type name survives', () => {
  const next = withDoc((doc) => {
    const station = (doc.models as never as Record<string, { fields: Record<string, { enum?: string[]; maxLength?: number }> }>).stations
    station.fields.genre.enum = ['lofi'] // 'jazz' is gone
    station.fields.name.maxLength = 40 // values up to 120 already exist
  })

  const diff = classifySchema(base(), next)
  assert.ok(diff.breaking.some((line) => line.includes('no longer accepts "jazz"')), diff.breaking.join(' | '))
  assert.ok(diff.breaking.some((line) => line.includes('shrank to 40 chars')), diff.breaking.join(' | '))
})

test('widening a nullable to a plain value is breaking; the reverse is not', () => {
  const hardened = withDoc((doc) => {
    const station = (doc.models as never as Record<string, { fields: Record<string, { nullable?: boolean }> }>).stations
    station.fields.genre.nullable = false
  })
  assert.ok(classifySchema(base(), hardened).breaking.some((line) => line.includes('became non-null')))

  // a field that starts allowing null breaks nobody: every reader already copes
  const softened = withDoc((doc) => {
    const station = (doc.models as never as Record<string, { fields: Record<string, { nullable?: boolean }> }>).stations
    station.fields.name.nullable = true
  })
  assert.deepEqual(classifySchema(base(), softened).breaking.filter((l) => l.includes('name')), [])
})

test('acl that stops answering anonymous callers is breaking, other acl moves are noted', () => {
  const gated = withDoc((doc) => {
    ;(doc.models as never as Record<string, { acl: Record<string, string> }>).stations.acl.list = ['admin']
  })
  assert.ok(classifySchema(base(), gated).breaking.some((line) => line.includes('no longer public')))

  const tightenedButPrivate = withDoc((doc) => {
    ;(doc.models as never as Record<string, { acl: Record<string, unknown> }>).stations.acl.create = 'auth'
  })
  const diff = classifySchema(base(), tightenedButPrivate)
  assert.deepEqual(diff.breaking, [])
  // named per operation: "acl changed" without the operation is not actionable
  assert.deepEqual(diff.changed, ['models.stations create acl'])
})

test('an unparseable version cannot authorise a breaking change', () => {
  const next = withDoc((doc) => {
    doc.apiVersion = 'next'
    delete (doc.views as never as Record<string, unknown>).stationCatalog
  })
  const decision = gateDecision(base(), next)
  assert.equal(decision.ok, false)
  assert.match(decision.reason, /unparseable/)
})

test('the gate is deterministic: the same pair always gives the same verdict', () => {
  const next = withDoc((doc) => {
    delete (doc.views as never as Record<string, unknown>).stationCatalog
  })
  const first = JSON.stringify(gateDecision(base(), next))
  const second = JSON.stringify(gateDecision(base(), next))
  assert.equal(first, second)
  // and comparing a document with itself is always clean
  const clean = gateDecision(base(), base())
  assert.equal(clean.ok, true)
  assert.deepEqual(clean.breaking, [])
})
