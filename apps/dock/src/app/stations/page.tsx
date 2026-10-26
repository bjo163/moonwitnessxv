import {
  Button,
  Field,
  LinkButton,
  PageHeader,
  Pagination,
  Panel,
  SelectInput,
  TextInput,
} from '@moonwitness/moonui'
import { listStations } from '@/data/queries/catalog'
import { PAGE_SIZE } from '@/lib/env'
import { StationGrid } from '@/ui/components/sections'

export const dynamic = 'force-dynamic'

export default async function StationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; genre?: string; country?: string; page?: string }>
}) {
  const filters = await searchParams
  const page = await listStations(filters)

  const hrefFor = (target: number): string => {
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.genre) params.set('genre', filters.genre)
    if (filters.country) params.set('country', filters.country)
    if (target > 1) params.set('page', String(target))
    const query = params.toString()
    return `/stations${query ? `?${query}` : ''}`
  }

  const filtered = Boolean(filters.q || filters.genre || filters.country)

  return (
    <div className="m-stack" style={{ gap: 20 }}>
      <PageHeader
        title="Signal Catalog"
        subtitle={`${filtered ? `${page.total} of ${page.catalogSize}` : page.catalogSize} public stations in the network`}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Signals' }]}
      />

      <Panel title="Filter Signals" subtitle="search by station name, genre, or origin country">
        <form className="m-row" style={{ alignItems: 'flex-end', gap: 14 }} method="get" action="/stations">
          <Field label="Search" htmlFor="q">
            <TextInput id="q" name="q" defaultValue={filters.q ?? ''} placeholder="name or genre" icon="🔍" />
          </Field>
          <Field label="Genre" htmlFor="genre">
            <SelectInput
              id="genre"
              name="genre"
              defaultValue={filters.genre ?? ''}
              placeholder="all genres"
              options={page.genres.map((genre) => ({ value: genre, label: genre }))}
            />
          </Field>
          <Field label="Country" htmlFor="country">
            <SelectInput
              id="country"
              name="country"
              defaultValue={filters.country ?? ''}
              placeholder="all countries"
              options={page.countries.map((country) => ({ value: country.id, label: country.name }))}
            />
          </Field>
          <Button type="submit" variant="accent">
            Filter
          </Button>
          <LinkButton href="/stations" variant="ghost">
            Reset
          </LinkButton>
        </form>
      </Panel>

      <StationGrid stations={page.rows} />

      <Pagination page={page.page} pageSize={PAGE_SIZE} total={page.total} hrefFor={hrefFor} />
    </div>
  )
}
