import { Badge } from '@moonwitness/moonui'
import { SIMULATED_OPERATIONS } from '../fixtures/simulated-operations'
import { orbitCopy } from '../lib/orbit-copy'
import { getRequestLocale } from '../lib/request-locale'
import { OrbitShellHeader } from '../components/OrbitShellHeader'
import { OrbitNav } from '../components/OrbitNav'
import { OrbitOperationsWorkspace } from '../components/OrbitOperationsWorkspace'

export interface PageProps {
  searchParams?: Promise<{ locale?: string }>
}

export default async function OrbitPage({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : {}
  const locale = await getRequestLocale(resolvedParams.locale)
  const copy = orbitCopy(locale)

  const {
    connectionStatus,
    dataSource,
    lastSyncTimestamp,
  } = SIMULATED_OPERATIONS

  return (
    <>
      <OrbitShellHeader
        locale={locale}
        copy={copy}
        connectionStatus={connectionStatus}
      />

      <OrbitNav copy={copy} />

      <main className="orbit-main" id="main-content">
        <OrbitOperationsWorkspace
          data={SIMULATED_OPERATIONS}
          locale={locale}
          copy={copy}
        />
      </main>

      <footer className="orbit-footer" role="contentinfo">
        <div>
          {copy.dataSourceLabel}: <Badge tone="night">{dataSource}</Badge> · {copy.synchronizedLabel}: {lastSyncTimestamp}
        </div>
        <div>{copy.footerNotice}</div>
      </footer>
    </>
  )
}
