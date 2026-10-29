'use client'

import { useMemo, useState } from 'react'
import { IconBookOpen, IconCompass, IconCrosshair, IconSearch, IconSparkles } from '@moonwitness/moonui'
import { libraryCards, libraryCopy } from '../../lib/library-copy'
import type { StoryLocale } from '../../lib/story-universe'
import { StatRow } from './StatRow'
import { PageActions } from './PageActions'
import { SiteFooter } from '../site/SiteFooter'
import { SiteHeader } from '../site/SiteHeader'

const local = (locale: StoryLocale, path: string) => `/${locale}${path === '' ? '' : path}`
const tabIcons = [IconCompass, IconCrosshair, IconSparkles, IconBookOpen]

/** REF-02 — hero 370, filters 138, controls 72, grid 380, stats 80, umbrella 151. */
export function LibraryPage({ locale }: { locale: StoryLocale }) {
  const copy = libraryCopy[locale]
  const cards = libraryCards[locale]
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

  return <div className="su-shell su-lib">
    <SiteHeader locale={locale} active="stories" />
    <main id="su-main" tabIndex={-1}>
      <section className="su-lib__hero">
        <img className="su-lib__hero-art" src="/story-universe/library-guardian.webp" alt="" aria-hidden="true" width={1086} height={1448} fetchPriority="high" decoding="async" />
        <div className="su-lib__hero-shade" aria-hidden="true" />
        <div className="su-lib__hero-copy">
          <p className="su-eyebrow su-lib__eyebrow">{copy.eyebrow}</p>
          <h1 className="su-lib__title"><span>{copy.title[0]}</span><span className="su-lib__title-red">{copy.title[1]}</span></h1>
          <p className="su-lib__lead">{copy.lead}</p>
          <p className="su-lib__body">{copy.body}</p>
          <PageActions
            className="su-lib__actions"
            primary={{ href: local(locale, '/stories'), label: copy.primaryCta }}
            secondary={{ href: local(locale, '/values'), label: copy.secondaryCta }}
          />
        </div>
        <p className="su-lib__script">{copy.script}</p>
      </section>

      <section className="su-lib__filters" aria-label={copy.filters.map((filter) => filter.label).join(', ')}>
        <p className="su-lib__filters-label">{copy.filtersLabel[0]}<span>{copy.filtersLabel[1]}</span><i aria-hidden="true" /></p>
        <div className="su-lib__tabs" role="group">
          {copy.filters.map((filter, index) => {
            const Icon = index === 0 ? IconSparkles : tabIcons[(index - 1) % tabIcons.length]
            return <button key={filter.id} type="button" className="su-lib__tab" aria-pressed={category === filter.id} onClick={() => setCategory(filter.id)}>
              <Icon size={20} strokeWidth={1.3} aria-hidden="true" />
              <b>{filter.label}</b>
              <small>{filter.sub}</small>
            </button>
          })}
        </div>
      </section>

      <section className="su-lib__controls">
        <label className="su-lib__search" htmlFor="story-search">
          <span className="su-lib__sr">{copy.searchPlaceholder}</span>
          <IconSearch size={16} aria-hidden="true" />
          <input id="story-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.searchPlaceholder} />
        </label>
        <label className="su-lib__select"><span>{copy.sortLabel}</span><select value={sort} onChange={(event) => setSort(event.target.value)}>{copy.sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label className="su-lib__select"><span>{copy.worldLabel}</span><select value={world} onChange={(event) => setWorld(event.target.value)}><option value="all">{copy.worldAll}</option>{cards.map((card) => <option key={card.id} value={card.id}>{card.title}</option>)}</select></label>
        <label className="su-lib__select"><span>{copy.statusLabel}</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">{copy.statusAll}</option><option value="draft">{copy.statusDraft}</option><option value="proposed">{copy.statusProposed}</option></select></label>
      </section>

      <section className="su-lib__grid" aria-live="polite">
        {filtered.map((card) => <article className="su-lib__card" key={card.id}>
          <img className="su-lib__card-art" src={card.artwork} alt="" aria-hidden="true" width={560} height={900} loading="lazy" decoding="async" />
          <div className="su-lib__card-shade" aria-hidden="true" />
          <p className="su-lib__card-index"><span>{card.index}</span><span>{card.eyebrow}</span></p>
          <div className="su-lib__card-body">
            <h2>{card.title}</h2>
            <p className="su-lib__card-tagline">{card.tagline}</p>
            <p className="su-lib__card-text">{card.body}</p>
            <p className="su-lib__badges">{card.badges.map((badge) => <span key={badge.label} data-tone={badge.tone}>{badge.label}</span>)}</p>
          </div>
          <a className="su-lib__card-cta" href={local(locale, card.href)}><span>{copy.cardsCta} <span aria-hidden="true">→</span></span></a>
        </article>)}
      </section>

      <section className="su-lib__stats">
        <h2>{copy.statsTitle[0]}<br />{copy.statsTitle[1]}</h2>
        <StatRow className="su-lib__stats-row" items={copy.stats} />
        <p className="su-lib__stats-quote">{copy.statsQuote}</p>
      </section>
    </main>
    <SiteFooter locale={locale} />
  </div>
}
