import assert from 'node:assert/strict'
import test from 'node:test'
import { assertRequiredLocaleKeys } from '@moonwitness/core'
import { landingCopy } from '../src/lib/landing-copy.ts'

test('M19-11 English home catalog has the same keys and content states as Indonesian', () => {
  const englishKeys = Object.keys(landingCopy.en).sort()
  assert.deepEqual(Object.keys(landingCopy.id).sort(), englishKeys)
  assert.doesNotThrow(() => assertRequiredLocaleKeys(landingCopy, englishKeys))

  assert.equal(landingCopy.en.planned, 'PLANNED')
  assert.equal(landingCopy.id.planned, 'RENCANA')
  assert.equal(landingCopy.en.scheduledTransmission, 'SCHEDULED TRANSMISSION')
  assert.equal(landingCopy.id.scheduledTransmission, 'JADWAL SIARAN')
  assert.equal(landingCopy.en.noCurrentSlot, 'NO CURRENT SCHEDULE SLOT')
  assert.equal(landingCopy.id.noCurrentSlot, 'TIDAK ADA SLOT JADWAL SAAT INI')
})

test('M19-11 English mission preserves approved names, voluntary participation, and authority boundary', () => {
  const mission = landingCopy.en.approvedMission
  assert.match(mission, /glorify ALLAH/)
  assert.match(mission, /Nabi Muhammad SAW and Nabi Isa AS/)
  assert.match(mission, /Participation is voluntary/)
  assert.match(mission, /no claim of divine authorization/)
})

test('M19-11 English home copy avoids invented metrics, dates, and live AI claims', () => {
  const copy = Object.values(landingCopy.en).join(' ')
  assert.doesNotMatch(copy, /1324|6912|03:24|2024\.09|2025\.08/)
  assert.match(landingCopy.en.stationMapDescription, /markers are illustrative/)
  assert.match(landingCopy.en.archiveDescription, /concepts are planned/)
  assert.match(landingCopy.en.liveFeedAiTriaged, /^OSINT MONITORING$/)
  assert.doesNotMatch(landingCopy.en.liveFeedAiTriaged, /\bLIVE\b|\bAI\b/i)
})

test('M19-11 an English catalog missing approved mission copy fails with its key identified', () => {
  const en = { ...landingCopy.en }
  delete en.approvedMission

  assert.throws(
    () => assertRequiredLocaleKeys({ en, id: landingCopy.id }, ['approvedMission']),
    /en\.approvedMission/,
  )
})
