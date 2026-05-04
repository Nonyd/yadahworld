import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import CheckInScanner from '@/components/admin/events/CheckInScanner'
import EventAdminNav from '@/components/admin/events/EventAdminNav'

export default async function EventCheckInPage({ params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({ where: { id: params.id } })
  if (!event) notFound()

  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const [checkedInToday, totalRegistered] = await Promise.all([
    prisma.eventRegistration.count({
      where: {
        eventId: event.id,
        checkedIn: true,
        checkedInAt: { gte: start },
      },
    }),
    prisma.eventRegistration.count({
      where: {
        eventId: event.id,
        paymentStatus: { in: ['PAID', 'FREE'] },
      },
    }),
  ])

  return (
    <div>
      <Link href={`/admin/events/${params.id}`} className="admin-btn admin-btn-ghost mb-4 inline-flex text-[10px]">
        ← Back to Event
      </Link>
      <EventAdminNav eventId={event.id} status={event.status} />
      <h1 className="font-playfair text-3xl font-normal text-admin-text">{event.title}</h1>
      <p className="mb-8 text-sm text-admin-muted">Check-in scanner</p>
      <CheckInScanner eventId={event.id} initialCheckedInToday={checkedInToday} initialTotalRegistered={totalRegistered} />
    </div>
  )
}
