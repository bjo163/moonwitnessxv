import type { ReactNode } from 'react'
import { Alert, Badge, PageHeader } from '@moonwitness/moonui'
import { readResearchRegistry, type ResearchRegistry } from '@/data/queries/research'
import { ResearchExplorer } from '@/ui/client/ResearchExplorer'
import { headers } from 'next/headers'
import { DOCK_LOCALE_HEADER, localeFromMiddlewareHeader } from '@/lib/locale-context.mjs'
import { getStatesCopy } from '@/lib/states-copy'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'SRGBL Research & MIZAN Review Ledger',
  description: 'Stage-gated hermeneutic analysis (S1–L5), Key Witness candidate scores, adversarial hypotheses and MIZAN four-eyes review trail.',
}

export default async function ResearchPage(): Promise<ReactNode> {
  const requestHeaders = await headers()
  const locale = localeFromMiddlewareHeader(requestHeaders.get(DOCK_LOCALE_HEADER))
  const copy = getStatesCopy(locale)

  let registry: ResearchRegistry | null = null
  let error: string | null = null

  try {
    registry = await readResearchRegistry()
  } catch (err) {
    error = err instanceof Error ? err.message : copy.errorResearchUnavailable
  }

  return (
    <div className="m-stack" style={{ gap: 20 }}>
      <PageHeader
        title="SRGBL Research & MIZAN Review Ledger"
        subtitle="S1–L5 Stage Gates · Key Witness Scoring · Adversarial Hypotheses · Four-Eyes MIZAN Governance"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Research' }]}
        actions={
          registry ? (
            <div className="m-row" style={{ gap: 8, flexWrap: 'wrap' }}>
              <Badge tone="cyan">{registry.counts.cases} cases</Badge>
              <Badge tone="ok">{registry.counts.witnesses} witnesses</Badge>
              <Badge tone="accent">{registry.counts.hypotheses} hypotheses</Badge>
              <Badge tone="night">MIZAN Bounded v1</Badge>
            </div>
          ) : null
        }
      />

      {error ? <Alert tone="hot">{error}</Alert> : null}
      {registry ? (
        <ResearchExplorer
          initialCases={registry.cases}
          initialFrames={registry.frames}
          initialWitnesses={registry.witnesses}
          initialHypotheses={registry.hypotheses}
        />
      ) : null}
    </div>
  )
}
