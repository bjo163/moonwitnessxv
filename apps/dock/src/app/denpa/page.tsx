import type { ReactNode } from 'react'
import { Badge, CardSkeleton, PageHeader } from '@moonwitness/moonui'
import { readLiveTransmissions } from '@/data/queries/denpa'
import { panelErrorMessage } from '@/data/queries/error'
import { serverClient } from '@/data/sdk'
import { DenpaTransceiver } from '@/ui/client/DenpaTransceiver'
import { OutcomePanel, readPanel, type PanelCopy } from '@/ui/components/states'
import { headers } from 'next/headers'
import { DOCK_LOCALE_HEADER, dockHrefFor, localeFromMiddlewareHeader } from '@/lib/locale-context.mjs'
import { getStatesCopy } from '@/lib/states-copy'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'DENPA Transceiver (電波)',
  description: 'Inbound shortwave message broadcast deck and live frequency monitor for Moonwitness Radio.',
}

export default async function DenpaPage(): Promise<ReactNode> {
  const requestHeaders = await headers()
  const locale = localeFromMiddlewareHeader(requestHeaders.get(DOCK_LOCALE_HEADER))
  const localeHref = dockHrefFor(locale)
  const copy = getStatesCopy(locale)

  const panelCopy: PanelCopy = {
    loadingLabel: copy.loadingTransmissions,
    emptyTitle: copy.emptyDenpaTransmissions,
    errorMessage: copy.errorDenpaUnavailable,
  }

  const [feedOutcome, stationsRes] = await Promise.all([
    readPanel(() => readLiveTransmissions(), panelCopy, neverEmpty, (err) =>
      panelErrorMessage(err, copy.errorDenpaUnavailable),
    ),
    serverClient().view('stationCatalog').read({ limit: 50 }).catch(() => ({ rows: [] })),
  ])

  const stations = stationsRes.rows.map((s) => ({
    id: String(s.id),
    name: s.name,
  }))

  const feed = feedOutcome.state === 'ready' ? feedOutcome.value : null

  return (
    <div className="m-stack" style={{ gap: 20 }}>
      <PageHeader
        title="DENPA Transceiver (電波)"
        subtitle="Tactical Shortwave Inbound Broadcast Deck · Zero Data In Clear · Epistemic Telemetry Feed"
        breadcrumbs={[{ label: 'Home', href: localeHref('/') }, { label: 'Denpa' }]}
        actions={
          <div className="m-row" style={{ gap: 8, flexWrap: 'wrap' }}>
            {feed ? <Badge tone="cyan">{feed.length} on-air</Badge> : null}
            <Badge tone="ok">{stations.length} target stations</Badge>
          </div>
        }
      />

      {/* An empty band is still a working deck: the visitor must be able to transmit
          the first message, so the feed read only reports loading and error here and
          the transceiver owns its own empty notice. */}
      <OutcomePanel
        outcome={feedOutcome}
        copy={panelCopy}
        skeleton={
          <div className="m-stack" style={{ gap: 14 }}>
            <CardSkeleton />
            <CardSkeleton />
          </div>
        }
      >
        {(transmissions) => (
          <DenpaTransceiver initialTransmissions={transmissions} stations={stations} locale={locale} />
        )}
      </OutcomePanel>
    </div>
  )
}

/** Empty is not a panel state for this deck — see the note above. */
function neverEmpty(): boolean {
  return false
}
