import { cookies } from 'next/headers'
import { SESSION_TTL_SECONDS } from '@moonwitness/core'

/**
 * The admin token lives in one opaque, httpOnly cookie. It is read on the
 * server only (RSC / route handlers) and never reaches browser JavaScript.
 */
export const SESSION_COOKIE = 'hq_token'
/** the same lifetime the hub gives the server-side session record */
export const SESSION_MAX_AGE = SESSION_TTL_SECONDS

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  // Production is secure by default; only an explicit HQ_COOKIE_SECURE=false
  // (plain-HTTP compose) downgrades it. A missing variable must not silently
  // hand the admin cookie over an insecure channel.
  secure: process.env.HQ_COOKIE_SECURE === 'false' ? false : process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_MAX_AGE,
} as const

export async function readToken(): Promise<string | undefined> {
  const store = await cookies()
  return store.get(SESSION_COOKIE)?.value
}
