import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { GgsPage as FullMoonSchoolPage } from '../../../../components/story/GgsPage'
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
  return <FullMoonSchoolPage locale={locale} />
}
