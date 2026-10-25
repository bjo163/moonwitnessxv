import type { AclSpec, MenuSpec } from './model.js'

/**
 * Read-only projection over one model — the "view-driven" unit.
 * Compiled by the registry into a mounted GET /<key> route with its own
 * schema and ACL; writes never exist for a view.
 */
export interface ViewAggregate {
  groupBy: string[] // source field keys
  metrics: Record<string, { fn: 'count' } | { fn: 'sum' | 'avg' | 'min' | 'max'; field: string }>
}

export interface ViewDef {
  label?: string
  /** source model key */
  from: string
  /** alias -> source field; omitted = full readable row of the source */
  select?: Record<string, string>
  /** static domain object, or dynamic resolved per request ({ now }) */
  where?: Record<string, unknown> | ((ctx: { now: Date }) => Record<string, unknown>)
  /** default order over alias (select) or source fields: 'title,-startMin' */
  order?: string
  /** hard cap for this view (default 200) */
  limit?: number
  aggregate?: ViewAggregate
  acl?: AclSpec
  /** mount GET /<key>; default true */
  expose?: boolean
  /**
   * m2o relations joined into the output as `<key>Record` — one request per
   * page, no N+1 in the client. Aggregate views may only expand groupBy keys.
   */
  expand?: string[]
  /** Navigation metadata for metadata-driven frontends. */
  menu?: MenuSpec
}

export interface View {
  kind: 'view'
  label: string
  from: string
  select?: Record<string, string>
  where?: ViewDef['where']
  order?: string
  limit: number
  aggregate?: ViewAggregate
  acl?: AclSpec
  expose: boolean
  expand?: string[]
  menu?: MenuSpec
}

const ALIAS_RE = /^[A-Za-z][A-Za-z0-9]*$/

export function defineView(key: string, def: ViewDef): View {
  if (!ALIAS_RE.test(key)) {
    throw new Error(`defineView: view key "${key}" must match ${ALIAS_RE}`)
  }
  for (const alias of Object.keys(def.select ?? {})) {
    if (!ALIAS_RE.test(alias)) throw new Error(`defineView("${key}"): bad select alias "${alias}"`)
  }
  for (const field of def.expand ?? []) {
    if (!ALIAS_RE.test(field)) throw new Error(`defineView("${key}"): bad expand field "${field}"`)
  }
  if (def.aggregate) {
    if (!def.aggregate.groupBy.length) throw new Error(`defineView("${key}"): aggregate.groupBy must not be empty`)
    for (const alias of Object.keys(def.aggregate.metrics)) {
      if (!ALIAS_RE.test(alias)) throw new Error(`defineView("${key}"): bad metric alias "${alias}"`)
    }
  }
  return {
    kind: 'view',
    label: def.label ?? key,
    from: def.from,
    select: def.select,
    where: def.where,
    order: def.order,
    limit: def.limit ?? 200,
    aggregate: def.aggregate,
    acl: def.acl,
    expose: def.expose ?? true,
    expand: def.expand,
    menu: def.menu,
  }
}
