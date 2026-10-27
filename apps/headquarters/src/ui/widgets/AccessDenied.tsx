import { Alert, Button, PageHeader, Panel } from '@moonwitness/moonui'
import { cookies, headers } from 'next/headers'
import { resolveLocale } from '@moonwitness/core'
import { denialCopy, denialMessage, type DenialCopyKey } from '@/lib/denial-copy'

/**
 * What a guarded page renders instead of privileged content.
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
    <div className="m-stack">
      <PageHeader
        title={message.title}
        breadcrumbs={[{ label: 'HQ', href: '/' }]}
        actions={
          <a className="m-btn" href="/">
            {copy.back}
          </a>
        }
      />
      <Panel title={message.title} subtitle="access checked on the server, before any record was read">
        <div className="m-stack" style={{ gap: 12 }}>
          <Alert tone={code === 'unavailable' ? 'accent' : 'hot'}>{message.body}</Alert>
          {code === 'unavailable' ? (
            // no action: a GET form re-reads the current URL, i.e. re-checks
            // this exact page against the hub once it answers again
            <form method="get" className="m-row">
              <Button type="submit" variant="ghost">
                {copy.retry}
              </Button>
            </form>
          ) : null}
        </div>
      </Panel>
    </div>
  )
}
