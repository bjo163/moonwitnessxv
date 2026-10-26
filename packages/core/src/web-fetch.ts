/**
 * The hub's only outbound door, and the rules that make it safe.
 *
 * Until now the server never fetched anything: every URL it touched came from a
 * browser. Catalog probing and "now playing" metadata change that, and a
 * server-side fetch of a user-supplied URL is the classic SSRF (imagine
 * `http://db:5432/` or `http://127.0.0.1:3000/api/v1/...` as a "stream URL").
 * Everything that leaves the process goes through here, from any layer — core
 * has no framework imports, so addons may use it too.
 *
 * Two layers, because a literal check alone is not a denial of service:
 *   1. `assertPublicHttpUrl` — the URL as written: protocol, numeric hosts,
 *      denied names, denied ports, private literals.
 *   2. `assertEgressUrl` — where that name actually points. A public name that
 *      resolves to 127.0.0.1 (or to the compose service `db`) passes layer 1 and
 *      must still be refused, and every answer of a multi-A record has to pass,
 *      not just the first.
 * Resolution is injected: this module stays browser-safe (no `node:` imports, which
 * the lint config enforces for `core`) and the hub supplies the resolver at boot —
 * see `apps/radio/src/lib/egress.ts`, the one place allowed to import `node:dns`.
 */

/** hostnames that mean "inside our own perimeter", independent of DNS */
export const DEFAULT_DENY_HOSTS = ['localhost', 'db', 'radio', 'dock', 'headquarters', 'metadata.google.internal']

/** ports that are never a broadcast endpoint: the database, and the hub itself */
export const DEFAULT_DENY_PORTS = [5432]

/** `[::1]` -> `::1`, `DB.` -> `db` */
export function normalizeHost(host: string): string {
  return host
    .trim()
    .toLowerCase()
    .replace(/^\[|\]$/g, '')
    .replace(/\.$/, '')
}

/**
 * A host that can only be an address the URL parser did not normalise into
 * dotted form: `2130706433`, `0x7f000001`, `017700000001`. A DNS name is never
 * all digits or 0x-prefixed, so refusing them costs nothing and closes the gap
 * where the resolver (or the OS) reads them as an integer.
 */
function isNumericHost(host: string): boolean {
  return /^(?:0x[0-9a-f]+|\d+)$/.test(host) || /^0x[0-9a-f]+\./.test(host)
}

/** literal IPv4/IPv6 that must never be fetched, whatever the DNS says */
export function isPrivateAddress(host: string): boolean {
  const h = normalizeHost(host)

  // IPv4-mapped/embedded IPv6: `::ffff:127.0.0.1` or, after URL normalisation,
  // `::ffff:7f00:1`. Both mean the same v4 address, so both are re-checked as one.
  const mapped = /^::(?:ffff:)?(\d+\.\d+\.\d+\.\d+)$/.exec(h)
  if (mapped?.[1]) return isPrivateAddress(mapped[1])
  const mappedHex = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(h)
  if (mappedHex?.[1] && mappedHex[2]) {
    const value = Number.parseInt(mappedHex[1], 16) * 65536 + Number.parseInt(mappedHex[2], 16)
    return isPrivateAddress([24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join('.'))
  }

  // IPv4
  if (/^127\.|^10\.|^192\.168\.|^169\.254\.|^0\./.test(h)) return true
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true
  if (/^100\.(6[4-9]|[7-9]\d|1[0-2]\d)\./.test(h)) return true // CGNAT 100.64.0.0/10
  if (/^198\.(?:1[89])\./.test(h)) return true // benchmarking 198.18.0.0/15
  if (/^22[4-9]\.|^23\d\.|^24\d\.|^25[0-5]\./.test(h)) return true // multicast + reserved

  // IPv6
  if (h === '::1' || h === '::') return true
  if (/^f[cd][0-9a-f]{2}:/.test(h)) return true // unique local fc00::/7
  if (/^fe[89ab][0-9a-f]:/.test(h)) return true // link-local fe80::/10
  if (/^ff[0-9a-f]{2}:/.test(h)) return true // multicast
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
  /** override the installed resolver (tests); `[]` means "does not resolve" */
  resolveAddresses?: AddressResolver
}

/** Resolve a hostname to every address it answers with. */
export type AddressResolver = (host: string) => Promise<string[]>

let denyHosts = new Set(DEFAULT_DENY_HOSTS.map(normalizeHost))
let denyPorts = new Set(DEFAULT_DENY_PORTS)
let installedResolver: AddressResolver | null = null

/**
 * Boot-time wiring for the process: the host's own deny list (compose names, an
 * operator's `EGRESS_DENY_HOSTS`), the ports it listens on, and the resolver that
 * makes layer 2 possible. Called once by the hub; tests may call it with a stub.
 */
export function configureEgress(options: {
  denyHosts?: readonly string[]
  denyPorts?: readonly number[]
  resolveAddresses?: AddressResolver | null
}): void {
  denyHosts = new Set([...DEFAULT_DENY_HOSTS, ...(options.denyHosts ?? [])].map(normalizeHost))
  denyPorts = new Set([...DEFAULT_DENY_PORTS, ...(options.denyPorts ?? [])])
  if (options.resolveAddresses !== undefined) installedResolver = options.resolveAddresses
}

/** the effective rules, for a boot log line and for tests */
export function egressRules(): { denyHosts: string[]; denyPorts: number[]; resolving: boolean } {
  return { denyHosts: [...denyHosts].sort(), denyPorts: [...denyPorts].sort((a, b) => a - b), resolving: installedResolver !== null }
}

export class EgressError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EgressError'
  }
}

const LOOPBACK_NAMES = /^(?:localhost|127\.\d+\.\d+\.\d+|0\.0\.0\.0)$/

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
  const host = normalizeHost(url.hostname)
  if (isNumericHost(host)) {
    throw new EgressError(`refused numeric host ${host}: write the address in dotted form`)
  }
  if (allowPrivateNetwork) return url
  if (denyHosts.has(host) || LOOPBACK_NAMES.test(host) || isPrivateAddress(host)) {
    throw new EgressError(`refused private target ${host}`)
  }
  const port = url.port ? Number(url.port) : url.protocol === 'https:' ? 443 : 80
  if (denyPorts.has(port)) {
    throw new EgressError(`refused port ${port} on ${host}: that is a service port, not a broadcaster`)
  }
  return url
}

/**
 * The full gate: the URL as written, then every address its host resolves to.
 * Without an installed resolver only layer 1 runs — which is what happens in a
 * browser bundle, and is why the hub installs one at boot.
 */
export async function assertEgressUrl(raw: string, options: FetchPolicy = {}): Promise<URL> {
  const allowPrivateNetwork = options.allowPrivateNetwork ?? false
  const url = assertPublicHttpUrl(raw, allowPrivateNetwork)
  if (allowPrivateNetwork) return url

  const resolve = options.resolveAddresses ?? installedResolver
  if (!resolve) return url

  const host = normalizeHost(url.hostname)
  let addresses: string[]
  try {
    addresses = await resolve(host)
  } catch {
    throw new EgressError(`refused ${host}: the name does not resolve`)
  }
  if (addresses.length === 0) throw new EgressError(`refused ${host}: the name does not resolve`)
  for (const address of addresses) {
    // one private answer is enough: a round-robin record must not sneak one in
    if (isPrivateAddress(address)) throw new EgressError(`refused ${host}: it resolves to private ${address}`)
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
  const { timeoutMs = 2000, maxBytes = 64 * 1024, fetchImpl } = options
  let url: URL
  try {
    url = await assertEgressUrl(raw, options)
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
  const { timeoutMs = 2000, fetchImpl } = options
  let url: URL
  try {
    url = await assertEgressUrl(raw, options)
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
