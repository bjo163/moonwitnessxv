import type { ReactNode } from 'react'
import {
  Chevron,
  IconBookOpen,
  IconCompass,
  IconRadio,
  IconSparkles,
  Tape,
  type TapeTone,
} from '@moonwitness/moonui'
import type { Locale } from '@moonwitness/core'
import { getLandingCopy } from '@/lib/landing-copy'
import { localizedDockHref } from '@/lib/locale-context.mjs'

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

function statusLabel(
  status: SpaceStatus,
  copy: ReturnType<typeof getLandingCopy>,
): string {
  if (status === 'REAL') return copy.statusReal
  if (status === 'PLANNED') return copy.statusPlanned
  return copy.statusDemo
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
    <span className="dk-space-icon" aria-hidden="true">
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
    <a className="dk-space-card" data-tone={tone} href={href}>
      <SpaceGlyph icon={icon} />
      <h3 className="dk-space-title">{title}</h3>
      <p className="dk-space-body">{description}</p>
      {note ? <p className="dk-space-note">{note}</p> : null}
      <div className="dk-space-meta">
        <Tape tone={STATUS_TAPE_TONE[status]}>{statusText}</Tape>
        <span className="dk-space-open">
          {openLabel} <Chevron dir="right" />
        </span>
      </div>
    </a>
  )
}

/**
 * Home entry taxonomy: READ / EXPLORE / CREATE / SIGNAL. Each destination
 * renders real content today; CREATE is marked DEMO because publishing is not
 * authorized yet (M33).
 */
export function SpaceGrid({ locale }: { locale: Locale }): ReactNode {
  const copy = getLandingCopy(locale)
  const spaces: SpaceCardProps[] = [
    {
      tone: 'accent',
      icon: 'read',
      title: copy.spaceRead,
      description: copy.spaceReadBody,
      status: 'REAL',
      statusText: statusLabel('REAL', copy),
      openLabel: copy.spaceOpen,
      href: localizedDockHref('/reader', '', '', locale),
    },
    {
      tone: 'cyan',
      icon: 'explore',
      title: copy.spaceExplore,
      description: copy.spaceExploreBody,
      status: 'REAL',
      statusText: statusLabel('REAL', copy),
      openLabel: copy.spaceOpen,
      href: localizedDockHref('/terms', '', '', locale),
    },
    {
      tone: 'pink',
      icon: 'create',
      title: copy.spaceCreate,
      description: copy.spaceCreateBody,
      status: 'DEMO',
      statusText: statusLabel('DEMO', copy),
      openLabel: copy.spaceOpen,
      href: localizedDockHref('/studio', '', '', locale),
      note: copy.spaceCreateNote,
    },
    {
      tone: 'moon',
      icon: 'signal',
      title: copy.spaceSignal,
      description: copy.spaceSignalBody,
      status: 'REAL',
      statusText: statusLabel('REAL', copy),
      openLabel: copy.spaceOpen,
      href: localizedDockHref('/stations', '', '', locale),
    },
  ]

  return (
    <section className="m-stack" aria-labelledby="dk-spaces-title" style={{ gap: 14 }}>
      <h2 id="dk-spaces-title" className="dk-eyebrow" style={{ margin: 0 }}>
        {copy.spacesHeading}
      </h2>
      <div className="dk-space-grid">
        {spaces.map((space) => (
          <SpaceCard key={space.title} {...space} />
        ))}
      </div>
    </section>
  )
}
