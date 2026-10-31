import type { CSSProperties, ReactNode } from 'react'
import { MOON_EXPERIENCES, type MoonExperienceName } from './tokens.js'
import { cn } from './cn.js'

export interface AppShellProps {
  header: ReactNode
  nav?: ReactNode
  children: ReactNode
  footer: ReactNode
  experience?: MoonExperienceName
  className?: string
  skipToContentLabel?: string
  mainId?: string
}

/**
 * Application shell that orchestrates header, navigation, main content, and footer.
 * Owns landmark structure (single <main>, single <nav>, skip link) and experience token injection.
 * Applications supply header, footer, and content as props; they may not re-declare landmark anatomy.
 */
export function AppShell({
  header,
  nav,
  children,
  footer,
  experience,
  className,
  skipToContentLabel = 'Skip to content',
  mainId = 'main',
}: AppShellProps): ReactNode {
  const tokens = experience ? MOON_EXPERIENCES[experience] : undefined
  const experienceStyle = tokens
    ? ({
        '--experience-measure': tokens.measure,
        '--experience-max-width': tokens.maxWidth,
        '--experience-density': tokens.density,
        '--experience-line-height': tokens.lineHeight,
        '--experience-heading-font': tokens.fonts.heading,
        '--experience-body-font': tokens.fonts.body,
        '--experience-code-font': tokens.fonts.code,
        '--experience-display-size': tokens.typeScale.display,
        '--experience-heading-size': tokens.typeScale.heading,
        '--experience-body-size': tokens.typeScale.body,
        '--experience-caption-size': tokens.typeScale.caption,
        '--experience-code-size': tokens.typeScale.code,
        '--experience-gutter': tokens.space.gutter,
        '--experience-section-gap': tokens.space.section,
        '--experience-inline-gap': tokens.space.inline,
      } as CSSProperties)
    : undefined

  return (
    <div className={cn('m-shell', className)}>
      <a className="m-skip" href={`#${mainId}`}>
        {skipToContentLabel}
      </a>
      <header className="m-shell-header">{header}</header>
      {nav ? (
        <nav className="m-shell-nav" aria-label="Primary">
          {nav}
        </nav>
      ) : null}
      <main
        className="m-shell-main"
        id={mainId}
        tabIndex={-1}
        data-experience={experience}
        style={experienceStyle}
      >
        {children}
      </main>
      <footer className="m-shell-footer">{footer}</footer>
    </div>
  )
}
