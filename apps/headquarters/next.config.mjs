// @ts-check
import { loadRootEnv, SECURITY_HEADERS } from '../../scripts/next-config-shared.mjs'

/**
 * One `.env` for the whole monorepo (the same file apps/radio reads); the loader
 * and header set are shared with apps/dock so neither app can drift ahead.
 * Plain .mjs on purpose: production containers install without TypeScript,
 * and `node --env-file` is rejected by Next's build workers via NODE_OPTIONS.
 * In the images there is no .env to read — compose provides the environment.
 */
loadRootEnv(process.cwd())

/** @type {import('next').NextConfig} */
const config = {
  // both workspace libraries ship ESM from dist/ — let Next compile them
  transpilePackages: ['@moonwitness/moonui', '@moonwitness/moonql-client'],
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }]
  },
}

export default config
