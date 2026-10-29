import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify, { type FastifyInstance } from 'fastify'
import { bootMoonQl, moonqlRest } from '@moonwitness/moonql'
import base from '@moonwitness/moonql-base'
import auth from '@moonwitness/moonql-auth'
import ontology, { M02_SHA256, M09_SHA256, VISION_SHA256 } from '@moonwitness/moonql-ontology'
import graph from '@moonwitness/moonql-graph'
import envelope from '../src/plugins/envelope.js'
import { adminHeaders, TEST_ADMIN_PASSWORD } from './helpers/auth.js'

/**
 * M12 — typed correlation and evidence graph.
 *
 * Candidates are claims, not edges. A release is immutable, built only from
 * verified relations and approved candidates pinned to an exact SHA. One
 * singleton pointer selects the active release, adjacency is derived and
 * rebuildable, and similarity/co-occurrence never auto-approve a sameAs.
 */

const quiet = { info: () => {}, warn: () => {} }
const dataOf = <T>(res: { json(): unknown }): T => (res.json() as { data: T }).data

const SAME_AS_PENDING = 'GC-O003-O005-sameAs-SUFI_STUDY'
const DEDUP_CANDIDATE = 'GC-O006-O007-distinctFrom-GENERAL'
const APPROVED_CANDIDATE = 'GC-O008-O007-relatedTo-CREATIVE_FICTION'
const REJECTED_SAME_AS = 'GC-O006-O007-sameAs-GENERAL'
const CHRONOLOGY_PENDING = 'GC-O004-O003-relatedTo-HISTORICAL_CRITICAL'
const SEED_EDGE = 'EDG-O006-O007-distinctFrom'

interface CandidateView {
  candidateCode: string
  kind: string
  from: string
  to: string
  fromLabel: string
  toLabel: string
  relationType: string
  perspective: string
  epistemicStatus: string
  status: string
  statusLabel: string
  approved: boolean
  rejected: boolean
  revoked: boolean
  pending: boolean
  inActiveRelease: boolean
  evidence: { span: string | null; frame: string | null; sha: string | null; present: boolean; exactSha: boolean }
  source: { code: string | null; provenanceSha: string | null; reviewStatus: string | null } | null
  reviewer: string | null
  reason: string | null
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
  builtBy: string
  active: boolean
}

interface DetailView {
  state: string
  relation: {
    code: string
    kind: string
    status?: string
    statusLabel?: string
    approved?: boolean
    revoked?: boolean
    pending?: boolean
    inActiveRelease: boolean
    verified?: boolean
    epistemicStatus: string
    fromEntity: { stableId: string; labelEn: string; kind: string } | null
    toEntity: { stableId: string; labelEn: string; kind: string } | null
    evidence: { span: string | null; frame: string | null; sha: string | null; present: boolean; exactSha: boolean }
    source: { code: string | null; work?: string; reviewStatus?: string | null } | null
  }
  release: { releaseCode: string; graphSha: string } | null
  policy: { sameAsApproval: string; releaseImmutable: boolean; automaticApproval: boolean }
}

interface Overview {
  state: string
  registry: { pins: Record<string, { ref: string; sha256: string }> }
  active: ReleaseSummary | null
  pointer: { version: number; releaseCode: string | null; previousReleaseCode: string | null } | null
  separation: {
    candidates: { total: number; pending: number; approved: number; rejected: number; revoked: number }
    reviewed: { activeReleaseCode: string | null; edgeCount: number }
  }
  counts: { reviewedRelations: number; candidates: number; edgesInActiveRelease: number; adjacencyRows: number; adjacencyStale: boolean }
  adjacency: { derived: boolean; rebuildable: boolean; stale: boolean; rows: number; releaseCode: string | null }
  candidates: CandidateView[]
  options: { relationTypes: string[]; statuses: string[] }
  policy: { evidenceAtExactSha: boolean; evidenceSpanRequiredForApproval: boolean; sameAsApproval: string; revokedVisible: boolean; automaticApproval: boolean }
}

interface ManifestEdge {
  0: string
  1: string
  2: string
  3: string
  4: string
  5: string
  6: string
  7: string | null
  8: string | null
}

interface ReleaseDetail {
  release: ReleaseSummary
  manifest: {
    schema: string
    edges: ManifestEdge[]
    ontology: Array<[string, string, string, string]>
    candidates: Array<[string, string, string, string]>
    deduplicated: Array<{ code: string; duplicateOf: string; reason: string }>
  }
  lineage: {
    sources: Array<{ code: string; sha256: string }>
    ontologyEdges: string[]
    candidates: string[]
    deduplicated: Array<{ code: string; duplicateOf: string }>
  }
}

async function makeApp() {
  const app = Fastify({ logger: false })
  const moonql = await bootMoonQl({
    addons: [base, auth, ontology, graph],
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

type _Mq = Awaited<ReturnType<typeof bootMoonQl>>

async function adminRead(app: FastifyInstance, path: string) {
  const headers = await adminHeaders(app, '/orm')
  return app.inject().get(path).headers(headers).end()
}

async function overview(app: FastifyInstance): Promise<Overview> {
  const res = await adminRead(app, '/orm/graph/overview')
  assert.equal(res.statusCode, 200, res.body)
  return dataOf<Overview>(res)
}

async function candidate(app: FastifyInstance, code: string): Promise<DetailView> {
  const res = await adminRead(app, `/orm/graph/relation?code=${encodeURIComponent(code)}`)
  assert.equal(res.statusCode, 200, res.body)
  return dataOf<DetailView>(res)
}

async function registerCandidate(
  app: FastifyInstance,
  headers: Record<string, string>,
  body: Record<string, unknown>,
): Promise<{ statusCode: number; payload: Record<string, unknown> }> {
  const res = await app.inject().post('/orm/graph/candidates/register').headers(headers).body(body).end()
  return { statusCode: res.statusCode, payload: res.statusCode < 300 ? dataOf<Record<string, unknown>>(res) : (res.json() as Record<string, unknown>) }
}

async function decide(
  app: FastifyInstance,
  headers: Record<string, string>,
  body: Record<string, unknown>,
): Promise<{ statusCode: number; payload: Record<string, unknown> }> {
  const res = await app.inject().post('/orm/graph/candidates/decide').headers(headers).body(body).end()
  return { statusCode: res.statusCode, payload: res.statusCode < 300 ? dataOf<Record<string, unknown>>(res) : (res.json() as Record<string, unknown>) }
}

async function build(
  app: FastifyInstance,
  headers: Record<string, string>,
): Promise<{ statusCode: number; payload: Record<string, unknown> }> {
  const res = await app.inject()
    .post('/orm/graph/releases/build')
    .headers(headers)
    .body({ builtBy: 'M12 test reviewer', note: 'test build' })
    .end()
  assert.ok(res.statusCode === 200 || res.statusCode === 409, res.body)
  return { statusCode: res.statusCode, payload: res.statusCode < 300 ? dataOf<Record<string, unknown>>(res) : (res.json() as Record<string, unknown>) }
}

async function activate(
  app: FastifyInstance,
  headers: Record<string, string>,
  releaseCode: string,
  expectedVersion?: number,
): Promise<{ statusCode: number; payload: Record<string, unknown> }> {
  const res = await app.inject()
    .post('/orm/graph/releases/activate')
    .headers(headers)
    .body({ releaseCode, activatedBy: 'M12 test reviewer', expectedVersion, note: 'test activation' })
    .end()
  assert.ok(res.statusCode === 200 || res.statusCode === 409, res.body)
  return { statusCode: res.statusCode, payload: res.statusCode < 300 ? dataOf<Record<string, unknown>>(res) : (res.json() as Record<string, unknown>) }
}

async function releaseDetail(app: FastifyInstance, code: string): Promise<ReleaseDetail> {
  const res = await adminRead(app, `/orm/graph/release?code=${encodeURIComponent(code)}`)
  assert.equal(res.statusCode, 200, res.body)
  return dataOf<ReleaseDetail>(res)
}

async function approveNewCandidate(
  app: FastifyInstance,
  headers: Record<string, string>,
  from: string,
  to: string,
  relationType = 'relatedTo',
  perspective = 'GENERAL',
): Promise<string> {
  const registered = await registerCandidate(app, headers, {
    from,
    to,
    relationType,
    perspective,
    sourceCode: 'm09-unilex-review',
    evidenceFrame: 'TEXTUAL',
    evidenceSpan: 'P004:P031 `REJECTED`/`NEAR` with reason',
    evidenceSha: M09_SHA256,
    evidenceRef: 'moonwitnessxv@d539cee:docs/audit/M09-unilex-terminology.md',
    reason: 'A test candidate that cites the terminology review at its exact SHA.',
  })
  assert.equal(registered.statusCode, 200, JSON.stringify(registered.payload))
  const code = String((registered.payload as { candidate: CandidateView }).candidate.candidateCode)
  const decided = await decide(app, headers, {
    candidateCode: code,
    decision: 'APPROVED',
    reviewer: 'M12 test reviewer',
    reason: 'Evidence span and exact SHA are present.',
  })
  assert.equal(decided.statusCode, 200, JSON.stringify(decided.payload))
  return code
}

test('M12-02: a candidate is not an edge and missing evidence cannot be approved', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  const headers = await adminHeaders(app, '/orm')

  const before = await overview(app)
  assert.equal(before.state, 'ok')
  assert.equal(before.counts.candidates, 5)
  assert.equal(before.counts.reviewedRelations, 4)
  assert.equal(before.counts.edgesInActiveRelease, 5)
  assert.equal(before.separation.reviewed.edgeCount, 5)
  assert.equal(before.policy.evidenceAtExactSha, true)
  assert.equal(before.policy.evidenceSpanRequiredForApproval, true)
  assert.equal(before.registry.pins.boundaryDecision?.sha256, M02_SHA256)

  const pending = before.candidates.find((row) => row.candidateCode === SAME_AS_PENDING)
  assert.ok(pending)
  assert.equal(pending.pending, true)
  assert.equal(pending.evidence.present, true)
  assert.equal(pending.evidence.exactSha, true)
  assert.equal(pending.source?.reviewStatus, 'APPROVED_FOR_CITATION')

  const forbidden = await decide(app, headers, {
    candidateCode: SAME_AS_PENDING,
    decision: 'APPROVED',
    reviewer: 'M12 test reviewer',
    reason: 'A shared label alone cannot merge anything.',
    evidenceSpan: 'Never auto `sameAs`',
    evidenceSha: VISION_SHA256,
  })
  assert.equal(forbidden.statusCode, 400)
  assert.match(JSON.stringify(forbidden.payload), /sameAs can never be approved/)

  const noEvidence = await registerCandidate(app, headers, {
    from: 'O005',
    to: 'O001',
    relationType: 'relatedTo',
    perspective: 'SUFI_STUDY',
    sourceCode: 'm09-unilex-review',
    evidenceFrame: 'SIMILARITY',
    reason: 'A candidate registered without an evidence span or digest.',
  })
  assert.equal(noEvidence.statusCode, 200, JSON.stringify(noEvidence.payload))
  const noEvidenceCode = String((noEvidence.payload as { candidate: CandidateView }).candidate.candidateCode)
  assert.equal((noEvidence.payload as { candidate: CandidateView }).candidate.inActiveRelease, false)

  const approveWithoutEvidence = await decide(app, headers, {
    candidateCode: noEvidenceCode,
    decision: 'APPROVED',
    reviewer: 'M12 test reviewer',
    reason: 'Approval is attempted without any evidence.',
  })
  assert.equal(approveWithoutEvidence.statusCode, 400)
  assert.match(JSON.stringify(approveWithoutEvidence.payload), /evidence span and an exact SHA/)

  const wrongSha = await registerCandidate(app, headers, {
    from: 'O001',
    to: 'O005',
    relationType: 'relatedTo',
    perspective: 'SUFI_STUDY',
    sourceCode: 'm09-unilex-review',
    evidenceFrame: 'TEXTUAL',
    evidenceSpan: 'P004:P031 `REJECTED`/`NEAR` with reason',
    evidenceSha: '0'.repeat(64),
    reason: 'A candidate whose digest does not match the cited source.',
  })
  assert.equal(wrongSha.statusCode, 400)
  assert.match(JSON.stringify(wrongSha.payload), /does not match the provenance SHA/)

  const approvedCode = await approveNewCandidate(app, headers, 'O005', 'O001')
  const afterApproval = await overview(app)
  const approved = afterApproval.candidates.find((row) => row.candidateCode === approvedCode)
  assert.ok(approved)
  assert.equal(approved.approved, true)
  assert.equal(approved.inActiveRelease, false)
  assert.equal(afterApproval.separation.reviewed.edgeCount, 5)
  assert.equal(afterApproval.counts.edgesInActiveRelease, 5)

  const built = await build(app, headers)
  assert.equal(built.statusCode, 200, JSON.stringify(built.payload))
  assert.equal(built.payload.state, 'built')
  const release = (built.payload as { release: ReleaseSummary }).release
  assert.equal(release.edgeCount, 6)
  assert.equal(release.candidateCount, 2)

  const pointer = afterApproval.pointer
  assert.ok(pointer)
  const activated = await activate(app, headers, release.releaseCode, pointer.version)
  assert.equal(activated.statusCode, 200, JSON.stringify(activated.payload))
  assert.equal(activated.payload.state, 'activated')
  assert.equal(activated.payload.direction, 'ADVANCE')

  const after = await overview(app)
  assert.equal(after.active?.releaseCode, release.releaseCode)
  assert.equal(after.counts.edgesInActiveRelease, 6)
  const released = after.candidates.find((row) => row.candidateCode === approvedCode)
  assert.equal(released?.inActiveRelease, true)
})

test('M12-03: releases are immutable and one versioned pointer is the only active state', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  const headers = await adminHeaders(app, '/orm')

  const initial = await overview(app)
  assert.ok(initial.active)
  const seedRelease = initial.active
  const seedGraphSha = seedRelease.graphSha
  assert.equal(initial.pointer?.version, 1)

  const replay = await build(app, headers)
  assert.equal(replay.statusCode, 200)
  assert.equal(replay.payload.state, 'existing')
  assert.equal(replay.payload.dedup, true)
  assert.equal((replay.payload as { release: ReleaseSummary }).release.graphSha, seedGraphSha)

  const releases = await moonql.model('graph_releases').list({ limit: 10 })
  assert.equal(releases.length, 1)
  const releaseId = String(releases[0]?.id)
  await assert.rejects(
    () => moonql.model('graph_releases').update(releaseId, { note: 'rewritten' }),
    /immutable/,
  )
  await assert.rejects(() => moonql.model('graph_releases').remove(releaseId), /immutable|delete/i)

  const staleCas = await activate(app, headers, seedRelease.releaseCode, 99)
  assert.equal(staleCas.statusCode, 409)
  const staleError = (staleCas.payload as { error: { statusCode: number; message: string } }).error
  assert.equal(staleError.statusCode, 409)
  assert.match(staleError.message, /version 1, not 99/)

  const unchanged = await activate(app, headers, seedRelease.releaseCode, 1)
  assert.equal(unchanged.statusCode, 200)
  assert.equal(unchanged.payload.state, 'unchanged')

  await approveNewCandidate(app, headers, 'O005', 'O001')
  const built = await build(app, headers)
  assert.equal(built.payload.state, 'built')
  const next = (built.payload as { release: ReleaseSummary }).release
  assert.notEqual(next.graphSha, seedGraphSha)

  const advanced = await activate(app, headers, next.releaseCode, 1)
  assert.equal(advanced.statusCode, 200, JSON.stringify(advanced.payload))
  assert.equal(advanced.payload.direction, 'ADVANCE')
  const advancedPointer = (advanced.payload as { pointer: { version: number; previousReleaseCode: string } }).pointer
  assert.equal(advancedPointer.version, 2)
  assert.equal(advancedPointer.previousReleaseCode, seedRelease.releaseCode)

  const rollback = await activate(app, headers, seedRelease.releaseCode, 2)
  assert.equal(rollback.statusCode, 200, JSON.stringify(rollback.payload))
  assert.equal(rollback.payload.direction, 'ROLLBACK')
  const rolledPointer = (rollback.payload as { pointer: { version: number; releaseCode: string } }).pointer
  assert.equal(rolledPointer.version, 3)
  assert.equal(rolledPointer.releaseCode, seedRelease.releaseCode)

  const pointers = await moonql.model('graph_release_pointer').list({ limit: 10 })
  assert.equal(pointers.length, 1)
  assert.equal(Number(pointers[0]?.version), 3)

  const final = await overview(app)
  assert.equal(final.active?.releaseCode, seedRelease.releaseCode)
  const reason = await releaseDetail(app, seedRelease.releaseCode)
  assert.equal(reason.release.graphSha, seedGraphSha)
  const releaseRows = await moonql.model('graph_releases').list({ limit: 10 })
  assert.equal(releaseRows.length, 2)
  for (const row of releaseRows) assert.ok(String(row.manifest).includes('moonwitness-graph-manifest-v1'))
})

test('M12-04: adjacency is derived, can be dropped, and rebuilds from the active manifest', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  const headers = await adminHeaders(app, '/orm')

  const initial = await overview(app)
  assert.equal(initial.adjacency.derived, true)
  assert.equal(initial.adjacency.rebuildable, true)
  assert.equal(initial.adjacency.stale, false)
  assert.equal(initial.adjacency.rows, 5)
  assert.equal(initial.adjacency.releaseCode, initial.active?.releaseCode)

  const adjacency = await adminRead(app, '/orm/graph/adjacency')
  assert.equal(adjacency.statusCode, 200)
  const seeded = dataOf<{ state: string; total: number; items: Array<{ code: string }> }>(adjacency)
  assert.equal(seeded.state, 'ok')
  assert.equal(seeded.total, 5)
  assert.ok(seeded.items.some((item) => item.code === SEED_EDGE))

  const approvedCode = await approveNewCandidate(app, headers, 'O005', 'O001')
  const built = await build(app, headers)
  const next = (built.payload as { release: ReleaseSummary }).release
  const pointer = initial.pointer
  assert.ok(pointer)
  await activate(app, headers, next.releaseCode, pointer.version)

  const stale = await adminRead(app, '/orm/graph/adjacency')
  assert.equal(stale.statusCode, 200)
  const staleView = dataOf<{ state: string; stale: boolean; total: number; notice: string }>(stale)
  assert.equal(staleView.state, 'stale')
  assert.equal(staleView.stale, true)
  assert.match(staleView.notice, /[Rr]ebuild/)

  const cleared = await moonql.model('graph_adjacency').removeWhere({}, 1000)
  assert.ok(cleared >= 5)
  const empty = await adminRead(app, '/orm/graph/adjacency')
  assert.equal(dataOf<{ total: number; stale: boolean }>(empty).total, 0)

  const rebuilt = await app.inject()
    .post('/orm/graph/adjacency/rebuild')
    .headers(headers)
    .body({ rebuiltBy: 'M12 test reviewer' })
    .end()
  assert.equal(rebuilt.statusCode, 200, rebuilt.body)
  const rebuildView = dataOf<{ state: string; rows: number; cleared: number; stale: boolean }>(rebuilt)
  assert.equal(rebuildView.state, 'rebuilt')
  assert.equal(rebuildView.stale, false)
  assert.equal(rebuildView.rows, 6)
  assert.equal(rebuildView.cleared, 0)

  const rebuiltAgain = await app.inject()
    .post('/orm/graph/adjacency/rebuild')
    .headers(headers)
    .body({ rebuiltBy: 'M12 test reviewer' })
    .end()
  assert.equal(rebuiltAgain.statusCode, 200, rebuiltAgain.body)
  const againView = dataOf<{ state: string; rows: number; cleared: number; stale: boolean }>(rebuiltAgain)
  assert.equal(againView.state, 'rebuilt')
  assert.equal(againView.cleared, 6)
  assert.equal(againView.rows, 6)
  assert.equal(againView.stale, false)

  const search = await adminRead(app, '/orm/graph/search?q=O005')
  assert.equal(search.statusCode, 200)
  const found = dataOf<{ state: string; total: number; items: Array<{ code: string; from: string; to: string }> }>(search)
  assert.equal(found.state, 'ok')
  assert.ok(found.items.some((item) => item.code === approvedCode))
  assert.ok(found.items.some((item) => item.from === 'O005' || item.to === 'O005'))

  const noCandidates = await adminRead(app, '/orm/graph/search?q=GC-O003')
  assert.equal(noCandidates.statusCode, 200)
  assert.equal(dataOf<{ total: number }>(noCandidates).total, 0)

  const tooShort = await adminRead(app, '/orm/graph/search?q=O')
  assert.equal(tooShort.statusCode, 400)

  const unknown = await adminRead(app, '/orm/graph/relation?code=GC-NOPE')
  assert.equal(unknown.statusCode, 404)
})

test('M12-05: similarity and co-occurrence never auto-approve sameAs or chronology', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  const headers = await adminHeaders(app, '/orm')

  const view = await overview(app)
  const rejected = view.candidates.find((row) => row.candidateCode === REJECTED_SAME_AS)
  assert.ok(rejected)
  assert.equal(rejected.rejected, true)
  assert.equal(rejected.relationType, 'sameAs')
  assert.equal(rejected.evidence.frame, 'CO_OCCURRENCE')
  assert.equal(rejected.inActiveRelease, false)

  const chronology = view.candidates.find((row) => row.candidateCode === CHRONOLOGY_PENDING)
  assert.ok(chronology)
  assert.equal(chronology.pending, true)
  assert.equal(chronology.evidence.frame, 'CHRONOLOGY')
  assert.equal(chronology.inActiveRelease, false)

  await assert.rejects(
    () =>
      moonql.model('graph_candidates').create({
        candidateCode: 'GC-direct-sameAs',
        sourceEntityRef: 'entity-a',
        targetEntityRef: 'entity-b',
        relationType: 'sameAs',
        perspective: 'GENERAL',
        sourceRef: 'source-a',
        epistemicStatus: 'UNKNOWN',
        status: 'APPROVED',
        evidenceFrame: 'CO_OCCURRENCE',
        evidenceSpan: 'same label',
        evidenceSha: M02_SHA256,
        reviewer: 'M12 test reviewer',
        decisionNote: 'bypass attempt',
        decidedAt: new Date().toISOString(),
        reason: 'Direct write bypasses the endpoint.',
      }),
    /sameAs can never be approved/,
  )

  const coexist = await registerCandidate(app, headers, {
    from: 'O007',
    to: 'O006',
    relationType: 'sameAs',
    perspective: 'CREATIVE_FICTION',
    sourceCode: 'm02-01-disambiguation',
    evidenceFrame: 'CO_OCCURRENCE',
    evidenceSpan:
      'Kemiripan nama, rima, nomor, atau metafora artistik TIDAK BOLEH dikonversi menjadi relasi `owl:sameAs` atau Foreign Key relasional langsung secara otomatis.',
    evidenceSha: M02_SHA256,
    reason: 'A co-occurrence claim about the same label.',
  })
  assert.equal(coexist.statusCode, 200)
  const coexistCode = String((coexist.payload as { candidate: CandidateView }).candidate.candidateCode)
  const refusal = await decide(app, headers, {
    candidateCode: coexistCode,
    decision: 'APPROVED',
    reviewer: 'M12 test reviewer',
    reason: 'A shared label is not identity.',
  })
  assert.equal(refusal.statusCode, 400)
  assert.match(JSON.stringify(refusal.payload), /sameAs/)

  const built = await build(app, headers)
  assert.equal(built.payload.state, 'existing')
  const active = (await overview(app)).active
  assert.ok(active)
  const detail = await releaseDetail(app, active.releaseCode)
  for (const edge of detail.manifest.edges) {
    assert.notEqual(edge[4], 'sameAs')
    assert.notEqual(edge[0], CHRONOLOGY_PENDING)
    assert.notEqual(edge[0], coexistCode)
  }
  assert.ok(detail.manifest.edges.every((edge) => edge[6] !== 'sameAs'))
  assert.equal(view.options.relationTypes.includes('sameAs'), true)
  assert.equal(view.policy.sameAsApproval, 'FORBIDDEN_USE_IDENTITY_REVIEW')
  assert.equal(view.policy.automaticApproval, false)
})

test('M12-06: relation detail labels candidate, reviewed edge and unknown provenance', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })

  const pending = await candidate(app, SAME_AS_PENDING)
  assert.equal(pending.relation.kind, 'CANDIDATE')
  assert.equal(pending.relation.status, 'PENDING')
  assert.match(String(pending.relation.statusLabel), /pending/i)
  assert.equal(pending.relation.inActiveRelease, false)
  assert.equal(pending.relation.evidence.frame, 'SIMILARITY')
  assert.equal(pending.relation.evidence.present, true)
  assert.equal(pending.relation.evidence.exactSha, true)
  assert.equal(pending.relation.source?.reviewStatus, 'APPROVED_FOR_CITATION')
  assert.equal(pending.relation.fromEntity?.stableId, 'O003')
  assert.equal(pending.relation.toEntity?.stableId, 'O005')
  assert.equal(pending.release?.releaseCode, (await overview(app)).active?.releaseCode)
  assert.equal(pending.policy.releaseImmutable, true)

  const reviewed = await candidate(app, SEED_EDGE)
  assert.equal(reviewed.relation.kind, 'REVIEWED')
  assert.equal(reviewed.relation.verified, true)
  assert.equal(reviewed.relation.inActiveRelease, true)
  assert.equal(reviewed.relation.evidence.frame, 'ONTOLOGY_RELATION')
  assert.equal(reviewed.relation.evidence.sha, M02_SHA256)
  assert.equal(reviewed.relation.evidence.exactSha, true)
  assert.equal(reviewed.relation.fromEntity?.labelEn, 'SHADOW Workspace')
  assert.equal(reviewed.relation.toEntity?.labelEn, 'SHADOW Character')

  const dedup = await candidate(app, DEDUP_CANDIDATE)
  assert.equal(dedup.relation.kind, 'CANDIDATE')
  assert.equal(dedup.relation.approved, true)
  assert.equal(dedup.relation.inActiveRelease, false)
  assert.match(String(dedup.relation.statusLabel), /awaiting a release/)

  const approved = await candidate(app, APPROVED_CANDIDATE)
  assert.equal(approved.relation.approved, true)
  assert.equal(approved.relation.inActiveRelease, true)
  assert.equal(approved.relation.evidence.frame, 'CO_OCCURRENCE')

  const missing = await adminRead(app, '/orm/graph/relation?code=NO-SUCH-RELATION')
  assert.equal(missing.statusCode, 404)
  const noCode = await adminRead(app, '/orm/graph/relation')
  assert.equal(noCode.statusCode, 400)
})

test('M12-07: export lineage, replay dedup and revoked candidates stay visible', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  const headers = await adminHeaders(app, '/orm')

  const initial = await overview(app)
  assert.ok(initial.active)
  const seedCode = initial.active.releaseCode
  const seedSha = initial.active.graphSha

  const exported = await adminRead(app, '/orm/graph/export')
  assert.equal(exported.statusCode, 200)
  const exportView = dataOf<{
    schema: string
    graphSha: string
    release: ReleaseSummary
    manifest: ReleaseDetail['manifest']
    lineage: ReleaseDetail['lineage']
    replay: string
  }>(exported)
  assert.equal(exportView.schema, 'moonwitness-graph-export-v1')
  assert.equal(exportView.graphSha, seedSha)
  assert.equal(exportView.release.releaseCode, seedCode)
  assert.equal(exportView.manifest.ontology.length, 4)
  assert.equal(exportView.manifest.candidates.length, 1)
  assert.equal(exportView.manifest.candidates[0]?.[0], APPROVED_CANDIDATE)
  assert.equal(exportView.manifest.deduplicated.length, 1)
  assert.equal(exportView.manifest.deduplicated[0]?.code, DEDUP_CANDIDATE)
  assert.equal(exportView.manifest.deduplicated[0]?.duplicateOf, SEED_EDGE)
  assert.deepEqual(exportView.lineage.ontologyEdges, exportView.manifest.ontology.map((edge) => edge[0]))
  assert.deepEqual(exportView.lineage.candidates, [APPROVED_CANDIDATE])
  const sourceCodes = exportView.lineage.sources.map((source) => source.code)
  assert.deepEqual([...sourceCodes].sort(), ['m02-01-disambiguation', 'm09-unilex-review', 'xv-master-vision'])
  for (const source of exportView.lineage.sources) assert.match(source.sha256, /^[0-9a-f]{64}$/)
  assert.match(exportView.replay, /same graphSha/)

  const byCode = await adminRead(app, `/orm/graph/export?code=${encodeURIComponent(seedCode)}`)
  assert.equal(byCode.statusCode, 200)
  assert.equal(dataOf<{ graphSha: string }>(byCode).graphSha, seedSha)
  const missing = await adminRead(app, '/orm/graph/export?code=grel_nope')
  assert.equal(missing.statusCode, 404)

  const replay = await build(app, headers)
  assert.equal(replay.payload.state, 'existing')

  const revoked = await decide(app, headers, {
    candidateCode: APPROVED_CANDIDATE,
    decision: 'REVOKED',
    reviewer: 'M12 test reviewer',
    reason: 'The creative co-membership claim is withdrawn; the record stays visible.',
  })
  assert.equal(revoked.statusCode, 200, JSON.stringify(revoked.payload))
  const revokedView = (revoked.payload as { candidate: CandidateView }).candidate
  assert.equal(revokedView.revoked, true)
  assert.equal(revokedView.inActiveRelease, true)

  const afterRevoke = await overview(app)
  const stillVisible = afterRevoke.candidates.find((row) => row.candidateCode === APPROVED_CANDIDATE)
  assert.ok(stillVisible)
  assert.equal(stillVisible.revoked, true)
  assert.match(String(stillVisible.statusLabel), /revoked/i)

  const oldExport = await adminRead(app, `/orm/graph/export?code=${encodeURIComponent(seedCode)}`)
  assert.equal(oldExport.statusCode, 200)
  assert.equal(dataOf<{ graphSha: string }>(oldExport).graphSha, seedSha)
  assert.equal(
    dataOf<ReleaseDetail>(await adminRead(app, `/orm/graph/release?code=${encodeURIComponent(seedCode)}`)).manifest.candidates.length,
    1,
  )

  const rebuilt = await build(app, headers)
  assert.equal(rebuilt.statusCode, 200, JSON.stringify(rebuilt.payload))
  assert.equal(rebuilt.payload.state, 'built')
  const next = (rebuilt.payload as { release: ReleaseSummary }).release
  assert.notEqual(next.graphSha, seedSha)
  assert.equal(next.edgeCount, 4)
  assert.equal(next.candidateCount, 0)
  assert.equal(next.deduplicatedCount, 1)

  const pointer = afterRevoke.pointer
  assert.ok(pointer)
  const activated = await activate(app, headers, next.releaseCode, pointer.version)
  assert.equal(activated.statusCode, 200)
  const finalExport = await adminRead(app, '/orm/graph/export')
  assert.equal(finalExport.statusCode, 200)
  const finalView = dataOf<{ manifest: ReleaseDetail['manifest']; release: ReleaseSummary }>(finalExport)
  assert.equal(finalView.release.releaseCode, next.releaseCode)
  assert.equal(finalView.manifest.candidates.length, 0)
  assert.ok(finalView.manifest.edges.every((edge) => edge[0] !== APPROVED_CANDIDATE))

  const revokedDetail = await candidate(app, APPROVED_CANDIDATE)
  assert.equal(revokedDetail.relation.revoked, true)
  assert.equal(revokedDetail.relation.inActiveRelease, false)

  const anonymousWrite = await app.inject()
    .post('/orm/graph/releases/build')
    .body({ builtBy: 'anonymous' })
    .end()
  assert.equal(anonymousWrite.statusCode, 401)
})
