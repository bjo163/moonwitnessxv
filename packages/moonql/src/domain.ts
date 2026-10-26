import { badRequest } from '@moonwitness/core'
import type { AnyField, FieldsMap } from './fields.js'
import { hasColumn } from './fields.js'

/**
 * Engine-agnostic query domain (Odoo-style, but JSON):
 *   ?where={"genre":"lofi","playCount":{"gte":10},"active":{"ne":false}}
 *   ?where={"$or":[{"genre":"lofi"},{"genre":"jazz"}]}
 */
export type Op = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like'

export interface Term {
  field: string
  op: Op
  value: unknown
}

export type Domain =
  | { kind: 'leaf'; term: Term }
  | { kind: 'and'; parts: Domain[] }
  | { kind: 'or'; parts: Domain[] }

export interface OrderTerm {
  field: string
  direction: 'asc' | 'desc'
}

const OPS: readonly Op[] = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'like']

const isOperatorObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v) && Object.keys(v).every((k) => (OPS as string[]).includes(k)) && Object.keys(v).length > 0

function leaf(modelName: string, queryable: FieldsMap, field: string, op: Op, value: unknown): Domain {
  const f = queryable[field]
  if (!f) {
    throw badRequest(`moonql where: unknown field "${field}" on model "${modelName}"`)
  }
  if ((op === 'in' || op === 'nin') && !Array.isArray(value)) {
    throw badRequest(`moonql where: operator "${op}" on "${field}" needs an array value`)
  }
  return { kind: 'leaf', term: { field, op, value } }
}

/** Normalize raw JSON (object form) into a validated Domain AST. */
export function normalizeWhere(queryable: FieldsMap, modelName: string, raw: unknown): Domain | undefined {
  if (raw === undefined || raw === null) return undefined
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    throw badRequest('moonql where: expected a JSON object')
  }
  const parts: Domain[] = []
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (key === '$and' || key === '$or') {
      if (!Array.isArray(value) || value.length === 0) {
        throw badRequest(`moonql where: "${key}" needs a non-empty array`)
      }
      const children = value.map((v) => normalizeWhere(queryable, modelName, v))
      const some = children.filter((c): c is Domain => c !== undefined)
      if (some.length) parts.push({ kind: key === '$and' ? 'and' : 'or', parts: some })
      continue
    }
    if (key.startsWith('$')) throw badRequest(`moonql where: unknown operator "${key}"`)
    if (isOperatorObj(value)) {
      for (const [op, v] of Object.entries(value as Record<string, unknown>)) {
        parts.push(leaf(modelName, queryable, key, op as Op, v))
      }
    } else {
      parts.push(leaf(modelName, queryable, key, 'eq', value))
    }
  }
  if (parts.length === 0) return undefined
  return parts.length === 1 ? parts[0]! : { kind: 'and', parts }
}

export function normalizeOrder(queryable: FieldsMap, modelName: string, raw: unknown): OrderTerm[] | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined
  if (typeof raw !== 'string') throw badRequest('moonql order: expected a comma-separated string')
  return raw.split(',').map((part) => {
    const token = part.trim()
    const direction = token.startsWith('-') ? 'desc' : 'asc'
    const field = token.replace(/^[-+]/, '')
    if (!queryable[field]) {
      throw badRequest(`moonql order: unknown field "${field}" on model "${modelName}"`)
    }
    return { field, direction }
  })
}

/** `undefined` is not a value in a row: it normalises to null, like the pg engine does. */
export const norm = (v: unknown): unknown => (v === undefined ? null : v)

/** JS evaluator for the memory engine (same semantics the pg translation must have). */
export function matchesDomain(domain: Domain | undefined, row: Record<string, unknown>): boolean {
  if (!domain) return true
  switch (domain.kind) {
    case 'and':
      return domain.parts.every((p) => matchesDomain(p, row))
    case 'or':
      return domain.parts.some((p) => matchesDomain(p, row))
    case 'leaf': {
      const { field, op, value } = domain.term
      const v = norm(row[field])
      switch (op) {
        case 'eq':
          return v === norm(value)
        case 'ne':
          // SQL's `<>` never matches a NULL row: `where score <> 1` skips the rows
          // where score is unknown. `ne: null` keeps meaning "is not null" (the pg
          // engine translates it to IS NOT NULL), so it is the one exception.
          return value === null ? v !== null : v !== null && v !== value
        case 'gt':
          return v !== null && value !== null && (v as never as number) > (value as never as number)
        case 'gte':
          return v !== null && value !== null && (v as never as number) >= (value as never as number)
        case 'lt':
          return v !== null && value !== null && (v as never as number) < (value as never as number)
        case 'lte':
          return v !== null && value !== null && (v as never as number) <= (value as never as number)
        case 'in':
          return (value as unknown[]).some((x) => x === v)
        case 'nin':
          // NOT IN over a NULL row is NULL in SQL, i.e. not a match
          return v !== null && !(value as unknown[]).some((x) => x === v)
        case 'like':
          return v !== null && String(v).toLowerCase().includes(String(value).toLowerCase())
      }
    }
  }
}

/**
 * The SQL side of the `like` operator: user text is a *substring*, so the LIKE
 * metacharacters in it must be escaped (otherwise `100%` or `a_b` silently turn
 * into wildcards and the two engines answer differently).
 * Postgres' LIKE default escape character is the backslash, which is what this
 * produces — `matchesDomain` above implements the same rule without SQL.
 */
export function likePattern(value: unknown): string {
  return `%${String(value ?? '').replace(/[\\%_]/g, (c) => `\\${c}`)}%`
}

/** Flatten an AND of EQ terms into a key/value "equality domain" helper for unique checks. */
export function eqDomain(pairs: Record<string, unknown>): Domain {
  const parts: Domain[] = Object.entries(pairs).map(([field, value]) => ({ kind: 'leaf' as const, term: { field, op: 'eq' as const, value } }))
  return parts.length === 1 ? parts[0]! : { kind: 'and', parts }
}

/** synthetic descriptors for the always-queryable audit/system columns */
export function queryableFields(fields: FieldsMap, softDelete: boolean): FieldsMap {
  const marker = (kind: AnyField['kind']): AnyField => ({ kind, null: false, index: false, unique: false, private: false })
  const q: FieldsMap = { ...fields }
  for (const [k, f] of Object.entries(q)) {
    if (!hasColumn(f)) delete q[k] // o2m + non-stored compute are not filterable
  }
  return {
    ...q,
    id: marker('str'),
    createdAt: marker('ts'),
    updatedAt: marker('ts'),
    ...(softDelete ? { deletedAt: marker('ts') } : {}),
  }
}

/** already-normalized AST? (views pass precompiled domains into repos) */
export function isDomain(v: unknown): v is Domain {
  return typeof v === 'object' && v !== null && ('kind' in v)
    && (((v as Domain).kind === 'leaf' || (v as Domain).kind === 'and' || (v as Domain).kind === 'or'))
}
