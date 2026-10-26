export interface ServiceHealth {
  port: number
  name: string
  status: 'ONLINE' | 'OFFLINE'
  url: string
}

const SERVICES = [
  { port: 3000, name: 'ARSY Fastify Hub', path: '/health' },
  { port: 3001, name: 'Radio Dock', path: '/' },
  { port: 3002, name: 'Headquarters 100CENTER', path: '/api/session' },
  { port: 3003, name: 'AI Gateway & Sentinel', path: '/health' },
  { port: 3004, name: 'Moondeck Cockpit', path: '/api/status' },
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
        status: res.ok || res.status < 500 ? 'ONLINE' : 'OFFLINE',
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
