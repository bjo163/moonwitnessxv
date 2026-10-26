/**
 * M10 seed: a small, source-pinned slice of the ontological boundaries already
 * ratified in M02-01 and reviewed in M09. This is not a complete world graph —
 * it exists so candidate and reviewed claims can be inspected side by side.
 */

export const PERSPECTIVES = [
  'GENERAL',
  'ISLAMIC_SCRIPTURE',
  'TEXTUAL_WITNESS',
  'PROJECT_INTERNAL',
  'SUFI_STUDY',
  'CREATIVE_FICTION',
  'HISTORICAL_CRITICAL',
] as const
export type Perspective = (typeof PERSPECTIVES)[number]

export const ENTITY_KINDS = ['ACTOR', 'ENTITY', 'CHARACTER'] as const
export type EntityKind = (typeof ENTITY_KINDS)[number]

export const ENTITY_STATUSES = ['CANDIDATE', 'REVIEWED', 'CONTESTED', 'MERGED'] as const
export type EntityStatus = (typeof ENTITY_STATUSES)[number]

export const SOURCE_STATUSES = ['PROPOSED', 'SOURCE_CHECKED', 'APPROVED_FOR_CITATION', 'DEPRECATED'] as const
export const SOURCE_TYPES = ['PROJECT_DECISION', 'PROJECT_VISION', 'REGISTRY', 'SCRIPTURE_EDITION', 'SCHOLARLY'] as const

export const ALIAS_STATUSES = ['CANDIDATE', 'ATTESTED', 'DISPUTED', 'REJECTED'] as const
export type AliasStatus = (typeof ALIAS_STATUSES)[number]

export const RELATION_TYPES = [
  'distinctFrom',
  'inspiredBy',
  'attestedIn',
  'interpretedBy',
  'relatedTo',
  'partOf',
  'opposedTo',
] as const
export type RelationType = (typeof RELATION_TYPES)[number]

export const EPISTEMIC_STATUSES = ['UNKNOWN', 'DISPUTED', 'ASSERTED', 'VERIFIED'] as const
export type EpistemicStatus = (typeof EPISTEMIC_STATUSES)[number]

export const IDENTITY_KINDS = ['SAME_ACTOR', 'SAME_ENTITY', 'SAME_CHARACTER', 'ALIAS_ONLY'] as const
export const IDENTITY_DECISIONS = ['PENDING', 'APPROVED_MERGE', 'REJECTED', 'REVOKED'] as const
export type IdentityDecision = (typeof IDENTITY_DECISIONS)[number]

export const REVIEW_ACTIONS = [
  'APPROVE_MERGE',
  'REJECT_MERGE',
  'SPLIT',
  'CORRECTION',
  'ATTEST_ALIAS',
  'EDGE_REGISTERED',
  'EDGE_VERIFIED',
] as const

export const DECIDED_AT = '2026-10-26T00:00:00.000Z'
export const M02_DOC = 'docs/decisions/M02-01-disambiguation-registry.md'
export const M09_DOC = 'docs/audit/M09-unilex-terminology.md'
export const M02_REF = `moonwitnessxv@d539cee:${M02_DOC}`
export const M09_REF = `moonwitnessxv@d539cee:${M09_DOC}`
export const M02_SHA256 = 'ee1836db96543f96cc88a1996a6a31cbc5cb099a82c07e3e0a8bc033fd6a3b95'
export const M09_SHA256 = 'a1aaf2376b245dacf2392039b59f1eda5f02c8006c0ed817701b6a16d83ad2da'
export const EMPIRE_REF = 'empire-of-the-light@38354ff:data/unilex/terms.v0.1.json'
export const EMPIRE_URI =
  'https://github.com/bjo163/empire-of-the-light/blob/38354ffff077d4ee1e17d40b39d86e41ce769817/data/unilex/terms.v0.1.json'
export const EMPIRE_SHA256 = '8e60fe61d35604f560c7c71330754db3e881915ce541c392e09fb99c53d05772'
export const VISION_REF = 'moonwitnessxv@e2f4562:docs/vision/MASTER_VISION_NARRATIVE_XV.md#06'
export const VISION_URI =
  'https://github.com/bjo163/moonwitnessxv/blob/e2f4562/docs/vision/MASTER_VISION_NARRATIVE_XV.md'
export const VISION_SHA256 = '7aedcf33606388a7306b184c40391b4f85909388c2cc65dcb867ce1b6932ccbb'
export const REVIEWER = 'M10 ontology boundary review'

export const ONTOLOGY_META = {
  version: '1.0.0',
  status: 'REVIEWED_BASELINE',
  entityCount: 8,
  notice:
    'A bounded, sourced ontology seed. Candidate identities are never merged automatically; UNKNOWN and DISPUTED claims remain unresolved until a reviewer records evidence.',
  pins: {
    decision: { ref: M02_REF, sha256: M02_SHA256 },
    terminologyReview: { ref: M09_REF, sha256: M09_SHA256 },
    empireRegistry: { ref: EMPIRE_REF, uri: EMPIRE_URI, sha256: EMPIRE_SHA256 },
    vision: { ref: VISION_REF, uri: VISION_URI, sha256: VISION_SHA256 },
  },
}

export const SOURCE_SEED = [
  {
    code: 'm02-01-disambiguation',
    title: 'M02-01 — Disambiguation Registry & Ontological Boundaries',
    sourceType: 'PROJECT_DECISION',
    citation: `${M02_REF} (RATIFIED)`,
    sourceUri: `https://github.com/bjo163/moonwitnessxv/blob/d539cee/${M02_DOC}`,
    provenanceSha: M02_SHA256,
    reviewStatus: 'APPROVED_FOR_CITATION',
    approvalNote: 'Ratified project rule; forbids automatic sameAs and names the distinct domains.',
  },
  {
    code: 'm09-unilex-review',
    title: 'M09 — UNILEX terminology review',
    sourceType: 'PROJECT_DECISION',
    citation: `${M09_REF} (review evidence)`,
    sourceUri: `https://github.com/bjo163/moonwitnessxv/blob/d539cee/${M09_DOC}`,
    provenanceSha: M09_SHA256,
    reviewStatus: 'APPROVED_FOR_CITATION',
    approvalNote: 'Terminology review evidence; does not promote the seed vocabulary.',
  },
  {
    code: 'empire-unilex-v0.1',
    title: 'Empire of the Light — UNILEX v0.1',
    sourceType: 'REGISTRY',
    citation: EMPIRE_REF,
    sourceUri: EMPIRE_URI,
    provenanceSha: EMPIRE_SHA256,
    reviewStatus: 'APPROVED_FOR_CITATION',
    approvalNote: 'Pinned provenance citation only; the registry stays PROPOSED_NOT_ADOPTED.',
  },
  {
    code: 'xv-master-vision',
    title: 'MoonWitness XV — Master Vision Narrative',
    sourceType: 'PROJECT_VISION',
    citation: VISION_REF,
    sourceUri: VISION_URI,
    provenanceSha: VISION_SHA256,
    reviewStatus: 'APPROVED_FOR_CITATION',
    approvalNote: 'Project vision, not scripture or scholarly authority.',
  },
  {
    code: 'quran-cairo-hafs',
    title: "Al-Qur'an — Cairo 1924 (Hafs 'an 'Asim)",
    sourceType: 'SCRIPTURE_EDITION',
    citation: 'D01 corpus edition quran_cairo_hafs',
    sourceUri: 'https://archive.org/details/cairo-quran-1924',
    provenanceSha: 'c0a8f1e72b4d912a76f2b48911efd910a34b22c7a9182314ef821901abcf8912',
    reviewStatus: 'APPROVED_FOR_CITATION',
    approvalNote: 'Edition identity only; no scripture text is copied into the ontology.',
  },
]

export type EntitySeed = {
  stableId: string
  kind: EntityKind
  perspective: Perspective
  labelEn: string
  labelId: string
  description: string
  sourceCode: string
  identityStatus: EntityStatus
  unilexStableId: string | null
}

export const ENTITY_SEED: EntitySeed[] = [
  {
    stableId: 'O001',
    kind: 'ENTITY',
    perspective: 'ISLAMIC_SCRIPTURE',
    labelEn: 'Allah',
    labelId: 'Allah',
    description:
      'The one God in Islamic theology — a theological referent. It is not a project acronym, a fictional character or a computational object.',
    sourceCode: 'quran-cairo-hafs',
    identityStatus: 'REVIEWED',
    unilexStableId: 'S001',
  },
  {
    stableId: 'O002',
    kind: 'ENTITY',
    perspective: 'PROJECT_INTERNAL',
    labelEn: 'A-L-L-A-H Command Center',
    labelId: 'A-L-L-A-H Command Center',
    description:
      'Accountable Life, Learning & Action Hub — an engineering project acronym. The dotted spelling is mandatory in technical contexts.',
    sourceCode: 'm02-01-disambiguation',
    identityStatus: 'REVIEWED',
    unilexStableId: 'P001',
  },
  {
    stableId: 'O003',
    kind: 'CHARACTER',
    perspective: 'CREATIVE_FICTION',
    labelEn: 'ZILL — Shadow Witness',
    labelId: 'ZILL — Saksi Bayangan',
    description:
      'An original narrative character observing reality. Not a theological referent, not a Sufi study track and not the historical ZIIL variant.',
    sourceCode: 'xv-master-vision',
    identityStatus: 'CONTESTED',
    unilexStableId: 'P031',
  },
  {
    stableId: 'O004',
    kind: 'ENTITY',
    perspective: 'TEXTUAL_WITNESS',
    labelEn: 'ZIIL',
    labelId: 'ZIIL',
    description:
      'A historical lexical variant kept in the legacy repository. It is a textual spelling, not a second ZILL character.',
    sourceCode: 'm09-unilex-review',
    identityStatus: 'REVIEWED',
    unilexStableId: 'P004',
  },
  {
    stableId: 'O005',
    kind: 'ENTITY',
    perspective: 'SUFI_STUDY',
    labelEn: 'ZILL Study Track',
    labelId: 'Track Kajian ZILL',
    description:
      'The Sufi studies track covering tasawwuf, tarekat, dzikir and competing interpretive authority. Separate from the creative ZILL character.',
    sourceCode: 'm09-unilex-review',
    identityStatus: 'REVIEWED',
    unilexStableId: 'P030',
  },
  {
    stableId: 'O006',
    kind: 'ENTITY',
    perspective: 'PROJECT_INTERNAL',
    labelEn: 'SHADOW Workspace',
    labelId: 'SHADOW Workspace',
    description:
      'The Headquarters editorial and studio workspace. A software surface, not a narrative person.',
    sourceCode: 'm02-01-disambiguation',
    identityStatus: 'CONTESTED',
    unilexStableId: null,
  },
  {
    stableId: 'O007',
    kind: 'CHARACTER',
    perspective: 'CREATIVE_FICTION',
    labelEn: 'SHADOW Character',
    labelId: 'SHADOW Character',
    description:
      'A narrative character in the MoonWitness story arc. Shares a label with the workspace but not its kind or domain.',
    sourceCode: 'm02-01-disambiguation',
    identityStatus: 'CONTESTED',
    unilexStableId: null,
  },
  {
    stableId: 'O008',
    kind: 'ACTOR',
    perspective: 'CREATIVE_FICTION',
    labelEn: 'THE BATTERIES',
    labelId: 'THE BATTERIES',
    description:
      'A fictional band inside the MoonWitness creative universe. It has no theological authority and is not an acronym for the divine name.',
    sourceCode: 'm02-01-disambiguation',
    identityStatus: 'REVIEWED',
    unilexStableId: null,
  },
]

export type AliasSeed = {
  aliasCode: string
  entity: string
  alias: string
  languageCode: string
  scriptCode: 'Latn' | 'Arab' | 'Hebr' | 'Grek'
  direction: 'ltr' | 'rtl'
  perspective: Perspective
  sourceCode: string
  status: AliasStatus
}

export const ALIAS_SEED: AliasSeed[] = [
  {
    aliasCode: 'AL001',
    entity: 'O001',
    alias: 'الله',
    languageCode: 'ar',
    scriptCode: 'Arab',
    direction: 'rtl',
    perspective: 'ISLAMIC_SCRIPTURE',
    sourceCode: 'empire-unilex-v0.1',
    status: 'CANDIDATE',
  },
  {
    aliasCode: 'AL002',
    entity: 'O002',
    alias: 'A-L-L-A-H',
    languageCode: 'en',
    scriptCode: 'Latn',
    direction: 'ltr',
    perspective: 'PROJECT_INTERNAL',
    sourceCode: 'm02-01-disambiguation',
    status: 'CANDIDATE',
  },
  {
    aliasCode: 'AL003',
    entity: 'O003',
    alias: 'ZILL',
    languageCode: 'en',
    scriptCode: 'Latn',
    direction: 'ltr',
    perspective: 'CREATIVE_FICTION',
    sourceCode: 'xv-master-vision',
    status: 'CANDIDATE',
  },
  {
    aliasCode: 'AL004',
    entity: 'O004',
    alias: 'Ziil',
    languageCode: 'en',
    scriptCode: 'Latn',
    direction: 'ltr',
    perspective: 'TEXTUAL_WITNESS',
    sourceCode: 'm09-unilex-review',
    status: 'CANDIDATE',
  },
  {
    aliasCode: 'AL005',
    entity: 'O006',
    alias: 'SHADOW',
    languageCode: 'en',
    scriptCode: 'Latn',
    direction: 'ltr',
    perspective: 'PROJECT_INTERNAL',
    sourceCode: 'm02-01-disambiguation',
    status: 'CANDIDATE',
  },
  {
    aliasCode: 'AL006',
    entity: 'O007',
    alias: 'SHADOW',
    languageCode: 'en',
    scriptCode: 'Latn',
    direction: 'ltr',
    perspective: 'CREATIVE_FICTION',
    sourceCode: 'm02-01-disambiguation',
    status: 'CANDIDATE',
  },
  {
    aliasCode: 'AL007',
    entity: 'O008',
    alias: 'The Battery',
    languageCode: 'en',
    scriptCode: 'Latn',
    direction: 'ltr',
    perspective: 'CREATIVE_FICTION',
    sourceCode: 'm02-01-disambiguation',
    status: 'CANDIDATE',
  },
]

export type RelationSeed = {
  edgeCode: string
  from: string
  to: string
  relationType: RelationType
  perspective: Perspective
  sourceCode: string
  epistemicStatus: EpistemicStatus
  reviewer: string | null
  reason: string
  evidenceRef: string | null
}

export const RELATION_SEED: RelationSeed[] = [
  {
    edgeCode: 'EDG-O001-O002-distinctFrom',
    from: 'O001',
    to: 'O002',
    relationType: 'distinctFrom',
    perspective: 'GENERAL',
    sourceCode: 'm02-01-disambiguation',
    epistemicStatus: 'VERIFIED',
    reviewer: REVIEWER,
    reason:
      'M02-01 forbids sameAs between the theological referent and the A-L-L-A-H project acronym.',
    evidenceRef: M02_REF,
  },
  {
    edgeCode: 'EDG-O003-O004-distinctFrom',
    from: 'O003',
    to: 'O004',
    relationType: 'distinctFrom',
    perspective: 'GENERAL',
    sourceCode: 'm09-unilex-review',
    epistemicStatus: 'VERIFIED',
    reviewer: REVIEWER,
    reason:
      'Phonetic resemblance only: ZILL is the creative character, ZIIL the historical lexical variant.',
    evidenceRef: M09_REF,
  },
  {
    edgeCode: 'EDG-O003-O005-distinctFrom',
    from: 'O003',
    to: 'O005',
    relationType: 'distinctFrom',
    perspective: 'GENERAL',
    sourceCode: 'm09-unilex-review',
    epistemicStatus: 'VERIFIED',
    reviewer: REVIEWER,
    reason:
      'The creative character and the Sufi study track share a name but not a referent.',
    evidenceRef: M09_REF,
  },
  {
    edgeCode: 'EDG-O003-O005-relatedTo-SUFI_STUDY',
    from: 'O003',
    to: 'O005',
    relationType: 'relatedTo',
    perspective: 'SUFI_STUDY',
    sourceCode: 'xv-master-vision',
    epistemicStatus: 'UNKNOWN',
    reviewer: null,
    reason:
      'A proposed thematic resonance between the character and the study track; not established and not an identity claim.',
    evidenceRef: null,
  },
  {
    edgeCode: 'EDG-O003-O005-relatedTo-CREATIVE_FICTION',
    from: 'O003',
    to: 'O005',
    relationType: 'relatedTo',
    perspective: 'CREATIVE_FICTION',
    sourceCode: 'm09-unilex-review',
    epistemicStatus: 'DISPUTED',
    reviewer: REVIEWER,
    reason:
      'A competing reading treats the shared name as coincidence; the disagreement stays open.',
    evidenceRef: M09_REF,
  },
  {
    edgeCode: 'EDG-O006-O007-distinctFrom',
    from: 'O006',
    to: 'O007',
    relationType: 'distinctFrom',
    perspective: 'GENERAL',
    sourceCode: 'm02-01-disambiguation',
    epistemicStatus: 'VERIFIED',
    reviewer: REVIEWER,
    reason:
      'The workspace is a software surface; the character is a narrative person. A shared label is not identity.',
    evidenceRef: M02_REF,
  },
  {
    edgeCode: 'EDG-O008-O001-distinctFrom',
    from: 'O008',
    to: 'O001',
    relationType: 'distinctFrom',
    perspective: 'CREATIVE_FICTION',
    sourceCode: 'm02-01-disambiguation',
    epistemicStatus: 'ASSERTED',
    reviewer: null,
    reason:
      'The fictional band is not the theological referent. The source asserts the boundary; review remains open.',
    evidenceRef: M02_REF,
  },
]

export type IdentitySeed = {
  reviewCode: string
  left: string
  right: string
  identityKind: 'SAME_ACTOR' | 'SAME_ENTITY' | 'SAME_CHARACTER' | 'ALIAS_ONLY'
  decision: IdentityDecision
  reviewer: string | null
  reason: string
  evidenceRef: string | null
}

export const IDENTITY_SEED: IdentitySeed[] = [
  {
    reviewCode: 'IR-001',
    left: 'O001',
    right: 'O002',
    identityKind: 'SAME_ENTITY',
    decision: 'REJECTED',
    reviewer: REVIEWER,
    reason:
      'The divine name and the project acronym are distinct referents; M02-01 forbids sameAs.',
    evidenceRef: M02_REF,
  },
  {
    reviewCode: 'IR-002',
    left: 'O003',
    right: 'O004',
    identityKind: 'SAME_CHARACTER',
    decision: 'REJECTED',
    reviewer: REVIEWER,
    reason: 'ZILL and ZIIL differ by spelling and domain; resemblance is not identity.',
    evidenceRef: M09_REF,
  },
  {
    reviewCode: 'IR-003',
    left: 'O006',
    right: 'O007',
    identityKind: 'SAME_ENTITY',
    decision: 'PENDING',
    reviewer: null,
    reason:
      'Both carry the label SHADOW, but their kinds and domains differ. No evidence yet that they are one referent.',
    evidenceRef: null,
  },
  {
    reviewCode: 'IR-004',
    left: 'O008',
    right: 'O001',
    identityKind: 'SAME_ENTITY',
    decision: 'REJECTED',
    reviewer: REVIEWER,
    reason:
      'A fictional band and the theological referent are never merged; M02-01 treats the confusion as a red line.',
    evidenceRef: M02_REF,
  },
]

export const REVIEW_LOG_SEED = [
  {
    targetType: 'IDENTITY',
    targetRef: 'O001:O002',
    action: 'REJECT_MERGE',
    reason: 'Distinct referents; sameAs is forbidden by M02-01.',
    reviewer: REVIEWER,
    evidenceRef: M02_REF,
    decidedAt: DECIDED_AT,
  },
  {
    targetType: 'IDENTITY',
    targetRef: 'O003:O004',
    action: 'REJECT_MERGE',
    reason: 'Phonetic resemblance only; ZILL and ZIIL remain separate.',
    reviewer: REVIEWER,
    evidenceRef: M09_REF,
    decidedAt: DECIDED_AT,
  },
  {
    targetType: 'IDENTITY',
    targetRef: 'O001:O008',
    action: 'REJECT_MERGE',
    reason: 'Fictional band and theological referent are distinct domains.',
    reviewer: REVIEWER,
    evidenceRef: M02_REF,
    decidedAt: DECIDED_AT,
  },
]
