'use client'

import { useState, useCallback } from 'react'
import { type PublicVideo, deserializeCachedVideoToPublic } from '@/lib/site-content'
import StackedVideoCard from '@/components/media/StackedVideoCard'
import { usePublicVideoLightbox } from '@/components/media/usePublicVideoLightbox'

const PAGE_SIZE = 15
const SLOT = 'MINISTRATIONS'

type SortKey = 'views' | 'recent'

type ApiVideoRow = {
  id: string
  title: string
  youtubeVideoId: string
  thumbnailUrl: string
  duration: string | null
  publishedAt: string
  viewCount: string | null
}

async function fetchVideos(sort: SortKey, skip: number) {
  const params = new URLSearchParams({
    slot: SLOT,
    sort,
    skip: String(skip),
    take: String(PAGE_SIZE),
  })
  const res = await fetch(`/api/videos?${params}`)
  if (!res.ok) throw new Error('Failed to load videos')
  const data = (await res.json()) as { videos: ApiVideoRow[]; total: number }
  const videos = data.videos.map(deserializeCachedVideoToPublic)
  return { videos, total: data.total }
}

export default function MinistrationsClient({
  videos: initialVideos,
  videoTotal: initialTotal,
}: {
  videos: PublicVideo[]
  videoTotal: number
}) {
  const [sort, setSort] = useState<SortKey>('views')
  const [videos, setVideos] = useState<PublicVideo[]>(initialVideos)
  const [total, setTotal] = useState(initialTotal)
  const [loading, setLoading] = useState(false)
  const [loadMoreLoading, setLoadMoreLoading] = useState(false)

  const { openAtVideoIndex, videoLightbox } = usePublicVideoLightbox(videos)
  const hasMore = videos.length < total

  const sortClass = (active: boolean) =>
    active
      ? 'bg-[var(--accent)] text-white px-4 py-2 font-jost text-xs tracking-widest uppercase'
      : 'border border-[var(--accent)] text-[var(--accent)] px-4 py-2 font-jost text-xs tracking-widest uppercase'

  const onSortChange = useCallback(
    async (next: SortKey) => {
      if (next === sort) return
      setLoading(true)
      try {
        const { videos: nextVideos, total: nextTotal } = await fetchVideos(next, 0)
        setSort(next)
        setVideos(nextVideos)
        setTotal(nextTotal)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    },
    [sort],
  )

  const onLoadMore = useCallback(async () => {
    setLoadMoreLoading(true)
    try {
      const { videos: more, total: nextTotal } = await fetchVideos(sort, videos.length)
      setTotal(nextTotal)
      setVideos((prev) => [...prev, ...more])
    } catch (e) {
      console.error(e)
    } finally {
      setLoadMoreLoading(false)
    }
  }, [sort, videos.length])

  return (
    <div>
      <div className="mb-10 flex flex-wrap gap-3">
        <button type="button" disabled={loading} className={sortClass(sort === 'views')} onClick={() => onSortChange('views')}>
          Most Viewed
        </button>
        <button type="button" disabled={loading} className={sortClass(sort === 'recent')} onClick={() => onSortChange('recent')}>
          Recent
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {videos.map((v, i) => (
          <StackedVideoCard key={v.id} video={v} videoIndex={i} onPlayClick={openAtVideoIndex} />
        ))}
      </div>

      {hasMore ? (
        <div className="mt-8 flex justify-center">
          <button type="button" className="btn-outline" disabled={loadMoreLoading} onClick={() => void onLoadMore()}>
            {loadMoreLoading ? 'Loading…' : 'Load More'}
          </button>
        </div>
      ) : null}

      {videoLightbox}
    </div>
  )
}
