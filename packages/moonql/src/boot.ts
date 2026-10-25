import type { Sql } from 'postgres'
import { createMoonQl, runMigrations, type MoonQl } from './client.js'
import { autoSync } from './sync.js'
import { installAddons, type MoonRegistry } from './registry.js'
import { ModelRepo } from './repository.js'
import { createMemoryEngine } from './engines/memory.js'
import { createPgEngine } from './engines/pg.js'
import type { MoonEngine } from './engines/engine.js'
import type { AnyAddon, RequestLike, User } from './addon.js'
import { startCrons, type CronHandle } from './crons.js'
import { createRefResolver } from './refs.js'
import { syncModelData } from './datasync.js'
import { createBus, type MoonBus } from './bus.js'
import { httpError } from '@moonwitness/core'

/** demo/fixture seeds should reach this many rows (seed policy advisory) */
export const MIN_DEMO_ROWS = 10

type Log = {
  info: (obj: unknown, msg: string) => void
  warn: (obj: unknown, msg: string) => void
}

export interface MoonQlOptions {
  /** Omit (or empty) to boot the in-memory engine — zero-config dev & tests. */
  databaseUrl?: string
  addons: AnyAddon[]
  /** Additive schema sync at boot (pg only). Default: true. */
  autoSync?: boolean
  /** Module folder names already claiming REST paths (collision guard). */
  reservedPaths?: string[]
  /** Explicit env slice handed to addons (seeds/endpoints/resolvers) — addons never read process.env. */
  env?: Record<string, string | undefined>
  /** Arm addon crons at boot. Default: true. */
  cronEnabled?: boolean
  /**
   * Every REST model must carry data | seed | seedless (kewajiban Odoo-base
   * style). 'warn' (default) logs offenders, 'require' fails the boot,
   * 'off' disables the check. Also gates the MIN_DEMO_ROWS + big-sel advice.
   */
  seedPolicy?: 'off' | 'warn' | 'require'
  /**
   * A REST model without a write rule is anonymous-writable. 'warn' (default)
   * lists every such create/update/remove, 'require' fails the boot, 'off'
   * disables the check. Overridden by this option, else MOONQL_ACL_POLICY.
   */
  aclPolicy?: 'off' | 'warn' | 'require'
  log: Log
}

export interface MoonQlInstance {
  engine: 'pg' | 'memory'
  registry: MoonRegistry
  /** engine handles per model (advanced: re-running syncs, framework tests) */
  engines: Map<string, MoonEngine>
  /** instance event bus: model writes, cron runs, sync/seed phases */
  bus: MoonBus
  db?: MoonQl['db']
  client?: Sql
  env: Record<string, string | undefined>
  model(name: string): ModelRepo
  /** resolver chain: every contributing addon is tried in dependency order, first non-null wins */
  resolveUser?: (request: RequestLike) => Promise<User | null>
  close(): Promise<void>
}

/**
 * How the boot-time invariant scanners react to an offender: stay silent, log a
 * warning, or refuse to boot.
 */
type PolicyMode = 'off' | 'warn' | 'require'

/**
 * The single entry point apps use: install addons, pick the engine,
 * migrate + auto-sync + seed (pg), and hand back model repositories.
 */
export async function bootMoonQl(options: MoonQlOptions): Promise<MoonQlInstance> {
  const { addons, log } = options
  const env = options.env ?? {}
  const registry = installAddons(addons, { reservedPaths: options.reservedPaths })
  const engines = new Map<string, MoonEngine>()
  const repos = new Map<string, ModelRepo>()
  const bus = createBus(log)
  let mq: MoonQl | undefined

  if (options.databaseUrl) {
    mq = createMoonQl(options.databaseUrl)
    await runMigrations(mq)
    if (options.autoSync ?? true) await autoSync(mq.client, registry, log)
    for (const model of registry.models.values()) {
      engines.set(model.name, createPgEngine(mq.db, model.table, model.fields, { softDelete: model.softDelete }))
    }
    log.info({ models: registry.models.size }, 'moonql: engine=pg, migrations applied, schema synced')
  } else {
    for (const model of registry.models.values()) {
      engines.set(model.name, createMemoryEngine(model.fields, { softDelete: model.softDelete }))
    }
    log.warn({ models: registry.models.size }, 'moonql: no DATABASE_URL — using in-memory engine')
  }

  const instance: MoonQlInstance = {
    engine: mq ? 'pg' : 'memory',
    registry,
    engines,
    bus,
    db: mq?.db,
    client: mq?.client,
    env,
    model(name: string): ModelRepo {
      const cached = repos.get(name)
      if (cached) return cached
      const compiled = registry.models.get(name)
      const engine = engines.get(name)
      if (!compiled || !engine) {
        throw httpError(500, `moonql: unknown model "${name}" — not defined by any installed addon`)
      }
      const repo = new ModelRepo(compiled, engine, registry, log, instance.model, bus)
      repos.set(name, repo)
      return repo
    },
    async close() {
      if (mq) await mq.client.end({ timeout: 5 })
    },
  }

  // ---- boot-time policy scanners ----
  //
  // One predicate per invariant, one shared decision about what to do with the
  // offenders: `off` skips, `require` refuses to boot, `warn` logs. Before this the
  // two blocks each carried their own copy of that ladder, so the next invariant
  // ("every model has a label and a menu") would have meant a third fifteen-line
  // block instead of a predicate and a call.
  const runPolicy = (
    key: string,
    mode: PolicyMode,
    offenders: string[],
    messages: { require: string; warn: string },
  ): void => {
    if (mode === 'off' || offenders.length === 0) return
    if (mode === 'require') throw httpError(500, `${messages.require} — ${offenders.join(', ')}`)
    log.warn({ [key]: offenders }, messages.warn)
  }

  /**
   * A policy mode read from the environment is a string, and "reqire" would
   * otherwise fall through to the most permissive reading of all. Unrecognised
   * values are answered with 'warn' and said out loud, never guessed at.
   */
  const policyMode = (value: unknown, name: string): PolicyMode => {
    if (value === 'off' || value === 'warn' || value === 'require') return value
    if (value !== undefined && value !== '') {
      log.warn({ [name]: String(value), fallback: 'warn' }, `moonql policy: unknown mode for ${name}, warning instead`)
    }
    return 'warn'
  }

  const seedPolicy = policyMode(options.seedPolicy, 'seedPolicy')
  const uncovered: string[] = []
  const bigSel: string[] = []
  for (const model of registry.models.values()) {
    if (model.rest && !model.data && !model.seed && !model.seedless) uncovered.push(model.name)
    for (const [key, f] of Object.entries(model.fields)) {
      if (f.kind === 'sel' && (f.choices?.length ?? 0) > 15) bigSel.push(`${model.name}.${key}`)
    }
  }
  // fails fast, before any writes: an empty public table is a shipped bug
  runPolicy('restModelsWithNoDefaultData', seedPolicy, uncovered, {
    require: 'moonql seed policy: REST models need data/seed/seedless',
    warn: 'moonql seed policy: every addon should ship default data (or declare seedless)',
  })
  // never fatal: a long choice list is a design smell, not a broken boot
  runPolicy('largeSelectionsConsiderReferenceModels', seedPolicy === 'off' ? 'off' : 'warn', bigSel, {
    require: 'moonql seed policy: large selections',
    warn: 'moonql seed policy: a selection over 15 choices should be a reference model',
  })

  // no REST model may be silently writable by anonymous callers
  const aclPolicy = policyMode(options.aclPolicy ?? env.MOONQL_ACL_POLICY, 'aclPolicy')
  const openWrites: string[] = []
  for (const model of registry.models.values()) {
    if (!model.rest) continue
    for (const op of ['create', 'update', 'remove'] as const) {
      if (model.rest[op] && model.acl[op] === undefined) openWrites.push(`${model.name}.${op}`)
    }
  }
  runPolicy('openWrites', aclPolicy, openWrites, {
    require: 'moonql acl policy: REST writes need an acl rule',
    warn: 'moonql acl policy: declare acl.create/update/remove (anonymous writes are open)',
  })

  // ---- @ref resolver: one indexed pass per (model, field), strict for reference rows ----
  const refResolver = createRefResolver((name) => {
    const compiled = registry.models.get(name)
    const engine = engines.get(name)
    if (!compiled || !engine) return null
    return { name, unique: compiled.unique, engine }
  })
  /**
   * Cross-model helper handed to function seeds: '@model:value' resolves through
   * the boot index, anything else already IS an id and stays untouched. A ref
   * that resolves to nothing is an error — `''` would be a dangling FK that the
   * pg engine (uuid column) rejects with an opaque 500.
   */
  const resolveRef = async (ref: string): Promise<string> => {
    if (!ref.startsWith('@')) return ref
    const id = await refResolver.resolve(ref, true)
    if (id === null) throw httpError(500, `moonql seed: reference "${ref}" did not resolve to a row`)
    return id
  }

  // ---- phase R: reference data — diff-synced EVERY boot (insert/update, never delete) ----
  for (const model of registry.models.values()) {
    if (!model.data) continue
    const engine = engines.get(model.name)!
    const result = await syncModelData(model, engine, { orm: { model: instance.model }, resolveRef }, refResolver, log)
    bus.emit('data.synced', { model: model.name, ...result })
  }

  // ---- phase D: demo seeds — inserted once when the table is empty, refs lenient ----
  for (const model of registry.models.values()) {
    if (!model.seed) continue
    const repo = instance.model(model.name)
    if ((await repo.count()) > 0) continue
    const rawRows =
      typeof model.seed === 'function' ? await model.seed({ orm: { model: instance.model }, env, log, resolveRef }) : model.seed
    const rows = await refResolver.walk(rawRows, false, (msg) => log.warn({ ref: msg }, 'moonql seed: reference issue'))
    await repo.seedRows(rows)
    bus.emit('seed.applied', { model: model.name, rows: rows.length })
    log.info({ model: model.name, rows: rows.length }, 'moonql: seeded empty table')
    if (seedPolicy !== 'off' && Array.isArray(model.seed) && rows.length < MIN_DEMO_ROWS && rows.length > 0) {
      log.warn({ model: model.name, rows: rows.length, min: MIN_DEMO_ROWS }, 'moonql seed policy: demo seed below minimum')
    }
  }

  // identity resolver chain from addon provides (any number of addons)
  if (registry.resolveUserFactories.length) {
    const resolvers = registry.resolveUserFactories.map((factory) => factory({ orm: { model: instance.model }, env, log, bus }))
    instance.resolveUser = async (request) => {
      for (const resolver of resolvers) {
        try {
          const user = await resolver(request)
          if (user) return user
        } catch (err) {
          log.warn({ err: (err as Error).message }, 'moonql resolveUser: resolver failed, treating as anonymous')
        }
      }
      return null
    }
  }

  // observers: addons react to writes they do not own (audit, metrics, webhooks).
  // Attached before crons so a tick is never unwatched, after seeds so boot
  // writes do not produce phantom audit rows.
  for (const addon of registry.addons) {
    if (!addon.observe) continue
    try {
      await addon.observe(bus, { orm: { model: instance.model }, env, log, bus })
    } catch (err) {
      log.warn({ err: (err as Error).message, addon: addon.name }, 'moonql observe: subscriber failed to attach')
    }
  }

  // arm declarative crons (stopped on close)
  let crons: CronHandle | undefined
  if (options.cronEnabled ?? true) {
    crons = startCrons(instance, registry, log)
  }
  const originalClose = instance.close
  instance.close = async () => {
    crons?.stop()
    await originalClose()
  }

  return instance
}
