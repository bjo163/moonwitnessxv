import { defineLocaleCatalog, type Locale } from '@moonwitness/core'

/**
 * UI-F15: the one vocabulary Dock uses to name provenance, rights and review
 * labels in public views. Every field name here labels a row a public view
 * actually renders — the shared `SourceEvidence` block, or the UI-P06c/P06d
 * relation inspector with its uncertainty and same-pair alternative rows — so a
 * value can be missing but never unnamed.
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

    // UI-P06c/P06d · the relation inspector's own vocabulary. Every row the
    // inspector renders is named here, in both locales, so the view adds no
    // English-only label of its own.
    fieldRelationType: 'Relation type',
    fieldDirection: 'Direction',
    directionAsRecorded: 'as recorded in the projection',
    fieldAssertedBy: 'Asserted by',
    fieldEndpointKinds: 'Endpoint types',
    fieldReviewer: 'Reviewer',
    uncertaintyHeading: 'Uncertainty',
    uncertaintyIntro: 'What the projection does not know about this claim, stated item by item.',
    uncertaintyUnresolved:
      'The epistemic status is unresolved: the hub does not record whether this claim holds.',
    uncertaintyNoReviewer: 'No reviewer is recorded, so no human decision exists on this claim.',
    uncertaintyNoExactSha: 'The evidence is not pinned to an exact source version.',
    uncertaintyNotReleased: 'No active release presents this claim, so it is not part of the published graph.',
    uncertaintyNoSource: 'No source record is attached, so its provenance cannot be checked.',
    uncertaintyEntityUnresolved: 'An endpoint sits outside the ontology projection, so its identity is unconfirmed.',
    uncertaintyNotInOverview:
      'This claim is not among the candidate rows the overview projects, so the same-pair list beside it cannot place it.',
    uncertaintyNothingFlagged:
      'Nothing in the projection reports this claim as unresolved. That is a statement about the data, not a proof that the claim holds.',
    uncertaintyNoMerge:
      'The alternatives below stay separate claims. The projection carries no symmetry, synonymity or confidence value that would let the Dock read one as another.',
    alternativesHeading: 'Same-pair alternatives',
    alternativesIntro:
      'Other candidate claims the public projection carries for exactly these two entities. Each keeps its own type, status and provenance; none is presented as a synonym of the claim above.',
    alternativesCountLabel: 'Other candidate claims on this pair',
    alternativesQueueLabel: 'Candidate rows in the whole projection',
    alternativesReleaseLabel: 'Release the rows below refer to',
    alternativesNoRelease: 'No release is active',
    alternativesLimitLabel: 'What this list cannot see',
    alternativesLimitHint:
      'The public overview projects candidate claims and the active release summary. A reviewed relation on this pair that is not also a candidate row is not listed here, so an empty list does not prove the pair is unclaimed.',
    alternativesEmptyTitle: 'No other candidate claim is recorded for this pair',
    alternativesPairUnresolved:
      'This relation does not resolve both endpoints in the projection, so no pair can be compared.',
    alternativesOrientationLabel: 'Direction against the inspected claim',
    alternativesOrientationForward: 'same direction',
    alternativesOrientationReverse: 'opposite direction',
    alternativesTypeLabel: 'Relation type against the inspected claim',
    alternativesTypeSame: 'the same relation type',
    alternativesTypeDifferent: 'a different relation type',
    alternativesCandidateNote:
      'A PENDING, REJECTED or REVOKED row stays a claim under review. Only a member of an active release is presented as the graph.',
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

    // UI-P06c/P06d · Indonesian half of the relation inspector vocabulary. The
    // key set must stay identical to the English block above.
    fieldRelationType: 'Tipe relasi',
    fieldDirection: 'Arah',
    directionAsRecorded: 'sesuai catatan proyeksi',
    fieldAssertedBy: 'Dinyatakan oleh',
    fieldEndpointKinds: 'Tipe titik ujung',
    fieldReviewer: 'Peninjau',
    uncertaintyHeading: 'Ketidakpastian',
    uncertaintyIntro: 'Hal yang tidak diketahui proyeksi tentang klaim ini, dinyatakan butir demi butir.',
    uncertaintyUnresolved: 'Status epistemiknya belum tuntas: hub tidak mencatat apakah klaim ini berlaku.',
    uncertaintyNoReviewer: 'Tidak ada peninjau yang tercatat, sehingga belum ada keputusan manusia atas klaim ini.',
    uncertaintyNoExactSha: 'Bukti belum ditetapkan pada versi sumber yang persis.',
    uncertaintyNotReleased: 'Tidak ada rilis aktif yang menyajikan klaim ini, sehingga ia bukan bagian dari graf terbit.',
    uncertaintyNoSource: 'Tidak ada catatan sumber yang dilampirkan, sehingga provenansnya tidak dapat diperiksa.',
    uncertaintyEntityUnresolved: 'Salah satu titik ujung berada di luar proyeksi ontologi, sehingga identitasnya belum terkonfirmasi.',
    uncertaintyNotInOverview:
      'Klaim ini tidak termasuk baris kandidat yang diproyeksikan ringkasan graf, sehingga daftar pasangan di sampingnya tidak dapat menempatkannya.',
    uncertaintyNothingFlagged:
      'Tidak ada apa pun dalam proyeksi yang menandai klaim ini sebagai belum tuntas. Itu pernyataan tentang data, bukan bukti bahwa klaim ini berlaku.',
    uncertaintyNoMerge:
      'Alternatif di bawah tetap klaim yang terpisah. Proyeksi tidak membawa nilai simetri, sinonimitas, atau keyakinan yang memungkinkan Dock membacanya sebagai klaim yang sama.',
    alternativesHeading: 'Alternatif pasangan sama',
    alternativesIntro:
      'Kandidat klaim lain yang dibawa proyeksi publik untuk tepat dua entitas ini. Masing-masing mempertahankan tipe, status, dan provenansnya sendiri; tidak ada yang disajikan sebagai sinonim klaim di atas.',
    alternativesCountLabel: 'Kandidat klaim lain pada pasangan ini',
    alternativesQueueLabel: 'Baris kandidat dalam seluruh proyeksi',
    alternativesReleaseLabel: 'Rilis yang dirujuk baris di bawah',
    alternativesNoRelease: 'Tidak ada rilis yang aktif',
    alternativesLimitLabel: 'Yang tidak dapat dilihat daftar ini',
    alternativesLimitHint:
      'Proyeksi publik hanya membawa kandidat klaim dan ringkasan rilis aktif. Relasi terverifikasi pada pasangan ini yang bukan sekaligus baris kandidat tidak didaftarkan di sini, sehingga daftar kosong tidak membuktikan pasangan ini tidak diklaim.',
    alternativesEmptyTitle: 'Tidak ada kandidat klaim lain yang tercatat untuk pasangan ini',
    alternativesPairUnresolved:
      'Relasi ini tidak menyelesaikan kedua titik ujungnya dalam proyeksi, sehingga tidak ada pasangan yang dapat dibandingkan.',
    alternativesOrientationLabel: 'Arah terhadap klaim yang diperiksa',
    alternativesOrientationForward: 'arah yang sama',
    alternativesOrientationReverse: 'arah yang berlawanan',
    alternativesTypeLabel: 'Tipe relasi terhadap klaim yang diperiksa',
    alternativesTypeSame: 'tipe relasi yang sama',
    alternativesTypeDifferent: 'tipe relasi yang berbeda',
    alternativesCandidateNote:
      'Baris berstatus PENDING, REJECTED, atau REVOKED tetap berstatus klaim yang sedang ditinjau. Hanya anggota rilis aktif yang disajikan sebagai graf.',
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
