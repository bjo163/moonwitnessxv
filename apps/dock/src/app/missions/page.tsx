import { MoonApiError } from '@moonwitness/moonql-client'
import { Alert, Badge, Button, Field, PageHeader, Pagination, Panel, SelectInput, TextInput } from '@moonwitness/moonui'
import { readMissions, type MissionTable } from '@/data/queries/actors'
import { MissionTableView } from '@/ui/components/actors'

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

function missionsHref(filters: Record<string, string>, page: number): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '') params.set(key, value)
  }
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `/missions?${query}` : '/missions'
}

export default async function MissionsPageView({ searchParams }: { searchParams: Promise<MissionSearchParams> }) {
  const params = await searchParams
  const filters = {
    q: stringOf(params.q),
    tradition: stringOf(params.tradition),
    figure: stringOf(params.figure),
    confidence: stringOf(params.confidence),
  }
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1)
  const offset = (page - 1) * PAGE_SIZE

  let table: MissionTable | null = null
  let error: string | null = null
  try {
    table = await readMissions({ ...filters, limit: PAGE_SIZE, offset })
  } catch (err) {
    error = err instanceof MoonApiError ? err.message : 'The Prophetic Mission Table is unavailable.'
  }

  return (
    <div className="m-stack" style={{ gap: 20 }}>
      <PageHeader
        title="Prophetic Mission Table"
        subtitle="A filtered view over the Figure Registry · every claim keeps its tradition and source"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Missions' }]}
        actions={
          <div className="m-row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <a className="dk-actors-header-link" href="/figures">
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
        <form className="dk-actors-filter-form" method="get" action="/missions" role="search">
          <Field label="Search" htmlFor="missions-q" hint="Title, problem, community or figure">
            <TextInput id="missions-q" name="q" defaultValue={filters.q} placeholder="mercy" maxLength={120} />
          </Field>
          <Field label="Tradition" htmlFor="missions-tradition">
            <SelectInput
              id="missions-tradition"
              name="tradition"
              defaultValue={filters.tradition}
              placeholder="All traditions"
              options={(table?.options.traditions ?? [])
                .filter((tradition): tradition is NonNullable<typeof tradition> => tradition !== null)
                .map((tradition) => ({ value: tradition.code, label: `${tradition.label} · ${tradition.scope}` }))}
            />
          </Field>
          <Field label="Figure" htmlFor="missions-figure">
            <SelectInput
              id="missions-figure"
              name="figure"
              defaultValue={filters.figure}
              placeholder="All figures"
              options={(table?.options.figures ?? []).map((figure) => ({
                value: figure.code,
                label: `${figure.label} · ${figure.code}`,
              }))}
            />
          </Field>
          <Field label="Confidence" htmlFor="missions-confidence">
            <SelectInput
              id="missions-confidence"
              name="confidence"
              defaultValue={filters.confidence}
              placeholder="All confidence labels"
              options={(table?.options.confidences ?? []).map((status) => ({ value: status, label: status }))}
            />
          </Field>
          <Button type="submit" variant="accent">
            APPLY FILTERS
          </Button>
        </form>
      </Panel>

      {error ? <Alert tone="hot">{error}</Alert> : null}

      {table ? (
        <>
          <MissionTableView table={table} />
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={table.total}
            hrefFor={(target) => missionsHref(filters, target)}
          />
        </>
      ) : null}
    </div>
  )
}
