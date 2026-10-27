// Small TCP and port-resolution helpers shared by scripts/dev.mjs and
// scripts/free-ports.mjs.
import { createServer } from 'node:net'

/**
 * The hub's listen-port spellings, in the order `apps/arsy/src/config.ts`
 * resolves them: canonical `ARSY_PORT`, documented legacy alias `RADIO_PORT`,
 * then the generic `PORT`. These scripts are plain JS and run before the
 * workspace is built, so they keep their own literals; the ARSY env-contract
 * test is what keeps this list honest.
 */
const HUB_PORT_ALIASES = ['ARSY_PORT', 'RADIO_PORT', 'PORT']

/** True when `port` can be bound right now (a killed listener can linger briefly). */
export function isPortFree(port) {
  return new Promise((resolve) => {
    const server = createServer()
    server.unref()
    server.once('error', () => resolve(false))
    server.once('listening', () => server.close(() => resolve(true)))
    server.listen(port, '0.0.0.0')
  })
}

/** Retries until every port is bindable; returns the ports still busy (empty = ok). */
export async function waitForPortsFree(ports, timeoutMs = 15000, intervalMs = 250) {
  const deadline = Date.now() + timeoutMs
  let busy = ports
  while (Date.now() < deadline) {
    busy = []
    for (const port of ports) if (!(await isPortFree(port))) busy.push(port)
    if (busy.length === 0) return []
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
  return busy
}

/**
 * Resolve the hub port a dev environment asks for, with the same deterministic
 * alias rule the hub itself applies (apps/arsy/src/config.ts): a legacy
 * `RADIO_PORT` is accepted on its own, the canonical `ARSY_PORT` wins over the
 * generic `PORT`, and two spellings that are both set must agree — otherwise the
 * runner would pre-flight one port while the hub binds another. Empty values
 * mean "not set", exactly like the hub's parser treats them.
 *
 * @returns {number} the port the hub will bind
 * @throws {Error} when the configured spellings conflict or one is not a port
 */
export function resolveHubPort(env, fallbackPort) {
  const configured = []
  for (const key of HUB_PORT_ALIASES) {
    const raw = env[key]
    if (raw === undefined || raw === '') continue
    const port = Number(raw)
    if (!Number.isInteger(port) || port < 1 || port > 65535)
      throw new Error(`Invalid hub port in ${key}: "${raw}" is not a usable TCP port number.`)
    configured.push({ key, port })
  }
  if (configured.length === 0) return fallbackPort
  const { port } = configured[0]
  if (configured.some((entry) => entry.port !== port)) {
    throw new Error(
      `Conflicting environment aliases for ARSY_PORT: ${configured.map((entry) => entry.key).join(', ')} must have the same value.`,
    )
  }
  return port
}
