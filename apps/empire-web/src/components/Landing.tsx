import { content, type Locale } from '../lib/copy'
import { SiteFooter } from './site/SiteFooter'
import { SiteHeader } from './site/SiteHeader'

export function Landing({ locale }: { locale: Locale }) {
  const t = content[locale]
  return <div className="emp-shell" lang={locale}>
    <div className="emp-grain" aria-hidden="true" />
    <SiteHeader locale={locale} active="home" />
    <main id="su-main" tabIndex={-1}>
    <section className="emp-hero" aria-labelledby="hero-heading">
      <div className="emp-hero-copy">
        <p className="emp-eyebrow"><span className="emp-bullet" />{t.eyebrow}</p>
        <p className="emp-kicker">{t.kick}</p>
        <h1 id="hero-heading"><span>{t.headline1}</span><strong>{t.headline2}</strong></h1>
        <p className="emp-intro">{t.intro}</p>
        <div className="emp-cta-row">
          <a className="m-btn" data-variant="accent" data-size="lg" href="#ecosystem">{t.explore} <span aria-hidden="true">↘</span></a>
          <a className="m-btn" data-variant="ghost" data-size="lg" href="#mission">{t.why} <span aria-hidden="true">↗</span></a>
        </div>
        <p className="emp-state"><span className="emp-state-dot m-live-dot" />{t.notice}</p>
      </div>
      <div className="emp-orbit-art" aria-hidden="true">
        <div className="emp-orbit-outer"><div className="emp-orbit-inner"><div className="emp-moon" /></div></div>
        <span className="emp-art-text emp-art-top">FROM THE SKY</span>
        <span className="emp-art-text emp-art-bottom">TO THE CLOUD</span>
        <div className="emp-trace emp-trace-one"/><div className="emp-trace emp-trace-two"/>
        <span className="emp-art-id">MW XV · 2026</span>
      </div>
      <span className="emp-hero-index" aria-hidden="true">00 / LIGHTHOUSE</span>
    </section>
    <section className="emp-manifesto" id="mission" aria-labelledby="mission-title">
      <div className="emp-manifesto-index">01 / MISSION</div>
      <div><h2 id="mission-title">{t.missionTitle}</h2><p>{t.mission}</p></div>
      <span className="emp-manifesto-star" aria-hidden="true">✳</span>
    </section>
    <section className="emp-discover" aria-labelledby="discover-title">
      <h2 id="discover-title">{locale === 'id' ? 'Mulai menjelajah' : 'Start exploring'}</h2>
      <div className="emp-discover-grid">
        {([
          ['sources', 'READ', locale === 'id' ? 'Kenali sumber dan konteks' : 'Understand sources and context'],
          ['ecosystem', 'EXPLORE', locale === 'id' ? 'Lihat peta ekosistem' : 'Browse the ecosystem map'],
          ['values', 'CREATE', locale === 'id' ? 'Pelajari prinsip berkarya' : 'Read our creative principles'],
          ['roadmap', 'SIGNAL', locale === 'id' ? 'Periksa rencana dan status radio' : 'Check plans and radio status'],
        ] as const).map(([section, label, description]) => <a key={section} className="m-card" href={`/${locale}/${section}`}>
          <span>{label}</span><strong>{description}</strong><span aria-hidden="true">↗</span>
        </a>)}
      </div>
    </section>
    <section className="emp-section" id="ecosystem" aria-labelledby="ecosystem-title">
      <div className="emp-section-heading"><p className="emp-eyebrow">{t.spacesEyebrow}</p><h2 id="ecosystem-title">{t.spacesTitle}</h2><p>{t.spacesNote}</p></div>
      <div className="emp-space-grid">
        {t.spaces.map((s, i) => <article key={s.id} className={'emp-space m-card emp-space-' + s.accent}>
          <div className="emp-space-top"><span className="emp-space-index">{String(i + 1).padStart(2, '0')}</span><span className="emp-space-status m-badge" data-tone={s.status === 'CODE EXISTS' ? 'cyan' : 'night'}>{s.status}</span></div>
          <p className="emp-space-caption">{s.caption}</p><h3>{s.name}</h3><p>{s.description}</p>

        </article>)}
      </div>
    </section>
    <section className="emp-story" id="story" aria-labelledby="story-title">
      <div className="emp-story-mark" aria-hidden="true">“</div>
      <div><p className="emp-eyebrow">{t.storyEyebrow}</p><h2 id="story-title">{t.storyTitle}</h2><p>{t.story}</p><small>{t.storyNote}</small></div>
      <div className="emp-story-notebook m-distressed" data-tone="accent" data-edge="rough" aria-hidden="true"><span className="m-distressed-edge" /><span>28.10.2026</span><strong>{locale === 'id' ? 'NIAT → KARYA → MANFAAT' : 'INTENT → WORK → BENEFIT'}</strong><span>ROCKSOUL / HUMAN STORY</span></div>
    </section>
    <section className="emp-principles" id="principles" aria-labelledby="principles-title">
      <p className="emp-eyebrow">{t.principlesEyebrow}</p><h2 id="principles-title">{t.principlesTitle}</h2>
      <ol>{t.principles.map((s,i)=><li key={s} className="m-card"><span>{String(i + 1).padStart(2,'0')}</span>{s}</li>)}</ol>
    </section>
    </main>
    <SiteFooter locale={locale} />
  </div>
}
