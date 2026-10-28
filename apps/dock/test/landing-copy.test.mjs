import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { assertRequiredLocaleKeys } from '@moonwitness/core'
import { getLandingCopy, landingCopy } from '../src/lib/landing-copy.ts'
import { localeFromMiddlewareHeader } from '../src/lib/locale-context.mjs'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const appDir = path.resolve(testDir, '..')
const heroSource = fs.readFileSync(path.resolve(appDir, 'src', 'ui', 'components', 'shell.tsx'), 'utf8')
const offlineHomeSource = fs.readFileSync(path.resolve(appDir, 'src', 'app', 'page.tsx'), 'utf8')

test('home UI catalog has matching required Indonesian and English keys', () => {
  const requiredKeys = Object.keys(landingCopy.en)
  assert.doesNotThrow(() => assertRequiredLocaleKeys(landingCopy, requiredKeys))
  assert.deepEqual(Object.keys(landingCopy.id).sort(), [...requiredKeys].sort())
  assert.equal(getLandingCopy('id').heroNetwork, 'JARINGAN KISAH GLOBAL')
  assert.equal(getLandingCopy('en').heroNetwork, 'A GLOBAL STORY NETWORK')
})

test('M31-04 gateway label names LIGHTHOUSE as the public gateway in both locales', () => {
  assert.equal(landingCopy.en.heroEyebrow, 'LIGHTHOUSE · PUBLIC GATEWAY OF MOONWITNESS XV')
  assert.equal(landingCopy.id.heroEyebrow, 'LIGHTHOUSE · GERBANG PUBLIK MOONWITNESS XV')

  for (const locale of ['en', 'id']) {
    const label = landingCopy[locale].heroEyebrow
    assert.equal(typeof label, 'string', `${locale}.heroEyebrow must exist`)
    assert.ok(label.trim().length > 0, `${locale}.heroEyebrow must not be empty`)
    assert.match(label, /^LIGHTHOUSE · /, `${locale}.heroEyebrow must name LIGHTHOUSE`)
    assert.match(label, /MOONWITNESS XV$/, `${locale}.heroEyebrow must name MoonWitness XV`)
    assert.ok(label.length <= 60, `${locale}.heroEyebrow must stay short enough not to clip`)
  }

  assert.match(landingCopy.en.heroEyebrow, /PUBLIC GATEWAY/)
  assert.match(landingCopy.id.heroEyebrow, /GERBANG PUBLIK/)
})

test('M31-04 gateway label renders as visible hero text, not decoration', () => {
  const tapeLabel = /<Tape tone="accent">\{copy\.heroEyebrow\}<\/Tape>/
  assert.match(heroSource, tapeLabel, 'the live hero must render the gateway label as a text Tape')
  assert.match(offlineHomeSource, tapeLabel, 'the offline hero must render the gateway label as a text Tape')
  assert.match(heroSource, /<h1 className="dk-hero-title">MOONWITNESS<\/h1>/, 'MOONWITNESS stays the h1 brand')
  assert.match(offlineHomeSource, /<h1 id="offline-home-title" className="dk-hero-title">MOONWITNESS<\/h1>/)
})

test('M31-04 gateway label makes no domain, liveness, deployment or authority claim', () => {
  const labels = `${landingCopy.en.heroEyebrow} ${landingCopy.id.heroEyebrow}`
  assert.doesNotMatch(labels, /a-l-l-a-h\.com/i)
  assert.doesNotMatch(labels, /\bLIVE\b/)
  assert.doesNotMatch(labels, /\bdeployed\b|\bproduction\b/i)
  assert.doesNotMatch(labels, /religious authority|divine authority|canon(?:ical)? approval|rights clear/i)
  assert.doesNotMatch(labels, /otoritas agama|kewenangan ilahi|persetujuan kanon/i)
})

test('mission follows approved source and feature copy states voluntary participation', () => {
  const idMission = landingCopy.id.approvedMission
  assert.match(idMission, /memuliakan ALLAH/)
  assert.match(idMission, /Nabi Muhammad SAW dan Nabi Isa AS/)
  assert.match(idMission, /Partisipasi bersifat sukarela/)
  assert.match(idMission, /tidak mengklaim kewenangan ilahi/)
  assert.equal(landingCopy.id.planned, 'RENCANA')
})

test('unverified fabricated counters and dated archive claims are absent from copy', () => {
  const copy = Object.values(landingCopy.id).join(' ')
  assert.doesNotMatch(copy, /1324|6912|03:24|2024\.09|2025\.08/)
  assert.match(copy, /slot jadwal mingguan tercatat/)
  assert.match(landingCopy.en.stationMapDescription, /markers are illustrative/)
  assert.match(landingCopy.id.stationMapDescription, /hanya ilustrasi/)
  assert.equal(landingCopy.en.exploreStories, 'BROWSE RADIO STATIONS')
  assert.equal(landingCopy.id.exploreStories, 'LIHAT STASIUN RADIO')
  assert.match(landingCopy.en.worldMonitor, /PROVIDER FEED NOT CONNECTED/)
  assert.match(landingCopy.en.worldMonitorNotice, /seeded sample signals are withheld/i)
  assert.match(landingCopy.id.worldMonitor, /FEED PROVIDER BELUM TERHUBUNG/)
  assert.match(landingCopy.id.worldMonitorNotice, /sinyal contoh tersimpan disembunyikan/i)
})

test('locale context accepts middleware values and defaults safely to English', () => {
  assert.equal(localeFromMiddlewareHeader('id'), 'id')
  assert.equal(localeFromMiddlewareHeader('en'), 'en')
  assert.equal(localeFromMiddlewareHeader('fr'), 'en')
  assert.equal(localeFromMiddlewareHeader(null), 'en')
})
