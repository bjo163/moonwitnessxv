/**
 * M12 drill: render the Constellation relation detail and the release /
 * candidate queue without a browser. The meaningful parts are the separation
 * between a candidate claim and a reviewed relation, exact-SHA evidence, the
 * unresolved UNKNOWN state, release membership and the read-only policy.
 *
 * Run from apps/dock:
 *   node ../radio/node_modules/tsx/dist/cli.mjs scripts/verify-graph-ui.tsx
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { GraphReleasePanel, RelationDetailView } from '../src/ui/components/graph-relation'
import type {
  GraphOverview,
  GraphPolicy,
  GraphSource,
  RelationDetail,
} from '../src/data/queries/graph'

const VISION_SHA = '7aedcf33606388a7306b184c40391b4f85909388c2cc65dcb867ce1b6932ccbb'
const M02_SHA = 'ee1836db96543f96cc88a1996a6a31cbc5cb099a82c07e3e0a8bc033fd6a3b95'
const RELEASE_CODE = 'grel_0123456789ab'
const RELEASE_SHA = 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90'

const visionSource: GraphSource = {
  code: 'xv-master-vision',
  title: 'XV Vision Brief',
  sourceType: 'PINNED_DOCUMENT',
  citation: 'XV vision brief, commit e2f4562',
  sourceUri: 'https://github.com/bjo163/empire-of-the-light/blob/e2f4562/docs/vision.md',
  provenanceSha: VISION_SHA,
  reviewStatus: 'APPROVED_FOR_CITATION',
}

const quranSource: GraphSource = {
  code: 'quran-edition',
  title: 'Quran — Tanzil edition',
  sourceType: 'PINNED_CORPUS',
  citation: 'Tanzil Uthmani, edition digest c0a8f1e7',
  sourceUri: 'https://tanzil.net/',
  provenanceSha: M02_SHA,
  reviewStatus: 'APPROVED_FOR_CITATION',
}

const policy: GraphPolicy = {
  candidateReviewRequired: true,
  evidenceAtExactSha: true,
  evidenceSpanRequiredForApproval: true,
  sameAsApproval: 'FORBIDDEN_USE_IDENTITY_REVIEW',
  automaticApproval: false,
  releaseImmutable: true,
  pointerSingleton: true,
  adjacencyDerived: true,
  revokedVisible: true,
  deduplication:
    'A reviewed ontology relation wins over a candidate with the same from|to|relationType|perspective; the duplicate stays in the manifest lineage.',
  notice:
    'A candidate never becomes a graph edge by itself. A release freezes only reviewed relations and approved candidates whose evidence names an exact SHA-256.',
}

const pendingDetail: RelationDetail = {
  state: 'ok',
  relation: {
    code: 'GC-O003-O005-sameAs-SUFI_STUDY',
    label: 'Candidate — pending review',
    kind: 'CANDIDATE',
    candidateCode: 'GC-O003-O005-sameAs-SUFI_STUDY',
    from: 'O003',
    to: 'O005',
    fromLabel: 'ZILL — Shadow Witness',
    toLabel: 'Zill — Tasawuf',
    relationType: 'sameAs',
    perspective: 'ISLAMIC_SCRIPTURE',
    epistemicStatus: 'UNKNOWN',
    epistemicLabel: 'Unknown — unresolved',
    status: 'PENDING',
    statusLabel: 'Candidate — pending review',
    approved: false,
    rejected: false,
    revoked: false,
    pending: true,
    inActiveRelease: false,
    unknown: true,
    evidence: {
      span: '| ZILL — Shadow Witness | thematicallyRelatedTo | Zill — Tasawuf | Never auto sameAs |',
      frame: 'SIMILARITY',
      sha: VISION_SHA,
      ref: 'vision@e2f4562',
      present: true,
      exactSha: true,
    },
    source: visionSource,
    reviewer: null,
    reason: 'The vision pairs the two labels with a thematic relation, never an identity.',
    decisionNote: null,
    decidedAt: null,
    fromEntity: {
      stableId: 'O003',
      kind: 'CHARACTER',
      perspective: 'CREATIVE_FICTION',
      labelEn: 'ZILL — Shadow Witness',
      labelId: 'Zill',
      identityStatus: 'REVIEWED',
    },
    toEntity: {
      stableId: 'O005',
      kind: 'TEXTUAL_WITNESS',
      perspective: 'ISLAMIC_SCRIPTURE',
      labelEn: 'Zill — Tasawuf',
      labelId: 'Zill',
      identityStatus: 'CANDIDATE',
    },
  },
  release: { releaseCode: RELEASE_CODE, graphSha: RELEASE_SHA },
  policy,
}

const approvedDetail: RelationDetail = {
  ...pendingDetail,
  relation: {
    ...pendingDetail.relation,
    code: 'GC-O008-O007-relatedTo-CREATIVE_FICTION',
    candidateCode: 'GC-O008-O007-relatedTo-CREATIVE_FICTION',
    label: 'Approved candidate — in the active release',
    from: 'O008',
    to: 'O007',
    fromLabel: 'THE BATTERIES',
    toLabel: 'SHADOW Character',
    relationType: 'relatedTo',
    perspective: 'CREATIVE_FICTION',
    status: 'APPROVED',
    statusLabel: 'Approved candidate — in the active release',
    approved: true,
    pending: false,
    inActiveRelease: true,
    evidence: {
      span: 'Fictional ensemble including THE BATTERIES and THE SHADOW.',
      frame: 'CO_OCCURRENCE',
      sha: VISION_SHA,
      ref: 'vision@e2f4562',
      present: true,
      exactSha: true,
    },
    reviewer: 'M10 ontology boundary review',
    decisionNote: 'Creative co-membership is asserted; the entities stay distinct.',
    decidedAt: '2026-10-26T00:00:00.000Z',
  },
}

const reviewedDetail: RelationDetail = {
  state: 'ok',
  relation: {
    code: 'EDG-O001-O002-distinctFrom',
    label: 'Reviewed relation — verified',
    kind: 'REVIEWED',
    edgeCode: 'EDG-O001-O002-distinctFrom',
    from: 'O001',
    to: 'O002',
    fromLabel: 'ALLAH',
    toLabel: 'A-L-L-A-H Command Center',
    relationType: 'distinctFrom',
    perspective: 'ISLAMIC_SCRIPTURE',
    epistemicStatus: 'VERIFIED',
    epistemicLabel: 'Verified by reviewer',
    status: null,
    statusLabel: 'Reviewed relation — verified',
    approved: true,
    verified: true,
    inActiveRelease: true,
    unknown: false,
    assertedBy: 'REVIEWER',
    evidence: {
      span: null,
      frame: 'ONTOLOGY_RELATION',
      sha: M02_SHA,
      ref: 'review/O001:O002',
      present: true,
      exactSha: true,
    },
    source: quranSource,
    reviewer: 'M10 ontology boundary review',
    reason: 'Scripture and project naming are different referents.',
    decisionNote: null,
    decidedAt: null,
    fromEntity: {
      stableId: 'O001',
      kind: 'ENTITY',
      perspective: 'ISLAMIC_SCRIPTURE',
      labelEn: 'ALLAH',
      labelId: 'Allah',
      identityStatus: 'REVIEWED',
    },
    toEntity: {
      stableId: 'O002',
      kind: 'ENTITY',
      perspective: 'PROJECT_INTERNAL',
      labelEn: 'A-L-L-A-H Command Center',
      labelId: 'A-L-L-A-H Command Center',
      identityStatus: 'REVIEWED',
    },
  },
  release: { releaseCode: RELEASE_CODE, graphSha: RELEASE_SHA },
  policy,
}

const revokedDetail: RelationDetail = {
  ...pendingDetail,
  relation: {
    ...pendingDetail.relation,
    code: 'GC-O006-O007-sameAs-GENERAL',
    candidateCode: 'GC-O006-O007-sameAs-GENERAL',
    from: 'O006',
    to: 'O007',
    fromLabel: 'SHADOW Workspace',
    toLabel: 'SHADOW Character',
    relationType: 'sameAs',
    perspective: 'GENERAL',
    status: 'REVOKED',
    statusLabel: 'Candidate — revoked, kept visible',
    revoked: true,
    pending: false,
    inActiveRelease: true,
    reviewer: 'Reviewer B',
    reason: 'A shared label never merges two entities.',
    decisionNote: 'Revoked after the identity review confirmed both entities stay distinct.',
    decidedAt: '2026-10-26T00:00:00.000Z',
  },
}

const candidateSummaries: GraphOverview['candidates'] = [
  {
    candidateCode: pendingDetail.relation.code,
    kind: 'CANDIDATE',
    from: 'O003',
    to: 'O005',
    fromLabel: 'ZILL — Shadow Witness',
    toLabel: 'Zill — Tasawuf',
    relationType: 'sameAs',
    perspective: 'ISLAMIC_SCRIPTURE',
    epistemicStatus: 'UNKNOWN',
    epistemicLabel: 'Unknown — unresolved',
    status: 'PENDING',
    statusLabel: 'Candidate — pending review',
    approved: false,
    rejected: false,
    revoked: false,
    pending: true,
    inActiveRelease: false,
    unknown: true,
    evidence: pendingDetail.relation.evidence,
    source: visionSource,
    reviewer: null,
    reason: pendingDetail.relation.reason,
    decisionNote: null,
    decidedAt: null,
  },
  {
    candidateCode: approvedDetail.relation.code,
    kind: 'CANDIDATE',
    from: 'O008',
    to: 'O007',
    fromLabel: 'THE BATTERIES',
    toLabel: 'SHADOW Character',
    relationType: 'relatedTo',
    perspective: 'CREATIVE_FICTION',
    epistemicStatus: 'UNKNOWN',
    epistemicLabel: 'Unknown — unresolved',
    status: 'APPROVED',
    statusLabel: 'Approved candidate — in the active release',
    approved: true,
    rejected: false,
    revoked: false,
    pending: false,
    inActiveRelease: true,
    unknown: true,
    evidence: approvedDetail.relation.evidence,
    source: visionSource,
    reviewer: 'M10 ontology boundary review',
    reason: approvedDetail.relation.reason,
    decisionNote: approvedDetail.relation.decisionNote,
    decidedAt: approvedDetail.relation.decidedAt,
  },
  {
    candidateCode: revokedDetail.relation.code,
    kind: 'CANDIDATE',
    from: 'O006',
    to: 'O007',
    fromLabel: 'SHADOW Workspace',
    toLabel: 'SHADOW Character',
    relationType: 'sameAs',
    perspective: 'GENERAL',
    epistemicStatus: 'UNKNOWN',
    epistemicLabel: 'Unknown — unresolved',
    status: 'REVOKED',
    statusLabel: 'Candidate — revoked, kept visible',
    approved: false,
    rejected: false,
    revoked: true,
    pending: false,
    inActiveRelease: true,
    unknown: true,
    evidence: pendingDetail.relation.evidence,
    source: visionSource,
    reviewer: 'Reviewer B',
    reason: revokedDetail.relation.reason,
    decisionNote: revokedDetail.relation.decisionNote,
    decidedAt: revokedDetail.relation.decidedAt,
  },
]

const overview: GraphOverview = {
  state: 'ok',
  registry: { version: '1.0.0', status: 'REVIEWED_BASELINE', notice: 'Reviewed baseline.', pins: {} },
  active: {
    releaseCode: RELEASE_CODE,
    graphSha: RELEASE_SHA,
    edgeCount: 5,
    ontologyCount: 4,
    candidateCount: 1,
    deduplicatedCount: 1,
    builtAt: '2026-10-26T00:00:00.000Z',
    builtBy: 'system',
    note: null,
    active: true,
  },
  pointer: {
    key: 'active',
    version: 2,
    releaseCode: RELEASE_CODE,
    previousReleaseCode: 'grel_previous000',
    activatedBy: 'system',
    activatedAt: '2026-10-26T00:00:00.000Z',
    note: null,
  },
  separation: {
    candidates: {
      table: 'graph_candidates',
      total: 3,
      pending: 1,
      approved: 1,
      rejected: 0,
      revoked: 1,
      notice: 'A candidate is a claim under review. It is never presented as a graph edge.',
    },
    reviewed: {
      table: 'graph_releases',
      activeReleaseCode: RELEASE_CODE,
      edgeCount: 5,
      notice: 'Only an immutable release is presented as the reviewed graph. UNKNOWN and DISPUTED claims stay out.',
    },
  },
  counts: {
    reviewedRelations: 4,
    unresolvedRelations: 0,
    candidates: 3,
    edgesInActiveRelease: 5,
    adjacencyRows: 5,
    adjacencyStale: false,
    releases: 2,
  },
  adjacency: { derived: true, rebuildable: true, stale: false, rows: 5, releaseCode: RELEASE_CODE },
  candidates: candidateSummaries,
  options: {
    statuses: ['PENDING', 'APPROVED', 'REJECTED', 'REVOKED'],
    relationTypes: ['relatedTo', 'distinctFrom', 'sameAs'],
    perspectives: ['CREATIVE_FICTION', 'ISLAMIC_SCRIPTURE'],
  },
  policy,
  sources: [visionSource, quranSource],
}

let checks = 0
function must(condition: boolean, label: string): void {
  assert.ok(condition, label)
  checks++
  console.info(`PASS ${label}`)
}

function render(detail: RelationDetail): string {
  return renderToStaticMarkup(<RelationDetailView detail={detail} />)
}

const pendingHtml = render(pendingDetail)
const approvedHtml = render(approvedDetail)
const reviewedHtml = render(reviewedDetail)
const revokedHtml = render(revokedDetail)
const overviewHtml = renderToStaticMarkup(<GraphReleasePanel overview={overview} />)

// ---- candidate: a claim, never a graph edge --------------------------------
must(pendingHtml.includes('Candidate claim — not a graph edge'), 'candidate is labelled as a claim, not a graph edge')
must(pendingHtml.includes('data-relation-kind="CANDIDATE"'), 'candidate relation carries a candidate marker')
must(pendingHtml.includes('data-status="PENDING"'), 'pending status is machine-readable')
must(pendingHtml.includes('data-in-release="false"'), 'pending candidate is marked outside the release')
must(pendingHtml.includes('data-unknown="true"'), 'UNKNOWN relation carries an unresolved marker')
must(pendingHtml.includes('Unknown — unresolved'), 'UNKNOWN status is labelled unresolved')
must(pendingHtml.includes('UNKNOWN stays unresolved'), 'UNKNOWN may remain unresolved')
must(
  pendingHtml.includes('Not in the active release. Approval alone does not put a candidate into the graph.'),
  'pending candidate is explicitly outside the graph',
)
must(pendingHtml.includes('GC-O003-O005-sameAs-SUFI_STUDY'), 'candidate code is visible')
must(pendingHtml.includes('SIMILARITY'), 'evidence frame is visible')
must(pendingHtml.includes('Never auto sameAs'), 'the evidence span is quoted verbatim')
must(pendingHtml.includes(VISION_SHA), 'exact evidence SHA is visible')
must(pendingHtml.includes('yes — pinned to the source provenance'), 'exact SHA match is stated')
must(pendingHtml.includes('xv-master-vision'), 'source code is rendered')
must(
  pendingHtml.includes('sameAs can never be approved as a correlation candidate'),
  'the sameAs prohibition is stated on a sameAs candidate',
)
must(pendingHtml.includes('No reviewer yet'), 'a pending candidate names the missing reviewer')
must(pendingHtml.includes('FORBIDDEN_USE_IDENTITY_REVIEW'), 'the sameAs policy value is visible')
must(pendingHtml.includes(RELEASE_CODE) && pendingHtml.includes(RELEASE_SHA), 'active release identity is visible')

// ---- approved candidate: in the release, still a candidate -----------------
must(approvedHtml.includes('Approved candidate — in the active release'), 'approved candidate is labelled in-release')
must(approvedHtml.includes('data-status="APPROVED"'), 'approved status is machine-readable')
must(approvedHtml.includes('data-in-release="true"'), 'approved candidate in the release is marked')
must(approvedHtml.includes('This relation is part of the active release'), 'release membership is stated')
must(approvedHtml.includes('M10 ontology boundary review'), 'approving reviewer is named')

// ---- reviewed: verified relation, still released only ----------------------
must(reviewedHtml.includes('Reviewed ontology relation'), 'reviewed relation is labelled separately')
must(reviewedHtml.includes('data-relation-kind="REVIEWED"'), 'reviewed relation carries a reviewed marker')
must(reviewedHtml.includes('data-verified="true"'), 'verified relation carries a verified marker')
must(reviewedHtml.includes('Reviewed relation — verified'), 'verified relation names the reviewer decision')
must(reviewedHtml.includes('VERIFIED BY REVIEWER'), 'verified badge is visible')
must(reviewedHtml.includes('asserted by REVIEWER'), 'assertedBy is visible')
must(reviewedHtml.includes('ONTOLOGY_RELATION'), 'reviewed evidence names its frame')
must(
  reviewedHtml.includes('A reviewed relation is evidenced by its ontology source; no separate span is stored.'),
  'reviewed evidence explains the missing span',
)
must(reviewedHtml.includes(M02_SHA), 'reviewed relation shows its source SHA')
must(reviewedHtml.includes('quran-edition'), 'reviewed relation shows its source')
must(reviewedHtml.includes('This relation is part of the active release'), 'reviewed relation names its release')

// ---- revoked: visible for the record --------------------------------------
must(revokedHtml.includes('Candidate — revoked, kept visible'), 'revoked candidate stays visible')
must(revokedHtml.includes('data-status="REVOKED"'), 'revoked status is machine-readable')
must(revokedHtml.includes('IN ACTIVE RELEASE'), 'an old release membership stays visible next to revocation')
must(revokedHtml.includes('Revoked after the identity review'), 'the revocation note is preserved')

// ---- read-only: no form, input or button in any detail ---------------------
for (const [name, html] of [
  ['pending', pendingHtml],
  ['approved', approvedHtml],
  ['reviewed', reviewedHtml],
  ['revoked', revokedHtml],
  ['release panel', overviewHtml],
] as const) {
  must(!/<form[\s>]/.test(html), `${name} contains no form`)
  must(!/<button[\s>]/.test(html), `${name} contains no button`)
  must(!/<input[\s>]/.test(html), `${name} contains no input`)
}

// ---- release panel: immutable release beside the candidate queue -----------
must(overviewHtml.includes('Reviewed release and candidate queue'), 'release panel is present')
must(overviewHtml.includes('IMMUTABLE RELEASE'), 'release is marked immutable')
must(overviewHtml.includes('POINTER v2'), 'pointer version is visible')
must(overviewHtml.includes(RELEASE_CODE), 'active release code is visible')
must(overviewHtml.includes(RELEASE_SHA), 'active release graph SHA is visible')
must(overviewHtml.includes('data-active-release="grel_0123456789ab"'), 'active release is machine-readable')
must(overviewHtml.includes('<strong>5</strong> release edges'), 'release edge count is visible')
must(overviewHtml.includes('<strong>4</strong> verified relations'), 'verified relation count is visible')
must(overviewHtml.includes('<strong>3</strong> candidates'), 'candidate count is visible')
must(overviewHtml.includes('<strong>1</strong> pending'), 'pending candidate count is visible')
must(overviewHtml.includes('<strong>1</strong> approved'), 'approved candidate count is visible')
must(overviewHtml.includes('<strong>1</strong> revoked'), 'revoked candidate count is visible')
must(overviewHtml.includes('A candidate never becomes a graph edge by itself.'), 'policy notice is visible')
must(overviewHtml.includes('Only an immutable release is presented as the reviewed graph.'), 'release separation notice is visible')
must(
  overviewHtml.includes('A candidate is a claim under review. It is never presented as a graph edge.'),
  'candidate separation notice is visible',
)
must(overviewHtml.includes(`href="/constellation/relations/${pendingDetail.relation.code}"`), 'pending candidate links to its detail')
must(overviewHtml.includes(`href="/constellation/relations/${approvedDetail.relation.code}"`), 'approved candidate links to its detail')
must(overviewHtml.includes(`href="/constellation/relations/${revokedDetail.relation.code}"`), 'revoked candidate links to its detail')
must(overviewHtml.includes('data-status="PENDING"'), 'queue marks pending candidates')
must(overviewHtml.includes('data-status="APPROVED"'), 'queue marks approved candidates')
must(overviewHtml.includes('data-status="REVOKED"'), 'queue marks revoked candidates')
must(overviewHtml.includes('NOT IN RELEASE'), 'queue marks candidates outside the release')
must(overviewHtml.includes('RELEASE MEMBER'), 'queue marks candidates inside the release')

// ---- page wiring: one backend read, no local derivation --------------------
const pageSource = readFileSync(
  new URL('../src/app/constellation/relations/[relationCode]/page.tsx', import.meta.url),
  'utf8',
)
must(pageSource.includes("export const dynamic = 'force-dynamic'"), 'relation page is server-rendered per request')
must(pageSource.includes('readRelationDetail'), 'relation page reads the backend detail')
must(pageSource.includes('notFound()'), 'relation page returns 404 for an unknown code')
must(!pageSource.includes('sha256') && !pageSource.includes('gph_'), 'relation page derives no graph identity')

const querySource = readFileSync(new URL('../src/data/queries/graph.ts', import.meta.url), 'utf8')
must(querySource.includes('/graph/relation?code='), 'query reads the public relation endpoint')
must(querySource.includes("'/graph/overview'"), 'query reads the public release overview')
must(!querySource.includes('/graph/releases/build'), 'query never builds a release')
must(!querySource.includes('/graph/releases/activate'), 'query never activates a release')
must(!querySource.includes('/graph/candidates/decide'), 'query never decides a candidate')
must(!querySource.includes('/graph/candidates/register'), 'query never registers a candidate')
must(!querySource.includes('/graph/adjacency/rebuild'), 'query never rebuilds adjacency')

const componentSource = readFileSync(new URL('../src/ui/components/graph-relation.tsx', import.meta.url), 'utf8')
must(!componentSource.includes('serverClient'), 'component performs no backend write')
must(!componentSource.includes('fetch('), 'component fetches nothing locally')
must(!componentSource.includes('createHash') && !componentSource.includes('sha256('), 'component computes no hash')

const constellationComponent = readFileSync(
  new URL('../src/ui/components/constellation.tsx', import.meta.url),
  'utf8',
)
must(
  constellationComponent.includes('/constellation/relations/${edge.edgeCode}'),
  'every Constellation edge links to its relation detail',
)

const constellationPage = readFileSync(new URL('../src/app/constellation/page.tsx', import.meta.url), 'utf8')
must(constellationPage.includes('readGraphOverview'), 'Constellation page reads the release overview')
must(constellationPage.includes('GraphReleasePanel'), 'Constellation page renders the release panel')

// ---- styles: tokens only, mobile collapse, visible keyboard focus ----------
const css = readFileSync(new URL('../src/app/globals.css', import.meta.url), 'utf8')
const graphCss = css.slice(css.indexOf('/* ---------- Constellation graph projection ---------- */'))
must(graphCss.includes('.dk-graph-detail'), 'relation detail styles are present')
must(graphCss.includes('.dk-graph-release-queue'), 'candidate queue styles are present')
must(/@media \(max-width: 900px\)[^@]*\.dk-graph-detail-entities\s*{[^}]*grid-template-columns:\s*1fr/s.test(css), 'relation detail collapses to one column on mobile')
must(/\.dk-graph-edge-link:focus-visible/.test(css), 'edge links have a visible keyboard focus style')
must(/\.dk-graph-candidate-link:focus-visible/.test(css), 'candidate links have a visible keyboard focus style')
must(!/#[0-9a-f]{3,6}\b/i.test(graphCss), 'graph detail styles use design tokens, not hex colors')

console.info(`\nGraph relation UI drill: ${checks} checks passed.`)
