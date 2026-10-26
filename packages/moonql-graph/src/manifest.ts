import { createHash } from 'node:crypto'

export type OntologyEdgeInput = {
  edgeCode: string
  from: string
  to: string
  relationType: string
  perspective: string
  epistemicStatus: 'VERIFIED'
  sourceCode: string
  evidenceRef: string | null
  evidenceSha: string
}

export type CandidateEdgeInput = {
  candidateCode: string
  from: string
  to: string
  relationType: string
  perspective: string
  epistemicStatus: string
  sourceCode: string
  evidenceSha: string
  evidenceFrame: string
}

export type ReleaseEdge = [
  code: string,
  kind: 'ONTOLOGY' | 'CANDIDATE',
  from: string,
  to: string,
  relationType: string,
  perspective: string,
  epistemicStatus: string,
  sourceCode: string | null,
  evidenceSha: string | null,
]

export type DeduplicatedEdge = {
  code: string
  duplicateOf: string
  reason: string
}

export type ReleaseManifest = {
  schema: 'moonwitness-graph-manifest-v1'
  edges: ReleaseEdge[]
  ontology: Array<[string, string, string, string]>
  candidates: Array<[string, string, string, string]>
  deduplicated: DeduplicatedEdge[]
}

export type BuiltManifest = {
  manifest: ReleaseManifest
  manifestText: string
  graphSha: string
  releaseCode: string
  edgeCount: number
  ontologyCount: number
  candidateCount: number
  deduplicatedCount: number
}

const identity = (edge: { from: string; to: string; relationType: string; perspective: string }): string =>
  [edge.from, edge.to, edge.relationType, edge.perspective].join('|')

/**
 * The release manifest is a pure function of reviewed ontology relations and
 * approved candidates. Sorting and deduplication happen here so the same input
 * always yields the same graphSha, and replay reuses the existing release.
 */
export function buildReleaseManifest(input: {
  ontology: OntologyEdgeInput[]
  candidates: CandidateEdgeInput[]
}): BuiltManifest {
  const ontology = [...input.ontology].sort((a, b) => a.edgeCode.localeCompare(b.edgeCode))
  const candidates = [...input.candidates].sort((a, b) => a.candidateCode.localeCompare(b.candidateCode))

  const claimed = new Map<string, string>()
  const edges: ReleaseEdge[] = []
  for (const edge of ontology) {
    claimed.set(identity(edge), edge.edgeCode)
    edges.push([
      edge.edgeCode,
      'ONTOLOGY',
      edge.from,
      edge.to,
      edge.relationType,
      edge.perspective,
      edge.epistemicStatus,
      edge.sourceCode,
      edge.evidenceSha,
    ])
  }

  const deduplicated: DeduplicatedEdge[] = []
  const accepted: CandidateEdgeInput[] = []
  for (const candidate of candidates) {
    const winner = claimed.get(identity(candidate))
    if (winner) {
      deduplicated.push({
        code: candidate.candidateCode,
        duplicateOf: winner,
        reason:
          'A reviewed ontology relation already carries this from|to|relationType|perspective; the reviewed edge wins.',
      })
      continue
    }
    claimed.set(identity(candidate), candidate.candidateCode)
    accepted.push(candidate)
    edges.push([
      candidate.candidateCode,
      'CANDIDATE',
      candidate.from,
      candidate.to,
      candidate.relationType,
      candidate.perspective,
      candidate.epistemicStatus,
      candidate.sourceCode,
      candidate.evidenceSha,
    ])
  }

  const manifest: ReleaseManifest = {
    schema: 'moonwitness-graph-manifest-v1',
    edges,
    ontology: ontology.map((edge) => [edge.edgeCode, edge.from, edge.to, edge.evidenceSha]),
    candidates: accepted.map((edge) => [edge.candidateCode, edge.from, edge.to, edge.evidenceSha]),
    deduplicated,
  }
  const manifestText = JSON.stringify(manifest)
  const graphSha = createHash('sha256').update(manifestText).digest('hex')

  return {
    manifest,
    manifestText,
    graphSha,
    releaseCode: `grel_${graphSha.slice(0, 12)}`,
    edgeCount: edges.length,
    ontologyCount: ontology.length,
    candidateCount: accepted.length,
    deduplicatedCount: deduplicated.length,
  }
}

export function parseManifest(value: unknown): ReleaseManifest {
  const raw = typeof value === 'string' ? value : JSON.stringify(value ?? null)
  const parsed = JSON.parse(raw) as Partial<ReleaseManifest> | null
  if (!parsed || typeof parsed !== 'object') throw new Error('graph manifest is not an object')
  if (parsed.schema !== 'moonwitness-graph-manifest-v1') throw new Error('graph manifest has an unknown schema')
  if (!Array.isArray(parsed.edges)) throw new Error('graph manifest has no edges')
  if (!Array.isArray(parsed.ontology)) throw new Error('graph manifest has no ontology lineage')
  if (!Array.isArray(parsed.candidates)) throw new Error('graph manifest has no candidate lineage')
  if (!Array.isArray(parsed.deduplicated)) throw new Error('graph manifest has no deduplication record')
  return parsed as ReleaseManifest
}

export function manifestIdentities(manifest: ReleaseManifest): Set<string> {
  return new Set(
    manifest.edges.map((edge) => [edge[2], edge[3], edge[4], edge[5]].join('|')),
  )
}
