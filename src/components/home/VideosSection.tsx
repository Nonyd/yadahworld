'use client'

import { useCallback, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import type { PublicVideo } from '@/lib/site-content'
import { getCopyString, type SiteCopy } from '@/lib/site-copy'
import { extractYoutubeVideoId } from '@/lib/youtube'

function formatPublishedShort(iso: string | null | undefined) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return ''
  }
}

function youtubeWatchHref(video: PublicVideo) {
  if (video.youtubeVideoId) return `https://youtube.com/watch?v=${video.youtubeVideoId}`
  return video.youtubeUrl
}

function youtubeIdForEmbed(video: PublicVideo): string | null {
  const fromField = video.youtubeVideoId?.trim()
  if (fromField) return fromField
  return extractYoutubeVideoId(video.youtubeUrl)
}

export default function VideosSection({ videos, copy }: { videos: PublicVideo[]; copy: SiteCopy }) {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true })
  const h = (k: string) => getCopyString(copy, `home.${k}`)
  const display = videos.slice(0, 3)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const stop = useCallback(() => setPlayingId(null), [])

  return (
    <section ref={ref} className="px-8 md:px-20 py-[clamp(3.5rem,7vw,7rem)]">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-end justify-between mb-16 flex-wrap gap-8">
          <div>
            <p className="eyebrow mb-6">{h('videosEyebrow')}</p>
            <h2 className="display-2 text-[var(--body)]">Music Videos.</h2>
          </div>
          <Link href="/media#videos" className="btn-ghost hidden md:flex">
            <span className="arrow-line" />
            {h('videosSeeMore')}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {display.map((video, i) => {
            const ytId = youtubeIdForEmbed(video)
            const isPlaying = playingId === video.id && Boolean(ytId)
            return (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ y: -4 }}
                className="flex flex-col"
              >
                <div className="group relative aspect-video w-full overflow-hidden manuscript-frame border border-[rgba(42,37,32,0.08)] shadow-[0_4px_24px_rgba(13,11,8,0.08)] bg-black">
                  {isPlaying && ytId ? (
                    <>
                      <iframe
                        title={video.title}
                        src={`https://www.youtube.com/embed/${encodeURIComponent(ytId)}?autoplay=1&rel=0`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="absolute inset-0 z-0 h-full w-full border-0"
                      />
                      <button
                        type="button"
                        onClick={stop}
                        className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(253,250,245,0.35)] bg-deep/80 text-ivory backdrop-blur-sm transition-colors hover:bg-deep"
                        aria-label="Close video"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                          <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <>
                      <Image
                        src={video.thumbnail}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      {ytId ? (
                        <button
                          type="button"
                          onClick={() => setPlayingId(video.id)}
                          className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-black/0 transition-colors duration-300 hover:bg-black/20"
                          aria-label={`Play video: ${video.title}`}
                        >
                          <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[var(--white)] bg-[var(--white)]/20 shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
                            <svg className="ml-0.5 h-5 w-5 fill-[var(--deep)]" viewBox="0 0 24 24" aria-hidden>
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </span>
                        </button>
                      ) : null}
                    </>
                  )}
                </div>
                <p className="mt-3 font-baskerville text-sm text-[var(--body)]">{video.title}</p>
                {formatPublishedShort(video.publishedAtIso) ? (
                  <p className="mt-1 ui-label text-[var(--muted)]">{formatPublishedShort(video.publishedAtIso)}</p>
                ) : null}
                <a
                  href={youtubeWatchHref(video)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost mt-2 self-start text-[0.65rem] tracking-[0.18em]"
                >
                  Watch on YouTube →
                </a>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
