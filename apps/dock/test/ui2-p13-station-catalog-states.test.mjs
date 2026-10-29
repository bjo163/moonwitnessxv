import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { stationsCopy } from '../src/ui/copy/stations-copy.ts'

/**
 * UI-II P13a–P13d · Signal Catalog, Station Detail and the transport.
 *
 * The screen's whole job is to report what the hub projected. These assertions
 * keep each visible number and status tied to a field the hub returned, and keep
 * the player honest about what it has actually done: a click-to-start transport,
 * a beacon that reports its own outcome, and a backup that is named as a backup.
 */

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = path.resolve(appRoot, '..', '..')
const read = (...segments) => fs.readFileSync(path.resolve(repoRoot, ...segments), 'utf8')

const list = read('apps', 'dock', 'src', 'app', 'stations', 'page.tsx')
const detail = read('apps', 'dock', 'src', 'app', 'stations', '[id]', 'page.tsx')
const player = read('apps', 'dock', 'src', 'ui', 'client', 'Player.tsx')
const catalog = read('apps', 'dock', 'src', 'data', 'queries', 'catalog.ts')
const states = read('apps', 'dock', 'src', 'lib', 'states-copy.ts')

test('UI2-P13a every count on the catalog is a field the hub returned', () => {
  assert.match(
    list,
    /\$\{page\.total\} \$\{sCopy\.countOf\} \$\{page\.catalogSize\} \$\{sCopy\.stationsInNetwork\}/,
    'a filtered view states the match count and the catalog size, in the word order each locale needs',
  )
  assert.match(list, /\$\{page\.catalogSize\} \$\{sCopy\.stationsInNetwork\}/, 'the unfiltered view states the catalog size')

  assert.match(catalog, /catalogSize/, 'catalogSize is a projected field, not a page-local number')
  assert.match(catalog, /total/, 'total is the hub count for the current filter')

  assert.doesNotMatch(list, /\b\d{2,}\s+(?:public )?stations\b/, 'no literal station count may be typed into the page')
})

test('UI2-P13b the filter form is a GET the browser drives without script', () => {
  assert.match(list, /method="get" action=\{localeHref\('\/stations'\)\}/, 'filtering works with JS disabled and survives a reload')
  assert.match(list, /<form[^>]*method="get"[^>]*role="search"/, 'assistive technology can identify station filters as a search landmark')
  for (const name of ['q', 'genre', 'country']) {
    assert.match(list, new RegExp(`name="${name}"`), `the ${name} filter must be a real form field`)
    assert.match(list, new RegExp(`params\\.set\\('${name}'`), `pagination must carry the ${name} filter forward`)
  }
  assert.match(list, /PAGE_SIZE/, 'the page size comes from the shared environment constant')
})

test('UI2-P13b the catalog keeps the four panel states, and the error is the hub reason', () => {
  assert.match(list, /readPanel<StationPage>\(/, 'the read is a panel outcome, not an ad-hoc try/catch')
  assert.match(list, /page\) => page\.rows\.length === 0/, 'an empty result is the empty state, not an error')
  assert.match(list, /panelErrorMessage\(err, copy\.errorStationsUnavailable\)/, 'the outage keeps its own words')
  assert.match(list, /<OutcomePanel/, 'the grid, pagination and skeletons all come from that one outcome')

  assert.match(states, /errorStationsUnavailable/, 'the states catalogue still owns the outage label')
  assert.match(states, /emptyNoStations/, 'the states catalogue still owns the empty label')
})

test('UI2-P13c the detail page reports the projected status instead of an assumed one', () => {
  assert.match(detail, /station\.statusLabel === 'live' \? sCopy\.statusOnAir : sCopy\.statusOffAir/, 'on-air is the hub label, translated')
  assert.match(detail, /const detail = await getStation\(id\)[\s\S]{0,80}if \(!detail\) notFound\(\)/, 'an unknown station id is a 404, not an empty shell')
  assert.match(detail, /label=\{sCopy\.labelLoggedPlays\} value=\{plays\}/, 'the play count is the projection count')
  assert.match(detail, /copy\.emptyStationNoSchedule/, 'a station without slots says so instead of showing an empty grid')

  assert.match(detail, /<Player stationId=\{station\.id\} stationName=\{station\.name\} streamUrl=\{station\.streamUrl\}/, 'the player is given the projected stream url')
  assert.doesNotMatch(detail, /autoPlay|autoplay/, 'the page must not ask for auto-play')
})

test('UI2-P13c the transport starts on a click and names each outcome it can prove', () => {
  assert.match(player, /await element\.play\(\)/, 'play() is called from the toggle handler, so a gesture starts it')
  assert.equal((player.match(/element\.play\(\)/g) ?? []).length, 1, 'exactly one play() call exists in the transport')
  assert.doesNotMatch(player, /<audio[^>]*autoPlay/i, 'the element itself is never told to auto-play')

  const streamFaults = ['statusStreamUnavailable', 'statusStreamStall', 'statusAutoplayBlocked']
  for (const key of streamFaults) {
    assert.match(player, new RegExp(`setStreamFault\\('${key}'\\)`), `${key} must be a real fault branch`)
    assert.match(states, new RegExp(`${key}: `), `${key} must stay in the states catalogue`)
  }
  assert.match(
    player,
    /type StreamFault =/,
    'the fault is a closed union of catalogue keys, so the badge cannot invent a state',
  )
})

test('UI2-P13c the failover is labelled as the backup it is', () => {
  assert.match(player, /const AMBIENT_FAILOVER_URL =/, 'the backup stream is a named constant')
  assert.match(player, /const activeSrc = isFailover \? AMBIENT_FAILOVER_URL : streamUrl/, 'the backup replaces the source only when the failover flag is set')
  assert.match(player, /<Badge tone="hot">\{copy\.statusFailoverAmbient\}<\/Badge>/, 'the badge says backup, in both locales')
  assert.match(states, /statusFailoverAmbient: 'BACKUP: AMBIENT STREAM'/)
  assert.match(states, /statusStreamStall: 'the primary stream stalled/)
})

test('UI2-P13c the beacon reports its own result instead of a guaranteed one', () => {
  assert.match(player, /setBeacon\(response\.ok \? 'sent' : 'failed'\)/, 'the listen beacon outcome is the fetch outcome')
  assert.match(player, /copy\.statusBeaconSent/, 'sent is worded as a logged listen, not a chart position')
  assert.match(states, /statusBeaconSent: 'listen logged/)
  assert.match(player, /\$\{copy\[streamFault\]\} · \$\{copy\.statusLoggingPaused\}/, 'a stalled stream says logging is paused')
})

test('UI2-P13d the route catalogue is id/en complete and every label the pages read exists', () => {
  const enKeys = Object.keys(stationsCopy.en).sort()
  const idKeys = Object.keys(stationsCopy.id).sort()
  assert.deepEqual(idKeys, enKeys, 'the two locales must carry the same keys')

  for (const source of [list, detail]) {
    for (const key of [...new Set(source.match(/sCopy\.([A-Za-z]+)/g) ?? [])]) {
      const name = key.split('.')[1]
      assert.ok(
        name in stationsCopy.en && name in stationsCopy.id,
        `${source === list ? 'the catalog' : 'the detail page'} reads stationsCopy.${name}, which must exist in both locales`,
      )
    }
  }
})

test('UI2-P13d long titles and both locales stay inside the shared shell', () => {
  assert.match(list, /title=\{sCopy\.pageTitle\}/, 'the heading is catalogue-bound, not typed English')
  assert.match(detail, /breadcrumbs=\{\[[\s\S]{0,160}sCopy\.breadcrumbSignals/, 'the trail uses the locale seam')
  assert.match(detail, /locale=\{locale\}/, 'the player receives the server locale so its labels match the page')

  const wrapping = read('apps', 'dock', 'src', 'app', 'globals.css')
  assert.match(wrapping, /\.dk-station \{[\s\S]*?overflow-wrap: anywhere;/, 'a long station or slot title wraps instead of widening the card')
})
