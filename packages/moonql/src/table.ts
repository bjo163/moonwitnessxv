import type { ColumnBuilderBase } from 'drizzle-orm'
import { sql } from 'drizzle-orm'
import {
  boolean,
  index as pgIndex,
  integer,
  pgTable,
  text as pgText,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  type AnyPgTable,
  getTableConfig,
} from 'drizzle-orm/pg-core'
import type { AnyField, FieldsMap } from './fields.js'
import { hasColumn } from './fields.js'

/** camelCase field key -> snake_case column name. */
export const columnName = (key: string) => key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()

/**
 * The one index every model gets. Two code paths create tables — drizzle here,
 * raw DDL in autoSync — and they must land on the same name, or a pushed schema
 * and a synced one disagree about which indexes exist. Hence a shared helper
 * rather than a duplicated template.
 */
export const createdAtIndexName = (model: string): string => `${model}_created_at_idx`

/**
 * Name for a declared composite index. Same reasoning as `createdAtIndexName`:
 * the drizzle layer and the additive-sync layer build the same object on the same
 * database, so the name must come from one function or the two diverge silently.
 */
export const modelledIndexName = (model: string, fields: readonly string[]): string =>
  `${model}_${fields.map(columnName).join('_')}_idx`

/**
 * Does one of this table's unique indexes carry a predicate?
 *
 * A soft-delete model must not let a deleted row reserve a value, and the drizzle
 * path is one of the two places that has to express that (autoSync writes the
 * other). Exported as a yes/no so the parity test can hold both paths to the rule
 * without importing drizzle into an app — see the architecture block in
 * `eslint.config.mjs`.
 */
export function hasPartialUnique(table: AnyPgTable): boolean {
  return getTableConfig(table).indexes.some((index) => index.config.where !== undefined)
}

/**
 * The two fluent modifiers every builder supports. They live on the concrete
 * builder class (typed per column), while `ColumnBuilderBase` — the only type a
 * runtime-chosen builder can share — carries just the config. Narrowing to this
 * view is what lets the switch below stay exhaustive without an `any`.
 */
interface FluentColumn {
  notNull(): FluentColumn
  default(value: unknown): FluentColumn
}

function buildColumn(key: string, f: AnyField): ColumnBuilderBase {
  const name = columnName(key)
  let col: ColumnBuilderBase
  switch (f.kind) {
    case 'str':
      col = f.maxLength ? varchar(name, { length: f.maxLength }) : pgText(name)
      break
    case 'sel': // choices are validated by AJV; stored as free text
    case 'text':
      col = pgText(name)
      break
    case 'int':
      col = integer(name)
      break
    case 'bool':
      col = boolean(name)
      break
    case 'ts':
      col = timestamp(name, { withTimezone: true, mode: 'string' })
      break
    case 'm2o':
      col = uuid(name)
      break
    case 'compute': // stored computed: real column typed by jsonType
      col = f.jsonType === 'number' ? integer(name) : f.jsonType === 'boolean' ? boolean(name) : pgText(name)
      break
    default:
      throw new Error(`moonql: unknown field kind "${f.kind}"`)
  }
  const fluent = col as unknown as FluentColumn
  const nullableOrNot = f.null ? fluent : fluent.notNull()
  const withDefault = f.default === undefined ? nullableOrNot : nullableOrNot.default(f.default)
  return withDefault as unknown as ColumnBuilderBase
}

/**
 * Descriptor -> real drizzle pgTable. Audit columns are injected:
 * uuid id PK + created_at/updated_at with DB default now().
 * All drizzle-generic casts are confined to this file (plus engines/pg).
 */
export function buildTable(name: string, fields: FieldsMap, opts?: { softDelete?: boolean; indexes?: readonly (readonly string[])[] }): AnyPgTable {
  const cols: Record<string, unknown> = {
    id: uuid('id').notNull().primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  }
  if (opts?.softDelete) {
    cols.deletedAt = timestamp('deleted_at', { withTimezone: true, mode: 'string' })
  }
  for (const [key, f] of Object.entries(fields)) {
    if (!hasColumn(f)) continue // o2m + non-stored compute have no column
    cols[key] = buildColumn(key, f)
  }

  const extraFields = Object.entries(fields)
    .filter(([, f]) => (f.index || f.unique) && hasColumn(f))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map(([key, f]) => (t: any) => {
      const col = t[columnName(key)]
      if (!f.unique) return pgIndex(`${name}_${columnName(key)}_idx`).on(col)
      const unique = uniqueIndex(`${name}_${columnName(key)}_uq`).on(col)
      // A soft-deleted row is invisible to every read, so it must not keep
      // occupying a unique slot: without the predicate, deleting a name and
      // re-creating it is a 409 on postgres and a success in memory.
      return opts?.softDelete ? unique.where(sql`deleted_at is null`) : unique
    })

  // The two queries every model receives — `order=-createdAt` and a retention
  // purge on `created_at` — were sequential scans on the hub's largest tables.
  // Making them indexed is a property of the audit column, not of any field, so
  // it is declared here rather than asked of each addon.
  // Columns resolve by descriptor key (`createdAt`), never by the SQL name.
  //
  // drizzle menandai `.on()` dengan tuple kolom berjangka tetap, sedangkan pasangan
  // indeks adalah array runtime: builder-nya dipegang longgar di sini, dan hanya di
  // dua baris yang ditandai.
  const composites = (opts?.indexes ?? []).map(
    (pair) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- proxy tabel drizzle, tidak ada tipe publik
      (t: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- `.on()` bertuple tetap; panjang pasangan runtime
        const index: any = pgIndex(modelledIndexName(name, pair))
        return index.on(...pair.map((key: string) => t[key]))
      },
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extras = [(t: any) => pgIndex(createdAtIndexName(name)).on(t.createdAt), ...composites, ...extraFields]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return pgTable(name, cols as any, (t: any) => extras.map((mk) => mk(t)) as any)
}
