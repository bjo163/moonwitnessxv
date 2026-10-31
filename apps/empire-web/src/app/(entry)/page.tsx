import type { Metadata } from 'next'
import { LandingPage } from '@moonwitness/moonui'
import { SiteHeader } from '@moonwitness/moonui/client'
import { landingProps } from '../../components/Landing'
import { siteHeaderProps } from '../../lib/site-copy'
import { SITE_ORIGIN } from '../../lib/seo'

export const metadata: Metadata = { alternates: { canonical: `${SITE_ORIGIN}/` } }

export default function Home() {
  // ADR-0017: the entry anatomy is MoonUI's; this route only picks the locale and
  // composes the shared chrome around the copy the site catalogue publishes.
  return <LandingPage {...landingProps('en')} header={<SiteHeader {...siteHeaderProps('en', 'home')} />} />
}
