/**
 * UI-F10 contract: a data-backed Dock panel speaks the four states through the
 * shared API in `src/ui/components/states.tsx`, and every sentence it can show
 * for the empty and error states comes from the states catalogue in both locales.
 *
 * The ad-hoc shape this replaces was a local `let value: T | null = null` plus a
 * `let error: string | null = null` feeding a bare `<Alert tone="hot">`, which
 * made "the hub is down" and "there is nothing here" look like the same page and
 * left loading and empty implicit.
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { statesCopy } from '../src/lib/states-copy.ts'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(testDir, '..')
const read = (...segments) => fs.readFileSync(path.resolve(appRoot, ...segments), 'utf8')

/**
 * Every route that reads from the hub, with the catalogue keys its panel is
 * allowed to show. `panelSymbols` names the pieces of the shared API it uses.
 */
const DATA_BACKED = [
  {
    name: 'constellation',
    file: 'src/app/constellation/page.tsx',
    panelSymbols: ['OutcomePanel', 'readPanel', 'PanelCopy'],
    emptyKeys: ['emptyGraph', 'emptyGraphHint', 'emptyGraphRelease'],
    errorKeys: ['errorConstellationUnavailable', 'errorGraphUnavailable'],
  },
  {
    name: 'patches',
    file: 'src/app/patches/page.tsx',
    panelSymbols: ['OutcomePanel', 'readPanel', 'PanelCopy'],
    emptyKeys: ['emptyPatches'],
    errorKeys: ['errorPatchesUnavailable'],
  },
  {
    name: 'stations',
    file: 'src/app/stations/page.tsx',
    panelSymbols: ['OutcomePanel', 'readPanel', 'PanelCopy'],
    emptyKeys: ['emptyNoStations'],
    errorKeys: ['errorStationsUnavailable'],
  },
  {
    name: 'schedule',
    file: 'src/app/schedule/page.tsx',
    panelSymbols: ['OutcomePanel', 'readPanel', 'PanelCopy'],
    emptyKeys: ['emptyNowPlaying', 'emptyScheduleSlots', 'emptyScheduleSlotsHint'],
    errorKeys: ['errorScheduleUnavailable'],
  },
  {
    name: 'denpa',
    file: 'src/app/denpa/page.tsx',
    panelSymbols: ['OutcomePanel', 'readPanel', 'PanelCopy'],
    emptyKeys: ['emptyDenpaTransmissions'],
    errorKeys: ['errorDenpaUnavailable'],
  },
  {
    name: 'reader route',
    file: 'src/app/reader/page.tsx',
    panelSymbols: ['OutcomePanel', 'readPanel', 'PanelCopy'],
    emptyKeys: ['emptyReaderPanel'],
    errorKeys: ['errorReaderUnavailable'],
  },
  {
    name: 'reader panel body',
    file: 'src/ui/components/reader.tsx',
    panelSymbols: ['PanelState'],
    emptyKeys: [
      'emptyReaderInvalidTitle',
      'emptyReaderAbsentTitle',
      'emptyReaderHint',
      'emptyReaderAmbiguousTitle',
      'emptyReaderAmbiguousSubtitle',
      'emptyReaderTranslations',
      'emptyReaderCitation',
    ],
    errorKeys: ['errorRightsBlocked', 'errorTranslationBlocked'],
  },
  {
    name: 'station detail sub-panels',
    file: 'src/app/stations/[id]/page.tsx',
    panelSymbols: ['PanelState'],
    emptyKeys: ['emptyStationNoCountry', 'emptyStationNoSchedule', 'emptyStationNoHost'],
    errorKeys: [],
  },
  {
    name: 'terms list',
    file: 'src/app/terms/page.tsx',
    panelSymbols: ['DataPanel', 'OutcomePanel', 'PanelState', 'readPanel', 'PanelCopy'],
    emptyKeys: ['emptyTermsTitle', 'emptyTermsSearchHint', 'emptyMatchPreviewIdle'],
    errorKeys: ['errorTermsUnavailable', 'errorMatchPreviewUnavailable'],
  },
  {
    name: 'figures registry',
    file: 'src/app/figures/page.tsx',
    panelSymbols: ['DataPanel'],
    emptyKeys: ['emptyFiguresRegistry', 'emptyFiguresRegistryHint'],
    errorKeys: ['errorFiguresUnavailable'],
  },
  {
    name: 'missions table',
    file: 'src/app/missions/page.tsx',
    panelSymbols: ['OutcomePanel', 'readPanel', 'PanelCopy'],
    emptyKeys: ['emptyMissionsFilter', 'emptyMissionsFilterHint'],
    errorKeys: ['errorMissionsUnavailable'],
  },
]

const ADHOC_NULLABLE_ACCUMULATOR = /let\s+[A-Za-z0-9_]+\s*:\s*[A-Za-z0-9_[\]{}.\s|'"]+\s*\|\s*null\s*=\s*null\b/
const ADHOC_ERROR_ACCUMULATOR = /let\s+error\s*:\s*string\s*\|\s*null\s*=\s*null\b/

for (const panel of DATA_BACKED) {
  test(`UI-F10 ${panel.name} renders its data state through the shared panel API`, () => {
    const source = read(...panel.file.split('/'))
    assert.match(
      source,
      /from ['"](?:@\/ui\/components\/states|\.\/states)['"]/,
      `${panel.file} must import the shared four-state contract`,
    )
    for (const symbol of panel.panelSymbols) {
      assert.ok(source.includes(symbol), `${panel.file} must use ${symbol}`)
    }
  })

  test(`UI-F10 ${panel.name} keeps no ad-hoc loading/error accumulator`, () => {
    const source = read(...panel.file.split('/'))
    assert.doesNotMatch(
      source,
      ADHOC_NULLABLE_ACCUMULATOR,
      `${panel.file} must not hand-roll a nullable panel accumulator`,
    )
    assert.doesNotMatch(
      source,
      ADHOC_ERROR_ACCUMULATOR,
      `${panel.file} must not keep a parallel ` + '`let error: string | null`' + ' panel state',
    )
  })

  test(`UI-F10 ${panel.name} takes its empty and error sentences from the states catalogue`, () => {
    const source = read(...panel.file.split('/'))
    const referenced = new Set(
      [...source.matchAll(/\bcopy\.([A-Za-z0-9_]+)/g)].map((match) => match[1]),
    )
    assert.ok(referenced.size > 0, `${panel.file} must read its wording off the locale catalogue`)

    for (const key of [...panel.emptyKeys, ...panel.errorKeys]) {
      assert.ok(referenced.has(key), `${panel.file} must show ${key} through copy, not inline text`)
      assert.ok(
        typeof statesCopy.en[key] === 'string' && statesCopy.en[key].length > 0,
        `${key} must carry English copy`,
      )
      assert.ok(
        typeof statesCopy.id[key] === 'string' && statesCopy.id[key].length > 0,
        `${key} must carry Indonesian copy`,
      )
    }

    // The four state props may never be typed out in a panel: only the
    // catalogue decides what a loading, empty or error panel says. Both the JSX
    // form (`emptyTitle="..."`) and the PanelCopy object form
    // (`emptyTitle: '...'`) are the regression, and a prop set from anything but
    // `copy.*` means the panel invented its own wording.
    const stateProps = ['loadingLabel', 'emptyTitle', 'emptyHint', 'errorMessage']
    for (const prop of stateProps) {
      const literals = new RegExp(`\\b${prop}\\s*(?:=\\{|:)\\s*(?:"[^"]*"|'[^']*'|\`[^\`]*\`)`, 'g')
      for (const match of source.matchAll(literals)) {
        assert.fail(
          `${panel.file} hard-codes ${prop} (${match[0].trim()}); the sentence belongs in states-copy.ts`,
        )
      }
      const expressions = new RegExp(`\\b${prop}\\s*=\\{([\\s\\S]*?)\\}`, 'g')
      for (const match of source.matchAll(expressions)) {
        const value = match[1]
        if (/\b\w*[Cc]opy\.[A-Za-z0-9_]+/.test(value)) continue
        assert.fail(
          `${panel.file} sets ${prop}={${value.trim()}} from something other than the locale catalogue`,
        )
      }
    }
  })
}

test('UI-F10 a migrated page never renders a bare error Alert as its panel error', () => {
  for (const panel of DATA_BACKED) {
    const source = read(...panel.file.split('/'))
    if (panel.file.endsWith('components/reader.tsx')) {
      // The Reader's Alert is a rights denial, not a panel error, so it must
      // stay tied to the rights_blocked domain state.
      assert.match(source, /result\.state === 'rights_blocked' \? \(\s*<Alert tone="hot">/)
      assert.doesNotMatch(source, /catch\s*\(/, `${panel.file} must not catch a read locally`)
      continue
    }
    if (panel.file.includes('/app/')) {
      assert.doesNotMatch(
        source,
        /<Alert\b/,
        `${panel.file} must render errors through PanelState, not a bare Alert`,
      )
      assert.doesNotMatch(
        source,
        /catch\s*\(\s*err/,
        `${panel.file} must let readPanel own the rejected read`,
      )
    }
  }
})

test('UI-F10 a hub failure is never laundered into an empty panel', () => {
  // The old denpa read swallowed every failure into an empty list, which made
  // an outage indistinguishable from a quiet band.
  const query = read('src', 'data', 'queries', 'denpa.ts')
  assert.doesNotMatch(query, /catch\s*\{\s*return\s*\[\]/, 'a rejected read must propagate, not return []')
  assert.match(query, /await serverClient\(\)\.view\('publicLiveTransmissions'\)\.read/)
})

test('UI-F10 every panel error sentence names the failing projection', () => {
  const keys = [
    'errorStationsUnavailable',
    'errorScheduleUnavailable',
    'errorDenpaUnavailable',
    'errorReaderUnavailable',
  ]
  for (const key of keys) {
    assert.match(statesCopy.en[key], /unavailable/i, `${key} must state that the projection is unavailable`)
    assert.notEqual(
      statesCopy.en[key],
      statesCopy.en.errorBoundaryTitle,
      `${key} must not collapse into the generic boundary copy`,
    )
  }
})

test('UI-F10 static routes stay static instead of gaining fake data states', () => {
  // These routes render authored content. Giving them a loading and error state
  // would claim a hub read that does not exist, so the contract here is that
  // they stay out of the panel API entirely.
  const staticRoutes = ['src/app/timeline/page.tsx', 'src/app/prisms/page.tsx', 'src/app/studio/page.tsx']
  for (const file of staticRoutes) {
    const source = read(...file.split('/'))
    assert.doesNotMatch(
      source,
      /readPanel|DataPanel|OutcomePanel|PanelState/,
      `${file} renders authored content and must not pretend to be a data panel`,
    )
    assert.doesNotMatch(
      source,
      /from '@\/data\/queries/,
      `${file} must not grow a hub read just to fill a state`,
    )
  }
})

test('UI-F10 withheld routes state the withholding instead of faking a lifecycle', () => {
  // /research publishes no public projection yet, so it has no data to be
  // loading, empty or ready over. It must not be dressed up as a panel; it
  // names the withholding. /reader/compare is excluded here on purpose: it is
  // another task's in-flight surface, and a contract test must not pin a file
  // it does not own.
  const withheldRoutes = ['src/app/research/page.tsx']
  for (const file of withheldRoutes) {
    const source = read(...file.split('/'))
    assert.doesNotMatch(
      source,
      /readPanel|DataPanel|OutcomePanel|PanelState/,
      `${file} is withheld and must not gain a data-panel lifecycle`,
    )
    assert.doesNotMatch(source, /from '@\/data\/queries/, `${file} must not read the hub`)
    assert.match(
      source,
      /<Alert tone="hot">\{copy\.[A-Za-z0-9_]+\}<\/Alert>/,
      `${file} must name the withholding from the locale catalogue`,
    )
  }
})

test('UI-F10 the research route stays a fail-closed denial, not a panel state', () => {
  const source = read('src', 'app', 'research', 'page.tsx')
  assert.match(
    source,
    /<Alert tone="hot">\{copy\.errorResearchUnavailable\}<\/Alert>/,
    'research is a withheld projection, so it must keep the denial wording',
  )
  assert.doesNotMatch(
    source,
    /readPanel|DataPanel|OutcomePanel|PanelState/,
    'research must not gain a data-panel lifecycle for a projection that is not public',
  )
  assert.doesNotMatch(source, /from '@\/data\/queries/, 'research must not read the hub')
})

test('UI-F10 detail routes keep a real 404 instead of a 200 empty panel', () => {
  const detailRoutes = [
    'src/app/terms/[stableId]/page.tsx',
    'src/app/figures/[figureCode]/page.tsx',
    'src/app/constellation/relations/[relationCode]/page.tsx',
    'src/app/embed/[id]/page.tsx',
  ]
  for (const file of detailRoutes) {
    const source = read(...file.split('/'))
    assert.match(
      source,
      /notFound\(\)/,
      `${file} must answer an absent record with a 404, not an empty panel`,
    )
  }
})
