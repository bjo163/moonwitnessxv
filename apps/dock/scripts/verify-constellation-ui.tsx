/**
 * M10 drill: render the Constellation without a browser and check the parts
 * that carry meaning for reviewers — the backend graph ID, separate kinds,
 * sourced aliases with script/direction, epistemic edge labels, append-only
 * identity decisions, the conflict rubric and read-only behaviour.
 *
 * Run from apps/dock:
 *   node ../radio/node_modules/tsx/dist/cli.mjs scripts/verify-constellation-ui.tsx
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { ConstellationView } from '../src/ui/components/constellation'
import type {
  ConstellationProjection,
  GraphSource,
  ReviewRubric,
} from '../src/data/queries/constellation'

const ARABIC = 'الله'

const quranSource: GraphSource = {
  code: 'quran-edition',
  title: 'Quran — Tanzil edition',
  sourceType: 'PINNED_CORPUS',
  citation: 'Tanzil Uthmani, edition digest c0a8f1e7',
  sourceUri: 'https://tanzil.net/',
  provenanceSha: 'c0a8f1e72b4d912a76f2b48911efd910a34b22c7a9182314ef821901abcf8912',
  reviewStatus: 'APPROVED_FOR_CITATION',
  approvalNote: 'Edition pinned by digest.',
}

const visionSource: GraphSource = {
  code: 'vision-pin',
  title: 'XV Vision Brief',
  sourceType: 'PINNED_DOCUMENT',
  citation: 'XV vision brief, commit e2f4562',
  sourceUri: 'https://github.com/bjo163/empire-of-the-light/blob/e2f4562/docs/vision.md',
  provenanceSha: '7aedcf33606388a7306b184c40391b4f85909388c2cc65dcb867ce1b6932ccbb',
  reviewStatus: 'APPROVED_FOR_CITATION',
  approvalNote: null,
}

const review: ReviewRubric = {
  reviewerRequired: true,
  evidenceRequiredForDecision: true,
  automaticMerge: false,
  unresolvedAllowed: true,
  evidenceKinds: [
    'source document pinned to an exact commit and SHA-256',
    'edition provenance digest for a textual witness',
    'reviewer record naming the evidence for a negative decision',
  ],
  notice:
    'UNKNOWN may stay unresolved. Absence of evidence is not a decision, and a shared label never opens a merge on its own.',
}

const projection: ConstellationProjection = {
  state: 'ok',
  graphId: 'gph_0123456789abcdef',
  registry: {
    version: '1.0.0',
    status: 'REVIEWED_BASELINE',
    entityCount: 8,
    notice: 'The ontology baseline is reviewed, versioned and not a claim of universal identity.',
    pins: {
      decision: { ref: 'docs/decisions/M02-01-disambiguation-registry.md', sha256: 'ee1836db' },
      terminologyReview: { ref: 'docs/audit/M09-unilex-terminology.md', sha256: 'a1aaf237' },
      empireRegistry: { ref: 'empire-of-the-light@38354ff', uri: 'https://github.com/bjo163/empire-of-the-light', sha256: '8e60fe61' },
      vision: { ref: 'vision@e2f4562', uri: 'https://github.com/bjo163/empire-of-the-light', sha256: '7aedcf33' },
    },
  },
  authority: {
    canonicalTables: ['onto_entities', 'onto_aliases', 'onto_relations', 'onto_identity_reviews'],
    readOnly: true,
    notice:
      'The Constellation is a derived projection. It cannot write, and it is not a second graph authority.',
  },
  counts: {
    nodes: 6,
    aliases: 6,
    edges: 4,
    verifiedEdges: 1,
    identityReviews: 5,
    activeMerges: 1,
    components: 5,
    unresolvedConflicts: 3,
  },
  options: {
    perspectives: ['CREATIVE_FICTION', 'ISLAMIC_SCRIPTURE', 'PROJECT_INTERNAL', 'TEXTUAL_WITNESS'],
    kinds: ['CHARACTER', 'ENTITY'],
    epistemicStatuses: ['UNKNOWN', 'DISPUTED', 'ASSERTED', 'VERIFIED'],
  },
  nodes: [
    {
      stableId: 'O001',
      kind: 'ENTITY',
      perspective: 'ISLAMIC_SCRIPTURE',
      labelEn: 'ALLAH',
      labelId: 'Allah',
      description: 'The divine name in Islamic scripture; not a character in the project fiction.',
      identityStatus: 'REVIEWED',
      identityVersion: 2,
      validFrom: null,
      validTo: null,
      unilexStableId: 'P001',
      componentId: 'O001',
      aliases: [
        {
          aliasCode: 'AL001',
          alias: ARABIC,
          languageCode: 'ar',
          scriptCode: 'Arab',
          direction: 'rtl',
          perspective: 'ISLAMIC_SCRIPTURE',
          status: 'ATTESTED',
          reviewer: 'Reviewer A',
          reason: 'Quranic orthography kept with diacritics.',
          evidenceRef: 'review/AL001',
          source: quranSource,
        },
      ],
      source: quranSource,
    },
    {
      stableId: 'O002',
      kind: 'ENTITY',
      perspective: 'PROJECT_INTERNAL',
      labelEn: 'A-L-L-A-H Command Center',
      labelId: 'A-L-L-A-H Command Center',
      description: 'The project command center, deliberately spelled with hyphens.',
      identityStatus: 'REVIEWED',
      identityVersion: 2,
      validFrom: null,
      validTo: null,
      unilexStableId: 'P002',
      componentId: 'O002',
      aliases: [
        {
          aliasCode: 'AL002',
          alias: 'A-L-L-A-H',
          languageCode: 'en',
          scriptCode: 'Latn',
          direction: 'ltr',
          perspective: 'PROJECT_INTERNAL',
          status: 'CANDIDATE',
          reviewer: null,
          reason: null,
          evidenceRef: null,
          source: visionSource,
        },
      ],
      source: visionSource,
    },
    {
      stableId: 'O003',
      kind: 'CHARACTER',
      perspective: 'CREATIVE_FICTION',
      labelEn: 'ZILL — Shadow Witness',
      labelId: 'Zill',
      description: 'A fictional witness character.',
      identityStatus: 'REVIEWED',
      identityVersion: 1,
      validFrom: null,
      validTo: null,
      unilexStableId: 'P031',
      componentId: 'O003',
      aliases: [
        {
          aliasCode: 'AL003',
          alias: 'ZILL',
          languageCode: 'en',
          scriptCode: 'Latn',
          direction: 'ltr',
          perspective: 'CREATIVE_FICTION',
          status: 'ATTESTED',
          reviewer: 'Reviewer A',
          reason: 'Named in the vision brief.',
          evidenceRef: 'review/AL003',
          source: visionSource,
        },
      ],
      source: visionSource,
    },
    {
      stableId: 'O004',
      kind: 'ENTITY',
      perspective: 'TEXTUAL_WITNESS',
      labelEn: 'ZIIL',
      labelId: 'Ziil',
      description: 'A textual witness term, one edit away from ZILL but a different referent.',
      identityStatus: 'MERGED',
      identityVersion: 2,
      validFrom: '2026-01-01T00:00:00.000Z',
      validTo: '2026-12-31T00:00:00.000Z',
      unilexStableId: 'P004',
      componentId: 'O004',
      aliases: [
        {
          aliasCode: 'AL004',
          alias: 'Ziil',
          languageCode: 'en',
          scriptCode: 'Latn',
          direction: 'ltr',
          perspective: 'TEXTUAL_WITNESS',
          status: 'CANDIDATE',
          reviewer: null,
          reason: null,
          evidenceRef: null,
          source: visionSource,
        },
      ],
      source: visionSource,
    },
    {
      stableId: 'O006',
      kind: 'ENTITY',
      perspective: 'PROJECT_INTERNAL',
      labelEn: 'SHADOW Workspace',
      labelId: 'Ruang SHADOW',
      description: 'A workspace name, not a character.',
      identityStatus: 'CANDIDATE',
      identityVersion: 1,
      validFrom: null,
      validTo: null,
      unilexStableId: null,
      componentId: 'O006',
      aliases: [
        {
          aliasCode: 'AL005',
          alias: 'SHADOW',
          languageCode: 'en',
          scriptCode: 'Latn',
          direction: 'ltr',
          perspective: 'PROJECT_INTERNAL',
          status: 'CANDIDATE',
          reviewer: null,
          reason: null,
          evidenceRef: null,
          source: visionSource,
        },
      ],
      source: visionSource,
    },
    {
      stableId: 'O007',
      kind: 'CHARACTER',
      perspective: 'CREATIVE_FICTION',
      labelEn: 'SHADOW Character',
      labelId: 'Karakter SHADOW',
      description: 'A fictional character sharing the workspace label.',
      identityStatus: 'CANDIDATE',
      identityVersion: 1,
      validFrom: null,
      validTo: null,
      unilexStableId: null,
      componentId: 'O007',
      aliases: [
        {
          aliasCode: 'AL006',
          alias: 'SHADOW',
          languageCode: 'en',
          scriptCode: 'Latn',
          direction: 'ltr',
          perspective: 'CREATIVE_FICTION',
          status: 'DISPUTED',
          reviewer: 'Reviewer B',
          reason: 'Shared label is not identity.',
          evidenceRef: 'review/O006:O007',
          source: visionSource,
        },
      ],
      source: visionSource,
    },
  ],
  edges: [
    {
      edgeCode: 'EDG-O001-O002-distinctFrom',
      relationType: 'distinctFrom',
      perspective: 'ISLAMIC_SCRIPTURE',
      epistemicStatus: 'VERIFIED',
      statusLabel: 'Verified by reviewer',
      verified: true,
      from: 'O001',
      to: 'O002',
      fromLabel: 'ALLAH',
      toLabel: 'A-L-L-A-H Command Center',
      assertedBy: 'REVIEWER',
      reviewer: 'Reviewer A',
      reason: 'Scripture and project naming are different referents.',
      evidenceRef: 'review/O001:O002',
      source: quranSource,
    },
    {
      edgeCode: 'EDG-O003-O004-distinctFrom',
      relationType: 'distinctFrom',
      perspective: 'CREATIVE_FICTION',
      epistemicStatus: 'UNKNOWN',
      statusLabel: 'Unknown — unresolved',
      verified: false,
      from: 'O003',
      to: 'O004',
      fromLabel: 'ZILL — Shadow Witness',
      toLabel: 'ZIIL',
      assertedBy: 'SEED',
      reviewer: null,
      reason: null,
      evidenceRef: null,
      source: null,
    },
    {
      edgeCode: 'EDG-O006-O007-relatedTo',
      relationType: 'relatedTo',
      perspective: 'PROJECT_INTERNAL',
      epistemicStatus: 'DISPUTED',
      statusLabel: 'Disputed — unresolved',
      verified: false,
      from: 'O006',
      to: 'O007',
      fromLabel: 'SHADOW Workspace',
      toLabel: 'SHADOW Character',
      assertedBy: 'SEED',
      reviewer: 'Reviewer B',
      reason: 'Both carry SHADOW; the kinds disagree.',
      evidenceRef: 'review/O006:O007',
      source: visionSource,
    },
    {
      edgeCode: 'EDG-O003-O004-inspiredBy',
      relationType: 'inspiredBy',
      perspective: 'CREATIVE_FICTION',
      epistemicStatus: 'ASSERTED',
      statusLabel: 'Asserted — not verified',
      verified: false,
      from: 'O003',
      to: 'O004',
      fromLabel: 'ZILL — Shadow Witness',
      toLabel: 'ZIIL',
      assertedBy: 'AUTHOR',
      reviewer: null,
      reason: 'The author asserts inspiration; no reviewer verified it.',
      evidenceRef: null,
      source: visionSource,
    },
  ],
  identityDecisions: [
    {
      reviewCode: 'IR-001',
      pairCode: 'O001:O002',
      left: 'O001',
      right: 'O002',
      identityKind: 'SAME_ENTITY',
      decision: 'REJECTED',
      candidate: false,
      activeMerge: false,
      superseded: false,
      reviewer: 'Reviewer A',
      reason: 'The hyphenated command center is not the divine name.',
      evidenceRef: 'review/O001:O002',
      effectiveFrom: null,
      effectiveTo: null,
      decidedAt: '2026-10-01T00:00:00.000Z',
    },
    {
      reviewCode: 'IR-002',
      pairCode: 'O003:O004',
      left: 'O003',
      right: 'O004',
      identityKind: 'SAME_ENTITY',
      decision: 'REJECTED',
      candidate: false,
      activeMerge: false,
      superseded: false,
      reviewer: 'Reviewer A',
      reason: 'One edit apart on the surface, but the fiction is a different referent.',
      evidenceRef: 'review/O003:O004',
      effectiveFrom: null,
      effectiveTo: null,
      decidedAt: '2026-10-02T00:00:00.000Z',
    },
    {
      reviewCode: 'IR-003a',
      pairCode: 'O006:O007',
      left: 'O006',
      right: 'O007',
      identityKind: 'ALIAS_ONLY',
      decision: 'REJECTED',
      candidate: false,
      activeMerge: false,
      superseded: true,
      reviewer: 'Reviewer B',
      reason: 'The workspace label does not make the character the same entity.',
      evidenceRef: 'review/O006:O007',
      effectiveFrom: null,
      effectiveTo: null,
      decidedAt: '2026-10-03T00:00:00.000Z',
    },
    {
      reviewCode: 'IR-003',
      pairCode: 'O006:O007',
      left: 'O006',
      right: 'O007',
      identityKind: 'SAME_ACTOR',
      decision: 'PENDING',
      candidate: true,
      activeMerge: false,
      superseded: false,
      reviewer: null,
      reason: 'A new proposal needs evidence before any decision.',
      evidenceRef: 'review/O006:O007',
      effectiveFrom: null,
      effectiveTo: null,
      decidedAt: '2026-10-20T00:00:00.000Z',
    },
    {
      reviewCode: 'IR-004',
      pairCode: 'O004:O005',
      left: 'O004',
      right: 'O005',
      identityKind: 'SAME_ENTITY',
      decision: 'APPROVED_MERGE',
      candidate: false,
      activeMerge: true,
      superseded: false,
      reviewer: 'Reviewer C',
      reason: 'Two witnesses of the same textual entity inside the shared window.',
      evidenceRef: 'review/O004:O005',
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      effectiveTo: '2026-12-31T00:00:00.000Z',
      decidedAt: '2026-10-10T00:00:00.000Z',
    },
  ],
  conflicts: [
    {
      type: 'RELATION',
      code: 'EDG-O003-O004-distinctFrom',
      title: 'O003 distinctFrom O004',
      status: 'UNKNOWN',
      detail: null,
      perspective: 'CREATIVE_FICTION',
      source: null,
      evidenceRef: null,
    },
    {
      type: 'IDENTITY',
      code: 'O006:O007',
      title: 'O006 ↔ O007',
      status: 'PENDING',
      detail: 'A new proposal needs evidence before any decision.',
      perspective: null,
      source: null,
      evidenceRef: 'review/O006:O007',
    },
    {
      type: 'ALIAS',
      code: 'ALIAS:shadow',
      title: 'Shared label "shadow"',
      status: 'COLLISION',
      detail: '2 entities use this label; a shared label never merges them.',
      perspective: null,
      source: null,
      evidenceRef: null,
    },
  ],
  review,
  sources: [quranSource, visionSource],
}

let checks = 0
function must(condition: boolean, label: string): void {
  assert.ok(condition, label)
  checks++
  console.info(`PASS ${label}`)
}

const html = renderToStaticMarkup(<ConstellationView projection={projection} />)

// ---- graph identity: backend ID, read-only, counts -------------------------
must(html.includes(`data-graph-id="${projection.graphId}"`), 'renders the backend graph ID verbatim')
must(html.includes('gph_0123456789abcdef'), 'graph ID is visible as text')
must(html.includes('READ ONLY'), 'marks the projection as read-only')
must(html.includes('not a second graph authority'), 'states the single-authority rule')
must(html.includes('onto_entities, onto_aliases, onto_relations, onto_identity_reviews'), 'names the canonical tables')
must(html.includes('<strong>6</strong> entities'), 'reports the node count')
must(html.includes('<strong>1</strong> verified edges'), 'reports verified edges separately')
must(html.includes('<strong>5</strong> identity reviews'), 'reports identity reviews')
must(html.includes('<strong>1</strong> active merges'), 'reports active merges')
must(html.includes('<strong>3</strong> unresolved conflicts'), 'reports unresolved conflicts')
must(html.includes('REVIEWED_BASELINE'), 'shows the registry status')

// ---- kinds and aliases stay separate and sourced --------------------------
must(html.includes('CHARACTER') && html.includes('ENTITY'), 'renders separate actor/entity/character kinds')
must(html.includes('CREATIVE_FICTION') && html.includes('ISLAMIC_SCRIPTURE'), 'renders perspectives')
must(/<span class="dk-graph-alias-surface" lang="ar" dir="rtl">الله<\/span>/.test(html), 'Arabic alias keeps lang="ar" dir="rtl"')
must(html.includes('Arab · ar · RTL'), 'alias metadata names script, language and direction')
must(html.includes('AL001'), 'alias code is visible')
must(html.includes('ATTESTED'), 'attested alias status is visible')
must(html.includes('reviewer: Reviewer A'), 'alias reviewer is named')
must(html.includes('evidence: review/AL001'), 'alias evidence reference is visible')
must(html.includes('UNILEX: <code>P004</code>'), 'UNILEX mapping is rendered as a reference, not a replacement')
must(html.includes('UNILEX: no term mapping'), 'missing UNILEX mapping is stated')
must(html.includes('IDENTITY v2'), 'identity version is visible')
must(html.includes('component <code>O004</code>'), 'component membership is visible')
must(html.includes(quranSource.citation ?? ''), 'source citation is rendered')
must(html.includes(quranSource.provenanceSha ?? ''), 'provenance SHA is rendered')

// ---- typed edges: epistemic status is never overstated --------------------
must(html.includes('Verified by reviewer'), 'verified edge names the reviewer decision')
must(html.includes('Unknown — unresolved'), 'UNKNOWN edge is labelled unresolved')
must(html.includes('Disputed — unresolved'), 'DISPUTED edge is labelled unresolved')
must(html.includes('Asserted — not verified'), 'ASSERTED edge is explicitly not verified')
must(html.includes('data-verified="false"'), 'unverified edges carry a non-verified marker')
must(html.includes('data-verified="true"'), 'only the verified edge carries the verified marker')
must(html.includes('distinctFrom'), 'relation type is rendered')
must(html.includes('EDG-O001-O002-distinctFrom'), 'edge code is visible')
must(html.includes('asserted by REVIEWER'), 'edge assertedBy is visible')
must(html.includes('evidence: review/O001:O002'), 'edge evidence reference is visible')

// ---- identity decisions: candidates, merges, history ----------------------
must(html.includes('Candidate — not merged'), 'PENDING candidate is explicitly not merged')
must(html.includes('Active merge window'), 'approved merge is marked active')
must(html.includes('Superseded — history kept'), 'superseded decision history is kept')
must(html.includes('IR-001'), 'rejected identity decision is visible')
must(html.includes('IR-004'), 'approved merge decision is visible')
must(html.includes('O004:O005'), 'merge pair is named')
must(html.includes('effective: 2026-01-01T00:00:00.000Z → 2026-12-31T00:00:00.000Z'), 'merge window is visible')
must(html.includes('The workspace label does not make the character the same entity.'), 'negative decision reason is preserved')
must(html.includes('data-candidate="true"'), 'candidate decision carries a candidate marker')
must(html.includes('data-active="true"'), 'active merge carries an active marker')

// ---- conflict queue and evidence rubric ------------------------------------
must(html.includes('Reviewer conflict queue and evidence rubric'), 'rubric panel is present')
must(html.includes('UNKNOWN may stay unresolved.'), 'rubric states that UNKNOWN may remain unresolved')
must(html.includes('Reviewer required: yes'), 'rubric requires a reviewer')
must(html.includes('Evidence required for a decision: yes'), 'rubric requires evidence')
must(html.includes('Automatic merge: never'), 'rubric forbids automatic merge')
must(html.includes('Unresolved items allowed: yes'), 'rubric allows unresolved items')
must(html.includes('source document pinned to an exact commit and SHA-256'), 'rubric lists accepted evidence kinds')
must(html.includes('a shared label never merges them'), 'alias collision states the no-merge rule')
must(html.includes('ALIAS:shadow'), 'alias collision code is visible')
must(html.includes('RELATION') && html.includes('IDENTITY') && html.includes('ALIAS'), 'queue names each conflict type')

// ---- read-only: no form, input or button in the projection -----------------
must(!/<form[\s>]/.test(html), 'projection contains no form')
must(!/<button[\s>]/.test(html), 'projection contains no button')
must(!/<input[\s>]/.test(html), 'projection contains no input')
must(!html.includes('sameAs'), 'projection never emits a sameAs claim')

// ---- page wiring: one backend read, no local graph computation -------------
const pageSource = readFileSync(new URL('../src/app/constellation/page.tsx', import.meta.url), 'utf8')
must(pageSource.includes("export const dynamic = 'force-dynamic'"), 'page is server-rendered per request')
must(pageSource.includes('readConstellation'), 'page reads the backend projection')
must(pageSource.includes('MoonApiError'), 'page surfaces backend errors')
must(!pageSource.includes('sha256') && !pageSource.includes('gph_'), 'page does not compute a graph ID')

const componentSource = readFileSync(new URL('../src/ui/components/constellation.tsx', import.meta.url), 'utf8')
must(!componentSource.includes('sha256') && !componentSource.includes('gph_'), 'component does not compute a graph ID')

const querySource = readFileSync(new URL('../src/data/queries/constellation.ts', import.meta.url), 'utf8')
must(querySource.includes("'/ontology/constellation'"), 'query reads the public projection endpoint')
must(!querySource.includes('/ontology/merges') && !querySource.includes('/ontology/conflicts'), 'query never calls a write or admin-only endpoint')

const shell = readFileSync(new URL('../src/ui/components/shell.tsx', import.meta.url), 'utf8')
must(shell.includes('href="/constellation"') && shell.includes('CONSTELLATION'), 'navigation links to the Constellation')

const css = readFileSync(new URL('../src/app/globals.css', import.meta.url), 'utf8')
must(css.includes('/* ---------- Constellation graph projection ---------- */'), 'graph styles are present')
must(/@media \(max-width: 900px\)[^@]*\.dk-graph-nodes\s*{[^}]*grid-template-columns:\s*1fr/s.test(css), 'graph grid collapses to one column on mobile')
must(/\.dk-graph-source-link:focus-visible/.test(css), 'source links have a visible keyboard focus style')
const graphCss = css.slice(css.indexOf('/* ---------- Constellation graph projection ---------- */'))
must(!/#[0-9a-f]{3,6}\b/i.test(graphCss), 'graph styles use design tokens, not hex colors')

console.info(`\nConstellation UI drill: ${checks} checks passed.`)
