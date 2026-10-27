import fp from 'fastify-plugin'
import type { ApiOk, ApiError } from '@moonwitness/core'

// Re-exported for consumers/tests; the contract itself lives in @moonwitness/core.
export type { ApiOk, ApiError }

/**
 * THE response contract, in one place: every JSON response leaving the app is
 * wrapped here — successes into `{ ok: true, data, timestamp }`, failures into
 * `{ ok: false, error: { statusCode, message, details? }, timestamp }`.
 * Routes/services just return their data or throw — no per-route formatting.
 *
 * Skipped for the OpenAPI surface (`/docs*`), non-JSON payloads and streams.
 */
export default fp(async (fastify) => {
  fastify.addHook('onSend', async (request, reply, payload) => {
    if (request.url.startsWith('/docs')) return payload

    const contentType = reply.getHeader('content-type')
    if (typeof contentType !== 'string' || !contentType.includes('application/json')) return payload
    if (reply.statusCode === 204 || payload == null || typeof payload !== 'string') return payload

    // Fastify has already serialised the handler's return value with the route's
    // response schema, so the envelope is applied to that text — wrapping before
    // serialization would have the schema strip `ok`/`data` back off again.
    if (reply.statusCode < 400) {
      // Success: one flat concatenation, no parse/re-stringify. A bare JSON
      // primitive (string/number/bool/null) is a valid `data` value, so it is
      // wrapped too — a 2xx JSON response always carries the {ok,data,timestamp}
      // contract, and consumers never have to guess whether a scalar was wrapped.
      return `{"ok":true,"data":${payload},"timestamp":${JSON.stringify(new Date().toISOString())}}`
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(payload)
    } catch {
      return payload
    }

    const src = (parsed ?? {}) as Record<string, unknown>
    const body: ApiError = {
      ok: false,
      error: {
        statusCode: (src.statusCode as number) ?? reply.statusCode,
        message: (src.message as string) ?? 'Request failed',
        ...(src.validation ? { details: src.validation } : {}),
      },
      timestamp: new Date().toISOString(),
    }
    return JSON.stringify(body)
  })
}, { name: 'response-envelope' })
