import type { ReactNode } from 'react'
import { Alert, PageHeader } from '@moonwitness/moonui'
import { headers } from 'next/headers'
import { DOCK_LOCALE_HEADER, dockHrefFor, localeFromMiddlewareHeader } from '@/lib/locale-context.mjs'
import { getStatesCopy } from '@/lib/states-copy'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'SRGBL Research & MIZAN Review Ledger',
  description: 'Stage-gated hermeneutic analysis (S1–L5), Key Witness candidate scores, adversarial hypotheses and MIZAN four-eyes review trail.',
}

export default async function ResearchPage(): Promise<ReactNode> {
  const requestHeaders = await headers()
  const locale = localeFromMiddlewareHeader(requestHeaders.get(DOCK_LOCALE_HEADER))
  const localeHref = dockHrefFor(locale)
  const copy = getStatesCopy(locale)

  return (
    <div className="m-stack" style={{ gap: 20 }}>
      <PageHeader
        title="SRGBL Research & MIZAN Review Ledger"
        subtitle="S1–L5 Stage Gates · Key Witness Scoring · Adversarial Hypotheses · Four-Eyes MIZAN Governance"
        breadcrumbs={[{ label: 'Home', href: localeHref('/') }, { label: 'Research' }]}
      />

      <Alert tone="hot">{copy.errorResearchUnavailable}</Alert>
    </div>
  )
}
