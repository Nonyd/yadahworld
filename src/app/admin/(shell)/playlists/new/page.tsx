import PlaylistForm from '@/components/admin/cms/PlaylistForm'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

export default function NewPlaylistPage() {
  return (
    <div>
      <AdminPageHeader
        title="New playlist"
        description="Paste a YouTube playlist URL or its list ID. After saving, the first sync runs automatically."
      />
      <PlaylistForm mode="create" />
    </div>
  )
}
