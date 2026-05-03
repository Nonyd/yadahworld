'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import type { PublicVideo } from '@/lib/site-content'
import { extractYoutubeVideoId, youtubeWatchUrl } from '@/lib/youtube'
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
              {videos.map((v, vi) => {
                const yid = extractYoutubeVideoId(v.youtubeUrl)
                const watch = yid ? youtubeWatchUrl(yid) : v.youtubeUrl
                return (
                  <div key={v.id} className="flex flex-col gap-3">
                    <button
                      type="button"
                      aria-label={`Play video: ${v.title}`}
                      onClick={() => openAtVideoIndex(vi)}
                      className="relative group aspect-video w-full cursor-pointer overflow-hidden text-left manuscript-frame border border-[rgba(42,37,32,0.08)] shadow-[0_4px_24px_rgba(13,11,8,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <Image
                        src={v.thumbnail}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-deep/35 transition-all duration-500 group-hover:bg-deep/20" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-ivory bg-ivory/10 backdrop-blur-sm transition-colors group-hover:border-gold-light/60">
                          <svg className="ml-1 h-6 w-6 fill-ivory" viewBox="0 0 24 24" aria-hidden>
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                      </div>
                    </button>
                    <div>
                      <p className="font-playfair text-lg text-body">{v.title}</p>
                      <a
                        href={watch}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block ui-label text-muted hover:text-accent"
                      >
                        {m('watchYoutube')}
                      </a>
                    </div>
                  </div>
                )
              })}
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
