import type { ReactNode } from 'react'
import { Alert } from '@moonwitness/moonui'

type AlertRole = 'alert' | 'status'
type AlertTone = 'hot' | 'ok' | 'accent'

export function LiveAlert({
  role,
  tone,
  children,
}: {
  role: AlertRole
  tone: AlertTone
  children: ReactNode
}): ReactNode {
  return (
    <div role={role} aria-live={role === 'status' ? 'polite' : undefined}>
      <Alert tone={tone}>{children}</Alert>
    </div>
  )
}
