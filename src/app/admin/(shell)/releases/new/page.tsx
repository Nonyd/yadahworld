import ReleaseForm from '@/components/admin/cms/ReleaseForm'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

export default function NewReleasePage() {
  return (
    <div>
      <AdminPageHeader title="New release" description="Paste a cover image URL (for example from Cloudinary or your CDN)." />
      <ReleaseForm mode="create" />
    </div>
  )
}
