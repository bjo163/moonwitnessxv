import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import '@moonwitness/moonui/moon.css'
import '../../globals.css'

export const dynamicParams = false
export function generateStaticParams() { return [{ locale: 'id' }, { locale: 'en' }] }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return {
    title: { default: 'A-L-L-A-H.COM | Empire of the Light', template: '%s | A-L-L-A-H.COM' },
    description: locale === 'id'
      ? 'Gerbang pengetahuan, cerita, karya bermanfaat, dan tindakan yang bertanggung jawab. Dikelola manusia.'
      : 'A human-governed gateway for knowledge, stories, meaningful work, and responsible action.',
    applicationName: 'A-L-L-A-H.COM — Empire Gateway',
    robots: { index: false, follow: false },
  }
}
export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (locale !== 'id' && locale !== 'en') notFound()
  return <html lang={locale} data-skin="empire"><body className="emp-body">{children}</body></html>
}
