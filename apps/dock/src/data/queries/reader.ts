import { serverClient } from '@/data/sdk'

export const DEFAULT_CITATION = 'QS 2:82'

/** Metadata-only source identity; never carries source text. */
export interface ReaderSource {
  key: string | null
  workCode: string | null
  workTitle: string | null
  originalLanguage: string | null
  editionCode: string | null
  editionName: string | null
  editorOrPublisher: string | null
  rightsStatus: string
  licenseName: string | null
  sourceUri: string | null
  provenanceSha: string | null
  sourceDate: string | null
  retrievedAt: string
}

export interface ReaderCandidate extends Omit<ReaderSource, 'key' | 'sourceDate' | 'retrievedAt'> {
  citationKey: string | null
}

export interface ReaderTranslation {
  languageCode: string
  translatorName: string | null
  licenseName: string | null
  rightsStatus: string
  text: string | null
  blocked: boolean
}

export interface ReaderArabic {
  text: string
  language: string
  script: string
  direction: 'rtl'
}

export type ReaderState = 'available' | 'rights_blocked' | 'absent' | 'ambiguous' | 'invalid'

/** The shape `/corpus/reader` returns; every text field is already rights-filtered. */
export interface ReaderResult {
  state: ReaderState
  message: string | null
  citation: ReaderSource | null
  arabic: ReaderArabic | null
  translations: ReaderTranslation[]
  candidates: ReaderCandidate[]
  citationText: string | null
  blockedPlaceholder?: string | null
}

export async function readPassage(citation?: string, edition?: string): Promise<ReaderResult> {
  return serverClient().call<ReaderResult>('/corpus/reader', {
    query: {
      citation: citation?.trim() || DEFAULT_CITATION,
      ...(edition?.trim() ? { edition: edition.trim() } : {}),
    },
  })
}

/**
 * `/corpus/browse` is the metadata half of the corpus owner's public surface:
 * identity, addresses, languages, licences and counts, with the same cleared
 * invariant `/corpus/reader` applies before emitting a single byte of text.
 * It carries no source text by contract, which is what lets the rail stay
 * mounted while a passage is withheld.
 */
export interface BrowseWork {
  code: string
  title: string | null
  tradition: string | null
  originalLanguage: string | null
  editionCount: number
}

export interface BrowseEdition {
  code: string
  name: string | null
  editorOrPublisher: string | null
  rightsStatus: string
  licenseName: string | null
  sourceUri: string | null
  provenanceSha: string | null
  passageCount: number
  cleared: boolean
}

export interface BrowsePassage {
  citationKey: string
  surahNumber: number | null
  ayahNumber: number | null
  editionCode: string | null
  verifiedAt: string | null
  textAvailable: boolean
}

export interface BrowseTranslation {
  languageCode: string
  translatorName: string | null
  licenseName: string | null
  rightsStatus: string
  editionCode: string | null
  textAvailable: boolean
}

export interface BrowseResult {
  citation: string
  edition: string | null
  resolved: boolean
  work: { code: string | null; title: string | null; originalLanguage: string | null } | null
  works: BrowseWork[]
  editions: BrowseEdition[]
  passages: BrowsePassage[]
  translations: BrowseTranslation[]
  interpretation: { available: boolean; reason: string }
  export: { citationAvailable: boolean; textExportAllowed: boolean; reason: string }
}

export async function readBrowse(citation?: string, edition?: string): Promise<BrowseResult> {
  return serverClient().call<BrowseResult>('/corpus/browse', {
    query: {
      ...(citation?.trim() ? { citation: citation.trim() } : {}),
      ...(edition?.trim() ? { edition: edition.trim() } : {}),
    },
  })
}

/** An inventory with no work and no edition means the corpus simply has nothing to list. */
export function browseIsEmpty(browse: BrowseResult): boolean {
  return browse.works.length === 0 && browse.editions.length === 0
}
