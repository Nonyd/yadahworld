import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import AdminAppShell from '@/components/admin/AdminAppShell'
import { prisma } from '@/lib/prisma'
import { getPublicBranding } from '@/lib/site-settings'

export default async function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const [pendingBookings, newCampusTour, unreadMessages, branding] = await Promise.all([
    prisma.bookingRequest.count({ where: { status: 'PENDING' } }).catch(() => 0),
    prisma.campusTourApplication.count({ where: { status: 'NEW' } }).catch(() => 0),
    prisma.contactMessage.count({ where: { read: false } }).catch(() => 0),
    getPublicBranding(),
  ])

  return (
    <div className="admin-shell">
      <AdminAppShell
        userLabel={session.user?.email}
        pendingBookingsCount={pendingBookings}
        newCampusTourCount={newCampusTour}
        unreadMessagesCount={unreadMessages}
        logoUrl={branding.logoUrl}
        siteName={branding.siteName}
      >
        {children}
      </AdminAppShell>
    </div>
  )
}
