import { notFound } from 'next/navigation'
import { Badge, PageHeader } from '@moonwitness/moonui'
import { readTerm } from '@/data/queries/terms'
import { TermDetailView } from '@/ui/components/terms'
import { headers } from 'next/headers'
import { DOCK_LOCALE_HEADER, dockHrefFor, localeFromMiddlewareHeader } from '@/lib/locale-context.mjs'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'UNILEX Term',
  description: 'A single term with its forms, context-scoped senses, provenance and review history.',
}

export default async function TermPage({ params }: { params: Promise<{ stableId: string }> }) {
  const requestHeaders = await headers()
  const locale = localeFromMiddlewareHeader(requestHeaders.get(DOCK_LOCALE_HEADER))
  const localeHref = dockHrefFor(locale)
  const { stableId } = await params
  const detail = await readTerm(stableId)
  if (!detail) notFound()

  return (
    <div className="m-stack" style={{ gap: 20 }}>
      <PageHeader
        title={`${detail.term.preferredEn} · ${detail.term.preferredId}`}
        subtitle="Stable ID, source-backed senses and the reviewer trail behind every identity decision"
        breadcrumbs={[
          { label: 'Home', href: localeHref('/') },
          { label: 'Terms', href: localeHref('/terms') },
          { label: detail.term.stableId },
        ]}
        actions={<Badge tone="cyan">{detail.term.lane}</Badge>}
      />
      <TermDetailView detail={detail} locale={locale} />
    </div>
  )
}
