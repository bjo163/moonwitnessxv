import { notFound } from 'next/navigation'
import { Badge, CardSkeleton, LinkButton, PageHeader, Panel, StatCard, Chevron } from '@moonwitness/moonui'
import { getStation } from '@/data/queries/catalog'
import { clock } from '@/lib/time'
import { Player } from '@/ui/client/Player'
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

  const { id } = await params
  const detail = await getStation(id)
  if (!detail) notFound()

  const { station, country, slots, plays } = detail

  return (
    <div className="m-stack" style={{ gap: 20 }}>
      <PageHeader
        title={station.name}
        subtitle={`${station.genre ?? copy.fallbackUnformatted} · ${station.countryRefRecord?.name ?? copy.fallbackUnknownCountry} · ${plays} logged play${plays === 1 ? '' : 's'}`}
        breadcrumbs={[{ label: 'Home', href: localeHref('/') }, { label: 'Signals', href: localeHref('/stations') }, { label: station.name }]}
        actions={
          <span className="m-row">
            <Badge tone={station.statusLabel === 'live' ? 'ok' : 'accent'}>
              {station.statusLabel === 'live' ? 'on the air' : 'off the air'}
            </Badge>
            <LinkButton href={localeHref('/stations')} variant="ghost" size="sm">
              <Chevron dir="left" /> Back to catalog
            </LinkButton>
          </span>
        }
      />

      <Player stationId={station.id} stationName={station.name} streamUrl={station.streamUrl} />

      <Panel title="Reference Telemetry" subtitle="country, region, currency and language metadata">
        <PanelState
          state={country ? 'ready' : 'empty'}
          loadingLabel={copy.loadingContent}
          emptyTitle={copy.emptyStationNoCountry}
          errorMessage={copy.emptyStationNoCountry}
        >
          <div className="m-grid m-grid-3">
            <StatCard label="country" value={`${country?.name ?? '—'} (${country?.code ?? '—'})`} />
            <StatCard label="region" value={country?.region ?? '—'} />
            <StatCard label="calling code" value={country?.calling ?? '—'} />
            <StatCard label="currency" value={country?.currencyRefRecord?.name ?? '—'} />
            <StatCard label="language" value={country?.officialLangRecord?.name ?? '—'} />
            <StatCard label="logged plays" value={plays} />
          </div>
        </PanelState>
      </Panel>

      <Panel title={`Schedule (${slots.length} slots)`} subtitle="weekly transmission windows in UTC">
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
                  {slot.host ? `hosted by ${slot.host}` : copy.emptyStationNoHost}
                </div>
              </div>
            ))}
          </div>
        </PanelState>
      </Panel>
    </div>
  )
}
