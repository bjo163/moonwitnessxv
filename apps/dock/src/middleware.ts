import { NextResponse, type NextRequest } from 'next/server.js'
// The framing rules come from @moonwitness/core by name — the same owner the hub and
// both Next configs use. `core` is linted to stay free of Node built-ins precisely so
// this edge entry point can import it.
import { EMBED_PATH, embedOrigins, isLocale, resolveLocale, securityHeaders } from '@moonwitness/core'
import { DOCK_LOCALE_HEADER } from './lib/locale-context.mjs'

/**
 * Framing is decided per path, here, rather than in `next.config.mjs`.
 *
 * A static `source: '/:path*'` rule and a more specific `/embed/*` rule would both
 * match an embed response, and a browser handed two Content-Security-Policy headers
 * enforces the strictest reading of both — the allow-list would silently never
 * apply. One writer per response avoids that class of bug entirely.
 *
 * `EMBED_ORIGINS` is read at request time from the environment the process was
 * given (compose), so the door stays shut unless an operator opens it explicitly.
 */
export function middleware(request: NextRequest): NextResponse {
  const pathname = request.nextUrl.pathname
  let routePath = pathname
  let response: NextResponse

  if (pathname === '/') {
    const resolution = resolveLocale({
      persistedLocale: request.cookies.get('mw_locale')?.value,
      acceptLanguage: request.headers.get('accept-language'),
    })
    if ('status' in resolution) return withSecurity(new NextResponse('Not Found', { status: 404 }), pathname)
    const destination = request.nextUrl.clone()
    destination.pathname = `/${resolution.locale}`
    response = NextResponse.redirect(destination, 307)
    response.headers.set('Vary', 'Accept-Language')
    if (request.cookies.has('mw_locale')) {
      response.headers.set('Cache-Control', 'private, no-store')
      response.headers.append('Vary', 'Cookie')
    }
    routePath = '/'
  } else {
    const localeSegment = /^\/([A-Za-z]{2}(?:-[A-Za-z0-9]{2,8})*)(?=\/|$)/.exec(pathname)?.[1]
    if (localeSegment !== undefined) {
      if (!isLocale(localeSegment)) return withSecurity(new NextResponse('Not Found', { status: 404 }), pathname)

      const remainder = pathname.slice(localeSegment.length + 1) || '/'
      // API endpoints have one stable, unprefixed machine contract.
      if (remainder === '/api' || remainder.startsWith('/api/')) {
        return withSecurity(new NextResponse('Not Found', { status: 404 }), pathname)
      }

      const destination = request.nextUrl.clone()
      destination.pathname = remainder
      routePath = remainder
      const forwardedHeaders = new Headers(request.headers)
      // Overwrite any client-supplied value before forwarding trusted route context.
      forwardedHeaders.set(DOCK_LOCALE_HEADER, localeSegment)
      response = NextResponse.rewrite(destination, { request: { headers: forwardedHeaders } })
    } else {
      response = NextResponse.next()
    }
  }

  return withSecurity(response, routePath)
}

function withSecurity(response: NextResponse, routePath: string): NextResponse {
  const allowList = embedOrigins(process.env)
  const framing = EMBED_PATH.test(routePath) && allowList.length > 0 ? allowList : ["'none'"]

  // `next dev` compiles client modules with eval (React Refresh); a release build has
  // no such call sites, so the strict policy stays the shipped one.
  for (const header of securityHeaders(framing, { dev: process.env.NODE_ENV !== 'production' })) {
    response.headers.set(header.key, header.value)
  }
  return response
}

export const config = {
  // Framework traffic is excluded, not just static files: matching `_next/hmr`
  // intercepts the dev websocket upgrade, and the client tree then never hydrates
  // (the page renders, no button works). `_next/*` responses carry no HTML, so they
  // have no use for a document policy either.
  matcher: ['/((?!_next/|favicon.ico|icon.svg|manifest.webmanifest).*)'],
}
