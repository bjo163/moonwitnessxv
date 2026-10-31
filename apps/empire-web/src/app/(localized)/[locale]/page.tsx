import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { StoryHomePage } from '@moonwitness/moonui'
import { SiteHeader } from '@moonwitness/moonui/client'
import { homeCardArtwork, homeCopy, homeHeroArtwork } from '../../../lib/home-copy'
import { siteFooterCopy, siteHeaderProps } from '../../../lib/site-copy'
import { isLocale, routeMetadata } from '../../../lib/seo'

const local = (locale: string, path: string) => `/${locale}${path === '' ? '' : path}`

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return isLocale(locale) ? routeMetadata(locale, '') : {}
}

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (locale !== 'id' && locale !== 'en') notFound()
  return (
    <StoryHomePage
      copy={homeCopy[locale]}
      heroArtwork={homeHeroArtwork}
      cardArtwork={homeCardArtwork}
      footer={siteFooterCopy(locale)}
      header={<SiteHeader {...siteHeaderProps(locale, 'home')} />}
      hrefFor={(path) => local(locale, path)}
      worldsLabel={locale === 'id' ? 'Dunia cerita' : 'Story worlds'}
    />
  )
}
