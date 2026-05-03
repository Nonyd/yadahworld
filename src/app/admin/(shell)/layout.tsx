import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import AdminAppShell from '@/components/admin/AdminAppShell'

export default async function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  return <AdminAppShell userLabel={session.user?.email}>{children}</AdminAppShell>
}
