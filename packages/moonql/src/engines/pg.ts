import { randomUUID } from 'node:crypto'
import { and, asc, desc, eq, gt, gte, inArray, isNotNull, isNull, lt, lte, ne, notInArray, or, sql } from 'drizzle-orm'
import type { AnyPgTable } from 'drizzle-orm/pg-core'
import type { AnyField, FieldsMap } from '../fields.js'
import { hasColumn } from '../fields.js'
import { columnName } from '../table.js'
import type { Domain, OrderTerm } from '../domain.js'
import { likePattern } from '../domain.js'
import type { MoonQl } from '../client.js'
import type { AggregateQuery, ListOptions, MoonEngine, Row } from './engine.js'

const stripUndefined = (obj: Row): Row =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined))

/**
 * drizzle exposes table columns by DESCRIPTOR KEY (`startMin`), while domains
 * and compiled aggregate metrics may carry the snake_case column name
 * (`start_min`). One lookup resolves both conventions; resolving only the
 * snake name silently renders an empty SQL expression (`... and  <= $2`).
 */
export function buildColumnLookup(table: AnyPgTable): (key: string) => unknown {
  const columns = new Map<string, unknown>()
  for (const [key, value] of Object.entries(table as unknown as Record<string, unknown>)) {
    if (key.startsWith('_') || key === 'enableRLS') continue
    columns.set(key, value)
    const snake = columnName(key)
    if (snake !== key) columns.set(snake, value)
  }
  return (key: string) => columns.get(key)
}

/**
 * postgres-js returns timestamptz as `2026-10-25 09:56:34.390166+00` (space
 * separator, `+00` offset). The ORM contract — and the memory engine — is
 * ISO-8601 (`2026-10-25T09:56:34.390Z`), so rows are normalized on the way out
 * and both engines stay byte-compatible for clients and string comparisons.
 */
export function toIsoTimestamp(value: string): string {
  if (value.includes('T') && value.endsWith('Z')) return value
  // Date.parse needs a colon in the offset: `+00` -> `+00:00`
  const canonical = value.replace(' ', 'T').replace(/([+-]\d{2})$/, '$1:00')
  const parsed = Date.parse(canonical)
  return Number.isNaN(parsed) ? value : new Date(parsed).toISOString()
}

/**
 * Postgres engine: descriptor-built drizzle table + postgres-js pool.
 * The domain AST becomes real SQL (WHERE/ORDER BY/COUNT), not post-processing.
 * All casts stay confined inside this file.
 */
export function createPgEngine(
  db: MoonQl['db'],
  table: AnyPgTable,
  fields: FieldsMap,
  opts?: { softDelete?: boolean },
): MoonEngine {
  const t = table as unknown as Record<string, unknown> & { id: unknown }
  const lookup = buildColumnLookup(table)
  const col = (key: string): any => lookup(key)

  // every timestamp the read contract exposes (audit columns + ts fields)
  const timeKeys = new Set(['createdAt', 'updatedAt', 'deletedAt'])
  for (const [key, field] of Object.entries(fields)) if (field.kind === 'ts') timeKeys.add(key)

  const isoRow = (row: Row): Row => {
    let out: Row | undefined
    for (const key of timeKeys) {
      const value = row[key]
      if (typeof value !== 'string') continue
      const iso = toIsoTimestamp(value)
      if (iso === value) continue
      out ??= { ...row }
      out[key] = iso
    }
    return out ?? row
  }

  function translate(domain: Domain): any {
    switch (domain.kind) {
      case 'and': {
        const conds = domain.parts.map(translate).filter(Boolean)
        return conds.length ? and(...conds) : undefined
      }
      case 'or': {
        const conds = domain.parts.map(translate).filter(Boolean)
        return conds.length ? or(...conds) : undefined
      }
      case 'leaf': {
        const { field, op, value } = domain.term
        const c = col(field)
        switch (op) {
          case 'eq':
            return value === null || value === undefined ? isNull(c) : eq(c, value)
          case 'ne':
            return value === null || value === undefined ? isNotNull(c) : ne(c, value)
          case 'gt':
            return gt(c, value)
          case 'gte':
            return gte(c, value)
          case 'lt':
            return lt(c, value)
          case 'lte':
            return lte(c, value)
          case 'in':
            return inArray(c, value as unknown[])
          case 'nin':
            return notInArray(c, value as unknown[])
          case 'like':
            // substring search: metacharacters in user input stay literals
            return sql`${c} ilike ${likePattern(value)}`
        }
      }
    }
  }

  const where = (domain?: Domain): any => {
    const parts: any[] = []
    if (domain) parts.push(translate(domain))
    if (opts?.softDelete) parts.push(isNull(t.deletedAt as never)) // implicit everywhere
    if (!parts.length) return undefined
    const cond = parts.length === 1 ? parts[0] : and(...parts)
    return cond ?? undefined
  }

  const withDefaults = (data: Row): Row => {
    const values: Row = { id: randomUUID() }
    for (const [key, f] of Object.entries(fields)) {
      if (!hasColumn(f)) continue
      const field = f as AnyField
      if (data[key] !== undefined) values[key] = data[key]
      else if (field.default !== undefined) values[key] = field.default
      else if (field.kind === 'compute' && field.store && field.get) values[key] = field.get(values)
    }
    return values
  }

  const orderTerms = (order?: OrderTerm[]) =>
    order?.map(({ field, direction }) => (direction === 'desc' ? desc(col(field)) : asc(col(field))))

  return {
    async list({ limit, offset, where: w, order }: ListOptions) {
      const q = where(w)
      const base = q ? db.select().from(table).where(q) : db.select().from(table)
      const ordered = order?.length ? (base as any).orderBy(...(orderTerms(order) as any[])) : base
      const rows = (await (ordered as any).limit(limit).offset(offset)) as Row[]
      return rows.map(isoRow)
    },
    async count(w?: Domain) {
      const q = where(w)
      const base = q
        ? db.select({ n: sql<number>`count(*)::int` }).from(table).where(q)
        : db.select({ n: sql<number>`count(*)::int` }).from(table)
      const rows = (await base) as { n: number | string }[]
      return Number(rows[0]?.n ?? 0)
    },
    async find(id, w?: Domain) {
      const q = where(w)
      const found = (await db
        .select()
        .from(table)
        .where(q ? (and(eq(t.id as never, id), q) as never) : (eq(t.id as never, id) as never))) as Row[]
      return found[0] ? isoRow(found[0]) : null
    },
    async insert(data) {
      const created = (await db
        .insert(table)
        .values(stripUndefined(withDefaults(data)) as never)
        .returning()) as Row[]
      return isoRow(created[0] as Row)
    },
    async patch(id, data, w?: Domain) {
      const clean: Row = { ...stripUndefined(data), updatedAt: new Date().toISOString() }
      for (const key of Object.keys(clean)) {
        const writable =
          key === 'updatedAt' || (opts?.softDelete === true && key === 'deletedAt') || (key in fields && hasColumn(fields[key]!))
        if (!writable) delete clean[key]
      }
      const q = where(w)
      const updated = (await db
        .update(table)
        .set(clean as never)
        .where(q ? (and(eq(t.id as never, id), q) as never) : (eq(t.id as never, id) as never))
        .returning()) as Row[]
      return updated[0] ? isoRow(updated[0]) : null
    },
    async drop(id) {
      const deleted = await db.delete(table).where(eq(t.id as never, id)).returning({ id: t.id as never })
      return deleted.length > 0
    },
    async removeWhere(w?: Domain, limit = 1000) {
      // pick the ids first (bounded), then delete them in one statement: a soft
      // model is stamped instead of erased, exactly like drop()
      const q = where(w)
      const pickedSelect = q
        ? (db.select({ id: t.id as never }).from(table).where(q) as unknown as { limit: (n: number) => Promise<{ id: string }[]> })
        : (db.select({ id: t.id as never }).from(table) as unknown as { limit: (n: number) => Promise<{ id: string }[]> })
      const picked = await pickedSelect.limit(limit)
      if (!picked.length) return 0
      const ids = picked.map((row) => row.id)
      if (opts?.softDelete) {
        await db
          .update(table)
          .set({ deletedAt: new Date().toISOString() } as never)
          .where(inArray(t.id as never, ids))
      } else {
        await db.delete(table).where(inArray(t.id as never, ids))
      }
      return ids.length
    },
    async aggregate({ groupBy, metrics, where: w, limit }: AggregateQuery) {
      // identifiers come prevalidated from the registry (columnName + alias regex)
      const selection: Record<string, never> = {} as never
      const groupSql: unknown[] = []
      for (const g of groupBy) {
        const c = col(g)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(selection as any)[g] = sql`${c}`
        groupSql.push(c)
      }
      for (const m of metrics) {
        const expr =
          m.fn === 'count' ? sql`count(*)::int`
          : m.fn === 'sum' ? sql`coalesce(sum(${col(m.column!)}), 0)::float8`
          : m.fn === 'avg' ? sql`avg(${col(m.column!)})::float8`
          : m.fn === 'min' ? sql`min(${col(m.column!)})`
          : sql`max(${col(m.column!)})`
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(selection as any)[m.alias] = expr
      }
      const q = where(w)
      const base = q
        ? (db.select(selection as never).from(table).where(q) as unknown as { groupBy: (...c: unknown[]) => unknown })
        : (db.select(selection as never).from(table) as unknown as { groupBy: (...c: unknown[]) => unknown })
      // The cap has to land on the same groups in both engines: order by the
      // group keys before limiting (an unordered GROUP BY LIMIT is engine-random).
      type GroupedQuery = {
        orderBy: (...c: unknown[]) => GroupedQuery
        limit: (n: number) => Promise<Row[]>
      }
      const grouped = (base.groupBy as (...c: unknown[]) => GroupedQuery)(...groupSql)
      const ordered = groupSql.length ? grouped.orderBy(...groupSql) : grouped
      const rows = await ordered.limit(limit)
      // numeric parity: pg hands back strings for numeric aggregates and NULL
      // for avg/min/max over an empty group — the memory engine answers
      // number | null, so both are mapped the same way here.
      return rows.map((r) => {
        const out = { ...r }
        for (const m of metrics) {
          if (m.fn === 'count') continue
          const value = out[m.alias]
          out[m.alias] = value === null || value === undefined ? null : Number(value)
        }
        return isoRow(out)
      })
    },
  }
}
