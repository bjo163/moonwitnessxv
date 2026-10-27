import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  DEMO_OPERATIONAL_KEYS,
  REAL_OPERATIONAL_KEYS,
  missionControlGroup,
  operationalStatusLabel,
  resolveShellLocale,
  shellCopy,
  type OperationalStatus,
} from '../src/lib/shell-copy.js'

const NAV_KEYS = [
  'navGroupMissionControl',
  'navDashboard',
  'navMissionControl',
  'navProjectUniverse',
  'navStoryForge',
  'navPosterLab',
  'navResearchLab',
  'navWorldMonitor',
  'navPublishingHub',
  'navSettings',
] as const

void test('HQ shell catalog exposes the identical complete key set in English and Indonesian', () => {
  const english = shellCopy('en')
  const indonesian = shellCopy('id')

  assert.deepEqual(Object.keys(indonesian).sort(), Object.keys(english).sort())
  assert.equal(Object.keys(english).length, Object.keys(indonesian).length)
})

void test('every navigation label and status renders localized copy with no raw key fallback', () => {
  for (const locale of ['en', 'id'] as const) {
    const copy = shellCopy(locale)
    for (const [key, value] of Object.entries(copy)) {
      assert.equal(typeof value, 'string', `${locale}.${key} must be a string`)
      assert.ok(value.trim().length > 0, `${locale}.${key} must not be empty`)
      // A missing key would surface the raw key name as its own value; never allowed.
      assert.notEqual(value, key, `${locale}.${key} fell back to the raw key`)
    }
    for (const navKey of NAV_KEYS) {
      assert.ok(navKey in copy, `navigation key ${navKey} is present`)
    }
  }

  const english = shellCopy('en')
  const indonesian = shellCopy('id')
  // Prove real translation happened rather than passthrough for the chrome we own.
  assert.equal(english.navDashboard, 'Dashboard')
  assert.equal(indonesian.navDashboard, 'Dasbor')
  assert.equal(indonesian.navSettings, 'Pengaturan')
  assert.equal(english.logOut, 'Log out')
  assert.equal(indonesian.logOut, 'Keluar')
  for (const navKey of NAV_KEYS) {
    assert.notEqual(english[navKey], indonesian[navKey], `${navKey} differs between locales`)
  }
})

void test('operational statuses keep a live status separate from an honest demo status', () => {
  // The real and demo status key sets are explicitly disjoint.
  const overlap = REAL_OPERATIONAL_KEYS.filter((key) => (DEMO_OPERATIONAL_KEYS as readonly string[]).includes(key))
  assert.deepEqual(overlap, [])

  const liveStatus: OperationalStatus = { source: 'live', status: 'statusOpsLoaded' }
  const demoStatus: OperationalStatus = { source: 'demo', status: 'statusDemoAlerts' }

  const liveEn = operationalStatusLabel('en', liveStatus)
  const liveId = operationalStatusLabel('id', liveStatus)
  const demoEn = operationalStatusLabel('en', demoStatus)
  const demoId = operationalStatusLabel('id', demoStatus)

  assert.equal(liveEn, 'ops loaded')
  assert.equal(liveId, 'ops termuat')
  // A demo status is named as a demo in BOTH locales, so localization cannot blur it.
  assert.match(demoEn, /demo/i)
  assert.match(demoId, /demo/i)
  // The demo label can never collapse onto a live label.
  const liveHub = operationalStatusLabel('en', { source: 'live', status: 'statusHubFallback' })
  const liveHubId = operationalStatusLabel('id', { source: 'live', status: 'statusHubFallback' })
  assert.equal(liveHub, 'Hub reachable')
  assert.equal(liveHubId, 'Hub terjangkau')
  for (const localized of [demoEn, demoId]) {
    assert.notEqual(localized, liveEn)
    assert.notEqual(localized, liveId)
    assert.notEqual(localized, liveHub)
    assert.notEqual(localized, liveHubId)
  }
})

void test('an unknown or unsupported locale falls back deterministically to English', () => {
  assert.equal(resolveShellLocale({}), 'en')
  assert.equal(resolveShellLocale({ persistedLocale: 'fr', acceptLanguage: 'de' }), 'en')
  // A supported preference still wins; only unknown values fall back.
  assert.equal(resolveShellLocale({ persistedLocale: 'id' }), 'id')
  assert.equal(resolveShellLocale({ acceptLanguage: 'id-ID' }), 'id')
})

void test('shellCopy returns valid copy only for the two supported locales', () => {
  // Accessing an out-of-band locale must not silently return valid copy: the
  // deterministic fallback to English is resolveShellLocale's job (tested above).
  assert.equal((shellCopy as (locale: string) => unknown)('fr'), undefined)
  assert.equal(typeof shellCopy('en').navDashboard, 'string')
  assert.equal(typeof shellCopy('id').navDashboard, 'string')
})

void test('Mission Control menus localize labels while preserving route contracts', () => {
  const english = missionControlGroup('en')
  const indonesian = missionControlGroup('id')

  assert.equal(english.label, 'Mission Control')
  assert.equal(indonesian.label, 'Pusat Kendali Misi')
  assert.deepEqual(
    indonesian.items.map(({ key, href, icon }) => ({ key, href, icon })),
    english.items.map(({ key, href, icon }) => ({ key, href, icon })),
  )
  assert.notEqual(english.items[0]?.label, indonesian.items[0]?.label)
  assert.equal(english.items[0]?.key, 'mc:dashboard')
  assert.equal(indonesian.items[0]?.href, '/#telemetry')
})
