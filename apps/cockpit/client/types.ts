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

export type CockpitTab = 'logs' | 'preview' | 'media' | 'ledger' | 'ports' | 'progress'

export type TodoTaskStatus = 'done' | 'open'

export interface TodoTask {
  id: string
  title: string
  status: TodoTaskStatus
  priority: string
  difficulty: string
  milestone: string
}

export interface MilestoneProgress {
  id: string
  done: number
  open: number
  total: number
  percent: number
  group: string
}

export interface GroupProgress {
  id: string
  label: string
  done: number
  open: number
  total: number
  percent: number
}

export interface PriorityProgress {
  done: number
  open: number
  total: number
}

export interface ProgressFlip {
  taskId: string
  from: TodoTaskStatus
  to: TodoTaskStatus
  at: string
}

export interface ProgressPoint {
  at: string
  done: number
  total: number
  percent: number
}

/** Mirrors apps/cockpit/src/progressTracker.ts ProgressPayload. */
export interface ProgressPayload {
  generatedAt: string
  total: number
  done: number
  open: number
  percent: number
  milestones: MilestoneProgress[]
  groups: GroupProgress[]
  priorities: Record<string, PriorityProgress>
  openP0: string[]
  tasks: TodoTask[]
  source: 'TODO.md'
  registerPath: string
  ready: boolean
  stale: boolean
  flipLog: ProgressFlip[]
  history: ProgressPoint[]
  error?: string
  delta?: {
    since: string
    flips: ProgressFlip[]
    netClosed: number
  }
}

export interface TodoTaskQueryResult {
  rows: TodoTask[]
  matched: number
  returned: number
  total: number
  done: number
  open: number
}
