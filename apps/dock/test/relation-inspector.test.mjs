/**
 * UI-P06c / UI-P06d contract · the relation inspector on
 * `/constellation/relations/[relationCode]`.
 *
 * The defect these leaves name is a reader looking at one relation and seeing
 * agreement that was never recorded: `/graph/relation` projects exactly one
 * claim, so without a same-pair section the page silently implies nothing else
 * is claimed about those two entities, and nothing in the page states what the
 * hub does not know.
 *
 * The contract below is a source contract, not a rendering proof: it asserts
 * where the alternatives come from (the already-public `/graph/overview`
 * candidate rows, never a second projection owner), that uncertainty and the
 * limits of the list are stated in words, that a candidate keeps its candidate
 * wording, that competing claims are compared only by type and direction rather
 * than merged into synonyms, and that every new label is locale-bound.
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { getProvenanceCopy, provenanceCopy } from '../src/lib/provenance-copy.ts'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(testDir, '..')
const read = (...segments) => fs.readFileSync(path.resolve(appRoot, ...segments), 'utf8')

const querySource = read('src', 'data', 'queries', 'graph.ts')
const pageSource = read('src', 'app', 'constellation', 'relations', '[relationCode]', 'page.tsx')
const viewSource = read('src', 'ui', 'components', 'graph-relation.tsx')

/** The top-level declaration of one symbol, up to the closing brace on its own line. */
function declarationOf(source, signature) {
  const start = source.indexOf(signature)
  assert.notEqual(start, -1, `${signature} must exist`)
  const rest = source.slice(start)
  const end = rest.search(/\n\}(?=\n)/)
  return end === -1 ? rest : rest.slice(0, end + 2)
}

const samePairSource = declarationOf(querySource, 'export async function readSamePairRelations(')
const alternativesViewSource = declarationOf(viewSource, 'export function RelationAlternativesView(')
const samePairRowSource = declarationOf(viewSource, 'function SamePairRow(')
const detailSource = declarationOf(viewSource, 'export function RelationDetailView(')
const entityFactsSource = declarationOf(viewSource, 'function EntityFacts(')

// --- UI-P06d · the data owner stays D03's existing public projection ---------

test('UI-P06d same-pair alternatives are derived from the already-public graph overview', () => {
  // No new hub route, no new table, no second projection owner: the query layer
  // still calls exactly the two D03 endpoints it called before.
  const endpoints = [...querySource.matchAll(/\.call<\w+>\(\s*[`'"]([^`'"?]+)[^`'"]*[`'"]/g)].map((match) => match[1])
  assert.deepEqual(
    [...new Set(endpoints)].sort(),
    ['/graph/overview', '/graph/relation'],
    'the inspector may not grow a new projection endpoint or a second data owner',
  )
  assert.match(samePairSource, /await readGraphOverview\(\)/, 'the rows must come from readGraphOverview itself')
  assert.doesNotMatch(samePairSource, /serverClient\(\)/, 'the derivation must not duplicate the fetch logic')
  assert.doesNotMatch(samePairSource, /\btry\b|\bcatch\b/, 'a rejected overview read must surface, not return []')
  // The extra call is documented, not incidental.
  assert.match(querySource, /one extra read|One extra read/, 'the additional overview read must be documented')
})

test('UI-P06d the alternative rows are the overview typed rows, matched on the same pair', () => {
  // Reuses the existing typed shape rather than inventing a slimmer one.
  assert.match(querySource, /claim:\s*GraphCandidateSummary/, 'an alternative must carry the overview row unchanged')
  assert.match(
    samePairSource,
    /claim\.candidateCode !== relation\.code/,
    'the inspected relation must never be listed as its own alternative',
  )
  assert.match(
    samePairSource,
    /claim\.from === from && claim\.to === to/,
    'a claim on the identical ordered pair is an alternative',
  )
  assert.match(
    samePairSource,
    /claim\.from === to && claim\.to === from/,
    'a claim on the reversed pair is an alternative, kept visibly reversed',
  )
  assert.match(querySource, /export type SamePairOrientation = 'FORWARD' \| 'REVERSE'/)
  assert.match(samePairSource, /sameTypeAsInspected: claim\.relationType === relation\.relationType/)
  assert.match(samePairSource, /pairResolved/, 'an unresolved endpoint must be distinguishable from an empty list')
})

test('UI-P06d the projection limit of the alternative list is documented where it is derived', () => {
  assert.match(
    querySource,
    /reviewed (?:ontology )?edge[\s\S]{0,200}?not (?:enumerated|listed) here|not also a candidate row is not (?:enumerated|listed)/,
    'the fact that overview lists candidates, not every reviewed edge, must be recorded at the source',
  )
})

// --- UI-P06c · the route feeds the inspector --------------------------------

test('UI-P06c the relation route fetches the same-pair rows and hands them to the view', () => {
  assert.match(pageSource, /readSamePairRelations\(relation\)/)
  assert.match(
    pageSource,
    /<RelationAlternativesView inspected=\{relation\} samePair=\{value\} locale=\{locale\} \/>/,
    'the view must be handed the inspected relation and the rendered locale',
  )
  assert.match(pageSource, /localeFromMiddlewareHeader\(requestHeaders\.get\(DOCK_LOCALE_HEADER\)\)/)
  assert.match(pageSource, /if \(!detail\) notFound\(\)/, 'an absent relation stays a 404, not an empty panel')
})

test('UI-P06d a failed alternatives read uses the shared state wording; an empty list never hides the section', () => {
  assert.match(pageSource, /from '@\/ui\/components\/states'/, 'the panel must use the shared four-state contract')
  assert.match(pageSource, /errorMessage: copy\.errorGraphUnavailable/, 'the failure must reuse the states catalogue')
  assert.match(pageSource, /panelErrorMessage\(err, copy\.errorGraphUnavailable\)/)
  assert.doesNotMatch(pageSource, /<Alert\b/, 'the route must not hand-roll an error alert')
  // readPanel is called with a never-empty predicate, so `ready` still renders.
  assert.match(
    pageSource,
    /readPanel<SamePairRelations>\(\s*\(\) => readSamePairRelations\(relation\),\s*alternativesCopy,\s*\(\) => false,/,
    'an empty alternative list is an answer the section states, not an empty panel that replaces it',
  )
})

// --- UI-P06c · the inspector itself ----------------------------------------

test('UI-P06c the detail view names the typed relation, its direction and its asserter', () => {
  assert.match(viewSource, /const copy = getProvenanceCopy\(locale\)/)
  assert.match(viewSource, /\{copy\.fieldRelationType\}/)
  assert.match(viewSource, /\{copy\.fieldDirection\}/)
  assert.match(viewSource, /\{copy\.fieldEndpointKinds\}/, 'the typed endpoint kinds belong in the inspector')
  assert.match(
    viewSource,
    /\{relation\.fromEntity\?\.kind \?\? copy\.unrecorded\} → \{relation\.toEntity\?\.kind \?\? copy\.unrecorded\}/,
    'an endpoint outside the projection is UNRECORDED, never guessed as a type',
  )
  assert.match(viewSource, /<code>\{relation\.from\}<\/code> → <code>\{relation\.to\}<\/code>/)
  assert.match(viewSource, /\{copy\.directionAsRecorded\}/, 'direction must be labeled as recorded, not as proven')
  assert.match(viewSource, /\{copy\.fieldAssertedBy\}/)
  assert.match(viewSource, /\{relation\.assertedBy \?\? copy\.unrecorded\}/, 'a missing asserter is UNRECORDED, not blank')
  assert.doesNotMatch(viewSource, /symmetric|undirected/i, 'the projection carries no symmetry attribute to state')
})

test('UI-P06d uncertainty is stated item by item, and an unflagged claim is still not called certain', () => {
  assert.match(viewSource, /<section className="dk-graph-detail-review" data-section="uncertainty"/)
  assert.match(viewSource, /\{copy\.uncertaintyHeading\}/)
  assert.match(viewSource, /const uncertainty: Array<\{ text: string; code: string \| null \}> = \[\]/)
  for (const key of [
    'uncertaintyUnresolved',
    'uncertaintyNoReviewer',
    'uncertaintyNoExactSha',
    'uncertaintyNotReleased',
    'uncertaintyNoSource',
    'uncertaintyEntityUnresolved',
    'uncertaintyNothingFlagged',
  ]) {
    assert.match(viewSource, new RegExp(`copy\\.${key}`), `the inspector must name ${key}`)
  }
  // Each item is derived from a projected field only: no inferred confidence.
  assert.match(viewSource, /if \(relation\.unknown\) \{\s*uncertainty\.push/)
  assert.match(viewSource, /if \(relation\.reviewer === null\)/)
  assert.match(viewSource, /if \(!relation\.evidence\.exactSha\)/)
  assert.match(viewSource, /if \(!relation\.inActiveRelease\)/)
  assert.match(viewSource, /if \(relation\.source === null\)/)
  assert.doesNotMatch(viewSource, /confidence/i, 'no confidence value exists in this projection to display')
  // The fallback says what it is: a statement about the data, never a verdict.
  assert.match(viewSource, /if \(uncertainty\.length === 0\) uncertainty\.push/)
  assert.match(
    provenanceCopy.en.uncertaintyNothingFlagged,
    /not a proof that the claim holds/i,
    'nothing-flagged must not read as settled',
  )
})

test('UI-P06d the alternatives section renders, and says so in words when the pair has none', () => {
  assert.match(viewSource, /export function RelationAlternativesView\(/)
  assert.match(alternativesViewSource, /\{copy\.alternativesHeading\}/)
  assert.match(alternativesViewSource, /samePair\.alternatives\.map\(\(alternative\) =>/)
  assert.match(alternativesViewSource, /\{samePair\.alternatives\.length === 0 \? \(/)
  assert.match(alternativesViewSource, /\{copy\.alternativesEmptyTitle\}/, 'no alternatives must be said out loud')
  assert.match(alternativesViewSource, /\{copy\.alternativesLimitHint\}/, 'the limit of the list is part of the answer')
  assert.match(alternativesViewSource, /\{copy\.alternativesPairUnresolved\}/)
  assert.match(alternativesViewSource, /data-pair-resolved=\{samePair\.pairResolved \? 'true' : 'false'\}/)
  assert.match(alternativesViewSource, /<SamePairRow alternative=\{alternative\} key=\{alternative\.claim\.candidateCode\} locale=\{locale\} \/>/)
})

test('UI-P06d every alternative keeps its own type, status, reviewer and provenance', () => {
  assert.match(samePairRowSource, /<code>\{claim\.candidateCode\}<\/code>/)
  assert.match(samePairRowSource, /<Badge tone=\{toneFor\(claim\.status\)\}>\{claim\.status\}<\/Badge>/)
  assert.match(samePairRowSource, /<Badge tone=\{toneFor\(claim\.epistemicStatus\)\}>\{claim\.epistemicStatus\}<\/Badge>/)
  assert.match(samePairRowSource, /<dd>\{claim\.statusLabel\}<\/dd>|<span className="dk-graph-meta">\{claim\.statusLabel\}/)
  assert.match(samePairRowSource, /<dt>\{copy\.fieldRelationType\}<\/dt>/)
  assert.match(samePairRowSource, /<dt>\{copy\.fieldDirection\}<\/dt>/)
  assert.match(samePairRowSource, /<dt>\{copy\.fieldReviewer\}<\/dt>/)
  assert.match(samePairRowSource, /\{claim\.reviewer \?\? copy\.unrecorded\}/)
  assert.match(
    samePairRowSource,
    /<SourceEvidence source=\{claim\.source\} locale=\{locale\} classPrefix="dk-graph" \/>/,
    'an alternative must carry its own source evidence, through the single shared block',
  )
  assert.doesNotMatch(samePairRowSource, /source\.provenanceSha|function SourceLine\b|function SourceBlock\b/)
})

test('UI-P06d a candidate that is not released is never worded as accepted', () => {
  // The row keeps the hub status verbatim in a badge and the release membership
  // in a data attribute, and adds no local verdict of its own.
  assert.match(samePairRowSource, /data-status=\{claim\.status\}/)
  assert.match(samePairRowSource, /data-in-release=\{claim\.inActiveRelease \? 'true' : 'false'\}/)
  assert.match(
    samePairRowSource,
    /\{claim\.inActiveRelease \? copy\.badgeReleaseMember : copy\.badgeNotInRelease\}/,
    'release membership may only be claimed from the projected flag, in the rendered locale',
  )
  assert.doesNotMatch(samePairRowSource, /\b(?:ACCEPTED|CONFIRMED|SETTLED|AUTHORITATIVE)\b/)
  assert.match(alternativesViewSource, /\{copy\.alternativesCandidateNote\}/)
  assert.match(
    provenanceCopy.en.alternativesCandidateNote,
    /stays a claim under review/i,
    'the note must say a pending row is still under review',
  )
  assert.doesNotMatch(
    `${alternativesViewSource}${samePairRowSource}`,
    /(?:is|was|has been|been) approved/i,
    'nothing beside the projected status may assert approval',
  )
})

test('UI-P06d alternatives are compared by type and direction, never merged as synonyms', () => {
  assert.match(samePairRowSource, /sameTypeAsInspected \? copy\.alternativesTypeSame : copy\.alternativesTypeDifferent/)
  assert.match(samePairRowSource, /orientation === 'FORWARD' \? copy\.alternativesOrientationForward : copy\.alternativesOrientationReverse/)
  assert.match(alternativesViewSource, /\{copy\.uncertaintyNoMerge\}/, 'the no-merge statement must be rendered')
  assert.match(provenanceCopy.en.uncertaintyNoMerge, /no symmetry, synonymity or confidence/)
  assert.match(provenanceCopy.en.alternativesIntro, /none is presented as a synonym/i)
  for (const block of [alternativesViewSource, samePairRowSource]) {
    assert.doesNotMatch(block, /\b(?:identical to|equivalent to|the same claim|means the same|interchangeable)\b/i)
    assert.doesNotMatch(block, /sameAs/, 'the inspector may not introduce an identity claim')
  }
})

test('UI-P06c every inspector link is locale-bound and no view decides a locale for an alternative', () => {
  assert.match(samePairRowSource, /const localeHref = dockHrefFor\(locale\)/)
  assert.match(
    samePairRowSource,
    /href=\{localeHref\(`\/constellation\/relations\/\$\{claim\.candidateCode\}`\)\}/,
    'an alternative link must carry the rendered locale',
  )
  // `locale` is a required prop here: an omitted call site cannot fall back to English.
  assert.doesNotMatch(samePairRowSource, /locale\s*=\s*'en'/)
  assert.doesNotMatch(alternativesViewSource, /locale\s*=\s*'en'/)
  assert.match(viewSource, /import \{ dockHrefFor \} from '@\/lib\/locale-context\.mjs'/)
})

test('UI-P06c the detail half names every rendered row from the catalogue, in the rendered locale', () => {
  // The leaves only close when the page a public reader sees is usable in
  // Indonesian too, so the detail half is asserted row by row, not "mostly".
  for (const row of [
    'fieldStatus',
    'fieldEpistemic',
    'fieldRelease',
    'fieldFrame',
    'fieldEvidenceSha',
    'fieldExactSha',
    'fieldEvidencePresent',
    'fieldEvidenceRef',
    'fieldClaimReason',
    'fieldDecisionNote',
    'fieldDecidedAt',
    'fieldSameAsPolicy',
  ]) {
    assert.match(
      detailSource,
      new RegExp(`<dt>\\{copy\\.${row}\\}</dt>`),
      `the <dt> for ${row} must be catalogue-bound`,
    )
    assert.notEqual(provenanceCopy.id[row], provenanceCopy.en[row], `${row} must be translated, not copied`)
  }
  for (const heading of ['evidenceHeading', 'reviewTrailHeading', 'policyHeading', 'uncertaintyHeading']) {
    assert.match(detailSource, new RegExp(`\\{copy\\.${heading}\\}`), `${heading} must render from the catalogue`)
  }
  // A badge is still locale copy: the status code stays raw, the sentence does not.
  assert.match(detailSource, /\{relation\.verified \? <Badge tone="ok">\{copy\.badgeVerified\}<\/Badge>/)
  assert.match(
    detailSource,
    /\{relation\.inActiveRelease \? copy\.badgeInRelease : copy\.badgeNotInRelease\}/,
    'release membership is stated from the projected flag only, never from a local English literal',
  )
  assert.match(detailSource, /\{isCandidate \? copy\.noticeCandidate : copy\.noticeRelation\}/)
  assert.match(detailSource, /\{isCandidate \? copy\.evidenceNoSpanCandidate : copy\.evidenceNoSpanRelation\}/)
  assert.match(detailSource, /\{relation\.evidence\.exactSha \? copy\.exactShaYes : copy\.exactShaNo\}/)
  assert.match(
    detailSource,
    /<code>\{relation\.epistemicStatus\}<\/code> \{copy\.unknownStaysUnresolvedSuffix\}/,
    'the unresolved-status notice keeps the raw code and translates the sentence around it',
  )
  // A helper that builds a sentence cannot be locale-blind.
  assert.match(viewSource, /function releaseLine\(detail: RelationDetail, copy: ProvenanceCopy\)/)
  assert.match(viewSource, /const kindLabel = \(relation: GraphRelation, copy: ProvenanceCopy\)/)
  assert.match(entityFactsSource, /\{copy\.entityLabel\} <code>\{stableId\}<\/code> \{copy\.entityNotProjected\}/)
  assert.match(
    detailSource,
    /<EntityFacts role=\{copy\.roleFrom\}[\s\S]*<EntityFacts role=\{copy\.roleTo\}/,
    'endpoint roles come from the catalogue, so a pair is not labelled in English on an Indonesian page',
  )

  // What used to be hardcoded is gone, not merely duplicated.
  for (const literal of [
    "'RELEASE MEMBER'",
    "'IN ACTIVE RELEASE'",
    "'NOT IN RELEASE'",
    'VERIFIED BY REVIEWER',
    '<dt>Status</dt>',
    '<dt>Epistemic</dt>',
    '<dt>Evidence SHA-256</dt>',
    '<dt>Frame</dt>',
    'Review trail',
    'Release and evidence policy',
    'is not part of the ontology projection',
    'No graph release is active',
  ]) {
    assert.ok(!viewSource.includes(literal), `${literal} must not survive as a component-side string`)
  }
})

test('UI-P06c the inspector names every row from the shared catalogue in both locales', () => {
  const named = new Set(
    [...viewSource.matchAll(/\bcopy\.([A-Za-z0-9_]+)/g)].map((match) => match[1]),
  )
  assert.ok(named.size >= 20, `the inspector must name its rows from the catalogue, saw ${named.size}`)
  for (const key of named) {
    assert.ok(key in provenanceCopy.en, `en.${key} must exist or the renderer falls back to nothing`)
    assert.ok(key in provenanceCopy.id, `id.${key} must exist — the catalogue throws on a locale mismatch`)
    assert.ok(provenanceCopy.en[key].length > 0, `${key} must carry English copy`)
    assert.notEqual(provenanceCopy.id[key], provenanceCopy.en[key], `${key} must be translated, not copied`)
  }
  assert.deepEqual(Object.keys(provenanceCopy.en).sort(), Object.keys(provenanceCopy.id).sort())
  assert.equal(getProvenanceCopy('id').alternativesHeading, 'Alternatif pasangan sama')
})

test('UI-P06c the inspector adds no private state vocabulary and no new stylesheet hooks', () => {
  const css = read('src', 'app', 'globals.css')
  const used = new Set([...viewSource.matchAll(/dk-graph-[a-z0-9-]+/g)].map((match) => match[0]))
  for (const hook of used) assert.match(css, new RegExp(`\\.${hook}[\\s,{:\\]]`), `${hook} must already exist`)
  for (const forbidden of ['SourceLine', 'SourceBlock', 'RIGHTS_LABEL', 'REVIEW_LABEL', 'UNKNOWN_TYPE']) {
    assert.doesNotMatch(viewSource, new RegExp(forbidden), `${forbidden} would split the provenance vocabulary`)
  }
  assert.doesNotMatch(viewSource, /#[0-9a-f]{3,6}\b/i, 'the inspector must not name a color')
})
