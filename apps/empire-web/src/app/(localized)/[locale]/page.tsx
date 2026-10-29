import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { StoryHome } from '../../../components/StoryUniverse'
import { isLocale, routeMetadata } from '../../../lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return isLocale(locale) ? routeMetadata(locale, '') : {}
}
export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (locale !== 'id' && locale !== 'en') notFound()
  return <StoryHome locale={locale} />
}
