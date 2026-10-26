import { NextResponse, type NextRequest } from 'next/server'
// The framing rules come from @moonwitness/core by name — the same owner the hub and
// both Next configs use. `core` is linted to stay free of Node built-ins precisely so
// this edge entry point can import it.
import { EMBED_PATH, embedOrigins, securityHeaders } from '@moonwitness/core'

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
  const response = NextResponse.next()
  const allowList = embedOrigins(process.env)
  const framing = EMBED_PATH.test(request.nextUrl.pathname) && allowList.length > 0 ? allowList : ["'none'"]

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
