import { serverClient } from '@/data/sdk'
import type { ViewOutputs } from '@moonwitness/moonql-client'
import type { ChartRow, NowPlaying } from '@/data/types'
import { clock } from '@/lib/time'
import { nowPlaying } from '@/data/queries/catalog'

/** the hub's own shapes, by name — no local copy to keep in sync */
type CatalogStation = ViewOutputs['stationCatalog']
type WeekSlot = ViewOutputs['weeklySchedule']
type MonitorSignal = ViewOutputs['monitorSignalFeed']

export interface HomePayload {
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

/**
 * The whole homepage in ONE Promise.all: views + settings read.
 * Every relation (station name, country name, radar) is joined server-side by
 * `view.expand`, so the render never triggers an N+1.
 */
export async function homePayload(): Promise<HomePayload> {
  const client = serverClient()
  const [now, catalog, top, perCountry, perGenre, week, settings, signals] = await Promise.all([
    nowPlaying(),
    client.view('stationCatalog').read({ limit: 100 }),
    client.view('topStations').read({ limit: 8 }),
    client.view('stationCountByCountry').read({ limit: 6 }),
    client.view('stationCountByGenre').read({ limit: 8 }),
    client.view('weeklySchedule').read({ limit: 100 }),
    client.view('uiSettings').read({ limit: 50 }),
    client
      .view('monitorSignalFeed')
      .read({ limit: 6 })
      .catch(() => ({ rows: [] as MonitorSignal[] })),
  ])

  const settingsMap: Record<string, string> = {}
  for (const row of settings.rows) settingsMap[row.settingKey] = row.settingValue

  const stationNames = new Set(catalog.rows.map((row) => row.countryRef).filter(Boolean))

  return {
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

/** compact "07:00–12:00" label for a slot */
export const slotWindow = (slot: { startMin: number; endMin: number }): string => `${clock(slot.startMin)}–${clock(slot.endMin)}`
