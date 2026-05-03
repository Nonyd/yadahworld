'use client'

import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { images } from '@/lib/imagePlaceholders'

const videos = [
  {
    title: 'Never Seen (Live)',
    thumbnail: images.videoNeverSeen,
    youtube: 'https://www.youtube.com/results?search_query=yadah+never+seen+live',
  },
  {
    title: 'Na Your Hand',
    thumbnail: images.videoNaYourHand,
    youtube: 'https://www.youtube.com/results?search_query=yadah+na+your+hand',
  },
]

export default function VideosSection() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true })

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

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {videos.map((video, i) => (
            <motion.a
              key={video.title}
              href={video.youtube}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -4 }}
              className="relative group overflow-hidden aspect-video block manuscript-frame shadow-[0_4px_24px_rgba(13,11,8,0.08)]"
            >
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, 50vw"
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
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
