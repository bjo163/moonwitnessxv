import assert from 'node:assert/strict'
import test from 'node:test'
import { assertRequiredLocaleKeys } from '@moonwitness/core'
import { getLandingCopy, landingCopy } from '../src/lib/landing-copy.ts'
import { localeFromMiddlewareHeader } from '../src/lib/locale-context.mjs'

test('home UI catalog has matching required Indonesian and English keys', () => {
  const requiredKeys = Object.keys(landingCopy.en)
  assert.doesNotThrow(() => assertRequiredLocaleKeys(landingCopy, requiredKeys))
  assert.deepEqual(Object.keys(landingCopy.id).sort(), [...requiredKeys].sort())
  assert.equal(getLandingCopy('id').heroNetwork, 'JARINGAN KISAH GLOBAL')
  assert.equal(getLandingCopy('en').heroNetwork, 'A GLOBAL STORY NETWORK')
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
  assert.equal(landingCopy.en.liveFeedAiTriaged, 'OSINT MONITORING')
  assert.equal(landingCopy.id.liveFeedAiTriaged, 'PEMANTAUAN OSINT')
  assert.doesNotMatch(landingCopy.en.liveFeedAiTriaged, /\bLIVE\b|\bAI\b/i)
  assert.doesNotMatch(landingCopy.id.liveFeedAiTriaged, /\bumpan langsung\b|\bAI\b/i)
})

test('locale context accepts middleware values and defaults safely to English', () => {
  assert.equal(localeFromMiddlewareHeader('id'), 'id')
  assert.equal(localeFromMiddlewareHeader('en'), 'en')
  assert.equal(localeFromMiddlewareHeader('fr'), 'en')
  assert.equal(localeFromMiddlewareHeader(null), 'en')
})
