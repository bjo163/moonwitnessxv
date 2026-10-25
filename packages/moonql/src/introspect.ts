import { createHash } from 'node:crypto'
import type { MenuItem, MenuMeta, SchemaDocument } from '@moonwitness/core'
import type { MoonRegistry, CompiledModel } from './registry.js'
import type { AclSpec } from './model.js'
import { resolveAcl } from './acl.js'
import { MIN_DEMO_ROWS } from './boot.js'

type Json = Record<string, unknown>

/** which default-data tier carries this model (seed policy visibility for clients) */
const dataTier = (m: CompiledModel): 'reference' | 'runtime' | 'demo' | 'none' =>
  m.data ? 'reference' : typeof m.seed === 'function' ? 'runtime' : Array.isArray(m.seed) && m.seed.length > 0 ? 'demo' : 'none'

/** role-only view of an acl spec (row predicates are functions -> never serialized) */
const aclToJson = (spec: AclSpec | undefined): string | string[] | undefined => {
  if (spec === undefined) return undefined
  const { roleRule } = resolveAcl(spec)
  return roleRule
}

function fieldInfo(model: CompiledModel): Json {
  const out: Json = {}
  for (const [key, f] of Object.entries(model.fields)) {
    const info: Json = { kind: f.kind, required: !f.null && f.default === undefined && f.kind !== 'compute' && f.kind !== 'o2m' }
    if (f.null) info.nullable = true
    if (f.private) info.writeOnly = true // never appears in responses
    if (f.choices) info.enum = [...f.choices]
    if (f.maxLength !== undefined) info.maxLength = f.maxLength
    if (f.format !== undefined) info.format = f.format
    if (f.ref) info.relation = { model: f.ref, ...(f.fk ? { fk: f.fk } : {}) }
    if (f.kind === 'compute') {
      info.computed = { stored: f.store === true }
      if (f.jsonType) info.jsonType = f.jsonType
    }
    out[key] = info
  }
  return out
}

/** navigation entry derived from an entity's declared menu spec (null = not navigable) */
function menuOf(
  kind: MenuItem['kind'],
  key: string,
  label: string,
  route: string,
  acl: string | string[],
  spec: MenuMeta | undefined,
  method?: string,
): MenuItem | null {
  if (!spec) return null
  const item: MenuItem = {
    kind,
    key,
    label: spec.label ?? label,
    group: spec.group ?? 'General',
    order: spec.order ?? 100,
    route,
    acl,
  }
  if (spec.icon) item.icon = spec.icon
  if (method) item.method = method
  return item
}

/**
 * Key-sorted JSON: the digest must follow content, not the order a Map happened to
 * be filled in. Without this, a refactor that only changes addon registration order
 * would look like a breaking contract change to every client.
 */
const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableJson(v)}`).join(',')}}`
  }
  return JSON.stringify(value) ?? 'null'
}

export interface SchemaDocumentOptions {
  /** the hub's own advertised version; the document reports it next to its digest */
  apiVersion?: string
}

/**
 * Pure-JSON metadata contract of the whole ORM: addons, models (fields,
 * constraints, acl, create/update/read schemas), views (output shape +
 * declared joins), endpoints (incl. streams) and the derived navigation menu.
 * Functions, handlers and validators are structurally excluded — this is safe
 * to expose to authenticated clients (Studio + Headquarters render from it).
 */
export function buildSchemaDocument(registry: MoonRegistry, options?: SchemaDocumentOptions): SchemaDocument {
  const models: SchemaDocument['models'] = {}
  const views: SchemaDocument['views'] = {}
  const endpoints: SchemaDocument['endpoints'] = []
  const menu: MenuItem[] = []

  for (const m of registry.models.values()) {
    if (m.rest === false) continue // internal models are not advertised
    const ops = m.rest
    // name every CRUD op, even the undeclared ones: a client must not have to
    // guess whether a missing key means "public" or "no route at all"
    // ('none' = the route is not mounted, 'public' = anyone may call it)
    const acl = Object.fromEntries(
      (['list', 'get', 'create', 'update', 'remove'] as const).map((op) => [op, ops[op] ? (aclToJson(m.acl[op]) ?? 'public') : 'none']),
    )
    models[m.name] = {
      label: m.label,
      addon: m.addon,
      route: `/${m.name}`,
      operations: m.rest,
      delete: m.softDelete ? 'soft' : 'hard',
      unique: m.unique,
      maxLimit: m.maxLimit,
      dataTier: dataTier(m),
      acl,
      fields: fieldInfo(m) as SchemaDocument['models'][string]['fields'],
      // exact client-side form generators (plain JSON, functions were never part of them)
      createSchema: m.create,
      updateSchema: m.update,
      readSchema: m.read,
      ...(m.menu ? { menu: m.menu } : {}),
    }
    const item = menuOf('model', m.name, m.label, `/${m.name}`, acl.list ?? 'public', m.menu)
    if (item) menu.push(item)
  }

  for (const v of registry.views.values()) {
    if (!v.expose) continue
    const acl = aclToJson(v.aclSpec) ?? 'public'
    views[v.key] = {
      label: v.label,
      addon: v.addon,
      from: v.from,
      route: `/${v.key}`,
      limit: v.limit,
      ...(v.aggregate ? { aggregate: { groupBy: v.aggregate.groupBy, metrics: v.aggregate.metrics.map((m) => m.alias) } } : {}),
      output: Object.keys((v.read.properties as Json) ?? {}),
      readSchema: v.read,
      ...(v.expand?.length ? { expand: v.expand } : {}),
      acl,
      ...(v.menu ? { menu: v.menu } : {}),
    }
    const item = menuOf('view', v.key, v.label, `/${v.key}`, acl, v.menu)
    if (item) menu.push(item)
  }

  for (const e of registry.endpoints) {
    const acl = (e.def.requires ? aclToJson(e.def.requires) : 'public') ?? 'public'
    endpoints.push({
      addon: e.addon,
      method: e.method,
      path: e.path,
      acl,
      stream: e.def.stream === true,
      ...(e.def.menu ? { menu: e.def.menu } : {}),
    })
    const item = menuOf('endpoint', `${e.method} ${e.path}`, `${e.method} ${e.path}`, e.path, acl, e.def.menu, e.method)
    if (item) menu.push(item)
  }

  menu.sort((a, b) => a.group.localeCompare(b.group) || a.order - b.order || a.label.localeCompare(b.label))

  const content = {
    minDemoRows: MIN_DEMO_ROWS,
    addons: registry.addons.map((a) => ({ name: a.name, version: a.version, depends: a.depends })),
    models,
    views,
    endpoints,
    crons: registry.crons.map((c) => ({ addon: c.addon, name: c.def.name, every: c.def.every })),
    menu,
  }

  return {
    // 16 hex chars is plenty to spot a drift and keeps the value loggable
    schemaHash: createHash('sha256').update(stableJson(content)).digest('hex').slice(0, 16),
    apiVersion: options?.apiVersion ?? '0.0.0',
    ...content,
  }
}
