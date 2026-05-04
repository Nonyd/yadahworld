import Link from 'next/link'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import SyncAllYoutubeButton from '@/components/admin/cms/SyncAllYoutubeButton'
import SyncOnePlaylistButton from '@/components/admin/cms/SyncOnePlaylistButton'
import PlaylistActiveToggle from '@/components/admin/cms/PlaylistActiveToggle'
import DeletePlaylistButton from '@/components/admin/cms/DeletePlaylistButton'
import { formatRelativeTimeAgo } from '@/lib/relative-time'

type PlaylistRow = Prisma.YouTubePlaylistGetPayload<{
  include: { _count: { select: { videos: true } } }
}>

export default async function AdminPlaylistsPage() {
  let playlists: PlaylistRow[] = []
  let lastGlobal: Date | null = null
  try {
    playlists = await prisma.youTubePlaylist.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { videos: true } } },
    })
    const agg = await prisma.youTubePlaylist.aggregate({
      _max: { lastSyncedAt: true },
    })
    lastGlobal = agg._max.lastSyncedAt
  } catch {
    playlists = []
  }

  return (
    <div>
      <AdminPageHeader
        title="Playlists"
        description="YouTube playlists sync on a schedule and can be refreshed manually. Each slot controls where videos appear on the public site."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <SyncAllYoutubeButton className="admin-btn admin-btn-primary text-[10px]" />
            <Link href="/admin/playlists/new" className="admin-btn admin-btn-secondary text-[10px]">
              Add playlist
            </Link>
          </div>
        }
      />

      <p className="mb-6 text-sm text-admin-muted">
        Last global sync: <span className="text-admin-text">{formatRelativeTimeAgo(lastGlobal)}</span>
      </p>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-admin-border bg-black/[0.02] text-[10px] font-medium uppercase tracking-[0.14em] text-admin-muted">
                <th className="px-4 py-3 font-medium sm:px-6">Name</th>
                <th className="px-4 py-3 font-medium sm:px-6">Slot</th>
                <th className="px-4 py-3 font-medium sm:px-6">YouTube playlist ID</th>
                <th className="px-4 py-3 font-medium sm:px-6">Cached</th>
                <th className="px-4 py-3 font-medium sm:px-6">Last synced</th>
                <th className="px-4 py-3 font-medium sm:px-6">Status</th>
                <th className="px-4 py-3 font-medium sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {playlists.map((p) => (
                <tr key={p.id} className="text-admin-text hover:bg-black/[0.02]">
                  <td className="px-4 py-3 font-medium sm:px-6">{p.name}</td>
                  <td className="px-4 py-3 text-admin-muted sm:px-6">{p.slot}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 font-mono text-xs text-admin-muted sm:px-6">
                    {p.youtubePlaylistId}
                  </td>
                  <td className="px-4 py-3 text-admin-muted sm:px-6">{p._count.videos}</td>
                  <td className="px-4 py-3 text-admin-muted sm:px-6 whitespace-nowrap">
                    {formatRelativeTimeAgo(p.lastSyncedAt)}
                  </td>
                  <td className="px-4 py-3 sm:px-6">
                    <PlaylistActiveToggle id={p.id} initial={p.isActive} />
                  </td>
                  <td className="px-4 py-3 text-right sm:px-6">
                    <div className="flex justify-end flex-wrap gap-1">
                      <Link href={`/admin/playlists/${p.id}`} className="admin-btn admin-btn-ghost text-[10px]">
                        Edit
                      </Link>
                      <SyncOnePlaylistButton playlistId={p.id} />
                      <DeletePlaylistButton id={p.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {playlists.length === 0 && (
          <p className="px-6 py-12 text-center text-sm text-admin-muted">
            No playlists yet. Run <code className="font-mono text-[11px] text-admin-text">npm run db:seed</code> after{' '}
            <code className="font-mono text-[11px] text-admin-text">npx prisma db push</code>, or add one with Add playlist.
          </p>
        )}
      </div>
    </div>
  )
}
