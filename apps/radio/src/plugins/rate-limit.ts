import fp from 'fastify-plugin'
import { httpError } from '@moonwitness/core'
import type { FastifyInstance } from 'fastify'

/**
 * Fixed-window limiter for the hub's unauthenticated entry points.
 *
 * `/auth/login` runs a real scrypt hash per attempt and `/listen` writes two
 * rows per call, so both are worth more than the request itself to a script.
 * Deliberately dependency-free and in-memory: the hub is a single process, and
 * a distributed limiter would be a promise it cannot keep.
 */
const LIMITED_SUFFIXES = ['/auth/login', '/listen', '/on-air']

export default fp(async (fastify: FastifyInstance) => {
  const { max, windowMs } = fastify.config.security.rateLimit
  const buckets = new Map<string, { count: number; resetAt: number }>()

  // expired buckets are dropped wholesale instead of carrying a timer per key
  const sweep = setInterval(() => {
    const now = Date.now()
    for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key)
  }, windowMs)
  sweep.unref()
  fastify.addHook('onClose', async () => clearInterval(sweep))

  fastify.addHook('preHandler', async (request, reply) => {
    const route = request.routeOptions.url ?? ''
    if (!LIMITED_SUFFIXES.some((suffix) => route.endsWith(suffix))) return
    const key = `${request.ip}|${route}`
    const now = Date.now()
    const bucket = buckets.get(key)
    const current = !bucket || bucket.resetAt <= now ? { count: 0, resetAt: now + windowMs } : bucket
    current.count += 1
    buckets.set(key, current)
    if (current.count <= max) return
    void reply.header('retry-after', Math.ceil((current.resetAt - now) / 1000))
    throw httpError(429, 'Too many requests — please slow down')
  })
}, { name: 'rate-limit' })
