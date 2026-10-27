import { notFound } from 'next/navigation'
import { Badge, PageHeader } from '@moonwitness/moonui'
import { readFigure } from '@/data/queries/actors'
import { FigureDetailView } from '@/ui/components/actors'
import { headers } from 'next/headers'
import { DOCK_LOCALE_HEADER, dockHrefFor, localeFromMiddlewareHeader } from '@/lib/locale-context.mjs'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Figure Detail',
  description: 'A single figure with tradition-scoped readings, sourced events, chronology confidence and avatar policy.',
}

export default async function FigureDetailPage({ params }: { params: Promise<{ figureCode: string }> }) {
  const requestHeaders = await headers()
  const locale = localeFromMiddlewareHeader(requestHeaders.get(DOCK_LOCALE_HEADER))
  const localeHref = dockHrefFor(locale)
  const { figureCode } = await params
  const detail = await readFigure(figureCode)
  if (!detail) notFound()

  return (
    <div className="m-stack" style={{ gap: 20 }}>
      <PageHeader
        title={`${detail.figure.labelEn} · ${detail.figure.labelId}`}
        subtitle="Roles and missions stay scoped to a tradition · events keep their chronology confidence"
        breadcrumbs={[
          { label: 'Home', href: localeHref('/') },
          { label: 'Figures', href: localeHref('/figures') },
          { label: detail.figure.figureCode },
        ]}
        actions={<Badge tone={detail.competingReadings ? 'accent' : 'cyan'}>{detail.counts.readings} readings</Badge>}
      />
      <FigureDetailView detail={detail} locale={locale} />
    </div>
  )
}
