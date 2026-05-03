import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  return (
    <div className="min-h-screen flex" style={{ background: '#F0EBE1', fontFamily: 'var(--font-jost)' }}>
      <AdminSidebar />
      <main className="flex-1 p-8 md:p-12 overflow-x-auto">{children}</main>
    </div>
  )
}
