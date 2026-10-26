import { Badge, Button, Field, PageHeader, Panel, TextInput } from '@moonwitness/moonui'
import { DEFAULT_CITATION, readPassage } from '@/data/queries/reader'
import { ReaderView } from '@/ui/components/reader'

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
  const params = await searchParams
  const citation = params.citation?.trim() || DEFAULT_CITATION
  const edition = params.edition?.trim() || undefined
  const result = await readPassage(citation, edition)

  return (
    <div className="m-stack" style={{ gap: 20 }}>
      <PageHeader
        title="Corpus Reader"
        subtitle="Exact source identity · rights-gated text · reproducible citation"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Reader' }]}
        actions={<Badge tone="cyan">{citation}</Badge>}
      />

      <Panel title="Look up a citation" subtitle="The Reader never guesses: absent, blocked and ambiguous are explicit states.">
        <form className="dk-reader-form" method="get" action="/reader" role="search">
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

      <ReaderView citation={citation} result={result} />
    </div>
  )
}
