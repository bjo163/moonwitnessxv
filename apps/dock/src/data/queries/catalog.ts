import { MoonApiError, type Rows, type ViewOutputs } from '@moonwitness/moonql-client'
import { serverClient } from '@/data/sdk'
import { PAGE_SIZE } from '@/lib/env'
import { slotProgress } from '@/lib/time'

type CatalogRow = ViewOutputs['stationCatalog']
type StationRow = Rows['stations']
type CountryRow = Rows['countries']
type GridSlotRow = Rows['schedule_slots']

/**
 * What a station page needs. This is a composite of three hub rows, not a copy of
 * one view's shape — the mirroring it used to be is why a renamed hub field broke
 * this app silently: the mapper made the old name live on forever locally.
 */
export interface StationDetail {
  station: StationRow
  country: CountryRow | null
  slots: GridSlotRow[]
  plays: number
}

export interface StationFilters {
  q?: string
  genre?: string
  country?: string
  page?: string
}

export interface StationPage {
  rows: CatalogRow[]
  /** rows matching the active filters */
  total: number
  /** the whole public catalog, so "x of y" can compare like with like */
  catalogSize: number
  page: number
  pages: number
  genres: string[]
  countries: { id: string; name: string }[]
}

/**
 * One request (`stationCatalog`, limit 100) feeds the grid, the filter options
 * and the pagination: the page never issues N extra calls for derived data.
 */
export async function listStations(filters: StationFilters = {}): Promise<StationPage> {
  const page = await serverClient().view('stationCatalog').read({ limit: 100 })
  const all = page.rows

  const genres = [...new Set(all.map((row) => row.genre).filter((value): value is string => Boolean(value)))].sort()
  const countries = [...new Map(all.filter((row) => row.countryRef && row.countryRefRecord?.name).map((row) => [row.countryRef!, row.countryRefRecord!.name!])).entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const needle = filters.q?.trim().toLowerCase()
  const filtered = all.filter((row) => {
    if (needle && !row.name.toLowerCase().includes(needle) && !(row.genre ?? '').toLowerCase().includes(needle)) return false
    if (filters.genre && row.genre !== filters.genre) return false
    if (filters.country && row.countryRef !== filters.country) return false
    return true
  })

  const current = Math.max(1, Number(filters.page ?? 1) || 1)
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const start = (current - 1) * PAGE_SIZE

  return {
    rows: filtered.slice(start, start + PAGE_SIZE),
    total: filtered.length,
    catalogSize: all.length,
    page: Math.min(current, pages),
    pages,
    genres,
    countries,
  }
}

export async function getStation(id: string): Promise<StationDetail | null> {
  const client = serverClient()
  let station
  try {
    station = await client.model('stations').get(id, { expand: ['countryRef'] })
  } catch (err) {
    // "no such station" is a 404 page; an unreachable or broken hub is not, and
    // pretending otherwise showed visitors a not-found during every outage
    if (err instanceof MoonApiError && err.statusCode === 404) return null
    throw err
  }

  const [country, slots, chart] = await Promise.all([
    station.countryRef
      ? client.model('countries').get(station.countryRef, { expand: ['currencyRef', 'officialLang'] }).catch(() => null)
      : Promise.resolve(null),
    client.model('schedule_slots').list({ where: { stationRef: id }, limit: 100, order: 'dayIndex,startMin' }),
    client.view('topStations').read({ limit: 10 }),
  ])

  return {
    // the hub's own row shape, straight to the page: `expand` already joined the
    // country and the chart, so there is nothing for a mapper to add
    station,
    country,
    slots: slots.rows,
    plays: chart.rows.find((row) => row.stationRef === id)?.plays ?? 0,
  }
}

/**
 * The lightest answer the embed needs: one station, one request.
 * `getStation` also fetches the country, the week grid and the chart — correct for
 * the detail page and wasteful inside an iframe that shows a name and a play button.
 */
export async function getEmbedStation(id: string): Promise<StationRow | null> {
  try {
    return await serverClient().model('stations').get(id)
  } catch (err) {
    // same rule as the detail page: a missing station is a 404, an unreachable hub is not
    if (err instanceof MoonApiError && err.statusCode === 404) return null
    throw err
  }
}

/** the on-air slot, shaped for both the page and the polling route */
export async function nowPlaying(): Promise<{
  title: string
  host: string | null
  stationId: string | null
  stationName: string | null
  startMin: number
  endMin: number
  progress: number
} | null> {
  const page = await serverClient().view('nowPlaying').read({ limit: 1 })
  const row = page.rows[0]
  if (!row) return null
  return {
    title: row.title,
    host: row.host,
    stationId: row.station,
    stationName: row.stationRefRecord?.name ?? null,
    startMin: row.startMin,
    endMin: row.endMin,
    // one formula, in core: the ticker recomputes the same number in the browser
    progress: slotProgress(row.startMin, row.endMin, new Date()),
  }
}
