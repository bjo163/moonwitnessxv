import { SSE_HEADERS } from '@moonwitness/core'
import { RADIO_API_URL } from '@/lib/env'
import { readToken } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * SSE proxy: the browser opens one EventSource on its own origin, the token
 * stays in the cookie and is attached server-side.
 *
 * Raw byte passthrough is deliberate: the SDK's `stream()` parses frames, which
 * here would mean re-serializing them and losing exactly what the feed exists to
 * show. The hub owns the SSE contract; this route only adds the session.
 */
const MAX_STREAM_SECONDS = 300

/** keep every upstream param, but never let a client ask for an open-ended stream */
function upstreamQuery(search: string): string {
  const params = new URLSearchParams(search)
  const requested = Number(params.get('seconds') ?? '')
  params.set(
    'seconds',
    String(Number.isFinite(requested) && requested > 0 ? Math.min(requested, MAX_STREAM_SECONDS) : MAX_STREAM_SECONDS),
  )
  return params.toString()
}

export async function GET(request: Request): Promise<Response> {
  const token = await readToken()
  if (!token) return new Response('unauthorized', { status: 401 })

  const query = upstreamQuery(new URL(request.url).search)
  const upstream = await fetch(`${RADIO_API_URL}/ops/stream?${query}`, {
    headers: { authorization: `Bearer ${token}`, accept: 'text/event-stream' },
    signal: request.signal,
    cache: 'no-store',
  })

  if (!upstream.ok || !upstream.body) {
    const message = await upstream.text().catch(() => 'stream unavailable')
    return new Response(message, { status: upstream.status || 502 })
  }

  return new Response(upstream.body, {
    status: 200,
    headers: SSE_HEADERS,
  })
}
