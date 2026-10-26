import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildColumnLookup, buildTable, columnName, defineAddon, defineModel, installAddons, int, m2o, sel, str, toIsoTimestamp } from '@moonwitness/moonql'

/**
 * Regression: drizzle exposes table columns by DESCRIPTOR KEY (`startMin`),
 * while domains/aggregate metrics may carry the snake name (`start_min`).
 * The pg engine must resolve BOTH — resolving only the snake name renders an
 * empty expression (`where (... and  <= $2)`), which breaks every camelCase
 * filter and every `?order=-createdAt` on postgres.
 */
test('pg columns: the lookup resolves descriptor keys AND snake_case names', () => {
  const table = buildTable('pg_probe', {
    startMin: int(),
    weekday: sel(['sun', 'mon']),
    countryRef: m2o('countries'),
    name: str({ maxLength: 20 }),
  })
  const col = buildColumnLookup(table)

  // descriptor keys (what domain terms and order terms carry)
  assert.ok(col('startMin'), 'startMin must resolve')
  assert.ok(col('countryRef'), 'countryRef must resolve')
  assert.ok(col('createdAt'), 'createdAt must resolve')

  // snake names (what compiled aggregate metrics carry)
  assert.ok(col('start_min'), 'start_min must resolve to the same column')
  assert.equal(col('start_min'), col('startMin'))
  assert.equal(col(columnName('countryRef')), col('countryRef'))

  // lowercase single-word fields are identical under both conventions
  assert.ok(col('weekday'))
  assert.ok(col('name'))

  // unknown keys stay undefined instead of throwing
  assert.equal(col('nope'), undefined)
})

test('pg columns: every compiled model field is reachable by both names', () => {
  const addon = defineAddon({
    name: 'pgprobe',
    models: {
      slots: defineModel({
        fields: {
          title: str({ maxLength: 40 }),
          startMin: int(),
          endMin: int(),
          weekday: sel(['sun', 'mon']),
          stationRef: m2o('stations', { null: true }),
        },
        rest: true,
        seedless: true,
      }),
    },
  })
  const registry = installAddons([addon])
  const model = registry.models.get('slots')!
  const col = buildColumnLookup(model.table)

  for (const key of Object.keys(model.fields)) {
    assert.ok(col(key), `field key ${key} must resolve`)
    assert.ok(col(columnName(key)), `column name ${columnName(key)} must resolve`)
  }
  assert.ok(col('createdAt'))
  assert.ok(col('created_at'))
})

/**
 * Regression: postgres-js returns timestamptz with a space separator and a
 * `+00` offset, while the memory engine (and the contract) is ISO-8601. Both
 * engines must hand clients the same shape.
 */
test('pg timestamps: postgres format is normalized to ISO-8601', () => {
  // the exact string postgres-js returns for `timestamptz`
  assert.equal(toIsoTimestamp('2026-10-25 09:56:34.390166+00'), '2026-10-25T09:56:34.390Z')
  assert.equal(toIsoTimestamp('2026-10-25 09:56:34+00'), '2026-10-25T09:56:34.000Z')
  assert.equal(toIsoTimestamp('2026-10-25 16:56:34.5+07'), '2026-10-25T09:56:34.500Z')
  assert.equal(toIsoTimestamp('2026-10-25 09:56:34.390166+00:00'), '2026-10-25T09:56:34.390Z')

  // already ISO -> untouched (memory engine parity)
  assert.equal(toIsoTimestamp('2026-10-25T09:56:34.390Z'), '2026-10-25T09:56:34.390Z')
  assert.equal(toIsoTimestamp('2026-10-25T09:56:34+07:00'), '2026-10-25T02:56:34.000Z')

  // unparseable input is returned as-is instead of becoming "Invalid Date"
  assert.equal(toIsoTimestamp('not-a-date'), 'not-a-date')
})
