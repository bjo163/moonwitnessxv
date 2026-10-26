import type { ReactNode } from 'react'
import type { ViewOutputs } from '@moonwitness/moonql-client'
import {
  Badge,
  Card,
  CardBody,
  ChartList,
  Crown,
  LinkButton,
  LiveDot,
  Panel,
  ProgressBar,
  Tape,
  ZineNote,
  Chevron,
  Glyph,
} from '@moonwitness/moonui'
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

const ARCHIVE_SIGNALS = [
  { date: '2024.09', title: 'THE FIRST SIGNAL', img: '/art/archive-1.jpg' },
  { date: '2024.11', title: 'VOICES IN THE FOG', img: '/art/archive-2.jpg' },
  { date: '2025.01', title: 'THE OTHER SIDE', img: '/art/archive-3.jpg' },
  { date: '2025.03', title: 'CITIES NEVER SLEEP', img: '/art/archive-4.jpg' },
  { date: '2025.04', title: 'A BRIGHTER QUESTION', img: '/art/archive-5.jpg' },
  { date: '2025.06', title: 'THE SHADOW GROWS', img: '/art/archive-6.jpg' },
  { date: '2025.08', title: 'MORE TO COME', img: '/art/archive-7.jpg' },
] as const

export function ZineFeatureTrio({
  now,
  live,
  leadStationId,
}: {
  now: NowPlaying | null
  live?: ReactNode
  leadStationId?: string
}): ReactNode {
  const signalHref = now?.stationId
    ? `/stations/${now.stationId}`
    : leadStationId
      ? `/stations/${leadStationId}`
      : '/stations'

  return (
    <section className="dk-trio" aria-label="Featured transmissions and layers">
      {/* Panel 1: TRANSMISSION 001 */}
      <Card variant="art" bgImage="/art/card-transmission.jpg" className="dk-trio-card">
        <CardBody className="dk-trio-layout">
          <div className="dk-trio-body">
            <div className="m-row">
              <Tape tone="accent">TRANSMISSION 001</Tape>
              <Badge tone="pink">LIVE</Badge>
            </div>

            <h2 className="dk-trio-title">
              A SIGNAL
              <br />
              FROM
              <br />
              BELOW
            </h2>

            <p className="dk-trio-copy">
              Strange sounds. A deeper current.
              <br />
              What are we really hearing?
            </p>

            {now ? (
              <div className="dk-trio-live-meta">
                <LiveDot on />
                <span>
                  <strong>{now.title}</strong>
                  {now.stationName ? ` · ${now.stationName}` : ''}
                  {now.host ? ` · ${now.host}` : ''} ({clock(now.startMin)}–{clock(now.endMin)})
                </span>
              </div>
            ) : null}

            <div className="dk-trio-live-slot">{live}</div>
          </div>

          <div className="dk-trio-right-col">
            <ZineNote tone="paper" tilt="left">
              SOME STORIES
              <br />
              SHOULD
              <br />
              STAY BURIED.
            </ZineNote>

            <a href={signalHref} className="dk-circle-play" aria-label="Play transmission 001">
              <span className="dk-circle-play-icon"><Chevron dir="right" /></span>
              <span className="m-mono" style={{ fontSize: 12, fontWeight: 800 }}>
                03:24
              </span>
            </a>
          </div>
        </CardBody>
      </Card>

      {/* Panel 2: STORYTELLING */}
      <Card variant="art" bgImage="/art/card-storytelling.jpg" className="dk-trio-card">
        <CardBody className="dk-trio-layout">
          <div className="dk-trio-body">
            <div className="m-row">
              <Tape tone="accent">STORYTELLING</Tape>
            </div>

            <h2 className="dk-trio-title">
              REAL PEOPLE.
              <br />
              BIGGER HORIZONS.
            </h2>

            <p className="dk-trio-copy">
              Firsthand accounts, visual stories,
              <br />
              and unfiltered perspectives
              <br />
              from around the world.
            </p>

            <div>
              <LinkButton href="/stations" variant="cyan" size="sm">
                EXPLORE STORIES <Chevron dir="right" />
              </LinkButton>
            </div>
          </div>

          <div className="dk-trio-right-col">
            <ZineNote tone="dark" tilt="left">
              <Crown tone="gold" size="sm" />
              <br />
              DIFFERENT
              <br />
              PLACES.
              <br />
              SAME STORIES.
            </ZineNote>
          </div>
        </CardBody>
      </Card>

      {/* Panel 3: THE SHADOW */}
      <Card variant="art" bgImage="/art/card-shadow.jpg" className="dk-trio-card" id="shadow">
        <CardBody className="dk-trio-layout">
          <div className="dk-trio-body">
            <div className="m-row">
              <Tape tone="pink">THE SHADOW</Tape>
            </div>

            <h2 className="dk-trio-title">
              NOT EVERYTHING
              <br />
              IS VISIBLE.
            </h2>

            <p className="dk-trio-copy">
              A deeper layer of Moonwitness.
              <br />
              Unexplained stories, hidden connections,
              <br />
              and what lives in the in-between.
            </p>

            <div>
              <LinkButton href="/schedule" variant="accent" size="sm">
                ENTER THE SHADOW <Chevron dir="right" />
              </LinkButton>
            </div>
          </div>

          <div className="dk-trio-right-col">
            <ZineNote tone="dark" tilt="left">
              THERE&apos;S
              <br />
              ALWAYS
              <br />
              ANOTHER
              <br />
              LAYER.
            </ZineNote>
          </div>
        </CardBody>
      </Card>
    </section>
  )
}

export function CrewConstellation({
  counts,
  stations,
}: {
  counts: { stations: number; countries: number; plays: number }
  stations: StationLike[]
}): ReactNode {
  const crewMembers = 1324 + counts.stations
  const countryTotal = Math.max(87, counts.countries)
  const signalTotal = 6912 + counts.plays

  return (
    <Card className="dk-constellation-card" id="constellation">
      <CardBody className="dk-constellation">
        <div className="m-stack" style={{ gap: 10 }}>
          <div>
            <Tape tone="cyan">CREW CONSTELLATION</Tape>
          </div>
          <h2 className="dk-section-heading">A GLOBAL MAP OF WITNESSES.</h2>
          <p className="m-muted" style={{ margin: 0, fontSize: 13 }}>
            Different places. Different perspectives. Same moon. Hover to explore the crew and see where the next signal
            comes from.
          </p>
          <div className="m-row" style={{ gap: 12 }}>
            <LinkButton href="/stations" variant="primary" size="sm">
              EXPLORE THE CREW <Chevron dir="right" />
            </LinkButton>
            <ZineNote tone="dark" tilt="left">
              REAL PEOPLE.
              <br />
              REAL PLACES.
              <br />
              SAME SKY.
            </ZineNote>
          </div>
        </div>

        <div className="dk-constellation-map">
          <img
            src="/art/constellation-map.jpg"
            alt="Global constellation map of Moonwitness crew members and active signals"
            className="dk-map-img"
          />
          <div className="dk-map-pins">
            {stations.slice(0, 5).map((station, idx) => (
              <a
                key={station.id}
                href={`/stations/${station.id}`}
                className={`dk-map-pin dk-map-pin-${idx + 1}`}
                title={`${station.name} (${station.countryRefRecord?.name ?? 'Global'})`}
              >
                <Badge tone="pink">{station.name}</Badge>
              </a>
            ))}
          </div>
        </div>

        <div className="dk-constellation-stats">
          <Card variant="paper" className="dk-paper-stats">
            <CardBody className="m-stack" style={{ gap: 8, padding: 14 }}>
              <div className="dk-paper-stat-row">
                <Glyph code="CR" tone="pink" size="sm" />
                <div>
                  <strong>{crewMembers.toLocaleString('en-US')}</strong>
                  <span>CREW MEMBERS</span>
                </div>
              </div>
              <div className="dk-paper-stat-row">
                <Glyph code="CT" tone="cyan" size="sm" />
                <div>
                  <strong>{countryTotal}</strong>
                  <span>COUNTRIES ({counts.countries} HUB)</span>
                </div>
              </div>
              <div className="dk-paper-stat-row">
                <Glyph code="SG" tone="accent" size="sm" />
                <div>
                  <strong>{signalTotal.toLocaleString('en-US')}</strong>
                  <span>SIGNALS ({counts.stations} LIVE)</span>
                </div>
              </div>
            </CardBody>
          </Card>

          <div className="dk-moon-orbit-tag">
            <span>
              DIFFERENT
              <br />
              WITNESSES.
              <br />
              SAME MOON.
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export function ArchiveTimeline({ slotCount }: { slotCount: number }): ReactNode {
  return (
    <Card id="archive">
      <CardBody className="dk-archive">
        <div className="m-stack" style={{ gap: 8 }}>
          <div>
            <Tape tone="accent">ARCHIVE</Tape>
          </div>
          <h2 className="dk-section-heading">A TIMELINE OF SIGNALS.</h2>
          <p className="m-muted" style={{ margin: 0, fontSize: 12 }}>
            Past transmissions, ongoing mysteries, and the stories that shape Moonwitness.
            <br />
            <span className="m-mono">{slotCount} weekly schedule slots active</span>
          </p>
          <div>
            <LinkButton href="/schedule" variant="cyan" size="sm">
              BROWSE ARCHIVE <Chevron dir="right" />
            </LinkButton>
          </div>
        </div>

        <div className="dk-archive-track">
          {ARCHIVE_SIGNALS.map((item, idx) => (
            <a href="/schedule" className="dk-archive-node" key={item.date}>
              <div className="dk-archive-thumb-wrap">
                <img src={item.img} alt={item.title} className="dk-archive-thumb" />
                {idx < ARCHIVE_SIGNALS.length - 1 ? (
                  <span className="dk-archive-arrow" aria-hidden="true">
                    <Chevron dir="right" />
                  </span>
                ) : null}
              </div>
              <span className="dk-archive-date">{item.date}</span>
              <strong className="dk-archive-title">{item.title}</strong>
            </a>
          ))}
        </div>

        <div className="m-stack" style={{ alignItems: 'center', textAlign: 'center', gap: 6 }}>
          <Crown tone="gold" size="md" />
          <ZineNote tone="dark" tilt="right">
            STORIES
            <br />
            KEEP
            <br />
            ORBITING.
          </ZineNote>
        </div>
      </CardBody>
    </Card>
  )
}

export function ZineSkaPosterSection(): ReactNode {
  return (
    <Card id="zine-poster">
      <CardBody className="dk-poster-showcase">
        <div className="dk-poster-visual">
          <img
            src="/art/poster-ska.jpg"
            alt="The Real Feast of Trumpets — More Proof (Pre-Trib Rapture) SKA!! Zine Poster"
            className="dk-poster-full-img"
          />
        </div>

        <div className="dk-poster-content">
          <div className="m-row" style={{ justifyContent: 'space-between' }}>
            <ZineNote tone="accent" tilt="left">
              MEREKA JUAL · KITA BELI.
              <br />
              JANGAN MAU JADI MONYET.
            </ZineNote>
            <ZineNote tone="paper" tilt="right">
              TEROMPET / SKA / <strong>2:113</strong>
            </ZineNote>
          </div>

          <div className="dk-poster-headline">
            <Crown tone="gold" size="md" />
            <h2>
              THE <span className="dk-pink-word">REAL</span> FEAST OF TRUMPETS
            </h2>
            <div className="m-row" style={{ gap: 14 }}>
              <Tape tone="paper">
                <strong className="dk-red-text">MORE PROOF</strong> (PRE-TRIB RAPTURE)
              </Tape>
              <Badge tone="accent">SKA!!</Badge>
            </div>
          </div>

          <div className="m-grid m-grid-3">
            <Card>
              <CardBody>
                <Badge tone="accent">4-L4H</Badge>
                <div className="m-muted" style={{ fontSize: 11, marginTop: 4 }}>
                  THE BATTERY
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Badge tone="cyan">WALTER-WHITER</Badge>
                <div className="m-muted" style={{ fontSize: 11, marginTop: 4 }}>
                  DOKTER PUTIH · MAL PRAKTEK
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Badge tone="pink">ISROCKFEEL</Badge>
                <div className="m-muted" style={{ fontSize: 11, marginTop: 4 }}>
                  ARTIS BAND SKA · TET-TET
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="dk-ransom-lyrics">
            <div className="dk-ransom-col">
              <div className="dk-ransom-strip">
                Dasar kau <mark className="dk-mark-red">muka tebal...</mark>
              </div>
              <div className="dk-ransom-strip">
                kau <mark className="dk-mark-yellow">muka tebal</mark>
              </div>
              <div className="dk-ransom-strip">
                Memang <mark className="dk-mark-red">tak punya malu</mark>
              </div>
              <div className="dk-ransom-strip">
                Kau hanya bisa <mark className="dk-mark-red">menipu</mark>
              </div>
              <div className="dk-ransom-strip">
                Dasar kau <mark className="dk-mark-red">penipu</mark>
              </div>
              <div className="dk-ransom-strip">
                Memang <mark className="dk-mark-red">tak tahu malu</mark>
              </div>
            </div>

            <div className="dk-ransom-col">
              <div className="dk-ransom-strip">
                Kau mendekatkan senangnya
                <br />
                dalam hidupmu
              </div>
              <div className="dk-ransom-strip">
                Dan <mark className="dk-mark-yellow">tak mau tahu</mark>
                <br />
                tentang siapa diriku
              </div>
              <div className="dk-ransom-strip">
                Kubersumpah dan
                <br />
                aku <mark className="dk-mark-red">tak mau tahu</mark>
              </div>
              <div className="dk-ransom-strip">
                Dan semoga setan
                <br />
                kan <mark className="dk-mark-red">menjemputmu</mark>
              </div>
            </div>
          </div>

          <div className="dk-poster-coda">
            <div className="dk-coda-pink">Perih terasa sakit yang menghantam</div>
            <div className="dk-coda-yellow">Kegilaanmu yang semakin terus-terus membayang.</div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export function NowPlayingCard({ now, live }: { now: NowPlaying | null; live?: ReactNode }): ReactNode {
  if (!now) {
    return (
      <Panel title="Now playing · Live Signal">
        <div className="m-stack" style={{ gap: 8 }}>
          <p className="m-muted" style={{ margin: 0 }}>
            The schedule is empty right now — standby for next transmission.
          </p>
          {live}
        </div>
      </Panel>
    )
  }
  return (
    <Panel
      title="Now playing · Live Signal"
      actions={<Badge tone="pink">{clock(now.startMin)}–{clock(now.endMin)}</Badge>}
    >
      <div className="m-stack" style={{ gap: 10 }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 28, textTransform: 'uppercase' }}>
          {now.title}
        </h2>
        <div className="m-row m-muted">
          {now.stationName ? <span>{now.stationName}</span> : null}
          {now.host ? <span>· hosted by {now.host}</span> : null}
        </div>
        <ProgressBar value={now.progress} tone="pink" />
        {live}
      </div>
    </Panel>
  )
}

export function StationCard({ station }: { station: StationLike }): ReactNode {
  return (
    <a className="dk-station" href={`/stations/${station.id}`}>
      <div className="m-row" style={{ justifyContent: 'space-between' }}>
        <strong>{station.name}</strong>
        <Badge tone={station.status === 'active' || station.status === 'live' ? 'accent' : 'night'}>
          {station.status}
        </Badge>
      </div>
      <div className="m-muted">{station.genre ?? 'unformatted'}</div>
      <div className="m-row m-muted" style={{ fontSize: 12 }}>
        <span>{station.countryRefRecord?.name ?? 'unknown country'}</span>
      </div>
    </a>
  )
}

export function StationGrid({ stations }: { stations: StationLike[] }): ReactNode {
  if (!stations.length) return <p className="m-muted">No stations match that filter.</p>
  return (
    <div className="dk-grid">
      {stations.map((station) => (
        <StationCard key={station.id} station={station} />
      ))}
    </div>
  )
}

export function ChartBars({ title, rows, empty }: { title: string; rows: ChartRow[]; empty: string }): ReactNode {
  return (
    <Panel title={title}>
      <ChartList rows={rows} empty={empty} tone="cyan" />
    </Panel>
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
              {day === today ? <Badge tone="accent">today</Badge> : null}
            </div>
            {daySlots.length === 0 ? <div className="m-muted" style={{ fontSize: 12 }}>—</div> : null}
            {daySlots.map((slot) => (
              <div className="dk-slot" key={slot.id}>
                <span className="m-mono" style={{ fontSize: 12 }}>{slotWindow(slot)}</span>
                <strong>{slot.title}</strong>
                <span className="m-muted" style={{ fontSize: 12 }}>
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
