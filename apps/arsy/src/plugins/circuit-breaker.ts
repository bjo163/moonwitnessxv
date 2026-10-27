import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'

export interface CircuitBreakerOptions {
  failureThreshold?: number
  cooldownPeriodMs?: number
  defaultTimeoutMs?: number
}

interface ServiceCircuit {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
  failureCount: number
  lastStateChange: number
  successCount: number
}

declare module 'fastify' {
  interface FastifyInstance {
    circuitBreaker: {
      execute: <T>(
        serviceName: string,
        action: () => Promise<T>,
        fallback: T | (() => Promise<T>),
        timeoutMs?: number,
      ) => Promise<T>
      getState: (serviceName: string) => 'CLOSED' | 'OPEN' | 'HALF_OPEN'
      reset: (serviceName: string) => void
    }
  }
}

/**
 * Fastify Bulkhead Isolation & Circuit Breaker Plugin
 *
 * Prevents downstream service failures (AI Gateway, Sentinel scrapers, remote webhooks)
 * from crashing or blocking the Fastify event loop, preserving core on-air radio streaming.
 */
const circuitBreakerPlugin: FastifyPluginAsync<CircuitBreakerOptions> = async (
  fastify,
  opts = {},
) => {
  const failureThreshold = opts.failureThreshold ?? 5
  const cooldownPeriodMs = opts.cooldownPeriodMs ?? 30_000
  const defaultTimeoutMs = opts.defaultTimeoutMs ?? 4_000

  const circuits = new Map<string, ServiceCircuit>()

  const getCircuit = (serviceName: string): ServiceCircuit => {
    let circuit = circuits.get(serviceName)
    if (!circuit) {
      circuit = {
        state: 'CLOSED',
        failureCount: 0,
        lastStateChange: Date.now(),
        successCount: 0,
      }
      circuits.set(serviceName, circuit)
    }
    return circuit
  }

  const execute = async <T>(
    serviceName: string,
    action: () => Promise<T>,
    fallback: T | (() => Promise<T>),
    timeoutMs = defaultTimeoutMs,
  ): Promise<T> => {
    const circuit = getCircuit(serviceName)
    const now = Date.now()

    // 1. Check if OPEN and in cooldown
    if (circuit.state === 'OPEN') {
      if (now - circuit.lastStateChange > cooldownPeriodMs) {
        circuit.state = 'HALF_OPEN'
        circuit.lastStateChange = now
        fastify.log.warn({ service: serviceName }, 'circuit-breaker: entering HALF_OPEN trial')
      } else {
        fastify.log.debug({ service: serviceName }, 'circuit-breaker: OPEN — short-circuiting to fallback')
        return typeof fallback === 'function' ? (fallback as () => Promise<T>)() : fallback
      }
    }

    // 2. Execute with bounded timeout
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      const result = await Promise.race([
        action(),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
          // Never let a bookkeeping timer keep the process alive on its own.
          timer.unref()
        }),
      ])

      // Success handling
      if (circuit.state === 'HALF_OPEN') {
        circuit.successCount++
        if (circuit.successCount >= 2) {
          circuit.state = 'CLOSED'
          circuit.failureCount = 0
          circuit.lastStateChange = now
          fastify.log.info({ service: serviceName }, 'circuit-breaker: recovered to CLOSED state')
        }
      } else {
        circuit.failureCount = 0
      }

      return result
    } catch (err) {
      circuit.failureCount++
      fastify.log.warn(
        { service: serviceName, failures: circuit.failureCount, err: (err as Error).message },
        'circuit-breaker: execution failed',
      )

      if (circuit.failureCount >= failureThreshold || circuit.state === 'HALF_OPEN') {
        circuit.state = 'OPEN'
        circuit.lastStateChange = now
        circuit.successCount = 0
        fastify.log.error(
          { service: serviceName, threshold: failureThreshold },
          'circuit-breaker: TRIPPED to OPEN state',
        )
      }

      return typeof fallback === 'function' ? (fallback as () => Promise<T>)() : fallback
    } finally {
      // The race has settled either way; without this the timer stays armed after
      // every fast call and accumulates pending timers under sustained traffic.
      if (timer !== undefined) clearTimeout(timer)
    }
  }

  fastify.decorate('circuitBreaker', {
    execute,
    getState: (serviceName: string) => getCircuit(serviceName).state,
    reset: (serviceName: string) => {
      const c = getCircuit(serviceName)
      c.state = 'CLOSED'
      c.failureCount = 0
      c.successCount = 0
      c.lastStateChange = Date.now()
    },
  })

  fastify.log.info('circuit-breaker: bulkhead isolation plugin mounted')
}

export default fp(circuitBreakerPlugin, {
  name: 'circuit-breaker',
  fastify: '5.x',
})
