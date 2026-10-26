export type DriverKind = 'rss' | 'api' | 'playwright' | 'openclaw' | 'agent'

export type SentimentKind = 'positive' | 'neutral' | 'critical' | 'alert'

export interface MonitorRadarInfo {
  id: string
  code: string
  name: string
  category: string
  priority: string
}

export interface MonitorSourceInfo {
  id: string
  handle: string
  name: string
  platform: string
  kind: string
  driver: DriverKind
  targetUrl: string
  externalTarget: string | null
}

export interface MonitorSourceTask {
  taskId: string
  source: MonitorSourceInfo
  radar: MonitorRadarInfo | null
}

export interface CapturedSignalInput {
  externalId: string
  title: string
  url: string
  author?: string | null
  summary?: string | null
  aiSummary?: string | null
  sentiment?: SentimentKind
  urgencyScore?: number
  viewsCount?: number
  likesCount?: number
  commentsCount?: number
  publishedAt?: string | null
}

export interface DriverContext {
  egressEnabled: boolean
  playwrightEndpoint?: string
  openclawEndpoint?: string
  agentEndpoint?: string
}

export interface MonitorDriver {
  readonly name: DriverKind
  readonly description: string
  collect(task: MonitorSourceTask, ctx: DriverContext): Promise<CapturedSignalInput[]>
}
