import type { ApiError, ApiOk } from '@moonwitness/core'
import { MoonApiError } from './errors.js'

/**
 * The hub's response envelope, built in one place.
 *
 * Every BFF route (dock beacon, now-playing, HQ session form, server actions)
 * used to hand-assemble its own de-grafted copy of `{ok,data,timestamp}` /
 * `{ok:false,error:{statusCode,message},timestamp}` — which is how client-side
 * error handling ended up seeing three different shapes, and how a hub 400 got
 * flattened into "502 everything".
 */

export interface RespondInit {
  status?: number
  headers?: Record<string, string>
}

/** 2xx success in the hub's shape. */
export function okJson<T>(data: T, init: RespondInit = {}): Response {
  const body: ApiOk<T> = { ok: true, data, timestamp: new Date().toISOString() }
  return Response.json(body, init)
}

/**
 * Failure in the hub's shape. A `MoonApiError` keeps the status the API returned
 * (so a bad request stays a 400); anything else is treated as a bad gateway.
 */
export function failJson(err: unknown, init: RespondInit & { message?: string } = {}): Response {
  const upstream = err instanceof MoonApiError ? err.statusCode : undefined
  const status = init.status ?? upstream ?? 502
  const body: ApiError = {
    ok: false,
    error: { statusCode: status, message: init.message ?? errorMessage(err) },
    timestamp: new Date().toISOString(),
  }
  return Response.json(body, { status, ...(init.headers ? { headers: init.headers } : {}) })
}

/** One rule for "what do I show the user about this error". */
export function errorMessage(err: unknown): string {
  if (err instanceof MoonApiError || err instanceof Error) return err.message
  return 'Unexpected error'
}
