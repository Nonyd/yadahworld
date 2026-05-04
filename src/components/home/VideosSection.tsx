'use client'

import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import type { PublicVideo } from '@/lib/site-content'
import { getCopyString, type SiteCopy } from '@/lib/site-copy'

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

export default function VideosSection({ videos, copy }: { videos: PublicVideo[]; copy: SiteCopy }) {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true })
  const h = (k: string) => getCopyString(copy, `home.${k}`)
  const display = videos.slice(0, 3)

  return (
    <section ref={ref} className="px-8 md:px-20 py-[clamp(6rem,12vw,14rem)]">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-end justify-between mb-16 flex-wrap gap-8">
          <div>
            <p className="eyebrow mb-6">{h('videosEyebrow')}</p>
            <h2 className="display-2 text-[var(--body)]">
              Music Videos.
              <br />
              <em className="font-playfair italic">{h('videosHeading2')}</em>
            </h2>
          </div>
          <Link href="/media#videos" className="btn-ghost hidden md:flex">
            <span className="arrow-line" />
            {h('videosSeeMore')}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {display.map((video, i) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -4 }}
              className="flex flex-col"
            >
              <div className="group relative aspect-video w-full overflow-hidden manuscript-frame border border-[rgba(42,37,32,0.08)] shadow-[0_4px_24px_rgba(13,11,8,0.08)]">
                <Image
                  src={video.thumbnail}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[var(--white)] bg-[var(--white)]/15 shadow-lg backdrop-blur-sm">
                    <svg className="ml-0.5 h-5 w-5 fill-[var(--deep)]" viewBox="0 0 24 24" aria-hidden>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </div>
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
          ))}
        </div>
      </div>
    </section>
  )
}
