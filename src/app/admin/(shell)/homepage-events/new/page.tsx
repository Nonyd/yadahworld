import SiteEventForm from '@/components/admin/cms/SiteEventForm'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

export default function NewHomepageEventPage() {
  return (
    <div>
      <AdminPageHeader
        title="New homepage event"
        description="Shown in the homepage upcoming list. Use Events for ticketed ministry events with registration."
      />
      <SiteEventForm mode="create" />
    </div>
  )
}
