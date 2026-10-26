import { Alert, Button, Card, CardBody, Crown, Field, TextInput, Toggle, Chevron } from '@moonwitness/moonui'
import { AuthLayout } from '@/layouts/auth'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next } = await searchParams

  return (
    <AuthLayout>
      <Card variant="shadow" className="hq-shadow-card">
        <CardBody className="m-stack" style={{ gap: 18, padding: 28 }}>
          <div className="hq-shadow-head">
            <Crown tone="gold" size="lg" />
            <h1 className="hq-shadow-title">
              Enter <span>SHADOW</span>
            </h1>
            <p className="m-mono m-muted" style={{ margin: '6px 0 0', fontSize: 12 }}>
              Private Command Center for stories,
              <br />
              research, posters, and publishing.
            </p>
          </div>

          {error ? <Alert tone="hot">{error}</Alert> : null}

          <form action="/api/session" method="post" className="m-stack" style={{ gap: 14 }}>
            <input type="hidden" name="next" value={next ?? '/'} />

            <Field label="Email or Username" htmlFor="login">
              <TextInput
                id="login"
                name="login"
                icon="ID"
                autoComplete="username"
                placeholder="Enter your email or username"
                required
                autoFocus
              />
            </Field>

            <Field label="Password" htmlFor="password">
              <TextInput
                id="password"
                name="password"
                type="password"
                icon="PW"
                autoComplete="current-password"
                placeholder="Enter your password"
                required
              />
            </Field>

            <div className="m-row" style={{ justifyContent: 'space-between', fontSize: 12 }}>
              <Toggle name="remember" defaultChecked label="Remember me" />
              <a href="/login" style={{ color: 'var(--cyan)' }}>
                Forgot password?
              </a>
            </div>

            <Button type="submit" variant="primary" size="lg">
              ENTER THE SHADOW <Chevron dir="right" />
            </Button>
          </form>

          <div className="m-row m-muted m-mono" style={{ justifyContent: 'center', fontSize: 12 }}>
            <Crown tone="gold" size="sm" />
            <span>Authorized crew only.</span>
          </div>
        </CardBody>
      </Card>
    </AuthLayout>
  )
}
