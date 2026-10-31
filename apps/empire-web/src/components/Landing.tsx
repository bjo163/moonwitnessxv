import type { LandingCopy, LandingSpace, SiteFooterCopy } from '@moonwitness/moonui'
import { content, landingExtras, type Locale } from '../lib/copy'
import { siteFooterCopy } from '../lib/site-copy'
import type { StoryLocale } from '../lib/story-universe'

/**
 * The props MoonUI's `LandingPage` renders.
 *
 * ADR-0017: no markup here. This module turns the site catalogue into the flat
 * copy object the shared entry shell needs and decides nothing but two data
 * mappings — the documented-status tone of a space and the locale-prefixed href
 * of a starting point.
 */
export interface LandingProps {
  copy: LandingCopy
  footer: SiteFooterCopy
}

const statusTone = (status: string): LandingSpace['statusTone'] =>
  status === 'CODE EXISTS' ? 'cyan' : 'night'

export function landingProps(locale: Locale): LandingProps {
  const t = content[locale]
  const extras = landingExtras[locale]
  return {
    copy: {
      lang: locale,
      eyebrow: t.eyebrow,
      kicker: t.kick,
      headline: [t.headline1, t.headline2],
      intro: t.intro,
      explore: t.explore,
      why: t.why,
      notice: t.notice,
      art: { top: extras.art.top, bottom: extras.art.bottom, mark: extras.art.mark, index: extras.art.index },
      missionIndex: extras.missionIndex,
      missionTitle: t.missionTitle,
      mission: t.mission,
      discoverTitle: extras.discoverTitle,
      discover: extras.discover.map((item) => ({
        href: `/${locale}/${item.section}`,
        label: item.label,
        description: item.description,
      })),
      spacesEyebrow: t.spacesEyebrow,
      spacesTitle: t.spacesTitle,
      spacesNote: t.spacesNote,
      spaces: t.spaces.map((space) => ({
        id: space.id,
        name: space.name,
        caption: space.caption,
        description: space.description,
        status: space.status,
        statusTone: statusTone(space.status),
        accent: space.accent,
      })),
      storyEyebrow: t.storyEyebrow,
      storyTitle: t.storyTitle,
      story: t.story,
      storyNote: t.storyNote,
      notebook: { date: extras.notebook.date, line: extras.notebook.line, foot: extras.notebook.foot },
      principlesEyebrow: t.principlesEyebrow,
      principlesTitle: t.principlesTitle,
      principles: [...t.principles],
    },
    footer: siteFooterCopy(locale as StoryLocale),
  }
}
