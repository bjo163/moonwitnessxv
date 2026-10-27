import { defineLocaleCatalog, type Locale } from '@moonwitness/core'

/**
 * UI-F15: the one vocabulary Dock uses to name provenance, rights and review
 * labels in public views. Every field name here labels a row the shared
 * `SourceEvidence` block actually renders, so a value can be missing but never
 * unnamed.
 *
 * The status sets are the projection enums, not a local invention:
 * - rights comes from the corpus edition table
 *   (`RIGHTS_EXACT_VERSION_CLEARED | RIGHTS_UNKNOWN | METADATA_ONLY | RESTRICTED | PUBLIC_DOMAIN`);
 * - review comes from the source tables
 *   (`PROPOSED | SOURCE_CHECKED | APPROVED_FOR_CITATION | DEPRECATED`), plus the
 *   unreviewed fallback a null `reviewStatus` stands for.
 * A code outside those sets is rendered verbatim: the raw code is itself evidence.
 */
export const provenanceCopy = defineLocaleCatalog({
  en: {
    fieldSource: 'Source',
    fieldCitation: 'Cited passage',
    fieldProvenanceSha: 'Provenance version',
    fieldSourceUri: 'Source link',
    fieldReview: 'Review status',
    fieldApprovalNote: 'Approval note',
    provenanceShaAria: 'Provenance SHA-256',
    noSource: 'No source is attached.',
    unrecorded: 'UNRECORDED',
    rightsExactVersionCleared: 'Rights cleared for this exact version',
    rightsUnknown: 'Rights unknown',
    metadataOnly: 'Metadata only',
    restricted: 'Restricted',
    publicDomain: 'Public domain, exact version not verified',
    reviewProposed: 'Proposed',
    reviewSourceChecked: 'Source checked',
    reviewApprovedForCitation: 'Approved for citation',
    reviewDeprecated: 'Deprecated',
    reviewUnreviewed: 'Unreviewed',
  },
  id: {
    fieldSource: 'Sumber',
    fieldCitation: 'Kutipan yang dirujuk',
    fieldProvenanceSha: 'Versi provenans',
    fieldSourceUri: 'Tautan sumber',
    fieldReview: 'Status tinjauan',
    fieldApprovalNote: 'Catatan persetujuan',
    provenanceShaAria: 'SHA-256 provenans',
    noSource: 'Tidak ada sumber yang dilampirkan.',
    unrecorded: 'BELUM TERCATAT',
    rightsExactVersionCleared: 'Hak cipta versi persis ini sudah disetujui',
    rightsUnknown: 'Status hak cipta belum diketahui',
    metadataOnly: 'Hanya metadata',
    restricted: 'Dibatasi',
    publicDomain: 'Domain publik, versi persis belum terverifikasi',
    reviewProposed: 'Diusulkan',
    reviewSourceChecked: 'Sumber diperiksa',
    reviewApprovedForCitation: 'Disetujui untuk dikutip',
    reviewDeprecated: 'Ditanggalkan',
    reviewUnreviewed: 'Belum ditinjau',
  },
})

export type ProvenanceCopy = (typeof provenanceCopy)[Locale]

export function getProvenanceCopy(locale: Locale): ProvenanceCopy {
  return provenanceCopy[locale]
}

/** Rights codes the corpus projection can emit, mapped to their catalogue key. */
const RIGHTS_KEYS: Record<string, keyof ProvenanceCopy> = {
  RIGHTS_EXACT_VERSION_CLEARED: 'rightsExactVersionCleared',
  RIGHTS_UNKNOWN: 'rightsUnknown',
  METADATA_ONLY: 'metadataOnly',
  RESTRICTED: 'restricted',
  PUBLIC_DOMAIN: 'publicDomain',
}

/** Source review codes the ontology, unilex and actor projections can emit. */
const REVIEW_KEYS: Record<string, keyof ProvenanceCopy> = {
  PROPOSED: 'reviewProposed',
  SOURCE_CHECKED: 'reviewSourceChecked',
  APPROVED_FOR_CITATION: 'reviewApprovedForCitation',
  DEPRECATED: 'reviewDeprecated',
  UNREVIEWED: 'reviewUnreviewed',
}

/**
 * Names a rights status in the rendered locale. An unlisted code is returned
 * verbatim — the Dock never translates a status it does not know, and never
 * blanks one out.
 */
export function rightsLabel(status: string, locale: Locale): string {
  const key = RIGHTS_KEYS[status]
  return key === undefined ? status : provenanceCopy[locale][key]
}

/**
 * Names a source review status. A missing status is stated as unreviewed rather
 * than left silent; an unknown code keeps its raw value.
 */
export function reviewLabel(status: string | null | undefined, locale: Locale): string {
  if (status === null || status === undefined) return provenanceCopy[locale].reviewUnreviewed
  const key = REVIEW_KEYS[status]
  return key === undefined ? status : provenanceCopy[locale][key]
}
