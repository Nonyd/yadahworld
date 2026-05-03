import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import DeleteVideoButton from '@/components/admin/cms/DeleteVideoButton'

export default async function AdminVideosPage() {
  let videos: Awaited<ReturnType<typeof prisma.siteVideo.findMany>> = []
  try {
    videos = await prisma.siteVideo.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] })
  } catch {
    videos = []
  }

  return (
    <div>
      <AdminPageHeader
        title="Videos"
        description="YouTube links shown in the Videos section on the home page and on /media. Thumbnails are pulled from YouTube unless you set a custom URL."
        actions={
          <Link href="/admin/videos/new" className="admin-btn admin-btn-primary">
            Add video
          </Link>
        }
      />

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-admin-border bg-black/[0.02] text-[10px] font-medium uppercase tracking-[0.14em] text-admin-muted">
                <th className="px-4 py-3 font-medium sm:px-6">Order</th>
                <th className="px-4 py-3 font-medium sm:px-6">Title</th>
                <th className="px-4 py-3 font-medium sm:px-6">YouTube</th>
                <th className="px-4 py-3 font-medium sm:px-6">Active</th>
                <th className="px-4 py-3 font-medium sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {videos.map((v) => (
                <tr key={v.id} className="text-admin-text hover:bg-black/[0.02]">
                  <td className="px-4 py-3 text-admin-muted sm:px-6">{v.order}</td>
                  <td className="px-4 py-3 font-medium sm:px-6">{v.title}</td>
                  <td className="max-w-[240px] truncate px-4 py-3 text-admin-muted sm:px-6">
                    <a href={v.youtubeUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-admin-accent">
                      {v.youtubeUrl}
                    </a>
                  </td>
                  <td className="px-4 py-3 sm:px-6">
                    <span className={v.isActive ? 'text-emerald-700' : 'text-stone-500'}>{v.isActive ? 'Yes' : 'No'}</span>
                  </td>
                  <td className="px-4 py-3 text-right sm:px-6">
                    <div className="flex justify-end gap-1">
                      <Link href={`/admin/videos/${v.id}`} className="admin-btn admin-btn-ghost text-[10px]">
                        Edit
                      </Link>
                      <DeleteVideoButton id={v.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {videos.length === 0 && (
          <p className="px-6 py-12 text-center text-sm text-admin-muted">
            No videos yet. Run <code className="font-mono text-[11px] text-admin-text">npm run db:seed</code> after <code className="font-mono text-[11px] text-admin-text">npx prisma db push</code> for starter rows, or add a video with New video.
          </p>
        )}
      </div>
    </div>
  )
}
