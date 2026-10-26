import { badRequest, conflict, httpError, notFound } from '@moonwitness/core'
import type { HookEvent, User } from './addon.js'
import type { MoonRegistry, CompiledModel } from './registry.js'
import { allowsAcl, resolveAcl } from './acl.js'
import { eqDomain, isDomain, normalizeOrder, normalizeWhere } from './domain.js'
import type { Domain } from './domain.js'
import type { AggregateQuery, ListOptions, MoonEngine, Row } from './engines/engine.js'
import type { MoonBus } from './bus.js'

type Log = { warn: (obj: unknown, msg: string) => void }

/** Query accepted by repository reads — REST passes the parsed pieces. */
export interface RepoQuery {
  limit?: number
  offset?: number
  /** raw JSON object (string parsing happens in REST) or already-normalized domain */
  where?: unknown
  order?: unknown
  expand?: string[]
  /** trusted internal readers (e.g. an auth handler) may see private fields */
  raw?: boolean
  /** ask for the second pass that produces `total` (opt-in, see search()) */
  count?: boolean
  /**
   * Who is asking. Only used to decide whether an expanded relation is visible:
   * a relation expands the target model's rows, so it must pass that model's
   * `list` rule — otherwise `?expand=` is a way around it.
   */
  actor?: User | null
}

const uniqueViolation = (err: unknown): boolean =>
  typeof err === 'object' && err !== null && (err as { code?: string }).code === '23505'

const inDomain = (field: string, values: unknown[]): Domain => ({ kind: 'leaf', term: { field, op: 'in', value: values } })

/**
 * One model's data access: engine + hooks + declarative guarantees
 * (validate, unique, soft delete, computed, expand). Uniform errors keep the
 * API message contract ("Station not found").
 */
export class ModelRepo {
  constructor(
    private readonly compiled: CompiledModel,
    private readonly engine: MoonEngine,
    private readonly registry: MoonRegistry,
    private readonly log: Log,
    private readonly getRepo: (name: string) => ModelRepo,
    /** optional: emits model.* events so observers (audit, metrics) can react */
    private readonly bus?: MoonBus,
  ) {}

  /**
   * Hooks are typed `(row) => row | Promise<row>`, so they are awaited here.
   * Left unawaited, an async `beforeCreate` would hand a Promise to
   * applyDefaults and store a row of nothing but defaults — silent data loss.
   */
  private async runHook<T>(event: HookEvent, arg: T): Promise<T> {
    const fn = this.registry.hookFor(event, this.compiled.name)
    if (!fn) return arg
    const result = (await fn(arg)) as T
    if (result === null || typeof result !== 'object') {
      throw httpError(500, `moonql hook "${event}" on ${this.compiled.name} must return a row, got ${typeof result}`)
    }
    return result
  }

  private fire(event: HookEvent, arg: unknown): void {
    const fn = this.registry.hookFor(event, this.compiled.name)
    if (!fn) return
    Promise.resolve(fn(arg)).catch((err) =>
      this.log.warn({ err: (err as Error).message }, `moonql hook ${event}(${this.compiled.name}) failed`),
    )
  }

  private domainOf(query: { where?: unknown }): Domain | undefined {
    if (query.where === undefined || query.where === null) return undefined
    if (isDomain(query.where)) return query.where // precompiled (views)
    if (typeof query.where === 'object') {
      return normalizeWhere(this.compiled.queryable, this.compiled.name, query.where)
    }
    return undefined
  }

  /** strip private keys + add computed values; applied to every outward row */
  hydrate(row: Row, includePrivate = false): Row {
    const out = { ...row }
    for (const [key, f] of Object.entries(this.compiled.fields)) {
      if (f.private) {
        if (!includePrivate) delete out[key]
      } else if (f.kind === 'compute' && f.get && (!f.store || out[key] === undefined)) {
        // stored computed reads from the column; virtual computed is always live
        out[key] = f.get(out)
      }
    }
    return out
  }

  /** recompute every stored-computed value over a (merged, defaults-included) row */
  private stampStored(row: Row): Row {
    const stamped = { ...row }
    for (const f of Object.values(this.compiled.fields)) {
      if (f.kind === 'compute' && f.store && f.get) {
        // find its key by identity
        for (const [k, ff] of Object.entries(this.compiled.fields)) if (ff === f) stamped[k] = f.get(stamped)
      }
    }
    return stamped
  }

  private async expand(rows: Row[], keys: string[] | undefined, actor: User | null = null): Promise<Row[]> {
    if (!keys?.length) return rows
    for (const key of keys) {
      const f = this.compiled.fields[key]
      if (!f || (f.kind !== 'm2o' && f.kind !== 'o2m') || !f.ref) {
        throw badRequest(`moonql expand: "${key}" is not a relation on model "${this.compiled.name}"`)
      }
      if (!this.registry.models.has(f.ref)) {
        throw badRequest(`moonql expand: unknown model "${f.ref}"`)
      }
      const other = this.getRepo(f.ref)
      const slot = f.kind === 'm2o' ? `${key}Record` : key

      // The join reads the target table, so it answers to the target's list rule.
      // Without this, a public model with a relation to an admin-only one would
      // hand out that model's rows through `?expand=`. A model with `rest: false`
      // has no REST surface at all, and a relation is part of that surface.
      const targetAcl = resolveAcl(other.compiled.acl.list)
      if (other.compiled.rest === false || !allowsAcl(targetAcl.roleRule, actor)) {
        for (const r of rows) r[slot] = null
        continue
      }
      const visible = (row: Row): boolean => !targetAcl.row || (actor !== null && targetAcl.row(actor, row))

      if (f.kind === 'm2o') {
        const ids = [...new Set(rows.map((r) => r[key]).filter((v): v is string => typeof v === 'string'))]
        const parents = ids.length
          ? (await other.rawList({ limit: ids.length, offset: 0, where: inDomain('id', ids) }))
              .map((r) => other.hydrate(r))
              .filter(visible)
          : []
        const byId = new Map(parents.map((p) => [p.id as string, p]))
        for (const r of rows) r[slot] = byId.get((r[key] as string) ?? '') ?? null
      } else {
        const ids = [...new Set(rows.map((r) => r.id).filter((v): v is string => typeof v === 'string'))]
        // One bounded pass per expand. The order makes the bound deterministic:
        // without it the surviving children depended on engine internals (and the
        // two engines disagreed). A group that fills its slice is reported.
        const perParent = 50
        const children = ids.length
          ? (await other.rawList({
              limit: ids.length * perParent,
              offset: 0,
              where: inDomain(f.fk as string, ids),
              order: [{ field: 'id', direction: 'asc' }],
            }))
              .map((r) => other.hydrate(r))
              .filter(visible)
          : []
        if (ids.length && children.length === ids.length * perParent) {
          this.log.warn(
            { model: this.compiled.name, relation: key, parents: ids.length, perParent },
            'moonql expand: related rows hit the fetch bound, some parents may look truncated',
          )
        }
        const grouped = new Map<string, Row[]>()
        for (const child of children) {
          const fkValue = child[f.fk as string] as string
          let bucket = grouped.get(fkValue)
          if (!bucket) {
            bucket = []
            grouped.set(fkValue, bucket)
          }
          bucket.push(child)
        }
        for (const r of rows) r[key] = grouped.get(r.id as string) ?? null
      }
    }
    return rows
  }

  /** internal: used by expand on the OTHER model (no recursion into expand) */
  private async rawList(opts: ListOptions): Promise<Row[]> {
    return this.engine.list(opts)
  }

  /** public form of the join used by views (aggregate rows expand their groupBy keys) */
  async expandRows(rows: Row[], keys: string[] | undefined, actor: User | null = null): Promise<Row[]> {
    return this.expand(rows, keys, actor)
  }

  /**
   * `count: true` is the only way to get a real `total`. Counting is a second
   * full pass over the same predicate, and most callers (every list UI that
   * pages by limit/offset, every internal lookup) never read it — so it is opt-in
   * rather than unconditional. `total` stays 0 when not requested.
   */
  async search(query: RepoQuery = {}): Promise<{ rows: Row[]; total: number }> {
    const where = this.domainOf(query)
    const order = normalizeOrder(this.compiled.queryable, this.compiled.name, query.order)
    const opts: ListOptions = {
      limit: query.limit ?? this.compiled.maxLimit,
      offset: query.offset ?? 0,
      where,
      order,
    }
    const [rows, total] = await Promise.all([
      this.engine.list(opts),
      query.count ? this.engine.count(where) : Promise.resolve(0),
    ])
    const hydrated = rows.map((r) => this.hydrate(r, query.raw))
    await this.expand(hydrated, query.expand, query.actor ?? null)
    return { rows: hydrated, total }
  }

  async list(query: RepoQuery = {}): Promise<Row[]> {
    return (await this.search(query)).rows
  }

  async get(id: string, expand?: string[], actor: User | null = null): Promise<Row> {
    const row = await this.engine.find(id)
    if (!row) throw notFound(`${this.compiled.label} not found`)
    const hydrated = [this.hydrate(row)]
    await this.expand(hydrated, expand, actor)
    return hydrated[0]!
  }

  private validateValues(data: Row, full: Row): void {
    for (const [key, f] of Object.entries(this.compiled.fields)) {
      if (!f.validate || data[key] === undefined) continue
      const error = f.validate(data[key], full)
      if (error) throw badRequest(`${this.compiled.label}: ${error}`)
    }
  }

  /** model-level + field-level unique: pre-check (both engines) -> 409 */
  private async assertUnique(values: Row, excludeId?: string): Promise<void> {
    const pairs = [...this.compiled.unique]
    for (const [key, f] of Object.entries(this.compiled.fields)) {
      if (f.unique) pairs.push([key])
    }
    for (const pair of pairs) {
      const terms: Record<string, unknown> = {}
      let complete = true
      for (const key of pair) {
        const v = values[key]
        if (v === undefined) {
          complete = false
          break
        }
        terms[key] = v
      }
      if (!complete) continue
      let domain = eqDomain(terms)
      if (excludeId) {
        domain = { kind: 'and', parts: [domain, { kind: 'leaf', term: { field: 'id', op: 'ne', value: excludeId } }] }
      }
      if ((await this.engine.count(domain)) > 0) {
        throw conflict(`${this.compiled.label} violates unique constraint [${pair.join(', ')}]`)
      }
    }
  }

  async create(data: Row): Promise<Row> {
    const input = await this.runHook('beforeCreate', data)
    const stamped = this.stampStored(this.applyDefaults(input))
    this.validateValues(stamped, stamped)
    await this.assertUnique(stamped)
    let row: Row
    try {
      row = await this.engine.insert(stamped)
    } catch (err) {
      if (uniqueViolation(err)) {
        throw conflict(`${this.compiled.label} violates a unique constraint`)
      }
      throw err
    }
    const hydrated = this.hydrate(row)
    this.fire('afterCreate', hydrated)
    this.bus?.emit('model.created', { model: this.compiled.name, id: String(hydrated.id), row: hydrated })
    return hydrated
  }

  /** defaults materialized for validators/stamps (engine also applies them, idempotently) */
  private applyDefaults(input: Row): Row {
    const merged: Row = { ...input }
    for (const [k, f] of Object.entries(this.compiled.fields)) {
      if (merged[k] === undefined && f.default !== undefined) merged[k] = f.default
      else if (merged[k] === undefined && f.null) merged[k] = null
    }
    return merged
  }

  async update(id: string, patch: Row): Promise<Row> {
    const input = await this.runHook('beforeUpdate', patch)
    const existing = await this.engine.find(id)
    if (!existing) throw notFound(`${this.compiled.label} not found`)
    const merged = this.stampStored({ ...existing, ...input })
    this.validateValues(input, merged)
    await this.assertUnique(merged, id)
    let row: Row | null
    try {
      // merged (not input): stored computed stamps must reach the engine;
      // engines strip every non-writable key (audit/bookkeeping filter)
      row = await this.engine.patch(id, merged)
    } catch (err) {
      if (uniqueViolation(err)) {
        throw conflict(`${this.compiled.label} violates a unique constraint`)
      }
      throw err
    }
    if (!row) throw notFound(`${this.compiled.label} not found`)
    const hydrated = this.hydrate(row)
    this.fire('afterUpdate', hydrated)
    this.bus?.emit('model.updated', { model: this.compiled.name, id, row: hydrated })
    return hydrated
  }

  async remove(id: string): Promise<void> {
    const existing = await this.engine.find(id)
    if (!existing) throw notFound(`${this.compiled.label} not found`)
    await this.runHook('beforeDelete', this.hydrate(existing))
    if (this.compiled.softDelete) {
      // engine patch with the implicit alive filter; drop() never runs for soft models
      await this.engine.patch(id, { deletedAt: new Date().toISOString() } as never)
    } else {
      await this.engine.drop(id)
    }
    this.fire('afterDelete', id)
    this.bus?.emit('model.deleted', { model: this.compiled.name, id })
  }

  async count(where?: unknown): Promise<number> {
    return this.engine.count(where ? this.domainOf({ where }) : undefined)
  }

  /**
   * Bulk delete behind a predicate — retention jobs, not business writes. No
   * hook and no bus event on purpose: a purge that announced every row would
   * immediately refill the very table it is trimming.
   */
  async removeWhere(where: unknown, limit = 1000): Promise<number> {
    return this.engine.removeWhere(this.domainOf({ where }), limit)
  }

  /** aggregate over the compiled source (views); metric identifiers prevalidated by the registry */
  async aggregateView(q: Omit<AggregateQuery, 'where'> & { where?: Domain }): Promise<Row[]> {
    return this.engine.aggregate(q)
  }

  /** raw engine access for boot-time seeding (no hooks, no hydration) */
  async seedRows(rows: Row[]): Promise<void> {
    for (const row of rows) await this.engine.insert(row)
  }
}
