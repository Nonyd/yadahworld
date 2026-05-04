import { prisma } from '@/lib/prisma'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import BookingsInbox, { type BookingRow } from '@/components/admin/bookings/BookingsInbox'

export default async function BookingsPage() {
  let bookings: Awaited<ReturnType<typeof prisma.bookingRequest.findMany>> = []
  try {
    bookings = await prisma.bookingRequest.findMany({
      orderBy: { createdAt: 'desc' },
    })
  } catch {
    bookings = []
  }

  const rows: BookingRow[] = bookings.map((b) => ({
    id: b.id,
    createdAt: new Date(b.createdAt).toLocaleString('en-GB'),
    fullName: b.fullName,
    churchName: b.churchName,
    eventName: b.eventName,
    eventDate: new Date(b.eventDate).toLocaleDateString('en-GB'),
    status: b.status,
  }))

  return (
    <div>
      <AdminPageHeader title="Booking requests" description="Review inquiries and update status from each detail page." />

      {bookings.length === 0 ? (
        <p className="text-sm text-admin-muted">No bookings yet.</p>
      ) : (
        <BookingsInbox bookings={rows} />
      )}
    </div>
  )
}
