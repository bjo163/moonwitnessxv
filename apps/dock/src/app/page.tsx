import { Card, CardBody, LinkButton, SpaceGrid, Tape, Chevron } from '@moonwitness/moonui'
import { formatLocaleNumber } from '@moonwitness/core'
import { headers } from 'next/headers'
import { homePayload } from '@/data/queries/program'
import { Player } from '@/ui/client/Player'
import { LiveTicker } from '@/ui/client/LiveTicker'
import { Hero } from '@/ui/components/shell'
import { dockSpaces } from '@/ui/components/spaces-data'
import {
  ArchiveTimeline,
  ChartBars,
  CrewConstellation,
  NowPlayingCard,
  StationDirectoryGrid,
  WeekGrid,
  ZineFeatureTrio,
  ZineSkaPosterSection,
} from '@/ui/components/sections'
import { todayWeekday } from '@/lib/time'
import { DOCK_LOCALE_HEADER, dockHrefFor, localeFromMiddlewareHeader } from '@/lib/locale-context.mjs'
import { getLandingCopy, type LandingCopy } from '@/lib/landing-copy'

export const dynamic = 'force-dynamic'

function OfflineLanding({ copy }: { copy: LandingCopy }) {
  return (
    <section className="dk-hero" aria-labelledby="offline-home-title">
      <div className="dk-hero-art" aria-hidden="true" />
      <div className="dk-hero-overlay" />
      <div className="dk-hero-content">
        <div className="dk-hero-left">
          <Tape tone="accent">{copy.heroEyebrow}</Tape>
          <h1 id="offline-home-title" className="dk-hero-title">MOONWITNESS</h1>
          <p className="dk-hero-sub">{copy.heroNetwork}<br />{copy.heroAudience}<br />{copy.heroMoon}<br />{copy.heroPerspective}</p>
          <p className="dk-hero-sub">{copy.approvedMission}</p>
          <p className="m-muted" role="status">{copy.liveDataUnavailable}</p>
        </div>
      </div>
    </section>
  )
}

export default async function HomePage() {
  const requestHeaders = await headers()
  const locale = localeFromMiddlewareHeader(requestHeaders.get(DOCK_LOCALE_HEADER))
  const localeHref = dockHrefFor(locale)
  const copy = getLandingCopy(locale)
  const payload = await homePayload()
  if (!payload.liveDataAvailable) {
    return <div className="dk-home-stack"><OfflineLanding copy={copy} /><SpaceGrid heading={copy.spacesHeading} headingId="dk-spaces-title" spaces={dockSpaces(locale)} /></div>
  }
  const live = payload.stations.find((station) => station.id === payload.now?.stationId) ?? payload.stations[0]

  return (
    <div className="dk-home-stack">
      <Hero counts={{ stations: payload.counts.stations, countries: payload.counts.countries }} nowTitle={payload.now?.title} locale={locale} />

      <SpaceGrid heading={copy.spacesHeading} headingId="dk-spaces-title" spaces={dockSpaces(locale)} />

      <ZineFeatureTrio
        now={payload.now}
        live={<LiveTicker initial={payload.now} />}
        leadStationId={live?.id}
        locale={locale}
      />

      <CrewConstellation counts={payload.counts} stations={payload.stations} locale={locale} />

      <ArchiveTimeline slotCount={payload.week.length} locale={locale} />

      <ZineSkaPosterSection />

      <Card id="world-monitor">
        <CardBody className="m-stack" style={{ gap: 16 }}>
          <div className="dk-deck-header">
            <div>
              <Tape tone="accent">{copy.worldMonitor}</Tape>
              <h2 className="dk-section-heading">{copy.globalPulse}</h2>
            </div>
          </div>
          <p className="m-muted" role="status">{copy.worldMonitorNotice}</p>
        </CardBody>
      </Card>

      <Card id="signals">
        <CardBody className="m-stack" style={{ gap: 18 }}>
          <div className="dk-deck-header">
            <div>
              <Tape tone="pink">{copy.liveRadioTelemetry}</Tape>
              <h2 className="dk-section-heading">{copy.signalsInDock}</h2>
            </div>
            <LinkButton href={localeHref('/stations')} variant="accent" size="sm">
              {copy.allStations} ({formatLocaleNumber(payload.counts.stations, locale)}) <Chevron dir="right" />
            </LinkButton>
          </div>

          <div className="m-grid m-grid-2">
            <NowPlayingCard now={payload.now} live={<LiveTicker initial={payload.now} />} locale={locale} />
            <ChartBars
              title={copy.mostPlayedSignals}
              rows={payload.topStations.map((row) => (row.href ? { ...row, href: localeHref(row.href) } : row))}
              empty={copy.noListens}
            />
          </div>

          <StationDirectoryGrid stations={payload.stations} locale={locale} />

          <div className="m-grid m-grid-2">
            <ChartBars title={copy.signalsPerCountry} rows={payload.perCountry} empty={copy.noCountryData} />
            <ChartBars title={copy.signalsPerGenre} rows={payload.perGenre} empty={copy.noGenreData} />
          </div>

          <div className="m-stack" style={{ gap: 12 }}>
            <div>
              <Tape tone="cyan">{copy.weeklyGrid}</Tape>
            </div>
            <WeekGrid slots={payload.week} today={todayWeekday()} locale={locale} />
          </div>
        </CardBody>
      </Card>

      {live ? (
        <Player
          stationId={live.id}
          stationName={live.name}
          streamUrl={live.streamUrl}
          availableStations={payload.stations}
          locale={locale}
        />
      ) : null}
    </div>
  )
}
