import { redirect } from 'next/navigation'
import { me } from '@/data/queries/session'
import { VerticalLayout } from '@/layouts/vertical'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await me()
  if (!user) redirect('/login')
  return <VerticalLayout user={user}>{children}</VerticalLayout>
}
