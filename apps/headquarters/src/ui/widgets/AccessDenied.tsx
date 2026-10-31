import { AccessDeniedView } from '@moonwitness/moonui'
import { cookies, headers } from 'next/headers'
import { resolveLocale } from '@moonwitness/core'
import { denialCopy, denialMessage, type DenialCopyKey } from '@/lib/denial-copy'

/**
 * What a guarded page renders instead of privileged content.
 *
 * ADR-0017: this file is the container only — it resolves the locale and the
 * denial code; the screen itself is MoonUI's `AccessDeniedView`.
 *
 * It is deliberately data-free: a denial never shows a partially loaded admin
 * shell, and the only text it can contain is a localized string chosen by a
 * stable code. `code` is typed to the two denial codes, so the anonymous case
 * (a session problem, handled by a redirect) cannot reach this view at all.
 */
export async function AccessDenied({ code }: { code: DenialCopyKey }) {
  // Same ADR-0005 precedence the login page applies: persisted cookie, then
  // Accept-Language, then the default. A denial nobody can read is not a denial.
  const [requestHeaders, requestCookies] = await Promise.all([headers(), cookies()])
  const resolution = resolveLocale({
    persistedLocale: requestCookies.get('mw_locale')?.value,
    acceptLanguage: requestHeaders.get('accept-language'),
  })
  const locale = 'status' in resolution ? 'en' : resolution.locale
  const message = denialMessage(locale, code)
  const copy = denialCopy(locale)
  if (!message) return null

  return (
    <AccessDeniedView
      title={message.title}
      body={message.body}
      backHref="/"
      backLabel={copy.back}
      retryLabel={copy.retry}
      canRetry={code === 'unavailable'}
      subtitle="access checked on the server, before any record was read"
    />
  )
}
