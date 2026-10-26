import { sha256Hex } from '@moonwitness/echolog-core'
import type { FastifyRequest } from 'fastify'

const AUTH_CACHE_TTL_MS = 2_000
const AUTH_CACHE_MAX = 500
const TOKEN_MAX_LENGTH = 4096

export interface EchologPrincipal {
  kind: 'service' | 'arsy'
  uploader: string
  role?: string
}

export type AuthResult =
  | { ok: true; principal: EchologPrincipal }
  | { ok: false; status: 401 | 503; code: 'unauthorized' | 'auth_unavailable' }

interface CacheEntry {
  principal: EchologPrincipal
  expiresAt: number
}

export interface AuthOptions {
  arsyUrl: string
  serviceKey: string
  fetcher?: typeof fetch
  now?: () => number
}

/** Resolve opaque ARSY sessions through the real `/api/v1/auth/me` boundary. */
export function createEchologAuthenticator(options: AuthOptions) {
  const fetcher = options.fetcher ?? fetch
  const now = options.now ?? Date.now
  const cache = new Map<string, CacheEntry>()
  const authMeUrl = new URL('/api/v1/auth/me', options.arsyUrl)

  return async function authenticate(request: FastifyRequest): Promise<AuthResult> {
    const serviceHeader = request.headers['x-echolog-key']
    const serviceKey = Array.isArray(serviceHeader) ? null : serviceHeader
    if (serviceKey !== undefined && serviceKey !== null) {
      if (options.serviceKey && await constantTimeEqual(serviceKey, options.serviceKey)) {
        return { ok: true, principal: { kind: 'service', uploader: 'service' } }
      }
      return { ok: false, status: 401, code: 'unauthorized' }
    }

    const authorization = request.headers.authorization
    if (Array.isArray(authorization)) return { ok: false, status: 401, code: 'unauthorized' }
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7).trim() : ''
    if (!token || token.length > TOKEN_MAX_LENGTH) return { ok: false, status: 401, code: 'unauthorized' }

    const tokenId = await sha256Hex(new TextEncoder().encode(token))
    const cached = cache.get(tokenId)
    if (cached && cached.expiresAt > now()) return { ok: true, principal: cached.principal }
    cache.delete(tokenId)

    let response: Response
    try {
      response = await fetcher(authMeUrl, {
        method: 'GET',
        headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
        signal: AbortSignal.timeout(3_000),
        redirect: 'error',
      })
    } catch {
      return { ok: false, status: 503, code: 'auth_unavailable' }
    }
    if (response.status === 401 || response.status === 403) {
      return { ok: false, status: 401, code: 'unauthorized' }
    }
    if (!response.ok) return { ok: false, status: 503, code: 'auth_unavailable' }

    let body: unknown
    try {
      body = await response.json()
    } catch {
      return { ok: false, status: 503, code: 'auth_unavailable' }
    }
    const data = isRecord(body)
      ? isRecord(body.data) ? body.data : body
      : null
    const uploader = data && typeof data.login === 'string' ? data.login : null
    const role = data && typeof data.role === 'string' ? data.role : null
    if (!uploader || !role) return { ok: false, status: 503, code: 'auth_unavailable' }

    const principal: EchologPrincipal = { kind: 'arsy', uploader, role }
    if (cache.size >= AUTH_CACHE_MAX) {
      const oldest = cache.keys().next().value
      if (oldest !== undefined) cache.delete(oldest)
    }
    cache.set(tokenId, { principal, expiresAt: now() + AUTH_CACHE_TTL_MS })
    return { ok: true, principal }
  }
}

async function constantTimeEqual(left: string, right: string): Promise<boolean> {
  const [leftDigest, rightDigest] = await Promise.all([
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(left)),
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(right)),
  ])
  const leftBytes = new Uint8Array(leftDigest)
  const rightBytes = new Uint8Array(rightDigest)
  let mismatch = 0
  for (let index = 0; index < leftBytes.length; index += 1) mismatch |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0)
  return mismatch === 0 && left.length > 0
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
