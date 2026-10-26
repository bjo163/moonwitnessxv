import { Card, CardBody, LinkButton, Tape } from '@moonwitness/moonui'
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
