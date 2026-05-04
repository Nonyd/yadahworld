import type { PlaylistSlot } from '@prisma/client'
import { prisma } from '@/lib/prisma'

const YT_API_BASE = 'https://www.googleapis.com/youtube/v3'

interface YouTubePlaylistItem {
  snippet: {
    title: string
    description: string
    publishedAt: string
    resourceId: { videoId: string }
    thumbnails?: {
      maxres?: { url: string }
      high?: { url: string }
      medium?: { url: string }
      default?: { url: string }
    } | null
  }
}

function thumbnailsMissing(thumbnails: YouTubePlaylistItem['snippet']['thumbnails']): boolean {
  if (thumbnails == null || typeof thumbnails !== 'object') return true
  return Object.keys(thumbnails).length === 0
}

function isPrivateOrHiddenVideo(title: string, thumbnails: YouTubePlaylistItem['snippet']['thumbnails']): boolean {
  return title === 'Private video' || thumbnailsMissing(thumbnails)
}

interface YouTubeVideoDetails {
  id: string
  contentDetails: { duration: string }
  statistics: { viewCount: string }
}

export async function syncPlaylist(playlistDbId: string): Promise<{ synced: number; errors: string[] }> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) throw new Error('YOUTUBE_API_KEY not set')

  const playlist = await prisma.youTubePlaylist.findUnique({
    where: { id: playlistDbId },
  })
  if (!playlist || !playlist.isActive) return { synced: 0, errors: [] }

  const errors: string[] = []
  let synced = 0
  let nextPageToken: string | undefined

  const allItems: YouTubePlaylistItem[] = []

  do {
    const params = new URLSearchParams({
      part: 'snippet',
      playlistId: playlist.youtubePlaylistId,
      maxResults: '50',
      key: apiKey,
    })
    if (nextPageToken) params.set('pageToken', nextPageToken)

    const res = await fetch(`${YT_API_BASE}/playlistItems?${params}`)
    if (!res.ok) {
      errors.push(`Playlist fetch failed: ${res.status} ${res.statusText}`)
      break
    }

    const data = await res.json()
    allItems.push(...(data.items ?? []))
    nextPageToken = data.nextPageToken
  } while (nextPageToken && allItems.length < playlist.maxVideos)

  const items = allItems.slice(0, playlist.maxVideos)
  if (items.length === 0) return { synced: 0, errors }

  const videoIds = items.map((i) => i.snippet.resourceId.videoId)
  const detailsMap = new Map<string, YouTubeVideoDetails>()

  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50)
    const params = new URLSearchParams({
      part: 'contentDetails,statistics',
      id: batch.join(','),
      key: apiKey,
    })
    const res = await fetch(`${YT_API_BASE}/videos?${params}`)
    if (res.ok) {
      const data = await res.json()
      for (const video of data.items ?? []) {
        detailsMap.set(video.id, video)
      }
    }
  }

  for (const item of items) {
    try {
      const videoId = item.snippet.resourceId.videoId
      const thumbnails = item.snippet.thumbnails
      const thumbnailUrl =
        thumbnails?.maxres?.url ??
        thumbnails?.high?.url ??
        thumbnails?.medium?.url ??
        thumbnails?.default?.url ??
        ''

      const details = detailsMap.get(videoId)
      const hideFromPublic = isPrivateOrHiddenVideo(item.snippet.title, thumbnails)

      await prisma.cachedVideo.upsert({
        where: { youtubeVideoId: videoId },
        create: {
          youtubeVideoId: videoId,
          title: item.snippet.title,
          description: item.snippet.description ?? null,
          thumbnailUrl,
          publishedAt: new Date(item.snippet.publishedAt),
          duration: details?.contentDetails?.duration ?? null,
          viewCount: details?.statistics?.viewCount ?? null,
          isActive: !hideFromPublic,
          playlistId: playlist.id,
        },
        update: {
          title: item.snippet.title,
          description: item.snippet.description ?? null,
          thumbnailUrl,
          duration: details?.contentDetails?.duration ?? null,
          viewCount: details?.statistics?.viewCount ?? null,
          playlistId: playlist.id,
          isActive: !hideFromPublic,
        },
      })
      synced++
    } catch (err) {
      errors.push(`Video ${item.snippet.resourceId.videoId}: ${String(err)}`)
    }
  }

  await prisma.cachedVideo.updateMany({
    where: { title: 'Private video' },
    data: { isActive: false },
  })

  await prisma.youTubePlaylist.update({
    where: { id: playlistDbId },
    data: { lastSyncedAt: new Date() },
  })

  return { synced, errors }
}

export async function syncAllPlaylists() {
  const playlists = await prisma.youTubePlaylist.findMany({
    where: { isActive: true },
  })
  const results = []
  for (const playlist of playlists) {
    const result = await syncPlaylist(playlist.id)
    results.push({ name: playlist.name, ...result })
  }
  return results
}

export async function getVideosBySlot(slot: PlaylistSlot, limit?: number) {
  return prisma.cachedVideo.findMany({
    where: {
      isActive: true,
      playlist: { slot, isActive: true },
    },
    orderBy: { publishedAt: 'desc' },
    take: limit,
    include: { playlist: true },
  })
}
