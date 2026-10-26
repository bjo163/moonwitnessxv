'use client'

import { useEffect, useState } from 'react'
import { openLiveStream, sameOriginSdk } from '@moonwitness/moonql-client'
import { LiveDot, Tape, Badge } from '@moonwitness/moonui'
import { triggerHaptic } from '@moonwitness/moonui/client'
import { clock, slotProgress } from '@/lib/time'

interface NowSlot {
  title: string
  host: string | null
  stationName: string | null
  startMin: number
  endMin: number
}

/**
 * The on-air strip.
 *
 * Two things used to cost a network call every 30 seconds: the progress bar (which
 * is pure wall clock, so the browser can compute it itself with the same formula the
 * server used for the first paint) and noticing that the grid changed (which is what
 * the hub's live feed actually announces). So the polling loop is gone: progress
 * advances locally, and the only fetch left is the one a real change asks for.
 *
 * The feed is the dock's own `/api/on-air` relay — the hub URL is never in this
 * bundle — and reconnection follows the shared kit's backoff, because the previous
 * behaviour here was to keep asking a hub that was down.
 */
export function LiveTicker({ initial }: { initial: NowSlot | null }) {
  const [slot, setSlot] = useState<NowSlot | null>(initial)
  const [intelAlert, setIntelAlert] = useState<{ title: string; urgency: number; platform: string } | null>(null)
  const [state, setState] = useState<'connecting' | 'live' | 'down'>('connecting')
  const [progress, setProgress] = useState<number | null>(() =>
    initial ? slotProgress(initial.startMin, initial.endMin, new Date()) : null,
  )

  // the clock, not the network: one tick a minute is the schedule's smallest unit
  useEffect(() => {
    if (!slot) return
    const paint = (): void => setProgress(slotProgress(slot.startMin, slot.endMin, new Date()))
    paint()
    const timer = setInterval(paint, 30_000)
    return () => clearInterval(timer)
  }, [slot])

  useEffect(() => {
    let cancelled = false
    const refresh = async (): Promise<void> => {
      try {
        const response = await fetch('/api/now-playing', { cache: 'no-store' })
        const payload = (await response.json()) as { ok: boolean; data: NowSlot | null }
        if (!cancelled) setSlot(payload.data)
      } catch {
        /* keep the last known slot: a dropped refetch must not blank the ticker */
      }
    }

    const stop = openLiveStream(sameOriginSdk(), {
      path: '/api/on-air',
      onState: setState,
      onEvent: (data) => {
        const frame = data as { kind?: string; title?: string; urgencyScore?: number; platform?: string }
        if (frame.kind === 'intel' && frame.title) {
          triggerHaptic('alert')
          setIntelAlert({
            title: frame.title,
            urgency: frame.urgencyScore ?? 0,
            platform: frame.platform ?? 'intel',
          })
          setTimeout(() => setIntelAlert(null), 25_000)
          return
        }

        // only a grid change moves "what is on air"; listen and track frames would
        // make every beacon cost a schedule re-read for no visible reason
        if (frame.kind !== 'schedule') return
        void refresh()
      },
    })
    return () => {
      cancelled = true
      stop()
    }
  }, [])

  return (
    <div className="m-row" style={{ fontSize: 12, alignItems: 'center', gap: 8 }}>
      <LiveDot state={state} />
      {intelAlert ? (
        <div className="m-row" style={{ gap: 6, alignItems: 'center' }}>
          <Tape tone="pink">
            INTEL FLASH · {intelAlert.platform.toUpperCase()}
          </Tape>
          <Badge tone="hot">{intelAlert.urgency}% URGENCY</Badge>
          <span style={{ color: 'var(--fg)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
            {intelAlert.title}
          </span>
        </div>
      ) : slot ? (
        <span>
          <strong>{slot.title}</strong>
          {slot.stationName ? ` · ${slot.stationName}` : ''}
          {slot.host ? ` · ${slot.host}` : ''} · {clock(slot.startMin)}–{clock(slot.endMin)} ({progress ?? 0}%)
        </span>
      ) : (
        <span className="m-muted">no slot on air</span>
      )}
    </div>
  )
}
