import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import BookingDetailForm from '@/components/admin/BookingDetailForm'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import Link from 'next/link'

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  let booking = null
  try {
    booking = await prisma.bookingRequest.findUnique({
      where: { id: params.id },
    })
  } catch {
    booking = null
  }

  if (!booking) notFound()

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <Link href="/admin/bookings" className="text-[10px] font-medium uppercase tracking-[0.16em] text-admin-muted hover:text-admin-accent">
          ← Bookings
        </Link>
      </div>

      <AdminPageHeader title="Booking detail" description={booking.eventName} />

      <div className="admin-card mb-10 space-y-5 p-6 sm:p-8">
        <dl className="space-y-5 text-sm">
          <div>
            <dt className="admin-label">Contact</dt>
            <dd className="text-admin-text">
              {booking.fullName} · {booking.email} · {booking.phone}
            </dd>
          </div>
          <div>
            <dt className="admin-label">Organisation</dt>
            <dd className="text-admin-text">{booking.churchName}</dd>
            <dd className="mt-1 text-admin-muted">{booking.orgAddress}</dd>
            <dd className="text-admin-muted">
              {booking.orgPhone} · {booking.orgEmail}
            </dd>
          </div>
          <div>
            <dt className="admin-label">Event</dt>
            <dd className="text-admin-text">{booking.natureOfEvent}</dd>
            <dd className="mt-1 text-admin-text">{booking.whatExpected}</dd>
            <dd className="mt-2 text-admin-muted">{booking.expectationDetails}</dd>
            <dd className="mt-3 text-admin-text">
              {new Date(booking.eventDate).toLocaleDateString('en-GB')} at {booking.eventTime}
            </dd>
            <dd className="mt-1 text-admin-muted">{booking.eventAddress}</dd>
          </div>
          {booking.additionalInfo && (
            <div>
              <dt className="admin-label">Additional</dt>
              <dd className="text-admin-muted">{booking.additionalInfo}</dd>
            </div>
          )}
        </dl>
      </div>

      <BookingDetailForm bookingId={booking.id} initialStatus={booking.status} initialNotes={booking.adminNotes ?? ''} />
    </div>
  )
}
