import { randomUUID } from 'node:crypto'
import type { AnyField, FieldsMap } from '../fields.js'
import { hasColumn } from '../fields.js'
import { matchesDomain } from '../domain.js'
import type { Domain, OrderTerm } from '../domain.js'
import type { AggregateQuery, ListOptions, MoonEngine, Row } from './engine.js'

/**
 * Map-based engine with identical semantics to the pg one:
 * uuid ids, materialized defaults, nullable -> null, auto timestamps,
 * JS domain evaluation. Lets dev, tests and zero-config boot work without
 * any database.
 */
export function createMemoryEngine(fields: FieldsMap, opts?: { softDelete?: boolean }): MoonEngine {
  const rows = new Map<string, Row>()
  const now = () => new Date().toISOString()
  const norm = (v: unknown) => (v === undefined ? null : v)

  const materialize = (data: Row): Row => {
    const row: Row = { id: randomUUID(), createdAt: now(), updatedAt: now() }
    if (opts?.softDelete) row.deletedAt = null
    for (const [key, f] of Object.entries(fields)) {
      if (!hasColumn(f)) continue // o2m + non-stored compute are never stored
      const field = f as AnyField
      const value = data[key]
      if (value !== undefined) row[key] = value
      else if (field.default !== undefined) row[key] = field.default
      else if (field.kind === 'compute' && field.store && field.get) row[key] = field.get(row)
      else if (field.null) row[key] = null
      // required-but-missing values: REST validation (AJV) rejects them before here
    }
    // descriptor-external keys are silently dropped — the schema is the contract
    return row
  }

  // soft-delete filter is implicit, identical to the pg engine
  const alive = (r: Row): boolean => !opts?.softDelete || r.deletedAt === null || r.deletedAt === undefined

  const filter = (where?: Domain): Row[] => [...rows.values()].filter((r) => alive(r) && matchesDomain(where, r))

  const sort = (list: Row[], order?: OrderTerm[]): Row[] => {
    if (!order?.length) return list
    return [...list].sort((a, b) => {
      for (const { field, direction } of order) {
        const av = a[field] ?? null
        const bv = b[field] ?? null
        if (av === bv) continue
        const cmp = av === null ? -1 : bv === null ? 1 : av < bv ? -1 : 1
        return direction === 'desc' ? -cmp : cmp
      }
      return 0
    })
  }

  const visible = (row: Row): Row => {
    const out = { ...row }
    for (const [k, f] of Object.entries(fields)) if (!hasColumn(f)) delete out[k]
    return out
  }

  return {
    async list({ limit, offset, where, order }: ListOptions) {
      return sort(filter(where), order).slice(offset, offset + limit).map(visible)
    },
    async count(where?: Domain) {
      return filter(where).length
    },
    async find(id, where?: Domain) {
      const row = rows.get(id)
      if (!row || !alive(row) || !matchesDomain(where, row)) return null
      return visible(row)
    },
    async insert(data) {
      const row = materialize(data)
      rows.set(row.id as string, row)
      return visible(row)
    },
    async patch(id, data, where?: Domain) {
      const existing = rows.get(id)
      if (!existing || !alive(existing) || !matchesDomain(where, existing)) return null
      for (const [key, value] of Object.entries(data)) {
        if (value === undefined) continue
        const writable = key in fields ? hasColumn(fields[key]!) : opts?.softDelete === true && key === 'deletedAt'
        if (writable) existing[key] = value
      }
      existing.updatedAt = now()
      return visible(existing)
    },
    async drop(id) {
      return rows.delete(id)
    },
    async removeWhere(where?: Domain, limit = 1000) {
      // same soft-delete semantics as drop(): a soft model is stamped, not erased
      const doomed = filter(where).slice(0, limit)
      if (opts?.softDelete) {
        const at = new Date().toISOString()
        for (const r of doomed) r.deletedAt = at
      } else {
        for (const r of doomed) rows.delete(String(r.id))
      }
      return doomed.length
    },
    async aggregate({ groupBy, metrics, where, limit }: AggregateQuery) {
      const groups = new Map<string, { key: Row; rows: Row[] }>()
      for (const r of filter(where)) {
        const parts = groupBy.map((g) => String(norm(r[g])))
        const k = parts.join('\u0000')
        let entry = groups.get(k)
        if (!entry) {
          entry = { key: Object.fromEntries(groupBy.map((g) => [g, norm(r[g])])), rows: [] }
          groups.set(k, entry)
        }
        entry.rows.push(r)
      }
      const out: Row[] = []
      for (const { key, rows: grp } of groups.values()) {
        const row: Row = { ...key }
        for (const m of metrics) {
          const values = m.fn === 'count' ? [] : grp.map((r) => norm(r[columnKeyOf(m.column!)])).filter((v) => v !== null) as number[]
          if (m.fn === 'count') row[m.alias] = grp.length
          else if (m.fn === 'sum') row[m.alias] = values.reduce((a, b) => a + Number(b), 0)
          else if (m.fn === 'avg') row[m.alias] = values.length ? values.reduce((a, b) => a + Number(b), 0) / values.length : null
          else if (m.fn === 'min') row[m.alias] = values.length ? Math.min(...values.map(Number)) : null
          else row[m.alias] = values.length ? Math.max(...values.map(Number)) : null
        }
        out.push(row)
      }
      // Same cap, same groups as the pg engine: order by the group keys, then limit.
      const keyed = out.map((row) => ({ key: groupBy.map((g) => String(row[g] ?? '')).join('\u0000'), row }))
      keyed.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))
      return keyed.slice(0, limit).map((entry) => entry.row)
    },
  }
}

/** snake column name back to the memory row key (camelCase) — audit-safe */
function columnKeyOf(column: string): string {
  return column.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase())
}
