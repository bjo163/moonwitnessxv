import { NextResponse, type NextRequest } from 'next/server'
import { EMBED_PATH, embedOrigins, securityHeaders } from '../../../scripts/security-headers.mjs'

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

  for (const header of securityHeaders(framing)) response.headers.set(header.key, header.value)
  return response
}

export const config = {
  // static files do not need a policy attached, and matching them costs a worker
  // invocation per asset request
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg).*)'],
}
