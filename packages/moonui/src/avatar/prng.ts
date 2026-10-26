/**
 * Deterministic PRNG & Hash Engine for Generative SVG Visuals
 *
 * Implements MurmurHash3 (32-bit integer) and Mulberry32 PRNG.
 * Given any input seed string (e.g. user ID, station ID, callsign, public key),
 * produces an identical, reproducible stream of pseudo-random numbers in [0, 1).
 */

export function hashString(str: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

export function createPrng(seed: string): () => number {
  let a = hashString(seed) || 0x2c6f5a31
  return function next(): number {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
