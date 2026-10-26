/** Canonical UI locales supported by the shared application contract. */
export const SUPPORTED_LOCALES = ['id', 'en'] as const

export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

/** Runtime guard for persisted or otherwise untrusted locale values. */
export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && SUPPORTED_LOCALES.some((locale) => locale === value)
}

/** Accept only canonical locale identifiers; negotiation belongs to M05-11. */
export function requireLocale(value: unknown): Locale {
  if (!isLocale(value)) {
    throw new RangeError(`Unsupported locale: ${String(value)}`)
  }
  return value
}

export type LocaleCatalog<Keys extends string> = Readonly<Record<Locale, Readonly<Record<Keys, string>>>>

/** Required UI labels only; optional long-form content stays outside this manifest. */
export type RequiredLocaleKey = string

/**
 * Build a catalog with identical semantic keys in both supported locales.
 * Extra or missing keys fail at runtime as well as in typed callers.
 */
export function defineLocaleCatalog<const Keys extends string>(
  catalog: LocaleCatalog<Keys>,
): LocaleCatalog<Keys> {
  const englishKeys = Object.keys(catalog.en).sort()
  const indonesianKeys = Object.keys(catalog.id).sort()
  if (englishKeys.length !== indonesianKeys.length || englishKeys.some((key, index) => key !== indonesianKeys[index])) {
    throw new TypeError('Locale catalogs must contain identical keys')
  }

  return Object.freeze({
    en: Object.freeze({ ...catalog.en }),
    id: Object.freeze({ ...catalog.id }),
  })
}

/** Verify that every required UI key exists in both locale dictionaries. */
export function assertRequiredLocaleKeys(
  catalog: Readonly<Record<Locale, Readonly<Record<string, unknown>>>>,
  requiredKeys: readonly RequiredLocaleKey[],
): void {
  const { missing } = verifyRequiredLocaleCatalog(catalog, requiredKeys)
  if (missing.length > 0) {
    throw new TypeError(`Missing required locale messages: ${missing.join(', ')}`)
  }
}

/** Verify statically listed required UI messages; callers own the key manifest. */
export function verifyRequiredLocaleCatalog(
  catalog: Readonly<Record<Locale, Readonly<Record<string, unknown>>>>,
  requiredKeys: readonly RequiredLocaleKey[],
): { valid: boolean; missing: readonly string[] } {
  const missing = requiredKeys.flatMap((key) =>
    SUPPORTED_LOCALES.filter((locale) => typeof catalog[locale][key] !== 'string').map((locale) => `${locale}.${key}`),
  )
  return { valid: missing.length === 0, missing }
}

/** Look up a message using a validated canonical locale. */
export function getLocaleMessage<Keys extends string>(
  catalog: LocaleCatalog<Keys>,
  locale: Locale,
  key: Keys,
): string {
  return catalog[locale][key]
}
