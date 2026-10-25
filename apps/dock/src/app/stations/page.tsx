import { listStations } from '@/data/queries/catalog'
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
      <div className="dk-card-label">
        Station catalog ·{' '}
        {filtered ? `${page.total} of ${page.catalogSize}` : page.catalogSize} public stations
      </div>

      <form className="dk-filters" method="get" action="/stations">
        <label>
          Search
          <input name="q" defaultValue={filters.q ?? ''} placeholder="name or genre" />
        </label>
        <label>
          Genre
          <select name="genre" defaultValue={filters.genre ?? ''}>
            <option value="">all genres</option>
            {page.genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </label>
        <label>
          Country
          <select name="country" defaultValue={filters.country ?? ''}>
            <option value="">all countries</option>
            {page.countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="dk-play">
          filter
        </button>
        <a href="/stations" className="dk-muted dk-small">
          reset
        </a>
      </form>

      <StationGrid stations={page.rows} />

      <div className="dk-pager">
        {page.page > 1 ? <a href={hrefFor(page.page - 1)}>← prev</a> : null}
        <span className="dk-muted">
          page {page.page} / {page.pages}
        </span>
        {page.page < page.pages ? <a href={hrefFor(page.page + 1)}>next →</a> : null}
      </div>
    </div>
  )
}
