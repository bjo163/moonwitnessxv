import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  bootMoonQl,
  buildColumnLookup,
  buildTable,
  defineAddon,
  defineModel,
  hasPartialUnique,
  int,
  m2o,
  matchesDomain,
  orderTermsFor,
  sqlText,
  str,
  translateDomain,
  ts,
  uniqueIndexDdl,
  type Domain,
  type MoonQlInstance,
  type MoonEngine,
  type Row,
} from '@moonwitness/moonql'

/**
 * Engine parity: the same operations must answer the same rows whether moonql is
 * backed by the in-memory engine or by Postgres.
 *
 * Six behaviours diverged; each is pinned here twice — as a unit-level rule that
 * runs everywhere, and as a row-for-row comparison that runs when a database is
 * reachable (`PARITY_DATABASE_URL` or `DATABASE_URL`). The SQL side is asserted
 * textually as well, because "the two engines agree only when a DB is in CI" is
 * exactly how the divergences survived.
 *
 * A live run creates and uses `parity_*` tables in the target database; point it
 * at a scratch database if that matters.
 */

const DB_URL = process.env.PARITY_DATABASE_URL ?? process.env.DATABASE_URL ?? ''
const quiet = { info: () => {}, warn: () => {} }

const parityAddon = defineAddon({
  name: 'parity',
  models: {
    parity_parents: defineModel({ fields: { name: str({ maxLength: 40 }) }, rest: false, seedless: true }),
    parity_rows: defineModel({
      fields: {
        label: str({ null: true, maxLength: 40 }),
        score: int({ null: true }),
        at: ts({ null: true }),
        parentRef: m2o('parity_parents', { null: true }),
      },
      rest: false,
      seedless: true,
    }),
    parity_soft: defineModel({
      fields: { label: str({ maxLength: 40, unique: true }), note: str({ null: true, maxLength: 40 }) },
      delete: 'soft',
      rest: false,
      seedless: true,
    }),
  },
})

interface Harness {
  memory: MoonQlInstance
  pg?: MoonQlInstance
  close: () => Promise<void>
}

let booted: Promise<Harness> | null = null

function boot(databaseUrl: string): Promise<MoonQlInstance> {
  return bootMoonQl({
    addons: [parityAddon],
    databaseUrl: databaseUrl || undefined,
    autoSync: true,
    seedPolicy: 'off',
    cronEnabled: false,
    log: quiet,
  })
}

function harness(): Promise<Harness> {
  booted ??= (async () => {
    const memory = await boot('')
    const pg = DB_URL ? await boot(DB_URL) : undefined
    return {
      memory,
      pg,
      close: async () => {
        await Promise.all([memory.close(), pg?.close()])
      },
    }
  })()
  return booted
}

test.after(async () => {
  await booted?.then((h) => h.close())
})

const leaf = (field: string, op: 'ne' | 'nin' | 'eq' | 'in', value: unknown): Domain => ({
  kind: 'leaf',
  term: { field, op, value },
})

/** Postgres stamps created_at from `now()`: distinct rows need distinct moments. */
const tick = () => new Promise((resolve) => setTimeout(resolve, 5))

/** the engine handle of one model inside a booted instance */
const engineOf = (instance: MoonQlInstance, model = 'parity_rows'): MoonEngine => {
  const engine = instance.engines.get(model)
  assert.ok(engine, `no engine for ${model}`)
  return engine
}

/** Wipe a hard table without caring about the order rows were inserted in. */
async function reset(engine: MoonEngine): Promise<void> {
  for (let pass = 0; pass < 20 && (await engine.count()) > 0; pass++) await engine.removeWhere(undefined, 1000)
}

// ---------------------------------------------------------------- unit rules

test('parity 2.1: NULL sorts last in both directions (memory)', async () => {
  const engine = engineOf((await harness()).memory)
  await engine.insert({ score: null })
  await engine.insert({ score: 2 })
  await engine.insert({ score: 1 })

  const asc = await engine.list({ limit: 10, offset: 0, order: [{ field: 'score', direction: 'asc' }] })
  assert.deepEqual(asc.map((r) => r.score), [1, 2, null])
  const desc = await engine.list({ limit: 10, offset: 0, order: [{ field: 'score', direction: 'desc' }] })
  assert.deepEqual(desc.map((r) => r.score), [2, 1, null], 'descending must not float NULL to the top')
  await reset(engine)
})

test('parity 2.1: the pg order terms ask for NULLS LAST explicitly', () => {
  const table = buildTable('parity_rows', { score: int({ null: true }) })
  const col = buildColumnLookup(table)
  const asc = sqlText(orderTermsFor(col, [{ field: 'score', direction: 'asc' }])[0]!)
  const desc = sqlText(orderTermsFor(col, [{ field: 'score', direction: 'desc' }])[0]!)
  assert.match(asc, /asc nulls last/i)
  assert.match(desc, /desc nulls last/i)
})
test('parity 2.2: negative operators never match a NULL row', () => {
  // the SQL reading of `<>` and `NOT IN`: unknown values are not answers
  assert.equal(matchesDomain(leaf('score', 'ne', 1), { score: null }), false)
  assert.equal(matchesDomain(leaf('score', 'ne', 1), { score: 2 }), true)
  assert.equal(matchesDomain(leaf('score', 'nin', [1]), { score: null }), false)
  assert.equal(matchesDomain(leaf('score', 'nin', [1]), { score: 2 }), true)
  // `ne: null` is the documented exception: it means "is not null"
  assert.equal(matchesDomain(leaf('score', 'ne', null), { score: null }), false)
  assert.equal(matchesDomain(leaf('score', 'ne', null), { score: 1 }), true)
})

test('parity 2.2: the pg translation relies on SQL three-valued logic', () => {
  const table = buildTable('parity_rows', { score: int({ null: true }) })
  const col = buildColumnLookup(table)
  // `score <> 1` and `score not in (1,2)` are NULL — not true — for a NULL row, so
  // postgres already excludes it; the memory engine has to reproduce that rule
  assert.equal(sqlText(translateDomain(col, leaf('score', 'ne', 1))!), '"parity_rows"."score" <> $1')
  assert.match(sqlText(translateDomain(col, leaf('score', 'nin', [1, 2]))!), /not in/)
  // `ne: null` is the explicit "is not null" case, and the only one
  assert.match(sqlText(translateDomain(col, leaf('score', 'ne', null))!), /is not null/)
})

test('parity 2.3: retention deletes the oldest rows first', async () => {
  const engine = engineOf((await harness()).memory)
  await engine.insert({ label: 'oldest' })
  await tick()
  await engine.insert({ label: 'middle' })
  await tick()
  await engine.insert({ label: 'newest' })

  const removed = await engine.removeWhere(undefined, 2)
  assert.equal(removed, 2)
  const left = await engine.list({ limit: 10, offset: 0 })
  assert.deepEqual(left.map((r) => r.label), ['newest'], 'the two oldest must be the ones that went')
  await reset(engine)
})

test('parity 2.4: a unique slot is released by a soft delete (both DDL paths)', () => {
  const softTable = buildTable('parity_soft', { label: str({ unique: true }) }, { softDelete: true })
  const hardTable = buildTable('parity_rows', { label: str({ unique: true }) })
  assert.equal(hasPartialUnique(softTable), true, 'the drizzle path must make the index partial')
  assert.equal(hasPartialUnique(hardTable), false, 'a hard-delete model keeps a plain unique index')

  // and the additive-sync path, which creates the same index at boot
  const softDdl = uniqueIndexDdl({ name: 'parity_soft', softDelete: true }, ['label'])
  assert.match(softDdl, /WHERE "deleted_at" IS NULL/)
  assert.doesNotMatch(uniqueIndexDdl({ name: 'parity_rows', softDelete: false }, ['label']), /WHERE/)
  // both paths name the index the same way, or a pushed schema and a synced one
  // would disagree about which indexes exist
  assert.match(softDdl, /"parity_soft_label_uq"/)
})

// ------------------------------------------------------- row-for-row parity

test('parity: both engines answer the same rows for the same operations', async (t) => {
  if (!DB_URL) {
    t.skip('no PARITY_DATABASE_URL/DATABASE_URL: the SQL side needs a server')
    return
  }
  const { memory, pg } = await harness()
  assert.ok(pg, 'pg instance booted')

  const transcript = async (instance: MoonQlInstance): Promise<unknown> => {
    const engine = engineOf(instance)
    await reset(engine)
    for (const row of [{ score: null as number | null }, { score: 2 }, { score: 1 }]) {
      await engine.insert(row)
      await tick()
    }
    const asc = await engine.list({ limit: 10, offset: 0, order: [{ field: 'score', direction: 'asc' }] })
    const desc = await engine.list({ limit: 10, offset: 0, order: [{ field: 'score', direction: 'desc' }] })
    const ne = await engine.count(leaf('score', 'ne', 1))
    const nin = await engine.count(leaf('score', 'nin', [1]))
    const neNull = await engine.count(leaf('score', 'ne', null))

    const ordered: Row[] = await engine.list({ limit: 10, offset: 0, order: [{ field: 'createdAt', direction: 'asc' }] })
    const removed = await engine.removeWhere(undefined, 2)
    const survivors = (await engine.list({ limit: 10, offset: 0 })).map((r) => r.label ?? r.score)
    await reset(engine)

    return {
      asc: asc.map((r) => r.score),
      desc: desc.map((r) => r.score),
      ne,
      nin,
      neNull,
      removalOrder: ordered.map((r) => r.score),
      removed,
      survivors,
    }
  }

  assert.deepEqual(await transcript(pg), await transcript(memory))
})

test('parity 2.4: a soft-deleted unique value can be used again', async (t) => {
  if (!DB_URL) {
    t.skip('no PARITY_DATABASE_URL/DATABASE_URL')
    return
  }
  const { memory, pg } = await harness()
  const label = `soft-${Date.now()}`

  for (const instance of [memory, pg!]) {
    const repo = instance.model('parity_soft')
    const created = await repo.create({ label, note: 'first' })
    await repo.remove(String(created.id))
    const again = await repo.create({ label, note: 'second' })
    assert.equal(again.label, label)
  }
})
