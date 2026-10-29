import type { MetadataRoute } from 'next'

// Required for Next.js output: 'export'; preview remains disallowed to crawlers.
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: '*', disallow: '/' }] }
}
