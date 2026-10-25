import type { CreateInput, FieldsMap, PlainRow } from './fields.js'
import type { User } from './addon.js'

/** Which auto-REST operations to expose. All true when `rest: true`. */
export interface RestOps {
  list?: boolean
  get?: boolean
  create?: boolean
  update?: boolean
  remove?: boolean
}
export type RestOp = keyof RestOps

/** 'public' = nobody needed; 'auth' = any logged-in user; string[] = one of those roles. */
export type AclRule = 'public' | 'auth' | string[]

/** Full access spec: role rule + optional row-level predicate (evaluated in the REST layer). */
export interface AclRowSpec {
  roles?: 'auth' | string[]
  row: (user: User, row: Record<string, unknown>) => boolean
}
export type AclSpec = AclRule | AclRowSpec

/**
 * Shared ACL matrices.
 *
 * "Only admins may write this" was re-typed in every addon — and one addon
 * forgot it, which is exactly the mistake a helper exists to prevent.
 */
export const ADMIN_ONLY: AclRule = ['admin']
/** reads stay public, writes need admin (the catalog/fixture shape) */
export const ADMIN_WRITE: Partial<Record<RestOp, AclSpec>> = {
  create: ADMIN_ONLY,
  update: ADMIN_ONLY,
  remove: ADMIN_ONLY,
}
/** nothing readable outside the admin group (audit, jobs, personal data) */
export const ADMIN_FULL: Partial<Record<RestOp, AclSpec>> = {
  list: ADMIN_ONLY,
  get: ADMIN_ONLY,
  ...ADMIN_WRITE,
}

/** Columns every model gets for free — never writable from outside. */
export interface AuditFields {
  id: string
  createdAt: string
  updatedAt: string
}

/**
 * Navigation metadata (the `ir.ui.menu` equivalent): a frontend builds its
 * sidebar from these, so no menu is ever hardcoded in an app.
 */
export interface MenuSpec {
  group?: string
  label?: string
  icon?: string
  order?: number
}

export interface SeedCtx {
  orm: { model(name: string): any }
  env: Record<string, string | undefined>
  log: { info: (obj: unknown, msg: string) => void; warn: (obj: unknown, msg: string) => void }
  /** resolve a '@model[.field]:value' reference to its row id (strict: throws when missing) */
  resolveRef: (ref: string) => Promise<string>
}

export interface DataCtx {
  orm: { model(name: string): any }
  resolveRef: (ref: string) => Promise<string>
}

/**
 * Reference data tier (Odoo base-module style): rows are DIFF-SYNCED on
 * every boot — new ones inserted, changed ones updated, none ever deleted.
 * Matched by a natural unique key; '@ref' strings resolve to row ids.
 */
export interface DataSpec {
  rows: Array<Record<string, unknown>> | ((ctx: DataCtx) => Array<Record<string, unknown>> | Promise<Array<Record<string, unknown>>>)
  /** natural upsert key; must name one declared unique pair (default: the model's first single-column unique) */
  matchBy?: string[]
  /** insert once, never update afterwards (protect local edits of reference rows) */
  noupdate?: boolean
}

/** compiled form held on Model/CompiledModel (matchBy always resolved) */
export interface CompiledData {
  rows: DataSpec['rows']
  matchBy: string[]
  noupdate: boolean
}

export interface ModelDef<F extends FieldsMap> {
  /** Human label used in error messages ("Station not found"). */
  label?: string
  /** Expose auto REST routes under /<model>. Default: false (private model). */
  rest?: boolean | RestOps
  fields: F
  /** Model-level unique constraints, e.g. [['login'], ['name','genre']]. */
  unique?: string[][]
  /**
   * Non-unique composite indexes, e.g. [['stationRef','createdAt']].
   * `ts({index:true})` covers single columns; a time-window chart filters two of
   * them together, and an index on the leading column alone still scans the rest.
   */
  indexes?: string[][]
  /** 'soft' keeps rows on delete (deletedAt stamp) and filters them everywhere. */
  delete?: 'soft' | 'hard'
  /** Rows inserted once at boot when the table is empty (both engines). */
  seed?: Array<Record<string, unknown>> | ((ctx: SeedCtx) => Array<Record<string, unknown>> | Promise<Array<Record<string, unknown>>>)
  /** Reference data diff-synced every boot (see DataSpec). */
  data?: DataSpec
  /** Honest opt-out of the seed policy: this table is legitimately empty (audit/session stores). */
  seedless?: true
  /** Per-operation access rules; default 'public' (unchanged behavior). */
  acl?: Partial<Record<RestOp, AclSpec>>
  /** Upper bound for ?limit on this model's list route. */
  maxLimit?: number
  /** Navigation metadata for metadata-driven frontends. */
  menu?: MenuSpec
}

export interface Model<F extends FieldsMap = FieldsMap> {
  kind: 'model'
  label: string
  rest: boolean | RestOps
  fields: F
  unique: string[][]
  indexes: string[][]
  softDelete: boolean
  seed?: ModelDef<F>['seed']
  data?: CompiledData
  seedless: boolean
  acl: Partial<Record<RestOp, AclSpec>>
  maxLimit: number
  menu?: MenuSpec
  __row?: AuditFields & PlainRow<F>
}

export type AnyModel = Model<any>

const AUDIT_KEYS = ['id', 'createdAt', 'updatedAt']

// A field key becomes a SQL identifier (camelCase is snake-cased, then quoted by
// hand in the additive sync DDL), so it is validated here once instead of being
// trusted downstream.
const FIELD_KEY_RE = /^[a-z][A-Za-z0-9_]*$/

export function defineModel<F extends FieldsMap>(def: ModelDef<F>): Model<F> {
  for (const key of Object.keys(def.fields)) {
    if (!FIELD_KEY_RE.test(key)) {
      throw new Error(`defineModel: field key "${key}" must match ${FIELD_KEY_RE} — it becomes a column name`)
    }
  }
  for (const reserved of AUDIT_KEYS) {
    if (reserved in def.fields) {
      throw new Error(`defineModel: field "${reserved}" is reserved (auto-injected audit column)`)
    }
  }
  for (const pair of [...(def.unique ?? []), ...(def.indexes ?? [])]) {
    for (const key of pair) {
      if (!(key in def.fields) && !AUDIT_KEYS.includes(key)) {
        throw new Error(`defineModel: index constraint references unknown field "${key}"`)
      }
    }
  }
  for (const op of Object.keys(def.acl ?? {})) {
    if (!(op in { list: 1, get: 1, create: 1, update: 1, remove: 1 })) {
      throw new Error(`defineModel: acl has unknown operation "${op}"`)
    }
  }
  // reference data needs a natural key: explicit matchBy or the first single-column unique
  let data: CompiledData | undefined
  if (def.data) {
    const singles = (def.unique ?? []).filter((pair) => pair.length === 1)
    const matchBy = def.data.matchBy
    if (matchBy) {
      if (!(def.unique ?? []).some((pair) => pair.length === matchBy.length && pair.every((k, i) => k === matchBy[i]))) {
        throw new Error(`defineModel: data.matchBy [${matchBy}] must name a declared unique pair`)
      }
    } else if (singles.length === 0) {
      throw new Error('defineModel: data needs a matchBy key or a single-column unique constraint')
    }
    data = { rows: def.data.rows, matchBy: matchBy ?? [singles[0]![0]!], noupdate: def.data.noupdate === true }
  }
  return {
    kind: 'model',
    label: def.label ?? '', // registry fills a sensible default from the model key
    rest: def.rest ?? false,
    fields: def.fields,
    unique: def.unique ?? [],
    indexes: def.indexes ?? [],
    softDelete: def.delete === 'soft',
    seed: def.seed,
    data,
    seedless: def.seedless === true,
    acl: def.acl ?? {},
    maxLimit: def.maxLimit ?? 200,
    menu: def.menu,
  }
}

// ---- type inference helpers ----

export type RowOf<M> = M extends Model<infer F> ? AuditFields & PlainRow<F> : never
export type CreateOf<M> = M extends Model<infer F> ? CreateInput<F> : never
