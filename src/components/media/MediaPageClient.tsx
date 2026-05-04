'use client'

import { useState, useMemo, useCallback } from 'react'
import Image from 'next/image'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { type PublicVideo, deserializeCachedVideoToPublic } from '@/lib/site-content'
import StackedVideoCard from '@/components/media/StackedVideoCard'
import { usePublicVideoLightbox } from '@/components/media/usePublicVideoLightbox'
import type { SiteCopy } from '@/lib/site-copy'
import { getCopyString } from '@/lib/site-copy'

const PAGE_SIZE = 15
const SLOT = 'MUSIC_VIDEOS'

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

export default function MediaPageClient({
  videos: initialVideos,
  videoTotal: initialTotal,
  galleryUrls,
  copy,
}: {
  videos: PublicVideo[]
  videoTotal: number
  galleryUrls: string[]
  copy: SiteCopy
}) {
  const [tab, setTab] = useState<'videos' | 'photos'>('videos')
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [sort, setSort] = useState<SortKey>('views')
  const [videos, setVideos] = useState<PublicVideo[]>(initialVideos)
  const [total, setTotal] = useState(initialTotal)
  const [loading, setLoading] = useState(false)
  const [loadMoreLoading, setLoadMoreLoading] = useState(false)

  const { openAtVideoIndex, videoLightbox } = usePublicVideoLightbox(videos)

  const slides = useMemo(() => galleryUrls.map((src) => ({ src })), [galleryUrls])
  const m = (k: string) => getCopyString(copy, `media.${k}`)
  const hasMore = videos.length < total

  const sortClass = (active: boolean) =>
    active
      ? 'bg-[var(--accent)] text-white px-4 py-2 font-jost text-xs tracking-widest uppercase'
      : 'border border-[var(--accent)] text-[var(--accent)] px-4 py-2 font-jost text-xs tracking-widest uppercase'

  const onSortChange = useCallback(async (next: SortKey) => {
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
  }, [sort])

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
    <div className="min-h-screen pt-40 pb-24 px-8 md:px-20 bg-bg">
      <div className="max-w-screen-xl mx-auto">
        <p className="eyebrow mb-4">{m('eyebrow')}</p>
        <h1 className="display-2 text-body mb-12">{m('title')}</h1>

        <div className="flex gap-8 border-b border-[rgba(42,37,32,0.1)] mb-12">
          <button
            type="button"
            onClick={() => setTab('videos')}
            className={`pb-4 ui-label transition-colors ${
              tab === 'videos' ? 'text-accent border-b border-accent' : 'text-muted hover:text-body'
            }`}
          >
            {m('tabVideos')}
          </button>
          <button
            type="button"
            onClick={() => setTab('photos')}
            className={`pb-4 ui-label transition-colors ${
              tab === 'photos' ? 'text-accent border-b border-accent' : 'text-muted hover:text-body'
            }`}
          >
            {m('tabPhotos')}
          </button>
        </div>

        {tab === 'videos' && (
          <div id="videos" className="space-y-10">
            <div className="flex flex-wrap gap-3">
              <button type="button" disabled={loading} className={sortClass(sort === 'views')} onClick={() => onSortChange('views')}>
                Most Viewed
              </button>
              <button type="button" disabled={loading} className={sortClass(sort === 'recent')} onClick={() => onSortChange('recent')}>
                Recent
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {videos.map((v, vi) => (
                <StackedVideoCard key={v.id} video={v} videoIndex={vi} onPlayClick={openAtVideoIndex} />
              ))}
            </div>

            {hasMore ? (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  className="btn-outline"
                  disabled={loadMoreLoading}
                  onClick={() => void onLoadMore()}
                >
                  {loadMoreLoading ? 'Loading…' : 'Load More'}
                </button>
              </div>
            ) : null}
          </div>
        )}

        {tab === 'photos' && (
          <div className="columns-2 gap-3 space-y-3 md:columns-3 xl:columns-4">
            {galleryUrls.map((src, i) => (
              <button
                type="button"
                key={`${src}-${i}`}
                onClick={() => {
                  setIndex(i)
                  setOpen(true)
                }}
                className="relative break-inside-avoid overflow-hidden manuscript-frame w-full block mb-4 focus:outline-none focus:ring-2 focus:ring-accent border border-[rgba(42,37,32,0.08)]"
              >
                <Image
                  src={src}
                  alt={`Gallery ${i + 1}`}
                  width={800}
                  height={1000}
                  className="w-full h-auto object-cover hover:opacity-90 transition-opacity"
                />
              </button>
            ))}
          </div>
        )}

        <Lightbox
          open={open}
          close={() => setOpen(false)}
          index={index}
          slides={slides}
          controller={{ closeOnBackdropClick: true }}
          on={{ view: ({ index: i }) => setIndex(i) }}
        />
        {videoLightbox}
      </div>
    </div>
  )
}
