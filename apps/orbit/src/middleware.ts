import { NextResponse, type NextRequest } from 'next/server.js'
import { isLocale } from '@moonwitness/core'
import { ORBIT_LOCALE_HEADER } from './lib/orbit-locale-header.ts'

/**
 * Forward a validated `?locale=` to the server render.
 *
 * The header is rewritten on every request, so a client that sends its own
 * `x-orbit-locale` cannot steer the document language: an absent, malformed or
 * unsupported query value clears it and the normal cookie / Accept-Language
 * precedence stays in charge.
 */
export function middleware(request: NextRequest): NextResponse {
  const headers = new Headers(request.headers)
  const requested = request.nextUrl.searchParams.get('locale')
  headers.set(ORBIT_LOCALE_HEADER, requested !== null && isLocale(requested) ? requested : '')
  return NextResponse.next({ request: { headers } })
}

export const config = {
  // The BFF route answers JSON for the browser and has no document language;
  // framework traffic carries no HTML.
  matcher: ['/((?!_next/|api/|favicon.ico).*)'],
}
