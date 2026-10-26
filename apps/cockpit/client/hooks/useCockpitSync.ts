import { useState, useEffect } from 'react'
import type { AppConfig, ChannelItem, LogEntry, ProgressPayload, ServiceState } from '../types'

export function useCockpitSync(setChannels: (fn: (prev: ChannelItem[]) => ChannelItem[]) => void) {
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [serviceStates, setServiceStates] = useState<Record<string, ServiceState>>({})
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [clock, setClock] = useState('')
  const [uptime, setUptime] = useState(0)
  // The register payload rides this stream instead of a second EventSource: one
  // socket per page, one tracker listener per page, one per-host connection.
  const [progressPayload, setProgressPayload] = useState<ProgressPayload | null>(null)
  const [progressLive, setProgressLive] = useState(false)

  // Clock
  useEffect(() => {
    const update = () => {
      const now = new Date()
      setClock(now.toTimeString().split(' ')[0] ?? '')
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])

  // Initial config, status & channels
  useEffect(() => {
    void (async () => {
      try {
        const [cfgRes, statRes, chRes] = await Promise.all([
          fetch('/api/config'),
          fetch('/api/status'),
          fetch('/api/channels'),
        ])
        const cfgData = (await cfgRes.json()) as AppConfig
        const statData = (await statRes.json()) as { services: ServiceState[]; system?: { uptime: number } }
        setConfig(cfgData)
        if (statData.system?.uptime) setUptime(Math.floor(statData.system.uptime))
        const map: Record<string, ServiceState> = {}
        for (const s of statData.services) {
          map[s.tag] = s
        }
        setServiceStates(map)

        if (chRes.ok) {
          const chData = (await chRes.json()) as ChannelItem[]
          if (Array.isArray(chData) && chData.length > 0) {
            setChannels(() => chData)
          }
        }
      } catch (err) {
        console.error('Failed to load initial cockpit data:', err)
      }
    })()
  }, [setChannels])

  // SSE Stream
  useEffect(() => {
    const es = new EventSource('/api/logs/stream')

    es.addEventListener('init', (e) => {
      try {
        const initialLogs = JSON.parse(e.data) as LogEntry[]
        setLogs(initialLogs)
      } catch {
        /* ignore */
      }
    })

    es.addEventListener('log', (e) => {
      try {
        const entry = JSON.parse(e.data) as LogEntry
        setLogs((prev) => {
          const next = [...prev, entry]
          return next.length > 1000 ? next.slice(-1000) : next
        })
      } catch {
        /* ignore */
      }
    })

    es.addEventListener('state', (e) => {
      try {
        const state = JSON.parse(e.data) as ServiceState
        setServiceStates((prev) => ({ ...prev, [state.tag]: state }))
      } catch {
        /* ignore */
      }
    })

    es.addEventListener('progress', (e) => {
      try {
        const next = JSON.parse((e as MessageEvent).data) as ProgressPayload
        setProgressLive(true)
        setProgressPayload(next)
      } catch {
        /* ignore malformed frame */
      }
    })

    es.addEventListener('error', () => {
      setProgressLive(false)
    })

    return () => {
      setProgressLive(false)
      es.close()
    }
  }, [])

  return {
    config,
    serviceStates,
    setServiceStates,
    logs,
    setLogs,
    clock,
    uptime,
    progressPayload,
    progressLive,
  }
}
