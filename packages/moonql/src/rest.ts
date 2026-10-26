import type { FastifyPluginAsync, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { badRequest, forbidden, type SchemaDocument } from '@moonwitness/core'
import './augment.js'
import type { MoonQlInstance } from './boot.js'
import type { AclSpec } from './model.js'
import type { EndpointCtx, User } from './addon.js'
import type { CompiledView } from './registry.js'
import { checkAcl, resolveAcl } from './acl.js'
import { buildSchemaDocument } from './introspect.js'

export interface MoonqlRestOptions {
  instance: MoonQlInstance
  /** who may read GET /_schema — default 'auth' */
  introspectionAcl?: AclSpec
  /** the app's advertised API version, reported inside the contract (F4.1) */
  apiVersion?: string
}

interface ListQuery {
  limit?: number
  offset?: number
  where?: string
  order?: string
  expand?: string
  total?: boolean
}
interface ViewQuery {
  limit?: number
  offset?: number
  order?: string
  total?: boolean
}
interface IdParams {
  id: string
}

const parseWhereJson = (raw: string | undefined): unknown => {
  if (raw === undefined) return undefined
  try {
    return JSON.parse(raw)
  } catch {
    throw badRequest('moonql where: invalid JSON')
  }
}

const expandKeys = (raw: string | undefined): string[] | undefined =>
  raw ? raw.split(',').map((s) => s.trim()).filter(Boolean) : undefined

/**
 * Longest a server-sent endpoint may stay open. The request already holds a
 * socket and a bus subscription; a client that never closes its tab keeps both.
 * `?seconds` can shorten the window, never extend it.
 */
const MAX_STREAM_SECONDS = 30 * 60

/**
 * Hand the HTTP layer its OWN copy of a schema.
 *
 * The registry owns these objects and publishes them through `/_schema`. Ajv
 * rewrites what it compiles — a nullable `type: ['string','null']` comes back
 * reordered — so passing the originals made the served contract differ from the
 * one codegen produced: same routes, different digest, and every client that
 * checks `SCHEMA_HASH` would report a drift that never happened.
 */
const wire = <T,>(schema: T): T => structuredClone(schema)

/** view order tokens may reference select-aliases; map them back to source fields */
const viewOrderString = (view: CompiledView, raw: string | undefined): string | undefined => {
  if (!raw) return undefined
  const aliasToSrc = view.select ? Object.fromEntries(Object.entries(view.select).map(([a, s]) => [a, s])) : {}
  return raw
    .split(',')
    .map((t) => {
      const dir = t.startsWith('-') ? '-' : ''
      const field = t.replace(/^[-+]/, '')
      return dir + (aliasToSrc[field] ?? field)
    })
    .join(',')
}

/** generic sort over output rows (aggregate results / post-projection) */
function sortRows(rows: Record<string, unknown>[], order: string | undefined): Record<string, unknown>[] {
  if (!order) return rows
  const terms = order.split(',').map((t) => ({ field: t.replace(/^[-+]/, ''), desc: t.startsWith('-') }))
  return [...rows].sort((a, b) => {
    for (const { field, desc } of terms) {
      const av = a[field] ?? null
      const bv = b[field] ?? null
      if (av === bv) continue
      const cmp = av === null ? -1 : bv === null ? 1 : av < bv ? -1 : 1
      return desc ? -cmp : cmp
    }
    return 0
  })
}

/**
 * Auto-REST generator: uniform CRUD for `rest` models, read-only view routes,
 * declarative addon endpoints and the GET /_schema introspection contract.
 * Query surface: ?limit &offset ?where={...} ?order ?expand ?total.
 *
 * Schemas are runtime-built from descriptors, so the type provider cannot
 * infer them; the few unavoidable casts live HERE, in the framework, never
 * in apps or addons.
 */
export const moonqlRest: FastifyPluginAsync<MoonqlRestOptions> = async (fastify, opts) => {
  const { instance } = opts
  const registry = instance.registry

  // one identity resolution per request, shared across all guards
  const userCache = new WeakMap<FastifyRequest, Promise<User | null>>()
  const userOf = async (request: FastifyRequest): Promise<User | null> => {
    let p = userCache.get(request)
    if (!p) {
      p = instance.resolveUser ? instance.resolveUser({ headers: request.headers }) : Promise.resolve(null)
      userCache.set(request, p)
    }
    return p
  }
  const guard = (spec: AclSpec | undefined) => {
    const { roleRule } = resolveAcl(spec)
    if (roleRule === undefined || roleRule === 'public') return undefined
    return async (request: FastifyRequest): Promise<void> => {
      checkAcl(roleRule, await userOf(request))
    }
  }

  // the metadata document is per-instance and immutable: build it at most once
  let schemaCache: SchemaDocument | undefined
  const schemaOf = (): SchemaDocument => (schemaCache ??= buildSchemaDocument(registry))

  // endpoints that are not streams share one signal that never aborts
  const neverAborted = new AbortController().signal

  /** the one endpoint context both the plain and the streaming branch use */
  const makeCtx = async (request: FastifyRequest, reply: FastifyReply, signal: AbortSignal = neverAborted): Promise<EndpointCtx> => ({
    body: (request.body ?? {}) as Record<string, unknown>,
    query: (request.query ?? {}) as Record<string, unknown>,
    params: (request.params ?? {}) as Record<string, string>,
    user: await userOf(request),
    orm: { model: instance.model },
    env: instance.env,
    engine: instance.engine,
    bus: instance.bus,
    schema: schemaOf,
    signal,
    status: (code: number) => {
      void reply.code(code)
    },
  })

  // ---- models: CRUD ----
  for (const model of registry.models.values()) {
    if (!model.rest) continue
    const repo = instance.model(model.name)
    const ops = model.rest
    const base = `/${model.name}`
    const tag = [model.addon]

    if (ops.list) {
      const { row: rowRule } = resolveAcl(model.acl.list)
      fastify.get(base, {
        schema: {
          tags: tag,
          summary: `List ${model.label.toLowerCase()}s`,
          querystring: wire(model.query),
          response: { 200: { type: 'array', items: wire(model.read) } },
        },
        preHandler: guard(model.acl.list),
      }, async (request, reply: FastifyReply) => {
        const q = request.query as ListQuery
        // one identity resolution per request, shared by the row rule and by the
        // relations this answer expands
        const user = await userOf(request)
        const result = await repo.search({
          limit: q.limit,
          offset: q.offset,
          where: parseWhereJson(q.where),
          order: q.order,
          expand: expandKeys(q.expand),
          actor: user,
          // the count pass is paid for only when the client asked for the header,
          // and it is skipped entirely under a row rule (see below)
          count: q.total === true && !rowRule,
        })
        let rows = result.rows
        if (rowRule) {
          if (user) rows = rows.filter((r) => rowRule(user, r))
          else rows = []
        }
        // A row rule filters after the count, so the pre-filter total is either
        // wrong or an oracle for rows the caller may not see. Omit the header and
        // let the client page forward; HQ already handles a null total.
        if (q.total && !rowRule) reply.header('x-total-count', result.total)
        return rows
      })
    }

    if (ops.get) {
      const { row: rowRule } = resolveAcl(model.acl.get)
      fastify.get(`${base}/:id`, {
        schema: {
          tags: tag,
          summary: `Get a ${model.label.toLowerCase()} by id`,
          params: wire(model.params),
          querystring: { type: 'object', additionalProperties: false, properties: { expand: { type: 'string', maxLength: 200 } } },
          response: { 200: wire(model.read) },
        },
        preHandler: guard(model.acl.get),
      }, async (request) => {
        const user = await userOf(request)
        const row = await repo.get(
          (request.params as IdParams).id,
          expandKeys((request.query as { expand?: string }).expand),
          user,
        )
        if (rowRule) {
          if (!user || !rowRule(user, row)) throw forbidden()
        }
        return row
      })
    }

    if (ops.create) {
      fastify.post(base, {
        schema: {
          tags: tag,
          summary: `Create a ${model.label.toLowerCase()}`,
          body: wire(model.create),
          response: { 201: wire(model.read) },
        },
        preHandler: guard(model.acl.create),
      }, async (request, reply) => {
        const row = await repo.create(request.body as Record<string, unknown>)
        reply.code(201).header('location', `${request.url}/${row.id}`)
        return row
      })
    }

    if (ops.update) {
      const { row: rowRule } = resolveAcl(model.acl.update)
      fastify.patch(`${base}/:id`, {
        schema: {
          tags: tag,
          summary: `Update a ${model.label.toLowerCase()}`,
          params: wire(model.params),
          body: wire(model.update),
          response: { 200: wire(model.read) },
        },
        preHandler: guard(model.acl.update),
      }, async (request) => {
        const id = (request.params as IdParams).id
        // row rules need the current row before the write (double read is acceptable here)
        if (rowRule) {
          const current = await repo.get(id)
          const user = await userOf(request)
          if (!user || !rowRule(user, current)) throw forbidden()
        }
        return repo.update(id, request.body as Record<string, unknown>)
      })
    }

    if (ops.remove) {
      const { row: rowRule } = resolveAcl(model.acl.remove)
      fastify.delete(`${base}/:id`, {
        schema: {
          tags: tag,
          summary: `Delete a ${model.label.toLowerCase()}`,
          params: wire(model.params),
        },
        preHandler: guard(model.acl.remove),
      }, async (request, reply) => {
        const id = (request.params as IdParams).id
        if (rowRule) {
          const current = await repo.get(id)
          const user = await userOf(request)
          if (!user || !rowRule(user, current)) throw forbidden()
        }
        await repo.remove(id)
        return reply.code(204).send()
      })
    }
  }

  // ---- views: read-only mounted projections ----
  for (const view of registry.views.values()) {
    if (!view.expose) continue
    const repo = instance.model(view.from)
    // a declared join only runs when its target addon is installed (standalone addons)
    const expand = view.expand?.filter((key) => registry.models.has(view.source.fields[key]?.ref ?? ''))
    fastify.get(`/${view.key}`, {
      schema: {
        tags: [view.addon],
        summary: view.label,
        querystring: wire(view.query),
        response: { 200: wire(view.readArray) },
      },
      preHandler: guard(view.aclSpec),
    }, async (request, reply: FastifyReply) => {
      const q = request.query as ViewQuery
      const where = view.dynamicWhere ? view.dynamicWhere({ now: new Date() }) : view.staticWhere
      const limit = Math.min(q.limit ?? view.limit, view.limit)
      const offset = q.offset ?? 0

      if (view.aggregate) {
        // aggregate first (SQL GROUP BY), then joins, order/slice over the (<= limit) result set
        const rows = await repo.aggregateView({ groupBy: view.aggregate.groupBy, metrics: view.aggregate.metrics, where, limit: view.limit })
        await repo.expandRows(rows, expand, await userOf(request))
        const ordered = sortRows(rows, q.order ?? view.order)
        if (q.total) reply.header('x-total-count', ordered.length)
        return ordered.slice(offset, offset + limit)
      }

      // paging and ordering are pushed to the engine: a page of 12 no longer
      // fetches the view's whole 100-row ceiling just to slice it here.
      const result = await repo.search({
        limit,
        offset,
        where,
        order: viewOrderString(view, q.order ?? view.order),
        count: q.total === true,
      })
      // join -> project: relation lookups only run for the rows we return
      let rows = result.rows
      await repo.expandRows(rows, expand, await userOf(request))
      if (view.select) {
        rows = rows.map((r) => ({
          ...Object.fromEntries(Object.entries(view.select!).map(([alias, src]) => [alias, r[src] ?? null])),
          ...Object.fromEntries((expand ?? []).map((k) => [`${k}Record`, r[`${k}Record`] ?? null])),
        }))
      }
      if (q.total) reply.header('x-total-count', result.total)
      return rows
    })
  }

  // ---- declarative addon endpoints ----
  for (const ep of registry.endpoints) {
    const handler = ep.def.handler

    // server-sent events: framing, heartbeats and abort handling live HERE so
    // an addon only yields payloads (and its generator stays finite under ?limit)
    if (ep.def.stream) {
      const streamOpts = {
        method: ep.method,
        url: ep.path,
        schema: { tags: [ep.addon], summary: `${ep.method} ${ep.path} (server-sent events)` },
        preHandler: guard(ep.def.requires),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async (request: any, reply: FastifyReply) => {
          // an aborted generator must leave its loop even while parked on an await
          const abort = new AbortController()
          const iterable = (await handler(await makeCtx(request as FastifyRequest, reply, abort.signal))) as AsyncIterable<unknown>
          if (!iterable || typeof (iterable as AsyncIterable<unknown>)[Symbol.asyncIterator] !== 'function') {
            throw badRequest(`moonql stream: endpoint ${ep.path} must return an AsyncIterable`)
          }
          reply.hijack() // envelope + serializer are bypassed entirely
          const raw = reply.raw
          raw.writeHead(200, {
            'content-type': 'text/event-stream; charset=utf-8',
            'cache-control': 'no-cache, no-transform',
            connection: 'keep-alive',
            'x-accel-buffering': 'no',
          })
          raw.write(':connected\n\n')

          const ping = setInterval(() => {
            try {
              raw.write(': ping\n\n')
            } catch {
              /* socket already gone; the loop ends on the next write */
            }
          }, 15_000)
          ping.unref?.()

          // An unbounded stream is a socket leak with a URL on it: tab restores and
          // proxy retries pile up open generators until the pool is the limit. A
          // client that wants to stay tuned reconnects, which also resyncs it.
          const requestedSeconds = Number((request.query as { seconds?: unknown }).seconds ?? NaN)
          const seconds = Number.isFinite(requestedSeconds)
            ? Math.max(1, Math.min(MAX_STREAM_SECONDS, Math.floor(requestedSeconds)))
            : MAX_STREAM_SECONDS

          const iterator = iterable[Symbol.asyncIterator]()
          let finished = false
          const onClose = () => {
            abort.abort()
            if (!finished) void iterator.return?.(undefined)
          }
          raw.on('close', onClose)
          const deadline = setTimeout(onClose, seconds * 1000)
          deadline.unref?.()

          try {
            for (;;) {
              const next = await iterator.next()
              if (next.done || raw.writableEnded) break
              raw.write(`data: ${JSON.stringify(next.value ?? null)}\n\n`)
            }
          } catch (err) {
            try {
              raw.write(`event: error\ndata: ${JSON.stringify({ message: (err as Error).message })}\n\n`)
            } catch {
              /* client is gone */
            }
          } finally {
            finished = true
            abort.abort()
            clearInterval(ping)
            clearTimeout(deadline)
            raw.off('close', onClose)
            raw.end()
          }
        },
      }
      ;(fastify as FastifyInstance).route(streamOpts as never)
      continue
    }

    const routeOpts = {
      method: ep.method,
      url: ep.path,
      schema: {
        tags: [ep.addon],
        summary: `${ep.method} ${ep.path}`,
        ...(ep.bodySchema ? { body: wire(ep.bodySchema) } : {}),
      },
      preHandler: guard(ep.def.requires),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handler: async (request: any, reply: FastifyReply) => handler(await makeCtx(request as FastifyRequest, reply)),
    }
    ;(fastify as FastifyInstance).route(routeOpts as never)
  }

  // ---- introspection contract ----
  fastify.get('/_schema', {
    schema: { tags: ['moonql'], summary: 'ORM metadata contract (addons, models, views, endpoints)' },
    preHandler: guard(opts.introspectionAcl ?? 'auth'),
  }, async () => buildSchemaDocument(registry, { apiVersion: opts.apiVersion }))
}
