import type { ReactNode } from 'react'
import { BrandLogo, Crown, LinkButton, ZineNote, Chevron } from '@moonwitness/moonui'
import type { Locale } from '@moonwitness/core'
import { DOCK_URL, SITE_NAME } from '@/lib/env'
import { loginCopy } from '@/lib/login-copy'

/**
 * The "Enter SHADOW" punk-zine login surface matching reference Image 3:
 * built from @moonwitness/moonui primitives (BrandLogo, Crown, LinkButton, ZineNote).
 */
export function AuthLayout({ children, locale }: { children: ReactNode; locale: Locale }) {
  const copy = loginCopy(locale)
  return (
    <div className="hq-auth-shell" lang={locale}>
      <header className="hq-auth-topbar">
        <div className="m-row" style={{ gap: 16 }}>
          <Crown tone="cyan" size="lg" />
          <BrandLogo
            href="/"
            size="lg"
            subtitle={
              <span>
                {copy.brandSubtitle} · <strong>A-L-L-A-H</strong>
              </span>
            }
          />
        </div>

        <div className="m-row" style={{ gap: 18 }}>
          <ZineNote tone="dark" tilt="left">
            {copy.sameMoon}
          </ZineNote>
          {DOCK_URL ? (
            <LinkButton href={DOCK_URL} variant="accent" size="md">
              {copy.followSignal} <Chevron dir="right" />
            </LinkButton>
          ) : null}
        </div>
      </header>

      <div className="hq-auth-stage">
        {/* Left decorative punk-zine strip */}
        <aside className="hq-auth-zine-left" aria-hidden="true">
          <ZineNote tone="dark" tilt="left">
            {copy.leftDifferent}
            <br />
            {copy.leftPeople}
            <br />
            {copy.leftSky}
            <br />
            {copy.leftStories}
            <br />
            {copy.leftBeyond}
            <br />
            {copy.leftBorders}
            <div style={{ marginTop: 6 }}>
              <Crown tone="gold" size="sm" />
            </div>
          </ZineNote>

          <div>
            <img src="/art/manga-eye.jpg" alt="" className="hq-zine-eye-img" />
            <ZineNote tone="pink" tilt="left">
              {copy.witnessReal}
            </ZineNote>
          </div>

          <ZineNote tone="dark" tilt="none">
            {copy.leftTagline}
          </ZineNote>
        </aside>

        {/* Center login command card */}
        <main className="hq-auth-card-wrap">{children}</main>

        {/* Right cyberpunk moon watcher illustration */}
        <section className="hq-auth-watcher" aria-label={copy.artworkLabel}>
          <img
            src="/art/login-watcher.jpg"
            alt={copy.artworkLabel}
            className="hq-watcher-img"
          />
          <div className="hq-watcher-tag-top">
            <ZineNote tone="dark" tilt="left">
              {copy.sameMoon}
            </ZineNote>
          </div>
          <div className="hq-watcher-tag-right">
            <ZineNote tone="dark" tilt="right">
              {copy.storiesBeyond}
            </ZineNote>
          </div>
          <div className="hq-watcher-poster">
            <ZineNote tone="paper" tilt="left">
              {copy.brighterTomorrow} <Crown tone="gold" size="sm" />
            </ZineNote>
          </div>
          <div className="hq-watcher-follow">
            <ZineNote tone="accent" tilt="left">
              {copy.followSignal}
            </ZineNote>
          </div>
        </section>
      </div>

      <footer className="hq-auth-footer">
        <div>
          <strong>Moonwitness</strong> // {copy.footerMission} · <span className="m-muted">{SITE_NAME}</span>
        </div>
        <div className="m-row m-muted" style={{ gap: 16 }}>
          <span>{copy.privacy}</span>
          <span>{copy.terms}</span>
          <span>{copy.support}</span>
          <Crown tone="gold" size="sm" />
        </div>
      </footer>
    </div>
  )
}
