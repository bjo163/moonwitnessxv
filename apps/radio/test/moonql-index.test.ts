import { test } from 'node:test'
import assert from 'node:assert/strict'
import { autoSync, buildTable, createdAtIndexName, modelledIndexName, int, str, type MoonRegistry } from '@moonwitness/moonql'

/**
 * The audit index is the one index every model gets, because the two queries that
 * touch every table — `order=-createdAt` and a retention purge — both run on it.
 * Two code paths create tables (drizzle in `buildTable`, raw DDL in `autoSync`),
 * so the name is a single helper: if the two ever disagree, a pushed schema and a
 * synced one end up with different indexes and nobody notices until a purge is slow.
 */

const fields = { title: str({ maxLength: 20 }), n: int({ null: true }) }
const quiet = { info: () => {}, warn: () => {} }
const registry = {
  models: new Map([['probe', { name: 'probe', fields, unique: [], indexes: [['title', 'n']], softDelete: false }]]),
} as unknown as MoonRegistry

/** collect the DDL a stand-in client was handed */
function recordingClient(rows: { table_name: string; column_name?: string }[]) {
  const statements: string[] = []
  const client = Object.assign(
    (strings: unknown) => {
      const sql = String(strings)
      statements.push(sql)
      return Promise.resolve(sql.includes('column_name') ? rows : rows.map((r) => ({ table_name: r.table_name })).filter((r, i, all) => all.findIndex((x) => x.table_name === r.table_name) === i))
    },
    { unsafe: (sql: string) => { statements.push(sql); return Promise.resolve([]) } },
  )
  return { client, statements }
}

test('autoSync: an existing table still gets the audit index', async () => {
  // the metadata reads report the table and both audit columns as already present,
  // so the only DDL that may be issued is index work — precisely what this guards
  const { client, statements } = recordingClient([
    { table_name: 'probe', column_name: 'created_at' },
    { table_name: 'probe', column_name: 'updated_at' },
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await autoSync(client as any, registry, quiet)

  assert.deepEqual(
    statements.filter((sql) => sql.includes('CREATE INDEX')),
    [
      `CREATE INDEX IF NOT EXISTS "${createdAtIndexName('probe')}" ON "probe" ("created_at")`,
      `CREATE INDEX IF NOT EXISTS "${modelledIndexName('probe', ['title', 'n'])}" ON "probe" ("title", "n")`,
    ],
  )
})

test('autoSync: a brand new table gets the index in the same pass', async () => {
  const { client, statements } = recordingClient([]) // nothing exists yet

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await autoSync(client as any, registry, quiet)

  assert.ok(statements.some((sql) => sql.startsWith('CREATE TABLE IF NOT EXISTS "probe"')), 'the table is created')
  // ...and the index is not skipped because the table was new: the loop is shared
  assert.ok(statements.some((sql) => sql.includes(createdAtIndexName('probe'))), 'the audit index follows the create')
  assert.ok(statements.some((sql) => sql.includes(modelledIndexName('probe', ['title', 'n']))), 'and so does the declared one')
})

test('buildTable: the audit column is reachable by its descriptor key', () => {
  // The index is declared `on(t.createdAt)`; drizzle resolves extras by descriptor
  // key, so a table that builds without throwing is the assertion that holds here.
  const table = buildTable('probe', fields, { indexes: [['title', 'n']] })
  const columns = (table as unknown as Record<symbol, Record<string, unknown>>)[Symbol.for('drizzle:Columns')]
  assert.ok(columns.createdAt, 'createdAt must exist as a descriptor key')
  assert.equal(createdAtIndexName('probe'), 'probe_created_at_idx')
  // one name template shared with autoSync, snake-cased like every other column
  assert.equal(modelledIndexName('probe', ['stationRef', 'createdAt']), 'probe_station_ref_created_at_idx')
})
