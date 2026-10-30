import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC = ['/login', '/api/session']

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-isp-console-locale', request.nextUrl.searchParams.get('lang') === 'id' ? 'id' : 'en')
  if (PUBLIC.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }
  if (request.cookies.get('isp_token')) return NextResponse.next({ request: { headers: requestHeaders } })
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ ok: false, code: 'unauthorized' }, { status: 401, headers: { 'cache-control': 'no-store' } })
  }
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  url.search = `?next=${encodeURIComponent(pathname)}`
  return NextResponse.redirect(url)
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] }
