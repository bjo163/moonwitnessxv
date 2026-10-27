export type ServiceType = 'service' | 'worker' | 'web'

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
  lastError?: string
}
