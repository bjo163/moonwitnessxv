import { serverClient } from '@/data/sdk'

/**
 * SSE relay: hub `/on-air` -> the browser.
 *
 * The visitor's origin stays this Next app; the hub's address and any header the
 * server client uses never enter the client bundle. When the browser goes away the
 * upstream generator is aborted, so a closed tab cannot leave a subscription on the
 * hub's bus. Reconnection is the client's job (`openLiveStream` in the shared kit):
 * each retry arrives as a fresh request here and opens one bounded upstream window.
 */
export const dynamic = 'force-dynamic'

/** Match the hub's own window so the relay never outlives the stream it mirrors. */
const UPSTREAM_SECONDS = 300

export async function GET(request: Request): Promise<Response> {
  const controller = new AbortController()
  const relayAbort = (): void => controller.abort()
  request.signal.addEventListener('abort', relayAbort, { once: true })

  const encoder = new TextEncoder()
  const write = (sink: { enqueue(chunk: Uint8Array): void }, frame: string): void => {
    try {
      sink.enqueue(encoder.encode(frame))
    } catch {
      /* the reader is already gone */
    }
  }

  const body = new ReadableStream<Uint8Array>({
    async start(sink) {
      write(sink, ':connected\n\n')
      try {
        await serverClient().stream('/on-air', {
          query: { seconds: UPSTREAM_SECONDS },
          signal: controller.signal,
          onEvent: (data) => write(sink, `data: ${JSON.stringify(data)}\n\n`),
        })
      } catch {
        // an upstream failure ends this response; the client decides whether to return
      } finally {
        request.signal.removeEventListener('abort', relayAbort)
        try {
          sink.close()
        } catch {
          /* already closed */
        }
      }
    },
    cancel: () => controller.abort(),
  })

  return new Response(body, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'x-accel-buffering': 'no',
    },
  })
}
