import { NextResponse } from 'next/server'
import { errorMessage } from '@moonwitness/moonql-client'
import { login, logout } from '@/data/queries/session'
import { SESSION_COOKIE, sessionCookieOptions } from '@/lib/session'

/** login + logout are the ONLY places the token crosses the server boundary */
async function readFields(request: Request): Promise<Record<string, string>> {
  const contentType = request.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    return Object.fromEntries(Object.entries(body).map(([key, value]) => [key, String(value ?? '')]))
  }
  const form = await request.formData()
  const fields: Record<string, string> = {}
  for (const [key, value] of form.entries()) if (typeof value === 'string') fields[key] = value
  return fields
}

/**
 * A relative Location, deliberately.
 *
 * `new URL(path, request.url)` looks equivalent but is not: whatever the platform
 * decides `request.url` is (here it came out as the configured `http://localhost:3002`
 * even though the browser had asked `http://127.0.0.1:3002`) becomes part of the
 * redirect target, and a browser that sees a different origin — even the same server
 * under another hostname — blocks the follow-up under `form-action 'self'` and
 * `connect-src 'self'`. Login then appears to do nothing. A relative Location is
 * resolved by the browser against the request, so it is always same-origin.
 */
const backTo = (path: string): NextResponse =>
  new NextResponse(null, { status: 303, headers: { location: path } })

/**
 * Same-origin in-app path only. `startsWith('/')` alone still accepts `//evil.com`
 * and `/\evil.com`, which would hand the freshly minted admin cookie to another
 * origin, so those fall back to the dashboard.
 */
const safeNext = (next: string | undefined): string =>
  next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\') ? next : '/'

export async function POST(request: Request): Promise<NextResponse> {
  const fields = await readFields(request)

  if (fields.logout) {
    await logout()
    const response = backTo('/login')
    response.cookies.delete(SESSION_COOKIE)
    return response
  }

  const loginName = (fields.login ?? '').trim()
  const password = fields.password ?? ''
  if (!loginName || !password) {
    return backTo('/login?error=Login%20and%20password%20are%20required')
  }

  try {
    const session = await login(loginName, password)
    const response = backTo(safeNext(fields.next))
    response.cookies.set(SESSION_COOKIE, session.token, sessionCookieOptions)
    return response
  } catch (error) {
    return backTo(`/login?error=${encodeURIComponent(errorMessage(error))}`)
  }
}

export async function DELETE(): Promise<NextResponse> {
  await logout()
  const response = NextResponse.json({ ok: true })
  response.cookies.delete(SESSION_COOKIE)
  return response
}
