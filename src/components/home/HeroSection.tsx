'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Link from 'next/link'

gsap.registerPlugin(ScrollTrigger)

const CHAR_VARIANTS = {
  hidden: { y: '110%', opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: 0.1 + i * 0.055,
      duration: 0.9,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
}

const DEFAULT_EYEBROW = '01 — The Voice of Jesus Christ to Nations'
const DEFAULT_SUBLINE = 'Gospel music minister · 100M+ streams · Abuja, Nigeria'

export default function HeroSection({
  heroImage,
  heroEyebrow,
  heroSubline,
}: {
  heroImage: string
  /** Line above the Yadah title (e.g. 01 — The Voice of Jesus Christ to Nations). */
  heroEyebrow?: string | null
  /** Italic line under the title. */
  heroSubline?: string | null
}) {
  const sectionRef = useRef<HTMLElement>(null)
  const imgRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  const eyebrow = heroEyebrow?.trim() || DEFAULT_EYEBROW
  const subline = heroSubline?.trim() || DEFAULT_SUBLINE

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(imgRef.current, {
        yPercent: 25,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
      gsap.to(textRef.current, {
        opacity: 0,
        y: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: '30% top',
          end: '70% top',
          scrub: true,
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const chars = 'Yadah'.split('')

  return (
    <section
      ref={sectionRef}
      className="relative h-screen min-h-[700px] overflow-hidden flex flex-col justify-end pb-20 md:pb-28"
    >
      <div
        ref={imgRef}
        className="absolute inset-0 scale-[1.15]"
        style={{
          backgroundImage: `url('${heroImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(to top, rgba(13,11,8,0.92) 0%, rgba(13,11,8,0.45) 45%, rgba(13,11,8,0.15) 100%),
            linear-gradient(to right, rgba(13,11,8,0.3) 0%, transparent 60%)
          `,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      <div ref={textRef} className="relative z-10 px-8 md:px-20">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="ui-label mb-8 text-[rgba(253,250,245,0.35)]"
        >
          {eyebrow}
        </motion.p>

        <h1
          className="font-playfair font-normal leading-[0.92] tracking-[-0.02em] text-[#FDFAF5] mb-6 overflow-hidden"
          style={{ fontSize: 'clamp(6rem, 14vw, 11rem)' }}
          aria-label="Yadah"
        >
          {chars.map((char, i) => (
            <span key={i} style={{ display: 'inline-block', overflow: 'hidden' }}>
              <motion.span
                custom={i}
                variants={CHAR_VARIANTS}
                initial="hidden"
                animate="visible"
                style={{ display: 'inline-block' }}
              >
                {char}
              </motion.span>
            </span>
          ))}
        </h1>

        <div style={{ overflow: 'hidden' }}>
          <motion.p
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="font-jost font-light italic text-[clamp(1rem,2.5vw,1.5rem)] text-[rgba(253,250,245,0.55)] max-w-xl"
          >
            {subline}
          </motion.p>
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.05, duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-6 mb-10 h-px max-w-md origin-left"
          style={{ background: 'var(--gold)' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-wrap items-center gap-6"
        >
          <Link href="/booking" className="btn-primary">
            Book Yadah
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
          <a href="#music" className="btn-ghost" style={{ color: 'rgba(253,250,245,0.5)' }}>
            <span className="arrow-line" />
            Explore Music
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-8 right-8 md:bottom-10 md:right-12 flex flex-col items-center gap-2"
      >
        <span
          className="ui-label text-[rgba(253,250,245,0.35)] lowercase"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          scroll
        </span>
        <motion.span
          animate={{ scaleY: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="block h-12 w-px origin-top"
          style={{ background: 'rgba(253,250,245,0.2)' }}
        />
      </motion.div>
    </section>
  )
}
