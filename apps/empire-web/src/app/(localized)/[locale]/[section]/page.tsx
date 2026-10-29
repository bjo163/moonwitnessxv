import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { pageCopy, sections, type Section } from '../../../../lib/pages'
import { content, spaceEvidence } from '../../../../lib/copy'
import type { Locale } from '../../../../lib/copy'

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
      <a className="emp-logo" href={`/${locale}`}><span className="m-brand">A-L-L-A-H.COM</span></a>
      <a className="emp-lang" href={`/${other}/${section}`} hrefLang={other}
        aria-label={locale === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}>{other.toUpperCase()}</a>
    </header>
    <main id="content" tabIndex={-1} className="emp-information">
      <p className="emp-eyebrow">{t.preview}</p>
      <h1>{page.title}</h1><p className="emp-intro">{page.summary}</p>
      {page.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      {section === 'ecosystem' ? <div className="emp-atlas">
        {content[locale].spaces.map(space => <article key={space.id} className="m-card">
          <h2>{space.name}</h2><p>{space.description}</p>
          <dl>
            <dt>{locale === 'id' ? 'Implementasi' : 'Implementation'}</dt><dd>{space.status}</dd>
            <dt>{locale === 'id' ? 'Akses publik' : 'Public access'}</dt><dd>{locale === 'id' ? 'Belum terverifikasi' : 'Not verified'}</dd>
            <dt>{locale === 'id' ? 'Ruang lingkup' : 'Scope'}</dt><dd>{space.caption}</dd>
            <dt>{locale === 'id' ? 'Audiens' : 'Audience'}</dt><dd>{locale === 'id' ? 'Publik / direncanakan' : 'Public / planned'}</dd>
            <dt>{locale === 'id' ? 'Penanggung jawab rancangan' : 'Design owner'}</dt><dd>{spaceEvidence[space.id]?.owner}</dd>
            <dt>{locale === 'id' ? 'Rujukan kode / rencana' : 'Code / planning reference'}</dt>
            <dd><a href={`https://github.com/bjo163/moonwitnessxv/blob/7ea2a01dc6fb6313ecbce8aa5562d45f6768abe2/${spaceEvidence[space.id]?.sourceRef}`}>{spaceEvidence[space.id]?.sourceRef}</a></dd>
            <dt>{locale === 'id' ? 'Tinjauan sumber' : 'Source reviewed'}</dt><dd><time dateTime={spaceEvidence[space.id]?.reviewedAt}>{spaceEvidence[space.id]?.reviewedAt}</time></dd>
          </dl>
        </article>)}
      </div> : null}
      {section === 'sources' ? <ul className="emp-source-links">
        <li><a href="https://github.com/bjo163/moonwitnessxv/blob/7ea2a01dc6fb6313ecbce8aa5562d45f6768abe2/docs/product/A-L-L-A-H-COM-MASTER-SPEC.md">{locale === 'id' ? 'Spesifikasi produk — usulan, bukan bukti rilis' : 'Product specification — proposal, not release evidence'}</a></li>
        <li><a href="https://github.com/bjo163/moonwitnessxv/blob/7ea2a01dc6fb6313ecbce8aa5562d45f6768abe2/docs/decisions/ADR-0011-lighthouse-dock-runtime.md">{locale === 'id' ? 'Keputusan runtime LIGHTHOUSE / Dock' : 'LIGHTHOUSE / Dock runtime decision'}</a></li>
      </ul> : null}
      <a className="m-btn" data-variant="accent" data-size="lg" href={`/${locale}`}>{t.home}</a>
    </main>
    <footer className="emp-footer">
      <nav className="emp-info-links" aria-label={t.navigation}>
        {sections.map(item => <a key={item} href={`/${locale}/${item}`} aria-current={item === section ? 'page' : undefined}>{t[item].title}</a>)}
      </nav>
    </footer>
  </div>
}
