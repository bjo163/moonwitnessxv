import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { denpaCopy } from '../src/ui/copy/denpa-copy.ts'

/**
 * UI-II P14a–P14d · the DENPA deck says what the hub does, and only that.
 *
 * The deck is a client component, so these are source-shape assertions plus one
 * live derivation: each claim a visitor can read is traced to the file that
 * grants it — the hub's own body schema for the limits, the hub's rate-limit list
 * for the 429 branch, the view's own `where` clause for the on-air badge.
 */

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = path.resolve(appRoot, '..', '..')
const read = (...segments) => fs.readFileSync(path.resolve(repoRoot, ...segments), 'utf8')

const deck = read('apps', 'dock', 'src', 'ui', 'client', 'DenpaTransceiver.tsx')
const page = read('apps', 'dock', 'src', 'app', 'denpa', 'page.tsx')
const proxy = read('apps', 'dock', 'src', 'app', 'api', 'denpa', 'transmit', 'route.ts')
const hubModule = read('apps', 'arsy', 'src', 'modules', 'denpa', 'index.ts')
const rateLimit = read('apps', 'arsy', 'src', 'plugins', 'rate-limit.ts')
const stationsView = read('packages', 'moonql-stations', 'src', 'index.ts')

test('UI2-P14a the deck validation limits are the hub declared limits', () => {
  const messageCap = /message: \{ type: 'string', minLength: 1, maxLength: (\d+) \}/.exec(hubModule)?.[1]
  const pseudonymCap = /pseudonym: \{ type: 'string', maxLength: (\d+) \}/.exec(hubModule)?.[1]
  assert.ok(messageCap, 'the hub must still declare a message cap for the deck to mirror')
  assert.ok(pseudonymCap, 'the hub must still declare a pseudonym cap for the deck to mirror')

  assert.match(deck, new RegExp(`maxLength=\\{${messageCap}\\}`), 'the textarea caps at the hub cap')
  assert.match(deck, new RegExp(`message\\.length > ${messageCap}`), 'the guard rejects at the hub cap, not before it')
  assert.match(deck, new RegExp(`pseudonym\\.trim\\(\\)\\.length > ${pseudonymCap}`), 'the handle guard uses the hub cap')

  assert.match(proxy, /required: \['message'\]|message cannot be empty/, 'an empty message is refused before the hub is asked')
})

test('UI2-P14a the transmit path is one the hub actually rate limits', () => {
  assert.match(rateLimit, /'\/denpa\/transmit'/, 'the 429 branch is grounded in the hub limiter list, not guessed')
  assert.match(hubModule, /fastify\.post\('\/transmit'/, 'the hub endpoint the proxy calls must exist')
  assert.match(deck, /fetch\('\/api\/denpa\/transmit'/, 'the deck posts to the Dock proxy, which owns the hub credential')
})

test('UI2-P14b every outcome the hub can return has its own words, and none of them are the hub debug string', () => {
  const branches = {
    rejected: /if \(res\.status === 400\) refuse\(copy\.formDenpaRejected\)/,
    denied: /else if \(res\.status === 401 \|\| res\.status === 403\) refuse\(copy\.formDenpaDenied\)/,
    rateLimited: /else if \(res\.status === 429\) refuse\(copy\.formDenpaRateLimited\)/,
    serverDown: /else if \(res\.status >= 500\) refuse\(copy\.formDenpaServerDown\)/,
    unknown: /else refuse\(copy\.formDenpaUnknown\)/,
  }
  for (const [name, pattern] of Object.entries(branches)) {
    assert.match(deck, pattern, `the ${name} branch must stay mapped to its own key`)
  }

  assert.ok(!deck.includes('body.error'), 'the hub error string is internal and is never rendered as UI text')
  assert.match(
    deck,
    /res\.json\(\)\.catch\(\(\) => null\)/,
    'an HTML outage page from a proxy is not presented as a recorded transmission',
  )
  assert.match(
    deck,
    /navigator\.onLine === false\s*\n?\s*\?\s*copy\.formDenpaOffline\s*\n?\s*:\s*copy\.formDenpaServerDown/,
    'the deck distinguishes its own offline from a server outage',
  )
})

test('UI2-P14b a failed catalog read is stated as unknown, not counted as zero stations', () => {
  assert.match(page, /\.catch\(\(\) => null\)/, 'the catalog read degrades to unknown, never to an empty list')
  assert.match(page, /dCopy\.badgeStationsUnknown/, 'the header says the list is unavailable')
  assert.match(deck, /stations: StationOption\[\] \| null/, 'null is part of the deck contract, not an empty array')
  assert.match(deck, /stations \?\? \[\]/, 'the select still offers the global network when the catalog is unknown')
  assert.match(deck, /dCopy\.stationSelectUnknownHint/, 'the field explains why no station is offered')
  assert.ok(denpaCopy.en.badgeStationsUnknown !== denpaCopy.id.badgeStationsUnknown)
})

test('UI2-P14c the compose fields carry help, a counter and an announced status', () => {
  assert.match(deck, /role="status" aria-live="polite"/, 'the transmit result is announced, not only coloured')
  assert.match(deck, /aria-label=\{copy\.formDenpaCharCounterAria\}/, 'the counter has an accessible name')
  assert.match(deck, /htmlFor="denpa-pseudo"[\s\S]{0,80}hint=\{copy\.formDenpaPseudonymHint\}/, 'the handle field states its own limit rule')
  const msgStart = deck.indexOf('id="denpa-msg"')
  assert.ok(msgStart > -1, 'the compose textarea keeps its id so the label binds')
  assert.match(deck.slice(msgStart, deck.indexOf('</Field>', msgStart)), /required/, 'an empty submit is refused by the field, not only by JS')

  const requiredKeys = [
    'formDenpaErrorEmpty',
    'formDenpaErrorTooLong',
    'formDenpaErrorPseudonymTooLong',
    'formDenpaRejected',
    'formDenpaDenied',
    'formDenpaRateLimited',
    'formDenpaServerDown',
    'formDenpaOffline',
    'formDenpaUnknown',
  ]
  const contract = read('apps', 'dock', 'test', 'required-states-ui-keys.mjs')
  for (const key of requiredKeys) {
    assert.match(contract, new RegExp(`  '${key}',`), `${key} must stay in the shared states contract`)
  }
})

test('UI2-P14d one transmission in flight: the deck cannot double-send', () => {
  assert.match(deck, /if \(isPending\) return/, 'a second submit while pending is refused before the fetch')
  assert.match(deck, /disabled=\{isPending \|\| !message\.trim\(\)\}/, 'the button states the same rule it enforces')
  assert.match(deck, /\{isPending \? copy\.formDenpaTransmitting : copy\.formDenpaTransmit\}/, 'the label changes while in flight')
})

test('UI2-P14d the feed counts rows the projection returned and its on-air claim is the view own filter', () => {
  assert.match(page, /\{feed\.length\} \{dCopy\.badgeOnAir\}/, 'the count is the rows returned for this request')
  assert.match(page, /\{stations\.length\} \{dCopy\.badgeTargetStations\}/, 'the station count is the catalog rows returned')

  const onAirView = /publicLiveTransmissions: defineView\('publicLiveTransmissions', \{[\s\S]*?\n {4}\)\)/.exec(stationsView)?.[0]
  assert.ok(onAirView, 'the public transmissions view must stay defined for the badge to mean anything')
  assert.match(onAirView, /where: \{ status: 'ON_AIR' \}/, 'ON-AIR is the view filter, so the badge repeats no stronger claim')
  const dot = deck.indexOf('<LiveDot on={true} />')
  const badge = deck.indexOf('<Badge tone="cyan">{dCopy.feedOnAir}</Badge>')
  assert.ok(dot > -1 && badge > dot, 'the dot and the words sit in the same card, in that order')
})

test('UI2-P14b the route catalogue is id/en complete and the old encrypted claim is gone', () => {
  const enKeys = Object.keys(denpaCopy.en).sort()
  const idKeys = Object.keys(denpaCopy.id).sort()
  assert.deepEqual(idKeys, enKeys)
  assert.ok(enKeys.length >= 13, `the deck keeps every label it renders (${enKeys.length})`)

  const source = `${JSON.stringify(denpaCopy.en)}${JSON.stringify(denpaCopy.id)}`
  for (const claim of ['encrypt', 'terenkripsi', 'zero data', 'cleartext']) {
    assert.ok(!source.toLowerCase().includes(claim), `the deck must not claim "${claim}" it cannot prove`)
  }
  assert.ok(!page.includes('Zero Data In Clear'), 'the removed subtitle must not come back')
})
