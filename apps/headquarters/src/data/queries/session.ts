import { cache } from 'react'
import { MoonApiError } from '@moonwitness/moonql-client'
import { serverClient } from '@/data/sdk'
import type { SessionUser } from '@/data/types'

/**
 * The signed-in admin, deduped per request/render.
 *
 * Only a 401 means "anonymous". Anything else (hub down, DNS, 500) is rethrown:
 * swallowing it made an outage look like a logged-out operator and sent everyone
 * to the login screen with a valid cookie.
 */
export const me = cache(async (): Promise<SessionUser | null> => {
  try {
    return await serverClient().call<SessionUser>('/auth/me')
  } catch (err) {
    if (err instanceof MoonApiError && err.statusCode === 401) return null
    throw err
  }
})

export async function login(loginName: string, password: string): Promise<{ token: string; user: SessionUser }> {
  return serverClient().call<{ token: string; user: SessionUser }>('/auth/login', {
    method: 'POST',
    body: { login: loginName, password },
  })
}

/** best-effort: the local cookie is cleared even when the API is unreachable */
export async function logout(): Promise<void> {
  try {
    await serverClient().call('/auth/logout', { method: 'POST' })
  } catch {
    /* token already gone or API down — the cookie is what matters */
  }
}
