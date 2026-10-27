import { Badge, CardSkeleton, PageHeader, TableSkeleton } from '@moonwitness/moonui'
import { readConstellation, type ConstellationProjection } from '@/data/queries/constellation'
import { readGraphOverview, type GraphOverview } from '@/data/queries/graph'
import { panelErrorMessage } from '@/data/queries/error'
import { ConstellationView } from '@/ui/components/constellation'
import { GraphReleasePanel } from '@/ui/components/graph-relation'
import { OutcomePanel, readPanel, type PanelCopy } from '@/ui/components/states'
import { headers } from 'next/headers'
import { DOCK_LOCALE_HEADER, localeFromMiddlewareHeader } from '@/lib/locale-context.mjs'
import { getStatesCopy } from '@/lib/states-copy'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Constellation',
  description: 'A read-only ontology projection with sourced aliases, typed edges and reviewer identity decisions.',
}

/**
 * Two panels, two reads: the projection and the release overview fail apart,
 * so a missing release never erases the graph and an empty graph never erases
 * the release queue. Both are awaited because the page header carries the
 * graph identity, which belongs to the projection.
 */
export default async function ConstellationPage() {
  const requestHeaders = await headers()
  const locale = localeFromMiddlewareHeader(requestHeaders.get(DOCK_LOCALE_HEADER))
  const copy = getStatesCopy(locale)

  const graphCopy: PanelCopy = {
    loadingLabel: copy.loadingContent,
    emptyTitle: copy.emptyGraph,
    emptyHint: copy.emptyGraphHint,
    errorMessage: copy.errorConstellationUnavailable,
  }
  const releaseCopy: PanelCopy = {
    loadingLabel: copy.loadingContent,
    emptyTitle: copy.emptyGraphRelease,
    emptyHint: copy.emptyGraphHint,
    errorMessage: copy.errorGraphUnavailable,
  }

  const [projectionOutcome, overviewOutcome] = await Promise.all([
    readPanel<ConstellationProjection>(
      readConstellation,
      graphCopy,
      (projection) => projection.nodes.length === 0,
      (err) => panelErrorMessage(err, copy.errorConstellationUnavailable),
    ),
    readPanel<GraphOverview>(
      readGraphOverview,
      releaseCopy,
      (overview) => overview.active === null && overview.candidates.length === 0,
      (err) => panelErrorMessage(err, copy.errorGraphUnavailable),
    ),
  ])

  const projection = projectionOutcome.state === 'ready' ? projectionOutcome.value : null

  return (
    <div className="m-stack" style={{ gap: 20 }}>
      <PageHeader
        title="Constellation"
        subtitle="One sourced graph · aliases are claims · a merge is a reviewer decision"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Constellation' }]}
        actions={projection ? <Badge tone="cyan">{projection.graphId}</Badge> : undefined}
      />

      <OutcomePanel
        outcome={projectionOutcome}
        copy={graphCopy}
        skeleton={
          <div className="m-stack" style={{ gap: 14 }}>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        }
      >
        {(value) => <ConstellationView projection={value} />}
      </OutcomePanel>

      <OutcomePanel outcome={overviewOutcome} copy={releaseCopy} skeleton={<TableSkeleton rows={4} cols={3} />}>
        {(value) => <GraphReleasePanel overview={value} />}
      </OutcomePanel>
    </div>
  )
}
