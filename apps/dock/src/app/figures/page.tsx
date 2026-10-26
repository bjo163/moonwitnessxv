import { MoonApiError } from '@moonwitness/moonql-client'
import { Alert, Badge, PageHeader } from '@moonwitness/moonui'
import { readFigures, type FigureRegistry } from '@/data/queries/actors'
import { FigureRegistryView } from '@/ui/components/actors'
import { headers } from 'next/headers'
import { DOCK_LOCALE_HEADER, localeFromMiddlewareHeader } from '@/lib/locale-context.mjs'
import { getStatesCopy } from '@/lib/states-copy'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Figure Registry',
  description: 'Source-cited figures with tradition-scoped roles, events and mission readings. A shared name never merges.',
}

export default async function FiguresPageView() {
  const requestHeaders = await headers()
  const locale = localeFromMiddlewareHeader(requestHeaders.get(DOCK_LOCALE_HEADER))
  const copy = getStatesCopy(locale)

  let registry: FigureRegistry | null = null
  let error: string | null = null
  try {
    registry = await readFigures()
  } catch (err) {
    error = err instanceof MoonApiError ? err.message : copy.errorFiguresUnavailable
  }

  return (
    <div className="m-stack" style={{ gap: 20 }}>
      <PageHeader
        title="Figure Registry"
        subtitle="One referent per figure · a shared name never merges · every role and mission keeps its source"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Figures' }]}
        actions={
          <div className="m-row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <a className="dk-actors-header-link" href="/missions">
              MISSION TABLE
            </a>
            {registry ? <Badge tone="cyan">{registry.counts.figures} figures</Badge> : null}
          </div>
        }
      />

      {error ? <Alert tone="hot">{error}</Alert> : null}
      {registry ? <FigureRegistryView registry={registry} /> : null}
    </div>
  )
}
