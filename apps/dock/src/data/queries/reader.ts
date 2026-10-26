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
