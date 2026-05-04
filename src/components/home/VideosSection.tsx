'use client'

import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'
import Link from 'next/link'
import PublicVideoCard from '@/components/media/PublicVideoCard'
import type { PublicVideo } from '@/lib/site-content'
import { usePublicVideoLightbox } from '@/components/media/usePublicVideoLightbox'
import { getCopyString, type SiteCopy } from '@/lib/site-copy'

export default function VideosSection({ videos, copy }: { videos: PublicVideo[]; copy: SiteCopy }) {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true })
  const { openAtVideoIndex, videoLightbox } = usePublicVideoLightbox(videos)
  const h = (k: string) => getCopyString(copy, `home.${k}`)

  return (
    <section ref={ref} className="px-8 md:px-20 py-[clamp(6rem,12vw,14rem)]">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-end justify-between mb-16 flex-wrap gap-8">
          <div>
            <p className="eyebrow mb-6">{h('videosEyebrow')}</p>
            <h2 className="display-2 text-[var(--body)]">
              {h('videosHeading1')}
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
          {videos.slice(0, 6).map((video, i) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -4 }}
            >
              <PublicVideoCard video={video} videoIndex={i} onPlayClick={openAtVideoIndex} />
            </motion.div>
          ))}
        </div>
        {videoLightbox}
      </div>
    </section>
  )
}
