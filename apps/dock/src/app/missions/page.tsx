import { Badge, Button, Field, PageHeader, Pagination, Panel, SelectInput, TableSkeleton, TextInput } from '@moonwitness/moonui'
import { readMissions } from '@/data/queries/actors'
import { panelErrorMessage } from '@/data/queries/error'
import { MissionTableView } from '@/ui/components/actors'
import { OutcomePanel, readPanel, type PanelCopy } from '@/ui/components/states'
import { headers } from 'next/headers'
import { DOCK_LOCALE_HEADER, dockHrefFor, localeFromMiddlewareHeader, localizedDockHref } from '@/lib/locale-context.mjs'
import { getStatesCopy } from '@/lib/states-copy'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Prophetic Mission Table',
  description: 'A tradition-scoped view over the Figure Registry with sourced mission claims and no exclusive mission.',
}

const PAGE_SIZE = 12

interface MissionSearchParams {
  q?: string
  tradition?: string
  figure?: string
  confidence?: string
  page?: string
}

const stringOf = (value: string | undefined): string => (typeof value === 'string' ? value.trim() : '')

/** Pagination keeps the rendered locale: a page change must not drop the `/id` prefix. */
function missionsHref(filters: Record<string, string>, page: number, locale: ReturnType<typeof localeFromMiddlewareHeader>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '') params.set(key, value)
  }
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return localizedDockHref('/missions', query ? `?${query}` : '', '', locale)
}

export default async function MissionsPageView({ searchParams }: { searchParams: Promise<MissionSearchParams> }) {
  const requestHeaders = await headers()
  const locale = localeFromMiddlewareHeader(requestHeaders.get(DOCK_LOCALE_HEADER))
  const localeHref = dockHrefFor(locale)
  const copy = getStatesCopy(locale)

  const params = await searchParams
  const filters = {
    q: stringOf(params.q),
    tradition: stringOf(params.tradition),
    figure: stringOf(params.figure),
    confidence: stringOf(params.confidence),
  }
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1)
  const offset = (page - 1) * PAGE_SIZE

  const panelCopy: PanelCopy = {
    loadingLabel: copy.loadingContent,
    emptyTitle: copy.emptyMissionsFilter,
    emptyHint: copy.emptyMissionsFilterHint,
    errorMessage: copy.errorMissionsUnavailable,
  }
  const outcome = await readPanel(
    () => readMissions({ ...filters, limit: PAGE_SIZE, offset }),
    panelCopy,
    (table) => table.rows.length === 0,
    (err) => panelErrorMessage(err, copy.errorMissionsUnavailable),
  )
  const table = outcome.state === 'ready' ? outcome.value : null

  return (
    <div className="m-stack" style={{ gap: 20 }}>
      <PageHeader
        title="Prophetic Mission Table"
        subtitle="A filtered view over the Figure Registry · every claim keeps its tradition and source"
        breadcrumbs={[{ label: 'Home', href: localeHref('/') }, { label: 'Missions' }]}
        actions={
          <div className="m-row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <a className="dk-actors-header-link" href={localeHref('/figures')}>
              FIGURE REGISTRY
            </a>
            {table ? <Badge tone="cyan">{table.total} mission claims</Badge> : null}
          </div>
        }
      />

      <Panel
        title="Filter the table"
        subtitle="Search matches the claim title, problem, community and figure labels. Nothing is widened silently."
      >
        <form className="dk-actors-filter-form" method="get" action={localeHref('/missions')} role="search">
          <Field label={copy.formSearch} htmlFor="missions-q" hint={copy.formMissionsSearchHint}>
            <TextInput id="missions-q" name="q" defaultValue={filters.q} placeholder={copy.formMissionsSearchPlaceholder} maxLength={120} />
          </Field>
          <Field label={copy.formTradition} htmlFor="missions-tradition">
            <SelectInput
              id="missions-tradition"
              name="tradition"
              defaultValue={filters.tradition}
              placeholder={copy.formAllTraditions}
              options={(table?.options.traditions ?? [])
                .filter((tradition): tradition is NonNullable<typeof tradition> => tradition !== null)
                .map((tradition) => ({ value: tradition.code, label: `${tradition.label} · ${tradition.scope}` }))}
            />
          </Field>
          <Field label={copy.formFigure} htmlFor="missions-figure">
            <SelectInput
              id="missions-figure"
              name="figure"
              defaultValue={filters.figure}
              placeholder={copy.formAllFigures}
              options={(table?.options.figures ?? []).map((figure) => ({
                value: figure.code,
                label: `${figure.label} · ${figure.code}`,
              }))}
            />
          </Field>
          <Field label={copy.formConfidence} htmlFor="missions-confidence">
            <SelectInput
              id="missions-confidence"
              name="confidence"
              defaultValue={filters.confidence}
              placeholder={copy.formAllConfidence}
              options={(table?.options.confidences ?? []).map((status) => ({ value: status, label: status }))}
            />
          </Field>
          <Button type="submit" variant="accent">
            {copy.formApplyFilters}
          </Button>
        </form>
      </Panel>

      <OutcomePanel outcome={outcome} copy={panelCopy} skeleton={<TableSkeleton rows={6} cols={5} />}>
        {(missionTable) => (
          <>
            <MissionTableView table={missionTable} locale={locale} />
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={missionTable.total}
              hrefFor={(target) => missionsHref(filters, target, locale)}
            />
          </>
        )}
      </OutcomePanel>
    </div>
  )
}
