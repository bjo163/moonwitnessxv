/**
 * Sentinel OSINT Signals & Geospasial Radar Typings
 */
export type SignalSentiment = 'positive' | 'neutral' | 'critical' | 'alert'

export interface SentinelSignal {
  id: string
  externalId: string
  title: string
  url: string
  platform: 'youtube' | 'x' | 'rss' | 'gdacs' | 'usgs' | 'agent'
  author?: string | null
  summary?: string | null
  aiSummary?: string | null
  sentiment: SignalSentiment
  urgencyScore: number
  status: 'new' | 'reviewed' | 'escalated' | 'archived'
  detectedAt: string
}

export interface ThreatRadarBlip {
  id: string
  title: string
  lat: number
  lng: number
  urgency: number
  sentiment: SignalSentiment
  source: string
}
