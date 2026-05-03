'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import type { PublicVideo } from '@/lib/site-content'
import { usePublicVideoLightbox } from '@/components/media/usePublicVideoLightbox'

export default function MediaPageClient({
  videos,
  galleryUrls,
}: {
  videos: PublicVideo[]
  galleryUrls: string[]
}) {
  const [tab, setTab] = useState<'videos' | 'photos'>('videos')
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const { openAtVideoIndex, videoLightbox } = usePublicVideoLightbox(videos)

  const slides = useMemo(() => galleryUrls.map((src) => ({ src })), [galleryUrls])

  return (
    <div className="min-h-screen pt-40 pb-24 px-8 md:px-20 bg-bg">
      <div className="max-w-screen-xl mx-auto">
        <p className="eyebrow mb-4">Library</p>
        <h1 className="display-2 text-body mb-12">Media</h1>

        <div className="flex gap-8 border-b border-[rgba(42,37,32,0.1)] mb-12">
          <button
            type="button"
            onClick={() => setTab('videos')}
            className={`pb-4 ui-label transition-colors ${
              tab === 'videos' ? 'text-accent border-b border-accent' : 'text-muted hover:text-body'
            }`}
          >
            Videos
          </button>
          <button
            type="button"
            onClick={() => setTab('photos')}
            className={`pb-4 ui-label transition-colors ${
              tab === 'photos' ? 'text-accent border-b border-accent' : 'text-muted hover:text-body'
            }`}
          >
            Photos
          </button>
        </div>

        {tab === 'videos' && (
          <div id="videos" className="space-y-12">
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {videos.map((v, vi) => (
                <button
                  key={v.id}
                  type="button"
                  aria-label={`Play video: ${v.title}`}
                  onClick={() => openAtVideoIndex(vi)}
                  className="relative group overflow-hidden aspect-video block w-full cursor-pointer text-left manuscript-frame shadow-[0_4px_24px_rgba(13,11,8,0.08)] border border-[rgba(42,37,32,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Image
                    src={v.thumbnail}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-deep/35 group-hover:bg-deep/20 transition-all duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="w-16 h-16 rounded-full border-2 border-ivory flex items-center justify-center bg-ivory/10 backdrop-blur-sm group-hover:border-gold-light/60 transition-colors">
                      <svg className="w-6 h-6 fill-ivory ml-1" viewBox="0 0 24 24" aria-hidden>
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-deep/90 to-transparent">
                    <p className="font-playfair text-xl text-ivory">{v.title}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="border border-[rgba(42,37,32,0.1)] p-6 md:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-surface/40">
              <p className="body-sm max-w-md">
                Videos are managed in the studio under <span className="text-body font-medium">Videos</span>. Photo strips come from{' '}
                <span className="text-body font-medium">Settings → Photo gallery</span>.
              </p>
              <Link
                href="https://open.spotify.com/search/yadah%20minister"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 btn-outline border-emerald-700/30 hover:border-emerald-700/50"
              >
                Spotify
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        )}

        {tab === 'photos' && (
          <div className="columns-1 sm:columns-2 gap-4 space-y-4">
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
          on={{ view: ({ index: i }) => setIndex(i) }}
        />
        {videoLightbox}
      </div>
    </div>
  )
}
