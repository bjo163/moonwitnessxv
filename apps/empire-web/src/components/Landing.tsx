import { content, type Locale } from '../lib/copy'

export function Landing({ locale }: { locale: Locale }) {
  const t = content[locale]
  return <main className="emp-shell">
    <div className="emp-grain" aria-hidden="true" />
    <header className="emp-header">
      <a href={locale === 'id' ? '/id' : '/en'} className="emp-logo" aria-label="A-L-L-A-H.COM home">
        <span className="emp-crescent" aria-hidden="true">◕</span><span>A-L-L-A-H<span className="emp-dot">.COM</span></span>
      </a>
      <nav className="emp-nav" aria-label="Main navigation">
        <a href="#mission">{t.navigation[0]}</a>
        <a href="#ecosystem">{t.navigation[1]}</a>
        <a href="#story">{t.navigation[2]}</a>
        <a href="#principles">{t.navigation[3]}</a>
      </nav>
      <a className="emp-lang" href={t.otherHref} hrefLang={locale === 'id' ? 'en' : 'id'} aria-label={locale === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}>{t.other} <span aria-hidden="true">↗</span></a>
    </header>
    <section className="emp-hero" aria-labelledby="hero-heading">
      <div className="emp-hero-copy">
        <p className="emp-eyebrow"><span className="emp-bullet" />{t.eyebrow}</p>
        <p className="emp-kicker">{t.kick}</p>
        <h1 id="hero-heading"><span>{t.headline1}</span><strong>{t.headline2}</strong></h1>
        <p className="emp-intro">{t.intro}</p>
        <div className="emp-cta-row">
          <a className="emp-button emp-primary" href="#ecosystem">{t.explore} <span aria-hidden="true">↘</span></a>
          <a className="emp-button emp-secondary" href="#mission">{t.why} <span aria-hidden="true">↗</span></a>
        </div>
        <p className="emp-state"><span className="emp-state-dot" />{t.notice}</p>
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
    <section className="emp-section" id="ecosystem" aria-labelledby="ecosystem-title">
      <div className="emp-section-heading"><p className="emp-eyebrow">{t.spacesEyebrow}</p><h2 id="ecosystem-title">{t.spacesTitle}</h2><p>{t.spacesNote}</p></div>
      <div className="emp-space-grid">
        {t.spaces.map((s, i) => <article key={s.id} className={'emp-space emp-space-' + s.accent}>
          <div className="emp-space-top"><span className="emp-space-index">{String(i + 1).padStart(2, '0')}</span><span className="emp-space-status">{s.status}</span></div>
          <p className="emp-space-caption">{s.caption}</p><h3>{s.name}</h3><p>{s.description}</p>
          <span className="emp-space-mark" aria-hidden="true">↗</span>
        </article>)}
      </div>
    </section>
    <section className="emp-story" id="story" aria-labelledby="story-title">
      <div className="emp-story-mark" aria-hidden="true">“</div>
      <div><p className="emp-eyebrow">{t.storyEyebrow}</p><h2 id="story-title">{t.storyTitle}</h2><p>{t.story}</p><small>{t.storyNote}</small></div>
      <div className="emp-story-notebook" aria-hidden="true"><span>28.10.2026</span><strong>NIAT → KARYA → MANFAAT</strong><span>ROCKSOUL / HUMAN STORY</span></div>
    </section>
    <section className="emp-principles" id="principles" aria-labelledby="principles-title">
      <p className="emp-eyebrow">{t.principlesEyebrow}</p><h2 id="principles-title">{t.principlesTitle}</h2>
      <ol>{t.principles.map((s,i)=><li key={s}><span>{String(i + 1).padStart(2,'0')}</span>{s}</li>)}</ol>
    </section>
    <footer className="emp-footer"><div className="emp-footer-logo">A-L-L-A-H.COM <small>EMPIRE OF THE LIGHT</small></div><div><p>{t.closing}</p><strong>{t.footer}</strong></div><span>© 2026 · PREVIEW · HUMAN-GOVERNED</span></footer>
  </main>
}
