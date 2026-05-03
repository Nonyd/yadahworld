'use client'

import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import type { PublicVideo } from '@/lib/site-content'
import { usePublicVideoLightbox } from '@/components/media/usePublicVideoLightbox'

export default function VideosSection({ videos }: { videos: PublicVideo[] }) {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true })
  const { openAtVideoIndex, videoLightbox } = usePublicVideoLightbox(videos)

  return (
    <section ref={ref} className="px-8 md:px-20 py-[clamp(6rem,12vw,14rem)]">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-end justify-between mb-16 flex-wrap gap-8">
          <div>
            <p className="eyebrow mb-6">05 — The Visual</p>
            <h2 className="display-2 text-[var(--body)]">
              Latest
              <br />
              <em className="font-playfair italic">Videos.</em>
            </h2>
          </div>
          <Link href="/media#videos" className="btn-ghost hidden md:flex">
            <span className="arrow-line" />
            See More
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {videos.slice(0, 6).map((video, i) => (
            <motion.button
              key={video.id}
              type="button"
              aria-label={`Play video: ${video.title}`}
              onClick={() => openAtVideoIndex(i)}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -4 }}
              className="relative group overflow-hidden aspect-video block w-full cursor-pointer text-left manuscript-frame shadow-[0_4px_24px_rgba(13,11,8,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Image
                src={video.thumbnail}
                alt=""
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-deep/35 group-hover:bg-deep/20 transition-all duration-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="w-16 h-16 rounded-full border border-ivory/80 flex items-center justify-center bg-ivory/10 backdrop-blur-sm group-hover:border-gold-light/60 transition-colors duration-300">
                  <svg className="w-6 h-6 fill-ivory ml-1" viewBox="0 0 24 24" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-deep/90 to-transparent">
                <p className="font-playfair text-xl text-ivory">{video.title}</p>
              </div>
            </motion.button>
          ))}
        </div>
        {videoLightbox}
      </div>
    </section>
  )
}
