import { IconBookOpen, IconCompass, IconCrosshair, IconSparkles } from '@moonwitness/moonui'
import { homeCardArtwork, homeCopy, homeHeroArtwork } from '../../lib/home-copy'
import type { StoryLocale } from '../../lib/story-universe'
import { SiteFooter } from '../site/SiteFooter'
import { SiteHeader } from '../site/SiteHeader'

const local = (locale: StoryLocale, path: string) => `/${locale}${path === '' ? '' : path}`

const cardLinks = ['/stories', '/stories/angelwithshotgun', '/ggs', '/stories']
const cardIcons = [IconBookOpen, IconCrosshair, IconSparkles, IconCompass]

function CompassionMark() {
  return <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21c-2-4.6-8-7.6-8-12.2A4.3 4.3 0 0 1 12 6a4.3 4.3 0 0 1 8 2.8C20 13.4 14 16.4 12 21Z" /><path d="M12 8v9" /></svg>
}
function ActionMark() {
  return <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m2 19 7-9 3.5 4.5L16 6l6 13H2Z" /><path d="M2 22h20" /></svg>
}
function UnityMark() {
  return <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><circle cx="8.6" cy="9" r="5.2" /><circle cx="15.4" cy="9" r="5.2" /><circle cx="12" cy="15" r="5.2" /></svg>
}

/** REF-01 — hero at 473px, four 259px cards, 222px foundation band, 72+88+56 chrome. */
export function HomePage({ locale }: { locale: StoryLocale }) {
  const copy = homeCopy[locale]
  const marks = [<IconCrosshair key="truth" size={26} />, <CompassionMark key="compassion" />, <ActionMark key="action" />, <UnityMark key="unity" />]
  return <div className="su-shell">
    <SiteHeader locale={locale} active="home" />
    <main id="su-main" tabIndex={-1}>
      <section className="su-home__hero">
        <img className="su-home__hero-art" src={homeHeroArtwork} alt="" aria-hidden="true" width={1200} height={675} fetchPriority="high" decoding="async" />
        <div className="su-home__hero-shade" aria-hidden="true" />
        <div className="su-home__copy">
          <p className="su-eyebrow su-home__eyebrow">{copy.eyebrow}</p>
          <h1 className="su-home__title">
            <span>{copy.heroLines[0]}</span>
            <span>{copy.heroLines[1]}</span>
            <span className="su-home__title-red">{copy.heroLines[2]}</span>
            <span className="su-home__title-red">{copy.heroLines[3]}</span>
          </h1>
          <p className="su-home__intro">{copy.intro}</p>
          <div className="su-home__actions">
            <a className="su-btn su-btn--primary" href={local(locale, '/stories')}><span aria-hidden="true">↘</span>{copy.primaryCta}</a>
            <a className="su-btn su-btn--ghost" href={local(locale, '/values')}><IconBookOpen size={15} />{copy.secondaryCta}</a>
          </div>
        </div>
        <p className="su-home__side">{copy.side}</p>
        <p className="su-home__script">{copy.script}</p>
        <div className="su-home__stats">
          {copy.stats.map((stat) => <div key={stat.label}><b>{stat.value}</b><span>{stat.label}</span></div>)}
        </div>
      </section>

      <section className="su-home__worlds" aria-label={locale === 'id' ? 'Dunia cerita' : 'Story worlds'}>
        {copy.cards.map((card, index) => {
          const Icon = cardIcons[index]
          return <article className="su-home__card" key={card.index}>
            <img className="su-home__card-art" src={homeCardArtwork[index]} alt="" aria-hidden="true" width={560} height={900} loading="lazy" decoding="async" />
            <div className="su-home__card-shade" aria-hidden="true" />
            <p className="su-home__card-index"><span>{card.index}</span><span>{card.eyebrow}</span></p>
            <div className="su-home__card-body">
              <h2>{card.title}</h2>
              <p className="su-home__card-tagline">{card.tagline}</p>
              <p className="su-home__card-text">{card.body}</p>
            </div>
            <a className="su-home__card-cta" href={local(locale, cardLinks[index])}>
              <span>{card.cta} <span aria-hidden="true">→</span></span>
              <Icon size={26} strokeWidth={1.1} aria-hidden="true" />
            </a>
          </article>
        })}
      </section>

      <section className="su-home__foundation">
        <div className="su-home__foundation-head">
          <p className="su-eyebrow">{copy.foundationEyebrow}</p>
          <h2>{copy.foundationTitle[0]}<br />{copy.foundationTitle[1]}</h2>
          <span className="su-home__dash" aria-hidden="true" />
        </div>
        {copy.principles.map((principle, index) => <article className="su-home__principle" key={principle.title}>
          <span className="su-home__principle-icon" aria-hidden="true">{marks[index]}</span>
          <h3>{principle.title}</h3>
          <p>{principle.body}</p>
        </article>)}
      </section>
    </main>
    <SiteFooter locale={locale} />
  </div>
}
