import {
  DEFAULT_LOCALE,
  defineLocaleCatalog,
  resolveLocale,
  type Locale,
  type LocaleCatalog,
  type LocaleResolutionInput,
} from '@moonwitness/core'
import type { NavGroup } from '@moonwitness/moonui'

/**
 * M19-21 shell/navigation/status catalog for the Headquarters Mission Control
 * chrome. It reuses the exact shared mechanism established by M19-20's login
 * catalog (`apps/headquarters/src/lib/login-copy.ts`): a typed, parity-checked
 * `defineLocaleCatalog` from `@moonwitness/core` (which throws if the `id` and
 * `en` key sets ever diverge) plus `resolveLocale` for deterministic negotiation.
 *
 * Only shell chrome lives here. Navigation labels that come from `_schema.menu`
 * and model/field identifiers are owned by M19-22 and stay untranslated; the
 * `mc:*` keys, hrefs and monogram icons below are stable route identifiers and
 * are never localized.
 */
const shellCatalog = defineLocaleCatalog({
  en: {
    brandSubtitle: 'EMPIRE OF THE LIGHT',
    navGroupMissionControl: 'Mission Control',
    navDashboard: 'Dashboard',
    navMissionControl: 'Mission Control',
    navProjectUniverse: 'Project Universe',
    navStoryForge: 'Story Forge',
    navPosterLab: 'Poster Lab',
    navResearchLab: 'Research Lab',
    navWorldMonitor: 'World Monitor',
    navPublishingHub: 'Publishing Hub',
    navSettings: 'Settings',
    breadcrumbEmpire: 'The Empire',
    breadcrumbMissionControl: 'Mission Control',
    searchPlaceholder: 'Search projects, stories, research, or people...',
    searchLabel: 'Search projects, stories, research, or people',
    alertsLink: 'Alerts',
    logOut: 'Log out',
    userScope: 'Empire',
    statusOpsLoaded: 'ops loaded',
    statusHubFallback: 'Hub reachable',
    statusDemoAlerts: 'Alerts preview: a demo count, not live telemetry',
    zineDifferentPeople: 'DIFFERENT PEOPLE · SAME SKY · STORIES BEYOND BORDERS.',
    zineWitnessReal: 'WITNESS THE REAL.',
  },
  id: {
    brandSubtitle: 'KEKAISARAN CAHAYA',
    navGroupMissionControl: 'Pusat Kendali Misi',
    navDashboard: 'Dasbor',
    navMissionControl: 'Pusat Kendali Misi',
    navProjectUniverse: 'Proyek Alam Semesta',
    navStoryForge: 'Penempaan Cerita',
    navPosterLab: 'Lab Poster',
    navResearchLab: 'Lab Riset',
    navWorldMonitor: 'Pemantau Dunia',
    navPublishingHub: 'Hub Penerbitan',
    navSettings: 'Pengaturan',
    breadcrumbEmpire: 'Kekaisaran',
    breadcrumbMissionControl: 'Pusat Kendali Misi',
    searchPlaceholder: 'Cari proyek, cerita, riset, atau orang...',
    searchLabel: 'Cari proyek, cerita, riset, atau orang',
    alertsLink: 'Peringatan',
    logOut: 'Keluar',
    userScope: 'Kekaisaran',
    statusOpsLoaded: 'ops termuat',
    statusHubFallback: 'Hub terjangkau',
    statusDemoAlerts: 'Pratinjau peringatan: jumlah demo, bukan telemetri langsung',
    zineDifferentPeople: 'ORANG BERBEDA · LANGIT YANG SAMA · CERITA MELAMPAUI BATAS.',
    zineWitnessReal: 'Saksikan yang nyata.',
  },
})

export type ShellMessageKey = keyof (typeof shellCatalog)['en']

/** Operational labels proven from live Hub schema — real signals. */
export const REAL_OPERATIONAL_KEYS = ['statusOpsLoaded', 'statusHubFallback'] as const
/** Operational labels for fabricated/illustrative shell data — never live. */
export const DEMO_OPERATIONAL_KEYS = ['statusDemoAlerts'] as const

export type RealOperationalKey = (typeof REAL_OPERATIONAL_KEYS)[number]
export type DemoOperationalKey = (typeof DEMO_OPERATIONAL_KEYS)[number]

/**
 * A real-vs-demo operation is carried as an explicit discriminated source, so a
 * caller cannot accidentally pass a demo key under a `live` source (or the
 * reverse): the type and the key sets are kept disjoint by construction.
 */
export type OperationalStatus =
  | { readonly source: 'live'; readonly status: RealOperationalKey }
  | { readonly source: 'demo'; readonly status: DemoOperationalKey }

/**
 * Resolve the shell locale with the same precedence M19-20 used for login:
 * the persisted `mw_locale` preference then Accept-Language, with English as the
 * deterministic default. The shell has no locale-prefixed route segment, so this
 * input intentionally excludes `urlLocale`; unsupported URLs remain rejectable
 * by any future locale-aware router.
 */
export function resolveShellLocale(input: Pick<LocaleResolutionInput, 'persistedLocale' | 'acceptLanguage'>): Locale {
  const resolution = resolveLocale(input)
  return 'status' in resolution ? DEFAULT_LOCALE : resolution.locale
}

export function shellCopy(locale: Locale): LocaleCatalog<ShellMessageKey>['en'] {
  return shellCatalog[locale]
}

/** Localized shell-owned navigation; route keys, hrefs and icons stay stable. */
export function missionControlGroup(locale: Locale): NavGroup {
  const copy = shellCopy(locale)
  return {
    label: copy.navGroupMissionControl,
    items: [
      { key: 'mc:dashboard', label: copy.navDashboard, href: '/#telemetry', icon: 'DB' },
      { key: 'mc:mission-control', label: copy.navMissionControl, href: '/', icon: 'MC' },
      { key: 'mc:project-universe', label: copy.navProjectUniverse, href: '/#project-universe', icon: 'PU' },
      { key: 'mc:story-forge', label: copy.navStoryForge, href: '/models', icon: 'SF' },
      { key: 'mc:poster-lab', label: copy.navPosterLab, href: '/views', icon: 'PL' },
      { key: 'mc:research-lab', label: copy.navResearchLab, href: '/models/monitor_radars', icon: 'RL' },
      { key: 'mc:world-monitor', label: copy.navWorldMonitor, href: '/world-monitor', icon: 'WM' },
      { key: 'mc:publishing-hub', label: copy.navPublishingHub, href: '/models/scheduleSlot', icon: 'PH' },
      { key: 'mc:settings', label: copy.navSettings, href: '/system', icon: 'ST' },
    ],
  }
}

/**
 * Look up an operational status label. The demo/live distinction is structural:
 * a `demo` source can only resolve to a demo key (whose copy names it a demo in
 * both locales), so localization can never blur simulated data into live status.
 */
export function operationalStatusLabel(locale: Locale, status: OperationalStatus): string {
  return shellCatalog[locale][status.status]
}
