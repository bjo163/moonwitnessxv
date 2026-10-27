import { Badge, Card, CardBody, LinkButton, Tape, type BadgeTone, Chevron } from '@moonwitness/moonui'
import { formatLocaleNumber } from '@moonwitness/core'
import { headers } from 'next/headers'
import { homePayload } from '@/data/queries/program'
import { Player } from '@/ui/client/Player'
import { LiveTicker } from '@/ui/client/LiveTicker'
import { Hero } from '@/ui/components/shell'
import { SpaceGrid } from '@/ui/components/spaces'
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
    return <div className="dk-home-stack"><OfflineLanding copy={copy} /><SpaceGrid locale={locale} /></div>
  }
  const live = payload.stations.find((station) => station.id === payload.now?.stationId) ?? payload.stations[0]

  return (
    <div className="dk-home-stack">
      <Hero counts={{ stations: payload.counts.stations, countries: payload.counts.countries }} nowTitle={payload.now?.title} locale={locale} />

      <SpaceGrid locale={locale} />

      <ZineFeatureTrio
        now={payload.now}
        live={<LiveTicker initial={payload.now} />}
        leadStationId={live?.id}
        locale={locale}
      />

      <CrewConstellation counts={payload.counts} stations={payload.stations} locale={locale} />

      <ArchiveTimeline slotCount={payload.week.length} locale={locale} />

      <ZineSkaPosterSection />

      {payload.signals?.length ? (
        <Card id="world-monitor">
          <CardBody className="m-stack" style={{ gap: 16 }}>
            <div className="dk-deck-header">
              <div>
                <Tape tone="accent">{copy.worldMonitor}</Tape>
                <h2 className="dk-section-heading">{copy.globalPulse}</h2>
              </div>
              <span className="m-muted" style={{ fontSize: 13 }}>
                {copy.liveFeedAiTriaged}
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
                        {sig.platform} · {sig.radarRefRecord?.name ?? copy.radar}
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
                      <span className="m-muted">{copy.urgency}: {formatLocaleNumber(sig.urgencyScore, locale)}%</span>
                      {sig.viewsCount ? (
                        <span className="m-muted">{formatLocaleNumber(sig.viewsCount / 1000, locale)}k {copy.views}</span>
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

          <StationGrid stations={payload.stations} locale={locale} />

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
        />
      ) : null}
    </div>
  )
}
