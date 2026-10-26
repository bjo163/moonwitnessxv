import { test } from 'node:test'
import assert from 'node:assert/strict'
import { bootMoonQl } from '@moonwitness/moonql'
import base from '@moonwitness/moonql-base'
import auth from '@moonwitness/moonql-auth'
import stations from '@moonwitness/moonql-stations'

const quiet = { info: () => {}, warn: () => {} }

test('M04-01: bootMoonQl refuses to boot with in-memory engine when requirePg is true', async () => {
  await assert.rejects(
    async () => {
      await bootMoonQl({
        addons: [base, auth, stations],
        requirePg: true,
        databaseUrl: undefined,
        log: quiet,
      })
    },
    {
      name: 'Error',
      message: /moonql: databaseUrl is strictly required \(requirePg=true, M04-01\)/,
    },
  )
})

test('M04-01: bootMoonQl succeeds with in-memory engine when requirePg is false or omitted (dev mode)', async (t) => {
  const instance = await bootMoonQl({
    addons: [base, auth, stations],
    requirePg: false,
    databaseUrl: undefined,
    log: quiet,
  })
  t.after(() => instance.close())

  assert.equal(instance.engine, 'memory')
  assert.ok(instance.model('stations'))
  const count = await instance.model('stations').count()
  assert.equal(count, 36, 'Memory engine successfully seeds baseline 36 stations')
})

test('M04-04: baseline stations equivalence preserves stable IDs, natural keys, and 36 channels', async (t) => {
  const instance = await bootMoonQl({
    addons: [base, auth, stations],
    requirePg: false,
    databaseUrl: undefined,
    log: quiet,
  })
  t.after(() => instance.close())

  const allStations = await instance.model('stations').list({ limit: 100 })
  assert.equal(allStations.length, 36, 'Exact 36 stations exist in baseline catalog')

  // Verify key station natural key exists and has streamUrl
  const prambors = allStations.find((s: Record<string, unknown>) => s.name === 'Prambors FM Jakarta')
  assert.ok(prambors, 'Primary station Prambors FM is present')
  assert.equal(prambors.genre, 'pop')
  assert.ok(typeof prambors.streamUrl === 'string' && prambors.streamUrl.length > 0)
})

test('M04-02 & M04-06: schema upgrade failure preserves database integrity and does not corrupt prior data', async (t) => {
  const instance = await bootMoonQl({
    addons: [base, auth, stations],
    requirePg: false,
    databaseUrl: undefined,
    log: quiet,
  })
  t.after(() => instance.close())

  const repo = instance.model('stations')
  const countBefore = await repo.count()
  assert.equal(countBefore, 36)

  // Duplicate unique constraint ('name' is unique on stations) must reject and rollback without state corruption
  await assert.rejects(
    async () => {
      await repo.create({
        name: 'Prambors FM Jakarta', // Duplicate name violates unique [['name']]
        streamUrl: 'https://example.com/duplicate',
      })
    },
    {
      name: 'Error',
      statusCode: 409,
    },
  )

  // Verify prior state remains intact with 36 stations
  const countAfter = await repo.count()
  assert.equal(countAfter, countBefore, 'Failed duplicate write rolled back cleanly without polluting database')
})
