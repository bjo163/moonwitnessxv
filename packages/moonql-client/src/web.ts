import { HUB_API_DEFAULT } from '@moonwitness/core'
import { createMoonClient, type MoonClient, type MoonClientOptions } from './client.js'

/**
 * The shared web kit for the two Next surfaces.
 *
 * Dock and headquarters each carried their own copy of three small decisions —
 * how the hub URL is read, how a server client is built, how a dropped live feed
 * is retried. Every one of them is a place where the two apps could disagree, so
 * they live here once and the apps delegate.
 */

/**
 * Resolve the hub's API root from a server environment.
 *
 * The environment is passed in rather than read here because this module is also
 * imported by client bundles: a bare `process.env` in that graph is a runtime hole
 * in the browser, and a URL baked into a client would hand the hub's address (plus
 * any token header) to the visitor.
 */
export function apiBaseUrl(env: Record<string, string | undefined>): string {
  const preferred = env.ARSY_API_URL
  const legacy = env.RADIO_API_URL
  if (preferred !== undefined && legacy !== undefined && preferred !== legacy) {
    throw new Error('Conflicting Hub URL settings: ARSY_API_URL and RADIO_API_URL must have the same value.')
  }
  return String(preferred ?? legacy ?? HUB_API_DEFAULT).replace(/\/+$/, '')
}

/** A server-side client, configured the same way on both surfaces. */
export function createServerSdk(options: {
  env: Record<string, string | undefined>
  token?: MoonClientOptions['token']
  fetch?: MoonClientOptions['fetch']
}): MoonClient {
  return createMoonClient({ baseUrl: apiBaseUrl(options.env), token: options.token, fetch: options.fetch })
}

/**
 * A relative client for same-origin BFF routes (`/api/...`).
 *
 * The browser never learns where the hub lives: it talks to its own Next app,
 * which proxies to the hub with the session cookie or a server-side token.
 */
export function sameOriginSdk(baseUrl = ''): MoonClient {
  return createMoonClient({ baseUrl })
}

export interface LiveStreamOptions {
  /** path on the passed client, e.g. `/api/ops/stream` or `/on-air` */
  path: string
  query?: Record<string, string | number | boolean | undefined>
  onEvent: (data: unknown, event: string) => void
  /** reports the connection state so the UI can show a truthful indicator */
  onState?: (state: 'connecting' | 'live' | 'down') => void
  /** caller-owned abort: unmount, navigation, a user pressing stop */
  signal?: AbortSignal
  minRetryMs?: number
  maxRetryMs?: number
}

/**
 * A live feed that survives being interrupted.
 *
 * `EventSource` reconnects on its own, and for a hub that materialises a real
 * generator per subscriber (bus subscription, socket, pool pressure) an invisible
 * reconnect loop is a slow leak. So this retries on a bounded exponential backoff,
 * reports what it is doing, and stops the moment the caller aborts. A stream that
 * ends cleanly (`done`) is not an error and is not retried forever: it is normal —
 * the server caps how long any one stream may stay open.
 */
export function openLiveStream(client: MoonClient, options: LiveStreamOptions): () => void {
  const { path, query, onEvent, onState, signal, minRetryMs = 1_000, maxRetryMs = 30_000 } = options
  let attempt = 0
  let cancelled = false
  let controller: AbortController | null = null
  let timer: ReturnType<typeof setTimeout> | undefined

  const stopped = (): boolean => cancelled || signal?.aborted === true

  const run = async (): Promise<void> => {
    if (stopped()) return
    controller = new AbortController()
    const local = controller
    onState?.('connecting')
    try {
      await client.stream(path, {
        query,
        signal: local.signal,
        onEvent,
        // the server accepted the feed: say so now, not at the first frame, because
        // a quiet but connected stream is exactly what "live" is supposed to mean
        onOpen: () => onState?.('live'),
      })
      if (stopped()) return
      // a clean end is the server's window closing: reconnect after the shortest delay
      attempt = 0
      onState?.('down')
    } catch {
      if (stopped()) return
      onState?.('down')
    }
    if (stopped()) return
    const delay = Math.min(maxRetryMs, minRetryMs * 2 ** attempt++)
    timer = setTimeout(() => void run(), delay)
  }

  const dispose = (): void => {
    cancelled = true
    if (timer) clearTimeout(timer)
    controller?.abort()
  }

  signal?.addEventListener('abort', dispose, { once: true })
  void run()
  return dispose
}
