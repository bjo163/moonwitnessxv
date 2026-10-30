import { spawn } from 'node:child_process'
import { isIP } from 'node:net'

/**
 * The read-only measures M51-07 accepts. A measure is only ever aimed at an
 * address an operator registered for their own tenant, so this module has no
 * notion of discovery: one target, one attempt, one verdict.
 *
 * `unreachable` means the probe ran and the node did not answer. `unknown` means
 * this process could not run the probe at all (no ICMP helper, an address this
 * measure cannot express, an unsupported measure). Showing an absent measurement
 * as a healthy or failed state would be a lie an operator could act on.
 */
export type Measure = 'healthy' | 'degraded' | 'unreachable' | 'unknown'

export interface ProbeOutcome {
  measure: Measure
  detail: string
}

export interface ProbeDeps {
  /** Injectable so tests never open a socket; the default is the real fetch. */
  fetchFn?: (url: string, init: RequestInit) => Promise<{ status: number }>
  /** Injectable so tests never spawn a process; the default is the platform ping. */
  pingFn?: (address: string, timeoutMs: number) => Promise<boolean>
  timeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = 3000

const boundedDetail = (value: string): string => (value.length > 200 ? `${value.slice(0, 199)}…` : value)

/**
 * A monitoring URL is built from a registered management address, so it may name
 * a private host — that is the whole point of ISP monitoring, and why this does
 * not go through the public-egress guard. Redirects are never followed: a stored
 * address must not turn one registered probe into a walk through other hosts.
 */
export function monitoringUrl(rawTarget: string): string | null {
  const target = rawTarget.trim()
  if (target.length === 0) return null
  if (/^https?:\/\//i.test(target)) {
    try {
      const url = new URL(target)
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
      return url.toString()
    } catch {
      return null
    }
  }
  const firstSlash = target.indexOf('/')
  const head = firstSlash < 0 ? target : target.slice(0, firstSlash)
  const tail = firstSlash < 0 ? '' : target.slice(firstSlash)
  if (head.length === 0) return null
  // host and host/path all arrive as a registered management address.
  // A bare IPv6 literal has to be bracketed, or the first colon reads as a port.
  if (isIP(head) === 6) return `http://[${head}]${tail}`
  if (head.includes(':')) {
    const separator = head.lastIndexOf(':')
    const host = head.slice(0, separator)
    const port = Number(head.slice(separator + 1))
    // A colon here is either a port or a stored address that already names another
    // protocol. Prefixing the second with http:// would report the resulting
    // nonsense as an outage, so a data-entry mistake is refused as unknown instead.
    if (host.length === 0 || host.includes(':') || !Number.isInteger(port) || port < 1 || port > 65_535) return null
    return `http://${host}:${head.slice(separator + 1)}${tail}`
  }
  return `http://${head}${tail}`
}

async function httpRead(target: string, deps: ProbeDeps): Promise<ProbeOutcome> {
  const url = monitoringUrl(target)
  if (!url) return { measure: 'unknown', detail: `http-read needs an http(s) address, got ${boundedDetail(target)}` }
  const timeoutMs = deps.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const signal = AbortSignal.timeout(timeoutMs)
  try {
    const response = await (deps.fetchFn ?? fetch)(url, { method: 'GET', redirect: 'manual', signal })
    if (response.status >= 200 && response.status < 300) return { measure: 'healthy', detail: `HTTP ${response.status} from ${url}` }
    // An answer at all means the node is up; a wrong answer is a sick service.
    // Only silence is unreachable.
    return { measure: 'degraded', detail: `HTTP ${response.status} from ${url}` }
  } catch (err) {
    return { measure: 'unreachable', detail: `${url} did not answer: ${boundedDetail(String((err as Error).name ?? err))}` }
  }
}

/**
 * ICMP needs a raw socket, which a Node process is not allowed to open. The
 * platform `ping` helper is the only unprivileged way to ask the question, and
 * its absence is reported as `unknown` rather than as a dead node.
 */
async function icmpRead(target: string, deps: ProbeDeps): Promise<ProbeOutcome> {
  const address = target.trim()
  if (isIP(address) === 0) {
    // A hostname would have to be resolved first, and a registered address that
    // is not a literal is a data-entry mistake the operator should see, not a
    // probe that silently depends on this host's resolver.
    return { measure: 'unknown', detail: `icmp needs an IP literal, got ${boundedDetail(address)}` }
  }
  const timeoutMs = deps.timeoutMs ?? DEFAULT_TIMEOUT_MS
  try {
    const answered = await (deps.pingFn ?? platformPing)(address, timeoutMs)
    return answered
      ? { measure: 'healthy', detail: `${address} answered ICMP within ${timeoutMs}ms` }
      : { measure: 'unreachable', detail: `${address} did not answer ICMP within ${timeoutMs}ms` }
  } catch (err) {
    return { measure: 'unknown', detail: `no ICMP helper here: ${boundedDetail(String((err as Error).message ?? err))}` }
  }
}

function platformPing(address: string, timeoutMs: number): Promise<boolean> {
  const args = process.platform === 'win32'
    ? ['-n', '1', '-w', String(timeoutMs), address]
    : ['-c', '1', '-W', String(Math.max(1, Math.round(timeoutMs / 1000))), address]
  return new Promise((resolve, reject) => {
    // No shell, and the only argument that came from data is an IP literal that
    // isIP already accepted.
    const child = spawn('ping', args, { windowsHide: true })
    let settled = false
    child.on('error', (err) => {
      if (settled) return
      settled = true
      reject(err)
    })
    child.on('close', (code) => {
      if (settled) return
      settled = true
      resolve(code === 0)
    })
  })
}

/**
 * An SNMP read needs a community string, and D20 is the one place this platform
 * forbids a device credential. Until a secret-mounted community source is
 * accepted for ARSY, asking the question at all is out of bounds, so the measure
 * reports itself as unknown instead of pretending to have tried.
 */
function snmpRead(target: string): ProbeOutcome {
  return { measure: 'unknown', detail: `snmp-read has no credential source in this runtime: ${boundedDetail(target)} was not probed` }
}

export async function probeTarget(probeKind: string, target: string, deps: ProbeDeps = {}): Promise<ProbeOutcome> {
  if (probeKind === 'http-read') return httpRead(target, deps)
  if (probeKind === 'icmp') return icmpRead(target, deps)
  if (probeKind === 'snmp-read') return snmpRead(target)
  return { measure: 'unknown', detail: `no measure registered for probe kind ${boundedDetail(probeKind)}` }
}
