import { serverClient } from '@/data/sdk'
import { MoonApiError, type Page, type ViewOutputs } from '@moonwitness/moonql-client'
import type { ChartRow, NowPlaying } from '@/data/types'
import { clock } from '@/lib/time'
import { nowPlaying } from '@/data/queries/catalog'

/** the hub's own shapes, by name — no local copy to keep in sync */
type CatalogStation = ViewOutputs['stationCatalog']
type WeekSlot = ViewOutputs['weeklySchedule']
type MonitorSignal = ViewOutputs['monitorSignalFeed']

export interface HomePayload {
  liveDataAvailable: boolean
  now: NowPlaying | null
  stations: CatalogStation[]
  topStations: ChartRow[]
  perCountry: ChartRow[]
  perGenre: ChartRow[]
  week: WeekSlot[]
  settings: Record<string, string>
  counts: { stations: number; countries: number; plays: number }
  signals: MonitorSignal[]
}


function isHubUnavailable(error: unknown): boolean {
  if (error instanceof MoonApiError) return error.statusCode >= 500
  if (!(error instanceof TypeError) || error.message !== 'fetch failed') return false
  const cause: unknown = error.cause
  if (cause === null || typeof cause !== 'object' || !('code' in cause)) return true
  const code = cause.code
  return typeof code === 'string' && ['ECONNREFUSED', 'ECONNRESET', 'EHOSTUNREACH', 'ENETUNREACH', 'ETIMEDOUT'].includes(code)
}

function withHubFallback<T>(promise: Promise<T>, fallback: T): Promise<{ available: true; value: T } | { available: false; value: T }> {
  return promise.then(
    (value) => ({ available: true as const, value }),
    (error: unknown) => {
      if (!isHubUnavailable(error)) throw error
      return { available: false as const, value: fallback }
    },
  )
}

const emptyPage = <T>(): Page<T> => ({ rows: [], total: null })

/**
 * The whole homepage in ONE Promise.all: views + settings read.
 * Every relation (station name, country name, radar) is joined server-side by
 * `view.expand`, so the render never triggers an N+1.
 */
export async function homePayload(): Promise<HomePayload> {
  const client = serverClient()
  const [nowResult, catalogResult, topResult, perCountryResult, perGenreResult, weekResult, settingsResult, signalsResult] = await loadHomeResults(client)

  const now = nowResult.value
  const catalog = catalogResult.value
  const top = topResult.value
  const perCountry = perCountryResult.value
  const perGenre = perGenreResult.value
  const week = weekResult.value
  const settings = settingsResult.value
  const signals = signalsResult.value

  const settingsMap: Record<string, string> = {}
  for (const row of settings.rows) settingsMap[row.settingKey] = row.settingValue

  const stationNames = new Set(catalog.rows.map((row) => row.countryRef).filter(Boolean))

  return {
    liveDataAvailable: [nowResult, catalogResult, topResult, perCountryResult, perGenreResult, weekResult, settingsResult, signalsResult].every((result) => result.available),
    now,
    // eight stations, straight from the view: the card needs name, status and the
    // joined country, and `expand` already put it on the row
    stations: catalog.rows.slice(0, 8),
    topStations: top.rows.map((row) => ({
      label: row.stationRefRecord?.name ?? 'Unknown station',
      value: row.plays,
      ...(row.stationRef ? { href: `/stations/${row.stationRef}` } : {}),
    })),
    perCountry: perCountry.rows.map((row) => ({
      label: row.countryRefRecord?.name ?? 'Unassigned',
      value: row.stations,
    })),
    perGenre: perGenre.rows.map((row) => ({ label: row.genre ?? 'unspecified', value: row.stations })),
    week: week.rows,
    settings: settingsMap,
    signals: signals.rows,
    counts: {
      stations: catalog.rows.length,
      countries: stationNames.size,
      plays: top.rows.reduce((sum, row) => sum + row.plays, 0),
    },
  }
}

async function loadHomeResults(client: ReturnType<typeof serverClient>) {
  return Promise.all([
    withHubFallback(nowPlaying(), null),
    withHubFallback(client.view('stationCatalog').read({ limit: 100 }), emptyPage<CatalogStation>()),
    withHubFallback(client.view('topStations').read({ limit: 8 }), emptyPage<ViewOutputs['topStations']>()),
    withHubFallback(client.view('stationCountByCountry').read({ limit: 6 }), emptyPage<ViewOutputs['stationCountByCountry']>()),
    withHubFallback(client.view('stationCountByGenre').read({ limit: 8 }), emptyPage<ViewOutputs['stationCountByGenre']>()),
    withHubFallback(client.view('weeklySchedule').read({ limit: 100 }), emptyPage<WeekSlot>()),
    withHubFallback(client.view('uiSettings').read({ limit: 50 }), emptyPage<ViewOutputs['uiSettings']>()),
    withHubFallback(client.view('monitorSignalFeed').read({ limit: 6 }), emptyPage<MonitorSignal>()),
  ] as const)
}

/** compact "07:00–12:00" label for a slot */
export const slotWindow = (slot: { startMin: number; endMin: number }): string => `${clock(slot.startMin)}–${clock(slot.endMin)}`
