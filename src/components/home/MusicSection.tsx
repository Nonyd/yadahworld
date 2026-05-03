'use client'

import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { releaseTypeDateLine } from '@/lib/release-display'
import type { PublicRelease } from '@/lib/site-content'
import { getCopyString, type SiteCopy } from '@/lib/site-copy'

const MotionLink = motion(Link)

export default function MusicSection({ releases, copy }: { releases: PublicRelease[]; copy: SiteCopy }) {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })
  const h = (k: string) => getCopyString(copy, `home.${k}`)
  const badgeNew = getCopyString(copy, 'releases.badgeNew')

  return (
    <section id="music" ref={ref} className="px-8 md:px-20 py-[clamp(6rem,12vw,14rem)]">
      <div className="max-w-screen-xl mx-auto flex items-end justify-between mb-16 flex-wrap gap-8">
        <div>
          <p className="eyebrow mb-6">{h('musicEyebrow')}</p>
          <h2 className="display-2 text-[var(--body)]">
            {h('musicHeading1')}
            <br />
            <em className="font-playfair italic">{h('musicHeading2')}</em>
          </h2>
        </div>
        <Link href="/releases" className="btn-ghost hidden md:flex">
          <span className="arrow-line" />
          {h('musicAllReleases')}
        </Link>
      </div>

      <ul className="max-w-screen-xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {releases.map((release, i) => (
          <li key={release.slug}>
            <MotionLink
              href={`/releases/${release.slug}`}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="group block"
            >
              <div className="manuscript-frame relative mb-4 aspect-square overflow-hidden shadow-[0_4px_24px_rgba(13,11,8,0.06)]">
                <Image
                  src={release.cover}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {release.isNew && (
                  <span className="absolute left-3 top-3 ui-label bg-accent px-2 py-1 text-[10px] text-ivory">{badgeNew}</span>
                )}
              </div>
              <p className="font-playfair text-base text-body transition-colors group-hover:text-accent">{release.title}</p>
              <p className="ui-label mt-1 text-muted">{releaseTypeDateLine(release)}</p>
            </MotionLink>
          </li>
        ))}
      </ul>
    </section>
  )
}
