import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  censusPatches,
  filterPatches,
  isNumberedSlot,
  patchAnchor,
  statusMeaning,
} from '../src/data/queries/patches.ts'
import { patchesCopy } from '../src/ui/copy/patches-copy.ts'

/**
 * UI-II P16a–P16e · the World Patches explorer.
 *
 * The screen's contract is that every number, code and title it shows is a
 * property of the rows the hub returned. Dock tests run under
 * `node --experimental-strip-types`, which resolves neither the `@/` alias nor
 * JSX, so the derivations are exercised directly against hand-built rows and the
 * rendered wiring is pinned from the source text of the two route files.
 */

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = path.resolve(appRoot, '..', '..')
const read = (...segments) => fs.readFileSync(path.resolve(repoRoot, ...segments), 'utf8')

const explorerPath = ['apps', 'dock', 'src', 'ui', 'client', 'PatchesExplorer.tsx']
const pagePath = ['apps', 'dock', 'src', 'app', 'patches', 'page.tsx']
const journeyQueryPath = ['apps', 'dock', 'src', 'data', 'queries', 'journey.ts']
const explorer = read(...explorerPath)
const page = read(...pagePath)
const journeyQuery = read(...journeyQueryPath)

const HUB_STATUSES = [
  'REPORTED_IN_CHAT',
  'RECOVERED_DRAFT',
  'UNRESOLVED_NUMBERING_CONFLICT',
  'EDITORIAL_PROPOSAL',
  'USER_SUBMITTED_IN_CHAT',
  'UNNUMBERED_HISTORICAL',
]

const patch = (overrides) => ({
  id: 'p-1',
  slot: '001',
  title: 'AEGIS PROTECTION',
  disputedTitle: null,
  status: 'REPORTED_IN_CHAT',
  thematicFocus: 'PROTECTION',
  scope: 'GLOBAL',
  description: 'Baseline defensive shielding.',
  historicalNotes: 'Reported in chat.',
  active: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  ...overrides,
})

const registry = (patches) => ({
  patches,
  counts: {
    total: patches.length,
    canonical: patches.filter((p) => p.status === 'REPORTED_IN_CHAT' || p.status === 'RECOVERED_DRAFT').length,
    disputed: patches.filter((p) => p.status === 'UNRESOLVED_NUMBERING_CONFLICT').length,
    historical: patches.filter((p) => p.status === 'UNNUMBERED_HISTORICAL').length,
  },
})

// --- 1 · the census counts rows, it never recites a catalogue size --------------

test('UI2-P16a an empty projection censuses as zeros instead of repeating a hardcoded 33', () => {
  const census = censusPatches(registry([]))
  assert.equal(census.records, 0, 'a screen that printed 33 with no rows would state a count it never read')
  assert.equal(census.numberedSlots, 0)
  assert.equal(census.canonical, 0)
  assert.equal(census.conflicts, 0)
  assert.equal(census.slotSpan, null, 'no rows means no slot span to claim')
  assert.deepEqual(census.missingSlots, [], 'a gap is only a gap once a span exists')
  assert.deepEqual(census.statuses, [])
  assert.deepEqual(census.categories, [])
  assert.deepEqual(census.disputed, [])
})

test('UI2-P16a the census splits numbered from unnumbered and tallies the codes it was given', () => {
  const census = censusPatches(
    registry(
      [
        patch({ id: 'p-1', slot: '001', status: 'REPORTED_IN_CHAT', thematicFocus: 'PROTECTION' }),
        patch({ id: 'p-2', slot: '014', status: 'UNRESOLVED_NUMBERING_CONFLICT', thematicFocus: 'ETHICS' }),
        patch({ id: 'p-3', slot: 'UNNUMBERED-01', status: 'UNNUMBERED_HISTORICAL', thematicFocus: 'COMMUNITY' }),
      ],
    ),
  )

  assert.equal(census.records, 3)
  assert.equal(census.numberedSlots, 2, 'a slot code that is not three digits is not counted as canonical')
  assert.deepEqual(census.unnumberedSlots, ['UNNUMBERED-01'])
  assert.deepEqual(census.slotSpan, { first: '001', last: '014' })
  assert.ok(!isNumberedSlot('UNNUMBERED-01'))
  assert.deepEqual(census.statuses, [
    { code: 'REPORTED_IN_CHAT', count: 1 },
    { code: 'UNNUMBERED_HISTORICAL', count: 1 },
    { code: 'UNRESOLVED_NUMBERING_CONFLICT', count: 1 },
  ])
  assert.equal(census.conflicts, 1)
})

test('UI2-P16a a slot missing inside the observed span is reported, never filled with a phantom row', () => {
  const rows = [
    patch({ id: 'p-1', slot: '001' }),
    patch({ id: 'p-3', slot: '003' }),
  ]
  const census = censusPatches(registry(rows))

  assert.deepEqual(census.missingSlots, ['002'], 'the span 001–003 has a real hole and the census must name it')
  assert.equal(census.records, 2, 'reporting the gap may not manufacture a record for it')
  assert.equal(filterPatches(rows, { focus: 'ALL', query: '002' }).length, 0, 'the absent slot matches nothing because it is absent')
})

test('UI2-P16a the dual-title record is censused by both titles and its own source note', () => {
  const census = censusPatches(
    registry(
      [patch({ id: 'p-14', slot: '014', title: 'FAMILY WITHOUT FEAR', disputedTitle: 'THE WRONG WAY / HELLROAD', status: 'UNRESOLVED_NUMBERING_CONFLICT', historicalNotes: 'Never silently reassign.' })],
    ),
  )

  assert.equal(census.disputed.length, 1)
  assert.deepEqual(census.disputed[0], {
    recordId: 'p-14',
    slot: '014',
    title: 'FAMILY WITHOUT FEAR',
    disputedTitle: 'THE WRONG WAY / HELLROAD',
    status: 'UNRESOLVED_NUMBERING_CONFLICT',
    historicalNotes: 'Never silently reassign.',
  })
})

test('UI2-P16a records without a disputed title stay out of the dispute list', () => {
  const census = censusPatches(registry([patch({ disputedTitle: '' }), patch({ id: 'p-2', disputedTitle: null })]))
  assert.deepEqual(census.disputed, [], 'an empty second title is not a claim of dispute')
})

// --- 2 · the filter answers with rows or with nothing ---------------------------

test('UI2-P16b a category the projection does not carry filters to zero rows', () => {
  const rows = [patch({ thematicFocus: 'PROTECTION' }), patch({ id: 'p-2', slot: '002', thematicFocus: 'ETHICS' })]
  assert.deepEqual(filterPatches(rows, { focus: 'JUSTICE', query: '' }), [], 'JUSTICE exists in the enum but not in these rows')
  assert.deepEqual(filterPatches(rows, { focus: 'PROTECTION', query: '' }).map((p) => p.id), ['p-1'])
  assert.equal(filterPatches(rows, { focus: 'ALL', query: '' }).length, 2, 'ALL is the absence of a filter, not a category')
})

test('UI2-P16b an unknown slot or keyword query yields nothing rather than a near miss', () => {
  const rows = [patch({ slot: '014', title: 'FAMILY WITHOUT FEAR', disputedTitle: 'THE WRONG WAY / HELLROAD' })]
  assert.deepEqual(filterPatches(rows, { focus: 'ALL', query: '099' }), [], 'a slot the projection never returned stays unreturned')
  assert.deepEqual(filterPatches(rows, { focus: 'ALL', query: '   ' }), rows.map((p) => p.id).length === 1 ? rows : [], 'whitespace is no filter')
})

test('UI2-P16b a query that only the disputed title satisfies still finds the record', () => {
  const rows = [
    patch({ id: 'p-14', slot: '014', title: 'FAMILY WITHOUT FEAR', disputedTitle: 'THE WRONG WAY / HELLROAD' }),
    patch({ id: 'p-1', slot: '001', title: 'AEGIS PROTECTION' }),
  ]
  const hits = filterPatches(rows, { focus: 'ALL', query: 'hellroad' })

  assert.deepEqual(hits.map((p) => p.id), ['p-14'], 'dropping the disputed title from the search would hide a recorded identity')
})

test('UI2-P16b the search spans the description as well as the titles', () => {
  const rows = [patch({ id: 'p-1', description: 'Radical politeness in the face of hostility.' }), patch({ id: 'p-2', description: null })]
  assert.deepEqual(filterPatches(rows, { focus: 'ALL', query: 'politeness' }).map((p) => p.id), ['p-1'])
  assert.deepEqual(filterPatches(rows, { focus: 'ALL', query: 'null' }), [], 'a missing description is not searchable text')
})

// --- 4 · status codes stay verbatim and get words -------------------------------

test('UI2-P16c every hub status code gets its own sentence, and an unknown one says so', () => {
  const said = HUB_STATUSES.map((code) => statusMeaning(code, patchesCopy.en))
  assert.equal(new Set(said).size, HUB_STATUSES.length, 'two codes sharing one sentence would erase a real distinction')
  assert.equal(statusMeaning('SOMETHING_NEW', patchesCopy.en), patchesCopy.en.statusUnknown)
  assert.equal(statusMeaning('SOMETHING_NEW', patchesCopy.id), patchesCopy.id.statusUnknown)
  assert.notEqual(statusMeaning('SOMETHING_NEW', patchesCopy.en), statusMeaning('EDITORIAL_PROPOSAL', patchesCopy.en))

  const idSaid = HUB_STATUSES.map((code) => statusMeaning(code, patchesCopy.id))
  assert.equal(new Set(idSaid).size, HUB_STATUSES.length, 'the Indonesian catalogue must not collapse the codes either')
})

test('UI2-P16c the badge prints the recorded code verbatim and the meaning sits beside it', () => {
  assert.ok(
    explorer.includes('<Badge tone={statusTone(patch.status)}>{patch.status}</Badge>'),
    'normalizing the enum away (replace(/_/g, " ")) would make UNRESOLVED_NUMBERING_CONFLICT look like a cosmetic label',
  )
  assert.ok(explorer.includes('{statusMeaning(patch.status, copy)}'), 'the code alone is not words for a reader')
  assert.ok(!explorer.includes("status.replace(/_/g, ' ')"), 'the old normalization must not survive')
  assert.ok(!explorer.includes("'DISPUTED'"), 'UNRESOLVED_NUMBERING_CONFLICT may not be relabeled DISPUTED')
})

// --- 5 · the catalogue is id/en complete and the route only reads real keys -----

test('UI2-P16e the patches catalogue carries the same keys in both locales', () => {
  const enKeys = Object.keys(patchesCopy.en).sort()
  const idKeys = Object.keys(patchesCopy.id).sort()
  assert.deepEqual(idKeys, enKeys, 'a missing Indonesian key renders English on the /id route')
  assert.ok(enKeys.length > 60, 'the explorer has no inline fallback, so the catalogue must cover the whole screen')

  for (const key of enKeys) {
    assert.ok(String(patchesCopy.en[key]).trim().length > 0, `${key} is empty in English`)
    assert.ok(String(patchesCopy.id[key]).trim().length > 0, `${key} is empty in Indonesian`)
  }
})

test('UI2-P16e every catalogue key the route reads exists in both locales', () => {
  for (const [label, source, minimumKeys] of [
    ['PatchesExplorer.tsx', explorer, 30],
    ['patches/page.tsx', page, 6],
  ]) {
    const used = [...new Set((source.match(/copy\.([A-Za-z0-9]+)/g) ?? []).map((hit) => hit.split('.')[1]))]
    assert.ok(used.length >= minimumKeys, `${label} must draw its wording from the catalogue, found only ${used.length} keys`)
    for (const key of used) {
      assert.ok(
        key in patchesCopy.en && key in patchesCopy.id,
        `${label} reads patchesCopy.${key}, which must exist in English and Indonesian`,
      )
    }
  }
})

test('UI2-P16e the English catalogue holds no Indonesian text', () => {
  for (const key of Object.keys(patchesCopy.en)) {
    const value = String(patchesCopy.en[key])
    assert.ok(!/\bPelaksana\b|\bdiperdebatkan\b|\bBeranda\b/.test(value), `${key} carries Indonesian inside the English locale`)
  }
})

// --- 6 · no hardcoded claim survives --------------------------------------------

test('UI2-P16a the invented counts and English-only chrome are gone from the rendered route', () => {
  const forbidden = [
    '33 Canonical Patches',
    'CANONICAL SLOTS 001',
    'HISTORICAL SOURCES',
    'No description recorded.',
    'READ LORE',
    'Disputed Archive Title:',
    'Explore World Patches"',
    'All Patches',
    'CLEAR SEARCH',
    'ACTIVE MANDATES',
    'SHOWING ',
  ]

  assert.ok(!explorer.includes('33 Canonical Patches'), 'the explorer renders no page shell, so nothing there may recite 33')
  const renderedPage = page.slice(page.indexOf('export default async function PatchesPage'))
  for (const phrase of forbidden) {
    assert.ok(!explorer.includes(phrase), `PatchesExplorer.tsx still renders ${phrase}`)
    assert.ok(!renderedPage.includes(phrase), `patches/page.tsx still renders ${phrase}`)
  }
})

test('UI2-P16a the header badges and the subtitle are derived, not typed', () => {
  assert.ok(page.includes('censusPatches(registry)'), 'the page header counts must come from the same census the panel shows')
  assert.ok(page.includes('{census.records} {copy.badgePatches}'), 'a badge is a derived count plus a catalogue noun')
  assert.ok(page.includes('{census.canonical} {copy.badgeCanonical}'))
  assert.ok(!page.includes('{registry.counts.total} patches'), 'English-only badge text would leave /id untranslated')
  assert.ok(page.includes('title={copy.pageTitle}'), 'the page heading is catalogue-bound')
  assert.ok(page.includes('subtitle={copy.pageSubtitle}'))
})

// --- 7 · the zero-results state --------------------------------------------------

test('UI2-P16e a filter that removes every record says so instead of showing a blank grid', () => {
  assert.ok(explorer.includes('shown.length === 0'), 'the explorer branches on the filtered list, not on the registry size')
  assert.ok(explorer.includes('<EmptyState title={copy.zeroTitle} hint={copy.zeroHint} />'), 'the zero state names itself')
  assert.match(patchesCopy.en.zeroHint, /removed every projected record/)
  assert.match(patchesCopy.id.zeroHint, /menghilangkan setiap catatan/)
  assert.ok(!explorer.includes('{shown.length === 0 ? null :'), 'the grid is not rendered alongside a zero state')

  const rows = [patch({ thematicFocus: 'PROTECTION' })]
  assert.deepEqual(filterPatches(rows, { focus: 'ETHICS', query: 'zzz' }), [], 'the filter really can produce the zero state')
})

// --- 8 · the screen stays read-only ----------------------------------------------

test('UI2-P16b nothing on this screen writes to the hub', () => {
  for (const source of [explorer, page]) {
    for (const forbidden of ['<form', 'method="post"', 'method={"post"}', 'action=', 'fetch(', 'POST']) {
      assert.ok(!source.includes(forbidden), `the patches explorer is a reader; found ${forbidden}`)
    }
  }
  assert.ok(!explorer.includes('serverClient'), 'the explorer takes its rows from the page read and fetches nothing itself')
})

test('M19-04 Dock does not read or render raw Journey mandate rows before a released public projection exists', () => {
  assert.doesNotMatch(journeyQuery, /journey_mandates|activeMandates/, 'the public server-side query stays on the reviewed patches view')
  assert.doesNotMatch(explorer, /operatorPseudonym|deliverableDesc|expiresAt|mandatesByPatchId/, 'the public explorer carries no raw mandate fields')
  assert.doesNotMatch(page, /journey_mandates|activeMandates|census\.mandates|registry\.mandates/, 'the route exposes no raw mandate query or count')
})

// --- 9 · anchors, keyboard path, mobile ------------------------------------------

test('UI2-P16d a slot is anchored by a sanitized id and the card carries a permalink to it', () => {
  assert.equal(patchAnchor('014'), 'patch-014')
  assert.equal(patchAnchor('UNNUMBERED-01'), 'patch-UNNUMBERED-01')
  assert.equal(patchAnchor('01/4 <x>'), 'patch-014x', 'a character that is not safe for a fragment is dropped, not encoded into a second key')
  assert.equal(patchAnchor(''), 'patch-')

  assert.ok(explorer.includes('const anchor = patchAnchor(patch.slot)'), 'the card id comes from the shared helper')
  assert.ok(explorer.includes('<Card id={anchor} variant="paper">'), 'the record itself is the anchor target')
  assert.ok(explorer.includes('href={`#${anchor}`}'), 'a real link reaches the anchor, so Tab and Enter work without script')
  assert.ok(explorer.includes('aria-label={`${copy.anchorAria} ${patch.slot}`}'), 'the link names its destination instead of a bare Permalink')
})

test('UI2-P16d the category filter is a keyboard group with a pressed state, not a painted pill', () => {
  assert.ok(explorer.includes('role="group"') && explorer.includes('aria-label={copy.categoryGroupAria}'), 'the chips are announced as one group')
  assert.ok(explorer.includes('aria-pressed={selectedFocus === chip.code}'), 'Pill renders a button but exposes selection only as data-active, so the group carries aria-pressed')
  assert.ok(!explorer.includes('<Pill'), 'the unlabelled Pill primitive cannot announce which category is chosen')
  assert.ok(explorer.includes('aria-expanded={expanded}'), 'the record disclosure announces its own state')
  assert.ok(explorer.includes('aria-controls={bodyId}'), 'and points at the region it opens')
  assert.ok(explorer.includes('<div id={bodyId} hidden={!expanded}'), 'the controlled region exists before activation and is hidden while collapsed')
})

test('UI2-P16d the chip set is derived from the focuses the projection carries', () => {
  assert.ok(explorer.includes('census.categories.map'), 'a focus with no record must not be offered as a filter')
  assert.ok(explorer.includes('focusWords(entry.code, copy)'), 'the chip label is the localized word, not the enum')
  const rows = [patch({ thematicFocus: 'PROTECTION' }), patch({ id: 'p-2', slot: '002', thematicFocus: 'JUSTICE' })]
  const census = censusPatches(registry(rows))
  assert.deepEqual(census.categories.map((c) => c.code), ['JUSTICE', 'PROTECTION'])
})

test('UI2-P16d the card grid cannot overflow a 390px viewport and long text wraps', () => {
  assert.ok(explorer.includes('minmax(min(100%, 320px), 1fr)'), 'a bare 320px minimum is wider than a 390px viewport once padding is counted')
  assert.ok(!explorer.includes('minmax(320px, 1fr)'), 'the old inline minimum stays forbidden')
  assert.ok(explorer.includes("overflowWrap: 'anywhere'"), 'a long title or citation wraps inside the card')
  assert.ok(explorer.includes('flexWrap: \'wrap\''), 'the header rows stack instead of pushing content off-screen')
})

// --- 10 · the notices the leaf requires are on screen ----------------------------

test('UI2-P16b no interactive world map is fabricated and the read-only contract is stated', () => {
  assert.ok(explorer.includes('{copy.noMapNotice}'), 'the projection carries no coordinates, so the screen must say it draws no map')
  assert.ok(explorer.includes('{copy.readOnlyNotice}'), 'the Dock cannot add, renumber, retire or merge a patch here')
  assert.ok(explorer.includes('{copy.sourceOwnerHeading}') && explorer.includes('{copy.sourceOwnerBody}'), 'the owning source of these rows is pinned')
  for (const forbidden of ['<svg', '<iframe', 'leaflet', 'MapContainer', 'latitude', 'longitude']) {
    assert.ok(!explorer.toLowerCase().includes(forbidden), `a world map would be invented content; found ${forbidden}`)
  }
})

test('UI2-P16c the dispute alert renders both titles and the source note the row carries', () => {
  const disputed = [
    patch({ id: 'p-14', slot: '014', title: 'FAMILY WITHOUT FEAR', disputedTitle: 'THE WRONG WAY / HELLROAD', status: 'UNRESOLVED_NUMBERING_CONFLICT' }),
    patch({ id: 'p-1', slot: '001' }),
  ]
  const census = censusPatches(registry(disputed))
  assert.equal(census.disputed.length, 1, 'only the row with a second title is a dispute')

  for (const key of ['disputeHeading', 'disputeBody', 'disputeCanonical', 'disputeDisputed', 'disputeStatus', 'disputeSourceNote', 'disputeSourceMissing']) {
    assert.ok(explorer.includes(`copy.${key}`), `${key} must be rendered, not merely defined`)
  }
  assert.ok(explorer.includes('{pair.title}') && explorer.includes('{pair.disputedTitle}'), 'both titles appear side by side')
  assert.ok(explorer.includes('{pair.historicalNotes ?'), 'the source sentence is the record own note or an explicit absence')
})

test('UI2-P16b the census panel states the span and the hole in it', () => {
  for (const key of ['censusTitle', 'censusSubtitle', 'censusSlotRange', 'censusThrough', 'censusSlotAbsent', 'censusMissing', 'censusNoMissing', 'censusNoNumbered']) {
    assert.ok(explorer.includes(`copy.${key}`), `${key} must be rendered by the census panel`)
  }
  assert.ok(explorer.includes('census.missingSlots.join'), 'the absent slot codes are listed, never backfilled')
  assert.ok(explorer.includes('census.slotSpan'), 'the span is read off the rows, so it changes with the projection')
})
