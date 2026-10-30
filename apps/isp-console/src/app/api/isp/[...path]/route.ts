import { NextResponse } from 'next/server'
import { arsyFetch, envelopeData } from '@/lib/arsy'
import { allowedIspPath } from '@/lib/bff-policy'
import { readToken } from '@/lib/session'

type RouteContext = { params: Promise<{ path: string[] }> }
const noStore = { 'cache-control': 'private, no-store', vary: 'cookie' }

async function proxy(request: Request, context: RouteContext, method: 'GET' | 'POST'): Promise<NextResponse> {
  const token = await readToken()
  if (!token) return NextResponse.json({ ok: false, code: 'unauthorized' }, { status: 401, headers: noStore })

  const { path: segments } = await context.params
  const upstreamPath = allowedIspPath(method, segments)
  if (!upstreamPath) return NextResponse.json({ ok: false, code: 'not-found' }, { status: 404, headers: noStore })

  const url = new URL(request.url)
  let body: string | undefined
  if (method === 'POST') {
    if (request.headers.get('x-isp-console') !== '1') {
      return NextResponse.json({ ok: false, code: 'forbidden' }, { status: 403, headers: noStore })
    }
    if (!(request.headers.get('content-type') ?? '').includes('application/json')) {
      return NextResponse.json({ ok: false, code: 'invalid-body' }, { status: 415, headers: noStore })
    }
    const raw = await request.text()
    if (raw.length > 8192) return NextResponse.json({ ok: false, code: 'body-too-large' }, { status: 413, headers: noStore })
    try {
      const parsed: unknown = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('body must be an object')
      body = JSON.stringify(parsed)
    } catch {
      return NextResponse.json({ ok: false, code: 'invalid-body' }, { status: 400, headers: noStore })
    }
  }

  try {
    const upstream = await arsyFetch(`${upstreamPath}${method === 'GET' ? url.search : ''}`, token, {
      method,
      ...(body === undefined ? {} : { body, headers: { 'content-type': 'application/json' } }),
    })
    const payload: unknown = await upstream.json().catch(() => null)
    if (!upstream.ok) {
      const code = upstream.status === 401 ? 'unauthorized' : upstream.status === 403 ? 'forbidden' : upstream.status === 404 ? 'not-found' : 'request-failed'
      return NextResponse.json({ ok: false, code }, { status: upstream.status, headers: noStore })
    }
    return NextResponse.json({ ok: true, data: envelopeData(payload) }, { status: upstream.status, headers: noStore })
  } catch {
    return NextResponse.json({ ok: false, code: 'unavailable' }, { status: 502, headers: noStore })
  }
}

export function GET(request: Request, context: RouteContext): Promise<NextResponse> {
  return proxy(request, context, 'GET')
}

export function POST(request: Request, context: RouteContext): Promise<NextResponse> {
  return proxy(request, context, 'POST')
}
