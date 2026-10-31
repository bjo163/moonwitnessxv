import type { AppConfig, ServiceState } from '../types'

export interface PortRow {
  tag: string
  name: string
  port?: number
  url?: string
  running: boolean
  worker: boolean
}

/**
 * Derived from /api/config, which is the single source of truth for port
 * ownership (packages/core PORTS mirrored into tools/cockpit/src/config.ts).
 * A static port table here once drifted from that truth; nothing may re-add one.
 * "Bound" means an actual listener was probed on that port, so a service started
 * by `pnpm dev` reads as bound even though the cockpit does not manage it.
 */
export function buildPortRows(
  config: AppConfig | null,
  serviceStates: Record<string, ServiceState>,
  portStatus: Record<string, boolean>,
): PortRow[] {
  if (!config) return []
  const supervised: PortRow[] = config.services.map((svc) => ({
    tag: svc.tag,
    name: svc.name,
    port: svc.port,
    url: svc.url,
    running: portStatus[svc.tag] ?? serviceStates[svc.tag]?.status === 'RUNNING',
    worker: svc.type === 'worker',
  }))
  // The supervisor serves this page itself, so it is bound by definition.
  const self: PortRow = {
    tag: 'cockpit',
    name: 'Cockpit',
    port: config.port,
    url: `http://127.0.0.1:${String(config.port)}`,
    running: true,
    worker: false,
  }
  return [self, ...supervised]
}

/**
 * Preview shortcuts are derived from /api/config so they can never drift from
 * real port ownership. A `:<port>` suffix keeps the chip label unambiguous
 * without hardcoding a number.
 */
export function previewShortcuts(config: AppConfig | null): Array<{ label: string; url: string }> {
  if (!config) return []
  return config.services
    .filter((svc) => svc.type !== 'worker' && svc.port !== undefined && svc.url)
    .map((svc) => ({ label: `${svc.name} :${String(svc.port)}`, url: svc.url as string }))
}
