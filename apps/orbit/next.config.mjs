// @ts-check
import { loadRootEnv, NON_FRAMING_HEADERS } from '@moonwitness/web-config'

/**
 * ORBIT — Spatial Agent Operations Next.js Configuration.
 *
 * Uses the shared monorepo web-config rules for security headers
 * and centralized root environment variable loading.
 * No local database or backend logic is instantiated in ORBIT.
 */
loadRootEnv(process.cwd())

/** @type {import('next').NextConfig} */
const config = {
  transpilePackages: ['@moonwitness/moonui'],
  poweredByHeader: false,
  allowedDevOrigins: ['127.0.0.1', 'localhost', '127.0.0.1:3007', 'localhost:3007'],
  async headers() {
    return [{ source: '/:path*', headers: NON_FRAMING_HEADERS }]
  },
}

export default config
