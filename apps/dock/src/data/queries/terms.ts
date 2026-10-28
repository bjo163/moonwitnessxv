import { MoonApiError } from '@moonwitness/moonql-client'
import { serverClient } from '@/data/sdk'

/**
 * The UNILEX Terms Table is a read-only projection of the hub's term, form,
 * sense, source and relation tables. The Dock never keeps a second vocabulary.
 */

export interface TermForm {
  formCode?: string
  languageCode: string
  scriptCode: string
  direction: 'ltr' | 'rtl'
  headword: string
  transliteration?: string | null
  normalized?: string
  sourceCode?: string | null
}

export interface TermSense {
  key: string
  scope: string
  definition: string
  editorialStatus: string
  sourceCode?: string | null
  reviewer?: string | null
  reviewerNote?: string | null
  deprecatedAt?: string | null
  supersedes?: string | null
  supersededBy?: string | null
  current?: boolean
}

export interface TermSource {
  code: string | null
  title?: string | null
  sourceType?: string | null
  reviewStatus: string | null
  citation?: string | null
  sourceUri?: string | null
  provenanceSha?: string | null
  approvalNote?: string | null
}

export interface TermRelation {
  relationType: string
  status: string
  assertedBy?: string
  reviewer?: string | null
  reason?: string | null
  evidenceRef?: string | null
  direction: 'outgoing' | 'incoming'
  targetStableId: string | null
  targetLabel?: string | null
}

export interface IdentityReview {
  pairCode: string
  leftStableId: string | null
  rightStableId: string | null
  leftForm: string | null
  rightForm: string | null
  classification: string
  similarity: number | null
  decision: string
  reviewer: string | null
  reason: string | null
  evidenceRef: string | null
}

export interface ReviewLogEntry {
  targetType: string
  targetRef: string
  action: string
  reason: string
  reviewer: string
  evidenceRef: string | null
  decidedAt: string
}

export interface RegistryMeta {
  version: string
  status: string
  seedCount: number
  pin: string
  path: string
  rawSha256: string
  notice: string
  addenda: { version: string; ids: string[]; notice: string }
}

export interface TermListItem {
  stableId: string
  lane: string
  kind: string
  preferredEn: string
  preferredId: string
  definition: string
  contextNote: string
  editorialStatus: string
  registryVersion: string
  deprecated: boolean
  senses: TermSense[]
  forms: TermForm[]
  sources: TermSource[]
  relations: TermRelation[]
  relevanceScore?: number | null
}

export interface TermsPage {
  state: string
  registry: RegistryMeta
  filters: { q: string; lane: string; scope: string; status: string; source: string }
  options: {
    lanes: string[]
    scopes: string[]
    statuses: string[]
    sources: Array<{ code: string | null; title: string | null; sourceType: string | null }>
  }
  total: number
  offset: number
  limit: number
  terms: TermListItem[]
}

export interface TermDetail {
  state: string
  registry: RegistryMeta
  term: {
    stableId: string
    lane: string
    kind: string
    preferredEn: string
    preferredId: string
    definition: string
    contextNote: string
    editorialStatus: string
    registryVersion: string
    deprecationReason: string | null
    supersededBy: { stableId: string; preferredEn: string } | null
  }
  forms: TermForm[]
  senses: TermSense[]
  sources: TermSource[]
  relations: TermRelation[]
  identityReviews: IdentityReview[]
  reviewLog: ReviewLogEntry[]
}

export interface MatchPreview {
  classification: 'EXACT' | 'NEAR' | 'DIFFERENT'
  left: { raw: string; normalized: string; script: string; direction: 'ltr' | 'rtl'; language: string | null; mixedScripts: boolean; diacriticsPresent: boolean }
  right: { raw: string; normalized: string; script: string; direction: 'ltr' | 'rtl'; language: string | null; mixedScripts: boolean; diacriticsPresent: boolean }
  similarity: number
  sameSurface: boolean
  suggestedAction: string
  requiresReview: boolean
  identityClaimed: boolean
  autoRelation: null
  reasons: string[]
  notice: string
}

export interface TermFilters {
  q?: string
  lane?: string
  scope?: string
  status?: string
  source?: string
  limit?: number
  offset?: number
}

const clean = (filters: TermFilters): Record<string, string | number | undefined> =>
  Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== ''),
  ) as Record<string, string | number | undefined>

export async function readTerms(filters: TermFilters = {}): Promise<TermsPage> {
  return serverClient().call<TermsPage>('/unilex/terms', { query: clean(filters) })
}

export async function readTerm(stableId: string): Promise<TermDetail | null> {
  try {
    return await serverClient().call<TermDetail>('/unilex/term', { query: { stableId } })
  } catch (err) {
    if (err instanceof MoonApiError && (err.statusCode === 400 || err.statusCode === 401 || err.statusCode === 404)) return null
    throw err
  }
}

export async function readMatchPreview(left: string, right: string): Promise<MatchPreview> {
  return serverClient().call<MatchPreview>('/unilex/matches/preview', { query: { left, right } })
}
