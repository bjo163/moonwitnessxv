/**
 * packages/moonql-apikeys/src/cache.ts
 *
 * High-Throughput In-Memory LRU Cache for API Key Resolution (Section 21A.5).
 *
 * Speeds up machine-to-machine authentication by keeping up to 5,000 verified
 * key-hashes in memory with a 60-second TTL. Supports instant cache eviction
 * on key revocation.
 */

export interface CachedApiKeyUser {
  id: string
  roles: string[]
  meta: {
    keyId: string
    name: string
  }
  cachedAt: number
}

const MAX_CACHE_SIZE = 5_000
const DEFAULT_TTL_MS = 60_000

class ApiKeyLruCache {
  private readonly map = new Map<string, CachedApiKeyUser>()
  private readonly keyIdToHash = new Map<string, string>()
  private readonly ttlMs: number
  private readonly maxSize: number

  constructor(maxSize = MAX_CACHE_SIZE, ttlMs = DEFAULT_TTL_MS) {
    this.maxSize = maxSize
    this.ttlMs = ttlMs
  }

  get(keyHash: string): CachedApiKeyUser | null {
    const entry = this.map.get(keyHash)
    if (!entry) return null

    // Check expiration
    if (Date.now() - entry.cachedAt > this.ttlMs) {
      this.evict(keyHash)
      return null
    }

    // Refresh LRU position (delete and re-insert)
    this.map.delete(keyHash)
    this.map.set(keyHash, entry)
    return entry
  }

  set(keyHash: string, user: Omit<CachedApiKeyUser, 'cachedAt'>): void {
    if (this.map.size >= this.maxSize) {
      // Evict oldest entry (first item in insertion order)
      const firstKey = this.map.keys().next().value
      if (firstKey) this.evict(firstKey)
    }

    const cached: CachedApiKeyUser = {
      ...user,
      cachedAt: Date.now(),
    }

    this.map.set(keyHash, cached)
    this.keyIdToHash.set(user.meta.keyId, keyHash)
  }

  invalidate(keyIdOrHash: string): void {
    if (this.map.has(keyIdOrHash)) {
      this.evict(keyIdOrHash)
      return
    }

    const hash = this.keyIdToHash.get(keyIdOrHash)
    if (hash) {
      this.evict(hash)
    }
  }

  private evict(keyHash: string): void {
    const entry = this.map.get(keyHash)
    if (entry) {
      this.keyIdToHash.delete(entry.meta.keyId)
      this.map.delete(keyHash)
    }
  }

  clear(): void {
    this.map.clear()
    this.keyIdToHash.clear()
  }

  size(): number {
    return this.map.size
  }
}

export const apiKeyCache = new ApiKeyLruCache()

export function getCachedApiKeyUser(keyHash: string): CachedApiKeyUser | null {
  return apiKeyCache.get(keyHash)
}

export function setCachedApiKeyUser(keyHash: string, user: Omit<CachedApiKeyUser, 'cachedAt'>): void {
  apiKeyCache.set(keyHash, user)
}

export function invalidateKeyCache(keyIdOrHash: string): void {
  apiKeyCache.invalidate(keyIdOrHash)
}

export function clearKeyCache(): void {
  apiKeyCache.clear()
}
