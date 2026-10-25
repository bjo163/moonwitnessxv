// Small TCP helpers shared by scripts/dev.mjs and scripts/free-ports.mjs.
import { createServer } from 'node:net'

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
