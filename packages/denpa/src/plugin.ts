import type { FastifyPluginAsync } from 'fastify'
import { unauthorized, notFound } from '@moonwitness/core'
import { createDenpaStore } from './store.js'
import type { DenpaOptions } from './types.js'

const TransmissionSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    receivedAt: { type: 'string', format: 'date-time' },
    origin: { type: 'string' },
    payload: {}, // arbitrary JSON passthrough
  },
} as const

/**
 * DENPA 電波 — a dead-simple inbound webhook: stations/senders "transmit",
 * this receives. POST / catches a transmission, GET / lists the recent ones.
 * Encapsulated (not fastify-plugin) so the caller's `prefix` is honored.
 */
const denpaPlugin: FastifyPluginAsync<DenpaOptions> = async (fastify, opts) => {
  if (opts.enable === false) return

  const store = createDenpaStore(opts.limit)

  // Optional shared-secret gate for all routes.
  fastify.addHook('preHandler', async (request) => {
    if (opts.token && request.headers['x-denpa-key'] !== opts.token) {
      throw unauthorized('Invalid denpa key')
    }
  })

  // Receive a transmission (any JSON body).
  fastify.post('/', {
    schema: {
      tags: ['denpa'],
      summary: 'Receive a transmission',
      body: { type: 'object' },
      response: {
        202: {
          type: 'object',
          properties: { id: { type: 'string' }, receivedAt: { type: 'string' } },
        },
      },
    },
  }, async (request, reply) => {
    const t = store.put({ origin: request.ip, payload: request.body })
    opts.onReceive?.(t)
    reply.code(202)
    return { id: t.id, receivedAt: t.receivedAt }
  })

  // Recent transmissions, newest first.
  fastify.get('/', {
    schema: {
      tags: ['denpa'],
      summary: 'List recent transmissions (newest first)',
      querystring: {
        type: 'object',
        properties: { limit: { type: 'integer', minimum: 1, maximum: 1000, default: 50 } },
      },
      response: { 200: { type: 'array', items: TransmissionSchema } },
    },
  }, async (request) => {
    const { limit } = request.query as { limit?: number }
    return store.recent(limit)
  })

  // One transmission by id.
  fastify.get('/:id', {
    schema: {
      tags: ['denpa'],
      summary: 'Get a transmission by id',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
      response: { 200: TransmissionSchema },
    },
  }, async (request) => {
    const { id } = request.params as { id: string }
    const t = store.find(id)
    if (!t) throw notFound('Transmission not found')
    return t
  })
}

export default denpaPlugin
