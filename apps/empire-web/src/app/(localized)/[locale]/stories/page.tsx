import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { StoryLibraryPage } from '@moonwitness/moonui/client'
import { SiteHeader } from '@moonwitness/moonui/client'
import { libraryViewProps } from '../../../../components/story/LibraryPage'
import { siteHeaderProps } from '../../../../lib/site-copy'
import { isLocale, routeMetadata } from '../../../../lib/seo'

export const dynamicParams = false
export function generateStaticParams() { return [{ locale: 'id' }, { locale: 'en' }] }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return isLocale(locale) ? routeMetadata(locale, '/stories') : {}
}
export default async function StoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (locale !== 'id' && locale !== 'en') notFound()
  return (
    <StoryLibraryPage
      {...libraryViewProps(locale)}
      header={<SiteHeader {...siteHeaderProps(locale, 'stories')} />}
    />
  )
}
