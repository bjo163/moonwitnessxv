import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { pageCopy, sections, type Section } from '../../../lib/pages'
import type { Locale } from '../../../lib/copy'

type Params = { locale: string; section: string }
export const dynamicParams = false
export function generateStaticParams() {
  return (['id', 'en'] as const).flatMap(locale => sections.map(section => ({ locale, section })))
}
function resolve(params: Params): { locale: Locale; section: Section } {
  if (params.locale !== 'id' && params.locale !== 'en') notFound()
  if (!sections.some(section => section === params.section)) notFound()
  return { locale: params.locale, section: params.section as Section }
}
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, section } = resolve(await params)
  const page = pageCopy[locale][section]
  return { title: page.title, description: page.summary, robots: { index: false, follow: false } }
}
export default async function InformationPage({ params }: { params: Promise<Params> }) {
  const { locale, section } = resolve(await params)
  const t = pageCopy[locale]
  const page = t[section]
  const other = locale === 'id' ? 'en' : 'id'
  return <div className="emp-shell" lang={locale}>
    <a className="emp-skip" href="#content">{t.skip}</a>
    <header className="emp-header">
      <a className="emp-logo" href={`/${locale}`}>A-L-L-A-H.COM</a>
      <a className="emp-lang" href={`/${other}/${section}`} hrefLang={other}
        aria-label={locale === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}>{other.toUpperCase()}</a>
    </header>
    <main id="content" tabIndex={-1} className="emp-information">
      <p className="emp-eyebrow">{t.preview}</p>
      <h1>{page.title}</h1><p className="emp-intro">{page.summary}</p>
      {page.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      <a className="emp-button" href={`/${locale}`}>{t.home}</a>
    </main>
    <footer className="emp-footer">
      <nav className="emp-info-links" aria-label={t.navigation}>
        {sections.map(item => <a key={item} href={`/${locale}/${item}`} aria-current={item === section ? 'page' : undefined}>{t[item].title}</a>)}
      </nav>
    </footer>
  </div>
}
