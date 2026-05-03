'use client'

import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { PublicEvent } from '@/lib/site-content'
import { getCopyString, type SiteCopy } from '@/lib/site-copy'

export default function UpcomingEvents({ events, copy }: { events: PublicEvent[]; copy: SiteCopy }) {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true })
  const h = (k: string) => getCopyString(copy, `home.${k}`)

  return (
    <section id="events" ref={ref} className="px-8 md:px-20 py-[clamp(6rem,12vw,14rem)]">
      <div className="max-w-screen-xl mx-auto">
        <div className="mb-14">
          <p className="eyebrow mb-6">{h('eventsEyebrow')}</p>
          <h2 className="display-2 text-[var(--body)] leading-tight">
            {h('eventsHeading1')}
            <br />
            <em className="font-playfair italic text-muted">{h('eventsHeading2')}</em>
          </h2>
        </div>

        <ul className="divide-y divide-[rgba(42,37,32,0.08)] border border-[rgba(42,37,32,0.1)]">
          {events.map((ev, i) => (
            <motion.li
              key={`${ev.title}-${ev.dateLabel}`}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.6, ease: [0.77, 0, 0.175, 1] }}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-8 px-6 md:px-8 hover:bg-surface/60 transition-colors"
            >
              <div>
                <p className="font-playfair text-2xl md:text-3xl text-[var(--body)]">{ev.title}</p>
                <p className="font-jost text-sm tracking-wide text-[var(--muted)] mt-2">
                  {ev.dateLabel} · {ev.location}
                </p>
              </div>
              {ev.external ? (
                <a
                  href={ev.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 ui-label text-accent hover:text-accent-light transition-colors"
                >
                  {h('eventsDetails')}
                  <span aria-hidden>→</span>
                </a>
              ) : (
                <Link href={ev.href} className="inline-flex items-center gap-2 ui-label text-accent hover:text-accent-light transition-colors">
                  {h('eventsBookInquire')}
                  <span aria-hidden>→</span>
                </Link>
              )}
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
