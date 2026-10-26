import type { ReactNode } from 'react'
import { Alert, Badge, PageHeader } from '@moonwitness/moonui'
import { readPatchesRegistry, type PatchesRegistry } from '@/data/queries/journey'
import { PatchesExplorer } from '@/ui/client/PatchesExplorer'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'World Patches Explorer',
  description: 'The 33 Canonical Patches and Historical Context of the Empire of the Light. Unnumbered conflicts preserved.',
}

export default async function PatchesPage(): Promise<ReactNode> {
  let registry: PatchesRegistry | null = null
  let error: string | null = null

  try {
    registry = await readPatchesRegistry()
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unable to load World Patches.'
  }

  return (
    <div className="m-stack" style={{ gap: 20 }}>
      <PageHeader
        title="World Patches & Historical Context"
        subtitle="33 Canonical Patches · Dual-title Conflict Preserved · Declarative MoonQL Journey Domain"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Patches' }]}
        actions={
          registry ? (
            <div className="m-row" style={{ gap: 8, flexWrap: 'wrap' }}>
              <Badge tone="cyan">{registry.counts.total} patches</Badge>
              <Badge tone="ok">{registry.counts.canonical} canonical</Badge>
              {registry.counts.disputed > 0 ? (
                <Badge tone="hot">{registry.counts.disputed} disputed</Badge>
              ) : null}
              <Badge tone="accent">{registry.counts.mandates} mandates</Badge>
            </div>
          ) : null
        }
      />

      {error ? <Alert tone="hot">{error}</Alert> : null}
      {registry ? (
        <PatchesExplorer
          initialPatches={registry.patches}
          initialMandates={registry.mandates}
        />
      ) : null}
    </div>
  )
}
