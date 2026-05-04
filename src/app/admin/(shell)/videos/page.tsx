import Link from 'next/link'
import Image from 'next/image'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import CachedVideoActiveToggle from '@/components/admin/cms/CachedVideoActiveToggle'
import CachedVideoFeaturedToggle from '@/components/admin/cms/CachedVideoFeaturedToggle'

function formatViews(raw: string | null) {
  if (raw == null || raw === '') return '—'
  const n = Number(raw)
  if (Number.isNaN(n)) return raw
  return n.toLocaleString()
}

type CachedVideoRow = Prisma.CachedVideoGetPayload<{
  include: { playlist: { select: { name: true; slot: true } } }
}>

export default async function AdminVideosPage() {
  let videos: CachedVideoRow[] = []
  try {
    videos = await prisma.cachedVideo.findMany({
      orderBy: { publishedAt: 'desc' },
      include: { playlist: { select: { name: true, slot: true } } },
    })
  } catch {
    videos = []
  }

  return (
    <div>
      <AdminPageHeader
        title="Videos"
        description="Videos are synced from YouTube playlists. Hide entries here to remove them from the public site without deleting them from YouTube."
        actions={
          <Link href="/admin/playlists" className="admin-btn admin-btn-primary">
            Manage playlists
          </Link>
        }
      />

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1020px] text-left text-sm">
            <thead>
              <tr className="border-b border-admin-border bg-black/[0.02] text-[10px] font-medium uppercase tracking-[0.14em] text-admin-muted">
                <th className="px-4 py-3 font-medium sm:px-6 w-14">Thumb</th>
                <th className="px-4 py-3 font-medium sm:px-6">Title</th>
                <th className="px-4 py-3 font-medium sm:px-6">Playlist</th>
                <th className="px-4 py-3 font-medium sm:px-6">Published</th>
                <th className="px-4 py-3 font-medium sm:px-6">Views</th>
                <th className="px-4 py-3 font-medium sm:px-6 text-center min-w-[7rem]">★ / order</th>
                <th className="px-4 py-3 font-medium sm:px-6">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {videos.map((v) => (
                <tr key={v.id} className="text-admin-text hover:bg-black/[0.02]">
                  <td className="px-4 py-2 sm:px-6">
                    <div className="relative h-10 w-14 overflow-hidden rounded bg-admin-bg">
                      <Image src={v.thumbnailUrl} alt="" fill className="object-cover" sizes="56px" />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium sm:px-6 max-w-[280px]">
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={`https://www.youtube.com/watch?v=${v.youtubeVideoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-admin-accent"
                      >
                        {v.title}
                      </a>
                      {v.isFeatured ? (
                        <span className="shrink-0 rounded border border-[#C9A84C]/40 bg-[#C9A84C]/10 px-2 py-0.5 font-jost text-[9px] font-medium uppercase tracking-[0.14em] text-[#8b6914] dark:text-[#E8C96A]">
                          FEATURED
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-admin-muted sm:px-6">{v.playlist.name}</td>
                  <td className="px-4 py-3 text-admin-muted sm:px-6 whitespace-nowrap">
                    {v.publishedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-admin-muted sm:px-6">{formatViews(v.viewCount)}</td>
                  <td className="px-4 py-3 sm:px-6 text-center">
                    <CachedVideoFeaturedToggle
                      id={v.id}
                      slot={v.playlist.slot}
                      initialFeatured={v.isFeatured}
                      initialOrder={v.featuredOrder}
                    />
                  </td>
                  <td className="px-4 py-3 sm:px-6">
                    <CachedVideoActiveToggle id={v.id} initial={v.isActive} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {videos.length === 0 && (
          <p className="px-6 py-12 text-center text-sm text-admin-muted">
            No cached videos yet. Add playlists under Manage playlists, set <code className="font-mono text-[11px] text-admin-text">YOUTUBE_API_KEY</code>, then run Sync all.
          </p>
        )}
      </div>
    </div>
  )
}
