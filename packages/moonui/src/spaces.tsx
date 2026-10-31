import type { ReactNode } from 'react'
import { cn } from './cn.js'
import { Chevron } from './glyph.js'
import { IconBookOpen, IconCompass, IconRadio, IconSparkles } from './icons/index.js'
import { Tape, type TapeTone } from './zine.js'

/**
 * The four public spaces agreed in ADR-0009. Every status is a word, never a
 * colour or a counter: a card may not imply that a planned surface is live.
 */
export type SpaceStatus = 'REAL' | 'PLANNED' | 'DEMO'

export type SpaceTone = 'accent' | 'cyan' | 'pink' | 'moon'

export type SpaceIcon = 'read' | 'explore' | 'create' | 'signal'

const STATUS_TAPE_TONE: Record<SpaceStatus, TapeTone> = {
  REAL: 'accent',
  PLANNED: 'cyan',
  DEMO: 'pink',
}

function SpaceGlyph({ icon }: { icon: SpaceIcon }): ReactNode {
  const glyph =
    icon === 'read' ? (
      <IconBookOpen size={22} />
    ) : icon === 'explore' ? (
      <IconCompass size={22} />
    ) : icon === 'create' ? (
      <IconSparkles size={22} />
    ) : (
      <IconRadio size={22} />
    )
  return (
    <span className="m-space-icon" aria-hidden="true">
      {glyph}
    </span>
  )
}

export interface SpaceCardProps {
  tone: SpaceTone
  icon: SpaceIcon
  title: string
  description: string
  status: SpaceStatus
  statusText: string
  openLabel: string
  href: string
  note?: string
}

/**
 * One entry in the four-space taxonomy. It is a native anchor with no custom
 * keyboard handling: focus, Enter and the context menu belong to the browser.
 */
export function SpaceCard({
  tone,
  icon,
  title,
  description,
  status,
  statusText,
  openLabel,
  href,
  note,
}: SpaceCardProps): ReactNode {
  return (
    <a className="m-space-card" data-tone={tone} href={href}>
      <SpaceGlyph icon={icon} />
      <h3 className="m-space-title">{title}</h3>
      <p className="m-space-body">{description}</p>
      {note ? <p className="m-space-note">{note}</p> : null}
      <div className="m-space-meta">
        <Tape tone={STATUS_TAPE_TONE[status]}>{statusText}</Tape>
        <span className="m-space-open">
          {openLabel} <Chevron dir="right" />
        </span>
      </div>
    </a>
  )
}

/**
 * The grid owns layout only. Routes, locale and copy arrive as props, so a
 * surface never has to re-derive the taxonomy to publish it.
 */
export function SpaceGrid({
  spaces,
  heading,
  headingId = 'm-spaces-title',
  className,
}: {
  spaces: SpaceCardProps[]
  heading?: ReactNode
  headingId?: string
  className?: string
}): ReactNode {
  return (
    <section className={cn('m-stack', className)} aria-labelledby={heading ? headingId : undefined} style={{ gap: 14 }}>
      {heading ? (
        <h2 id={headingId} className="m-space-heading" style={{ margin: 0 }}>
          {heading}
        </h2>
      ) : null}
      <div className="m-space-grid">
        {spaces.map((space) => (
          <SpaceCard key={space.title} {...space} />
        ))}
      </div>
    </section>
  )
}
