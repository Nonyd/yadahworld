import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import EventForm, { type EventWithRelations } from '@/components/admin/cms/EventForm'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import EventAdminNav from '@/components/admin/events/EventAdminNav'
import EventEmailBlastSection from '@/components/admin/events/EventEmailBlastSection'

export default async function EditTicketingEventPage({ params }: { params: { id: string } }) {
  let event: EventWithRelations | null = null
  try {
    event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        tiers: { orderBy: { price: 'asc' } },
        speakers: { orderBy: { order: 'asc' } },
      },
    })
  } catch {
    event = null
  }
  if (!event) notFound()

  const confirmedCount = await prisma.eventRegistration.count({
    where: {
      eventId: event.id,
      paymentStatus: { in: ['PAID', 'FREE'] },
    },
  })

  return (
    <div>
      <AdminPageHeader title="Edit event" description={event.title} />
      <EventAdminNav eventId={event.id} status={event.status} />
      <EventEmailBlastSection eventId={event.id} eventTitle={event.title} confirmedCount={confirmedCount} />
      <EventForm mode="edit" initial={event} />
    </div>
  )
}
