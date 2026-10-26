import { notFound } from 'next/navigation'
import { Badge, PageHeader } from '@moonwitness/moonui'
import { readRelationDetail } from '@/data/queries/graph'
import { RelationDetailView } from '@/ui/components/graph-relation'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Constellation relation',
  description:
    'A candidate claim or a reviewed relation with its exact evidence provenance, release membership and unresolved state.',
}

export default async function RelationPage({ params }: { params: Promise<{ relationCode: string }> }) {
  const { relationCode } = await params
  const detail = await readRelationDetail(relationCode)
  if (!detail) notFound()

  const relation = detail.relation
  return (
    <div className="m-stack" style={{ gap: 20 }}>
      <PageHeader
        title={relation.code}
        subtitle={
          relation.kind === 'CANDIDATE'
            ? 'Candidate claim under review — never presented as a graph edge'
            : 'Reviewed ontology relation — enters the graph only through an immutable release'
        }
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Constellation', href: '/constellation' },
          { label: relation.code },
        ]}
        actions={<Badge tone={relation.kind === 'CANDIDATE' ? 'accent' : 'cyan'}>{relation.kind}</Badge>}
      />
      <RelationDetailView detail={detail} />
    </div>
  )
}
