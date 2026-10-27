import { notFound } from 'next/navigation'
import { Badge, PageHeader } from '@moonwitness/moonui'
import { readRelationDetail, readSamePairRelations, type SamePairRelations } from '@/data/queries/graph'
import { panelErrorMessage } from '@/data/queries/error'
import { RelationAlternativesView, RelationDetailView } from '@/ui/components/graph-relation'
import { OutcomePanel, readPanel, type PanelCopy } from '@/ui/components/states'
import { headers } from 'next/headers'
import { DOCK_LOCALE_HEADER, dockHrefFor, localeFromMiddlewareHeader } from '@/lib/locale-context.mjs'
import { getStatesCopy } from '@/lib/states-copy'
import { getProvenanceCopy } from '@/lib/provenance-copy'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Constellation relation',
  description:
    'A candidate claim or a reviewed relation with its exact evidence provenance, release membership, stated uncertainty and the other claims the graph carries for the same pair.',
}

export default async function RelationPage({ params }: { params: Promise<{ relationCode: string }> }) {
  const requestHeaders = await headers()
  const locale = localeFromMiddlewareHeader(requestHeaders.get(DOCK_LOCALE_HEADER))
  const localeHref = dockHrefFor(locale)
  const { relationCode } = await params
  const detail = await readRelationDetail(relationCode)
  if (!detail) notFound()

  const relation = detail.relation
  const copy = getStatesCopy(locale)
  const provenance = getProvenanceCopy(locale)

  /**
   * UI-P06d · the same-pair alternatives come from the public graph overview, so
   * this is one extra read of an endpoint this route does not otherwise call,
   * against an existing D03 projection — no new route, table or owner.
   *
   * `isEmpty` never fires on purpose: an empty alternative list is an answer the
   * section states in words, not a panel to be replaced by an empty state. Only a
   * rejected read is an error, and it is named with the shared unavailable
   * notice for the graph projection.
   */
  const alternativesCopy: PanelCopy = {
    loadingLabel: copy.loadingContent,
    emptyTitle: provenance.alternativesEmptyTitle,
    emptyHint: provenance.alternativesLimitHint,
    errorMessage: copy.errorGraphUnavailable,
  }
  const alternativesOutcome = await readPanel<SamePairRelations>(
    () => readSamePairRelations(relation),
    alternativesCopy,
    () => false,
    (err) => panelErrorMessage(err, copy.errorGraphUnavailable),
  )

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
          { label: 'Home', href: localeHref('/') },
          { label: 'Constellation', href: localeHref('/constellation') },
          { label: relation.code },
        ]}
        actions={<Badge tone={relation.kind === 'CANDIDATE' ? 'accent' : 'cyan'}>{relation.kind}</Badge>}
      />
      <RelationDetailView detail={detail} locale={locale} />
      <OutcomePanel outcome={alternativesOutcome} copy={alternativesCopy}>
        {(value) => <RelationAlternativesView inspected={relation} samePair={value} locale={locale} />}
      </OutcomePanel>
    </div>
  )
}
