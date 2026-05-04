import type { CachedVideo, PlaylistSlot } from '@prisma/client'
import { prisma } from '@/lib/prisma'

function slotWhere(slot: PlaylistSlot) {
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
}): Promise<{ videos: CachedVideo[]; total: number }> {
  const where = slotWhere(params.slot)

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
