import { DEFAULT_LOCALE, isLocale, type Locale } from './locale.js'

export interface LocaleResolutionInput {
  /** Locale route segment, when the current route contains one. */
  urlLocale?: unknown
  /** Locale explicitly persisted by the user. */
  persistedLocale?: unknown
  /** Existing account preference, if this runtime already provides one. */
  accountLocale?: unknown
  /** Raw Accept-Language header; no request or location lookup is performed. */
  acceptLanguage?: unknown
}

export type LocaleResolution =
  | { locale: Locale; source: 'url' | 'persisted' | 'account' | 'accept-language' | 'default' }
  | { status: 'unsupported-url-locale' }

interface LanguagePreference {
  locale: Locale
  quality: number
  order: number
}

/**
 * Resolve locale using ADR-0005 precedence. Invalid stored preferences are
 * ignored; an unsupported explicit route segment is returned for the router
 * to reject instead of silently remapping that URL.
 */
export function resolveLocale(input: LocaleResolutionInput): LocaleResolution {
  if (input.urlLocale !== undefined) {
    if (!isLocale(input.urlLocale)) return { status: 'unsupported-url-locale' }
    return { locale: input.urlLocale, source: 'url' }
  }

  if (isLocale(input.persistedLocale)) return { locale: input.persistedLocale, source: 'persisted' }
  if (isLocale(input.accountLocale)) return { locale: input.accountLocale, source: 'account' }

  const accepted = preferredLocale(input.acceptLanguage)
  if (accepted !== undefined) return { locale: accepted, source: 'accept-language' }
  return { locale: DEFAULT_LOCALE, source: 'default' }
}

/** Select the highest-quality supported language; header order breaks ties. */
export function preferredLocale(value: unknown): Locale | undefined {
  if (typeof value !== 'string') return undefined

  const preferences: LanguagePreference[] = []
  for (const [order, rawItem] of value.split(',').entries()) {
    const item = rawItem.trim()
    if (!item) continue

    const separator = item.indexOf(';')
    const range = (separator === -1 ? item : item.slice(0, separator)).trim()
    if (range === '*') continue

    let quality = 1
    if (separator !== -1) {
      const parameter = item.slice(separator + 1).trim()
      const match = /^q\s*=\s*(0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/i.exec(parameter)
      if (!match) continue
      quality = Number(match[1])
    }
    if (quality <= 0) continue

    const canonical = canonicalLanguageRange(range)
    if (canonical === undefined) continue
    const primary = canonical.split('-')[0]?.toLowerCase()
    if (primary !== 'id' && primary !== 'en') continue
    preferences.push({ locale: primary, quality, order })
  }

  preferences.sort((left, right) => right.quality - left.quality || left.order - right.order)
  return preferences[0]?.locale
}

function canonicalLanguageRange(value: string): string | undefined {
  try {
    return Intl.getCanonicalLocales(value)[0]
  } catch {
    return undefined
  }
}
