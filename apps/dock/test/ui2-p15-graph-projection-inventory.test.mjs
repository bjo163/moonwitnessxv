import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  findNode,
  nodeIdentityFacts,
  nodeRelations,
  normalizeAliasSurface,
} from '../src/data/queries/graph-projection.ts'

/**
 * UI-II P15a/P15e · the graph-projection inventory the node inspector reads, and
 * the negatives a read-only projection can actually produce.
 *
 * The inspector derives everything from ONE `/ontology/constellation` read, so
 * these tests exercise the derivations against a hand-built projection shaped
 * like the hub's: nodes with typed aliases, edges whose endpoints may point
 * outside the projection, identity decisions, and the four conflict codes.
 */

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = path.resolve(appRoot, '..', '..')
const read = (...segments) => fs.readFileSync(path.resolve(repoRoot, ...segments), 'utf8')

const projection = {
  nodes: [
    { stableId: 'n-1', label: 'Abel', aliases: [{ alias: '  Hevel   Stone ', status: 'ACCEPTED' }] },
    { stableId: 'n-2', label: 'Cain', aliases: [{ alias: 'hevel stone', status: 'ACCEPTED' }] },
    { stableId: 'n-3', label: 'Orphan', aliases: [] },
  ],
  edges: [
    { edgeCode: 'e-1', from: 'n-1', to: 'n-2', relationCode: 'INFLUENCED', epistemicStatus: 'VERIFIED' },
    { edgeCode: 'e-2', from: 'n-2', to: 'n-1', relationCode: 'OPPOSED', epistemicStatus: 'DISPUTED' },
    { edgeCode: 'e-3', from: 'n-1', to: 'n-9', relationCode: 'MENTIONS', epistemicStatus: 'UNKNOWN' },
  ],
  identityDecisions: [
    { pairCode: 'n-1|n-2', left: 'n-1', right: 'n-2', decision: 'KEEP_SEPARATE', decidedAt: 1, reviewCode: 'r-1' },
    { pairCode: 'n-4|n-5', left: 'n-4', right: 'n-5', decision: 'MERGE', decidedAt: 2, reviewCode: 'r-2' },
  ],
  conflicts: [
    { type: 'ENTITY', code: 'n-3', detail: 'no edge touches this node' },
    { type: 'RELATION', code: 'e-2', detail: 'opposed reading unresolved' },
    { type: 'IDENTITY', code: 'n-1|n-2', detail: 'pair still carries two identities' },
    { type: 'ALIAS', code: `ALIAS:${normalizeAliasSurface('Hevel  Stone')}`, detail: 'two nodes share one alias' },
    { type: 'ALIAS', code: 'ALIAS:unrelated', detail: 'a collision this node is not part of' },
  ],
}

// --- 1 · the shape the inspector is allowed to claim ---------------------------

test('UI2-P15a the inspector derives from the arrays one projection read returns', () => {
  const querySource = read('apps', 'dock', 'src', 'data', 'queries', 'constellation.ts')
  const calls = querySource.match(/serverClient\(\)\.call[^(]*\([^)]*\)/g) ?? []
  assert.deepEqual(
    calls.map((call) => call.replace(/\s+/g, ' ')),
    ["serverClient().call<ConstellationProjection>('/ontology/constellation')"],
    'a second hub call would let the inspector assert a relation the projection never carried',
  )

  const derivations = read('apps', 'dock', 'src', 'data', 'queries', 'graph-projection.ts')
  assert.ok(!derivations.includes('serverClient'), 'the derivations must stay a pure walk of the arrays already returned')
})

test('UI2-P15a the alias-collision key stays pinned to the ontology surface', () => {
  assert.equal(normalizeAliasSurface('  Hevel   Stone '), 'hevel stone')
  assert.equal(normalizeAliasSurface('HEVEL STONE'), 'hevel stone')

  const ontology = read('packages', 'moonql-ontology', 'src', 'graph.ts')
  const hubExpression = /const normalizeAlias = \(value: string\): string => ([^\r\n]+)/.exec(ontology)?.[1]
  assert.ok(hubExpression, 'the ontology normaliser must still exist for the inspector to mirror')

  const dockSource = read('apps', 'dock', 'src', 'data', 'queries', 'graph-projection.ts')
  const dockExpression = /export function normalizeAliasSurface\(value: string\): string \{\s*return ([^\r\n]+?)\s*\r?\n/
    .exec(dockSource)?.[1]
    .trim()
  assert.ok(dockExpression, 'the Dock mirror must keep the shape this test reads')
  assert.equal(
    dockExpression,
    hubExpression,
    'a drift in the ontology normaliser would hide an alias conflict instead of showing it',
  )

  assert.match(ontology, /type: 'ALIAS',\s*\r?\n\s*code: `ALIAS:\$\{/, 'the hub must still prefix alias conflicts with ALIAS:')
})

// --- 2 · relations of one node, stated as the projection says them -------------

test('UI2-P15b a node reports its outgoing and incoming edges separately', () => {
  const relations = nodeRelations(projection, 'n-1')
  assert.deepEqual(relations.outgoing.map((edge) => edge.edgeCode), ['e-1', 'e-3'])
  assert.deepEqual(relations.incoming.map((edge) => edge.edgeCode), ['e-2'])
  assert.equal(relations.total, 3)
  assert.deepEqual(
    relations.unresolved.map((edge) => edge.edgeCode).sort(),
    ['e-2', 'e-3'],
    'both unsettled rows surface; their listing order is not a claim the inspector makes',
  )
})

test('UI2-P15e an edge that points outside the projection is named, not dropped', () => {
  assert.deepEqual(nodeRelations(projection, 'n-1').unknownEndpoints, ['n-9'])
  assert.deepEqual(nodeRelations(projection, 'n-2').unknownEndpoints, [])
})

test('UI2-P15e an orphan node reports zero relations instead of an invented ones', () => {
  const relations = nodeRelations(projection, 'n-3')
  assert.equal(relations.total, 0)
  assert.deepEqual(relations.outgoing, [])
  assert.deepEqual(relations.incoming, [])
})

test('UI2-P15e an unknown node id resolves to nothing rather than a placeholder node', () => {
  assert.equal(findNode(projection, 'no-such-node'), null)
  assert.equal(findNode(projection, ''), null)
  assert.equal(findNode(projection, 'n-1')?.label, 'Abel')
})

// --- 3 · reviewer decisions and conflicts, per node ---------------------------

test('UI2-P15d identity facts reach a node only through the rows that name it', () => {
  const facts = nodeIdentityFacts(projection, 'n-1')
  assert.deepEqual(facts.decisions.map((d) => d.pairCode), ['n-1|n-2'])
  assert.deepEqual(facts.relationConflicts.map((c) => c.code), ['e-2'])
  assert.deepEqual(facts.identityConflicts.map((c) => c.code), ['n-1|n-2'])
  assert.deepEqual(facts.aliasConflicts.map((c) => c.code), ['ALIAS:hevel stone'])
  assert.deepEqual(facts.entityConflicts, [])
})

test('UI2-P15d a node is not credited with a conflict that belongs to another pair', () => {
  const facts = nodeIdentityFacts(projection, 'n-3')
  assert.deepEqual(facts.decisions, [])
  assert.deepEqual(facts.aliasConflicts, [])
  assert.deepEqual(facts.entityConflicts.map((c) => c.code), ['n-3'])
})

test('UI2-P15e an empty projection yields an empty inspector, not a fabricated graph', () => {
  const empty = { nodes: [], edges: [], identityDecisions: [], conflicts: [] }
  assert.equal(findNode(empty, 'n-1'), null)
  const relations = nodeRelations(empty, 'n-1')
  assert.equal(relations.total, 0)
  assert.deepEqual(nodeIdentityFacts(empty, 'n-1').decisions, [])
})

// --- 4 · the inspector stays read-only ----------------------------------------

test('UI2-P15b the inspector offers no merge, edit or resolve action', () => {
  const view = read('apps', 'dock', 'src', 'ui', 'components', 'constellation.tsx')
  for (const forbidden of ['<form', 'onClick={() => merge', 'action="', 'method="post"']) {
    assert.ok(!view.includes(forbidden), `the inspector must stay read-only, found ${forbidden}`)
  }
})
