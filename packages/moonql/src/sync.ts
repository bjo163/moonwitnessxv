import type { Sql } from 'postgres'
import type { AnyField, FieldKind, FieldsMap } from './fields.js'
import { hasColumn } from './fields.js'
import type { MoonRegistry } from './registry.js'
import { columnName, createdAtIndexName, modelledIndexName } from './table.js'

type Log = { info: (obj: unknown, msg: string) => void; warn: (obj: unknown, msg: string) => void }

const pgType = (f: AnyField): string => {
  switch (f.kind as FieldKind) {
    case 'str':
      return f.maxLength ? `varchar(${f.maxLength})` : 'text'
    case 'sel':
      // a choice list is plain text here AND in buildColumn (table.ts) — the two
      // layers used to disagree about varchar(maxLength), which no sel option has
      return 'text'
    case 'text':
      return 'text'
    case 'int':
      return 'integer'
    case 'bool':
      return 'boolean'
    case 'ts':
      return 'timestamptz'
    case 'm2o':
      return 'uuid'
    case 'compute':
      return f.jsonType === 'number' ? 'integer' : f.jsonType === 'boolean' ? 'boolean' : 'text'
    default:
      throw new Error(`moonql autoSync: unsupported field kind "${f.kind}"`)
  }
}

const literal = (v: unknown): string => {
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`
  throw new Error(`moonql autoSync: unsupported default value ${String(v)}`)
}

/** Column definition; when `safeAdd` is set (ALTER on a possibly-populated table),
 *  a NOT NULL column without a default is added as nullable instead. */
function columnDdl(key: string, f: AnyField, safeAdd = false): string {
  const parts = [`"${columnName(key)}" ${pgType(f)}`]
  // An explicit default always wins. A NOT NULL ts column gets now() because it
  // must be fillable when added to a populated table; a nullable one gets no
  // default, so both engines store null (pg used to silently stamp a timestamp
  // where the memory engine kept null — same row, two answers).
  const def = f.default !== undefined ? literal(f.default) : f.kind === 'ts' && !f.null ? 'now()' : undefined
  if (!f.null && !(safeAdd && def === undefined)) parts.push('NOT NULL')
  if (def) parts.push(`DEFAULT ${def}`)
  return parts.join(' ')
}

/**
 * Additive schema sync — the Odoo-style dev loop: new addon tables get
 * CREATE TABLE, new fields get ADD COLUMN. It NEVER drops or alters types;
 * destructive changes stay a deliberate `db:push` / migration decision.
 */
export async function autoSync(client: Sql, registry: MoonRegistry, log: Log): Promise<void> {
  const tableRows = (await client`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`) as {
    table_name: string
  }[]
  const tables = new Set(tableRows.map((r) => r.table_name))
  const colRows = (await client`SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public'`) as {
    table_name: string
    column_name: string
  }[]
  const columns = new Map<string, Set<string>>()
  for (const r of colRows) {
    if (!columns.has(r.table_name)) columns.set(r.table_name, new Set())
    columns.get(r.table_name)!.add(r.column_name)
  }

  for (const model of registry.models.values()) {
    const fields: FieldsMap = model.fields
    if (!tables.has(model.name)) {
      const cols = [
        '"id" uuid NOT NULL PRIMARY KEY',
        ...(model.softDelete ? ['"deleted_at" timestamptz'] : []),
        ...Object.entries(fields)
          .filter(([, f]) => hasColumn(f as AnyField))
          .map(([k, f]) => columnDdl(k, f as AnyField)),
        '"created_at" timestamptz NOT NULL DEFAULT now()',
        '"updated_at" timestamptz NOT NULL DEFAULT now()',
      ].join(', ')
      await client.unsafe(`CREATE TABLE IF NOT EXISTS "${model.name}" (${cols})`)
      log.info({ model: model.name }, `moonql autoSync: created table "${model.name}"`)
    } else {
      const existing = columns.get(model.name)!
      for (const [key, f] of Object.entries(fields)) {
        const field = f as AnyField
        if (!hasColumn(field)) continue
        const col = columnName(key)
        if (existing.has(col)) continue
        const safe = columnDdl(key, field, true)
        await client.unsafe(`ALTER TABLE "${model.name}" ADD COLUMN IF NOT EXISTS ${safe}`)
        log.info({ model: model.name, column: col }, `moonql autoSync: added column "${col}"`)
        if (!field.null && field.default === undefined && field.kind !== 'ts') {
          log.warn(
            { model: model.name, column: col },
            `moonql autoSync: NOT NULL not enforced on populated table (added nullable); use db:push to finalize`,
          )
        }
      }
    }

    // indexes: field flags + model-level unique pairs (additive, idempotent)
    // The audit index mirrors buildTable(): newest-first reads and retention
    // purges touch created_at on every model, so it is never a field decision.
    await client.unsafe(
      `CREATE INDEX IF NOT EXISTS "${createdAtIndexName(model.name)}" ON "${model.name}" ("created_at")`,
    )
    for (const [key, f] of Object.entries(model.fields)) {
      const field = f as AnyField
      if (!hasColumn(field)) continue
      if (field.index) {
        await client.unsafe(`CREATE INDEX IF NOT EXISTS "${model.name}_${columnName(key)}_idx" ON "${model.name}" ("${columnName(key)}")`)
      }
      if (field.unique) {
        await client.unsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "${model.name}_${columnName(key)}_uq" ON "${model.name}" ("${columnName(key)}")`)
      }
    }
    for (const pair of model.unique) {
      const cols = pair.map((p) => `"${columnName(p)}"`).join(', ')
      await client.unsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "${model.name}_${pair.map(columnName).join('_')}_uq" ON "${model.name}" (${cols})`)
    }
    // composite indexes declared on the model: same names as buildTable() so a
    // pushed schema and a synced one agree
    for (const pair of model.indexes) {
      const cols = pair.map((p) => `"${columnName(p)}"`).join(', ')
      await client.unsafe(`CREATE INDEX IF NOT EXISTS "${modelledIndexName(model.name, pair)}" ON "${model.name}" (${cols})`)
    }
  }
}
