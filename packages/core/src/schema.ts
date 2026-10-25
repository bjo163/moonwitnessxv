/**
 * The metadata contract of the ORM (`GET /_schema`), defined once for the
 * whole monorepo: moonql builds it, the SDK and every frontend consumes it.
 * Plain JSON only — functions, handlers and validators are never part of it.
 */

/** generated/dynamic JSON Schema (kept structurally open: clients read it at runtime) */
export type JsonSchema = Record<string, unknown>

/** one field descriptor as clients see it (drives form/table widget choice) */
export interface FieldMeta {
  kind: string
  required: boolean
  nullable?: boolean
  writeOnly?: boolean
  enum?: string[]
  maxLength?: number
  format?: string
  relation?: { model: string; fk?: string }
  computed?: { stored: boolean }
  /** computed fields: JSON type of the runtime value */
  jsonType?: 'string' | 'number' | 'boolean'
}

/** navigation metadata declared on a model, view or endpoint */
export interface MenuMeta {
  group?: string
  label?: string
  icon?: string
  order?: number
}

export type DataTier = 'reference' | 'runtime' | 'demo' | 'none'

export interface ModelMeta {
  label: string
  addon: string
  route: string
  operations: { list?: boolean; get?: boolean; create?: boolean; update?: boolean; remove?: boolean }
  delete: 'soft' | 'hard'
  unique: string[][]
  maxLimit: number
  dataTier: DataTier
  acl: Record<string, string | string[]>
  fields: Record<string, FieldMeta>
  createSchema: JsonSchema
  updateSchema: JsonSchema
  readSchema: JsonSchema
  menu?: MenuMeta
}

export interface ViewMeta {
  label: string
  addon: string
  from: string
  route: string
  limit: number
  aggregate?: { groupBy: string[]; metrics: string[] }
  /** output keys (kept for Studio + older clients) */
  output: string[]
  readSchema: JsonSchema
  expand?: string[]
  acl: string | string[]
  menu?: MenuMeta
}

export interface EndpointMeta {
  addon: string
  method: string
  path: string
  acl: string | string[]
  stream: boolean
  menu?: MenuMeta
}

/** declared scheduled task — the `run` body never leaves the server */
export interface CronMeta {
  addon: string
  name: string
  every: string | number
}

/** one navigable entry, derived from the entity metadata above */
export interface MenuItem {
  kind: 'model' | 'view' | 'endpoint'
  key: string
  label: string
  group: string
  icon?: string
  order: number
  /** API route (`/stations`, `/nowPlaying`, `/ops/dashboard`) — frontends map it to their own page */
  route: string
  method?: string
  acl: string | string[]
}

export interface SchemaDocument {
  /**
   * Digest of the structural contract (addons, models, views, endpoints, crons,
   * menu). A client generated from an older document can compare this against its
   * own compiled constant and know that the hub moved, instead of failing later on
   * a missing field. Excludes anything volatile (timestamps, row data).
   */
  schemaHash: string
  /** the API version the hub advertises for itself (config.api.version) */
  apiVersion: string
  minDemoRows: number
  addons: { name: string; version: string; depends: string[] }[]
  models: Record<string, ModelMeta>
  views: Record<string, ViewMeta>
  endpoints: EndpointMeta[]
  crons: CronMeta[]
  menu: MenuItem[]
}
