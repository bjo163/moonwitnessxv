import { NextResponse, type NextRequest } from 'next/server'

/** the only paths reachable without a session cookie */
const PUBLIC = ['/login', '/api/session']

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  if (PUBLIC.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next()
  }
  if (request.cookies.get('hq_token')) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = '/login'
  url.search = pathname === '/' ? '' : `?next=${encodeURIComponent(pathname)}`
  return NextResponse.redirect(url)
}

export const config = {
  // everything except Next internals and static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
