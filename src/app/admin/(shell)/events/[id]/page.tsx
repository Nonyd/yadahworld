import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import EventForm from '@/components/admin/cms/EventForm'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

export default async function EditEventPage({ params }: { params: { id: string } }) {
  let event = null
  try {
    event = await prisma.siteEvent.findUnique({ where: { id: params.id } })
  } catch {
    event = null
  }
  if (!event) notFound()

  return (
    <div>
      <AdminPageHeader title="Edit event" description={event.title} />
      <EventForm mode="edit" initial={event} />
    </div>
  )
}
