import { cookies } from 'next/headers'
import { SESSION_TTL_SECONDS } from '@moonwitness/core'

export const SESSION_COOKIE = 'isp_token'
export const SESSION_MAX_AGE = SESSION_TTL_SECONDS

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.ISP_COOKIE_SECURE === 'false' ? false : process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_MAX_AGE,
}

export async function readToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value
}
