import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import SiteEventForm from '@/components/admin/cms/SiteEventForm'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

export default async function EditHomepageEventPage({ params }: { params: { id: string } }) {
  let event = null
  try {
    event = await prisma.siteEvent.findUnique({ where: { id: params.id } })
  } catch {
    event = null
  }
  if (!event) notFound()

  return (
    <div>
      <AdminPageHeader title="Edit homepage event" description={event.title} />
      <SiteEventForm mode="edit" initial={event} />
    </div>
  )
}
