import type { ReactNode } from 'react'
import { Badge, PageHeader } from '@moonwitness/moonui'
import { readLiveTransmissions } from '@/data/queries/denpa'
import { serverClient } from '@/data/sdk'
import { DenpaTransceiver } from '@/ui/client/DenpaTransceiver'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'DENPA Transceiver (電波)',
  description: 'Inbound shortwave message broadcast deck and live frequency monitor for Moonwitness Radio.',
}

export default async function DenpaPage(): Promise<ReactNode> {
  const [transmissions, stationsRes] = await Promise.all([
    readLiveTransmissions(),
    serverClient().view('stationCatalog').read({ limit: 50 }).catch(() => ({ rows: [] })),
  ])

  const stations = stationsRes.rows.map((s) => ({
    id: String(s.id),
    name: s.name,
  }))

  return (
    <div className="m-stack" style={{ gap: 20 }}>
      <PageHeader
        title="DENPA Transceiver (電波)"
        subtitle="Tactical Shortwave Inbound Broadcast Deck · Zero Data In Clear · Epistemic Telemetry Feed"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Denpa' }]}
        actions={
          <div className="m-row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <Badge tone="cyan">{transmissions.length} on-air</Badge>
            <Badge tone="ok">{stations.length} target stations</Badge>
          </div>
        }
      />

      <DenpaTransceiver
        initialTransmissions={transmissions}
        stations={stations}
      />
    </div>
  )
}
