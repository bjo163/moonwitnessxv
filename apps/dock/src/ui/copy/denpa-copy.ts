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
      'What you submit is sent as typed. The hub takes the message, drops a target station it cannot find, and records the transmission as ON-AIR; this deck keeps no copy and holds no transmission back.',
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
      'Yang Anda kirim dikirim apa adanya. Hub menerima pesan, membuang stasiun tujuan yang tidak dapat ditemukannya, dan mencatat siaran sebagai MENGUDARA; dek ini tidak menyimpan salinan dan tidak menahan siaran.',
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
