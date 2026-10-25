import type { RadioConfig } from './config.js'
import type { MoonQlInstance } from '@moonwitness/moonql'
import type { HubMetrics } from './plugins/metrics.js'

// Central typed surface available on every Fastify instance.
declare module 'fastify' {
  interface FastifyInstance {
    config: RadioConfig
    channels: import('./lib/channels.js').ChannelManager
    /** The booted moonql ORM: registry, model repos, pg db when DATABASE_URL is set. */
    moonql: MoonQlInstance
    /** Route-pattern counters behind <apiPrefix>/metrics; cardinality is capped. */
    metrics: HubMetrics
  }
}

export {}
