import type { AnyPgTable } from 'drizzle-orm/pg-core'
import type { CronDef, EndpointDef, AnyAddon, AnyHookBag, HookEvent, UserResolverFactory } from './addon.js'
import type { AnyModel, AclSpec, MenuSpec, RestOp, RestOps } from './model.js'
import type { FieldsMap } from './fields.js'
import { hasColumn } from './fields.js'
import { buildTable, columnName } from './table.js'
import { attachRelations, buildSchemas, buildViewQuery, buildViewRead, type ModelSchemas } from './jsonschema.js'
import { normalizeWhere, queryableFields, type Domain } from './domain.js'
import { looksLikeRefAttempt, parseRef } from './refs.js'
import type { CompiledMetric } from './engines/engine.js'
import type { View } from './view.js'

export interface CompiledModel extends ModelSchemas {
  name: string
  addon: string
  label: string
  fields: FieldsMap
  rest: RestOps | false
  table: AnyPgTable
  model: AnyModel
  /** fields usable in ?where/?order (audit included, virtual excluded) */
  queryable: FieldsMap
  softDelete: boolean
  /** the model's own audit preference, carried into bus payloads */
  audit: boolean
  unique: string[][]
  /** declared non-unique composite indexes (columns that are filtered together) */
  indexes: string[][]
  acl: Partial<Record<RestOp, AclSpec>>
  maxLimit: number
  seed?: AnyModel['seed']
  data?: import('./model.js').CompiledData
  seedless: boolean
  menu?: MenuSpec
}

export interface CompiledView {
  key: string
  addon: string
  label: string
  from: string
  source: CompiledModel
  select?: Record<string, string>
  /** static domain pre-normalized once; dynamic ones re-resolve per request */
  staticWhere?: Domain
  dynamicWhere?: (ctx: { now: Date }) => Domain | undefined
  order?: string
  limit: number
  aggregate?: { groupBy: string[]; metrics: CompiledMetric[] }
  aclSpec?: AclSpec
  read: Record<string, unknown>
  readArray: Record<string, unknown>
  query: Record<string, unknown>
  expose: boolean
  /** m2o joins materialized as `<key>Record` on every output row */
  expand?: string[]
  menu?: MenuSpec
}

export interface CompiledEndpoint {
  addon: string
  path: string
  method: EndpointDef['method']
  def: EndpointDef
  /** body JSON Schema compiled from the endpoint's field descriptors */
  bodySchema?: Record<string, unknown>
}

export interface MoonRegistry {
  /** Addons in dependency order. */
  addons: AnyAddon[]
  models: Map<string, CompiledModel>
  views: Map<string, CompiledView>
  endpoints: CompiledEndpoint[]
  crons: { addon: string; def: CronDef }[]
  /** factories paired with the addon they came from, so `ctx.env` can be scoped */
  resolveUserFactories: { addon: string; factory: UserResolverFactory; env: readonly string[] }[]
  hookFor: (event: HookEvent, modelName: string) => AnyHookBag[HookEvent] | undefined
}

const sentenceCase = (key: string) =>
  key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')

const ALL_OPS: Required<RestOps> = { list: true, get: true, create: true, update: true, remove: true }

function topoSort(addons: AnyAddon[]): AnyAddon[] {
  const byName = new Map<string, AnyAddon>()
  for (const a of addons) {
    if (byName.has(a.name)) throw new Error(`moonql: duplicate addon "${a.name}"`)
    byName.set(a.name, a)
  }
  for (const a of addons) {
    for (const dep of a.depends) {
      if (!byName.has(dep)) {
        throw new Error(`moonql: addon "${a.name}" depends on unknown addon "${dep}"`)
      }
    }
  }
  const sorted: AnyAddon[] = []
  const state = new Map<string, 'visiting' | 'done'>()
  const visit = (a: AnyAddon, trail: string[]) => {
    const s = state.get(a.name)
    if (s === 'done') return
    if (s === 'visiting') {
      throw new Error(`moonql: dependency cycle: ${[...trail, a.name].join(' -> ')}`)
    }
    state.set(a.name, 'visiting')
    for (const dep of a.depends) visit(byName.get(dep)!, [...trail, a.name])
    state.set(a.name, 'done')
    sorted.push(a)
  }
  for (const a of addons) visit(a, [])
  return sorted
}

/**
 * Validate addons, resolve deps, precompute tables/schemas/hooks/endpoints
 * once — synchronously, before any connection exists.
 */
export function installAddons(
  addons: AnyAddon[],
  opts?: { reservedPaths?: string[] },
): MoonRegistry {
  const sorted = topoSort(addons)
  const models = new Map<string, CompiledModel>()

  for (const addon of sorted) {
    for (const [name, model] of Object.entries(addon.models as Record<string, AnyModel>)) {
      if (models.has(name)) {
        throw new Error(
          `moonql: model "${name}" is defined by both addons "${models.get(name)!.addon}" and "${addon.name}"`,
        )
      }
      const rest: RestOps | false =
        model.rest === true ? { ...ALL_OPS } : model.rest === false ? false : { ...ALL_OPS, ...model.rest }
      if (rest && opts?.reservedPaths?.includes(name)) {
        throw new Error(
          `moonql: model "${name}" exposes REST but a handwritten module folder "${name}" already claims that path`,
        )
      }
      models.set(name, {
        name,
        addon: addon.name,
        label: model.label || sentenceCase(name),
        fields: model.fields as FieldsMap,
        rest,
        table: buildTable(name, model.fields as FieldsMap, { softDelete: model.softDelete, indexes: model.indexes }),
        model,
        queryable: queryableFields(model.fields as FieldsMap, model.softDelete),
        softDelete: model.softDelete,
        audit: model.audit,
        unique: model.unique,
        indexes: model.indexes,
        acl: model.acl,
        maxLimit: model.maxLimit,
        seed: model.seed,
        data: model.data,
        seedless: model.seedless,
        menu: model.menu,
        ...buildSchemas(model.fields as FieldsMap, { maxLimit: model.maxLimit }),
      })
    }
  }

  // pass 2: relation properties on read schemas (references base schemas only)
  attachRelations(models)

  // '@ref' pre-validation: malformed references die at compile, not mid-write;
  // targets whose model is not installed stay a runtime concern (standalone addons)
  const checkRowRefs = (modelName: string, rows: Array<Record<string, unknown>> | undefined) => {
    for (const row of rows ?? []) {
      for (const value of Object.values(row)) {
        if (typeof value !== 'string' || !value.startsWith('@')) continue
        const target = parseRef(value)
        if (!target) {
          // '@tags' is a typo while 'tags' is an installed model and must die here;
          // '@witness.id' is a social handle in someone's content and stays data.
          if (looksLikeRefAttempt(value, models)) {
            throw new Error(`moonql: malformed reference "${value}" in ${modelName} — expected @model[.field]:value`)
          }
          continue
        }
        const dest = models.get(target.model)
        if (!dest) continue // resolved (strictly) at boot with a clear "install the addon" error
        const field = target.field ?? dest.unique.find((p) => p.length === 1)?.[0]
        if (!field) throw new Error(`moonql: "${value}" in ${modelName} needs an explicit field (@model.field:value) — "${target.model}" has no single-column unique`)
        if (!dest.queryable[field]) throw new Error(`moonql: "${value}" in ${modelName} targets non-queryable field "${target.model}.${field}"`)
      }
    }
  }
  for (const m of models.values()) {
    if (m.data && Array.isArray(m.data.rows)) checkRowRefs(m.name, m.data.rows)
    if (Array.isArray(m.seed)) checkRowRefs(m.name, m.seed)
  }

  // endpoints: collision-checked, body schemas compiled from descriptors
  const endpoints: CompiledEndpoint[] = []
  const seen = new Set<string>()
  for (const addon of sorted) {
    for (const [name, def] of Object.entries(addon.endpoints)) {
      const path = def.path ?? name
      const key = `${def.method} ${path}`
      if (seen.has(key)) throw new Error(`moonql: duplicate endpoint "${key}"`)
      seen.add(key)
      endpoints.push({
        addon: addon.name,
        path,
        method: def.method,
        def,
        bodySchema: def.body ? buildSchemas(def.body).create : undefined,
      })
    }
  }

  // identity providers: every addon may contribute; boot chains them
  const resolveUserFactories: { addon: string; factory: UserResolverFactory; env: readonly string[] }[] = []
  for (const addon of sorted) {
    for (const factory of addon.provides?.resolveUser ?? []) {
      resolveUserFactories.push({ addon: addon.name, factory, env: addon.env })
    }
  }

  // crons: collected here, armed by boot (registry stays pure/sync)
  const crons: MoonRegistry['crons'] = []
  for (const addon of sorted) {
    for (const def of addon.cron) crons.push({ addon: addon.name, def })
  }

  // views: compiled after models + endpoints so path collisions are detectable
  const views = new Map<string, CompiledView>()
  const compileView = (addonName: string, key: string, view: View) => {
    if (models.has(key)) throw new Error(`moonql: view "${key}" collides with model "${key}"`)
    if (opts?.reservedPaths?.includes(key)) throw new Error(`moonql: view "${key}" collides with handwritten module "${key}"`)
    if (endpoints.some((e) => e.method === 'GET' && e.path === `/${key}`)) {
      throw new Error(`moonql: view "${key}" collides with endpoint GET /${key}`)
    }
    if (views.has(key)) throw new Error(`moonql: duplicate view "${key}"`)
    const source = models.get(view.from)
    if (!source) throw new Error(`moonql: view "${key}" references unknown model "${view.from}"`)
    for (const src of Object.values(view.select ?? {})) {
      if (!source.fields[src] && !source.queryable[src]) {
        throw new Error(`moonql: view "${key}" selects unknown field "${src}" of "${view.from}"`)
      }
    }

    // expand is a declared join: m2o only, groupBy-bounded when aggregating.
    // An absent target model stays a runtime concern (standalone addons), the
    // same tolerance attachRelations applies to relation properties.
    let expand: string[] | undefined
    if (view.expand?.length) {
      expand = view.expand.map((k) => {
        const f = source.fields[k]
        if (!f || f.kind !== 'm2o' || !f.ref) {
          throw new Error(`moonql: view "${key}" expands "${k}" which is not an m2o relation of "${view.from}"`)
        }
        if (view.aggregate && !view.aggregate.groupBy.includes(k)) {
          throw new Error(`moonql: aggregate view "${key}" can only expand its groupBy keys ("${k}")`)
        }
        return k
      })
    }

    let staticWhere: Domain | undefined
    let dynamicWhere: CompiledView['dynamicWhere']
    const resolveRaw = (raw: Record<string, unknown>) => normalizeWhere(source.queryable, source.name, raw)
    if (typeof view.where === 'function') {
      const fn = view.where
      dynamicWhere = (ctx) => resolveRaw(fn(ctx))
    } else if (view.where) {
      staticWhere = resolveRaw(view.where)
    }

    let aggregate: CompiledView['aggregate']
    if (view.aggregate) {
      for (const g of view.aggregate.groupBy) {
        if (!source.queryable[g] || !hasColumn(source.queryable[g]!)) {
          throw new Error(`moonql: view "${key}" groupBy "${g}" is not a column of "${view.from}"`)
        }
      }
      const metrics: CompiledMetric[] = Object.entries(view.aggregate.metrics).map(([alias, m]) => {
        if (m.fn !== 'count') {
          if (!source.queryable[m.field] || !hasColumn(source.queryable[m.field]!)) {
            throw new Error(`moonql: view "${key}" metric field "${m.field}" is not a column of "${view.from}"`)
          }
          return { alias, fn: m.fn, column: columnName(m.field) }
        }
        return { alias, fn: m.fn as 'count' }
      })
      aggregate = { groupBy: view.aggregate.groupBy, metrics }
    }

    const read = buildViewRead(source, { select: view.select, aggregate: view.aggregate, expand }, models)
    views.set(key, {
      key,
      addon: addonName,
      label: view.label,
      from: view.from,
      source,
      select: view.select,
      staticWhere,
      dynamicWhere,
      order: view.order,
      limit: view.limit,
      aggregate,
      aclSpec: view.acl,
      read,
      readArray: { type: 'array', items: read },
      query: buildViewQuery(view.limit),
      expose: view.expose,
      expand,
      menu: view.menu,
    })
  }
  for (const addon of sorted) {
    for (const [key, view] of Object.entries(addon.views)) {
      compileView(addon.name, key, view)
    }
  }

  const hookOwner = new Map<string, AnyHookBag>()
  for (const m of models.values()) {
    const bags = sorted.find((a) => a.name === m.addon)!.hooks as Record<string, AnyHookBag | undefined>
    hookOwner.set(m.name, bags[m.name] ?? {})
  }

  const registry: MoonRegistry = {
    addons: sorted,
    models,
    views,
    endpoints,
    crons,
    resolveUserFactories,
    hookFor: (event: HookEvent, modelName: string) => hookOwner.get(modelName)?.[event],
  }
  return registry
}
