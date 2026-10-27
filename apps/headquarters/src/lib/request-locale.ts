import { cookies, headers } from 'next/headers'
import { DEFAULT_LOCALE, resolveLocale, type Locale } from '@moonwitness/core'

/**
 * The request's UI locale, by the same ADR-0005 precedence the login page uses
 * (persisted cookie, then Accept-Language, then default). A denial screen has to
 * be readable, so it resolves the locale exactly like every other page does.
 */
export async function requestLocale(): Promise<Locale> {
  const [requestHeaders, requestCookies] = await Promise.all([headers(), cookies()])
  const resolution = resolveLocale({
    persistedLocale: requestCookies.get('mw_locale')?.value,
    acceptLanguage: requestHeaders.get('accept-language'),
  })
  return 'locale' in resolution ? resolution.locale : DEFAULT_LOCALE
}
