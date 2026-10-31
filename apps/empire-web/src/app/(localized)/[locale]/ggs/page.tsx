import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { StoryGgsPage } from '@moonwitness/moonui'
import { SiteHeader } from '@moonwitness/moonui/client'
import { ggsViewProps } from '../../../../components/story/GgsPage'
import { siteHeaderProps } from '../../../../lib/site-copy'
import { isLocale, routeMetadata } from '../../../../lib/seo'

export const dynamicParams = false
export function generateStaticParams() { return [{ locale: 'id' }, { locale: 'en' }] }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return isLocale(locale) ? routeMetadata(locale, '/ggs') : {}
}
export default async function GgsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (locale !== 'id' && locale !== 'en') notFound()
  // ADR-0017: the page body is MoonUI's; the route composes the shared chrome and
  // passes the localized props, so no application copy of this anatomy exists.
  return (
    <StoryGgsPage
      {...ggsViewProps(locale)}
      header={<SiteHeader {...siteHeaderProps(locale, 'ggs')} />}
    />
  )
}
