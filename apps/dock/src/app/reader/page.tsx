import { Badge, Button, CardSkeleton, Field, LinkButton, PageHeader, Panel, TextInput } from '@moonwitness/moonui'
import { DEFAULT_CITATION, readPassage, type ReaderResult } from '@/data/queries/reader'
import { panelErrorMessage } from '@/data/queries/error'
import { ReaderView } from '@/ui/components/reader'
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

  // A hub failure is a panel error, never a silent "no passage indexed" — the
  // reader's own absent/invalid/ambiguous states are domain facts and stay with
  // the view, which renders them as the panel's empty state.
  const outcome = await readPanel<ReaderResult>(
    () => readPassage(citation, edition),
    panelCopy,
    undefined,
    (err) => panelErrorMessage(err, copy.errorReaderUnavailable),
  )

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
              1·6·3 COMPARATIVE WORKBENCH →
            </LinkButton>
          </div>
        }
      />

      <Panel title="Look up a citation" subtitle="The Reader never guesses: absent, blocked and ambiguous are explicit states.">
        <form className="dk-reader-form" method="get" action={localeHref('/reader')} role="search">
          <Field label="Citation" htmlFor="citation" hint="Example: QS 2:82">
            <TextInput id="citation" name="citation" defaultValue={citation} placeholder="QS 2:82" required />
          </Field>
          <Field label="Edition (optional)" htmlFor="edition" hint="Pin a version by its edition code">
            <TextInput id="edition" name="edition" defaultValue={edition ?? ''} placeholder="quran_cairo_hafs" />
          </Field>
          <Button type="submit" variant="accent">
            READ SOURCE
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
        {(result) => <ReaderView result={result} citation={citation} copy={copy} locale={locale} />}
      </OutcomePanel>
    </div>
  )
}
