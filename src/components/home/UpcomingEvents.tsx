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
    <section id="events" ref={ref} className="px-8 md:px-20 pt-[clamp(3.5rem,7vw,7rem)] pb-[clamp(6rem,12vw,14rem)]">
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
              style={{ borderLeft: '2px solid var(--gold)', paddingLeft: '1rem' }}
              className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 py-8 pr-6 md:pr-8 hover:bg-surface/60 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="font-playfair text-[clamp(1.35rem,3.5vw,2.35rem)] font-normal leading-tight text-[var(--body)] tracking-tight">
                  {ev.dateLabel}
                </p>
                <p className="font-playfair text-xl md:text-2xl text-[var(--body)] mt-3">{ev.title}</p>
                <p className="font-jost text-sm tracking-wide text-[var(--muted)] mt-2">{ev.location}</p>
              </div>
              {ev.external ? (
                <a href={ev.href} target="_blank" rel="noopener noreferrer" className="btn-ghost shrink-0 self-start md:self-auto">
                  <span className="arrow-line" />
                  {h('eventsDetails')}
                </a>
              ) : (
                <Link href={ev.href} className="btn-ghost shrink-0 self-start md:self-auto">
                  <span className="arrow-line" />
                  {h('eventsBookInquire')}
                </Link>
              )}
            </motion.li>
          ))}
        </ul>
        <div className="mt-10 text-center">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 ui-label text-accent hover:text-accent-light transition-colors"
          >
            View all events
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
