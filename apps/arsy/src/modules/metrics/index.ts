import type { TypedModule } from '../../lib/types.js'
import { requireAdmin } from '../../lib/authz.js'

/**
 * Metrics module -> mounted at <apiPrefix>/metrics
 * A Prometheus scrape target built from what the hub already knows: no client
 * library, no exposer, no extra socket. Text format is a handful of string joins,
 * and keeping it here means the numbers come from the same process that serves them.
 */

/** Channel liveness must never make a scrape wait: answer with what is known. */
const STATUS_TIMEOUT_MS = 500

/** Prometheus label values need quotes and backslashes escaped, or the payload is unparseable. */
const label = (value: string): string => value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')

const metric = (name: string, help: string, type: 'counter' | 'gauge', lines: string[]): string =>
  `# HELP ${name} ${help}\n# TYPE ${name} ${type}\n${lines.join('\n')}`

const metricsRoutes: TypedModule = async (fastify) => {
  // The module folder names the route, so the path is "/" — same convention as
  // channels and health: `/api/v1/metrics`, never `/api/v1/metrics/metrics`.
  fastify.get(
    '/',
    {
      schema: { tags: ['system'], summary: 'Prometheus scrape target (text format)' },
      preHandler: requireAdmin,
    },
    async (_request, reply) => {
      const m = fastify.metrics
      const uptime = (Date.now() - m.startedAt) / 1000
      const memory = process.memoryUsage()

      const requests: string[] = []
      const duration: string[] = []
      for (const [key, hit] of m.http) {
        const [method, route, status] = key.split(' ')
        const labels = `{method="${label(method ?? '?')}",route="${label(route ?? '?')}",status="${label(status ?? '?')}"}`
        requests.push(`moonwitness_http_requests_total${labels} ${hit.count}`)
        duration.push(`moonwitness_http_request_duration_seconds_sum${labels} ${(hit.ms / 1000).toFixed(6)}`)
        duration.push(`moonwitness_http_request_duration_seconds_count${labels} ${hit.count}`)
      }

      const channels = fastify.channels.list()
      const connected: string[] = []
      let liveness = 1
      if (channels.length > 0) {
        // A channel that is mid-handshake can take seconds to answer; a scrape that
        // times out is worse than a scrape that says "unknown".
        const raced = await Promise.race([
          fastify.channels.statusAll(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), STATUS_TIMEOUT_MS)),
        ])
        if (raced) for (const status of raced) connected.push(`moonwitness_channel_connected{channel="${label(status.id)}"} ${status.state === 'open' ? 1 : 0}`)
        else liveness = 0
      }

      const body = [
        metric('moonwitness_process_uptime_seconds', 'Seconds since this hub process started.', 'gauge', [
          `moonwitness_process_uptime_seconds ${uptime.toFixed(3)}`,
        ]),
        metric('moonwitness_process_resident_memory_bytes', 'Resident set size of the hub process.', 'gauge', [
          `moonwitness_process_resident_memory_bytes ${memory.rss}`,
          `moonwitness_process_heap_bytes ${memory.heapUsed}`,
        ]),
        metric('moonwitness_eventloop_lag_seconds', '95th percentile event-loop delay; a stall looks like an outage.', 'gauge', [
          `moonwitness_eventloop_lag_seconds ${m.loopLag().toFixed(6)}`,
        ]),
        metric('moonwitness_engine_info', 'Which moonql engine this instance answers from.', 'gauge', [
          `moonwitness_engine_info{engine="${label(fastify.moonql.engine)}"} 1`,
        ]),
        metric('moonwitness_channels_registered', 'Release channels mounted in this process.', 'gauge', [
          `moonwitness_channels_registered ${channels.length}`,
          `moonwitness_channel_status_available ${liveness}`,
          ...(connected.length ? connected : []),
        ]),
        metric('moonwitness_sse_streams_open', 'Server-sent streams this process is holding right now.', 'gauge', [
          `moonwitness_sse_streams_open ${m.streams.open}`,
        ]),
        metric('moonwitness_sse_streams_total', 'Streams opened since boot; a reconnecting client shows up here, not in the gauge.', 'counter', [
          `moonwitness_sse_streams_total ${m.streams.opened}`,
        ]),
        // Bus counters arrive pre-labelled, so they are grouped by family name to
        // keep one # TYPE per metric (a repeated TYPE line is a scrape error).
        ...Object.entries(
          [...m.counters].reduce<Record<string, string[]>>((families, [key, value]) => {
            const base = key.split('{')[0] ?? key
            const lines = (families[base] ??= [])
            lines.push(`moonwitness_${key} ${value}`)
            return families
          }, {}),
        ).map(([base, lines]) => metric(`moonwitness_${base}`, 'Counts emitted by the moonql bus.', 'counter', lines)),
        metric('moonwitness_http_requests_total', 'Requests by route pattern and status class.', 'counter', requests),
        metric('moonwitness_http_request_duration_seconds', 'Time spent serving requests, per route pattern.', 'counter', duration),
        metric('moonwitness_metrics_dropped_series_total', 'Route keys refused by the cardinality budget.', 'counter', [
          `moonwitness_metrics_dropped_series_total ${m.droppedKeys}`,
        ]),
      ].join('\n')

      reply.type('text/plain; version=0.0.4; charset=utf-8')
      return `${body}\n`
    },
  )
}

export default metricsRoutes
