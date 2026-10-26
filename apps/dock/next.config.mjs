// @ts-check
import { loadRootEnv, NON_FRAMING_HEADERS } from '../../scripts/next-config-shared.mjs'

/**
 * One `.env` for the whole monorepo; the loader and the header vocabulary are shared
 * with apps/headquarters so the two configs cannot drift.
 * Plain .mjs on purpose: production containers install without TypeScript,
 * and `node --env-file` is rejected by Next's build workers via NODE_OPTIONS.
 * In the images there is no .env to read — compose provides the environment.
 *
 * Framing is deliberately absent here: `src/middleware.ts` sets the CSP and
 * X-Frame-Options per path, because `/embed/*` is allow-listed while everything
 * else stays unframeable — and two CSP headers on one response would be enforced
 * as the stricter of the two.
 */
loadRootEnv(process.cwd())

/** @type {import('next').NextConfig} */
const config = {
  transpilePackages: ['@moonwitness/moonui', '@moonwitness/moonql-client'],
  poweredByHeader: false,
  // `next dev` treats `localhost` as its own origin and refuses framework
  // resources (`/_next/hmr`, the dev font) to any other host — which leaves the
  // page looking rendered but never hydrated. Both the documented URLs and the
  // smoke checks address the stack as 127.0.0.1, so that host has to be named.
  // Ignored by `next build`/`next start`; it opens nothing in production.
  allowedDevOrigins: ['127.0.0.1'],
  async headers() {
    return [{ source: '/:path*', headers: NON_FRAMING_HEADERS }]
  },
}

export default config
