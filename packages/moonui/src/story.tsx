import type { CSSProperties, ReactNode } from 'react'
import { StatStrip } from './layout.js'
import { SectionHeading } from './section-heading.js'
import { PageActions, SiteFooter, type SiteFooterCopy } from './site.js'
import {
  IconBookOpen,
  IconCompass,
  IconMoon,
  IconSparkles,
} from './icons/index.js'

/** Story Universe page bodies (ADR-0017); copy, artwork and hrefs arrive as props. */

export interface StoryHomeCopy {
  eyebrow: string
  heroLines: [string, string, string, string]
  intro: string
  primaryCta: string
  secondaryCta: string
  stats: Array<{ value: string; label: string }>
  side: string
  script: string
  cards: Array<{ index: string; eyebrow: string; title: string; tagline: string; body: string; cta: string }>
  foundationEyebrow: string
  foundationTitle: [string, string]
  principles: Array<{ title: string; body: string }>
}

export interface StoryGgsCopy {
  eyebrow: string
  title: [string, string, string]
  lead: string
  body: string
  primaryCta: string
  secondaryCta: string
  script: string
  stats: Array<{ value: string; label: string }>
  lessonEyebrow: string
  live: string
  lessonTitle: string
  lessonLead: string
  lessonBody: string
  lessonMeta: Array<{ label: string; value: string }>
  lessonCta: string
  storyTime: string
  reflectionEyebrow: string
  reflectionTitle: [string, string]
  reflectionQuote: string
  lessonsTitle: string
  lessonsKicker: string
  lessonsViewAll: string
  lessons: Array<{ index: string; title: string; body: string }>
  sessionsTitle: string
  sessionsKicker: string
  sessionsView: string
  nextSession: string
  nextSessionName: string
  nextSessionWhen: [string, string]
  saveDate: string
  pathsTitle: string
  pathsKicker: string
  pathsView: string
  paths: Array<{ title: string; body: string }>
}

/**
 * Artwork is Empire's content, not the design system's, so every picture URL
 * arrives as a prop. `reflection` is handed to `moon.css` through the
 * `--m-surface-art` custom property rather than being baked into the stylesheet.
 */
export interface StoryGgsArtwork {
  hero: string
  lesson: string
  poster: string
  session: string
  reflection: string
}

const CARD_LINKS = ['/stories', '/stories/angelwithshotgun', '/ggs', '/stories']
const CARD_ICONS = [IconBookOpen, IconCompass, IconSparkles, IconMoon]

function CompassionMark(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21c-2-4.6-8-7.6-8-12.2A4.3 4.3 0 0 1 12 6a4.3 4.3 0 0 1 8 2.8C20 13.4 14 16.4 12 21Z" />
      <path d="M12 8v9" />
    </svg>
  )
}

function ActionMark(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m2 19 7-9 3.5 4.5L16 6l6 13H2Z" />
      <path d="M2 22h20" />
    </svg>
  )
}

function UnityMark(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <circle cx="8.6" cy="9" r="5.2" />
      <circle cx="15.4" cy="9" r="5.2" />
      <circle cx="12" cy="15" r="5.2" />
    </svg>
  )
}

export function StoryHomePage({
  copy,
  heroArtwork,
  cardArtwork,
  footer,
  header,
  hrefFor,
  worldsLabel,
}: {
  copy: StoryHomeCopy
  heroArtwork: string
  cardArtwork: string[]
  footer: SiteFooterCopy
  header: ReactNode
  hrefFor: (path: string) => string
  worldsLabel: string
}): ReactNode {
  const marks = [
    <IconCrosshairSafe size={26} key="truth" />,
    <CompassionMark key="compassion" />,
    <ActionMark key="action" />,
    <UnityMark key="unity" />,
  ]
  return (
    <div className="su-shell">
      {header}
      <main id="su-main" tabIndex={-1}>
        <section className="su-home__hero">
          <img
            className="su-home__hero-art"
            src={heroArtwork}
            alt=""
            aria-hidden="true"
            width={1200}
            height={675}
            fetchPriority="high"
            decoding="async"
          />
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
            <PageActions
              className="su-home__actions"
              primary={{ href: hrefFor('/stories'), label: copy.primaryCta }}
              secondary={{ href: hrefFor('/values'), label: copy.secondaryCta }}
            />
          </div>
          <p className="su-home__side">{copy.side}</p>
          <p className="su-home__script">{copy.script}</p>
          <StatStrip className="su-home__stats" items={copy.stats} />
        </section>

        <section className="su-home__worlds" aria-label={worldsLabel}>
          {copy.cards.map((card, index) => {
            const Icon = CARD_ICONS[index] ?? IconBookOpen
            return (
              <article className="su-home__card" key={card.index}>
                <img
                  className="su-home__card-art"
                  src={cardArtwork[index]}
                  alt=""
                  aria-hidden="true"
                  width={560}
                  height={900}
                  loading="lazy"
                  decoding="async"
                />
                <div className="su-home__card-shade" aria-hidden="true" />
                <p className="su-home__card-index">
                  <span>{card.index}</span>
                  <span>{card.eyebrow}</span>
                </p>
                <div className="su-home__card-body">
                  <h2>{card.title}</h2>
                  <p className="su-home__card-tagline">{card.tagline}</p>
                  <p className="su-home__card-text">{card.body}</p>
                </div>
                <a className="su-home__card-cta" href={hrefFor(CARD_LINKS[index] ?? '/stories')}>
                  <span>
                    {card.cta} <span aria-hidden="true">→</span>
                  </span>
                  <Icon size={26} strokeWidth={1.1} aria-hidden="true" />
                </a>
              </article>
            )
          })}
        </section>

        <section className="su-home__foundation">
          <div className="su-home__foundation-head">
            <SectionHeading eyebrow={copy.foundationEyebrow}>
              {copy.foundationTitle[0]}
              <br />
              {copy.foundationTitle[1]}
            </SectionHeading>
            <span className="su-home__dash" aria-hidden="true" />
          </div>
          {copy.principles.map((principle, index) => (
            <article className="su-home__principle" key={principle.title}>
              <span className="su-home__principle-icon" aria-hidden="true">
                {marks[index] ?? null}
              </span>
              <h3>{principle.title}</h3>
              <p>{principle.body}</p>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter copy={footer} />
    </div>
  )
}

function IconCrosshairSafe({ size }: { size: number }): ReactNode {
  return <IconSparkles size={size} aria-hidden="true" />
}

export function StoryGgsPage({
  copy,
  footer,
  header,
  hrefFor,
  artwork,
}: {
  copy: StoryGgsCopy
  footer: SiteFooterCopy
  header: ReactNode
  hrefFor: (path: string) => string
  artwork: StoryGgsArtwork
}): ReactNode {
  const pathIcons = [IconMoon, IconCompass, IconSparkles, IconBookOpen]
  return (
    <div className="su-shell su-ggs-page">
      {header}
      <main id="su-main" tabIndex={-1}>
        <section className="su-ggs__hero">
          <img
            className="su-ggs__hero-art"
            src={artwork.hero}
            alt=""
            aria-hidden="true"
            width={1200}
            height={675}
            fetchPriority="high"
            decoding="async"
          />
          <div className="su-ggs__shade" aria-hidden="true" />
          <div className="su-ggs__hero-copy">
            <p className="su-eyebrow su-ggs__eyebrow">{copy.eyebrow}</p>
            <h1 className="su-ggs__title">
              <span>{copy.title[0]}</span>
              <span>{copy.title[1]}</span>
              <span className="su-ggs__title-red">{copy.title[2]}</span>
            </h1>
            <p className="su-ggs__lead">{copy.lead}</p>
            <p className="su-ggs__body">{copy.body}</p>
            <PageActions
              className="su-ggs__actions"
              primary={{ href: hrefFor('/ggs'), label: copy.primaryCta }}
              secondary={{ href: hrefFor('/stories'), label: copy.secondaryCta }}
            />
          </div>
          <p className="su-ggs__script">{copy.script}</p>
        </section>

        <StatStrip className="su-ggs__stats" items={copy.stats} as="section" />

        <section className="su-ggs__lesson">
          <article className="su-ggs__lesson-main">
            <div className="su-ggs__lesson-art" aria-hidden="true">
              <img
                src={artwork.lesson}
                alt=""
                width={1122}
                height={1402}
                loading="lazy"
                decoding="async"
              />
              <span />
            </div>
            <header>
              <p className="su-eyebrow su-ggs__eyebrow">{copy.lessonEyebrow}</p>
              <span className="su-ggs__live">
                <i aria-hidden="true" />
                {copy.live}
              </span>
            </header>
            <h2>{copy.lessonTitle}</h2>
            <p className="su-ggs__lesson-lead">{copy.lessonLead}</p>
            <p className="su-ggs__lesson-body">{copy.lessonBody}</p>
            <div className="su-ggs__lesson-bottom">
              <ul className="su-ggs__meta">
                {copy.lessonMeta.map((item) => (
                  <li key={item.label}>
                    <IconMoon size={13} aria-hidden="true" />
                    <span>{item.label}</span>
                    <b>{item.value}</b>
                  </li>
                ))}
              </ul>
              <div className="su-ggs__lesson-cta">
                <a href={hrefFor('/stories')}>
                  {copy.lessonCta} <span aria-hidden="true">→</span>
                </a>
                <p>{copy.storyTime}</p>
              </div>
            </div>
          </article>
          <article
            className="su-ggs__reflection"
            style={{ '--m-surface-art': `url(${artwork.reflection})` } as CSSProperties}
          >
            <SectionHeading eyebrow={copy.reflectionEyebrow} eyebrowClassName="su-ggs__eyebrow">
              {copy.reflectionTitle[0]}
              <br />
              {copy.reflectionTitle[1]}
            </SectionHeading>
            <blockquote>{copy.reflectionQuote}</blockquote>
          </article>
        </section>

        <section className="su-ggs__row">
          <article className="su-ggs__col su-ggs__col--lessons">
            <header>
              <span className="su-ggs__col-icon" aria-hidden="true">
                <IconBookOpen size={20} />
              </span>
              <div>
                <h3>{copy.lessonsTitle}</h3>
                <p>{copy.lessonsKicker}</p>
              </div>
              <a href={hrefFor('/stories')}>
                {copy.lessonsViewAll} <span aria-hidden="true">→</span>
              </a>
            </header>
            <div className="su-ggs__lesson-list">
              {copy.lessons.map((lesson) => (
                <article key={lesson.index}>
                  <img
                    src={artwork.poster}
                    alt=""
                    aria-hidden="true"
                    width={840}
                    height={1120}
                    loading="lazy"
                    decoding="async"
                  />
                  <div>
                    <b>{lesson.index}</b>
                    <h4>{lesson.title}</h4>
                    <p>{lesson.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="su-ggs__col su-ggs__col--sessions">
            <header>
              <span className="su-ggs__col-icon" aria-hidden="true">
                <IconMoon size={20} />
              </span>
              <div>
                <h3>{copy.sessionsTitle}</h3>
                <p>{copy.sessionsKicker}</p>
              </div>
              <a href={hrefFor('/stories')}>
                {copy.sessionsView} <span aria-hidden="true">→</span>
              </a>
            </header>
            <div className="su-ggs__session">
              <img
                src={artwork.session}
                alt=""
                aria-hidden="true"
                width={1086}
                height={1448}
                loading="lazy"
                decoding="async"
              />
              <div className="su-ggs__session-shade" aria-hidden="true" />
              <div className="su-ggs__session-copy">
                <span>{copy.nextSession}</span>
                <b>{copy.nextSessionName}</b>
                <div>
                  <span>{copy.nextSessionWhen[0]}</span>
                  <span>{copy.nextSessionWhen[1]}</span>
                </div>
                <a href={hrefFor('/stories')}>{copy.saveDate}</a>
              </div>
            </div>
          </article>

          <article className="su-ggs__col su-ggs__col--paths">
            <header>
              <span className="su-ggs__col-icon" aria-hidden="true">
                <IconCompass size={20} />
              </span>
              <div>
                <h3>{copy.pathsTitle}</h3>
                <p>{copy.pathsKicker}</p>
              </div>
              <a href={hrefFor('/values')}>
                {copy.pathsView} <span aria-hidden="true">→</span>
              </a>
            </header>
            <div className="su-ggs__path-list">
              {copy.paths.map((path, index) => {
                const Icon = pathIcons[index] ?? IconBookOpen
                return (
                  <a key={path.title} href={hrefFor('/values')}>
                    <span aria-hidden="true">
                      <Icon size={16} />
                    </span>
                    <b>{path.title}</b>
                    <small>{path.body}</small>
                    <span aria-hidden="true">→</span>
                  </a>
                )
              })}
            </div>
          </article>
        </section>
      </main>
      <SiteFooter copy={footer} />
    </div>
  )
}
