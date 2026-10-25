import type { MoonEngine, Row } from './engines/engine.js'
import type { CompiledModel } from './registry.js'
import type { DataCtx } from './model.js'
import type { RefResolver } from './refs.js'

type Log = { info: (obj: unknown, msg: string) => void }

const norm = (v: unknown) => (v === undefined ? null : v)
const tupleKey = (row: Row, keys: string[]) => JSON.stringify(keys.map((k) => norm(row[k])))

export interface SyncResult {
  created: number
  updated: number
  unchanged: number
}

/**
 * Reference-tier diff sync (the "complete country list" engine):
 * one pass over existing rows, then insert-new / update-changed only.
 * NEVER deletes (retired codes stay intact for historical data), and only
 * the fields PRESENT in the authored row are managed — extra columns a user
 * set through the API survive re-sync untouched. Hooks/AJV are bypassed on
 * purpose: reference data is authored, not user input (same contract as
 * demo seeding).
 */
export async function syncModelData(
  model: Pick<CompiledModel, 'name' | 'data' | 'softDelete'>,
  engine: MoonEngine,
  ctx: DataCtx,
  resolver: RefResolver,
  log: Log,
): Promise<SyncResult> {
  const spec = model.data
  if (!spec) return { created: 0, updated: 0, unchanged: 0 }

  const raw = typeof spec.rows === 'function' ? await spec.rows(ctx) : spec.rows
  const rows = await resolver.walk(raw, true) // strict: a broken reference row fails the boot

  const existing = await engine.list({ limit: 100_000, offset: 0 })
  const index = new Map<string, Row>()
  for (const row of existing) index.set(tupleKey(row, spec.matchBy), row)

  let created = 0
  let updated = 0
  let unchanged = 0
  for (const row of rows) {
    const key = tupleKey(row, spec.matchBy)
    const prior = index.get(key)
    if (!prior) {
      await engine.insert(row)
      created++
      continue
    }
    if (spec.noupdate) {
      unchanged++
      continue
    }
    const diff: Row = {}
    for (const [field, value] of Object.entries(row)) {
      if (norm(prior[field]) !== norm(value)) diff[field] = value
    }
    if (Object.keys(diff).length > 0) {
      await engine.patch(String(prior.id), diff)
      updated++
    } else unchanged++
  }

  if (created > 0 || updated > 0) {
    log.info({ model: model.name, created, updated, unchanged }, 'moonql: reference data synced')
  } else {
    log.info({ model: model.name, unchanged }, 'moonql: reference data up to date')
  }
  return { created, updated, unchanged }
}
