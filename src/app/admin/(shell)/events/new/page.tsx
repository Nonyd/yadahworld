import EventForm from '@/components/admin/cms/EventForm'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

export default function NewTicketingEventPage() {
  return (
    <div>
      <AdminPageHeader title="New ticketed event" description="Publish to /events when status is Published or Coming soon." />
      <EventForm mode="create" />
    </div>
  )
}
