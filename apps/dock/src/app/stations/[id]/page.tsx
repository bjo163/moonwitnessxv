import { notFound } from 'next/navigation'
import { Badge, CardSkeleton, LinkButton, PageHeader, Panel, StatCard, Chevron } from '@moonwitness/moonui'
import { getStation } from '@/data/queries/catalog'
import { clock } from '@/lib/time'
import { Player } from '@/ui/client/Player'
import { getStationsCopy } from '@/ui/copy/stations-copy'
import { PanelState } from '@/ui/components/states'
import { headers } from 'next/headers'
import { DOCK_LOCALE_HEADER, dockHrefFor, localeFromMiddlewareHeader } from '@/lib/locale-context.mjs'
import { getStatesCopy } from '@/lib/states-copy'

export const dynamic = 'force-dynamic'

export default async function StationPage({ params }: { params: Promise<{ id: string }> }) {
  const requestHeaders = await headers()
  const locale = localeFromMiddlewareHeader(requestHeaders.get(DOCK_LOCALE_HEADER))
  const localeHref = dockHrefFor(locale)
  const copy = getStatesCopy(locale)
  const sCopy = getStationsCopy(locale)

  const { id } = await params
  const detail = await getStation(id)
  if (!detail) notFound()

  const { station, country, slots, plays } = detail

  return (
    <div className="m-stack" style={{ gap: 20 }}>
      <PageHeader
        title={station.name}
        subtitle={`${station.genre ?? copy.fallbackUnformatted} · ${station.countryRefRecord?.name ?? copy.fallbackUnknownCountry} · ${plays} ${plays === 1 ? sCopy.playsOne : sCopy.playsMany}`}
        breadcrumbs={[
          { label: sCopy.breadcrumbHome, href: localeHref('/') },
          { label: sCopy.breadcrumbSignals, href: localeHref('/stations') },
          { label: station.name },
        ]}
        actions={
          <span className="m-row">
            <Badge tone={station.statusLabel === 'live' ? 'ok' : 'accent'}>
              {station.statusLabel === 'live' ? sCopy.statusOnAir : sCopy.statusOffAir}
            </Badge>
            <LinkButton href={localeHref('/stations')} variant="ghost" size="sm">
              <Chevron dir="left" /> {sCopy.backToCatalog}
            </LinkButton>
          </span>
        }
      />

      <Player stationId={station.id} stationName={station.name} streamUrl={station.streamUrl} locale={locale} />

      <Panel title={sCopy.telemetryTitle} subtitle={sCopy.telemetrySubtitle}>
        <PanelState
          state={country ? 'ready' : 'empty'}
          loadingLabel={copy.loadingContent}
          emptyTitle={copy.emptyStationNoCountry}
          errorMessage={copy.emptyStationNoCountry}
        >
          <div className="m-grid m-grid-3">
            <StatCard label={sCopy.labelCountry} value={`${country?.name ?? '—'} (${country?.code ?? '—'})`} />
            <StatCard label={sCopy.labelRegion} value={country?.region ?? '—'} />
            <StatCard label={sCopy.labelCallingCode} value={country?.calling ?? '—'} />
            <StatCard label={sCopy.labelCurrency} value={country?.currencyRefRecord?.name ?? '—'} />
            <StatCard label={sCopy.labelLanguage} value={country?.officialLangRecord?.name ?? '—'} />
            <StatCard label={sCopy.labelLoggedPlays} value={plays} />
          </div>
        </PanelState>
      </Panel>

      <Panel title={`${sCopy.scheduleTitle} (${slots.length} ${sCopy.scheduleSlots})`} subtitle={sCopy.scheduleSubtitle}>
        <PanelState
          state={slots.length === 0 ? 'empty' : 'ready'}
          loadingLabel={copy.loadingContent}
          emptyTitle={copy.emptyStationNoSchedule}
          errorMessage={copy.emptyStationNoSchedule}
          loadingPlaceholder={<CardSkeleton />}
        >
          <div className="dk-grid">
            {slots.map((slot) => (
              <div className="dk-station" key={slot.id}>
                <div className="m-row" style={{ justifyContent: 'space-between' }}>
                  <strong>{slot.title}</strong>
                  <Badge tone="accent">{slot.weekday}</Badge>
                </div>
                <div className="m-mono" style={{ fontSize: 12 }}>
                  {clock(slot.startMin)}–{clock(slot.endMin)}
                </div>
                <div className="m-muted" style={{ fontSize: 12 }}>
                  {slot.host ? `${sCopy.hostedBy} ${slot.host}` : copy.emptyStationNoHost}
                </div>
              </div>
            ))}
          </div>
        </PanelState>
      </Panel>
    </div>
  )
}
