import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteHeader, StoryReaderPage } from '@moonwitness/moonui/client'
import { readerViewProps } from '../../../../../components/story/ReaderPage'
import { siteHeaderProps } from '../../../../../lib/site-copy'
import { isLocale, routeMetadata } from '../../../../../lib/seo'

export const dynamicParams = false
export function generateStaticParams() { return [{ locale: 'id' }, { locale: 'en' }] }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return isLocale(locale) ? routeMetadata(locale, '/stories/angelwithshotgun') : {}
}
export default async function AngelStoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (locale !== 'id' && locale !== 'en') notFound()
  return (
    <StoryReaderPage
      {...readerViewProps(locale)}
      header={<SiteHeader {...siteHeaderProps(locale, 'stories')} />}
    />
  )
}
