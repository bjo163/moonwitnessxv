import fp from 'fastify-plugin'
import { monitorEventLoopDelay } from 'node:perf_hooks'

/** One labelled counter: request count and total time, per route pattern. */
export interface Counter {
  count: number
  ms: number
}

export interface HubMetrics {
  /** process start, so uptime is measured from the boot and not from a scrape */
  readonly startedAt: number
  readonly http: Map<string, Counter>
  /** keys refused because the budget was already spent */
  droppedKeys: number
  /** named counters from the ORM bus: cron outcomes, sync and seed events */
  readonly counters: Map<string, number>
  /** server-sent streams answered by this process, and how many are open now */
  readonly streams: { opened: number; open: number }
  readonly loopLag: () => number
}

/**
 * Label cardinality is the classic way to turn a metrics endpoint into an outage:
 * a route with an id in the path would mint one series per id, forever. The budget
 * is small and finite on purpose — the route *pattern* is what gets recorded, so
 * 400 keys is hundreds of thousands of requests worth of distinct series.
 */
const MAX_SERIES = 400

export default fp(
  async (fastify) => {
    const histogram = monitorEventLoopDelay({ resolution: 20 })
    histogram.enable()
    fastify.addHook('onClose', async () => histogram.disable())

    const metrics: HubMetrics = {
      startedAt: Date.now(),
      http: new Map(),
      droppedKeys: 0,
      counters: new Map(),
      streams: { opened: 0, open: 0 },
      // nanoseconds → seconds; the 95th percentile says "the loop stalled" without
      // the noise of a single-sample max
      loopLag: () => histogram.percentile(95) / 1e9,
    }
    fastify.decorate('metrics', metrics)

    const bump = (key: string, by = 1): void => {
      metrics.counters.set(key, (metrics.counters.get(key) ?? 0) + by)
    }

    const record = (key: string, ms: number): void => {
      const hit = metrics.http.get(key)
      if (hit) {
        hit.count += 1
        hit.ms += ms
        return
      }
      if (metrics.http.size >= MAX_SERIES) {
        metrics.droppedKeys += 1
        return
      }
      metrics.http.set(key, { count: 1, ms })
    }

    fastify.addHook('onResponse', async (request, reply) => {
      // `routeOptions.url` is the registered pattern (`/orm/playlogs/:id`), never the
      // concrete URL — that single choice is what keeps this endpoint safe to scrape
      const route = request.routeOptions?.url ?? 'unmatched'
      const status = `${Math.floor(reply.statusCode / 100)}xx`
      record(`${request.method} ${route} ${status}`, reply.elapsedTime)

      // A stream is the one response that outlives its handler: count it open here
      // and let the socket say when it is really gone.
      const type = String(reply.getHeader('content-type') ?? '')
      if (type.includes('text/event-stream') && reply.statusCode < 400) {
        metrics.streams.opened += 1
        metrics.streams.open += 1
        reply.raw.once('close', () => {
          metrics.streams.open = Math.max(0, metrics.streams.open - 1)
        })
      }
    })

    // The hub's own activity log, read through the bus instead of a wrapper around
    // every cron: a job that stops ticking is invisible in the HTTP counters.
    fastify.moonql.bus.on('cron.run', (p) => {
      bump(`cron_run_total{cron="${p.addon}/${p.cron}",status="${p.status}"}`)
      bump(`cron_run_milliseconds_sum{cron="${p.addon}/${p.cron}"}`, Math.round(p.durationMs))
      bump(`cron_run_milliseconds_count{cron="${p.addon}/${p.cron}"}`)
    })
    fastify.moonql.bus.on('data.synced', (p) => {
      bump(`data_sync_rows_total{model="${p.model}",change="created"}`, p.created)
      bump(`data_sync_rows_total{model="${p.model}",change="updated"}`, p.updated)
      bump(`data_sync_rows_total{model="${p.model}",change="unchanged"}`, p.unchanged)
    })
    fastify.moonql.bus.on('seed.applied', (p) => {
      bump(`seed_rows_total{model="${p.model}"}`, p.rows)
    })
  },
  { name: 'metrics' },
)
