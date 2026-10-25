import { test } from 'node:test'
import assert from 'node:assert/strict'
import base from '@moonwitness/moonql-base'
import stations from '@moonwitness/moonql-stations'
import schedule from '@moonwitness/moonql-schedule'
import { bootMoonQl } from '@moonwitness/moonql'

const quiet = { info: () => {}, warn: () => {} }

/**
 * A stored compute (`schedule_slots.dayIndex`) must behave like a real column —
 * filled on insert, recomputed on update, orderable — on both engines. This is
 * what replaces the manual hook + daily repair cron.
 */
async function bootSlots() {
  const moonql = await bootMoonQl({
    addons: [base, stations, schedule],
    seedPolicy: 'off',
    cronEnabled: false,
    log: quiet,
  })
  const slots = moonql.model('schedule_slots')
  const catalog = await moonql.model('stations').list({ limit: 1 })
  const stationRef = String(catalog[0]!.id)
  return { moonql, slots, stationRef }
}

test('stored compute is filled on insert and recalculated on update', async () => {
  const { moonql, slots, stationRef } = await bootSlots()
  const created = await slots.create({ title: 'Riset Sore', stationRef, weekday: 'thu', startMin: 900, endMin: 1000 })
  assert.equal(created.dayIndex, 4, 'thu is day 4 of the calendar week')

  const moved = await slots.update(String(created.id), { weekday: 'mon' })
  assert.equal(moved.dayIndex, 1, 'the stored derive followed the weekday change')
  await moonql.close()
})

test('the derive is read-only from the outside but orderable in queries', async () => {
  const { moonql, slots, stationRef } = await bootSlots()
  await slots.create({ title: 'Minggu Pagi', stationRef, weekday: 'sun', startMin: 0, endMin: 60 })
  await slots.create({ title: 'Sabtu Malam', stationRef, weekday: 'sat', startMin: 120, endMin: 180 })
  await slots.create({ title: 'Senin Pagi', stationRef, weekday: 'mon', startMin: 60, endMin: 90 })

  // the write body has no place for it: the schema is the contract
  const compiled = (slots as unknown as { compiled?: { create?: { properties?: Record<string, unknown> } } }).compiled
  assert.equal(compiled?.create?.properties?.dayIndex, undefined, 'derived columns are not client-writable')

  const ordered = await slots.list({ order: 'dayIndex,startMin', limit: 50 })
  // the demo grid is present too (seeds run on an empty table), so check the
  // relative order of the rows this test wrote rather than the whole list
  const mine = ['Minggu Pagi', 'Senin Pagi', 'Sabtu Malam'].filter((title) =>
    ordered.some((row) => row.title === title),
  )
  assert.deepEqual(
    ordered.filter((row) => mine.includes(String(row.title))).map((row) => row.title),
    mine,
    'sun → mon → sat, not the alphabetical weekday sort',
  )
  const days = ordered.map((row) => Number(row.dayIndex))
  assert.deepEqual([...days].sort((a, b) => a - b), days, 'the whole result set is non-decreasing by derive')
  await moonql.close()
})

test('the demo week grid is chronological straight from the seeds, no repair cron', async () => {
  const moonql = await bootMoonQl({ addons: [base, stations, schedule], cronEnabled: false, log: quiet })
  const rows = await moonql.model('schedule_slots').list({ order: 'dayIndex,startMin', limit: 100 })
  assert.ok(rows.length >= 14, 'the seeded grid is present')
  assert.ok(
    rows.every((row) => typeof row.dayIndex === 'number' && row.dayIndex >= 0 && row.dayIndex <= 6),
    'every seeded row carries its stored derive',
  )
  const days = rows.map((row) => Number(row.dayIndex))
  assert.deepEqual([...days].sort((a, b) => a - b), days, 'the grid comes out in calendar order')
  assert.equal(days[0], 0, 'the week starts on Sunday, not on "fri"')
  await moonql.close()
})
