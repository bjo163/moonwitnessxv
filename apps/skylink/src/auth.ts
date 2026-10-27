import { verifySecretToken } from '@moonwitness/skylink-core'
import type { FastifyRequest } from 'fastify'

const AUTH_CACHE_TTL_MS = 2_000
const AUTH_CACHE_LIMIT = 500
const TOKEN_LIMIT = 4096

export interface SkylinkPrincipal {
  kind: 'service' | 'arsy'
  login?: string
  role?: string
}

export type AuthResult =
  | { ok: true; principal: SkylinkPrincipal }
  | { ok: false; status: 401 | 503; code: 'unauthorized' | 'auth_unavailable' }

export interface AuthOptions {
  arsyUrl: string
  serviceKey: string
  fetcher?: typeof fetch
  now?: () => number
}

interface CacheEntry {
  principal: SkylinkPrincipal
  expiresAt: number
}

export function createSkylinkAuthenticator(options: AuthOptions) {
  const fetcher = options.fetcher ?? fetch
  const now = options.now ?? Date.now
  const cache = new Map<string, CacheEntry>()
  const authMeUrl = new URL('/api/v1/auth/me', options.arsyUrl)

  async function authenticateCredentials(credentials: { serviceKey?: string; authorization?: string }): Promise<AuthResult> {
    if (credentials.serviceKey !== undefined) {
      return options.serviceKey && verifySecretToken(credentials.serviceKey, options.serviceKey)
        ? { ok: true, principal: { kind: 'service' } }
        : { ok: false, status: 401, code: 'unauthorized' }
    }

    const token = credentials.authorization?.startsWith('Bearer ')
      ? credentials.authorization.slice(7).trim()
      : ''
    if (!token || token.length > TOKEN_LIMIT) return { ok: false, status: 401, code: 'unauthorized' }

    const key = await hashToken(token)
    const cached = cache.get(key)
    if (cached && cached.expiresAt > now()) return { ok: true, principal: cached.principal }
    cache.delete(key)

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
    if (response.status === 401 || response.status === 403) return { ok: false, status: 401, code: 'unauthorized' }
    if (!response.ok) return { ok: false, status: 503, code: 'auth_unavailable' }

    let body: unknown
    try {
      body = await response.json()
    } catch {
      return { ok: false, status: 503, code: 'auth_unavailable' }
    }
    const data = isRecord(body) ? (isRecord(body.data) ? body.data : body) : null
    const login = data && typeof data.login === 'string' ? data.login : null
    const role = data && typeof data.role === 'string' ? data.role : null
    if (!login || !role) return { ok: false, status: 503, code: 'auth_unavailable' }

    const principal: SkylinkPrincipal = { kind: 'arsy', login, role }
    if (cache.size >= AUTH_CACHE_LIMIT) {
      const oldest = cache.keys().next().value
      if (oldest !== undefined) cache.delete(oldest)
    }
    cache.set(key, { principal, expiresAt: now() + AUTH_CACHE_TTL_MS })
    return { ok: true, principal }
  }

  return async function authenticate(request: FastifyRequest): Promise<AuthResult> {
    const serviceHeader = request.headers['x-skylink-key']
    if (serviceHeader !== undefined) {
      if (Array.isArray(serviceHeader)) return { ok: false, status: 401, code: 'unauthorized' }
      return authenticateCredentials({ serviceKey: serviceHeader })
    }
    const authorization = request.headers.authorization
    if (Array.isArray(authorization)) return { ok: false, status: 401, code: 'unauthorized' }
    return authenticateCredentials({ authorization })
  }
}

export function createCredentialAuthenticator(options: AuthOptions) {
  const authenticateRequest = createSkylinkAuthenticator(options)
  return {
    authenticateRequest,
    authenticateCredentials: async (credentials: { serviceKey?: string; authorization?: string }) => {
      // WebSocket auth uses the same resolver/cache as REST without cookies or query tokens.
      const request = {
        headers: {
          'x-skylink-key': credentials.serviceKey,
          authorization: credentials.authorization,
        },
      } as unknown as FastifyRequest
      return authenticateRequest(request)
    },
  }
}

async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
