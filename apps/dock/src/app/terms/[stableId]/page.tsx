import { notFound } from 'next/navigation'
import { Badge, PageHeader } from '@moonwitness/moonui'
import { readTerm } from '@/data/queries/terms'
import { TermDetailView } from '@/ui/components/terms'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'UNILEX Term',
  description: 'A single term with its forms, context-scoped senses, provenance and review history.',
}

export default async function TermPage({ params }: { params: Promise<{ stableId: string }> }) {
  const { stableId } = await params
  const detail = await readTerm(stableId)
  if (!detail) notFound()

  return (
    <div className="m-stack" style={{ gap: 20 }}>
      <PageHeader
        title={`${detail.term.preferredEn} · ${detail.term.preferredId}`}
        subtitle="Stable ID, source-backed senses and the reviewer trail behind every identity decision"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Terms', href: '/terms' },
          { label: detail.term.stableId },
        ]}
        actions={<Badge tone="cyan">{detail.term.lane}</Badge>}
      />
      <TermDetailView detail={detail} />
    </div>
  )
}
