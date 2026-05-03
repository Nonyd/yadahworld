import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import BookingDetailForm from '@/components/admin/BookingDetailForm'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import Link from 'next/link'

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_1fr] sm:items-baseline">
      <dt className="admin-label mb-0">{label}</dt>
      <dd className="text-sm text-admin-text">{children}</dd>
    </div>
  )
}

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

  const submittedAt = new Date(booking.createdAt).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/bookings" className="text-[10px] font-medium uppercase tracking-[0.16em] text-admin-muted hover:text-admin-accent">
          ← Bookings
        </Link>
      </div>

      <AdminPageHeader title="Booking request" description={booking.eventName} />

      <div className="grid gap-10 lg:grid-cols-[1fr_minmax(280px,320px)] lg:items-start">
        <div className="space-y-8">
          <section className="admin-card space-y-4 p-6 sm:p-8">
            <h2 className="font-playfair text-base text-admin-text">Contact</h2>
            <dl className="space-y-4">
              <Row label="Full name">{booking.fullName}</Row>
              <Row label="Email">{booking.email}</Row>
              <Row label="Phone">{booking.phone}</Row>
            </dl>
          </section>

          <section className="admin-card space-y-4 p-6 sm:p-8">
            <h2 className="font-playfair text-base text-admin-text">Organisation</h2>
            <dl className="space-y-4">
              <Row label="Church / org">{booking.churchName}</Row>
              <Row label="Website">{booking.website || '—'}</Row>
              <Row label="Address">{booking.orgAddress}</Row>
              <Row label="Org phone">{booking.orgPhone}</Row>
              <Row label="Org email">{booking.orgEmail}</Row>
            </dl>
          </section>

          <section className="admin-card space-y-4 p-6 sm:p-8">
            <h2 className="font-playfair text-base text-admin-text">Event details</h2>
            <dl className="space-y-4">
              <Row label="Event name">{booking.eventName}</Row>
              <Row label="Nature">{booking.natureOfEvent}</Row>
              <Row label="What is expected">{booking.whatExpected}</Row>
              <Row label="Description">{booking.expectationDetails}</Row>
              <Row label="Date">{new Date(booking.eventDate).toLocaleDateString('en-GB')}</Row>
              <Row label="Time">{booking.eventTime}</Row>
              <Row label="Venue address">{booking.eventAddress}</Row>
            </dl>
          </section>

          {booking.additionalInfo?.trim() && (
            <section className="admin-card space-y-4 p-6 sm:p-8">
              <h2 className="font-playfair text-base text-admin-text">Additional</h2>
              <p className="whitespace-pre-wrap text-sm text-admin-text/90">{booking.additionalInfo}</p>
            </section>
          )}
        </div>

        <BookingDetailForm
          bookingId={booking.id}
          initialStatus={booking.status}
          initialNotes={booking.adminNotes ?? ''}
          bookerEmail={booking.email}
          eventName={booking.eventName}
          fullName={booking.fullName}
          submittedAt={submittedAt}
        />
      </div>
    </div>
  )
}
