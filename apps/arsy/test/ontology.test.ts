import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify, { type FastifyInstance } from 'fastify'
import { bootMoonQl, moonqlRest } from '@moonwitness/moonql'
import base from '@moonwitness/moonql-base'
import auth from '@moonwitness/moonql-auth'
import ontology from '@moonwitness/moonql-ontology'
import envelope from '../src/plugins/envelope.js'
import { adminHeaders, TEST_ADMIN_PASSWORD } from './helpers/auth.js'

/**
 * M10 — ontology, alias and identity review.
 *
 * These tests keep the graph honest: kinds stay separate, a shared label never
 * merges anything, identity is an append-only reviewer decision with a valid
 * temporal window, splits roll back without deleting lineage, and UNKNOWN or
 * DISPUTED claims are never presented as verified.
 */

const quiet = { info: () => {}, warn: () => {} }

type Mq = Awaited<ReturnType<typeof bootMoonQl>>
const dataOf = <T>(res: { json(): unknown }): T => (res.json() as { data: T }).data

interface NodeView {
  stableId: string
  kind: string
  perspective: string
  labelEn: string
  labelId: string
  description: string
  identityStatus: string
  identityVersion: number
  validFrom: string | null
  validTo: string | null
  unilexStableId: string | null
  componentId: string
  aliases: Array<{
    aliasCode: string
    alias: string
    languageCode: string
    scriptCode: string
    direction: 'ltr' | 'rtl'
    perspective: string
    status: string
    source: { code: string | null; reviewStatus: string | null } | null
  }>
  source: { code: string | null; reviewStatus: string | null; citation: string | null } | null
}

interface EdgeView {
  edgeCode: string
  relationType: string
  perspective: string
  epistemicStatus: string
  statusLabel: string
  verified: boolean
  from: string
  to: string
  reviewer: string | null
  reason: string | null
  evidenceRef: string | null
  source: { code: string | null; citation: string | null; reviewStatus: string | null } | null
}

interface IdentityView {
  reviewCode: string
  pairCode: string
  left: string
  right: string
  identityKind: string
  decision: string
  candidate: boolean
  activeMerge: boolean
  superseded: boolean
  reviewer: string | null
  reason: string | null
  evidenceRef: string | null
  effectiveFrom: string | null
  effectiveTo: string | null
  decidedAt: string | null
}

interface Projection {
  state: string
  graphId: string
  registry: {
    version: string
    status: string
    entityCount: number
    notice: string
    pins: { decision: { ref: string; sha256: string } }
  }
  authority: { canonicalTables: string[]; readOnly: boolean; notice: string }
  counts: {
    nodes: number
    aliases: number
    edges: number
    verifiedEdges: number
    identityReviews: number
    activeMerges: number
    components: number
    unresolvedConflicts: number
  }
  options: { perspectives: string[]; kinds: string[]; epistemicStatuses: string[] }
  nodes: NodeView[]
  edges: EdgeView[]
  identityDecisions: IdentityView[]
  conflicts: Array<{ type: string; code: string; status: string; detail: string; title: string }>
  sources: Array<{ code: string | null }>
}

interface ConflictQueue {
  state: string
  graphId: string
  total: number
  counts: Record<string, number>
  items: Array<{ type: string; code: string; status: string }>
  rubric: {
    reviewerRequired: boolean
    evidenceRequiredForDecision: boolean
    automaticMerge: boolean
    unresolvedAllowed: boolean
    notice: string
  }
}

interface MergeResult {
  state: string
  review: { reviewCode: string; decision: string; pairCode: string; effectiveFrom: string | null }
  entities: Array<{ stableId: string; identityStatus: string; identityVersion: number }>
  graphId: string
  notice: string
}

interface EdgeResult {
  state: string
  edge: { edgeCode: string; epistemicStatus: string; verified: boolean }
  graphId: string
  notice: string
}

async function makeApp() {
  const app = Fastify({ logger: false })
  const moonql = await bootMoonQl({
    addons: [base, auth, ontology],
    env: { MOONQL_AUTH_ADMIN_PASSWORD: TEST_ADMIN_PASSWORD },
    seedPolicy: 'off',
    cronEnabled: false,
    log: quiet,
  })
  await app.register(envelope)
  await app.register(moonqlRest, { prefix: '/orm', instance: moonql })
  await app.ready()
  return { app, moonql }
}

async function constellation(app: FastifyInstance): Promise<Projection> {
  const res = await app.inject().get('/orm/ontology/constellation').end()
  assert.equal(res.statusCode, 200, res.body)
  return dataOf<Projection>(res)
}

async function sourceRef(moonql: Mq, code: string): Promise<string> {
  const sources = await moonql.model('onto_sources').list({ where: { code } })
  const source = sources[0]
  if (!source) throw new Error(`source ${code} missing`)
  return String(source.id)
}

async function makeEntity(
  moonql: Mq,
  stableId: string,
  extra: Record<string, unknown> = {},
): Promise<Record<string, unknown>> {
  return moonql.model('onto_entities').create({
    stableId,
    kind: 'ACTOR',
    perspective: 'HISTORICAL_CRITICAL',
    labelEn: `Test actor ${stableId}`,
    labelId: `Aktor uji ${stableId}`,
    description: `A test-only entity ${stableId}; not part of the seeded boundary set.`,
    sourceRef: await sourceRef(moonql, 'm02-01-disambiguation'),
    validFrom: null,
    validTo: null,
    identityStatus: 'CANDIDATE',
    identityVersion: 1,
    registryVersion: 'test-fixture',
    unilexStableId: null,
    ...extra,
  })
}

test('M10-01: kinds, aliases and edges stay separate and sourced', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })

  const projection = await constellation(app)
  assert.equal(projection.state, 'ok')
  assert.equal(projection.registry.version, '1.0.0')
  assert.equal(projection.registry.status, 'REVIEWED_BASELINE')
  assert.equal(projection.registry.entityCount, 8)
  assert.match(projection.registry.notice, /never merged automatically/)
  assert.equal(projection.registry.pins.decision.sha256, 'ee1836db96543f96cc88a1996a6a31cbc5cb099a82c07e3e0a8bc033fd6a3b95')
  assert.match(projection.graphId, /^gph_[a-f0-9]{16}$/)
  assert.equal(projection.authority.readOnly, true)
  assert.deepEqual(projection.authority.canonicalTables, [
    'onto_entities',
    'onto_aliases',
    'onto_relations',
    'onto_identity_reviews',
  ])

  assert.equal(projection.nodes.length, 8)
  assert.equal(projection.counts.nodes, 8)
  assert.equal(projection.counts.edges, 7)
  assert.equal(projection.counts.activeMerges, 0)
  assert.equal(projection.counts.components, 8)
  assert.deepEqual([...new Set(projection.nodes.map((node) => node.kind))].sort(), ['ACTOR', 'CHARACTER', 'ENTITY'])
  assert.ok(projection.options.perspectives.includes('SUFI_STUDY'))
  assert.ok(projection.options.epistemicStatuses.includes('UNKNOWN'))

  for (const node of projection.nodes) {
    assert.match(node.stableId, /^O[0-9]{3}$/)
    assert.ok(node.description.length > 0, `${node.stableId} needs a description`)
    assert.equal(node.source?.reviewStatus, 'APPROVED_FOR_CITATION', `${node.stableId} needs an approved source`)
    assert.ok(node.identityVersion >= 1)
    for (const alias of node.aliases) {
      assert.ok(alias.languageCode, `${alias.aliasCode} needs a language`)
      assert.ok(alias.scriptCode, `${alias.aliasCode} needs a script`)
      assert.match(alias.direction, /^(ltr|rtl)$/)
      assert.ok(alias.source?.code, `${alias.aliasCode} needs a source`)
    }
  }

  const allah = projection.nodes.find((node) => node.stableId === 'O001')
  assert.ok(allah)
  assert.equal(allah.kind, 'ENTITY')
  assert.equal(allah.perspective, 'ISLAMIC_SCRIPTURE')
  assert.equal(allah.unilexStableId, 'S001')
  const arabic = allah.aliases.find((alias) => alias.scriptCode === 'Arab')
  assert.ok(arabic)
  assert.equal(arabic.direction, 'rtl')
  assert.match(arabic.alias, /الله/)

  const shadowWorkspace = projection.nodes.find((node) => node.stableId === 'O006')
  const shadowCharacter = projection.nodes.find((node) => node.stableId === 'O007')
  assert.ok(shadowWorkspace && shadowCharacter)
  assert.equal(shadowWorkspace.kind, 'ENTITY')
  assert.equal(shadowCharacter.kind, 'CHARACTER')
  assert.notEqual(shadowWorkspace.kind, shadowCharacter.kind)

  assert.ok(projection.edges.every((edge) => edge.relationType !== 'sameAs'))
  assert.equal(new Set(projection.edges.map((edge) => edge.edgeCode)).size, projection.edges.length)
  for (const edge of projection.edges) {
    assert.ok(edge.source?.code, `${edge.edgeCode} needs a source code`)
    assert.ok(edge.perspective)
    if (edge.epistemicStatus === 'VERIFIED') {
      assert.equal(edge.verified, true)
      assert.ok(edge.reviewer && edge.evidenceRef)
    } else {
      assert.equal(edge.verified, false, `${edge.edgeCode} must not be presented as verified`)
    }
  }

  const unknown = projection.edges.find((edge) => edge.edgeCode === 'EDG-O003-O005-relatedTo-SUFI_STUDY')
  assert.ok(unknown)
  assert.equal(unknown.epistemicStatus, 'UNKNOWN')
  assert.equal(unknown.statusLabel, 'Unknown — unresolved')
  const disputed = projection.edges.find((edge) => edge.edgeCode === 'EDG-O003-O005-relatedTo-CREATIVE_FICTION')
  assert.ok(disputed)
  assert.equal(disputed.epistemicStatus, 'DISPUTED')
  assert.equal(disputed.statusLabel, 'Disputed — unresolved')
  const asserted = projection.edges.find((edge) => edge.edgeCode === 'EDG-O008-O001-distinctFrom')
  assert.ok(asserted)
  assert.equal(asserted.epistemicStatus, 'ASSERTED')
  assert.equal(asserted.statusLabel, 'Asserted — not verified')

  const again = await constellation(app)
  assert.equal(again.graphId, projection.graphId, 'the graph ID is deterministic for unchanged canonical state')
})

test('M10-02/04: same label never merges; contradictions and missing evidence are refused', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  const headers = await adminHeaders(app, '/orm')

  const before = await constellation(app)
  const pending = before.identityDecisions.find((review) => review.pairCode === 'O006:O007')
  assert.ok(pending)
  assert.equal(pending.decision, 'PENDING')
  assert.equal(pending.candidate, true)
  assert.equal(pending.activeMerge, false)
  assert.equal(pending.reviewer, null)
  assert.match(pending.reason ?? '', /No evidence yet/)
  const shadowNodes = before.nodes.filter((node) => ['O006', 'O007'].includes(node.stableId))
  assert.equal(shadowNodes.length, 2)
  assert.notEqual(shadowNodes[0]?.componentId, shadowNodes[1]?.componentId, 'a candidate is not a merge')

  const rejected = before.identityDecisions.filter((review) => review.pairCode === 'O003:O004')
  assert.equal(rejected.length, 1)
  assert.equal(rejected[0]?.decision, 'REJECTED')
  assert.ok(rejected[0]?.reviewer)
  assert.ok(rejected[0]?.evidenceRef)

  const anonymous = await app
    .inject()
    .post('/orm/ontology/merges/decide')
    .body({
      leftEntity: 'O004',
      rightEntity: 'O005',
      identityKind: 'SAME_ENTITY',
      decision: 'APPROVED_MERGE',
      reviewer: 'nobody',
      reason: 'x',
      evidenceRef: 'x',
      effectiveFrom: '2026-01-01T00:00:00.000Z',
    })
    .end()
  assert.equal(anonymous.statusCode, 401)

  const blocked = await app
    .inject()
    .post('/orm/ontology/merges/decide')
    .headers(headers)
    .body({
      leftEntity: 'O001',
      rightEntity: 'O002',
      identityKind: 'SAME_ENTITY',
      decision: 'APPROVED_MERGE',
      reviewer: 'Reviewer A',
      reason: 'Trying to merge the divine name with the acronym.',
      evidenceRef: 'docs/decisions/M02-01-disambiguation-registry.md',
      effectiveFrom: '2026-01-01T00:00:00.000Z',
    })
    .end()
  assert.equal(blocked.statusCode, 400)
  assert.match(blocked.json().error.message, /distinctFrom edge separates/)

  const noEvidence = await app
    .inject()
    .post('/orm/ontology/merges/decide')
    .headers(headers)
    .body({
      leftEntity: 'O004',
      rightEntity: 'O005',
      identityKind: 'SAME_ENTITY',
      decision: 'REJECTED',
      reviewer: 'Reviewer A',
      reason: 'No evidence offered.',
    })
    .end()
  assert.equal(noEvidence.statusCode, 400)

  const revokedWithoutMerge = await app
    .inject()
    .post('/orm/ontology/merges/decide')
    .headers(headers)
    .body({
      leftEntity: 'O004',
      rightEntity: 'O005',
      identityKind: 'SAME_ENTITY',
      decision: 'REVOKED',
      reviewer: 'Reviewer A',
      reason: 'Nothing to split.',
      evidenceRef: 'docs/audit/M10-ontology-identity.md',
    })
    .end()
  assert.equal(revokedWithoutMerge.statusCode, 400)
  assert.match(revokedWithoutMerge.json().error.message, /no active merge/)

  const approved = await app
    .inject()
    .post('/orm/ontology/merges/decide')
    .headers(headers)
    .body({
      leftEntity: 'O004',
      rightEntity: 'O005',
      identityKind: 'SAME_ENTITY',
      decision: 'APPROVED_MERGE',
      reviewer: 'Reviewer A',
      reason: 'The test fixture establishes one referent for the review window.',
      evidenceRef: 'docs/audit/M10-ontology-identity.md',
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      effectiveTo: '2026-12-31T00:00:00.000Z',
    })
    .end()
  assert.equal(approved.statusCode, 201, approved.body)
  const merged = dataOf<MergeResult>(approved)
  assert.equal(merged.state, 'recorded')
  assert.equal(merged.review.decision, 'APPROVED_MERGE')
  assert.equal(merged.entities.length, 2)
  assert.ok(merged.entities.every((entity) => entity.identityStatus === 'MERGED'))
  assert.ok(merged.entities.every((entity) => entity.identityVersion === 2))
  assert.match(merged.notice, /not deleted or rewritten/)

  const after = await constellation(app)
  assert.equal(after.counts.activeMerges, 1)
  const zillVariant = after.nodes.find((node) => node.stableId === 'O004')
  const zillTrack = after.nodes.find((node) => node.stableId === 'O005')
  assert.equal(zillVariant?.componentId, zillTrack?.componentId)
  const active = after.identityDecisions.find((review) => review.pairCode === 'O004:O005' && review.activeMerge)
  assert.ok(active)
  assert.equal(active?.effectiveFrom, '2026-01-01T00:00:00.000Z')
  assert.equal(after.counts.components, 7)

  const stillSeparate = after.nodes.filter((node) => ['O003', 'O004'].includes(node.stableId))
  assert.equal(stillSeparate.length, 2)
  assert.notEqual(stillSeparate[0]?.componentId, stillSeparate[1]?.componentId)
})

test('M10-06: temporal merges are validated and a split restores the graph without losing history', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  const headers = await adminHeaders(app, '/orm')
  await makeEntity(moonql, 'O090', {
    labelEn: 'Temporal actor A',
    validFrom: '1900-01-01T00:00:00.000Z',
    validTo: '1950-01-01T00:00:00.000Z',
  })
  await makeEntity(moonql, 'O091', {
    labelEn: 'Temporal actor B',
    validFrom: '1900-01-01T00:00:00.000Z',
    validTo: '1960-01-01T00:00:00.000Z',
  })

  const baseMerge = {
    leftEntity: 'O090',
    rightEntity: 'O091',
    identityKind: 'SAME_ACTOR',
    decision: 'APPROVED_MERGE',
    reviewer: 'Temporal reviewer',
    reason: 'Temporal review of one referent.',
    evidenceRef: 'docs/audit/M10-ontology-identity.md',
  }

  const outside = await app
    .inject()
    .post('/orm/ontology/merges/decide')
    .headers(headers)
    .body({ ...baseMerge, effectiveFrom: '2000-01-01T00:00:00.000Z', effectiveTo: '2001-01-01T00:00:00.000Z' })
    .end()
  assert.equal(outside.statusCode, 400)
  assert.match(outside.json().error.message, /before O090 exists|before O091 exists|outlives/)

  const outlives = await app
    .inject()
    .post('/orm/ontology/merges/decide')
    .headers(headers)
    .body({ ...baseMerge, effectiveFrom: '1930-01-01T00:00:00.000Z', effectiveTo: '1955-01-01T00:00:00.000Z' })
    .end()
  assert.equal(outlives.statusCode, 400)
  assert.match(outlives.json().error.message, /outlives O090/)

  const valid = await app
    .inject()
    .post('/orm/ontology/merges/decide')
    .headers(headers)
    .body({ ...baseMerge, effectiveFrom: '1930-01-01T00:00:00.000Z', effectiveTo: '1940-01-01T00:00:00.000Z' })
    .end()
  assert.equal(valid.statusCode, 201, valid.body)
  const merged = dataOf<MergeResult>(valid)
  const graphAfterMerge = await constellation(app)
  const mergedA = graphAfterMerge.nodes.find((node) => node.stableId === 'O090')
  const mergedB = graphAfterMerge.nodes.find((node) => node.stableId === 'O091')
  assert.equal(mergedA?.componentId, mergedB?.componentId)
  assert.equal(graphAfterMerge.graphId, merged.graphId)

  const split = await app
    .inject()
    .post('/orm/ontology/merges/decide')
    .headers(headers)
    .body({
      leftEntity: 'O090',
      rightEntity: 'O091',
      identityKind: 'SAME_ACTOR',
      decision: 'REVOKED',
      reviewer: 'Temporal reviewer',
      reason: 'A later source shows the two actors are distinct.',
      evidenceRef: 'docs/audit/M10-ontology-identity.md',
    })
    .end()
  assert.equal(split.statusCode, 201, split.body)
  const splitResult = dataOf<MergeResult>(split)
  assert.match(splitResult.notice, /separately again/)
  const afterSplit = await constellation(app)
  const splitA = afterSplit.nodes.find((node) => node.stableId === 'O090')
  const splitB = afterSplit.nodes.find((node) => node.stableId === 'O091')
  assert.notEqual(splitA?.componentId, splitB?.componentId)
  assert.equal(afterSplit.counts.activeMerges, 0)

  const history = afterSplit.identityDecisions.filter((review) => review.pairCode === 'O090:O091')
  assert.equal(history.length, 2)
  assert.deepEqual(history.map((review) => review.decision), ['APPROVED_MERGE', 'REVOKED'])
  assert.equal(history[1]?.superseded, false)
  assert.equal(history[0]?.superseded, true)
  assert.match(history[1]?.evidenceRef ?? '', /M10-ontology-identity/)

  const reviews = await moonql.model('onto_identity_reviews').list({ where: { pairCode: 'O090:O091' } })
  assert.equal(reviews.length, 2, 'splits append a decision; they never delete the old one')
  const log = await moonql.model('onto_review_log').list({ where: { targetRef: 'O090:O091' } })
  assert.ok(log.some((row) => row.action === 'APPROVE_MERGE'))
  assert.ok(log.some((row) => row.action === 'SPLIT'))

  const entities = await moonql.model('onto_entities').list({ where: { stableId: { in: ['O090', 'O091'] } } })
  assert.equal(entities.length, 2)
  assert.ok(entities.every((row) => row.identityStatus === 'REVIEWED'))
  assert.ok(entities.every((row) => Number(row.identityVersion) === 3))
  assert.ok(entities.every((row) => String(row.sourceRef).length > 0), 'source lineage survives the split')

  const rejectedAfterSplit = await app
    .inject()
    .post('/orm/ontology/merges/decide')
    .headers(headers)
    .body({
      leftEntity: 'O090',
      rightEntity: 'O091',
      identityKind: 'SAME_ACTOR',
      decision: 'REJECTED',
      reviewer: 'Temporal reviewer',
      reason: 'Negative identity decision recorded after the split.',
      evidenceRef: 'docs/audit/M10-ontology-identity.md',
    })
    .end()
  assert.equal(rejectedAfterSplit.statusCode, 201)
  assert.equal((await constellation(app)).counts.activeMerges, 0)
})

test('M10-03/07: UNKNOWN and DISPUTED edges stay unresolved, and the queue is admin-only', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  const headers = await adminHeaders(app, '/orm')

  const anonymousQueue = await app.inject().get('/orm/ontology/conflicts').end()
  assert.equal(anonymousQueue.statusCode, 401)

  const queueRes = await app.inject().get('/orm/ontology/conflicts').headers(headers).end()
  assert.equal(queueRes.statusCode, 200)
  const queue = dataOf<ConflictQueue>(queueRes)
  assert.equal(queue.state, 'ok')
  assert.equal(queue.rubric.reviewerRequired, true)
  assert.equal(queue.rubric.evidenceRequiredForDecision, true)
  assert.equal(queue.rubric.automaticMerge, false)
  assert.equal(queue.rubric.unresolvedAllowed, true)
  assert.match(queue.rubric.notice, /UNKNOWN may stay unresolved/)
  assert.ok(queue.items.some((item) => item.type === 'RELATION' && item.status === 'UNKNOWN'))
  assert.ok(queue.items.some((item) => item.type === 'RELATION' && item.status === 'DISPUTED'))
  assert.ok(queue.items.some((item) => item.type === 'IDENTITY' && item.status === 'PENDING'))
  assert.ok(queue.items.some((item) => item.type === 'ALIAS' && item.status === 'COLLISION'))
  assert.ok(queue.items.some((item) => item.type === 'ENTITY' && item.status === 'CONTESTED'))

  const anonymousEdge = await app
    .inject()
    .post('/orm/ontology/edges/register')
    .body({
      sourceEntity: 'O004',
      targetEntity: 'O005',
      relationType: 'relatedTo',
      perspective: 'HISTORICAL_CRITICAL',
      sourceCode: 'm09-unilex-review',
      epistemicStatus: 'UNKNOWN',
      reason: 'x',
    })
    .end()
  assert.equal(anonymousEdge.statusCode, 401)

  const unknown = await app
    .inject()
    .post('/orm/ontology/edges/register')
    .headers(headers)
    .body({
      sourceEntity: 'O004',
      targetEntity: 'O005',
      relationType: 'relatedTo',
      perspective: 'HISTORICAL_CRITICAL',
      sourceCode: 'm09-unilex-review',
      epistemicStatus: 'UNKNOWN',
      reason: 'A candidate connection; no reviewer has accepted it.',
    })
    .end()
  assert.equal(unknown.statusCode, 201, unknown.body)
  const unknownEdge = dataOf<EdgeResult>(unknown)
  assert.equal(unknownEdge.edge.verified, false)
  assert.equal(unknownEdge.edge.epistemicStatus, 'UNKNOWN')

  const unknownView = (await constellation(app)).edges.find(
    (edge) => edge.edgeCode === unknownEdge.edge.edgeCode,
  )
  assert.ok(unknownView)
  assert.equal(unknownView?.verified, false)
  assert.equal(unknownView?.statusLabel, 'Unknown — unresolved')

  const missingEvidence = await app
    .inject()
    .post('/orm/ontology/edges/register')
    .headers(headers)
    .body({
      sourceEntity: 'O004',
      targetEntity: 'O005',
      relationType: 'distinctFrom',
      perspective: 'GENERAL',
      sourceCode: 'm09-unilex-review',
      epistemicStatus: 'VERIFIED',
      reviewer: 'Reviewer B',
      reason: 'Verified without evidence.',
    })
    .end()
  assert.equal(missingEvidence.statusCode, 400)

  await moonql.model('onto_sources').create({
    code: 'unapproved-test-source',
    title: 'Unapproved test source',
    sourceType: 'SCHOLARLY',
    citation: 'test fixture',
    reviewStatus: 'PROPOSED',
  })
  const unapproved = await app
    .inject()
    .post('/orm/ontology/edges/register')
    .headers(headers)
    .body({
      sourceEntity: 'O004',
      targetEntity: 'O005',
      relationType: 'distinctFrom',
      perspective: 'GENERAL',
      sourceCode: 'unapproved-test-source',
      epistemicStatus: 'VERIFIED',
      reviewer: 'Reviewer B',
      reason: 'Source is not approved for citation.',
      evidenceRef: 'test fixture',
    })
    .end()
  assert.equal(unapproved.statusCode, 400)
  assert.match(unapproved.json().error.message, /not approved for citation/)

  const verified = await app
    .inject()
    .post('/orm/ontology/edges/register')
    .headers(headers)
    .body({
      sourceEntity: 'O004',
      targetEntity: 'O005',
      relationType: 'distinctFrom',
      perspective: 'HISTORICAL_CRITICAL',
      sourceCode: 'm09-unilex-review',
      epistemicStatus: 'VERIFIED',
      reviewer: 'Reviewer B',
      reason: 'The terminology review separates the variant from the character.',
      evidenceRef: 'docs/audit/M09-unilex-terminology.md',
    })
    .end()
  assert.equal(verified.statusCode, 201, verified.body)
  const verifiedEdge = dataOf<EdgeResult>(verified)
  assert.equal(verifiedEdge.edge.verified, true)
  const verifiedView = (await constellation(app)).edges.find(
    (edge) => edge.edgeCode === verifiedEdge.edge.edgeCode,
  )
  assert.equal(verifiedView?.statusLabel, 'Verified by reviewer')
  assert.ok(verifiedView?.source?.citation)
  assert.ok(verifiedView?.reviewer)
  assert.ok(verifiedView?.evidenceRef)
})

test('M10-05: the projection is read-only and its graph ID tracks canonical state', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })

  const headers = await adminHeaders(app, '/orm')
  const first = await constellation(app)
  const entityCount = await moonql.model('onto_entities').count()
  const relationCount = await moonql.model('onto_relations').count()
  const reviewCount = await moonql.model('onto_identity_reviews').count()
  await constellation(app)
  await constellation(app)
  assert.equal(await moonql.model('onto_entities').count(), entityCount, 'GET must not write')
  assert.equal(await moonql.model('onto_relations').count(), relationCount, 'GET must not write')
  assert.equal(await moonql.model('onto_identity_reviews').count(), reviewCount, 'GET must not write')

  const entity = await moonql.model('onto_entities').list({ where: { stableId: 'O001' } })
  assert.ok(entity[0])
  const alias = await moonql.model('onto_aliases').list({ where: { aliasCode: 'AL001' } })
  assert.ok(alias[0])
  await moonql.model('onto_aliases').update(String(alias[0].id), {
    status: 'ATTESTED',
    reviewer: 'Alias reviewer',
    reason: 'The Arabic surface is attested for the theological referent.',
    evidenceRef: 'docs/decisions/M02-01-disambiguation-registry.md',
  })
  const afterAlias = await constellation(app)
  assert.notEqual(afterAlias.graphId, first.graphId, 'canonical state changes the graph ID')
  const allahAgain = afterAlias.nodes.find((node) => node.stableId === 'O001')
  const arabic = allahAgain?.aliases.find((row) => row.aliasCode === 'AL001')
  assert.equal(arabic?.status, 'ATTESTED')
  assert.equal(arabic?.direction, 'rtl')
  assert.equal(arabic?.languageCode, 'ar')

  const badAlias = await app
    .inject()
    .patch(`/orm/onto_aliases/${String(alias[0].id)}`)
    .headers(headers)
    .body({ status: 'ATTESTED' })
    .end()
  assert.equal(badAlias.statusCode, 400, 'attesting an alias needs reviewer, reason and evidence in the same update')

  const duplicateAlias = await app
    .inject()
    .post('/orm/onto_aliases')
    .headers(headers)
    .body({
      aliasCode: 'AL090',
      entityRef: String(entity[0].id),
      alias: 'الله',
      languageCode: 'ar',
      scriptCode: 'Arab',
      perspective: 'ISLAMIC_SCRIPTURE',
      sourceRef: await sourceRef(moonql, 'quran-cairo-hafs'),
      status: 'CANDIDATE',
    })
    .end()
  assert.equal(duplicateAlias.statusCode, 409, 'the same surface cannot be attached twice to one entity')

  const blockedDelete = await app.inject().delete(`/orm/onto_entities/${String(entity[0].id)}`).end()
  assert.equal(blockedDelete.statusCode, 401, 'anonymous delete is refused before the lineage guard')
  const blockedEntityDelete = await app
    .inject()
    .delete(`/orm/onto_entities/${String(entity[0].id)}`)
    .headers(headers)
    .end()
  assert.equal(blockedEntityDelete.statusCode, 400)
  assert.match(blockedEntityDelete.json().error.message, /never deleted/)
})
