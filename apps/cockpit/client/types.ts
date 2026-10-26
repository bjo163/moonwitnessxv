export type ChannelMediaType = 'bgm' | 'radio' | 'iptv'

export interface ChannelItem {
  id: string
  name: string
  streamUrl: string
  type: ChannelMediaType
  genre: string
  country?: string
  icon: string
  description?: string
}

export interface ServiceState {
  tag: string
  name: string
  pkg: string
  status: 'RUNNING' | 'STOPPED' | 'STARTING' | 'ERROR'
  pid?: number
  uptimeSeconds: number
  restarts: number
  lastError?: string
}

export interface AppConfig {
  repoRoot: string
  services: Array<{
    tag: string
    name: string
    pkg: string
    port?: number
    url?: string
    icon: string
    color: string
    description: string
  }>
}

export interface LogEntry {
  id: string
  timestamp: string
  service: string
  color: string
  message: string
  level: 'info' | 'warn' | 'error' | 'debug'
}

export type CockpitTab = 'logs' | 'preview' | 'media' | 'ledger' | 'ports'
