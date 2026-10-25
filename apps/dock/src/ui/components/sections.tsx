import type { ReactNode } from 'react'
import type { ViewOutputs } from '@moonwitness/moonql-client'
import type { ChartRow, NowPlaying } from '@/data/types'
import { clock } from '@/lib/time'
import { slotWindow } from '@/data/queries/program'

/**
 * The minimum a station card needs, expressed AS THE HUB SHAPE (`countryRefRecord`
 * from `expand`, not a renamed local field). Full catalog rows are assignable to it,
 * and a hub rename lands here — at the point of use — instead of in a mapper.
 */
export interface StationLike {
  id: string
  name: string
  genre: string | null
  status: string
  countryRefRecord?: { name?: string | null } | null
}

export function NowPlayingCard({ now, live }: { now: NowPlaying | null; live?: ReactNode }): ReactNode {
  if (!now) {
    return (
      <section className="dk-card">
        <div className="dk-card-label">Now playing</div>
        <p className="dk-muted">The schedule is empty right now.</p>
      </section>
    )
  }
  return (
    <section className="dk-card dk-now">
      <div className="dk-card-label">Now playing</div>
      <h2>{now.title}</h2>
      <div className="dk-row dk-muted">
        {now.stationName ? <span>{now.stationName}</span> : null}
        {now.host ? <span>· hosted by {now.host}</span> : null}
        <span>
          · {clock(now.startMin)}–{clock(now.endMin)}
        </span>
      </div>
      <div className="dk-progress" aria-hidden="true">
        <span style={{ width: `${now.progress}%` }} />
      </div>
      {live}
    </section>
  )
}

export function StationCard({ station }: { station: StationLike }): ReactNode {
  return (
    <a className="dk-station" href={`/stations/${station.id}`}>
      <div className="dk-station-top">
        <strong>{station.name}</strong>
        <span className="dk-pill">{station.status}</span>
      </div>
      <div className="dk-muted">{station.genre ?? 'unformatted'}</div>
      <div className="dk-row dk-muted dk-small">
        <span>{station.countryRefRecord?.name ?? 'unknown country'}</span>
      </div>
    </a>
  )
}

export function StationGrid({ stations }: { stations: StationLike[] }): ReactNode {
  if (!stations.length) return <p className="dk-muted">No stations match that filter.</p>
  return (
    <div className="dk-grid">
      {stations.map((station) => (
        <StationCard key={station.id} station={station} />
      ))}
    </div>
  )
}

export function ChartBars({ title, rows, empty }: { title: string; rows: ChartRow[]; empty: string }): ReactNode {
  const max = rows.reduce((peak, row) => Math.max(peak, row.value), 1)
  return (
    <section className="dk-card">
      <div className="dk-card-label">{title}</div>
      {rows.length === 0 ? (
        <p className="dk-muted">{empty}</p>
      ) : (
        <div className="dk-chart">
          {rows.map((row) => (
            <div key={row.label} className="dk-bar">
              <div className="dk-bar-head">
                {row.href ? <a href={row.href}>{row.label}</a> : <span>{row.label}</span>}
                <span className="dk-mono">{row.value}</span>
              </div>
              <div className="dk-bar-track">
                <span style={{ width: `${Math.round((row.value / max) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export function WeekGrid({ slots, today }: { slots: ViewOutputs['weeklySchedule'][]; today: string }): ReactNode {
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  return (
    <div className="dk-week">
      {days.map((day) => {
        const daySlots = slots.filter((slot) => slot.weekday === day)
        return (
          <div className={`dk-day${day === today ? ' dk-day-today' : ''}`} key={day}>
            <div className="dk-day-head">
              {day}
              {day === today ? <span className="dk-pill">today</span> : null}
            </div>
            {daySlots.length === 0 ? <div className="dk-muted dk-small">—</div> : null}
            {daySlots.map((slot) => (
              <div className="dk-slot" key={slot.id}>
                <span className="dk-mono dk-small">{slotWindow(slot)}</span>
                <strong>{slot.title}</strong>
                <span className="dk-muted dk-small">
                  {slot.stationRefRecord?.name ?? 'station'} {slot.host ? `· ${slot.host}` : ''}
                </span>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
