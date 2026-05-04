'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import type { PublicVideo } from '@/lib/site-content'
import PublicVideoCard from '@/components/media/PublicVideoCard'
import { usePublicVideoLightbox } from '@/components/media/usePublicVideoLightbox'
import type { SiteCopy } from '@/lib/site-copy'
import { getCopyString } from '@/lib/site-copy'

export default function MediaPageClient({
  videos,
  galleryUrls,
  copy,
}: {
  videos: PublicVideo[]
  galleryUrls: string[]
  copy: SiteCopy
}) {
  const [tab, setTab] = useState<'videos' | 'photos'>('videos')
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const { openAtVideoIndex, videoLightbox } = usePublicVideoLightbox(videos)

  const slides = useMemo(() => galleryUrls.map((src) => ({ src })), [galleryUrls])
  const m = (k: string) => getCopyString(copy, `media.${k}`)

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
          <div id="videos" className="space-y-12">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {videos.map((v, vi) => (
                <PublicVideoCard key={v.id} video={v} videoIndex={vi} onPlayClick={openAtVideoIndex} />
              ))}
            </div>
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
