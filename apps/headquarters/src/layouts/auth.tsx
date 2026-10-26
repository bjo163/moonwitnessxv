import type { ReactNode } from 'react'
import { BrandLogo, Crown, LinkButton, ZineNote } from '@moonwitness/moonui'
import { SITE_NAME } from '@/lib/env'

/**
 * The "Enter SHADOW" punk-zine login surface matching reference Image 3:
 * built from @moonwitness/moonui primitives (BrandLogo, Crown, LinkButton, ZineNote).
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="hq-auth-shell">
      <header className="hq-auth-topbar">
        <div className="m-row" style={{ gap: 16 }}>
          <Crown tone="cyan" size="lg" />
          <BrandLogo
            href="/"
            size="lg"
            subtitle={
              <span>
                EMPIRE OF THE LIGHT · <strong>A-L-L-A-H</strong>
              </span>
            }
          />
        </div>

        <div className="m-row" style={{ gap: 18 }}>
          <ZineNote tone="dark" tilt="left">
            🌐 SAME MOON · DIFFERENT PEOPLE
          </ZineNote>
          <LinkButton href="/" variant="accent" size="md">
            FOLLOW THE SIGNAL <span aria-hidden="true">→</span>
          </LinkButton>
        </div>
      </header>

      <div className="hq-auth-stage">
        {/* Left decorative punk-zine strip */}
        <aside className="hq-auth-zine-left" aria-hidden="true">
          <ZineNote tone="dark" tilt="left">
            DIFFERENT
            <br />
            PEOPLE
            <br />
            SAME SKY
            <br />
            STORIES
            <br />
            BEYOND
            <br />
            BORDERS.
            <div style={{ marginTop: 6 }}>
              <Crown tone="gold" size="sm" />
            </div>
          </ZineNote>

          <div>
            <img src="/art/manga-eye.jpg" alt="" className="hq-zine-eye-img" />
            <ZineNote tone="pink" tilt="left">
              WITNESS
              <br />
              THE REAL.
            </ZineNote>
          </div>

          <ZineNote tone="dark" tilt="none">
            🌐 PEOPLE · PLACES · IDEAS · CULTURES · BEYOND BORDERS.
          </ZineNote>
        </aside>

        {/* Center login command card */}
        <main className="hq-auth-card-wrap">{children}</main>

        {/* Right cyberpunk moon watcher illustration */}
        <section className="hq-auth-watcher" aria-label="Moonwitness rooftop artwork">
          <img
            src="/art/login-watcher.jpg"
            alt="Moonwitness watcher on a rooftop overlooking a cyberpunk city and giant blue moon"
            className="hq-watcher-img"
          />
          <div className="hq-watcher-tag-top">
            <ZineNote tone="dark" tilt="left">
              SAME MOON
              <br />
              DIFFERENT PEOPLE ☆
            </ZineNote>
          </div>
          <div className="hq-watcher-tag-right">
            <ZineNote tone="dark" tilt="right">
              STORIES · PEOPLE · WORLDS IN MOTION.
            </ZineNote>
          </div>
          <div className="hq-watcher-poster">
            <ZineNote tone="paper" tilt="left">
              A BRIGHTER
              <br />
              TOMORROW FOR A
              <br />
              BOLDER HUMANITY. <Crown tone="gold" size="sm" />
            </ZineNote>
          </div>
          <div className="hq-watcher-follow">
            <ZineNote tone="accent" tilt="left">
              FOLLOW THE SIGNAL
            </ZineNote>
          </div>
        </section>
      </div>

      <footer className="hq-auth-footer">
        <div>
          ☺ <strong>Moonwitness</strong> // Create · Curate · Publish · <span className="m-muted">{SITE_NAME}</span>
        </div>
        <div className="m-row m-muted" style={{ gap: 16 }}>
          <span>Privacy</span>
          <span>Terms</span>
          <span>Support</span>
          <Crown tone="gold" size="sm" />
        </div>
      </footer>
    </div>
  )
}
