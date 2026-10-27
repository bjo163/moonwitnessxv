import { Badge, CardSkeleton, PageHeader } from '@moonwitness/moonui'
import { readFigures } from '@/data/queries/actors'
import { panelErrorMessage } from '@/data/queries/error'
import { FigureRegistryView } from '@/ui/components/actors'
import { DataPanel } from '@/ui/components/states'
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
          </div>
        }
      />

      <DataPanel
        load={readFigures}
        copy={{
          loadingLabel: copy.loadingContent,
          emptyTitle: copy.emptyFiguresRegistry,
          emptyHint: copy.emptyFiguresRegistryHint,
          errorMessage: copy.errorFiguresUnavailable,
        }}
        isEmpty={(registry) => registry.figures.length === 0}
        mapError={(err) => panelErrorMessage(err, copy.errorFiguresUnavailable)}
        skeleton={
          <div className="m-grid m-grid-3" style={{ gap: 14 }}>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        }
      >
        {(registry) => (
          <>
            <div className="m-row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Badge tone="cyan">{registry.counts.figures} figures</Badge>
            </div>
            <FigureRegistryView registry={registry} />
          </>
        )}
      </DataPanel>
    </div>
  )
}
