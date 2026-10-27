import { useRef, useState } from 'react'
import type { ChannelItem, ChannelMediaType, ServiceState, StartAllResult } from '../types'

export interface CockpitActionsOptions {
  customName: string
  customUrl: string
  customType: ChannelMediaType
  customGenre: string
  channels: ChannelItem[]
  setChannels: (fn: (prev: ChannelItem[]) => ChannelItem[]) => void
  setActiveChannelIndex: (idx: number) => void
  setCustomName: (s: string) => void
  setCustomUrl: (s: string) => void
  setCustomGenre: (s: string) => void
  setServiceStates: (fn: (prev: Record<string, ServiceState>) => Record<string, ServiceState>) => void
  setErrorLines: (lines: string[]) => void
}

export function useCockpitActions({
  customName,
  customUrl,
  customType,
  customGenre,
  channels,
  setChannels,
  setActiveChannelIndex,
  setCustomName,
  setCustomUrl,
  setCustomGenre,
  setServiceStates,
  setErrorLines,
}: CockpitActionsOptions) {
  const [isFreeingPorts, setIsFreeingPorts] = useState(false)
  const [isStartingAll, setIsStartingAll] = useState(false)
  const [startAllSummary, setStartAllSummary] = useState<StartAllResult | null>(null)
  // Start/restart is an await on a port probe; without a per-tag pending lock a
  // double-click would fire two overlapping requests and defeat the server guard.
  const pendingTags = useRef<Set<string>>(new Set())

  const controlService = async (tag: string, action: 'start' | 'stop' | 'restart') => {
    if (pendingTags.current.has(tag)) return
    pendingTags.current.add(tag)
    try {
      const res = await fetch(`/api/services/${tag}/${action}`, { method: 'POST' })
      const data = (await res.json()) as { state?: ServiceState }
      if (data.state) {
        const nextState = data.state
        setServiceStates((prev) => ({ ...prev, [tag]: nextState }))
      }
    } catch (err) {
      console.error(`Failed to ${action} ${tag}:`, err)
    } finally {
      pendingTags.current.delete(tag)
    }
  }

  const addCustomChannel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customName || !customUrl) return
    try {
      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customName,
          streamUrl: customUrl,
          type: customType,
          genre: customGenre || (customType === 'iptv' ? 'IPTV Stream' : 'Radio Stream'),
        }),
      })
      if (res.ok) {
        const added = (await res.json()) as ChannelItem
        setChannels((prev) => [...prev, added])
        setActiveChannelIndex(channels.length)
        setCustomName('')
        setCustomUrl('')
        setCustomGenre('')
        alert(`Station "${added.name}" added to playlist!`)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      alert(`Failed to add station: ${msg}`)
    }
  }

  const startAll = async () => {
    if (isStartingAll) return
    setIsStartingAll(true)
    setStartAllSummary(null)
    try {
      const res = await fetch('/api/services/start-all', { method: 'POST' })
      const data = (await res.json()) as StartAllResult & { services?: ServiceState[] }
      setStartAllSummary(data)
      if (Array.isArray(data.services)) {
        setServiceStates((prev) => {
          const next = { ...prev }
          for (const s of data.services ?? []) next[s.tag] = s
          return next
        })
      }
    } catch (err) {
      console.error('Failed to start all:', err)
    } finally {
      setIsStartingAll(false)
    }
  }

  const stopAll = async () => {
    await fetch('/api/services/stop-all', { method: 'POST' })
    setStartAllSummary(null)
  }

  const freePorts = async () => {
    setIsFreeingPorts(true)
    try {
      const res = await fetch('/api/ports/free', { method: 'POST' })
      const data = (await res.json()) as { message?: string }
      alert(data.message || 'Ports freed')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      alert(`Failed to free ports: ${msg}`)
    } finally {
      setIsFreeingPorts(false)
    }
  }

  const loadLedger = async () => {
    try {
      const res = await fetch('/api/errors')
      const data = (await res.json()) as { lines?: string[] }
      setErrorLines(data.lines || [])
    } catch (err) {
      console.error('Failed to load error ledger:', err)
    }
  }

  const clearLedger = async () => {
    if (!confirm('Clear all logged errors?')) return
    await fetch('/api/errors', { method: 'DELETE' })
    await loadLedger()
  }

  return {
    isFreeingPorts,
    isStartingAll,
    startAllSummary,
    addCustomChannel,
    controlService,
    startAll,
    stopAll,
    freePorts,
    loadLedger,
    clearLedger,
  }
}
