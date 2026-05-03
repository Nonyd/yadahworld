import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import BookingDetailForm from '@/components/admin/BookingDetailForm'

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
      <h1 className="font-playfair text-3xl mb-2" style={{ color: 'var(--body)' }}>
        Booking detail
      </h1>
      <p className="ui-label mb-10" style={{ color: 'var(--muted)' }}>
        {booking.eventName}
      </p>

      <dl className="space-y-4 mb-12 font-jost text-sm" style={{ color: 'var(--body)' }}>
        <div>
          <dt className="ui-label mb-1" style={{ color: 'var(--muted)' }}>
            Contact
          </dt>
          <dd>
            {booking.fullName} · {booking.email} · {booking.phone}
          </dd>
        </div>
        <div>
          <dt className="ui-label mb-1" style={{ color: 'var(--muted)' }}>
            Organisation
          </dt>
          <dd>{booking.churchName}</dd>
          <dd className="text-muted mt-1">{booking.orgAddress}</dd>
          <dd className="text-muted">{booking.orgPhone} · {booking.orgEmail}</dd>
        </div>
        <div>
          <dt className="ui-label mb-1" style={{ color: 'var(--muted)' }}>
            Event
          </dt>
          <dd>{booking.natureOfEvent}</dd>
          <dd className="mt-1">{booking.whatExpected}</dd>
          <dd className="mt-2 body-sm" style={{ color: 'var(--muted)' }}>
            {booking.expectationDetails}
          </dd>
          <dd className="mt-2">
            {new Date(booking.eventDate).toLocaleDateString('en-GB')} at {booking.eventTime}
          </dd>
          <dd className="text-muted mt-1">{booking.eventAddress}</dd>
        </div>
        {booking.additionalInfo && (
          <div>
            <dt className="ui-label mb-1" style={{ color: 'var(--muted)' }}>
              Additional
            </dt>
            <dd className="body-sm">{booking.additionalInfo}</dd>
          </div>
        )}
      </dl>

      <BookingDetailForm bookingId={booking.id} initialStatus={booking.status} initialNotes={booking.adminNotes ?? ''} />
    </div>
  )
}
