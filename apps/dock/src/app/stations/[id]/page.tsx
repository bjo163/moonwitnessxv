import { notFound } from 'next/navigation'
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
      <a href="/stations" className="dk-muted dk-small">
        ← back to the catalog
      </a>

      <div className="dk-detail">
        <section className="dk-card">
          <div className="dk-card-label">{station.statusLabel === 'live' ? 'on the air' : 'off the air'}</div>
          <h1 style={{ margin: 0, fontSize: 34 }}>{station.name}</h1>
          <div className="dk-row dk-muted">
            <span>{station.genre ?? 'unformatted'}</span>
            <span>· {station.countryRefRecord?.name ?? 'unknown country'}</span>
            <span>· {plays} logged play{plays === 1 ? '' : 's'}</span>
          </div>
          <Player stationId={station.id} stationName={station.name} streamUrl={station.streamUrl} />
        </section>

        <section className="dk-card">
          <div className="dk-card-label">Reference data</div>
          {country ? (
            <div className="dk-facts">
              <div className="dk-fact">
                <b>country</b>
                {country.name} ({country.code})
              </div>
              <div className="dk-fact">
                <b>region</b>
                {country.region ?? '—'}
              </div>
              <div className="dk-fact">
                <b>calling code</b>
                {country.calling ?? '—'}
              </div>
              <div className="dk-fact">
                <b>currency</b>
                {country.currencyRefRecord?.name ?? '—'}
              </div>
              <div className="dk-fact">
                <b>language</b>
                {country.officialLangRecord?.name ?? '—'}
              </div>
            </div>
          ) : (
            <p className="dk-muted">This station has no country reference.</p>
          )}
        </section>
      </div>

      <section className="m-stack" style={{ gap: 10 }}>
        <div className="dk-card-label">Schedule ({slots.length} slots)</div>
        {slots.length === 0 ? (
          <p className="dk-muted">No slots scheduled for this station yet.</p>
        ) : (
          <div className="dk-grid">
            {slots.map((slot) => (
              <div className="dk-station" key={slot.id}>
                <div className="dk-station-top">
                  <strong>{slot.title}</strong>
                  <span className="dk-pill">{slot.weekday}</span>
                </div>
                <div className="dk-mono dk-small">
                  {clock(slot.startMin)}–{clock(slot.endMin)}
                </div>
                <div className="dk-muted dk-small">{slot.host ? `hosted by ${slot.host}` : 'no host'}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
