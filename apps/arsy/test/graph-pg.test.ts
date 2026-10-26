import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify from 'fastify'
import { bootMoonQl, moonqlRest } from '@moonwitness/moonql'
import base from '@moonwitness/moonql-base'
import auth from '@moonwitness/moonql-auth'
import ontology, { M02_SHA256, VISION_SHA256 } from '@moonwitness/moonql-ontology'
import graph from '@moonwitness/moonql-graph'
import envelope from '../src/plugins/envelope.js'
import { adminHeaders, TEST_ADMIN_PASSWORD } from './helpers/auth.js'

/**
 * M12: typed correlation candidates, immutable releases, the singleton pointer
 * and the derived adjacency against real PostgreSQL. The drill checks that
 * exact-SHA evidence survives SQL, sameAs is refused without a partial write,
 * the pointer is compare-and-swap, an immutable release cannot be rewritten or
 * deleted, adjacency can be dropped and rebuilt, and a revoked candidate stays
 * visible in history but leaves the next release.
 *
 * Runs only when a disposable database is handed in (CI has none):
 *   PARITY_DATABASE_URL=postgres://... pnpm --filter @moonwitness/arsy test
 */
const DB_URL = process.env.PARITY_DATABASE_URL ?? process.env.DATABASE_URL ?? ''
const quiet = { info: () => {}, warn: () => {} }

const SAME_AS_PENDING = 'GC-O003-O005-sameAs-SUFI_STUDY'
const APPROVED_CANDIDATE = 'GC-O008-O007-relatedTo-CREATIVE_FICTION'
const DEDUP_CANDIDATE = 'GC-O006-O007-distinctFrom-GENERAL'
const SEED_EDGE = 'EDG-O006-O007-distinctFrom'
const NEW_CANDIDATE = 'GC-O005-O001-relatedTo-GENERAL'
const NO_EVIDENCE_CANDIDATE = 'GC-O005-O002-distinctFrom-GENERAL'

interface CandidateView {
  candidateCode: string
  relationType: string
  status: string
  statusLabel: string
  approved: boolean
  pending: boolean
  revoked: boolean
  rejected: boolean
  inActiveRelease: boolean
  epistemicStatus: string
  evidence: { span: string | null; frame: string | null; sha: string | null; present: boolean; exactSha: boolean }
  source: { code: string | null; provenanceSha: string | null } | null
  reviewer: string | null
  decisionNote: string | null
}

interface ReleaseSummary {
  releaseCode: string
  graphSha: string
  edgeCount: number
  ontologyCount: number
  candidateCount: number
  deduplicatedCount: number
  builtAt: string | null
  active: boolean
}

interface Overview {
  active: ReleaseSummary | null
  pointer: { version: number; releaseCode: string | null; previousReleaseCode: string | null } | null
  separation: {
    candidates: { total: number; pending: number; approved: number; rejected: number; revoked: number }
    reviewed: { activeReleaseCode: string | null; edgeCount: number }
  }
  counts: {
    reviewedRelations: number
    candidates: number
    edgesInActiveRelease: number
    adjacencyRows: number
    adjacencyStale: boolean
  }
  adjacency: { derived: boolean; rebuildable: boolean; stale: boolean; rows: number; releaseCode: string | null }
  candidates: CandidateView[]
  policy: { evidenceAtExactSha: boolean; evidenceSpanRequiredForApproval: boolean; sameAsApproval: string }
}

interface DetailView {
  relation: {
    code: string
    kind: string
    status: string | null
    epistemicStatus: string
    verified?: boolean
    inActiveRelease: boolean
    evidence: { frame: string | null; sha: string | null; exactSha: boolean }
    source: { code: string | null; provenanceSha: string | null } | null
  }
  release: { releaseCode: string; graphSha: string } | null
  policy: { sameAsApproval: string; releaseImmutable: boolean; automaticApproval: boolean }
}

interface ExportView {
  schema: string
  graphSha: string
  lineage: {
    sources: Array<{ code: string; sha256: string }>
    ontologyEdges: string[]
    candidates: string[]
    deduplicated: Array<{ code: string; duplicateOf: string }>
  }
}

const dataOf = <T>(res: { json(): unknown }): T => (res.json() as { data: T }).data

test(
  'M12: candidates, immutable releases, pointer and adjacency survive PostgreSQL',
  { skip: DB_URL ? false : 'no PARITY_DATABASE_URL/DATABASE_URL — the PG slice needs a server' },
  async (t) => {
    const moonql = await bootMoonQl({
      databaseUrl: DB_URL,
      addons: [base, auth, ontology, graph],
      env: { MOONQL_AUTH_ADMIN_PASSWORD: TEST_ADMIN_PASSWORD },
      seedPolicy: 'off',
      cronEnabled: false,
      log: quiet,
    })
    const app = Fastify({ logger: false })
    await app.register(envelope)
    await app.register(moonqlRest, { prefix: '/orm', instance: moonql })
    await app.ready()

    assert.equal(moonql.engine, 'pg', 'this drill must not silently fall back to memory')
    assert.ok(moonql.client, 'the pg boot exposes the raw client for test cleanup')
    const raw = moonql.client!

    // The graph addon deliberately refuses every API delete. The drill runs on a
    // disposable database, so the fixture tables are reset directly; the next
    // boot re-syncs the shipped data rows.
    const reset = async (): Promise<void> => {
      await raw.unsafe('DELETE FROM graph_adjacency')
      await raw.unsafe('DELETE FROM graph_release_pointer')
      await raw.unsafe('DELETE FROM graph_releases')
      await raw.unsafe('DELETE FROM graph_candidates')
    }

    t.after(async () => {
      await reset()
      await app.close()
      await moonql.close()
    })

    // ---- seeded fixture survives SQL --------------------------------------
    assert.equal(await moonql.model('graph_candidates').count(), 5)
    assert.equal(await moonql.model('graph_releases').count(), 1)
    assert.equal(await moonql.model('graph_release_pointer').count(), 1)
    assert.equal(await moonql.model('graph_adjacency').count(), 5)

    const initialRes = await app.inject().get('/orm/graph/overview').end()
    assert.equal(initialRes.statusCode, 200, initialRes.body)
    const initial = dataOf<Overview>(initialRes)
    assert.ok(initial.active)
    assert.equal(initial.active.edgeCount, 5)
    assert.equal(initial.active.ontologyCount, 4)
    assert.equal(initial.active.candidateCount, 1)
    assert.equal(initial.active.deduplicatedCount, 1)
    assert.equal(initial.pointer?.version, 1)
    assert.equal(initial.counts.reviewedRelations, 4)
    assert.equal(initial.counts.candidates, 5)
    assert.equal(initial.counts.edgesInActiveRelease, 5)
    assert.equal(initial.counts.adjacencyRows, 5)
    assert.equal(initial.counts.adjacencyStale, false)
    assert.equal(initial.separation.candidates.pending, 2)
    assert.equal(initial.separation.candidates.approved, 2)
    assert.equal(initial.separation.candidates.rejected, 1)
    assert.equal(initial.policy.evidenceAtExactSha, true)
    assert.equal(initial.policy.evidenceSpanRequiredForApproval, true)
    assert.equal(initial.policy.sameAsApproval, 'FORBIDDEN_USE_IDENTITY_REVIEW')

    const pending = initial.candidates.find((row) => row.candidateCode === SAME_AS_PENDING)
    assert.ok(pending)
    assert.equal(pending.status, 'PENDING')
    assert.equal(pending.epistemicStatus, 'UNKNOWN')
    assert.equal(pending.inActiveRelease, false)
    assert.equal(pending.evidence.frame, 'SIMILARITY')
    assert.equal(pending.evidence.sha, VISION_SHA256)
    assert.equal(pending.evidence.exactSha, true)
    assert.equal(pending.source?.provenanceSha, VISION_SHA256)

    const dedup = initial.candidates.find((row) => row.candidateCode === DEDUP_CANDIDATE)
    assert.ok(dedup)
    assert.equal(dedup.approved, true)
    assert.equal(dedup.inActiveRelease, false, 'a deduplicated candidate is not a separate release edge')

    // ---- relation detail: candidate and reviewed stay separate ------------
    const pendingRes = await app.inject().get(`/orm/graph/relation?code=${SAME_AS_PENDING}`).end()
    assert.equal(pendingRes.statusCode, 200, pendingRes.body)
    const pendingView = dataOf<DetailView>(pendingRes)
    assert.equal(pendingView.relation.kind, 'CANDIDATE')
    assert.equal(pendingView.relation.status, 'PENDING')
    assert.equal(pendingView.relation.epistemicStatus, 'UNKNOWN')
    assert.equal(pendingView.relation.inActiveRelease, false)
    assert.equal(pendingView.relation.evidence.frame, 'SIMILARITY')
    assert.equal(pendingView.relation.evidence.exactSha, true)
    assert.equal(pendingView.policy.releaseImmutable, true)
    assert.equal(pendingView.policy.automaticApproval, false)

    const reviewedRes = await app.inject().get('/orm/graph/relation?code=EDG-O001-O002-distinctFrom').end()
    assert.equal(reviewedRes.statusCode, 200, reviewedRes.body)
    const reviewedView = dataOf<DetailView>(reviewedRes)
    assert.equal(reviewedView.relation.kind, 'REVIEWED')
    assert.equal(reviewedView.relation.verified, true)
    assert.equal(reviewedView.relation.inActiveRelease, true)
    assert.equal(reviewedView.relation.evidence.frame, 'ONTOLOGY_RELATION')
    assert.equal(reviewedView.relation.source?.provenanceSha, M02_SHA256)
    assert.ok(reviewedView.release)

    const headers = await adminHeaders(app, '/orm')

    // ---- sameAs approval is refused without a partial write ---------------
    const sameAs = await app
      .inject()
      .post('/orm/graph/candidates/decide')
      .headers(headers)
      .body({
        candidateCode: SAME_AS_PENDING,
        decision: 'APPROVED',
        reviewer: 'PG Reviewer',
        reason: 'Try to smuggle identity through the correlation graph.',
        evidenceSpan: 'A shared surface is not identity.',
        evidenceSha: VISION_SHA256,
      })
      .end()
    assert.equal(sameAs.statusCode, 400, sameAs.body)
    assert.match(sameAs.body, /sameAs can never be approved/)
    const storedSameAs = (await moonql.model('graph_candidates').list({ where: { candidateCode: SAME_AS_PENDING } }))[0]
    assert.ok(storedSameAs, 'the refused row still exists')
    assert.equal(storedSameAs.status, 'PENDING', 'a refused sameAs approval leaves no partial decision')
    assert.equal(storedSameAs.reviewer, null)

    // ---- missing evidence cannot be approved ------------------------------
    const registeredNoEvidence = await app
      .inject()
      .post('/orm/graph/candidates/register')
      .headers(headers)
      .body({
        from: 'O005',
        to: 'O002',
        relationType: 'distinctFrom',
        perspective: 'GENERAL',
        sourceCode: 'xv-master-vision',
        evidenceFrame: 'EDITORIAL',
        evidenceSpan: null,
        evidenceSha: null,
        evidenceRef: null,
        reason: 'A claim registered without any evidence, for the PG negative drill.',
      })
      .end()
    assert.equal(registeredNoEvidence.statusCode, 200, registeredNoEvidence.body)

    const approveNoEvidence = await app
      .inject()
      .post('/orm/graph/candidates/decide')
      .headers(headers)
      .body({
        candidateCode: NO_EVIDENCE_CANDIDATE,
        decision: 'APPROVED',
        reviewer: 'PG Reviewer',
        reason: 'Approval is attempted without evidence.',
      })
      .end()
    assert.equal(approveNoEvidence.statusCode, 400, approveNoEvidence.body)
    assert.match(approveNoEvidence.body, /evidence span and an exact SHA/)

    const rejected = await app
      .inject()
      .post('/orm/graph/candidates/decide')
      .headers(headers)
      .body({
        candidateCode: NO_EVIDENCE_CANDIDATE,
        decision: 'REJECTED',
        reviewer: 'PG Reviewer',
        reason: 'The claim carries no evidence, so it stays out of every release.',
      })
      .end()
    assert.equal(rejected.statusCode, 200, rejected.body)
    const storedRejected = (await moonql.model('graph_candidates').list({ where: { candidateCode: NO_EVIDENCE_CANDIDATE } }))[0]
    assert.equal(storedRejected?.status, 'REJECTED')
    assert.equal(storedRejected?.reviewer, 'PG Reviewer')
    assert.match(String(storedRejected?.decisionNote), /no evidence/)

    const wrongSha = await app
      .inject()
      .post('/orm/graph/candidates/register')
      .headers(headers)
      .body({
        from: 'O001',
        to: 'O005',
        relationType: 'relatedTo',
        perspective: 'SUFI_STUDY',
        sourceCode: 'xv-master-vision',
        evidenceFrame: 'TEXTUAL',
        evidenceSpan: 'A span that does not belong to the cited digest.',
        evidenceSha: '0'.repeat(64),
        reason: 'A digest that does not match the source must be refused.',
      })
      .end()
    assert.equal(wrongSha.statusCode, 400, wrongSha.body)
    assert.match(wrongSha.body, /does not match the provenance SHA/)
    assert.equal(
      (await moonql.model('graph_candidates').list({ where: { candidateCode: 'GC-O001-O005-relatedTo-SUFI_STUDY' } })).length,
      0,
      'a rejected registration leaves no row',
    )

    // ---- approve a real candidate and build from SQL ----------------------
    const registered = await app
      .inject()
      .post('/orm/graph/candidates/register')
      .headers(headers)
      .body({
        from: 'O005',
        to: 'O001',
        relationType: 'relatedTo',
        perspective: 'GENERAL',
        sourceCode: 'xv-master-vision',
        evidenceFrame: 'EDITORIAL',
        evidenceSpan: 'The PG drill records a bounded editorial relation between two distinct entities.',
        evidenceSha: VISION_SHA256,
        evidenceRef: 'vision@e2f4562',
        reason: 'A correlation candidate with evidence pinned to an exact SHA.',
      })
      .end()
    assert.equal(registered.statusCode, 200, registered.body)

    const approved = await app
      .inject()
      .post('/orm/graph/candidates/decide')
      .headers(headers)
      .body({
        candidateCode: NEW_CANDIDATE,
        decision: 'APPROVED',
        reviewer: 'PG Reviewer',
        reason: 'The span and digest match the cited source.',
        evidenceSpan: 'The PG drill records a bounded editorial relation between two distinct entities.',
        evidenceSha: VISION_SHA256,
      })
      .end()
    assert.equal(approved.statusCode, 200, approved.body)
    const storedApproved = (await moonql.model('graph_candidates').list({ where: { candidateCode: NEW_CANDIDATE } }))[0]
    assert.equal(storedApproved?.status, 'APPROVED')
    assert.equal(storedApproved?.evidenceSha, VISION_SHA256)
    assert.equal(storedApproved?.reviewer, 'PG Reviewer')

    const builtRes = await app
      .inject()
      .post('/orm/graph/releases/build')
      .headers(headers)
      .body({ builtBy: 'PG Reviewer', note: 'M12 pg drill' })
      .end()
    assert.equal(builtRes.statusCode, 200, builtRes.body)
    const built = dataOf<{ state: string; release: ReleaseSummary; dedup: boolean }>(builtRes)
    assert.equal(built.state, 'built')
    assert.equal(built.dedup, false)
    assert.equal(built.release.edgeCount, 6)
    assert.equal(built.release.ontologyCount, 4)
    assert.equal(built.release.candidateCount, 2)
    assert.equal(built.release.deduplicatedCount, 1)
    assert.equal(await moonql.model('graph_releases').count(), 2)

    const replayRes = await app
      .inject()
      .post('/orm/graph/releases/build')
      .headers(headers)
      .body({ builtBy: 'PG Reviewer', note: 'replay' })
      .end()
    assert.equal(replayRes.statusCode, 200, replayRes.body)
    const replay = dataOf<{ state: string; release: ReleaseSummary; dedup: boolean }>(replayRes)
    assert.equal(replay.state, 'existing')
    assert.equal(replay.dedup, true)
    assert.equal(replay.release.releaseCode, built.release.releaseCode)
    assert.equal(await moonql.model('graph_releases').count(), 2, 'a replay reuses the same release row')

    await assert.rejects(
      () =>
        moonql.model('graph_releases').create({
          releaseCode: 'grel_duplicate000',
          graphSha: built.release.graphSha,
          manifest: '{}',
          edgeCount: 0,
          ontologyCount: 0,
          candidateCount: 0,
          deduplicatedCount: 0,
          builtAt: new Date().toISOString(),
          builtBy: 'PG Reviewer',
          note: 'duplicate',
        }),
      'the graph SHA is unique in PostgreSQL',
    )

    const releaseRows = await moonql.model('graph_releases').list({ limit: 10 })
    for (const row of releaseRows) assert.match(String(row.manifest), /moonwitness-graph-manifest-v1/)
    await assert.rejects(
      () => moonql.model('graph_releases').update(String(releaseRows[0]?.id), { note: 'rewritten' }),
      /immutable/,
    )
    await assert.rejects(() => moonql.model('graph_releases').remove(String(releaseRows[0]?.id)), /immutable|delete/i)
    await assert.rejects(
      () =>
        moonql.model('graph_release_pointer').create({
          key: 'active',
          releaseRef: String(releaseRows[0]?.id),
          version: 2,
        }),
      /singleton|unique constraint/,
    )

    // ---- compare-and-swap pointer, then derived adjacency -----------------
    const staleCas = await app
      .inject()
      .post('/orm/graph/releases/activate')
      .headers(headers)
      .body({
        releaseCode: built.release.releaseCode,
        activatedBy: 'PG Reviewer',
        expectedVersion: 99,
        note: 'stale activation',
      })
      .end()
    assert.equal(staleCas.statusCode, 409, staleCas.body)
    assert.match(staleCas.body, /version 1, not 99/)

    const advanceRes = await app
      .inject()
      .post('/orm/graph/releases/activate')
      .headers(headers)
      .body({
        releaseCode: built.release.releaseCode,
        activatedBy: 'PG Reviewer',
        expectedVersion: 1,
        note: 'advance to the drill release',
      })
      .end()
    assert.equal(advanceRes.statusCode, 200, advanceRes.body)
    const advanced = dataOf<{ state: string; direction: string; pointer: { version: number } }>(advanceRes)
    assert.equal(advanced.state, 'activated')
    assert.equal(advanced.direction, 'ADVANCE')
    assert.equal(advanced.pointer.version, 2)
    assert.equal(await moonql.model('graph_release_pointer').count(), 1)

    const staleAdjacency = dataOf<{ stale: boolean; state: string }>(
      await app.inject().get('/orm/graph/adjacency').end(),
    )
    assert.equal(staleAdjacency.stale, true)
    assert.equal(staleAdjacency.state, 'stale')

    const rebuiltRes = await app
      .inject()
      .post('/orm/graph/adjacency/rebuild')
      .headers(headers)
      .body({ rebuiltBy: 'PG Reviewer' })
      .end()
    assert.equal(rebuiltRes.statusCode, 200, rebuiltRes.body)
    const rebuilt = dataOf<{ state: string; rows: number; cleared: number; stale: boolean }>(rebuiltRes)
    assert.equal(rebuilt.state, 'rebuilt')
    assert.equal(rebuilt.rows, 6)
    assert.equal(rebuilt.cleared, 5, 'the rebuild replaces the stale seed-release rows')
    assert.equal(rebuilt.stale, false)

    const rebuiltAgain = dataOf<{ state: string; rows: number; cleared: number; stale: boolean }>(
      await app
        .inject()
        .post('/orm/graph/adjacency/rebuild')
        .headers(headers)
        .body({ rebuiltBy: 'PG Reviewer' })
        .end(),
    )
    assert.equal(rebuiltAgain.state, 'rebuilt')
    assert.equal(rebuiltAgain.cleared, 6)
    assert.equal(rebuiltAgain.rows, 6)
    assert.equal(rebuiltAgain.stale, false)

    const search = dataOf<{ total: number; items: Array<{ code: string }> }>(
      await app.inject().get('/orm/graph/search?q=O005').end(),
    )
    assert.ok(search.items.some((item) => item.code === NEW_CANDIDATE))
    const candidateSearch = dataOf<{ total: number }>(await app.inject().get('/orm/graph/search?q=GC-O003').end())
    assert.equal(candidateSearch.total, 0, 'candidates never enter the derived adjacency')

    // ---- revoked candidate: visible in history, out of the next release ---
    const revokeRes = await app
      .inject()
      .post('/orm/graph/candidates/decide')
      .headers(headers)
      .body({
        candidateCode: APPROVED_CANDIDATE,
        decision: 'REVOKED',
        reviewer: 'PG Reviewer',
        reason: 'The relation is withdrawn; the decision and the old release stay on record.',
      })
      .end()
    assert.equal(revokeRes.statusCode, 200, revokeRes.body)

    const afterRevoke = dataOf<Overview>(await app.inject().get('/orm/graph/overview').end())
    const revoked = afterRevoke.candidates.find((row) => row.candidateCode === APPROVED_CANDIDATE)
    assert.equal(revoked?.revoked, true)
    assert.equal(revoked?.inActiveRelease, true, 'the old release still contains the edge')

    const exported = dataOf<ExportView>(
      await app.inject().get(`/orm/graph/export?code=${built.release.releaseCode}`).end(),
    )
    assert.equal(exported.schema, 'moonwitness-graph-export-v1')
    assert.equal(exported.graphSha, built.release.graphSha)
    assert.ok(exported.lineage.candidates.includes(APPROVED_CANDIDATE))
    assert.ok(exported.lineage.candidates.includes(NEW_CANDIDATE))
    assert.equal(exported.lineage.ontologyEdges.length, 4)
    assert.equal(exported.lineage.deduplicated.length, 1)
    assert.equal(exported.lineage.deduplicated[0]?.duplicateOf, SEED_EDGE)
    assert.equal(exported.lineage.sources.length, 3)
    for (const source of exported.lineage.sources) assert.match(source.sha256, /^[0-9a-f]{64}$/)

    const finalBuildRes = await app
      .inject()
      .post('/orm/graph/releases/build')
      .headers(headers)
      .body({ builtBy: 'PG Reviewer', note: 'after revocation' })
      .end()
    assert.equal(finalBuildRes.statusCode, 200, finalBuildRes.body)
    const finalBuild = dataOf<{ state: string; release: ReleaseSummary }>(finalBuildRes)
    assert.equal(finalBuild.state, 'built')
    assert.equal(finalBuild.release.edgeCount, 5)
    assert.equal(finalBuild.release.candidateCount, 1)
    assert.equal(finalBuild.release.deduplicatedCount, 1)
    assert.notEqual(finalBuild.release.graphSha, built.release.graphSha)
    assert.equal(await moonql.model('graph_releases').count(), 3)

    const finalActivateRes = await app
      .inject()
      .post('/orm/graph/releases/activate')
      .headers(headers)
      .body({
        releaseCode: finalBuild.release.releaseCode,
        activatedBy: 'PG Reviewer',
        expectedVersion: 2,
        note: 'release without the revoked candidate',
      })
      .end()
    assert.equal(finalActivateRes.statusCode, 200, finalActivateRes.body)
    const finalActivate = dataOf<{ pointer: { version: number } }>(finalActivateRes)
    assert.equal(finalActivate.pointer.version, 3)

    const finalRebuild = dataOf<{ rows: number; stale: boolean }>(
      await app
        .inject()
        .post('/orm/graph/adjacency/rebuild')
        .headers(headers)
        .body({ rebuiltBy: 'PG Reviewer' })
        .end(),
    )
    assert.equal(finalRebuild.rows, 5)
    assert.equal(finalRebuild.stale, false)
    const revokedSearch = dataOf<{ total: number; items: Array<{ code: string }> }>(
      await app.inject().get('/orm/graph/search?q=GC-O008').end(),
    )
    assert.equal(revokedSearch.total, 0, 'the revoked candidate leaves the derived adjacency')
    assert.ok(!revokedSearch.items.some((item) => item.code === APPROVED_CANDIDATE))

    const rollbackRes = await app
      .inject()
      .post('/orm/graph/releases/activate')
      .headers(headers)
      .body({
        releaseCode: initial.active!.releaseCode,
        activatedBy: 'PG Reviewer',
        expectedVersion: 3,
        note: 'rollback drill',
      })
      .end()
    assert.equal(rollbackRes.statusCode, 200, rollbackRes.body)
    const rollback = dataOf<{ direction: string; pointer: { version: number; releaseCode: string } }>(rollbackRes)
    assert.equal(rollback.direction, 'ROLLBACK')
    assert.equal(rollback.pointer.version, 4)
    assert.equal(rollback.pointer.releaseCode, initial.active!.releaseCode)

    const rollbackRebuild = dataOf<{ rows: number; stale: boolean }>(
      await app
        .inject()
        .post('/orm/graph/adjacency/rebuild')
        .headers(headers)
        .body({ rebuiltBy: 'PG Reviewer' })
        .end(),
    )
    assert.equal(rollbackRebuild.rows, 5)
    assert.equal(rollbackRebuild.stale, false)

    const oldExport = dataOf<ExportView>(
      await app.inject().get(`/orm/graph/export?code=${initial.active!.releaseCode}`).end(),
    )
    assert.ok(
      oldExport.lineage.candidates.includes(APPROVED_CANDIDATE),
      'the immutable old release keeps the revoked candidate in its lineage',
    )
    assert.equal(oldExport.graphSha, initial.active!.graphSha)

    // ---- reads wrote nothing, one pointer, three releases -----------------
    const finalOverview = dataOf<Overview>(await app.inject().get('/orm/graph/overview').end())
    assert.equal(finalOverview.active?.releaseCode, initial.active!.releaseCode)
    assert.equal(finalOverview.pointer?.version, 4)
    assert.equal(await moonql.model('graph_release_pointer').count(), 1)
    assert.equal(await moonql.model('graph_releases').count(), 3)
    assert.equal(await moonql.model('graph_candidates').count(), 7, 'GET must not write')
    assert.equal(await moonql.model('graph_adjacency').count(), 5)
  },
)
