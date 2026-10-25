import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Player } from '@/ui/client/Player'
import { getEmbedStation } from '@/data/queries/catalog'

/**
 * GET /embed/:id — the station, framed.
 *
 * The page exists because `middleware.ts` can now allow-list `frame-ancestors` for
 * this path only; every other route in this app keeps 'none' + X-Frame-Options: DENY.
 * An embed is the one place where another site is deliberately given a window into
 * ours, so it gets the smallest possible surface: no session, no cookies read, one
 * station name and the player. If `EMBED_ORIGINS` is unset, the CSP for this path is
 * still 'none' — the page renders, and no browser may frame it.
 */
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const station = await getEmbedStation(id).catch(() => null)
  return {
    title: station ? `${station.name} — live` : 'Not found',
    // an embed is a window into live audio, not a page to be indexed
    robots: { index: false, follow: false },
  }
}

export default async function EmbedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // An id that cannot be a station is answered here instead of being sent to the
  // hub: a malformed uuid comes back as a 400 ("bad request"), and treating that as
  // "no such station" would hide a real hub fault behind a pretty 404 page.
  const station = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    ? await getEmbedStation(id)
    : null
  if (!station || !station.streamUrl) notFound()

  return (
    <div className="dk-embed" data-status={station.statusLabel}>
      <div className="dk-embed-head">
        <strong>{station.name}</strong>
        <span className="dk-muted dk-small">{station.genre ?? 'radio'}</span>
      </div>
      <Player stationId={station.id} stationName={station.name} streamUrl={station.streamUrl} />
      <a className="dk-muted dk-small" href={`/stations/${station.id}`} target="_blank" rel="noopener noreferrer">
        open in {`Moonwitness`}
      </a>
    </div>
  )
}
