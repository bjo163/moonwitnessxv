'use client'

import { useEffect, useState } from 'react'
import { openLiveStream, sameOriginSdk } from '@moonwitness/moonql-client'
import { Badge, LiveDot } from '@moonwitness/moonui'

interface BusEvent {
  type?: string
  event?: string
  at?: string
  payload?: { model?: string; id?: string; cron?: string; status?: string }
}

const MAX_LIVE_LINES = 20

/** one line of the feed, from a bus frame */
const describe = (parsed: BusEvent): string => {
  const stamp = (parsed.at ?? new Date().toISOString()).slice(11, 19)
  const what = parsed.event ?? 'event'
  const target = parsed.payload?.model ?? parsed.payload?.cron ?? ''
  const id = parsed.payload?.id ? ` ${parsed.payload.id.slice(0, 8)}` : ''
  const extra = parsed.payload?.status ? ` ${parsed.payload.status}` : ''
  return `${stamp} ${what} ${target}${id}${extra}`.trim()
}

/**
 * live bus feed: same-origin `/api/ops/stream` (cookie auth).
 *
 * The reconnect rule used to live here — EventSource auto-retries, which for a hub
 * that builds a real generator per subscriber is an invisible leak. That logic now
 * belongs to the shared kit (`openLiveStream`) so the dock's live feed obeys the
 * same rules as this one; this component only decides what a line looks like.
 */
export function EventStream({ url = '/api/ops/stream?seconds=300' }: { url?: string }) {
  const [state, setState] = useState<'connecting' | 'live' | 'down'>('connecting')
  const [lines, setLines] = useState<string[]>([])

  useEffect(() => {
    // the SDK owns query encoding, so the path and its search are handed separately
    const [path, search] = url.split('?')
    const query = Object.fromEntries(new URLSearchParams(search ?? ''))

    return openLiveStream(sameOriginSdk(), {
      path,
      query,
      onState: setState,
      onEvent: (data) => {
        const line = describe((data ?? {}) as BusEvent)
        setLines((previous) => [line, ...previous].slice(0, MAX_LIVE_LINES))
      },
    })
  }, [url])

  return (
    <div className="m-stack" style={{ gap: 8 }}>
      <div className="m-row">
        <LiveDot on={state === 'live'} />
        <Badge tone={state === 'live' ? 'ok' : state === 'down' ? 'hot' : 'accent'}>{state}</Badge>
        <span className="m-muted">/ops/stream</span>
      </div>
      <div className="m-feed">
        {lines.length === 0 ? (
          <div className="m-muted" style={{ fontSize: 12 }}>
            Waiting for the next write on the bus…
          </div>
        ) : (
          lines.map((line, index) => (
            <div className="m-feed-item" key={`${line}-${index}`}>
              <span className="m-mono">{line}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
