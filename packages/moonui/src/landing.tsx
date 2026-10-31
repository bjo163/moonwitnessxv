import type { ReactNode } from 'react'
import { LiveDot } from './data.js'
import { LinkButton } from './form.js'
import { SiteFooter, type SiteFooterCopy } from './site.js'

/**
 * The A-L-L-A-H.COM entry page (M45 preview surface, ADR-0017).
 *
 * Every word, ordinal and href arrives through `copy`: the design system owns
 * the band structure, the hero art's shape, the space cards and the principle
 * list, while the application owns what the page says and which files exist.
 * One consumer today — and, per ADR-0017, one implementation either way.
 */
export interface LandingSpace {
  id: string
  name: string
  caption: string
  description: string
  status: string
  statusTone: 'cyan' | 'night' | 'accent' | 'ok' | 'hot'
  accent: 'warm' | 'cool' | 'pink'
}

export interface LandingCopy {
  lang: string
  eyebrow: string
  kicker: string
  headline: [string, string]
  intro: string
  explore: string
  why: string
  notice: string
  art: { top: string; bottom: string; mark: string; index: string }
  missionIndex: string
  missionTitle: string
  mission: string
  discoverTitle: string
  discover: Array<{ href: string; label: string; description: string }>
  spacesEyebrow: string
  spacesTitle: string
  spacesNote: string
  spaces: LandingSpace[]
  storyEyebrow: string
  storyTitle: string
  story: string
  storyNote: string
  notebook: { date: string; line: string; foot: string }
  principlesEyebrow: string
  principlesTitle: string
  principles: string[]
}

export function LandingPage({
  copy,
  footer,
  header,
}: {
  copy: LandingCopy
  footer: SiteFooterCopy
  header: ReactNode
}): ReactNode {
  const ordinal = (index: number) => String(index + 1).padStart(2, '0')
  return (
    <div className="emp-shell" lang={copy.lang}>
      <div className="emp-grain" aria-hidden="true" />
      {header}
      <main id="su-main" tabIndex={-1}>
        <section className="emp-hero" aria-labelledby="hero-heading">
          <div className="emp-hero-copy">
            <p className="emp-eyebrow">
              <span className="emp-bullet" />
              {copy.eyebrow}
            </p>
            <p className="emp-kicker">{copy.kicker}</p>
            <h1 id="hero-heading">
              <span>{copy.headline[0]}</span>
              <strong>{copy.headline[1]}</strong>
            </h1>
            <p className="emp-intro">{copy.intro}</p>
            <div className="emp-cta-row">
              <LinkButton href="#ecosystem" variant="accent" size="lg">
                {copy.explore} <span aria-hidden="true">↘</span>
              </LinkButton>
              <LinkButton href="#mission" variant="ghost" size="lg">
                {copy.why} <span aria-hidden="true">↗</span>
              </LinkButton>
            </div>
            <p className="emp-state">
              <LiveDot on={false} />
              {copy.notice}
            </p>
          </div>
          <div className="emp-orbit-art" aria-hidden="true">
            <div className="emp-orbit-outer">
              <div className="emp-orbit-inner">
                <div className="emp-moon" />
              </div>
            </div>
            <span className="emp-art-text emp-art-top">{copy.art.top}</span>
            <span className="emp-art-text emp-art-bottom">{copy.art.bottom}</span>
            <div className="emp-trace emp-trace-one" />
            <div className="emp-trace emp-trace-two" />
            <span className="emp-art-id">{copy.art.mark}</span>
          </div>
          <span className="emp-hero-index" aria-hidden="true">{copy.art.index}</span>
        </section>

        <section className="emp-manifesto" id="mission" aria-labelledby="mission-title">
          <div className="emp-manifesto-index">{copy.missionIndex}</div>
          <div>
            <h2 id="mission-title">{copy.missionTitle}</h2>
            <p>{copy.mission}</p>
          </div>
          <span className="emp-manifesto-star" aria-hidden="true">✳</span>
        </section>

        <section className="emp-discover" aria-labelledby="discover-title">
          <h2 id="discover-title">{copy.discoverTitle}</h2>
          <div className="emp-discover-grid">
            {copy.discover.map((item) => (
              <a key={item.href} className="m-card" href={item.href}>
                <span>{item.label}</span>
                <strong>{item.description}</strong>
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </section>

        <section className="emp-section" id="ecosystem" aria-labelledby="ecosystem-title">
          <div className="emp-section-heading">
            <p className="emp-eyebrow">{copy.spacesEyebrow}</p>
            <h2 id="ecosystem-title">{copy.spacesTitle}</h2>
            <p>{copy.spacesNote}</p>
          </div>
          <div className="emp-space-grid">
            {copy.spaces.map((space, index) => (
              <article key={space.id} className="emp-space m-card" data-accent={space.accent}>
                <div className="emp-space-top">
                  <span className="emp-space-index">{ordinal(index)}</span>
                  <span className="emp-space-status m-badge" data-tone={space.statusTone}>
                    {space.status}
                  </span>
                </div>
                <p className="emp-space-caption">{space.caption}</p>
                <h3>{space.name}</h3>
                <p>{space.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="emp-story" id="story" aria-labelledby="story-title">
          <div className="emp-story-mark" aria-hidden="true">“</div>
          <div>
            <p className="emp-eyebrow">{copy.storyEyebrow}</p>
            <h2 id="story-title">{copy.storyTitle}</h2>
            <p>{copy.story}</p>
            <small>{copy.storyNote}</small>
          </div>
          <div className="emp-story-notebook m-distressed" data-tone="accent" data-edge="rough" aria-hidden="true">
            <span className="m-distressed-edge" />
            <span>{copy.notebook.date}</span>
            <strong>{copy.notebook.line}</strong>
            <span>{copy.notebook.foot}</span>
          </div>
        </section>

        <section className="emp-principles" id="principles" aria-labelledby="principles-title">
          <p className="emp-eyebrow">{copy.principlesEyebrow}</p>
          <h2 id="principles-title">{copy.principlesTitle}</h2>
          <ol>
            {copy.principles.map((principle, index) => (
              <li key={principle} className="m-card">
                <span>{ordinal(index)}</span>
                {principle}
              </li>
            ))}
          </ol>
        </section>
      </main>
      <SiteFooter copy={footer} />
    </div>
  )
}
