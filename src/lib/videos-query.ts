import type { CachedVideo, PlaylistSlot } from '@prisma/client'
import { prisma } from '@/lib/prisma'

function slotWhere(slot: PlaylistSlot, playlistId?: string) {
  if (playlistId) {
    return {
      isActive: true,
      playlist: { id: playlistId, isActive: true },
    } as const
  }
  return {
    isActive: true,
    playlist: { slot, isActive: true },
  } as const
}

export async function listVideosForSlot(params: {
  slot: PlaylistSlot
  sort: 'views' | 'recent'
  skip: number
  take: number
  /** When set, lists only this playlist (any slot) instead of the whole slot. */
  playlistId?: string
}): Promise<{ videos: CachedVideo[]; total: number }> {
  const where = slotWhere(params.slot, params.playlistId)

  if (params.sort === 'recent') {
    const total = await prisma.cachedVideo.count({ where })
    const videos = await prisma.cachedVideo.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: params.skip,
      take: params.take,
    })
    return { videos, total }
  }

  const all = await prisma.cachedVideo.findMany({ where })
  all.sort((a, b) => parseInt(b.viewCount || '0', 10) - parseInt(a.viewCount || '0', 10))
  const total = all.length
  const videos = all.slice(params.skip, params.skip + params.take)
  return { videos, total }
}

/** Active playlists (any slot) that have at least one public video, for /media filters. */
export async function listPublicPlaylists(): Promise<{ id: string; name: string; slot: PlaylistSlot }[]> {
  const rows = await prisma.youTubePlaylist.findMany({
    where: { isActive: true, videos: { some: { isActive: true } } },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, slot: true },
  })
  return rows
}
