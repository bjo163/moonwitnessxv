import { notFound } from 'next/navigation'
import { Landing } from '../../../components/Landing'
export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (locale !== 'id' && locale !== 'en') notFound()
  return <Landing locale={locale} />
}
