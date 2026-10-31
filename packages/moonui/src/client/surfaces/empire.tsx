'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { EmptyState } from '../../data.js'
import { IconBookOpen, IconCompass, IconCrosshair, IconSearch, IconSparkles } from '../../icons/index.js'
import { PageActions, SiteFooter, type SiteFooterCopy } from '../../site.js'
import { StoryCard } from '../../story-card.js'
import { StatStrip } from '../../layout.js'

/**
 * The two interactive Story Universe bodies (ADR-0017).
 *
 * Filter state belongs here because it is interaction, not data. Every word,
 * picture URL and locale-prefixed href arrives as a prop, so neither page has a
 * second implementation in an application, and the shared chrome is passed in by
 * the route rather than imported from one.
 */
export interface StoryLibraryCard {
  id: string
  index: string
  eyebrow: string
  title: string
  tagline: string
  body: string
  badges: Array<{ label: string; tone: 'neutral' | 'done' | 'live' | 'pending' }>
  href: string
  category: 'all' | 'origin' | 'guardian' | 'learning' | 'universe'
  status: 'draft' | 'proposed'
  artwork: string
}

export interface StoryLibraryCopy {
  eyebrow: string
  title: [string, string]
  lead: string
  body: string
  primaryCta: string
  secondaryCta: string
  script: string
  filtersLabel: [string, string]
  filters: Array<{ id: 'all' | 'origin' | 'guardian' | 'learning' | 'universe'; label: string; sub: string }>
  searchPlaceholder: string
  sortLabel: string
  sortOptions: Array<{ value: string; label: string }>
  worldLabel: string
  worldAll: string
  statusLabel: string
  statusAll: string
  statusDraft: string
  statusProposed: string
  statsTitle: [string, string]
  stats: Array<{ value: string; label: string }>
  statsQuote: string
  cardsCta: string
  /** An empty result set is stated, never shown as a blank grid. */
  emptyTitle: string
  emptyHint: string
}

export type StoryReaderCopy = {
  crumb: [string, string, string]
  breadcrumbLabel: string
  pageNavLabel: string
  thumbGroupLabel: string
  previousLabel: string
  nextLabel: string
  posterAlt: string
  posterWords: string[]
  posterWordsLow: string[]
  eyebrow: string
  title: [string, string]
  lead: string
  chapter: string
  synopsisTitle: string
  synopsis: string
  meta: Array<{ kind: 'theme' | 'world' | 'tone'; title: string; body: string }>
  wisdomTitle: string
  wisdomLead: string
  wisdomNote: string
  withheldTitle: string
  withheldBody: string
  keyVerses: string
  verses: string[]
  previous: [string, string]
  next: [string, string]
  stripTitle: string
  stripCount: string
  panels: Array<{ index: string; label: string; art: string }>
}

const TAB_ICONS = [IconCompass, IconCrosshair, IconSparkles, IconBookOpen]
const META_ICONS = { theme: IconCrosshair, world: IconCompass, tone: IconSparkles }

/** The locale-prefixed base the page's links hang off, e.g. `/id`. */
const joinHref = (basePath: string, path: string) => `${basePath}${path === '/' ? '' : path}`

/** REF-02 — hero 370, filters 138, controls 72, grid 380, stats 80, umbrella 151. */
export function StoryLibraryPage({
  copy,
  cards,
  footer,
  header,
  basePath,
  artwork,
}: {
  copy: StoryLibraryCopy
  cards: StoryLibraryCard[]
  footer: SiteFooterCopy
  header: ReactNode
  /** A string, not a function: these views are client components. */
  basePath: string
  artwork: { hero: string }
}): ReactNode {
  const hrefFor = (path: string) => joinHref(basePath, path)

  const [category, setCategory] = useState<'all' | 'origin' | 'guardian' | 'learning' | 'universe'>('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('newest')
  const [world, setWorld] = useState('all')
  const [status, setStatus] = useState('all')

  const filtered = useMemo(() => cards
    .filter((card) => (category === 'all' || card.category === category)
      && (world === 'all' || card.id === world)
      && (status === 'all' || card.status === status)
      && (!query || `${card.title} ${card.tagline} ${card.body}`.toLowerCase().includes(query.toLowerCase())))
    .sort((a, b) => (sort === 'title' ? a.title.localeCompare(b.title) : sort === 'oldest' ? b.index.localeCompare(a.index) : a.index.localeCompare(b.index))),
  [cards, category, query, sort, status, world])

  return (
    <div className="su-shell su-lib">
      {header}
      <main id="su-main" tabIndex={-1}>
        <section className="su-lib__hero">
          <img className="su-lib__hero-art" src={artwork.hero} alt="" aria-hidden="true" width={1086} height={1448} fetchPriority="high" decoding="async" />
          <div className="su-lib__hero-shade" aria-hidden="true" />
          <div className="su-lib__hero-copy">
            <p className="su-eyebrow su-lib__eyebrow">{copy.eyebrow}</p>
            <h1 className="su-lib__title">
              <span>{copy.title[0]}</span>
              <span className="su-lib__title-red">{copy.title[1]}</span>
            </h1>
            <p className="su-lib__lead">{copy.lead}</p>
            <p className="su-lib__body">{copy.body}</p>
            <PageActions
              className="su-lib__actions"
              primary={{ href: hrefFor('/stories'), label: copy.primaryCta }}
              secondary={{ href: hrefFor('/values'), label: copy.secondaryCta }}
            />
          </div>
          <p className="su-lib__script">{copy.script}</p>
        </section>

        <section className="su-lib__filters" aria-label={copy.filters.map((filter) => filter.label).join(', ')}>
          <p className="su-lib__filters-label">
            {copy.filtersLabel[0]}
            <span>{copy.filtersLabel[1]}</span>
            <i aria-hidden="true" />
          </p>
          <div className="su-lib__tabs" role="group">
            {copy.filters.map((filter, index) => {
              const Icon = index === 0 ? IconSparkles : TAB_ICONS[(index - 1) % TAB_ICONS.length] ?? IconBookOpen
              return (
                <button key={filter.id} type="button" className="su-lib__tab" aria-pressed={category === filter.id} onClick={() => setCategory(filter.id)}>
                  <Icon size={20} strokeWidth={1.3} aria-hidden="true" />
                  <b>{filter.label}</b>
                  <small>{filter.sub}</small>
                </button>
              )
            })}
          </div>
        </section>

        <section className="su-lib__controls">
          <label className="su-lib__search" htmlFor="story-search">
            <span className="su-lib__sr">{copy.searchPlaceholder}</span>
            <IconSearch size={16} aria-hidden="true" />
            <input id="story-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.searchPlaceholder} />
          </label>
          <label className="su-lib__select">
            <span>{copy.sortLabel}</span>
            <select name="library-sort" value={sort} onChange={(event) => setSort(event.target.value)}>
              {copy.sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="su-lib__select">
            <span>{copy.worldLabel}</span>
            <select name="library-world" value={world} onChange={(event) => setWorld(event.target.value)}>
              <option value="all">{copy.worldAll}</option>
              {cards.map((card) => <option key={card.id} value={card.id}>{card.title}</option>)}
            </select>
          </label>
          <label className="su-lib__select">
            <span>{copy.statusLabel}</span>
            <select name="library-status" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">{copy.statusAll}</option>
              <option value="draft">{copy.statusDraft}</option>
              <option value="proposed">{copy.statusProposed}</option>
            </select>
          </label>
        </section>

        <section className="su-lib__grid" aria-live="polite">
          {filtered.length === 0 ? (
            <EmptyState title={copy.emptyTitle} hint={copy.emptyHint} />
          ) : null}
          {filtered.map((card) => (
            <StoryCard
              key={card.id}
              className="su-lib__card"
              artwork={card.artwork}
              artworkClassName="su-lib__card-art"
              shadeClassName="su-lib__card-shade"
              indexClassName="su-lib__card-index"
              bodyClassName="su-lib__card-body"
              actionClassName="su-lib__card-cta"
              index={card.index}
              eyebrow={card.eyebrow}
              title={card.title}
              href={hrefFor(card.href)}
              action={<span>{copy.cardsCta} <span aria-hidden="true">→</span></span>}
            >
              <p className="su-lib__card-tagline">{card.tagline}</p>
              <p className="su-lib__card-text">{card.body}</p>
              <p className="su-lib__badges">
                {card.badges.map((badge) => <span key={badge.label} data-tone={badge.tone}>{badge.label}</span>)}
              </p>
            </StoryCard>
          ))}
        </section>

        <section className="su-lib__stats">
          <h2>
            {copy.statsTitle[0]}
            <br />
            {copy.statsTitle[1]}
          </h2>
          <StatStrip className="su-lib__stats-row" items={copy.stats} />
          <p className="su-lib__stats-quote">{copy.statsQuote}</p>
        </section>
      </main>
      <SiteFooter copy={footer} />
    </div>
  )
}

/** REF-03 — breadcrumb 31, two-column body to 1218, panel strip to 1331, footer 43+28. */
export function StoryReaderPage({
  copy,
  footer,
  header,
  basePath,
  artwork,
}: {
  copy: StoryReaderCopy
  footer: SiteFooterCopy
  header: ReactNode
  /** A string, not a function: these views are client components. */
  basePath: string
  artwork: { poster: string }
}): ReactNode {
  const hrefFor = (path: string) => joinHref(basePath, path)

  const [active, setActive] = useState(0)
  const step = (delta: number) => setActive((index) => Math.min(copy.panels.length - 1, Math.max(0, index + delta)))

  return (
    <div
      className="su-shell su-reader-page"
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') step(1)
        if (event.key === 'ArrowLeft') step(-1)
      }}
    >
      {header}
      <main id="su-main" tabIndex={-1}>
        <nav className="su-reader__crumb" aria-label={copy.breadcrumbLabel}>
          <a href={hrefFor('/')}>{copy.crumb[0]}</a>
          <span aria-hidden="true">›</span>
          <a href={hrefFor('/stories')}>{copy.crumb[1]}</a>
          <span aria-hidden="true">›</span>
          <span>{copy.crumb[2]}</span>
        </nav>

        <div className="su-reader__grid">
          <figure className="su-reader__poster">
            <img src={artwork.poster} alt={copy.posterAlt} width={1024} height={1536} fetchPriority="high" decoding="async" />
            <div className="su-reader__poster-shade" aria-hidden="true" />
            <p className="su-reader__poster-side">
              {copy.posterWords.map((word) => <span key={word}>{word}</span>)}
              <i aria-hidden="true" />
            </p>
            <p className="su-reader__poster-side su-reader__poster-side--low">
              {copy.posterWordsLow.map((word) => <span key={word}>{word}</span>)}
            </p>
            <figcaption className="su-reader__poster-title">
              <b>
                {copy.title[0]}
                <em>{copy.title[1]}</em>
              </b>
              <span>{copy.lead}</span>
            </figcaption>
          </figure>

          <section className="su-reader__copy">
            <p className="su-eyebrow su-reader__eyebrow">{copy.eyebrow}</p>
            <h1 className="su-reader__title">
              <span>{copy.title[0]}</span>
              <span className="su-reader__title-red">{copy.title[1]}</span>
            </h1>
            <p className="su-reader__lead">{copy.lead}</p>
            <div className="su-reader__chapter">
              <span>{copy.chapter}</span>
              <div role="group" aria-label={copy.pageNavLabel}>
                <button type="button" onClick={() => step(-1)} disabled={active === 0} aria-label={copy.previousLabel}>‹</button>
                <button type="button" onClick={() => step(1)} disabled={active === copy.panels.length - 1} aria-label={copy.nextLabel}>›</button>
              </div>
            </div>

            <section className="su-reader__synopsis">
              <h2>
                <IconBookOpen size={17} aria-hidden="true" />
                {copy.synopsisTitle}
              </h2>
              <p>{copy.synopsis}</p>
            </section>

            <div className="su-reader__meta">
              {copy.meta.map((item) => {
                const Icon = META_ICONS[item.kind]
                return (
                  <article key={item.title}>
                    <span aria-hidden="true">
                      <Icon size={16} strokeWidth={1.5} />
                    </span>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </article>
                )
              })}
            </div>

            <div className="su-reader__pager">
              <a className="su-reader__pager-prev" href={hrefFor('/stories')}>
                <span aria-hidden="true">←</span>
                <span>
                  <b>{copy.previous[0]}</b>
                  <small>{copy.previous[1]}</small>
                </span>
              </a>
              <a className="su-reader__pager-next" href={hrefFor('/stories/angelwithshotgun')}>
                <span>
                  <b>{copy.next[0]}</b>
                  <small>{copy.next[1]}</small>
                </span>
                <span aria-hidden="true">→</span>
              </a>
            </div>

            <section className="su-reader__wisdom">
              <header>
                <h2>
                  <IconBookOpen size={16} aria-hidden="true" />
                  {copy.wisdomTitle}
                </h2>
                <span>{copy.keyVerses}</span>
              </header>
              <div className="su-reader__wisdom-body">
                <div>
                  <p className="su-reader__wisdom-lead">{copy.wisdomLead}</p>
                  <div className="su-reader__withheld" role="note">
                    <b>{copy.withheldTitle}</b>
                    <p>{copy.withheldBody}</p>
                  </div>
                  <p className="su-reader__wisdom-note">{copy.wisdomNote}</p>
                </div>
                <div className="su-reader__verses">{copy.verses.map((verse) => <span key={verse}>{verse}</span>)}</div>
              </div>
            </section>
          </section>
        </div>

        <section className="su-reader__panels" aria-label={copy.stripTitle}>
          <header>
            <span>{copy.stripTitle}</span>
            <span>{copy.stripCount}</span>
          </header>
          <div className="su-reader__thumbs" role="group" aria-label={copy.thumbGroupLabel}>
            {copy.panels.map((panel, index) => (
              <button key={panel.index} type="button" className="su-reader__thumb" aria-pressed={active === index} onClick={() => setActive(index)}>
                <img src={panel.art} alt="" aria-hidden="true" width={840} height={1120} loading="lazy" decoding="async" />
                <span className="su-reader__thumb-label">
                  <b>{panel.index}</b>
                  {panel.label}
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter copy={footer} />
    </div>
  )
}
