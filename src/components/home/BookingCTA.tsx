'use client'

import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { images } from '@/lib/imagePlaceholders'

export default function BookingCTA() {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true })

  return (
    <section ref={ref} className="relative py-[clamp(8rem,16vw,18rem)] px-8 md:px-20 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url('${images.worshipBg}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(13,11,8,0.85), rgba(13,11,8,0.75))',
        }}
      />

      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.6, ease: [0.77, 0, 0.175, 1] }}
        className="absolute top-16 left-20 right-20 h-px origin-left max-md:left-8 max-md:right-8"
        style={{ background: 'rgba(201,168,76,0.25)' }}
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="eyebrow mb-10 text-[var(--gold-light)] opacity-60"
        >
          07 — Invite Yadah
        </motion.p>

        {['Yadah is always', 'glad to be', 'a blessing.'].map((line, i) => (
          <div key={line} style={{ overflow: 'hidden' }}>
            <motion.p
              initial={{ y: '110%' }}
              animate={inView ? { y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.12, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="font-playfair font-normal leading-[1.1] text-[#FDFAF5]"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}
            >
              {i === 2 ? (
                <em className="italic" style={{ color: 'var(--gold-light)' }}>
                  {line}
                </em>
              ) : (
                line
              )}
            </motion.p>
          </div>
        ))}

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="font-baskerville italic text-[rgba(253,250,245,0.45)] text-lg mt-8 mb-12"
        >
          Concert · Church Conference · Worship Night · Album Launch
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
        >
          <Link
            href="/booking"
            className="inline-flex items-center gap-4 border text-[var(--white)] px-10 py-5 font-jost text-[0.7rem] tracking-[0.2em] uppercase hover:bg-[var(--white)] hover:text-[var(--accent)] transition-all duration-500"
            style={{ borderColor: 'rgba(253,250,245,0.3)' }}
          >
            Submit Booking Request
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M1 7h12M7 1l6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
