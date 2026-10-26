import { NextResponse, type NextRequest } from 'next/server.js'
// The framing rules come from @moonwitness/core by name — the same owner the hub and
// both Next configs use. `core` is linted to stay free of Node built-ins precisely so
// this edge entry point can import it.
import { EMBED_PATH, embedOrigins, isLocale, resolveLocale, securityHeaders } from '@moonwitness/core'
import { DOCK_LOCALE_HEADER, DOCK_ROUTE_PATH_HEADER, DOCK_ROUTE_SEARCH_HEADER } from './lib/locale-context.mjs'

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

  if (isLocalizedRewrite(request, pathname)) {
    // `/id/*` and `/en/*` rewrite to internal destinations (`/`, `/terms`, etc.).
    // Next runs middleware again for the internal destination, so serve it directly
    // to preserve forwarded locale headers and prevent redirect loops.
    response = NextResponse.next()
  } else if (pathname === '/') {
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
      const forwardedHeaders = pageRequestHeaders(request, pathname, localeSegment)
      response = NextResponse.rewrite(destination, { request: { headers: forwardedHeaders } })
    } else {
      if (pathname === '/api' || pathname.startsWith('/api/')) {
        response = NextResponse.next()
      } else {
        const resolution = resolveLocale({
          persistedLocale: request.cookies.get('mw_locale')?.value,
          acceptLanguage: request.headers.get('accept-language'),
        })
        const locale = 'status' in resolution ? 'en' : resolution.locale
        response = NextResponse.next({
          request: { headers: pageRequestHeaders(request, pathname, locale) },
        })
        response.headers.set('Vary', 'Accept-Language')
        if (request.cookies.has('mw_locale')) {
          response.headers.set('Cache-Control', 'private, no-store')
          response.headers.append('Vary', 'Cookie')
        }
      }
    }
  }

  return withSecurity(response, routePath)
}

function isLocalizedRewrite(request: NextRequest, pathname: string): boolean {
  if (pathname === '/api' || pathname.startsWith('/api/')) return false
  const locale = request.headers.get(DOCK_LOCALE_HEADER)
  const sourcePath = request.headers.get(DOCK_ROUTE_PATH_HEADER)
  const sourceSearch = request.headers.get(DOCK_ROUTE_SEARCH_HEADER)
  if (!isLocale(locale) || sourceSearch !== request.nextUrl.search || !sourcePath) return false

  if (pathname === '/') {
    return sourcePath === `/${locale}` || sourcePath === `/${locale}/`
  }
  return sourcePath === `/${locale}${pathname}`
}

function pageRequestHeaders(request: NextRequest, pathname: string, locale: string): Headers {
  const forwardedHeaders = new Headers(request.headers)
  // Always overwrite the client-controlled locale and route metadata before RSC reads it.
  forwardedHeaders.set(DOCK_LOCALE_HEADER, locale)
  forwardedHeaders.set(DOCK_ROUTE_PATH_HEADER, pathname)
  forwardedHeaders.set(DOCK_ROUTE_SEARCH_HEADER, request.nextUrl.search)
  return forwardedHeaders
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
