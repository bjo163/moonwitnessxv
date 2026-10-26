import { MoonApiError } from '@moonwitness/moonql-client'
import { Alert, Badge, PageHeader } from '@moonwitness/moonui'
import { readConstellation, type ConstellationProjection } from '@/data/queries/constellation'
import { ConstellationView } from '@/ui/components/constellation'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Constellation',
  description: 'A read-only ontology projection with sourced aliases, typed edges and reviewer identity decisions.',
}

export default async function ConstellationPage() {
  let projection: ConstellationProjection | null = null
  let error: string | null = null
  try {
    projection = await readConstellation()
  } catch (err) {
    error = err instanceof MoonApiError ? err.message : 'The Constellation projection is unavailable.'
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
      {projection ? <ConstellationView projection={projection} /> : null}
    </div>
  )
}
