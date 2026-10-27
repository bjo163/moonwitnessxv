import { defineLocaleCatalog, type Locale } from '@moonwitness/core'

/**
 * UI-P05b: the vocabulary of the Reader's WORKS / CONTENTS rail and its
 * reading record. Every value here names a row the rail really renders from
 * `/corpus/browse`, so a count can be zero and a status can be unknown, but a
 * panel is never presented as an empty decoration.
 *
 * Rights and review wording is NOT duplicated here: it comes from
 * `provenance-copy.ts`, the one catalogue that names the projection enums.
 */
export const readerCopy = defineLocaleCatalog({
  en: {
    railAria: 'Works and contents',
    railTitle: 'Works / Contents',
    railSourceCatalog: 'Source catalog',
    railEditions: 'Editions',
    railPassageIndex: 'Passage index',
    railTranslations: 'Translations',
    railCitationExport: 'Citation export',
    railEmptyWorks: 'No work is registered.',
    railEmptyEditions: 'No edition is registered for this work.',
    railEmptyPassages: 'No address is indexed in this edition.',
    railEmptyTranslations: 'No translation is registered for this edition.',
    unitEditions: 'editions',
    unitPassages: 'addresses',
    editionSelected: 'SELECTED',
    editionOpen: 'Open this address in this edition',
    addressOpen: 'Open this address',
    textCleared: 'text cleared',
    textWithheld: 'text withheld',
    exportAnchorHint: 'The reproducible citation line is the only export this Reader offers.',
    exportGoTo: 'Go to the reproducible citation',
    exportNoTarget: 'No citation line is on screen, so there is nothing to export yet.',
    recordTitle: 'Reading record',
    recordSubtitle: 'Edition, rights, language, interpretation and export as the hub states them.',
    rowEdition: 'EDITION',
    rowRights: 'RIGHTS',
    rowLanguage: 'LANGUAGE',
    rowInterpretation: 'INTERPRETATION',
    rowExport: 'EXPORT',
    editionUnselected: 'UNSELECTED',
    unresolvedEdition: 'UNRESOLVED EDITION',
    unknownLanguage: 'LANGUAGE UNRECORDED',
    unknownLicense: 'LICENSE UNRECORDED',
    languageSource: 'source language',
    interpretationNone: 'NO SOURCE REGISTERED',
    interpretationRegistered: 'SOURCE REGISTERED',
    exportGuarded: 'GUARDED',
    exportAllowed: 'ALLOWED',
    browseUnavailable: 'The hub did not answer the contents query, so these rows are not stated.',
  },
  id: {
    railAria: 'Karya dan isi',
    railTitle: 'Karya / Isi',
    railSourceCatalog: 'Katalog sumber',
    railEditions: 'Edisi',
    railPassageIndex: 'Indeks bagian teks',
    railTranslations: 'Terjemahan',
    railCitationExport: 'Ekspor sitasi',
    railEmptyWorks: 'Belum ada karya yang terdaftar.',
    railEmptyEditions: 'Belum ada edisi yang terdaftar untuk karya ini.',
    railEmptyPassages: 'Belum ada alamat yang diindeks pada edisi ini.',
    railEmptyTranslations: 'Belum ada terjemahan yang terdaftar untuk edisi ini.',
    unitEditions: 'edisi',
    unitPassages: 'alamat',
    editionSelected: 'DIPILIH',
    editionOpen: 'Buka alamat ini pada edisi ini',
    addressOpen: 'Buka alamat ini',
    textCleared: 'teks diizinkan',
    textWithheld: 'teks ditahan',
    exportAnchorHint: 'Baris sitasi yang dapat direproduksi adalah satu-satunya ekspor yang ditawarkan Reader ini.',
    exportGoTo: 'Buka sitasi yang dapat direproduksi',
    exportNoTarget: 'Belum ada baris sitasi di layar, jadi belum ada yang dapat diekspor.',
    recordTitle: 'Catatan bacaan',
    recordSubtitle: 'Edisi, hak, bahasa, interpretasi, dan ekspor sebagaimana dinyatakan hub.',
    rowEdition: 'EDISI',
    rowRights: 'HAK CIPTA',
    rowLanguage: 'BAHASA',
    rowInterpretation: 'INTERPRETASI',
    rowExport: 'EKSPOR',
    editionUnselected: 'BELUM DIPILIH',
    unresolvedEdition: 'EDISI BELUM TERUNGKAP',
    unknownLanguage: 'BAHASA BELUM TERCATAT',
    unknownLicense: 'LISENSI BELUM TERCATAT',
    languageSource: 'bahasa sumber',
    interpretationNone: 'BELUM ADA SUMBER TERDAFTAR',
    interpretationRegistered: 'SUMBER TERDAFTAR',
    exportGuarded: 'DIBATASI',
    exportAllowed: 'DIIZINKAN',
    browseUnavailable: 'Hub tidak menjawab query isi, jadi baris-baris ini tidak dinyatakan.',
  },
})

export type ReaderCopy = (typeof readerCopy)[Locale]

export function getReaderCopy(locale: Locale): ReaderCopy {
  return readerCopy[locale]
}
