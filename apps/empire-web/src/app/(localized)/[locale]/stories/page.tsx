import { notFound } from 'next/navigation'
import { StoryLibrary } from '../../../../components/StoryUniverse'

export const dynamicParams = false
export function generateStaticParams() { return [{ locale: 'id' }, { locale: 'en' }] }
export default async function StoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (locale !== 'id' && locale !== 'en') notFound()
  return <StoryLibrary locale={locale} />
}
