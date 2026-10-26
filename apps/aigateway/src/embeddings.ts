/**
 * apps/aigateway/src/embeddings.ts
 *
 * Deterministic Semantic Embedding Engine (Zero-Cost Local Fallback).
 *
 * Computes 128-dimensional unit vector representations from textual inputs
 * using character n-grams and token hash projections with cosine normalization.
 * Provides consistent, reproducible vector embeddings for offline Unilex search.
 */

const VECTOR_DIMENSIONS = 128

/**
 * FNV-1a 32-bit hash function for string hashing.
 */
function fnv1a(str: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/**
 * Generates a normalized 128-dimensional float embedding vector for any text.
 */
export function generateDeterministicEmbedding(
  text: string,
  dimensions = VECTOR_DIMENSIONS
): number[] {
  const vec = new Float64Array(dimensions)
  const normalized = text.trim().toLowerCase()

  if (!normalized) {
    // Return unit vector along first dimension if empty
    const zeroVec = new Array<number>(dimensions).fill(0)
    zeroVec[0] = 1.0
    return zeroVec
  }

  // 1. Word token projections
  const words = normalized.split(/\s+/).filter(Boolean)
  for (const w of words) {
    const h = fnv1a(w)
    const dim = h % dimensions
    const sign = (h & 0x80000000) === 0 ? 1 : -1
    vec[dim] = (vec[dim] ?? 0) + sign * 1.5
  }

  // 2. Character trigram projections
  if (normalized.length >= 3) {
    for (let i = 0; i <= normalized.length - 3; i++) {
      const trigram = normalized.slice(i, i + 3)
      const h = fnv1a(trigram)
      const dim = h % dimensions
      const sign = (h & 0x40000000) === 0 ? 1 : -1
      vec[dim] = (vec[dim] ?? 0) + sign * 0.8
    }
  }

  // 3. Normalization to unit L2 length
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
 * Computes cosine similarity between two unit vectors: dot(a, b).
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0
  let dot = 0
  for (let i = 0; i < a.length; i++) {
    dot += (a[i] ?? 0) * (b[i] ?? 0)
  }
  // Clamp between -1.0 and 1.0, and map negative to 0.0 for relevance scores
  return Math.max(0, Math.min(1.0, dot))
}
