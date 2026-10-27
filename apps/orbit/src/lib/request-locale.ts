import { cookies, headers } from 'next/headers'
import { DEFAULT_LOCALE, resolveLocale, type Locale } from '@moonwitness/core'

/**
 * Server-side resolution of UI locale for ORBIT requests according to ADR-0005 precedence:
 * explicit query/param > persisted cookie (`mw_locale`) > Accept-Language header > DEFAULT_LOCALE (`en`).
 */
export async function getRequestLocale(explicitLocale?: string | null): Promise<Locale> {
  const [requestHeaders, requestCookies] = await Promise.all([headers(), cookies()])

  const resolution = resolveLocale({
    urlLocale: explicitLocale ?? undefined,
    persistedLocale: requestCookies.get('mw_locale')?.value,
    acceptLanguage: requestHeaders.get('accept-language'),
  })

  return 'locale' in resolution ? resolution.locale : DEFAULT_LOCALE
}
