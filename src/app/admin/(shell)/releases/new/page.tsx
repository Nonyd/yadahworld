import ReleaseForm from '@/components/admin/cms/ReleaseForm'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

export default function NewReleasePage() {
  return (
    <div>
      <AdminPageHeader title="New release" description="Upload cover art or paste an image URL. Uploads go to your Cloudinary folder when API keys are set." />
      <ReleaseForm mode="create" />
    </div>
  )
}
