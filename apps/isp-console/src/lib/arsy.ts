import { apiBaseUrl } from '@moonwitness/moonql-client'

export const ARSY_API_URL = apiBaseUrl(process.env)

export interface ApiEnvelope<T> {
  ok: boolean
  data?: T
  error?: { statusCode?: number; message?: string }
}

export function envelopeData<T>(payload: unknown): T | null {
  if (!payload || typeof payload !== 'object') return null
  const value = payload as ApiEnvelope<T>
  if (value.ok === true && 'data' in value) return value.data ?? null
  // Local and isolated test instances can omit ARSY's response envelope.
  if (!('ok' in value) && !('error' in value)) return payload as T
  return null
}

export async function arsyFetch(path: string, token: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers)
  headers.set('authorization', `Bearer ${token}`)
  headers.set('accept', 'application/json')
  return fetch(`${ARSY_API_URL}${path}`, { ...init, headers, cache: 'no-store' })
}
