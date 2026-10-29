import { notFound } from 'next/navigation'
import { StoryReader } from '../../../../../components/StoryUniverse'

export const dynamicParams = false
export function generateStaticParams() { return [{ locale: 'id' }, { locale: 'en' }] }
export default async function AngelStoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (locale !== 'id' && locale !== 'en') notFound()
  return <StoryReader locale={locale} />
}
