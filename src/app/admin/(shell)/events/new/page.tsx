import EventForm from '@/components/admin/cms/EventForm'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

export default function NewEventPage() {
  return (
    <div>
      <AdminPageHeader title="New event" description="Use a full URL for external links, or a path like /booking for on-site actions." />
      <EventForm mode="create" />
    </div>
  )
}
