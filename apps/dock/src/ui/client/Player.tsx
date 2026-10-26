'use client'

import { useEffect, useRef, useState } from 'react'
import { Badge, Button, LiveDot } from '@moonwitness/moonui'

/** A session shorter than this is a skip: nobody drifts into it by accident. */
const SKIP_AFTER_SECONDS = 30

/**
 * The player is the only interactive surface: it streams the station audio and
 * reports a listen to the BFF (`/api/listen`), which forwards the public beacon.
 * A play is only half the story — closing the session with how long it ran is
 * what turns the beacon into a quality signal instead of a click counter.
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
  /** why the button did nothing — separate from the beacon, which may be fine */
  const [streamError, setStreamError] = useState<string | null>(null)
  /** when the current session started, in clock ms; null while stopped */
  const startedAt = useRef<number | null>(null)

  /** Report how the session ended. `keepalive` lets the beacon survive a navigation. */
  const close = async (reportFailure: boolean) => {
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
  }
  const closeRef = useRef(close)
  closeRef.current = close

  // Leaving the page (unmount, route change) still ends the session: without this
  // every navigation would leak an open listen and inflate the charts.
  useEffect(() => () => void closeRef.current(false), [])

  const toggle = async () => {
    const element = audio.current
    if (!element) return
    if (playing) {
      element.pause()
      setPlaying(false)
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
      // The thing that failed was the audio, not the count: saying "beacon failed"
      // here sent people to look at the hub while the stream URL was the problem.
      startedAt.current = null
      setStreamError(
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'browser blocked autoplay — press play again'
          : 'stream unavailable',
      )
    }
  }

  return (
    <div className="dk-player">
      <audio
        ref={audio}
        src={streamUrl}
        preload="none"
        onEnded={() => void close(true)}
        onPause={() => void close(true)}
        onError={() => setStreamError('stream unavailable')}
      />
      <Button
        type="button"
        variant={playing ? 'primary' : 'accent'}
        size="md"
        onClick={() => void toggle()}
        aria-pressed={playing}
      >
        {playing ? '■ stop' : '▶ play'}
      </Button>
      <div className="m-row" style={{ gap: 10 }}>
        <LiveDot on={playing} />
        <strong>{stationName}</strong>
        <Badge tone={streamError || beacon === 'failed' ? 'hot' : beacon === 'sent' ? 'ok' : 'cyan'}>
          {streamError
            ? `${streamError} — nothing was logged`
            : beacon === 'sent'
              ? 'listen logged — the charts just moved'
              : beacon === 'failed'
                ? 'beacon failed'
                : 'stream'}
        </Badge>
      </div>
    </div>
  )
}
