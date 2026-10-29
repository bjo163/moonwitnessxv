import { Button, Card, CardBody, Crown, Field, TextInput, Toggle, Chevron } from '@moonwitness/moonui'
import { cookies, headers } from 'next/headers'
import { resolveLocale } from '@moonwitness/core'
import { AuthLayout } from '@/layouts/auth'
import { loginCopy, loginErrorMessage } from '@/lib/login-copy'
import { LiveAlert } from '@/ui/LiveAlert'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next } = await searchParams
  const [requestHeaders, requestCookies] = await Promise.all([headers(), cookies()])
  const resolution = resolveLocale({
    persistedLocale: requestCookies.get('mw_locale')?.value,
    acceptLanguage: requestHeaders.get('accept-language'),
  })
  const locale = 'status' in resolution ? 'en' : resolution.locale
  const copy = loginCopy(locale)
  const notice = loginErrorMessage(locale, error)

  return (
    <AuthLayout locale={locale}>
      <Card variant="shadow" className="hq-shadow-card">
        <CardBody className="m-stack" style={{ gap: 18, padding: 28 }}>
          <div className="hq-shadow-head">
            <Crown tone="gold" size="lg" />
            <h1 className="hq-shadow-title">
              {copy.title} <span>SHADOW</span>
            </h1>
            <p className="m-mono m-muted" style={{ margin: '6px 0 0', fontSize: 12 }}>
              {copy.subtitle}
            </p>
          </div>

          {notice ? <LiveAlert role="alert" tone="hot">{notice}</LiveAlert> : null}

          <form action="/api/session" method="post" className="m-stack" style={{ gap: 14 }}>
            <input type="hidden" name="next" value={next ?? '/'} />

            <Field label={copy.loginLabel} htmlFor="login">
              <TextInput
                id="login"
                name="login"
                icon="ID"
                autoComplete="username"
                placeholder={copy.loginPlaceholder}
                required
                autoFocus
              />
            </Field>

            <Field label={copy.passwordLabel} htmlFor="password">
              <TextInput
                id="password"
                name="password"
                type="password"
                icon="PW"
                autoComplete="current-password"
                placeholder={copy.passwordPlaceholder}
                required
              />
            </Field>

            <div className="m-row" style={{ justifyContent: 'space-between', fontSize: 12 }}>
              <Toggle name="remember" defaultChecked haptic={false} label={copy.rememberMe} />
              <a href="/login" style={{ color: 'var(--cyan)' }}>
                {copy.forgotPassword}
              </a>
            </div>

            <Button type="submit" variant="primary" size="lg">
              {copy.submit} <Chevron dir="right" />
            </Button>
          </form>

          <div className="m-row m-muted m-mono" style={{ justifyContent: 'center', fontSize: 12 }}>
            <Crown tone="gold" size="sm" />
            <span>{copy.authorizedCrew}</span>
          </div>
        </CardBody>
      </Card>
    </AuthLayout>
  )
}
