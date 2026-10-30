import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SESSION_COOKIE } from '@/lib/session'
import { consoleLocale } from '@/lib/copy'
import { Dashboard } from '@/ui/Dashboard'

export default async function HomePage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const [params, cookieStore] = await Promise.all([searchParams, cookies()])
  if (!cookieStore.get(SESSION_COOKIE)) redirect('/login')
  const locale = consoleLocale(params.lang)
  return <Dashboard locale={locale} />
}
