import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ReleaseForm from '@/components/admin/cms/ReleaseForm'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

export default async function EditReleasePage({ params }: { params: { id: string } }) {
  let release = null
  try {
    release = await prisma.siteRelease.findUnique({ where: { id: params.id } })
  } catch {
    release = null
  }
  if (!release) notFound()

  return (
    <div>
      <AdminPageHeader title="Edit release" description={release.title} />
      <ReleaseForm mode="edit" initial={release} />
    </div>
  )
}
