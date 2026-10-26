import { MoonApiError } from '@moonwitness/moonql-client'
import { Alert, Badge, PageHeader } from '@moonwitness/moonui'
import { readConstellation, type ConstellationProjection } from '@/data/queries/constellation'
import { readGraphOverview, type GraphOverview } from '@/data/queries/graph'
import { ConstellationView } from '@/ui/components/constellation'
import { GraphReleasePanel } from '@/ui/components/graph-relation'
import { headers } from 'next/headers'
import { DOCK_LOCALE_HEADER, localeFromMiddlewareHeader } from '@/lib/locale-context.mjs'
import { getStatesCopy } from '@/lib/states-copy'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Constellation',
  description: 'A read-only ontology projection with sourced aliases, typed edges and reviewer identity decisions.',
}

export default async function ConstellationPage() {
  const requestHeaders = await headers()
  const locale = localeFromMiddlewareHeader(requestHeaders.get(DOCK_LOCALE_HEADER))
  const copy = getStatesCopy(locale)

  let projection: ConstellationProjection | null = null
  let error: string | null = null
  try {
    projection = await readConstellation()
  } catch (err) {
    error = err instanceof MoonApiError ? err.message : copy.errorConstellationUnavailable
  }

  let overview: GraphOverview | null = null
  let graphError: string | null = null
  try {
    overview = await readGraphOverview()
  } catch (err) {
    graphError = err instanceof MoonApiError ? err.message : copy.errorGraphUnavailable
  }

  return (
    <div className="m-stack" style={{ gap: 20 }}>
      <PageHeader
        title="Constellation"
        subtitle="One sourced graph · aliases are claims · a merge is a reviewer decision"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Constellation' }]}
        actions={projection ? <Badge tone="cyan">{projection.graphId}</Badge> : undefined}
      />

      {error ? <Alert tone="hot">{error}</Alert> : null}
      {graphError ? <Alert tone="hot">{graphError}</Alert> : null}
      {projection ? <ConstellationView projection={projection} /> : null}
      {overview ? <GraphReleasePanel overview={overview} /> : null}
    </div>
  )
}
