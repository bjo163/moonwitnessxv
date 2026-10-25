/**
 * The hub's only outbound door, and the rules that make it safe.
 *
 * Until now the server never fetched anything: every URL it touched came from a
 * browser. Catalog probing and "now playing" metadata change that, and a
 * server-side fetch of a user-supplied URL is the classic SSRF (imagine
 * `http://db:5432/` or `http://127.0.0.1:3000/api/v1/...` as a "stream URL").
 * Everything that leaves the process goes through here, from any layer — core
 * has no framework imports, so addons may use it too.
 */

const BLOCKED_HOSTS = new Set(['localhost', 'metadata.google.internal'])

/** literal IPv4/IPv6 that must never be fetched, whatever the DNS says */
export function isPrivateAddress(host: string): boolean {
  const h = host.replace(/^\[|\]$/g, '')
  if (/^127\.|^10\.|^192\.168\.|^169\.254\.|^0\./.test(h)) return true
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true
  if (/^::1$|^fc|^fd|^fe80/i.test(h)) return true
  return false
}

export interface FetchPolicy {
  /** default 2000 ms */
  timeoutMs?: number
  /** default 64 KB — a stream endpoint that answers with 40 MB is not metadata */
  maxBytes?: number
  /** injectable for tests */
  fetchImpl?: typeof fetch
  /** default: reject private/loopback/link-local targets */
  allowPrivateNetwork?: boolean
}

export class EgressError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EgressError'
  }
}

/** Parse a URL and refuse everything the policy forbids. Exported so it is testable. */
export function assertPublicHttpUrl(raw: string, allowPrivateNetwork = false): URL {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw new EgressError(`not a usable URL: ${raw.slice(0, 80)}`)
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new EgressError(`refused protocol ${url.protocol}`)
  }
  if (!allowPrivateNetwork) {
    const host = url.hostname.toLowerCase()
    if (BLOCKED_HOSTS.has(host) || isPrivateAddress(host)) {
      throw new EgressError(`refused private target ${host}`)
    }
  }
  return url
}

/**
 * GET a URL and parse it as JSON under the policy. Returns null on any failure:
 * a station whose status endpoint is down is a normal day, not an exception,
 * and a cron must not bring the hub's logs down with it.
 */
export async function fetchJsonWithPolicy<T = unknown>(
  raw: string,
  options: FetchPolicy = {},
): Promise<T | null> {
  const { timeoutMs = 2000, maxBytes = 64 * 1024, fetchImpl, allowPrivateNetwork = false } = options
  let url: URL
  try {
    url = assertPublicHttpUrl(raw, allowPrivateNetwork)
  } catch {
    return null
  }
  const run = fetchImpl ?? globalThis.fetch
  try {
    const response = await run(url.toString(), {
      method: 'GET',
      redirect: 'error',
      signal: AbortSignal.timeout(timeoutMs),
      headers: { accept: 'application/json', 'user-agent': 'moonwitness-hub/1.0 (+status probe)' },
    })
    if (!response.ok || !response.body) return null
    const reader = response.body.getReader()
    const chunks: Uint8Array[] = []
    let size = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      if (!value) continue
      size += value.byteLength
      if (size > maxBytes) {
        await reader.cancel()
        return null
      }
      chunks.push(value)
    }
    return JSON.parse(new TextDecoder().decode(concat(chunks))) as T
  } catch {
    return null
  }
}

/** join the byte chunks into one buffer */
function concat(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((n, c) => n + c.byteLength, 0)
  const out = new Uint8Array(total)
  let at = 0
  for (const chunk of chunks) {
    out.set(chunk, at)
    at += chunk.byteLength
  }
  return out
}

/**
 * "Is this stream URL answering?" — HEAD first, then a range-limited GET, because
 * plenty of broadcasters reject HEAD with 405 while serving audio happily.
 * Any 2xx/3xx answers alive; anything else (or a timeout) answers dead. Never
 * throws: the caller is a cron walking a catalog.
 */
export async function probeStream(
  raw: string,
  options: FetchPolicy = {},
): Promise<boolean> {
  const { timeoutMs = 2000, fetchImpl, allowPrivateNetwork = false } = options
  let url: URL
  try {
    url = assertPublicHttpUrl(raw, allowPrivateNetwork)
  } catch {
    return false
  }
  const run = fetchImpl ?? globalThis.fetch
  const attempt = async (method: 'HEAD' | 'GET'): Promise<boolean> => {
    try {
      const response = await run(url.toString(), {
        method,
        redirect: 'error',
        signal: AbortSignal.timeout(timeoutMs),
        headers: method === 'GET' ? { range: 'bytes=0-2047', accept: 'audio/*;q=1.0, */*;q=0.5' } : { accept: '*/*' },
      })
      await response.body?.cancel().catch(() => undefined)
      return response.status < 400
    } catch {
      return false
    }
  }
  if (await attempt('HEAD')) return true
  return attempt('GET')
}
