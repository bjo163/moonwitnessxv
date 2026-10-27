import type { ReactNode } from 'react'
import { Alert, PageHeader } from '@moonwitness/moonui'
import { headers } from 'next/headers'
import { DOCK_LOCALE_HEADER, localeFromMiddlewareHeader } from '@/lib/locale-context.mjs'
import { getStatesCopy } from '@/lib/states-copy'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Comparative Reader',
  description: 'Compare only source text available through an approved public projection.',
}

export default async function ComparePage(): Promise<ReactNode> {
  const requestHeaders = await headers()
  const locale = localeFromMiddlewareHeader(requestHeaders.get(DOCK_LOCALE_HEADER))
  const copy = getStatesCopy(locale)

  return (
    <div className="m-stack" style={{ gap: 24, maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <PageHeader
        title="Comparative Reader"
        subtitle="Source text is shown only after an approved public projection is available."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Reader', href: '/reader' },
          { label: 'Compare' },
        ]}
      />
      <Alert tone="hot">{copy.errorResearchUnavailable}</Alert>
    </div>
  )
}
