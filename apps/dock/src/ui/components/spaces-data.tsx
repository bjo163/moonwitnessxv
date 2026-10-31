import type { Locale } from '@moonwitness/core'
import type { SpaceCardProps, SpaceStatus } from '@moonwitness/moonui'
import { getLandingCopy } from '@/lib/landing-copy'
import { localizedDockHref } from '@/lib/locale-context.mjs'

/**
 * Dock owns its routes, its locale and its copy. MoonUI owns the card and the
 * grid (ADR-0017), so this module only answers "which four spaces, in which
 * words, at which href" — it renders nothing.
 *
 * Every destination renders real content today; CREATE is marked DEMO because
 * publishing is not authorized yet (M33).
 */
function statusLabel(status: SpaceStatus, copy: ReturnType<typeof getLandingCopy>): string {
  if (status === 'REAL') return copy.statusReal
  if (status === 'PLANNED') return copy.statusPlanned
  return copy.statusDemo
}

export function dockSpaces(locale: Locale): SpaceCardProps[] {
  const copy = getLandingCopy(locale)
  return [
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
}
