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
import { headers } from 'next/headers'
import { DOCK_LOCALE_HEADER, localeFromMiddlewareHeader } from '@/lib/locale-context.mjs'
import { getStatesCopy } from '@/lib/states-copy'

export const dynamic = 'force-dynamic'

export default async function StationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; genre?: string; country?: string; page?: string }>
}) {
  const requestHeaders = await headers()
  const locale = localeFromMiddlewareHeader(requestHeaders.get(DOCK_LOCALE_HEADER))
  const copy = getStatesCopy(locale)

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
          <Field label={copy.formSearch} htmlFor="q">
            <TextInput id="q" name="q" defaultValue={filters.q ?? ''} placeholder={copy.formSearchStationPlaceholder} icon="FIND" />
          </Field>
          <Field label={copy.formGenre} htmlFor="genre">
            <SelectInput
              id="genre"
              name="genre"
              defaultValue={filters.genre ?? ''}
              placeholder={copy.formAllGenres}
              options={page.genres.map((genre) => ({ value: genre, label: genre }))}
            />
          </Field>
          <Field label={copy.formCountry} htmlFor="country">
            <SelectInput
              id="country"
              name="country"
              defaultValue={filters.country ?? ''}
              placeholder={copy.formAllCountries}
              options={page.countries.map((country) => ({ value: country.id, label: country.name }))}
            />
          </Field>
          <Button type="submit" variant="accent">
            {copy.formFilter}
          </Button>
          <LinkButton href="/stations" variant="ghost">
            {copy.formReset}
          </LinkButton>
        </form>
      </Panel>

      <StationGrid stations={page.rows} locale={locale} />

      <Pagination page={page.page} pageSize={PAGE_SIZE} total={page.total} hrefFor={hrefFor} />
    </div>
  )
}
