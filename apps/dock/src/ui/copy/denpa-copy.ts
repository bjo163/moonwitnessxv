import { defineLocaleCatalog, type Locale } from '@moonwitness/core'

/**
 * UI-II P14b/P14c · the vocabulary of `/[locale]/denpa`, the DENPA transceiver deck.
 *
 * Route-scoped on purpose, like the constellation and patches catalogues: the four
 * shared Dock catalogues and the UI2-G10 inventory test that enumerates `src/lib`
 * belong to another lane in this wave.
 *
 * The rule these keys enforce is that the deck states what the hub actually does.
 * A transmission is composed here and recorded by the hub; nothing in this
 * vocabulary claims encryption, storage, or a live count the projection did not return.
 */
export const denpaCopy = defineLocaleCatalog({
  en: {
    pageTitle: 'DENPA Transceiver (電波)',
    pageSubtitle: 'Compose a shortwave message, send it to the hub, and read back the public feed the hub returns.',
    breadcrumbHome: 'Home',
    breadcrumbDenpa: 'Denpa',
    badgeOnAir: 'on-air',
    badgeTargetStations: 'target stations',
    badgeStationsUnknown: 'station list unavailable',
    stationSelectUnknownHint:
      'The catalog read failed, so no station is offered. The message still transmits to the global network.',
    transmitterSubtitle:
      'The message, handle and target station you submit are sent to the hub. The hub decides whether the record enters the public feed.',
    feedTitle: 'Transmissions the hub published',
    feedSubtitle:
      'This is the public feed the hub returned for this request. A transmission appears here only after the hub has recorded it.',
    feedOnAir: 'ON-AIR',
    feedStation: 'Station',
    feedGlobalNetwork: 'Global network',
    feedRecent: 'RECENT',
  },
  id: {
    pageTitle: 'Pemancar DENPA (電波)',
    pageSubtitle: 'Susun pesan gelombang pendek, kirim ke hub, dan baca umpan publik yang hub kembalikan.',
    breadcrumbHome: 'Beranda',
    breadcrumbDenpa: 'Denpa',
    badgeOnAir: 'mengudara',
    badgeTargetStations: 'stasiun tujuan',
    badgeStationsUnknown: 'daftar stasiun tidak tersedia',
    stationSelectUnknownHint:
      'Pembacaan katalog gagal, sehingga tidak ada stasiun yang ditawarkan. Pesan tetap dikirim ke jaringan global.',
    transmitterSubtitle:
      'Pesan, nama samaran, dan stasiun tujuan yang Anda kirim dikirim ke hub. Hub yang memutuskan apakah catatan itu masuk ke umpan publik.',
    feedTitle: 'Siaran yang diterbitkan hub',
    feedSubtitle:
      'Ini umpan publik yang hub kembalikan untuk permintaan ini. Sebuah siaran muncul di sini hanya setelah hub mencatatnya.',
    feedOnAir: 'MENGUDARA',
    feedStation: 'Stasiun',
    feedGlobalNetwork: 'Jaringan global',
    feedRecent: 'BARU',
  },
})

export type DenpaCopy = (typeof denpaCopy)[Locale]

export function getDenpaCopy(locale: Locale): DenpaCopy {
  return denpaCopy[locale]
}
