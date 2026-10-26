import { notFound } from 'next/navigation'
import { Badge, LinkButton, PageHeader, Panel, StatCard } from '@moonwitness/moonui'
import { getStation } from '@/data/queries/catalog'
import { clock } from '@/lib/time'
import { Player } from '@/ui/client/Player'

export const dynamic = 'force-dynamic'

export default async function StationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const detail = await getStation(id)
  if (!detail) notFound()

  const { station, country, slots, plays } = detail

  return (
    <div className="m-stack" style={{ gap: 20 }}>
      <PageHeader
        title={station.name}
        subtitle={`${station.genre ?? 'unformatted'} · ${station.countryRefRecord?.name ?? 'unknown country'} · ${plays} logged play${plays === 1 ? '' : 's'}`}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Signals', href: '/stations' }, { label: station.name }]}
        actions={
          <span className="m-row">
            <Badge tone={station.statusLabel === 'live' ? 'ok' : 'accent'}>
              {station.statusLabel === 'live' ? 'on the air' : 'off the air'}
            </Badge>
            <LinkButton href="/stations" variant="ghost" size="sm">
              ← Back to catalog
            </LinkButton>
          </span>
        }
      />

      <Player stationId={station.id} stationName={station.name} streamUrl={station.streamUrl} />

      <Panel title="Reference Telemetry" subtitle="country, region, currency and language metadata">
        {country ? (
          <div className="m-grid m-grid-3">
            <StatCard label="country" value={`${country.name} (${country.code})`} />
            <StatCard label="region" value={country.region ?? '—'} />
            <StatCard label="calling code" value={country.calling ?? '—'} />
            <StatCard label="currency" value={country.currencyRefRecord?.name ?? '—'} />
            <StatCard label="language" value={country.officialLangRecord?.name ?? '—'} />
            <StatCard label="logged plays" value={plays} />
          </div>
        ) : (
          <p className="m-muted">This station has no country reference.</p>
        )}
      </Panel>

      <Panel title={`Schedule (${slots.length} slots)`} subtitle="weekly transmission windows in UTC">
        {slots.length === 0 ? (
          <p className="m-muted">No slots scheduled for this station yet.</p>
        ) : (
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
                  {slot.host ? `hosted by ${slot.host}` : 'no host'}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}
