import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CodexPage } from '../../../../components/story/CodexPage'
import { isLocale, routeMetadata } from '../../../../lib/seo'

export const dynamicParams = false
export function generateStaticParams() { return [{ locale: 'id' }, { locale: 'en' }] }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return isLocale(locale) ? routeMetadata(locale, '/characters') : {}
}
export default async function CharactersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (locale !== 'id' && locale !== 'en') notFound()
  return <CodexPage locale={locale} />
}
