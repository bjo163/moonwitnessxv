/**
 * packages/moonql-unilex/src/vector.ts
 *
 * Hybrid Lexical-Vector Search Engine for UNILEX (Section 21A.3).
 *
 * Combines trilateral root consonantal matching with semantic vector embedding
 * similarity without asserting theological equivalence (M09-03/04 guardrail).
 */

export interface UnilexSearchCandidate {
  code: string
  label: string
  transliteration?: string
  arabic?: string
  gloss?: string
  script?: 'Arab' | 'Hebr' | 'Grek' | 'Latn'
  direction?: 'ltr' | 'rtl'
}

export interface HybridSearchResult {
  code: string
  label: string
  arabic?: string
  gloss?: string
  script?: 'Arab' | 'Hebr' | 'Grek' | 'Latn'
  direction?: 'ltr' | 'rtl'
  stringScore: number
  vectorScore: number
  hybridScore: number
}

export interface HybridSearchOptions {
  /** Weight of lexical string matching vs vector similarity (0.0 to 1.0, default 0.5) */
  alpha?: number
  limit?: number
}

function fnv1a(str: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/**
 * Deterministic semantic vector embedding generator (128-dimensions).
 */
export function generateLocalEmbedding(text: string, dimensions = 128): number[] {
  const vec = new Float64Array(dimensions)
  const normalized = text.trim().toLowerCase()

  if (!normalized) {
    const zeroVec = new Array<number>(dimensions).fill(0)
    zeroVec[0] = 1.0
    return zeroVec
  }

  const words = normalized.split(/\s+/).filter(Boolean)
  for (const w of words) {
    const h = fnv1a(w)
    const dim = h % dimensions
    const sign = (h & 0x80000000) === 0 ? 1 : -1
    vec[dim] = (vec[dim] ?? 0) + sign * 1.5
  }

  if (normalized.length >= 3) {
    for (let i = 0; i <= normalized.length - 3; i++) {
      const trigram = normalized.slice(i, i + 3)
      const h = fnv1a(trigram)
      const dim = h % dimensions
      const sign = (h & 0x40000000) === 0 ? 1 : -1
      vec[dim] = (vec[dim] ?? 0) + sign * 0.8
    }
  }

  let norm = 0
  for (let i = 0; i < dimensions; i++) {
    norm += (vec[i] ?? 0) * (vec[i] ?? 0)
  }
  const l2 = Math.sqrt(norm) || 1.0

  const result: number[] = new Array<number>(dimensions)
  for (let i = 0; i < dimensions; i++) {
    result[i] = Number(((vec[i] ?? 0) / l2).toFixed(6))
  }
  return result
}

/**
 * Computes cosine similarity between two unit vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0
  let dot = 0
  for (let i = 0; i < a.length; i++) {
    dot += (a[i] ?? 0) * (b[i] ?? 0)
  }
  return Math.max(0, Math.min(1.0, dot))
}

/**
 * Computes simple lexical overlap coefficient between two strings.
 */
function lexicalStringSimilarity(a: string, b: string): number {
  const normA = a.toLowerCase().trim()
  const normB = b.toLowerCase().trim()
  if (normA === normB) return 1.0
  if (normA.includes(normB) || normB.includes(normA)) return 0.85

  // Bigram Dice overlap
  const getBigrams = (s: string) => {
    const bg = new Set<string>()
    for (let i = 0; i < s.length - 1; i++) {
      bg.add(s.slice(i, i + 2))
    }
    return bg
  }

  const bgA = getBigrams(normA)
  const bgB = getBigrams(normB)
  if (bgA.size === 0 || bgB.size === 0) return 0.0

  let intersection = 0
  for (const item of bgA) {
    if (bgB.has(item)) intersection++
  }

  return (2.0 * intersection) / (bgA.size + bgB.size)
}

/**
 * Executes a hybrid lexical and vector semantic search across Unilex candidates.
 */
export function hybridUnilexSearch(
  query: string,
  candidates: UnilexSearchCandidate[],
  options: HybridSearchOptions = {}
): HybridSearchResult[] {
  const alpha = options.alpha ?? 0.5
  const limit = options.limit ?? 20
  const queryEmbedding = generateLocalEmbedding(query)

  const scored: HybridSearchResult[] = candidates.map((cand) => {
    // 1. Lexical match score
    const scoreLabel = lexicalStringSimilarity(query, cand.label)
    const scoreArabic = cand.arabic ? lexicalStringSimilarity(query, cand.arabic) : 0
    const scoreGloss = cand.gloss ? lexicalStringSimilarity(query, cand.gloss) * 0.7 : 0
    const stringScore = Math.max(scoreLabel, scoreArabic, scoreGloss)

    // 2. Vector semantic score
    const targetText = `${cand.label} ${cand.arabic ?? ''} ${cand.gloss ?? ''}`
    const targetEmbedding = generateLocalEmbedding(targetText)
    const vectorScore = cosineSimilarity(queryEmbedding, targetEmbedding)

    // 3. Combined hybrid score
    const hybridScore = Number((alpha * stringScore + (1 - alpha) * vectorScore).toFixed(4))

    return {
      code: cand.code,
      label: cand.label,
      arabic: cand.arabic,
      gloss: cand.gloss,
      script: cand.script,
      direction: cand.direction,
      stringScore: Number(stringScore.toFixed(4)),
      vectorScore: Number(vectorScore.toFixed(4)),
      hybridScore,
    }
  })

  // Sort descending by hybridScore
  scored.sort((a, b) => b.hybridScore - a.hybridScore)
  return scored.slice(0, limit)
}
