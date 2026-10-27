import { Badge, Button, CardSkeleton, Field, LinkButton, PageHeader, Panel, TextInput } from '@moonwitness/moonui'
import { DEFAULT_CITATION, browseIsEmpty, readBrowse, readPassage, type ReaderResult } from '@/data/queries/reader'
import { panelErrorMessage } from '@/data/queries/error'
import { ReaderView } from '@/ui/components/reader'
import { ReaderContentsRail, ReaderRecordRail } from '@/ui/components/reader-rail'
import { OutcomePanel, readPanel, type PanelCopy } from '@/ui/components/states'
import { headers } from 'next/headers'
import { DOCK_LOCALE_HEADER, dockHrefFor, localeFromMiddlewareHeader } from '@/lib/locale-context.mjs'
import { getStatesCopy } from '@/lib/states-copy'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Corpus Reader',
  description: 'Read an indexed source with its exact edition, rights status and reproducible citation.',
}

export default async function ReaderPage({
  searchParams,
}: {
  searchParams: Promise<{ citation?: string; edition?: string }>
}) {
  const requestHeaders = await headers()
  const locale = localeFromMiddlewareHeader(requestHeaders.get(DOCK_LOCALE_HEADER))
  const localeHref = dockHrefFor(locale)
  const copy = getStatesCopy(locale)

  const params = await searchParams
  const citation = params.citation?.trim() || DEFAULT_CITATION
  const edition = params.edition?.trim() || undefined

  const panelCopy: PanelCopy = {
    loadingLabel: copy.loadingContent,
    emptyTitle: copy.emptyReaderPanel,
    errorMessage: copy.errorReaderUnavailable,
  }

  // The contents rail is a second read of the same owner. It fails independently:
  // a hub that cannot answer the browse query loses its rows, never the passage
  // that is already on screen.
  const browseCopy: PanelCopy = {
    loadingLabel: copy.loadingContent,
    emptyTitle: copy.emptyReaderPanel,
    errorMessage: copy.errorReaderUnavailable,
  }

  const [outcome, browseOutcome] = await Promise.all([
    readPanel<ReaderResult>(
      () => readPassage(citation, edition),
      panelCopy,
      undefined,
      (err) => panelErrorMessage(err, copy.errorReaderUnavailable),
    ),
    readPanel(
      () => readBrowse(citation, edition),
      browseCopy,
      browseIsEmpty,
      (err) => panelErrorMessage(err, copy.errorReaderUnavailable),
    ),
  ])

  const result = outcome.state === 'ready' ? outcome.value : null
  const browse = browseOutcome.state === 'ready' ? browseOutcome.value : null
  const selectedEditionCode = result?.citation?.editionCode ?? edition ?? null

  return (
    <div className="m-stack" style={{ gap: 20 }}>
      <PageHeader
        title="Corpus Reader"
        subtitle={
          citation === DEFAULT_CITATION && !edition
            ? 'Exact source identity · rights-gated text · reproducible citation'
            : `Exact source identity · rights-gated text · reproducible citation · ${citation}${
                edition ? ` · ${edition}` : ''
              }`
        }
        breadcrumbs={[{ label: 'Home', href: localeHref('/') }, { label: 'Reader' }]}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Badge tone="cyan">{citation}</Badge>
            <LinkButton href={localeHref('/reader/compare')} variant="primary" size="sm">
              {copy.formComparativeWorkbench}
            </LinkButton>
          </div>
        }
      />

      <div className="dk-reader-layout">
        <div className="dk-reader-main">
          <Panel
            title="Look up a citation"
            subtitle="The Reader never guesses: absent, blocked and ambiguous are explicit states."
          >
            <form className="dk-reader-form" method="get" action={localeHref('/reader')} role="search">
              <Field label={copy.formCitation} htmlFor="citation" hint={copy.formCitationHint}>
                <TextInput
                  id="citation"
                  name="citation"
                  defaultValue={citation}
                  placeholder={copy.formCitationPlaceholder}
                  required
                />
              </Field>
              <Field label={copy.formEdition} htmlFor="edition" hint={copy.formEditionHint}>
                <TextInput id="edition" name="edition" defaultValue={edition ?? ''} placeholder="quran_cairo_hafs" />
              </Field>
              <Button type="submit" variant="accent">
                {copy.formReadSource}
              </Button>
            </form>
          </Panel>

          <OutcomePanel
            outcome={outcome}
            copy={panelCopy}
            skeleton={
              <div className="m-stack" style={{ gap: 14 }}>
                <CardSkeleton />
                <CardSkeleton />
              </div>
            }
          >
            {(ready) => <ReaderView result={ready} citation={citation} copy={copy} locale={locale} />}
          </OutcomePanel>
        </div>

        <OutcomePanel
          outcome={browseOutcome}
          copy={browseCopy}
          skeleton={
            <div className="m-stack" style={{ gap: 10 }}>
              <CardSkeleton />
              <CardSkeleton />
            </div>
          }
        >
          {(ready) => (
            <ReaderContentsRail
              browse={ready}
              locale={locale}
              selectedEditionCode={selectedEditionCode}
              hasCitationTarget={result?.citationText != null}
            />
          )}
        </OutcomePanel>

        <ReaderRecordRail result={result} browse={browse} locale={locale} />
      </div>
    </div>
  )
}
