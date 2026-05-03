import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

export default async function BookingsPage() {
  let bookings: Awaited<ReturnType<typeof prisma.bookingRequest.findMany>> = []
  try {
    bookings = await prisma.bookingRequest.findMany({
      orderBy: { createdAt: 'desc' },
    })
  } catch {
    bookings = []
  }

  return (
    <div>
      <AdminPageHeader title="Booking requests" description="Review inquiries and update status from each detail page." />

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-admin-border bg-black/[0.02] text-[10px] font-medium uppercase tracking-[0.14em] text-admin-muted">
                <th className="px-4 py-3 font-medium sm:px-6">Date</th>
                <th className="px-4 py-3 font-medium sm:px-6">Name</th>
                <th className="px-4 py-3 font-medium sm:px-6">Organisation</th>
                <th className="px-4 py-3 font-medium sm:px-6">Event</th>
                <th className="px-4 py-3 font-medium sm:px-6">Event date</th>
                <th className="px-4 py-3 font-medium sm:px-6">Status</th>
                <th className="px-4 py-3 font-medium sm:px-6 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {bookings.map((b) => (
                <tr key={b.id} className="text-admin-text transition-colors hover:bg-black/[0.02]">
                  <td className="px-4 py-3 text-admin-muted sm:px-6">{new Date(b.createdAt).toLocaleDateString('en-GB')}</td>
                  <td className="px-4 py-3 font-medium sm:px-6">{b.fullName}</td>
                  <td className="px-4 py-3 text-admin-muted sm:px-6">{b.churchName}</td>
                  <td className="px-4 py-3 sm:px-6">{b.eventName}</td>
                  <td className="px-4 py-3 text-admin-muted sm:px-6">{new Date(b.eventDate).toLocaleDateString('en-GB')}</td>
                  <td className="px-4 py-3 sm:px-6">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                        b.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-900'
                          : b.status === 'CONFIRMED'
                            ? 'bg-emerald-50 text-emerald-800'
                            : b.status === 'REVIEWING'
                              ? 'bg-sky-50 text-sky-800'
                              : 'bg-red-50 text-red-800'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right sm:px-6">
                    <Link href={`/admin/bookings/${b.id}`} className="admin-btn admin-btn-ghost text-[10px]">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {bookings.length === 0 && (
          <p className="px-6 py-12 text-center text-sm text-admin-muted">No bookings yet.</p>
        )}
      </div>
    </div>
  )
}
