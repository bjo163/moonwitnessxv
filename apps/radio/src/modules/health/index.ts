import type { TypedModule } from '../../lib/types.js'

const PROBE_TIMEOUT_MS = 2000

// System health module -> mounted at <apiPrefix>/health
const healthRoutes: TypedModule = async (fastify) => {
  const orm = fastify.moonql

  /** Never let a dead database hang the probe: answer 503 instead. */
  const probeEngine = async (): Promise<string> => {
    const work = async (): Promise<string> => {
      if (orm.engine === 'pg') {
        if (!orm.client) throw new Error('pg engine without a connection')
        await orm.client`select 1`
      }
      return orm.engine
    }
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`engine probe timed out after ${PROBE_TIMEOUT_MS}ms`)), PROBE_TIMEOUT_MS).unref(),
    )
    return Promise.race([work(), timeout])
  }

  fastify.get(
    '/',
    {
      schema: {
        tags: ['system'],
        summary: 'Liveness probe',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'ok' },
              uptime: { type: 'number', example: 123.4 },
              channels: { type: 'number', description: 'Number of active channels', example: 1 },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
    async () => ({
      status: 'ok' as const,
      uptime: process.uptime(),
      channels: fastify.channels.list().length,
      timestamp: new Date().toISOString(),
    }),
  )

  // Readiness: the answer Docker/compose should gate traffic on. Liveness above
  // only says the process is up; this one proves the engine actually answers.
  fastify.get(
    '/ready',
    {
      schema: {
        tags: ['system'],
        summary: 'Readiness probe (engine reachable)',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'ready' },
              engine: { type: 'string', example: 'pg' },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
          503: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'not-ready' },
              engine: { type: 'string' },
              error: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      const engine = orm.engine
      const timestamp = new Date().toISOString()
      try {
        await probeEngine()
        return { status: 'ready' as const, engine, timestamp }
      } catch (err) {
        void reply.status(503)
        return { status: 'not-ready' as const, engine, error: (err as Error).message, timestamp }
      }
    },
  )
}

export default healthRoutes
