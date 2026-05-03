import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import VideoForm from '@/components/admin/cms/VideoForm'

export default async function EditVideoPage({ params }: { params: { id: string } }) {
  let video = null
  try {
    video = await prisma.siteVideo.findUnique({ where: { id: params.id } })
  } catch {
    video = null
  }
  if (!video) notFound()

  return (
    <div>
      <AdminPageHeader title="Edit video" description={video.title} />
      <VideoForm mode="edit" initial={video} />
    </div>
  )
}
