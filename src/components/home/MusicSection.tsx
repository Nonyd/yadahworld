'use client'

import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import type { PublicRelease } from '@/lib/site-content'

export default function MusicSection({ releases }: { releases: PublicRelease[] }) {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })

  return (
    <section id="music" ref={ref} className="px-8 md:px-20 py-[clamp(6rem,12vw,14rem)]">
      <div className="max-w-screen-xl mx-auto flex items-end justify-between mb-16 flex-wrap gap-8">
        <div>
          <p className="eyebrow mb-6">04 — The Sound</p>
          <h2 className="display-2 text-[var(--body)]">
            Recent
            <br />
            <em className="font-playfair italic">Releases.</em>
          </h2>
        </div>
        <Link href="/media" className="btn-ghost hidden md:flex">
          <span className="arrow-line" />
          All Releases
        </Link>
      </div>

      <div className="max-w-screen-xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {releases.map((release, i) => {
          const href = release.spotify ?? '/media'
          const external = href.startsWith('http')
          return (
          <motion.a
            key={`${release.title}-${release.year}`}
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.1, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ y: -4 }}
            className="group block"
            style={{ textDecoration: 'none', boxShadow: '0 4px 24px rgba(13,11,8,0.06)' }}
          >
            <div className="manuscript-frame relative aspect-square overflow-hidden mb-4">
              <Image
                src={release.cover}
                alt={release.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              {release.isNew && (
                <span
                  className="absolute top-3 left-3 ui-label px-2 py-1 text-[10px]"
                  style={{ background: 'var(--accent)', color: 'var(--white)' }}
                >
                  New
                </span>
              )}
            </div>
            <p
              className="font-playfair text-base font-normal leading-snug mb-1 group-hover:text-[var(--accent)] transition-colors"
              style={{ color: 'var(--body)' }}
            >
              {release.title}
              {release.feat && (
                <span className="font-baskerville italic text-sm" style={{ color: 'var(--muted)' }}>
                  {' '}
                  {release.feat}
                </span>
              )}
            </p>
            <p className="ui-label" style={{ color: 'var(--muted)' }}>
              {release.type} · {release.year}
            </p>
          </motion.a>
        )})}
      </div>
    </section>
  )
}
