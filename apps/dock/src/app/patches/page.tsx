import type { ReactNode } from 'react'
import { Badge, CardSkeleton, PageHeader } from '@moonwitness/moonui'
import { readPatchesRegistry, type PatchesRegistry } from '@/data/queries/journey'
import { panelErrorMessage } from '@/data/queries/error'
import { PatchesExplorer } from '@/ui/client/PatchesExplorer'
import { OutcomePanel, readPanel, type PanelCopy } from '@/ui/components/states'
import { headers } from 'next/headers'
import { DOCK_LOCALE_HEADER, dockHrefFor, localeFromMiddlewareHeader } from '@/lib/locale-context.mjs'
import { getStatesCopy } from '@/lib/states-copy'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'World Patches Explorer',
  description: 'The 33 Canonical Patches and Historical Context of the Empire of the Light. Unnumbered conflicts preserved.',
}

export default async function PatchesPage(): Promise<ReactNode> {
  const requestHeaders = await headers()
  const locale = localeFromMiddlewareHeader(requestHeaders.get(DOCK_LOCALE_HEADER))
  const localeHref = dockHrefFor(locale)
  const copy = getStatesCopy(locale)

  const panelCopy: PanelCopy = {
    loadingLabel: copy.loadingContent,
    emptyTitle: copy.emptyPatches,
    errorMessage: copy.errorPatchesUnavailable,
  }

  // The header badges are derived from the same read, so the registry is awaited
  // here; the explorer itself still speaks all four states through PanelState.
  const outcome = await readPanel<PatchesRegistry>(
    readPatchesRegistry,
    panelCopy,
    (registry) => registry.patches.length === 0 && registry.mandates.length === 0,
    (err) => panelErrorMessage(err, copy.errorPatchesUnavailable),
  )
  const registry = outcome.state === 'ready' ? outcome.value : null

  return (
    <div className="m-stack" style={{ gap: 20 }}>
      <PageHeader
        title="World Patches & Historical Context"
        subtitle="33 Canonical Patches · Dual-title Conflict Preserved · Declarative MoonQL Journey Domain"
        breadcrumbs={[{ label: 'Home', href: localeHref('/') }, { label: 'Patches' }]}
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

      <OutcomePanel
        outcome={outcome}
        copy={panelCopy}
        skeleton={
          <div className="m-grid m-grid-3" style={{ gap: 14 }}>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        }
      >
        {(value) => <PatchesExplorer initialPatches={value.patches} initialMandates={value.mandates} />}
      </OutcomePanel>
    </div>
  )
}
