import { Badge, Card, CardBody, LinkButton, Tape, type BadgeTone } from '@moonwitness/moonui'
import { homePayload } from '@/data/queries/program'
import { Player } from '@/ui/client/Player'
import { LiveTicker } from '@/ui/client/LiveTicker'
import { Hero } from '@/ui/components/shell'
import {
  ArchiveTimeline,
  ChartBars,
  CrewConstellation,
  NowPlayingCard,
  StationGrid,
  WeekGrid,
  ZineFeatureTrio,
  ZineSkaPosterSection,
} from '@/ui/components/sections'
import { todayWeekday } from '@/lib/time'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const payload = await homePayload()
  const live = payload.stations.find((station) => station.id === payload.now?.stationId) ?? payload.stations[0]

  return (
    <div className="dk-home-stack">
      <Hero counts={payload.counts} nowTitle={payload.now?.title} />

      <ZineFeatureTrio
        now={payload.now}
        live={<LiveTicker initial={payload.now} />}
        leadStationId={live?.id}
      />

      <CrewConstellation counts={payload.counts} stations={payload.stations} />

      <ArchiveTimeline slotCount={payload.week.length} />

      <ZineSkaPosterSection />

      {payload.signals?.length ? (
        <Card id="world-monitor">
          <CardBody className="m-stack" style={{ gap: 16 }}>
            <div className="dk-deck-header">
              <div>
                <Tape tone="accent">WORLD MONITOR · OSINT RADAR INTERCEPT</Tape>
                <h2 className="dk-section-heading">GLOBAL PULSE & INTELLIGENCE.</h2>
              </div>
              <span className="m-muted" style={{ fontSize: 13 }}>
                LIVE FEED · AI TRIAGED
              </span>
            </div>

            <div className="m-grid m-grid-3" style={{ gap: 14 }}>
              {payload.signals.slice(0, 6).map((sig) => {
                const badgeTone: BadgeTone =
                  sig.sentiment === 'alert' || sig.sentiment === 'critical'
                    ? 'hot'
                    : sig.sentiment === 'positive'
                    ? 'accent'
                    : 'night'
                return (
                  <div
                    key={sig.id}
                    className="m-stack"
                    style={{
                      border: '1px solid var(--m-border)',
                      padding: 14,
                      background: 'rgba(255,255,255,0.02)',
                      gap: 8,
                    }}
                  >
                    <div className="m-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="m-muted" style={{ fontSize: 11, textTransform: 'uppercase' }}>
                        {sig.platform} · {sig.radarRefRecord?.name ?? 'Radar'}
                      </span>
                      <Badge tone={badgeTone}>{sig.sentiment.toUpperCase()}</Badge>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>
                      <a
                        href={sig.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'inherit', textDecoration: 'none' }}
                      >
                        {sig.title}
                      </a>
                    </div>
                    {sig.aiSummary ? (
                      <p className="m-muted" style={{ fontSize: 12, margin: 0, lineHeight: 1.4 }}>
                        {sig.aiSummary}
                      </p>
                    ) : null}
                    <div className="m-row" style={{ justifyContent: 'space-between', fontSize: 11, marginTop: 'auto' }}>
                      <span className="m-muted">Urgency: {sig.urgencyScore}%</span>
                      {sig.viewsCount ? (
                        <span className="m-muted">👁 {(sig.viewsCount / 1000).toFixed(1)}k</span>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardBody>
        </Card>
      ) : null}

      <Card id="signals">
        <CardBody className="m-stack" style={{ gap: 18 }}>
          <div className="dk-deck-header">
            <div>
              <Tape tone="pink">LIVE RADIO TELEMETRY</Tape>
              <h2 className="dk-section-heading">SIGNALS IN THE DOCK.</h2>
            </div>
            <LinkButton href="/stations" variant="accent" size="sm">
              ALL STATIONS ({payload.counts.stations}) <span aria-hidden="true">→</span>
            </LinkButton>
          </div>

          <div className="m-grid m-grid-2">
            <NowPlayingCard now={payload.now} live={<LiveTicker initial={payload.now} />} />
            <ChartBars title="Most played signals" rows={payload.topStations} empty="No listens logged yet — press play." />
          </div>

          <StationGrid stations={payload.stations} />

          <div className="m-grid m-grid-2">
            <ChartBars title="Signals per country" rows={payload.perCountry} empty="No country data." />
            <ChartBars title="Signals per genre" rows={payload.perGenre} empty="No genre data." />
          </div>

          <div className="m-stack" style={{ gap: 12 }}>
            <div>
              <Tape tone="cyan">THIS WEEK&apos;S TRANSMISSION GRID</Tape>
            </div>
            <WeekGrid slots={payload.week} today={todayWeekday()} />
          </div>
        </CardBody>
      </Card>

      {live ? <Player stationId={live.id} stationName={live.name} streamUrl={live.streamUrl} /> : null}
    </div>
  )
}
