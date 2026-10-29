import { IconBookOpen, IconCompass, IconMoon, IconSparkles } from '@moonwitness/moonui'
import { ggsCopy } from '../../lib/ggs-copy'
import type { StoryLocale } from '../../lib/story-universe'
import { StatRow } from './StatRow'
import { PageActions } from './PageActions'
import { SiteFooter } from '../site/SiteFooter'
import { SiteHeader } from '../site/SiteHeader'

const local = (locale: StoryLocale, path: string) => `/${locale}${path === '/' ? '' : path}`
const pathIcons = [IconMoon, IconCompass, IconSparkles, IconBookOpen]

/**
 * REF-05 — hero 414, stat strip 84, lesson/reflection 330 (703px + 359px),
 * three-column lessons/sessions/paths row 327, footer 78+62.
 */
export function GgsPage({ locale }: { locale: StoryLocale }) {
  const copy = ggsCopy[locale]
  return <div className="su-shell su-ggs-page">
    <SiteHeader locale={locale} active="ggs" />
    <main id="su-main" tabIndex={-1}>
      <section className="su-ggs__hero">
        <img className="su-ggs__hero-art" src="/story-universe/moon-academy.webp" alt="" aria-hidden="true" width={1200} height={675} fetchPriority="high" decoding="async" />
        <div className="su-ggs__shade" aria-hidden="true" />
        <div className="su-ggs__hero-copy">
          <p className="su-eyebrow su-ggs__eyebrow">{copy.eyebrow}</p>
          <h1 className="su-ggs__title"><span>{copy.title[0]}</span><span>{copy.title[1]}</span><span className="su-ggs__title-red">{copy.title[2]}</span></h1>
          <p className="su-ggs__lead">{copy.lead}</p>
          <p className="su-ggs__body">{copy.body}</p>
          <PageActions
            className="su-ggs__actions"
            primary={{ href: local(locale, '/ggs'), label: copy.primaryCta }}
            secondary={{ href: local(locale, '/stories'), label: copy.secondaryCta }}
          />
        </div>
        <p className="su-ggs__script">{copy.script}</p>
      </section>

      <StatRow className="su-ggs__stats" items={copy.stats} as="section" />

      <section className="su-ggs__lesson">
        <article className="su-ggs__lesson-main">
          <div className="su-ggs__lesson-art" aria-hidden="true">
            <img src="/story-universe/home-mooncity.webp" alt="" width={1122} height={1402} loading="lazy" decoding="async" />
            <span />
          </div>
          <header>
            <p className="su-eyebrow su-ggs__eyebrow">{copy.lessonEyebrow}</p>
            <span className="su-ggs__live"><i aria-hidden="true" />{copy.live}</span>
          </header>
          <h2>{copy.lessonTitle}</h2>
          <p className="su-ggs__lesson-lead">{copy.lessonLead}</p>
          <p className="su-ggs__lesson-body">{copy.lessonBody}</p>
          <div className="su-ggs__lesson-bottom">
            <ul className="su-ggs__meta">
              {copy.lessonMeta.map((item) => <li key={item.label}><IconMoon size={13} aria-hidden="true" /><span>{item.label}</span><b>{item.value}</b></li>)}
            </ul>
            <div className="su-ggs__lesson-cta">
              <a href={local(locale, '/stories')}>{copy.lessonCta} <span aria-hidden="true">→</span></a>
              <p>{copy.storyTime}</p>
            </div>
          </div>
        </article>
        <article className="su-ggs__reflection">
          <p className="su-eyebrow su-ggs__eyebrow">{copy.reflectionEyebrow}</p>
          <h2>{copy.reflectionTitle[0]}<br />{copy.reflectionTitle[1]}</h2>
          <blockquote>{copy.reflectionQuote}</blockquote>
        </article>
      </section>

      <section className="su-ggs__row">
        <article className="su-ggs__col su-ggs__col--lessons">
          <header><span className="su-ggs__col-icon" aria-hidden="true"><IconBookOpen size={20} /></span><div><h3>{copy.lessonsTitle}</h3><p>{copy.lessonsKicker}</p></div><a href={local(locale, '/stories')}>{copy.lessonsViewAll} <span aria-hidden="true">→</span></a></header>
          <div className="su-ggs__lesson-list">
            {copy.lessons.map((lesson) => <article key={lesson.index}>
              <img src="/story-universe/reader-poster.webp" alt="" aria-hidden="true" width={840} height={1120} loading="lazy" decoding="async" />
              <div><b>{lesson.index}</b><h4>{lesson.title}</h4><p>{lesson.body}</p></div>
            </article>)}
          </div>
        </article>

        <article className="su-ggs__col su-ggs__col--sessions">
          <header><span className="su-ggs__col-icon" aria-hidden="true"><IconMoon size={20} /></span><div><h3>{copy.sessionsTitle}</h3><p>{copy.sessionsKicker}</p></div><a href={local(locale, '/stories')}>{copy.sessionsView} <span aria-hidden="true">→</span></a></header>
          <div className="su-ggs__session">
            <img src="/story-universe/library-guardian.webp" alt="" aria-hidden="true" width={1086} height={1448} loading="lazy" decoding="async" />
            <div className="su-ggs__session-shade" aria-hidden="true" />
            <div className="su-ggs__session-copy">
              <span>{copy.nextSession}</span>
              <b>{copy.nextSessionName}</b>
              <div><span>{copy.nextSessionWhen[0]}</span><span>{copy.nextSessionWhen[1]}</span></div>
              <a href={local(locale, '/stories')}>{copy.saveDate}</a>
            </div>
          </div>
        </article>

        <article className="su-ggs__col su-ggs__col--paths">
          <header><span className="su-ggs__col-icon" aria-hidden="true"><IconCompass size={20} /></span><div><h3>{copy.pathsTitle}</h3><p>{copy.pathsKicker}</p></div><a href={local(locale, '/values')}>{copy.pathsView} <span aria-hidden="true">→</span></a></header>
          <div className="su-ggs__path-list">
            {copy.paths.map((path, index) => {
              const Icon = pathIcons[index]
              return <a key={path.title} href={local(locale, '/values')}><span aria-hidden="true"><Icon size={16} /></span><b>{path.title}</b><small>{path.body}</small><span aria-hidden="true">→</span></a>
            })}
          </div>
        </article>
      </section>
    </main>
    <SiteFooter locale={locale} />
  </div>
}
