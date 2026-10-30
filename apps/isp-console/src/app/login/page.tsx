import { Alert, Button, Card, CardBody, Field, TextInput } from '@moonwitness/moonui'
import { COPY, consoleLocale } from '@/lib/copy'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string; lang?: string }> }) {
  const params = await searchParams
  const locale = consoleLocale(params.lang)
  const copy = COPY[locale]
  return (
    <main className="isp-shell isp-login">
      <Card variant="shadow">
        <CardBody className="m-stack" style={{ gap: 18, padding: 28 }}>
          <div className="isp-brand">{copy.eyebrow}</div>
          <h1 className="m-page-title">{copy.loginTitle}</h1>
          <p className="m-muted">{copy.privateLabel}</p>
          {params.error ? <Alert tone="hot" role="alert">{params.error === 'unavailable' ? copy.unavailable : copy.loginFailed}</Alert> : null}
          <form action="/api/session" method="post">
            <input type="hidden" name="next" value={params.next ?? '/'} />
            <Field label={copy.usernameLogin} htmlFor="login">
              <TextInput id="login" name="login" autoComplete="username" required maxLength={60} />
            </Field>
            <Field label={copy.password} htmlFor="password">
              <TextInput id="password" name="password" type="password" autoComplete="current-password" required maxLength={256} />
            </Field>
            <Button type="submit" variant="accent" size="lg">{copy.submit}</Button>
          </form>
          <div className="isp-locale" aria-label={copy.locale}>
            <a href="/login?lang=id" aria-current={locale === 'id'}>ID</a>
            <a href="/login?lang=en" aria-current={locale === 'en'}>EN</a>
          </div>
        </CardBody>
      </Card>
    </main>
  )
}
