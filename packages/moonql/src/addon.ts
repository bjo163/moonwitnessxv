import type { AnyModel, AclSpec, CreateOf, MenuSpec, Model, RowOf } from './model.js'
import type { FieldsMap } from './fields.js'
import type { View } from './view.js'
import type { MoonBus } from './bus.js'
import type { SchemaDocument } from '@moonwitness/core'

export type HookEvent =
  | 'beforeCreate'
  | 'afterCreate'
  | 'beforeUpdate'
  | 'afterUpdate'
  | 'beforeDelete'
  | 'afterDelete'

/** before* may mutate the payload and return it; after* are fire-and-forget. */
export interface ModelHooks<M extends AnyModel> {
  beforeCreate?: (row: CreateOf<M>) => CreateOf<M> | Promise<CreateOf<M>>
  afterCreate?: (row: RowOf<M>) => void | Promise<void>
  beforeUpdate?: (patch: Partial<RowOf<M>>) => Partial<RowOf<M>> | Promise<Partial<RowOf<M>>>
  afterUpdate?: (row: RowOf<M>) => void | Promise<void>
  beforeDelete?: (row: RowOf<M>) => void | Promise<void>
  afterDelete?: (id: string) => void | Promise<void>
}

export type HooksMap<M extends Record<string, Model>> = {
  [K in keyof M]?: ModelHooks<M[K]>
}

/** Runtime-erased hook bag the repository actually calls. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- setiap event hook punya bentuk argumen berbeda; repository memanggilnya lewat seam ini dan sudah melakukan cast di sisi panggil
export type AnyHookBag = Partial<Record<HookEvent, (row: any, ...rest: any[]) => any>>

// ---- identity & custom endpoints (framework-free extension points) ----

export interface User {
  id: string
  roles: string[]
  /** resolver-private data (e.g. the bearer token) so handlers can revoke it */
  meta?: Record<string, unknown>
}

export interface RequestLike {
  headers: Record<string, string | string[] | undefined>
}

export type UserResolver = (request: RequestLike) => User | null | Promise<User | null>
export type UserResolverFactory = (ctx: ProvideCtx) => UserResolver

export interface ProvideCtx {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- seam erasure: addon menamai model saat runtime, bukan saat compile
  orm: { model(name: string): any }
  env: Record<string, string | undefined>
  log: { info: (obj: unknown, msg: string) => void; warn: (obj: unknown, msg: string) => void }
  /**
   * The instance bus. A provider may need it to keep its own state honest: an
   * identity cache, for example, must drop a session the moment the row is
   * deleted, and the bus is the only place that says so.
   */
  bus: MoonBus
}

export interface EndpointCtx {
  body: Record<string, unknown>
  query: Record<string, unknown>
  params: Record<string, string>
  /** resolved identity for this request (enforced against `requires`) */
  user: User | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- seam erasure yang sama dengan ProvideCtx
  orm: { model(name: string): any }
  env: Record<string, string | undefined>
  /** set the response status before returning */
  status(code: number): void
  /** instance event bus (reactions to writes / streaming endpoints) */
  bus: MoonBus
  /** which engine this instance booted with */
  engine: 'pg' | 'memory'
  /** the live metadata document, built once per instance and cached */
  schema(): SchemaDocument
  /** aborts when the client disconnects (streams use it to leave their loop) */
  signal: AbortSignal
}

export interface EndpointDef {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** mount path; defaults to the endpoints-map key (multiple methods on one path need distinct keys + this field) */
  path?: string
  /** field descriptors — compiled to a body JSON Schema exactly like models */
  body?: FieldsMap
  requires?: AclSpec
  handler: (ctx: EndpointCtx) => unknown | Promise<unknown>
  /**
   * Server-sent events: the handler returns an AsyncIterable and the route
   * streams every item as one SSE `data:` frame (framing + heartbeats are
   * the framework's job).
   */
  stream?: true
  /** Navigation metadata for metadata-driven frontends. */
  menu?: MenuSpec
}

/**
 * What a cron receives: the boot context plus the time it may spend.
 *
 * The budget is 80% of the declared interval, handed down by the runner rather
 * than guessed by each addon: a job that walks a table and calls the network has
 * to stop on its own terms, because the runner skips any tick that overlaps the
 * previous run — an overrunning job silences itself permanently.
 */
export interface CronCtx extends ProvideCtx {
  budgetMs: number
}

/** Declarative scheduled task, started at boot, stopped on instance.close(). */
export interface CronDef {
  name: string
  /** '100ms' | '30s' | '5m' | '1h' | '1d' or raw milliseconds (100ms floor, ≤ ~24 days) */
  every: string | number
  /**
   * Also run once immediately after boot (on the next tick, so it cannot delay
   * startup). For idempotent repair/retention jobs — otherwise every restart
   * repeats the work.
   */
  startImmediately?: boolean
  run: (ctx: CronCtx) => unknown | Promise<unknown>
}

export interface AddonDef<M extends Record<string, Model>> {
  name: string
  version?: string
  /** Names of addons this one requires (installed first). */
  depends?: string[]
  /**
   * The environment names this addon may read through `ctx.env`.
   *
   * Omitted means none: the hub's allow-list says which names are *available to
   * addons at all*, and this says which of them belong to this one. Without it the
   * admin password of the auth addon was readable by every plugin, which is exactly
   * what the comment above `ctx.env` promised it was not.
   */
  env?: readonly string[]
  models: M
  hooks?: HooksMap<M>
  /** Read-only projections mounted by moonql (defineView). */
  views?: Record<string, View>
  /** Declarative custom routes, e.g. '/auth/login'. */
  endpoints?: Record<string, EndpointDef>
  /** Declarative scheduled tasks. */
  cron?: CronDef[]
  /** Contribute framework services; every provider is chained (first match wins). */
  provides?: {
    resolveUser?: UserResolverFactory | UserResolverFactory[]
  }
  /**
   * React to ANY model write (audit, metrics, webhooks) without touching the
   * owning addon. Called once at boot, before crons are armed.
   */
  observe?: (bus: MoonBus, ctx: ProvideCtx) => void | Promise<void>
}

export interface Addon<M extends Record<string, Model> = Record<string, Model>> {
  kind: 'addon'
  name: string
  version: string
  depends: string[]
  env: readonly string[]
  models: M
  hooks: HooksMap<M>
  views: Record<string, View>
  endpoints: Record<string, EndpointDef>
  cron: CronDef[]
  provides: { resolveUser?: UserResolverFactory[] }
  observe?: (bus: MoonBus, ctx: ProvideCtx) => void | Promise<void>
}

/** Any addon, with its model map widened: the registry holds them by runtime name. */
export type AnyAddon = Addon

/**
 * The slice of the hub's environment an addon is allowed to see: names it declared,
 * restricted to what the hub put in `ctx.env` at all. A name the hub does not expose
 * stays absent even when an addon asks for it.
 */
export function pickAddonEnv(
  available: Record<string, string | undefined>,
  declared: readonly string[] = [],
): Record<string, string | undefined> {
  return Object.fromEntries(declared.filter((key) => key in available).map((key) => [key, available[key]]))
}

const NAME_RE = /^[a-z][a-z0-9_]*$/

export function defineAddon<M extends Record<string, Model>>(def: AddonDef<M>): Addon<M> {
  if (!NAME_RE.test(def.name)) {
    throw new Error(`defineAddon: name "${def.name}" must match ${NAME_RE}`)
  }
  for (const key of Object.keys(def.models)) {
    if (!NAME_RE.test(key)) {
      throw new Error(`defineAddon("${def.name}"): model key "${key}" must match ${NAME_RE}`)
    }
  }
  for (const [epKey, epDef] of Object.entries(def.endpoints ?? {})) {
    const epPath = epDef.path ?? epKey
    if (!epPath.startsWith('/')) {
      throw new Error(`defineAddon("${def.name}"): endpoint "${epKey}" resolves to path "${epPath}" which must start with "/"`)
    }
  }
  const CRON_NAME_RE = /^[a-z0-9_-]+$/
  const cronNames = new Set<string>()
  for (const c of def.cron ?? []) {
    if (!CRON_NAME_RE.test(c.name)) {
      throw new Error(`defineAddon("${def.name}"): cron name "${c.name}" must match ${CRON_NAME_RE}`)
    }
    if (cronNames.has(c.name)) throw new Error(`defineAddon("${def.name}"): duplicate cron "${c.name}"`)
    cronNames.add(c.name)
  }
  const resolveUserFactories = def.provides?.resolveUser
    ? Array.isArray(def.provides.resolveUser)
      ? def.provides.resolveUser
      : [def.provides.resolveUser]
    : undefined
  return {
    kind: 'addon',
    name: def.name,
    version: def.version ?? '1.0.0',
    depends: def.depends ?? [],
    env: def.env ?? [],
    models: def.models,
    hooks: def.hooks ?? {},
    views: def.views ?? {},
    endpoints: def.endpoints ?? {},
    cron: def.cron ?? [],
    provides: resolveUserFactories ? { resolveUser: resolveUserFactories } : {},
    ...(def.observe ? { observe: def.observe } : {}),
  }
}

export type InferModel<A extends AnyAddon, K extends keyof A['models']> = A['models'][K]
