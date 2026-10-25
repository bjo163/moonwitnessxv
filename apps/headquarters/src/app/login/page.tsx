import { Alert, Button, Field, Panel, TextInput } from '@moonwitness/moonui'
import { AuthLayout } from '@/layouts/auth'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next } = await searchParams

  return (
    <AuthLayout>
      <Panel title="Sign in" subtitle="admin credentials from moonql-auth">
        <div className="m-stack">
          {error ? <Alert tone="hot">{error}</Alert> : null}
          <form action="/api/session" method="post" className="m-stack">
            <input type="hidden" name="next" value={next ?? '/'} />
            <Field label="Login" htmlFor="login">
              <TextInput id="login" name="login" autoComplete="username" required autoFocus />
            </Field>
            <Field label="Password" htmlFor="password">
              <TextInput id="password" name="password" type="password" autoComplete="current-password" required />
            </Field>
            <Button type="submit" variant="primary">
              Enter the command center
            </Button>
          </form>
          <p className="m-muted" style={{ fontSize: 12, margin: 0 }}>
            The token is stored in an httpOnly cookie and never leaves the server.
          </p>
        </div>
      </Panel>
    </AuthLayout>
  )
}
