import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify from 'fastify'
import { bootMoonQl, moonqlRest } from '@moonwitness/moonql'
import base from '@moonwitness/moonql-base'
import auth from '@moonwitness/moonql-auth'
import ontology from '@moonwitness/moonql-ontology'
import envelope from '../src/plugins/envelope.js'
import { adminHeaders, TEST_ADMIN_PASSWORD } from './helpers/auth.js'

/**
 * M10: the ontology seed, identity decisions and read-only projection against
 * real PostgreSQL — the kinds, scripts and negative decisions must survive the
 * SQL engine, a merge must be a temporal reviewer decision, a split must restore
 * the graph without deleting lineage, and UNKNOWN/DISPUTED edges must never be
 * presented as verified.
 *
 * Runs only when a disposable database is handed in (CI has none):
 *   PARITY_DATABASE_URL=postgres://... pnpm --filter @moonwitness/arsy test
 */
const DB_URL = process.env.PARITY_DATABASE_URL ?? process.env.DATABASE_URL ?? ''
const quiet = { info: () => {}, warn: () => {} }

interface Projection {
  state: string
  graphId: string
  registry: { version: string; status: string; entityCount: number }
  authority: { readOnly: boolean; canonicalTables: string[] }
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
  review: { reviewerRequired: boolean; automaticMerge: boolean; unresolvedAllowed: boolean; notice: string }
  nodes: Array<{
    stableId: string
    kind: string
    perspective: string
    identityStatus: string
    identityVersion: number
    componentId: string
    source: { code: string | null; reviewStatus: string | null } | null
    aliases: Array<{ aliasCode: string; alias: string; languageCode: string; scriptCode: string; direction: string }>
  }>
  edges: Array<{ edgeCode: string; epistemicStatus: string; statusLabel: string; verified: boolean; reviewer: string | null; evidenceRef: string | null }>
  identityDecisions: Array<{
    reviewCode: string
    pairCode: string
    decision: string
    candidate: boolean
    activeMerge: boolean
    superseded: boolean
    effectiveFrom: string | null
  }>
  conflicts: Array<{ type: string; code: string; status: string }>
}

interface MergeResult {
  state: string
  review: { reviewCode: string; decision: string; pairCode: string }
  entities: Array<{ stableId: string; identityStatus: string; identityVersion: number }>
  graphId: string
  notice: string
}

interface EdgeResult {
  state: string
  edge: { edgeCode: string; epistemicStatus: string; verified: boolean }
  graphId: string
}

interface ConflictQueue {
  state: string
  total: number
  rubric: { reviewerRequired: boolean; evidenceRequiredForDecision: boolean; automaticMerge: boolean; unresolvedAllowed: boolean; notice: string }
  items: Array<{ type: string; status: string }>
}

const dataOf = <T>(res: { json(): unknown }): T => (res.json() as { data: T }).data

const TEST_EDGES = [
  'EDG-O004-O005-relatedTo-HISTORICAL_CRITICAL',
  'EDG-O004-O005-distinctFrom-HISTORICAL_CRITICAL',
]

test(
  'M10: ontology seed, identity decisions and projection survive PostgreSQL',
  { skip: DB_URL ? false : 'no PARITY_DATABASE_URL/DATABASE_URL — the PG slice needs a server' },
  async (t) => {
    const moonql = await bootMoonQl({
      databaseUrl: DB_URL,
      addons: [base, auth, ontology],
      env: { MOONQL_AUTH_ADMIN_PASSWORD: TEST_ADMIN_PASSWORD },
      seedPolicy: 'off',
      cronEnabled: false,
      log: quiet,
    })
    const app = Fastify({ logger: false })
    await app.register(envelope)
    await app.register(moonqlRest, { prefix: '/orm', instance: moonql })
    await app.ready()

    const cleanup = async (): Promise<void> => {
      await moonql.model('onto_identity_reviews').removeWhere({ pairCode: 'O004:O005' })
      await moonql.model('onto_review_log').removeWhere({ targetRef: 'O004:O005' })
      for (const edgeCode of TEST_EDGES) {
        await moonql.model('onto_relations').removeWhere({ edgeCode })
        await moonql.model('onto_review_log').removeWhere({ targetRef: edgeCode })
      }
      const entities = await moonql.model('onto_entities').list({ where: { stableId: { in: ['O004', 'O005'] } } })
      for (const entity of entities) {
        await moonql.model('onto_entities').update(String(entity.id), {
          identityStatus: 'REVIEWED',
          identityVersion: 1,
        })
      }
    }

    await cleanup()

    t.after(async () => {
      await cleanup()
      await app.close()
      await moonql.close()
    })

    assert.equal(moonql.engine, 'pg', 'this drill must not silently fall back to memory')

    const sources = await moonql.model('onto_sources').list({ limit: 50 })
    const entities = await moonql.model('onto_entities').list({ limit: 50 })
    const aliases = await moonql.model('onto_aliases').list({ limit: 50 })
    const relations = await moonql.model('onto_relations').list({ limit: 50 })
    const reviews = await moonql.model('onto_identity_reviews').list({ limit: 50 })
    const log = await moonql.model('onto_review_log').list({ limit: 50 })
    assert.equal(sources.length, 5)
    assert.equal(entities.length, 8)
    assert.equal(aliases.length, 7)
    assert.equal(relations.length, 7)
    assert.equal(reviews.length, 4)
    assert.equal(log.length, 3)

    const firstRes = await app.inject().get('/orm/ontology/constellation').end()
    assert.equal(firstRes.statusCode, 200, firstRes.body)
    const first = dataOf<Projection>(firstRes)
    assert.equal(first.state, 'ok')
    assert.equal(first.registry.version, '1.0.0')
    assert.equal(first.registry.status, 'REVIEWED_BASELINE')
    assert.equal(first.registry.entityCount, 8)
    assert.equal(first.authority.readOnly, true)
    assert.deepEqual(first.authority.canonicalTables, [
      'onto_entities',
      'onto_aliases',
      'onto_relations',
      'onto_identity_reviews',
    ])
    assert.match(first.graphId, /^gph_[a-f0-9]{16}$/)
    assert.equal(first.counts.nodes, 8)
    assert.equal(first.counts.aliases, 7)
    assert.equal(first.counts.edges, 7)
    assert.equal(first.counts.verifiedEdges, 4)
    assert.equal(first.counts.identityReviews, 4)
    assert.equal(first.counts.activeMerges, 0)
    assert.equal(first.counts.components, 8)
    assert.equal(first.counts.unresolvedConflicts, 7)
    assert.equal(first.review.reviewerRequired, true)
    assert.equal(first.review.automaticMerge, false)
    assert.equal(first.review.unresolvedAllowed, true)
    assert.match(first.review.notice, /UNKNOWN may stay unresolved/)

    const allah = first.nodes.find((node) => node.stableId === 'O001')
    assert.ok(allah)
    assert.equal(allah.identityStatus, 'REVIEWED')
    assert.equal(allah.source?.reviewStatus, 'APPROVED_FOR_CITATION')
    const arabic = allah.aliases.find((alias) => alias.aliasCode === 'AL001')
    assert.ok(arabic, 'the Arabic alias survives the SQL round-trip')
    assert.equal(arabic.scriptCode, 'Arab')
    assert.equal(arabic.languageCode, 'ar')
    assert.equal(arabic.direction, 'rtl')
    assert.match(arabic.alias, /الله/)

    const shadow = first.nodes.filter((node) => ['O006', 'O007'].includes(node.stableId))
    assert.equal(shadow.length, 2)
    assert.notEqual(shadow[0]?.componentId, shadow[1]?.componentId, 'a pending candidate is not a merge')

    const rejected = first.identityDecisions.find((review) => review.pairCode === 'O003:O004')
    assert.equal(rejected?.decision, 'REJECTED')
    const pending = first.identityDecisions.find((review) => review.pairCode === 'O006:O007')
    assert.equal(pending?.decision, 'PENDING')
    assert.equal(pending?.candidate, true)
    assert.equal(pending?.activeMerge, false)

    const rawReviews = await app.inject().get('/orm/onto_identity_reviews').end()
    assert.equal(rawReviews.statusCode, 401, 'identity reviews stay admin-only on pg')
    const rawLog = await app.inject().get('/orm/onto_review_log').end()
    assert.equal(rawLog.statusCode, 401, 'the review log stays admin-only on pg')
    const anonymousQueue = await app.inject().get('/orm/ontology/conflicts').end()
    assert.equal(anonymousQueue.statusCode, 401)

    const headers = await adminHeaders(app, '/orm')
    const queueRes = await app.inject().get('/orm/ontology/conflicts').headers(headers).end()
    assert.equal(queueRes.statusCode, 200, queueRes.body)
    const queue = dataOf<ConflictQueue>(queueRes)
    assert.equal(queue.state, 'ok')
    assert.equal(queue.rubric.reviewerRequired, true)
    assert.equal(queue.rubric.evidenceRequiredForDecision, true)
    assert.equal(queue.rubric.automaticMerge, false)
    assert.equal(queue.rubric.unresolvedAllowed, true)
    assert.ok(queue.items.some((item) => item.type === 'RELATION' && item.status === 'UNKNOWN'))
    assert.ok(queue.items.some((item) => item.type === 'RELATION' && item.status === 'DISPUTED'))
    assert.ok(queue.items.some((item) => item.type === 'IDENTITY' && item.status === 'PENDING'))
    assert.ok(queue.items.some((item) => item.type === 'ALIAS' && item.status === 'COLLISION'))

    const graphBeforeMerge = (await app.inject().get('/orm/ontology/constellation').end()).json() as {
      data: Projection
    }
    const mergeRes = await app
      .inject()
      .post('/orm/ontology/merges/decide')
      .headers(headers)
      .body({
        leftEntity: 'O004',
        rightEntity: 'O005',
        identityKind: 'SAME_ENTITY',
        decision: 'APPROVED_MERGE',
        reviewer: 'PG Reviewer',
        reason: 'The drill establishes one referent inside a bounded window.',
        evidenceRef: 'docs/audit/M10-ontology-identity.md',
        effectiveFrom: '2026-01-01T00:00:00.000Z',
        effectiveTo: '2026-12-31T00:00:00.000Z',
      })
      .end()
    assert.equal(mergeRes.statusCode, 201, mergeRes.body)
    const merged = dataOf<MergeResult>(mergeRes)
    assert.equal(merged.state, 'recorded')
    assert.ok(merged.entities.every((entity) => entity.identityStatus === 'MERGED'))
    assert.ok(merged.entities.every((entity) => entity.identityVersion === 2))
    assert.match(merged.notice, /not deleted or rewritten/)

    const afterMergeRes = await app.inject().get('/orm/ontology/constellation').end()
    const afterMerge = dataOf<Projection>(afterMergeRes)
    assert.equal(afterMerge.graphId, merged.graphId)
    assert.notEqual(afterMerge.graphId, graphBeforeMerge.data.graphId, 'a merge changes the canonical graph ID')
    assert.equal(afterMerge.counts.activeMerges, 1)
    assert.equal(afterMerge.counts.components, 7)
    const zillVariant = afterMerge.nodes.find((node) => node.stableId === 'O004')
    const zillTrack = afterMerge.nodes.find((node) => node.stableId === 'O005')
    assert.equal(zillVariant?.componentId, zillTrack?.componentId)
    const active = afterMerge.identityDecisions.find((review) => review.pairCode === 'O004:O005' && review.activeMerge)
    assert.equal(active?.effectiveFrom, '2026-01-01T00:00:00.000Z')
    assert.equal((await moonql.model('onto_identity_reviews').list({ where: { pairCode: 'O004:O005' } })).length, 1)

    const splitRes = await app
      .inject()
      .post('/orm/ontology/merges/decide')
      .headers(headers)
      .body({
        leftEntity: 'O004',
        rightEntity: 'O005',
        identityKind: 'SAME_ENTITY',
        decision: 'REVOKED',
        reviewer: 'PG Reviewer',
        reason: 'A later source shows the two referents are distinct.',
        evidenceRef: 'docs/audit/M10-ontology-identity.md',
      })
      .end()
    assert.equal(splitRes.statusCode, 201, splitRes.body)
    const split = dataOf<MergeResult>(splitRes)
    assert.match(split.notice, /separately again/)

    const afterSplit = dataOf<Projection>(await app.inject().get('/orm/ontology/constellation').end())
    assert.equal(afterSplit.counts.activeMerges, 0)
    assert.equal(afterSplit.counts.components, 8)
    const splitA = afterSplit.nodes.find((node) => node.stableId === 'O004')
    const splitB = afterSplit.nodes.find((node) => node.stableId === 'O005')
    assert.notEqual(splitA?.componentId, splitB?.componentId)
    const history = afterSplit.identityDecisions.filter((review) => review.pairCode === 'O004:O005')
    assert.equal(history.length, 2, 'the split appends a decision instead of deleting the merge')
    assert.equal(history.filter((review) => review.superseded).length, 1)
    assert.equal(history.filter((review) => review.decision === 'REVOKED' && review.activeMerge === false).length, 1)
    assert.equal((await moonql.model('onto_identity_reviews').list({ where: { pairCode: 'O004:O005' } })).length, 2)
    const identityLog = await moonql.model('onto_review_log').list({ where: { targetRef: 'O004:O005' } })
    assert.ok(identityLog.some((row) => row.action === 'APPROVE_MERGE'))
    assert.ok(identityLog.some((row) => row.action === 'SPLIT'))
    const updated = await moonql.model('onto_entities').list({ where: { stableId: { in: ['O004', 'O005'] } } })
    assert.ok(updated.every((row) => row.identityStatus === 'REVIEWED'))
    assert.ok(updated.every((row) => Number(row.identityVersion) === 3))
    assert.ok(updated.every((row) => String(row.sourceRef).length > 0), 'source lineage survives the split')

    const missingEvidence = await app
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
        reviewer: 'PG Reviewer',
        reason: 'Verified without evidence.',
      })
      .end()
    assert.equal(missingEvidence.statusCode, 400)

    const unknownRes = await app
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
    assert.equal(unknownRes.statusCode, 201, unknownRes.body)
    const unknownEdge = dataOf<EdgeResult>(unknownRes)
    assert.equal(unknownEdge.edge.epistemicStatus, 'UNKNOWN')
    assert.equal(unknownEdge.edge.verified, false)
    const unknownView = dataOf<Projection>(await app.inject().get('/orm/ontology/constellation').end())
    assert.equal(
      unknownView.edges.find((edge) => edge.edgeCode === unknownEdge.edge.edgeCode)?.statusLabel,
      'Unknown — unresolved',
    )

    const verifiedRes = await app
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
        reviewer: 'PG Reviewer',
        reason: 'The terminology review separates the variant from the study track.',
        evidenceRef: 'docs/audit/M09-unilex-terminology.md',
      })
      .end()
    assert.equal(verifiedRes.statusCode, 201, verifiedRes.body)
    const verifiedEdge = dataOf<EdgeResult>(verifiedRes)
    assert.equal(verifiedEdge.edge.verified, true)
    const storedEdge = (await moonql.model('onto_relations').list({ where: { edgeCode: verifiedEdge.edge.edgeCode } }))[0]
    assert.ok(storedEdge, 'the verified edge is a canonical SQL row')
    assert.equal(storedEdge.epistemicStatus, 'VERIFIED')
    assert.equal(storedEdge.reviewer, 'PG Reviewer')
    assert.equal(storedEdge.evidenceRef, 'docs/audit/M09-unilex-terminology.md')
    const verifiedView = dataOf<Projection>(await app.inject().get('/orm/ontology/constellation').end())
    assert.equal(
      verifiedView.edges.find((edge) => edge.edgeCode === verifiedEdge.edge.edgeCode)?.statusLabel,
      'Verified by reviewer',
    )

    const reads = await Promise.all([
      app.inject().get('/orm/ontology/constellation').end(),
      app.inject().get('/orm/ontology/constellation').end(),
    ])
    assert.ok(reads.every((res) => res.statusCode === 200))
    assert.equal((await moonql.model('onto_entities').count()), 8, 'GET must not write')
    assert.equal((await moonql.model('onto_relations').count()), 9, 'GET must not write')
    assert.equal((await moonql.model('onto_identity_reviews').count()), 6, 'GET must not write')
  },
)
