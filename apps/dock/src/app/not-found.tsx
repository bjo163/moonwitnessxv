import { headers } from 'next/headers'
import { LinkButton, PageHeader, Panel } from '@moonwitness/moonui'
import { DOCK_LOCALE_HEADER, dockHrefFor, localeFromMiddlewareHeader } from '@/lib/locale-context.mjs'
import { getStatesCopy } from '@/lib/states-copy'

export const dynamic = 'force-dynamic'

export default async function NotFound() {
  const requestHeaders = await headers()
  const locale = localeFromMiddlewareHeader(requestHeaders.get(DOCK_LOCALE_HEADER))
  const localeHref = dockHrefFor(locale)
  const copy = getStatesCopy(locale)

  return (
    <div className="m-stack" style={{ gap: 20, maxWidth: 640, margin: '40px auto' }}>
      <PageHeader
        title={copy.errorNotFoundTitle}
        subtitle={copy.errorNotFoundDescription}
        breadcrumbs={[{ label: 'Home', href: localeHref('/') }, { label: '404' }]}
      />
      <Panel title={copy.errorNotFoundTitle} subtitle={copy.errorNotFoundDescription}>
        <div className="m-stack" style={{ gap: 16 }}>
          <p className="m-muted" style={{ margin: 0 }}>
            {copy.errorNotFoundDescription}
          </p>
          <div>
            <LinkButton href={localeHref('/')} variant="accent">
              {copy.errorExploreSignals}
            </LinkButton>
          </div>
        </div>
      </Panel>
    </div>
  )
}
