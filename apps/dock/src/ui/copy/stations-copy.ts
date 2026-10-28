import { defineLocaleCatalog, type Locale } from '@moonwitness/core'

/**
 * UI-II P13b/P13c · the vocabulary of `/[locale]/stations` and one station's detail page.
 *
 * Route-scoped, like the constellation, patches and denpa catalogues: the four
 * shared Dock catalogues and the UI2-G10 inventory test that enumerates `src/lib`
 * belong to another lane in this wave.
 *
 * The counts are stated as suffixes because the number always comes first: the
 * catalogue size and the filtered total are the values the hub returned, and this
 * vocabulary only names them.
 */
export const stationsCopy = defineLocaleCatalog({
  en: {
    pageTitle: 'Signal Catalog',
    breadcrumbHome: 'Home',
    breadcrumbSignals: 'Signals',
    countOf: 'of',
    stationsInNetwork: 'public stations in the network',
    filterTitle: 'Filter Signals',
    filterSubtitle: 'search by station name, genre, or origin country',
    telemetryTitle: 'Country reference',
    telemetrySubtitle: 'country, region, calling code, currency and language on the station record',
    labelCountry: 'country',
    labelRegion: 'region',
    labelCallingCode: 'calling code',
    labelCurrency: 'currency',
    labelLanguage: 'language',
    labelLoggedPlays: 'logged plays',
    scheduleTitle: 'Schedule',
    scheduleSlots: 'slots',
    scheduleSubtitle: 'weekly transmission windows in UTC',
    hostedBy: 'hosted by',
    statusOnAir: 'on the air',
    statusOffAir: 'off the air',
    backToCatalog: 'Back to catalog',
    playsOne: 'logged play',
    playsMany: 'logged plays',
  },
  id: {
    pageTitle: 'Katalog Sinyal',
    breadcrumbHome: 'Beranda',
    breadcrumbSignals: 'Sinyal',
    countOf: 'dari',
    stationsInNetwork: 'stasiun publik dalam jaringan',
    filterTitle: 'Saring Sinyal',
    filterSubtitle: 'cari dengan nama stasiun, genre, atau negara asal',
    telemetryTitle: 'Referensi negara',
    telemetrySubtitle: 'negara, wilayah, kode telepon, mata uang, dan bahasa pada catatan stasiun',
    labelCountry: 'negara',
    labelRegion: 'wilayah',
    labelCallingCode: 'kode telepon',
    labelCurrency: 'mata uang',
    labelLanguage: 'bahasa',
    labelLoggedPlays: 'pemutaran tercatat',
    scheduleTitle: 'Jadwal',
    scheduleSlots: 'slot',
    scheduleSubtitle: 'jendela transmisi mingguan dalam UTC',
    hostedBy: 'dibawa oleh',
    statusOnAir: 'mengudara',
    statusOffAir: 'tidak mengudara',
    backToCatalog: 'Kembali ke katalog',
    playsOne: 'pemutaran tercatat',
    playsMany: 'pemutaran tercatat',
  },
})

export type StationsCopy = (typeof stationsCopy)[Locale]

export function getStationsCopy(locale: Locale): StationsCopy {
  return stationsCopy[locale]
}
