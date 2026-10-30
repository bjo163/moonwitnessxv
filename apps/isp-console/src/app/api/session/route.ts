import { NextResponse } from 'next/server'
import { ARSY_API_URL, envelopeData } from '@/lib/arsy'
import { SESSION_COOKIE, sessionCookieOptions, readToken } from '@/lib/session'

const redirectTo = (path: string): NextResponse => new NextResponse(null, { status: 303, headers: { location: path } })

function safeNext(value: string | null): string {
  return value && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\') ? value : '/'
}

export async function POST(request: Request): Promise<NextResponse> {
  const form = await request.formData().catch(() => null)
  const login = String(form?.get('login') ?? '').trim()
  const password = String(form?.get('password') ?? '')
  const next = safeNext(form?.get('next')?.toString() ?? null)
  if (!login || !password || login.length > 60 || password.length > 256) return redirectTo('/login?error=invalid')

  try {
    const upstream = await fetch(`${ARSY_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ login, password }),
      cache: 'no-store',
    })
    const payload: unknown = await upstream.json().catch(() => null)
    const session = upstream.ok ? envelopeData<{ token: string }>(payload) : null
    if (!session || typeof session.token !== 'string') return redirectTo(`/login?error=${upstream.status === 401 ? 'invalid' : 'unavailable'}`)
    const response = redirectTo(next)
    response.cookies.set(SESSION_COOKIE, session.token, sessionCookieOptions)
    return response
  } catch {
    return redirectTo('/login?error=unavailable')
  }
}

export async function DELETE(): Promise<NextResponse> {
  const token = await readToken()
  if (token) {
    await fetch(`${ARSY_API_URL}/auth/logout`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      cache: 'no-store',
    }).catch(() => undefined)
  }
  const response = NextResponse.json({ ok: true }, { headers: { 'cache-control': 'no-store' } })
  response.cookies.delete(SESSION_COOKIE)
  return response
}
