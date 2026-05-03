import AdminPageHeader from '@/components/admin/AdminPageHeader'
import VideoForm from '@/components/admin/cms/VideoForm'

export default function NewVideoPage() {
  return (
    <div>
      <AdminPageHeader title="New video" description="Paste a standard YouTube watch link for best thumbnails." />
      <VideoForm mode="create" />
    </div>
  )
}
