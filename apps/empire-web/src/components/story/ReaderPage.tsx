'use client'

import { useState } from 'react'
import { IconBookOpen, IconMoon } from '@moonwitness/moonui'
import { readerCopy } from '../../lib/reader-copy'
import type { StoryLocale } from '../../lib/story-universe'
import { SiteFooter } from '../site/SiteFooter'
import { SiteHeader } from '../site/SiteHeader'

const local = (locale: StoryLocale, path: string) => `/${locale}${path === '/' ? '' : path}`

/**
 * REF-03 — breadcrumb 31, two-column body to 1218 (poster 531px, copy 497px),
 * panel strip to 1331, compressed footer 43+28 from the reference.
 */
export function ReaderPage({ locale }: { locale: StoryLocale }) {
  const copy = readerCopy[locale]
  const [active, setActive] = useState(0)
  const step = (delta: number) => setActive((index) => Math.min(copy.panels.length - 1, Math.max(0, index + delta)))
  return <div className="su-shell su-reader-page" onKeyDown={(event) => {
    if (event.key === 'ArrowRight') step(1)
    if (event.key === 'ArrowLeft') step(-1)
  }}>
    <SiteHeader locale={locale} active="stories" />
    <main id="su-main" tabIndex={-1}>
      <nav className="su-reader__crumb" aria-label={locale === 'id' ? 'Jejak navigasi' : 'Breadcrumb'}>
        <a href={local(locale, '/')}>{copy.crumb[0]}</a><span aria-hidden="true">›</span>
        <a href={local(locale, '/stories')}>{copy.crumb[1]}</a><span aria-hidden="true">›</span>
        <span>{copy.crumb[2]}</span>
      </nav>

      <div className="su-reader__grid">
        <figure className="su-reader__poster">
          <img src="/story-universe/reader-poster.webp" alt={locale === 'id' ? 'Poster konseptual AngelWithShotgun, sosok dari belakang' : 'Concept poster of AngelWithShotgun, rear-view figure'} width={1024} height={1536} fetchPriority="high" decoding="async" />
          <div className="su-reader__poster-shade" aria-hidden="true" />
          <p className="su-reader__poster-side"><span>PROTECT</span><span>WHAT</span><span>STILL</span><span>MATTERS.</span><i aria-hidden="true" /></p>
          <p className="su-reader__poster-side su-reader__poster-side--low"><span>DIFFERENT</span><span>PEOPLES</span><span>SAME MOON</span><span>BIGGER</span><span>HUMANITY</span></p>
          <figcaption className="su-reader__poster-title">
            <b>{copy.title[0]}<em>{copy.title[1]}</em></b>
            <span>{copy.lead}</span>
          </figcaption>
        </figure>

        <section className="su-reader__copy">
          <p className="su-eyebrow su-reader__eyebrow">{copy.eyebrow}</p>
          <h1 className="su-reader__title"><span>{copy.title[0]}</span><span className="su-reader__title-red">{copy.title[1]}</span></h1>
          <p className="su-reader__lead">{copy.lead}</p>
          <div className="su-reader__chapter">
            <span>{copy.chapter}</span>
            <div role="group" aria-label={locale === 'id' ? 'Pindah halaman' : 'Change page'}>
              <button type="button" onClick={() => step(-1)} disabled={active === 0} aria-label={locale === 'id' ? 'Halaman sebelumnya' : 'Previous page'}>‹</button>
              <button type="button" onClick={() => step(1)} disabled={active === copy.panels.length - 1} aria-label={locale === 'id' ? 'Halaman berikutnya' : 'Next page'}>›</button>
            </div>
          </div>

          <section className="su-reader__synopsis">
            <h2><IconBookOpen size={17} aria-hidden="true" />{copy.synopsisTitle}</h2>
            <p>{copy.synopsis}</p>
          </section>

          <div className="su-reader__meta">
            {copy.meta.map((item, index) => <article key={item.title}>
              <span aria-hidden="true">{index === 0 ? <span className="su-reader__glyph">◎</span> : index === 1 ? <IconMoon size={16} /> : <span className="su-reader__glyph">❦</span>}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>)}
          </div>

          <div className="su-reader__pager">
            <a className="su-reader__pager-prev" href={local(locale, '/stories')}><span aria-hidden="true">←</span><span><b>{copy.previous[0]}</b><small>{copy.previous[1]}</small></span></a>
            <a className="su-reader__pager-next" href={local(locale, '/stories/angelwithshotgun')}><span><b>{copy.next[0]}</b><small>{copy.next[1]}</small></span><span aria-hidden="true">→</span></a>
          </div>

          <section className="su-reader__wisdom">
            <header><h2><IconBookOpen size={16} aria-hidden="true" />{copy.wisdomTitle}</h2><span>{copy.keyVerses}</span></header>
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
        <header><span>{copy.stripTitle}</span><span>{copy.stripCount}</span></header>
        <div className="su-reader__thumbs" role="group" aria-label={locale === 'id' ? 'Panel bab' : 'Chapter panels'}>
          {copy.panels.map((panel, index) => <button key={panel.index} type="button" className="su-reader__thumb" aria-pressed={active === index} onClick={() => setActive(index)}>
            <img src={panel.art} alt="" aria-hidden="true" width={840} height={1120} loading="lazy" decoding="async" />
            <span className="su-reader__thumb-label"><b>{panel.index}</b>{panel.label}</span>
          </button>)}
        </div>
      </section>
    </main>
    <SiteFooter locale={locale} />
  </div>
}
