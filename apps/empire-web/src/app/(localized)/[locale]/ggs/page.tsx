import { notFound } from 'next/navigation'
import { FullMoonSchool } from '../../../../components/StoryUniverse'

export const dynamicParams = false
export function generateStaticParams() { return [{ locale: 'id' }, { locale: 'en' }] }
export default async function GgsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (locale !== 'id' && locale !== 'en') notFound()
  return <FullMoonSchool locale={locale} />
}
