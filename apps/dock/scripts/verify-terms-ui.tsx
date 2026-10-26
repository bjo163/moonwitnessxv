/**
 * M09 drill: render the Terms Table without a browser and check the parts that
 * carry meaning for assistive tech and reviewers — script/direction per form,
 * source provenance, superseded senses, identity decisions, match previews and
 * responsive CSS.
 *
 * Run from apps/dock:
 *   node ../radio/node_modules/tsx/dist/cli.mjs scripts/verify-terms-ui.tsx
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { MatchPreviewView, TermDetailView, TermList } from '../src/ui/components/terms'
import type {
  MatchPreview,
  RegistryMeta,
  TermDetail,
  TermsPage,
  TermSource,
} from '../src/data/queries/terms'

const ARABIC = 'زِلّ'
const HEBREW = 'צֵל'
const GREEK = 'σκιά'

const registry: RegistryMeta = {
  version: '0.1.0',
  status: 'PROPOSED_NOT_ADOPTED',
  seedCount: 71,
  pin: 'bjo163/empire-of-the-light@38354ff',
  path: 'data/unilex/terms.v0.1.json',
  rawSha256: '8e60fe61d35604f560c7c71330754db3e881915ce541c392e09fb99c53d05772',
  notice: 'UNILEX v0.1 is a proposed, versioned seed of 71 concepts — not a validated universal dictionary.',
  addenda: {
    version: 'xv-addendum-1',
    ids: ['P030', 'P031'],
    notice: 'XV project addenda are kept separate from the 71 pinned Empire concepts.',
  },
}

const source: TermSource = {
  code: 'empire-unilex-seed',
  title: 'Empire of the Light — UNILEX Seed v0.1',
  sourceType: 'PINNED_CORPUS_FILE',
  reviewStatus: 'APPROVED_FOR_CITATION',
  citation:
    'Empire of the Light, data/unilex/terms.v0.1.json, commit 38354ffff077d4ee1e17d40b39d86e41ce769817',
  sourceUri: 'https://github.com/bjo163/empire-of-the-light/blob/38354ff/data/unilex/terms.v0.1.json',
  provenanceSha: '8e60fe61d35604f560c7c71330754db3e881915ce541c392e09fb99c53d05772',
  approvalNote: 'Approved for citation as a proposed seed; not a dictionary authority.',
}

const page: TermsPage = {
  state: 'ok',
  registry,
  filters: { q: '', lane: '', scope: '', status: '', source: '' },
  options: {
    lanes: ['UNIVERSAL', 'SCRIPTURE', 'TEXT_SOURCE', 'PROJECT'],
    scopes: ['SUFI_STUDY', 'CREATIVE_FICTION', 'QURANIC_TEXT'],
    statuses: ['DRAFT_REVIEW', 'APPROVED', 'DEPRECATED'],
    sources: [{ code: 'empire-unilex-seed', title: source.title ?? null, sourceType: source.sourceType ?? null }],
  },
  total: 73,
  offset: 0,
  limit: 12,
  terms: [
    {
      stableId: 'P004',
      lane: 'UNIVERSAL',
      kind: 'CONCEPT',
      preferredEn: 'Shadow',
      preferredId: 'Zill',
      definition: 'The shadow that follows a body and gives shelter.',
      contextNote: 'Used in cosmology and in literary description; the sense is scope-bound.',
      editorialStatus: 'DRAFT_REVIEW',
      registryVersion: '0.1.0',
      deprecated: false,
      senses: [
        {
          key: 'shadow.context',
          scope: 'SUFI_STUDY',
          definition: 'A creature held between light and darkness.',
          editorialStatus: 'DRAFT_REVIEW',
          sourceCode: 'empire-unilex-seed',
        },
      ],
      forms: [
        {
          formCode: 'P004-ar',
          languageCode: 'ar',
          scriptCode: 'Arab',
          direction: 'rtl',
          headword: ARABIC,
          transliteration: 'zill',
          normalized: 'زل',
          sourceCode: 'empire-unilex-seed',
        },
        {
          formCode: 'P004-he',
          languageCode: 'he',
          scriptCode: 'Hebr',
          direction: 'rtl',
          headword: HEBREW,
          transliteration: 'tzel',
          normalized: 'צל',
          sourceCode: 'empire-unilex-seed',
        },
        {
          formCode: 'P004-el',
          languageCode: 'el',
          scriptCode: 'Grek',
          direction: 'ltr',
          headword: GREEK,
          transliteration: 'skia',
          normalized: 'σκια',
          sourceCode: 'empire-unilex-seed',
        },
      ],
      sources: [source],
      relations: [
        {
          relationType: 'distinctFrom',
          status: 'APPROVED',
          assertedBy: 'REVIEWER',
          reviewer: 'Reviewer A',
          reason: 'CREATIVE_FICTION keeps ZILL distinct from ZIIL.',
          evidenceRef: 'review/P004:P031',
          direction: 'outgoing',
          targetStableId: 'P031',
          targetLabel: 'Zill (creative fiction)',
        },
      ],
    },
  ],
}

const detail: TermDetail = {
  state: 'ok',
  registry,
  term: {
    stableId: 'P004',
    lane: 'UNIVERSAL',
    kind: 'CONCEPT',
    preferredEn: 'Shadow',
    preferredId: 'Zill',
    definition: 'The shadow that follows a body and gives shelter.',
    contextNote: 'Used in cosmology and in literary description; the sense is scope-bound.',
    editorialStatus: 'DRAFT_REVIEW',
    registryVersion: '0.1.0',
    deprecationReason: null,
    supersededBy: null,
  },
  forms: page.terms[0].forms,
  senses: [
    {
      key: 'shadow.context',
      scope: 'SUFI_STUDY',
      definition: 'A creature held between light and darkness.',
      editorialStatus: 'DRAFT_REVIEW',
      sourceCode: 'empire-unilex-seed',
      reviewer: 'Reviewer A',
      reviewerNote: 'Kept for the Sufi reading; not merged with the literary sense.',
      current: true,
    },
    {
      key: 'shadow.legacy',
      scope: 'GENERAL',
      definition: 'Older general gloss now superseded by shadow.context.',
      editorialStatus: 'DEPRECATED',
      sourceCode: 'empire-unilex-seed',
      reviewer: 'Reviewer A',
      reviewerNote: 'Superseded because the general gloss erased the scoped reading.',
      deprecatedAt: '2026-10-26T02:00:00.000Z',
      supersededBy: 'shadow.context',
      current: false,
    },
  ],
  sources: [source],
  relations: page.terms[0].relations,
  identityReviews: [
    {
      pairCode: 'P004:P031',
      leftStableId: 'P004',
      rightStableId: 'P031',
      leftForm: 'ZILL',
      rightForm: 'ZIIL',
      classification: 'NEAR',
      similarity: 80,
      decision: 'REJECTED',
      reviewer: 'Reviewer A',
      reason: 'One edit apart on the surface, but the creative-fiction sense is a different concept.',
      evidenceRef: 'review/P004:P031',
    },
  ],
  reviewLog: [
    {
      targetType: 'TERM',
      targetRef: 'P004',
      action: 'REJECT_IDENTITY',
      reason: 'One edit apart on the surface, but the creative-fiction sense is a different concept.',
      reviewer: 'Reviewer A',
      evidenceRef: 'review/P004:P031',
      decidedAt: '2026-10-26T02:00:00.000Z',
    },
  ],
}

const deprecated: TermDetail = {
  ...detail,
  term: {
    ...detail.term,
    stableId: 'P099',
    preferredEn: 'Temporary Concept',
    editorialStatus: 'DEPRECATED',
    deprecationReason: 'Merged into P004 after review; the surface was misleading.',
    supersededBy: { stableId: 'P004', preferredEn: 'Shadow' },
  },
}

const preview: MatchPreview = {
  classification: 'DIFFERENT',
  left: {
    raw: 'الله',
    normalized: 'الله',
    script: 'Arab',
    direction: 'rtl',
    language: 'ar',
    mixedScripts: false,
    diacriticsPresent: false,
  },
  right: {
    raw: 'Allah',
    normalized: 'allah',
    script: 'Latn',
    direction: 'ltr',
    language: null,
    mixedScripts: false,
    diacriticsPresent: false,
  },
  similarity: 0.2,
  sameSurface: false,
  suggestedAction: 'KEEP_SEPARATE_REVIEW_REQUIRED',
  requiresReview: true,
  identityClaimed: false,
  autoRelation: null,
  reasons: ['Scripts differ (Arab vs Latn).', 'Transliteration is not identity.'],
  notice: 'No relation is created. A reviewer must decide with evidence before any identity is recorded.',
}

let checks = 0
function must(condition: boolean, label: string): void {
  assert.ok(condition, label)
  checks++
  console.info(`PASS ${label}`)
}

// ---- list: forms keep script, direction and diacritics ---------------------
const listHtml = renderToStaticMarkup(<TermList page={page} />)
must(listHtml.includes(ARABIC), 'Arabic headword keeps its diacritics')
must(/<span class="dk-terms-headword" lang="ar" dir="rtl">/.test(listHtml), 'Arabic form carries lang="ar" dir="rtl"')
must(/<span class="dk-terms-headword" lang="he" dir="rtl">/.test(listHtml), 'Hebrew form carries lang="he" dir="rtl"')
must(/<span class="dk-terms-headword" lang="el" dir="ltr">/.test(listHtml), 'Greek form carries lang="el" dir="ltr"')
must(listHtml.includes('Arab · ar · RTL'), 'form metadata names script, language and direction')
must(listHtml.includes('transliteration: zill'), 'transliteration is labelled, not substituted for the headword')
must(listHtml.includes('DRAFT_REVIEW'), 'draft status is visible in the list')
must(listHtml.includes('/terms/P004'), 'list links to the term detail')
must(listHtml.includes('1 source'), 'list reports its source count')
must(listHtml.includes('1 relation'), 'list reports its relation count')

// ---- match preview: comparison only, never a relation ---------------------
const previewHtml = renderToStaticMarkup(<MatchPreviewView preview={preview} />)
must(previewHtml.includes('DIFFERENT'), 'preview names the surface classification')
must(previewHtml.includes('no identity claimed'), 'preview states that no identity is claimed')
must(previewHtml.includes('No relation is created'), 'preview states that no relation is written')
must(/<span class="dk-terms-match-raw" lang="ar" dir="rtl">الله<\/span>/.test(previewHtml), 'Arabic side keeps lang/dir')
must(previewHtml.includes('normalized:'), 'preview shows the normalized surface separately')
must(previewHtml.includes('Transliteration is not identity.'), 'preview keeps the cross-script rule visible')

// ---- detail: history, reviewer reasoning, provenance ----------------------
const detailHtml = renderToStaticMarkup(<TermDetailView detail={detail} />)
must(detailHtml.includes('Forms — language, script, direction'), 'detail labels the forms section')
must(detailHtml.includes('Senses — context-scoped meanings'), 'detail labels the senses section')
must(detailHtml.includes('data-current="false"'), 'superseded sense is marked as not current')
must(detailHtml.includes('SUPERSEDED'), 'superseded sense carries an explicit badge')
must(detailHtml.includes('shadow.legacy'), 'the old sense key is still rendered')
must(detailHtml.includes('Superseded because the general gloss erased the scoped reading.'), 'reviewer note on the old sense is preserved')
must(detailHtml.includes('reviewer: Reviewer A'), 'reviewer is named for the review')
must(detailHtml.includes('distinctFrom'), 'typed relation is rendered')
must(detailHtml.includes('APPROVED'), 'approved relation status is rendered')
must(detailHtml.includes('Reviewer A'), 'relation reviewer is rendered')
must(detailHtml.includes('evidence: review/P004:P031'), 'relation evidence reference is rendered')
must(detailHtml.includes('REJECTED'), 'identity rejection is visible')
must(detailHtml.includes('One edit apart on the surface'), 'identity rejection reason is visible')
must(detailHtml.includes('Review log'), 'review log panel is present')
must(detailHtml.includes('REJECT_IDENTITY'), 'review log action is visible')
must(detailHtml.includes(source.provenanceSha ?? ''), 'detail shows the provenance SHA')
must(detailHtml.includes(source.citation ?? ''), 'detail shows the reproducible source citation')
must(detailHtml.includes('Approved for citation as a proposed seed'), 'source approval note is visible')

// ---- deprecation: successor and reason ------------------------------------
const deprecatedHtml = renderToStaticMarkup(<TermDetailView detail={deprecated} />)
must(deprecatedHtml.includes('Deprecated:'), 'deprecated term shows an alert')
must(deprecatedHtml.includes('Merged into P004 after review'), 'deprecation reason is visible')
must(deprecatedHtml.includes('successor P004 (Shadow)'), 'successor is named with its label')

// ---- registry page wiring, navigation, responsive CSS ---------------------
const termsPageSource = readFileSync(new URL('../src/app/terms/page.tsx', import.meta.url), 'utf8')
must(termsPageSource.includes('termsPage.registry.notice'), 'terms page renders the registry notice')
must(termsPageSource.includes('termsPage.registry.addenda'), 'terms page separates the XV addenda')
must(termsPageSource.includes('MatchPreviewView'), 'terms page renders the match preview')
must(termsPageSource.includes('Pagination'), 'terms page paginates the projection')

const shell = readFileSync(new URL('../src/ui/components/shell.tsx', import.meta.url), 'utf8')
must(shell.includes('href="/terms"') && shell.includes('TERMS'), 'public navigation links to the Terms Table')

const css = readFileSync(new URL('../src/app/globals.css', import.meta.url), 'utf8')
must(css.includes('@media (max-width: 900px)'), 'Terms Table defines a small-screen breakpoint')
must(/\.dk-terms-detail-grid\s*{[^}]*grid-template-columns:\s*1fr/s.test(css), 'term detail collapses to one column on mobile')
must(/\.dk-terms-link:focus-visible/.test(css), 'term links have a visible keyboard focus style')

console.info(`\nTerms UI drill: ${checks} checks passed.`)
