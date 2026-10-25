import { homePayload } from '@/data/queries/program'
import { Player } from '@/ui/client/Player'
import { LiveTicker } from '@/ui/client/LiveTicker'
import { Hero } from '@/ui/components/shell'
import { ChartBars, NowPlayingCard, StationGrid, WeekGrid } from '@/ui/components/sections'
import { todayWeekday } from '@/lib/time'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const payload = await homePayload()
  const live = payload.stations.find((station) => station.id === payload.now?.stationId) ?? payload.stations[0]

  return (
    <div className="m-stack" style={{ gap: 24 }}>
      <Hero counts={payload.counts} nowTitle={payload.now?.title} />

      <div className="m-grid m-grid-2">
        <NowPlayingCard now={payload.now} live={<LiveTicker initial={payload.now} />} />
        <ChartBars title="Most played stations" rows={payload.topStations} empty="No listens logged yet — press play." />
      </div>

      <section className="m-stack" style={{ gap: 12 }}>
        <div className="dk-card-label">Stations in the dock</div>
        <StationGrid stations={payload.stations} />
      </section>

      <div className="m-grid m-grid-2">
        <ChartBars title="Stations per country" rows={payload.perCountry} empty="No country data." />
        <ChartBars title="Stations per genre" rows={payload.perGenre} empty="No genre data." />
      </div>

      <section className="m-stack" style={{ gap: 12 }}>
        <div className="dk-card-label">This week</div>
        <WeekGrid slots={payload.week} today={todayWeekday()} />
      </section>

      {live ? <Player stationId={live.id} stationName={live.name} streamUrl={live.streamUrl} /> : null}
    </div>
  )
}
