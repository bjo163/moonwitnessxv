import type { ReactNode } from 'react'
import { Badge, CardSkeleton, PageHeader } from '@moonwitness/moonui'
import { readPatchesRegistry, type PatchesRegistry } from '@/data/queries/journey'
import { censusPatches } from '@/data/queries/patches'
import { panelErrorMessage } from '@/data/queries/error'
import { PatchesExplorer } from '@/ui/client/PatchesExplorer'
import { getPatchesCopy } from '@/ui/copy/patches-copy'
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
  const stateCopy = getStatesCopy(locale)
  const copy = getPatchesCopy(locale)

  const panelCopy: PanelCopy = {
    loadingLabel: stateCopy.loadingContent,
    emptyTitle: stateCopy.emptyPatches,
    errorMessage: stateCopy.errorPatchesUnavailable,
  }

  // The header badges are derived from the same read, so the registry is awaited
  // here; the explorer itself still speaks all four states through PanelState.
  const outcome = await readPanel<PatchesRegistry>(
    readPatchesRegistry,
    panelCopy,
    (registry) => registry.patches.length === 0,
    (err) => panelErrorMessage(err, stateCopy.errorPatchesUnavailable),
  )
  const registry = outcome.state === 'ready' ? outcome.value : null
  const census = registry ? censusPatches(registry) : null

  return (
    <div className="m-stack" style={{ gap: 20 }}>
      <PageHeader
        title={copy.pageTitle}
        subtitle={copy.pageSubtitle}
        breadcrumbs={[{ label: copy.breadcrumbHome, href: localeHref('/') }, { label: copy.breadcrumbPatches }]}
        actions={
          census ? (
            <div className="m-row" style={{ gap: 8, flexWrap: 'wrap' }}>
              <Badge tone="cyan">
                {census.records} {copy.badgePatches}
              </Badge>
              <Badge tone="ok">
                {census.canonical} {copy.badgeCanonical}
              </Badge>
              {census.conflicts > 0 ? (
                <Badge tone="hot">
                  {census.conflicts} {copy.badgeDisputed}
                </Badge>
              ) : null}
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
        {(value) => <PatchesExplorer registry={value} locale={locale} />}
      </OutcomePanel>
    </div>
  )
}
