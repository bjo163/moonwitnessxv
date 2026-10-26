import { timingSafeEqual } from 'node:crypto'
import type { FastifyPluginAsync } from 'fastify'
import { unauthorized, notFound } from '@moonwitness/core'
import { createDenpaStore } from './store.js'
import type { DenpaOptions } from './types.js'

/**
 * Shared-secret compare that does not leak the prefix length. `node:buffer`'s
 * timingSafeEqual is the same primitive the api-key hasher uses, and it needs two
 * equal-length buffers — a short key must fail, not be padded into place.
 */
function tokenMatches(given: string, expected: string): boolean {
  const a = Buffer.from(given, 'utf8')
  const b = Buffer.from(expected, 'utf8')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

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
    if (!opts.token) return
    const given = request.headers['x-denpa-key']
    // Constant-time compare: a plain !== leaks how many leading characters were
    // right, which turns an inbound webhook into a timing oracle for its own key.
    if (!tokenMatches(String(given ?? ''), opts.token)) {
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
