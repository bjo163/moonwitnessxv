/**
 * Multi-Script Lexical & Trilateral Root Typings (M09, Section 21A.3)
 */
export type ScriptCode = 'Arab' | 'Hebr' | 'Grek' | 'Latn'

export type TextDirection = 'ltr' | 'rtl'

export type UnilexLane = 'UNIVERSAL' | 'SCRIPTURE' | 'TEXT_SOURCE' | 'PROJECT'

export interface CognateEntry {
  language: 'Arabic' | 'Hebrew' | 'Aramaic' | 'Greek'
  script: ScriptCode
  direction: TextDirection
  root: string
  lemma: string
  transliteration: string
  gloss: string
  attestation?: string
}

export interface TriangulatedConcept {
  conceptId: string
  primaryTerm: string
  arabicCognate: CognateEntry
  hebrewCognate: CognateEntry
  greekCognate: CognateEntry
  pedagogicalNote: string
}
