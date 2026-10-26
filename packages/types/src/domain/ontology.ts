/**
 * Ontological Entities, Relations and Evidence Frames (M10, M12)
 */
export type EntityKind =
  | 'CONCEPT'
  | 'PERSON'
  | 'LOCATION'
  | 'EVENT'
  | 'TEXT'
  | 'ORGANIZATION'
  | 'SYSTEM'

export type EntityStatus = 'DRAFT' | 'REVIEWED' | 'VERIFIED' | 'DISPUTED' | 'DEPRECATED'

export type RelationType =
  | 'relatedTo'
  | 'inspiredBy'
  | 'distinctFrom'
  | 'exactMatch'
  | 'closeMatch'
  | 'narrowerThan'
  | 'broaderThan'
  | 'partOf'
  | 'instanceOf'

export type IdentityDecision = 'APPROVED_MERGE' | 'REJECTED' | 'REVOKED'

export type EvidenceFrame =
  | 'TEXTUAL'
  | 'TABULAR'
  | 'CHRONOLOGY'
  | 'CO_OCCURRENCE'
  | 'SIMILARITY'
  | 'EDITORIAL'

export interface OntologyEntity {
  id: string
  code: string
  name: string
  kind: EntityKind
  status: EntityStatus
  summary?: string
  provenanceSha?: string
}

export interface OntologyRelation {
  id: string
  fromEntityCode: string
  toEntityCode: string
  relationType: RelationType
  perspective: string
  evidenceRef?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reviewer?: string
}
