import { API_PREFIX, PORTS } from '@moonwitness/core'

export interface ServiceHealth {
  port: number
  name: string
  status: 'ONLINE' | 'OFFLINE'
  url: string
}

/**
 * Probes are pointed at routes that answer 2xx without a session: the hub's
 * liveness pair under the API prefix, the dock's homepage, HQ's login screen
 * (its middleware redirects `/`), and the two services' own `/health`.
 * Ports come from the shared contract — this file used to re-type 3000-3004 and
 * probe a cockpit path that does not exist.
 */
const SERVICES = [
  { port: PORTS.hub, name: 'Radio Core Hub (ARSY)', path: `${API_PREFIX}/health` },
  { port: PORTS.dock, name: 'Public Radio Dock', path: '/' },
  { port: PORTS.headquarters, name: 'Command Headquarters', path: '/login' },
  { port: PORTS.aigateway, name: 'AI Gateway Router', path: '/health' },
  { port: PORTS.cockpit, name: 'Moondeck Cockpit', path: '/health' },
]

export async function checkMonorepoServices(): Promise<ServiceHealth[]> {
  const results: ServiceHealth[] = []

  for (const s of SERVICES) {
    const url = `http://127.0.0.1:${s.port}${s.path}`
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 1000)
      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timer)

      results.push({
        port: s.port,
        name: s.name,
        // a 404 is not "online": it means the probe path and the service drifted
        // apart, which is exactly what the old `status < 500` test hid
        status: res.ok ? 'ONLINE' : 'OFFLINE',
        url: `http://127.0.0.1:${s.port}`,
      })
    } catch {
      results.push({
        port: s.port,
        name: s.name,
        status: 'OFFLINE',
        url: `http://127.0.0.1:${s.port}`,
      })
    }
  }

  return results
}
