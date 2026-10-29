/** Isolated static public gateway. Not an ARSY replacement.
 * No auth, API handlers, privileged data, or private environment keys.
 * Proposed preview exception to Lighthouse-inside-Dock architecture.
 */
/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  experimental: { globalNotFound: true },
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ['@moonwitness/moonui'],
}
export default config
