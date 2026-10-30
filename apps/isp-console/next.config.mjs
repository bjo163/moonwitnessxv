// @ts-check
import { loadRootEnv, securityHeaders } from '@moonwitness/web-config'

loadRootEnv(process.cwd())

/** @type {import('next').NextConfig} */
const config = {
  transpilePackages: ['@moonwitness/moonui', '@moonwitness/moonql-client'],
  poweredByHeader: false,
  allowedDevOrigins: ['127.0.0.1', 'localhost', '127.0.0.1:3008', 'localhost:3008'],
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders(["'none'"], { dev: process.env.NODE_ENV !== 'production' }) }]
  },
}

export default config
