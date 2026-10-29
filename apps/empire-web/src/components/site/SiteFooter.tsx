import { IconMoon } from '@moonwitness/moonui'
import { text, type StoryLocale } from '../../lib/story-universe'

const local = (locale: StoryLocale, path: string) => `/${locale}${path === '/' ? '' : path}`

/**
 * The single site footer (M45-04): 88px main band plus a 56px bottom bar.
 * The draft disclosure (`su-preview`) lives in the bottom bar — the exported
 * contract asserts its presence, and the mockup has no room for a top strip.
 */
export function SiteFooter({ locale }: { locale: StoryLocale }) {
  const links = locale === 'id'
    ? [['stories', 'Cerita'], ['characters', 'Karakter'], ['about', 'Pengetahuan'], ['roadmap', 'Linimasa'], ['ecosystem', 'Ekosistem'], ['about', 'Tentang']]
    : [['stories', 'Stories'], ['characters', 'Characters'], ['about', 'Knowledge'], ['roadmap', 'Timeline'], ['ecosystem', 'Ecosystem'], ['about', 'About']]
  return <footer className="su-footer">
    <div className="su-footer__main">
      <a className="su-brand su-brand--footer" href={local(locale, '/')}>
        <IconMoon className="su-brand__moon" size={30} strokeWidth={1.4} />
        <span className="su-brand__text"><b>A-L-L-A-H.COM</b><small>EMPIRE OF THE LIGHT</small></span>
      </a>
      <nav className="su-footer__nav" aria-label={locale === 'id' ? 'Navigasi kaki halaman' : 'Footer navigation'}>
        {links.map(([path, label], index) => <a key={`${path}-${index}`} href={local(locale, `/${path}`)}>{label}</a>)}
      </nav>
      <div className="su-footer__aside">
        <p className="su-footer__quote">“{locale === 'id' ? 'Kemanusiaan yang lebih cerah adalah cerita yang kita bangun bersama.' : 'A brighter humanity is a story we build together.'}”</p>
        <p className="su-preview su-footer__preview" role="note">{text[locale].preview}</p>
      </div>
    </div>
    <div className="su-footer__bar">
      <span className="su-footer__meta">{locale === 'id' ? 'SEMESTA MOONWITNESS XV' : 'MOONWITNESS XV UNIVERSE'}</span>
      <span aria-hidden="true">|</span>
      <span className="su-footer__meta">A-L-L-A-H.COM</span>
      <span aria-hidden="true">|</span>
      <span className="su-footer__meta">{locale === 'id' ? 'SEJAK 2025' : 'EST. 2025'}</span>
      <span className="su-footer__legal">
        <a href={local(locale, '/values')}>{locale === 'id' ? 'Nilai' : 'Values'}</a>
        <a href={local(locale, '/sources')}>{locale === 'id' ? 'Sumber' : 'Sources'}</a>
        <a href={local(locale, '/privacy')}>{locale === 'id' ? 'Privasi' : 'Privacy'}</a>
      </span>
      <span className="su-footer__meta su-footer__meta--end">{locale === 'id' ? 'BANGSA BERBEDA' : 'DIFFERENT PEOPLES'}</span>
      <span aria-hidden="true">|</span>
      <span className="su-footer__meta">{locale === 'id' ? 'BULAN SAMA' : 'SAME MOON'}</span>
      <span aria-hidden="true">|</span>
      <span className="su-footer__meta">{locale === 'id' ? 'KEMANUSIAAN LEBIH BESAR' : 'BIGGER HUMANITY'}</span>
    </div>
  </footer>
}
