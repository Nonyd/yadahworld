import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import AdminAppShell from '@/components/admin/AdminAppShell'
import { prisma } from '@/lib/prisma'

export default async function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const [pendingBookings, unreadMessages] = await Promise.all([
    prisma.bookingRequest.count({ where: { status: 'PENDING' } }).catch(() => 0),
    prisma.contactMessage.count({ where: { read: false } }).catch(() => 0),
  ])

  return (
    <AdminAppShell
      userLabel={session.user?.email}
      pendingBookingsCount={pendingBookings}
      unreadMessagesCount={unreadMessages}
    >
      {children}
    </AdminAppShell>
  )
}
