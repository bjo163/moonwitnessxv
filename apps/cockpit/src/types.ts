export type ServiceType = 'service' | 'worker'

export interface ServiceDefinition {
  tag: string
  name: string
  pkg: string
  port?: number
  type?: ServiceType
  color: string
  icon: string
  description?: string
  url?: string
  healthEndpoint?: string
  command?: string
  env?: Record<string, string>
  /**
   * Ordered environment variable names the app reads to choose its listen port.
   * The first defined one wins; if none is set the static `port` is used. This
   * lets the port guard probe the exact port the spawned child will bind
   * instead of the hard-coded default (see ProcessSupervisor.resolvePort).
   */
  envPortKeys?: string[]
  /**
   * Environment variable injected into the child so its bind port always
   * equals the probed port. Used where the app reads a generic `PORT` that a
   * sibling service also sets in `.env` (SKYLINK inheriting the hub's `PORT`).
   */
  portPinKey?: string
}

export interface MoondeckWindowConfig {
  width?: number
  height?: number
  frameless?: boolean
}

export interface MoondeckConfig {
  title: string
  port: number
  window?: MoondeckWindowConfig
  services: ServiceDefinition[]
}

export interface LogEntry {
  id: string
  timestamp: string
  tag: string
  level: 'info' | 'warn' | 'error'
  message: string
  raw?: string
}

export interface ServiceState {
  tag: string
  name: string
  pkg: string
  status: 'STOPPED' | 'STARTING' | 'RUNNING' | 'ERROR'
  pid?: number
  port?: number
  uptimeSeconds: number
  restarts: number
  /**
   * Machine-readable failure reason the UI localizes (e.g. 'PORT_BUSY'). The
   * human sentence in `lastError` is kept for the log ledger only, so the wire
   * never carries untranslated operator copy.
   */
  lastErrorCode?: 'PORT_BUSY' | 'PORT_NOT_RELEASED' | 'SPAWN_FAILED'
  lastErrorPort?: number
  lastError?: string
}
