import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import PlaylistForm from '@/components/admin/cms/PlaylistForm'

export default async function EditPlaylistPage({ params }: { params: { id: string } }) {
  let playlist = null
  try {
    playlist = await prisma.youTubePlaylist.findUnique({ where: { id: params.id } })
  } catch {
    playlist = null
  }
  if (!playlist) notFound()

  return (
    <div>
      <AdminPageHeader title="Edit playlist" description={playlist.name} />
      <PlaylistForm mode="edit" initial={playlist} />
    </div>
  )
}
