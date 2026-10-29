import { notFound } from 'next/navigation'
import { StoryHome } from '../../../components/StoryUniverse'
export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (locale !== 'id' && locale !== 'en') notFound()
  return <StoryHome locale={locale} />
}
