import { useState } from 'react'
import type { ChannelItem, ChannelMediaType, ServiceState } from '../types'

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

  const controlService = async (tag: string, action: 'start' | 'stop' | 'restart') => {
    try {
      const res = await fetch(`/api/services/${tag}/${action}`, { method: 'POST' })
      const data = (await res.json()) as { state?: ServiceState }
      if (data.state) {
        const nextState = data.state
        setServiceStates((prev) => ({ ...prev, [tag]: nextState }))
      }
    } catch (err) {
      console.error(`Failed to ${action} ${tag}:`, err)
    }
  }

  const startAll = async () => {
    await fetch('/api/services/start-all', { method: 'POST' })
  }

  const stopAll = async () => {
    await fetch('/api/services/stop-all', { method: 'POST' })
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
    addCustomChannel,
    controlService,
    startAll,
    stopAll,
    freePorts,
    loadLedger,
    clearLedger,
  }
}
