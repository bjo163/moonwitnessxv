import { IconBookOpen, IconCrosshair, IconEye, IconMoon, IconSparkles } from '@moonwitness/moonui'
import { codexCopy } from '../../lib/codex-copy'
import type { StoryLocale } from '../../lib/story-universe'
import { SiteFooter } from '../site/SiteFooter'
import { PageActions } from './PageActions'
import { SiteHeader } from '../site/SiteHeader'

const local = (locale: StoryLocale, path: string) => `/${locale}${path === '/' ? '' : path}`
const traitIcons = [IconCrosshair, IconMoon, IconSparkles, IconEye, IconBookOpen, IconMoon]

/**
 * REF-04 — hero 343, featured 297 (x 19–1103), six-column trait grid 205
 * (19/197/381/553/732/906), relations 305 (cards 19–462, map 462–1103).
 */
export function CodexPage({ locale }: { locale: StoryLocale }) {
  const copy = codexCopy[locale]
  return <div className="su-shell su-codex-page">
    <SiteHeader locale={locale} active="characters" />
    <main id="su-main" tabIndex={-1}>
      <section className="su-codex__hero">
        <img className="su-codex__hero-art" src="/story-universe/codex-guardian.webp" alt="" aria-hidden="true" width={1200} height={675} fetchPriority="high" decoding="async" />
        <div className="su-codex__shade" aria-hidden="true" />
        <div className="su-codex__hero-copy">
          <p className="su-eyebrow su-codex__eyebrow">{copy.heroEyebrow}</p>
          <h1 className="su-codex__title"><span>{copy.heroTitle[0]}</span><span className="su-codex__title-red">{copy.heroTitle[1]}</span></h1>
          <p className="su-codex__lead">{copy.heroLead}</p>
          <p className="su-codex__body">{copy.heroBody}</p>
          <PageActions
            className="su-codex__actions"
            primary={{ href: local(locale, '/characters'), label: copy.heroCta }}
            secondary={{ href: local(locale, '/stories'), label: copy.heroSecondary }}
          />
        </div>
        <p className="su-codex__side">{copy.side}</p>
        <p className="su-codex__script">{copy.script}</p>
      </section>

      <section className="su-codex__featured">
        <img className="su-codex__featured-art" src="/story-universe/reader-poster.webp" alt="" aria-hidden="true" width={1024} height={1536} loading="lazy" decoding="async" />
        <div className="su-codex__shade" aria-hidden="true" />
        <div className="su-codex__featured-copy">
          <p className="su-eyebrow su-codex__eyebrow">{copy.featuredEyebrow}</p>
          <h2 className="su-codex__featured-title"><span>{copy.featuredTitle[0]}</span> <span className="su-codex__title-red">{copy.featuredTitle[1]}</span></h2>
          <p className="su-codex__featured-lead">{copy.featuredLead}</p>
          <p className="su-codex__body">{copy.featuredBody}</p>
          <PageActions
            className="su-codex__actions"
            size="sm"
            primary={{ href: local(locale, '/characters'), label: copy.featuredCta }}
            secondary={{ href: local(locale, '/stories/angelwithshotgun'), label: copy.featuredSecondary }}
          />
        </div>
        <p className="su-codex__featured-side">{copy.featuredSide}</p>
      </section>

      <section className="su-codex__traits" aria-label={locale === 'id' ? 'Enam aspek karakter' : 'Six character dimensions'}>
        {copy.traits.map((trait, index) => {
          const Icon = traitIcons[index]
          return <article key={trait.title}>
            <span className="su-codex__trait-icon" aria-hidden="true"><Icon size={20} strokeWidth={1.2} /></span>
            <h3>{trait.title}</h3>
            <p className="su-codex__trait-sub">{trait.sub}</p>
            <p className="su-codex__trait-body">{trait.body}</p>
          </article>
        })}
      </section>

      <section className="su-codex__relations">
        <div className="su-codex__related">
          <p className="su-eyebrow su-codex__eyebrow">{copy.relatedTitle}</p>
          <div className="su-codex__related-cards">
            {copy.related.map((character) => <article key={character.name}>
              <img src={character.art} alt="" aria-hidden="true" width={560} height={640} loading="lazy" decoding="async" />
              <div className="su-codex__related-shade" aria-hidden="true" />
              <div className="su-codex__related-copy">
                <h3>{character.name}</h3>
                <p className="su-codex__related-sub">{character.sub}</p>
                <p>{character.body}</p>
                <a href={local(locale, '/characters')}>{character.cta} <span aria-hidden="true">→</span></a>
              </div>
            </article>)}
          </div>
        </div>

        <div className="su-codex__map">
          <p className="su-eyebrow su-codex__eyebrow">{copy.mapTitle}</p>
          <div className="su-codex__diagram">
            <div className="su-codex__node su-codex__node--left">
              <span className="su-codex__node-orb" style={{ backgroundImage: `url("${copy.mapNodes[0].art}")` }} aria-hidden="true" />
              <b>{copy.mapNodes[0].name}</b>
              {copy.mapNodes[0].lines.map((line) => <small key={line}>{line}</small>)}
            </div>
            <span className="su-codex__link su-codex__link--left" aria-hidden="true"><em>{copy.mapLabelLeft[0]}<br />{copy.mapLabelLeft[1]}</em></span>
            <div className="su-codex__node su-codex__node--center">
              <span className="su-codex__node-orb" style={{ backgroundImage: `url("${copy.mapNodes[1].art}")` }} aria-hidden="true" />
              <b>{copy.mapNodes[1].name}</b>
              {copy.mapNodes[1].lines.map((line) => <small key={line}>{line}</small>)}
            </div>
            <span className="su-codex__link su-codex__link--right" aria-hidden="true"><em>{copy.mapLabelRight[0]}<br />{copy.mapLabelRight[1]}</em></span>
            <div className="su-codex__node su-codex__node--right">
              <span className="su-codex__node-orb" style={{ backgroundImage: `url("${copy.mapNodes[2].art}")` }} aria-hidden="true" />
              <b>{copy.mapNodes[2].name}</b>
              {copy.mapNodes[2].lines.map((line) => <small key={line}>{line}</small>)}
            </div>
          </div>
          <div className="su-codex__map-foot">
            {copy.mapFoot.map(([title, caption]) => <div key={title}><span aria-hidden="true">◇</span><b>{title}</b><small>{caption}</small></div>)}
          </div>
        </div>
      </section>
    </main>
    <SiteFooter locale={locale} />
  </div>
}
