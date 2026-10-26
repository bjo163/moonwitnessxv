import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Badge, Card, CardBody, LinkButton } from '@moonwitness/moonui'
import { Player } from '@/ui/client/Player'
import { getEmbedStation } from '@/data/queries/catalog'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const station = await getEmbedStation(id).catch(() => null)
  return {
    title: station ? `${station.name} — live` : 'Not found',
    robots: { index: false, follow: false },
  }
}

export default async function EmbedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const station = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    ? await getEmbedStation(id)
    : null
  if (!station || !station.streamUrl) notFound()

  return (
    <Card data-status={station.statusLabel}>
      <CardBody className="m-stack" style={{ gap: 12 }}>
        <div className="m-row" style={{ justifyContent: 'space-between' }}>
          <strong>{station.name}</strong>
          <Badge tone="accent">{station.genre ?? 'radio'}</Badge>
        </div>
        <Player stationId={station.id} stationName={station.name} streamUrl={station.streamUrl} />
        <div>
          <LinkButton href={`/stations/${station.id}`} variant="ghost" size="sm" target="_blank" rel="noopener noreferrer">
            Open in Moonwitness →
          </LinkButton>
        </div>
      </CardBody>
    </Card>
  )
}
