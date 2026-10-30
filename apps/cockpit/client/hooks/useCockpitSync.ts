import { useState, useEffect, useRef } from 'react'
import type { AppConfig, ChannelItem, LogEntry, ProgressPayload, ServiceState } from '../types'
import { setCockpitToken } from '../lib/cockpit-token'

/**
 * Where the channel rack currently on screen came from.
 * 'builtin-fallback' is a real, visible state: the server rack could not be
 * read, so custom channels added earlier are not in this list.
 */
export type RackSource = 'pending' | 'server' | 'builtin-fallback'

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
  // Live listener truth per tag from /api/status: a port occupied by `pnpm dev`
  // must not be shown as free just because the cockpit did not spawn it.
  const [portStatus, setPortStatus] = useState<Record<string, boolean>>({})
  const [rackSource, setRackSource] = useState<RackSource>('pending')
  // Wall-clock time at which the cockpit process started, derived once from the
  // first /api/status snapshot so the displayed uptime can tick locally without
  // re-polling the server every second.
  const bootAtRef = useRef<number | null>(null)

  // Clock
  useEffect(() => {
    const update = () => {
      const now = new Date()
      setClock(now.toTimeString().split(' ')[0] ?? '')
      if (bootAtRef.current !== null) {
        setUptime(Math.floor((Date.now() - bootAtRef.current) / 1000))
      }
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
        const cfgData = (await cfgRes.json()) as AppConfig & { token?: string }
        if (cfgData.token) setCockpitToken(cfgData.token)
        const statData = (await statRes.json()) as { services: ServiceState[]; portStatus?: Record<string, boolean>; system?: { uptime: number } }
        setConfig(cfgData)
        if (statData.portStatus) setPortStatus(statData.portStatus)
        if (statData.system?.uptime) {
          bootAtRef.current = Date.now() - statData.system.uptime * 1000
          setUptime(Math.floor(statData.system.uptime))
        }
        const map: Record<string, ServiceState> = {}
        for (const s of statData.services) {
          map[s.tag] = s
        }
        setServiceStates(map)

        if (chRes.ok) {
          const chData = (await chRes.json()) as ChannelItem[]
          if (Array.isArray(chData) && chData.length > 0) {
            setChannels(() => chData)
            setRackSource('server')
          } else {
            // An empty or malformed array is still a failed rack read: the
            // built-in list is what the operator is looking at.
            setRackSource('builtin-fallback')
          }
        } else {
          setRackSource('builtin-fallback')
        }
      } catch (err) {
        console.error('Failed to load initial cockpit data:', err)
        setRackSource('builtin-fallback')
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
    portStatus,
    rackSource,
    progressPayload,
    progressLive,
  }
}
