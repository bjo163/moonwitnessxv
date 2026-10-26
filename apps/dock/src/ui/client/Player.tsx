'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Badge, Button, LiveDot } from '@moonwitness/moonui'

/** A session shorter than this is a skip: nobody drifts into it by accident. */
const SKIP_AFTER_SECONDS = 30
const AMBIENT_FAILOVER_URL = 'https://ice2.somafm.com/dronezone-128-mp3'

export interface LiveMetaInfo {
  artist: string | null
  title: string
  stationName: string | null
}

/**
 * Resilient audio player with ICY metadata sniffing and zero-drop ambient failover.
 */
export function Player({
  stationId,
  stationName,
  streamUrl,
}: {
  stationId: string
  stationName: string
  streamUrl: string
}) {
  const audio = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [beacon, setBeacon] = useState<'idle' | 'sent' | 'failed'>('idle')
  const [streamError, setStreamError] = useState<string | null>(null)
  const [isFailover, setIsFailover] = useState(false)
  const [liveMeta, setLiveMeta] = useState<LiveMetaInfo | null>(null)
  const startedAt = useRef<number | null>(null)
  const retryTimer = useRef<NodeJS.Timeout | null>(null)

  const activeSrc = isFailover ? AMBIENT_FAILOVER_URL : streamUrl

  const close = useCallback(async (reportFailure: boolean) => {
    const seconds = startedAt.current === null ? 0 : Math.round((Date.now() - startedAt.current) / 1000)
    startedAt.current = null
    if (seconds <= 0) return
    try {
      const response = await fetch('/api/listen', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          stationRef: stationId,
          event: seconds < SKIP_AFTER_SECONDS ? 'skip' : 'stop',
          seconds,
        }),
        keepalive: true,
      })
      if (!response.ok && reportFailure) setBeacon('failed')
    } catch {
      if (reportFailure) setBeacon('failed')
    }
  }, [stationId])

  const closeRef = useRef(close)
  closeRef.current = close

  useEffect(() => () => {
    if (retryTimer.current) clearTimeout(retryTimer.current)
    void closeRef.current(false)
  }, [])

  // Poll ICY live metadata while playing
  useEffect(() => {
    if (!playing || isFailover) return
    let active = true

    const fetchMeta = async () => {
      try {
        const res = await fetch(`/api/stations/${stationId}/live-meta`)
        if (res.ok && active) {
          const body = (await res.json()) as { ok: boolean; data?: LiveMetaInfo }
          if (body.ok && body.data) {
            setLiveMeta(body.data)
          }
        }
      } catch {
        /* quiet ignore: metadata polling is best-effort */
      }
    }

    void fetchMeta()
    const timer = setInterval(() => void fetchMeta(), 15_000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [playing, stationId, isFailover])

  const triggerFailover = useCallback(() => {
    if (isFailover) {
      setStreamError('stream unavailable')
      return
    }
    setIsFailover(true)
    setStreamError('primary stream stall - failover active')

    // Attempt recovery back to primary stream in 8 seconds
    if (retryTimer.current) clearTimeout(retryTimer.current)
    retryTimer.current = setTimeout(() => {
      setIsFailover(false)
      setStreamError(null)
    }, 8_000)
  }, [isFailover])

  const toggle = async () => {
    const element = audio.current
    if (!element) return
    if (playing) {
      element.pause()
      setPlaying(false)
      setIsFailover(false)
      await close(true)
      return
    }
    try {
      await element.play()
      setPlaying(true)
      setStreamError(null)
      startedAt.current = Date.now()
      const response = await fetch('/api/listen', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ stationRef: stationId, event: 'start' }),
      })
      setBeacon(response.ok ? 'sent' : 'failed')
    } catch (err) {
      startedAt.current = null
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setStreamError('browser blocked autoplay — press play again')
      } else {
        triggerFailover()
      }
    }
  }

  return (
    <div className="dk-player">
      <audio
        ref={audio}
        src={activeSrc}
        preload="none"
        onEnded={() => void close(true)}
        onPause={() => void close(true)}
        onError={() => triggerFailover()}
      />
      <Button
        type="button"
        variant={playing ? 'primary' : 'accent'}
        size="md"
        onClick={() => void toggle()}
        aria-pressed={playing}
      >
        {playing ? 'stop' : 'play'}
      </Button>
      <div className="m-row" style={{ gap: 8, flexWrap: 'wrap' }}>
        <LiveDot on={playing} />
        <strong>{stationName}</strong>
        {isFailover ? (
          <Badge tone="hot">FAILOVER: AMBIENT BACKUP</Badge>
        ) : liveMeta?.title && liveMeta.title !== stationName ? (
          <Badge tone="cyan">
            ON AIR: {liveMeta.artist ? `${liveMeta.artist} - ` : ''}{liveMeta.title}
          </Badge>
        ) : (
          <Badge tone={streamError || beacon === 'failed' ? 'hot' : beacon === 'sent' ? 'ok' : 'cyan'}>
            {streamError
              ? `${streamError} — logging paused`
              : beacon === 'sent'
                ? 'listen logged — charts updated'
                : beacon === 'failed'
                  ? 'beacon failed'
                  : 'stream live'}
          </Badge>
        )}
      </div>
    </div>
  )
}
