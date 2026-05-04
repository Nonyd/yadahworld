'use client'

import type { CSSProperties } from 'react'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import PublicHrefLink from '@/components/ui/PublicHrefLink'

gsap.registerPlugin(ScrollTrigger)

const WORDS_ROW_1 = [
  'MINISTER',
  'WORSHIPPER',
  'WIFE',
  'SONGWRITER',
  'MINISTER',
  'WORSHIPPER',
  'WIFE',
  'SONGWRITER',
  'MINISTER',
  'WORSHIPPER',
  'WIFE',
  'SONGWRITER',
]

const WORDS_ROW_2 = [
  'VESSEL',
  'THE VOICE OF JESUS TO NATIONS',
  'VESSEL',
  'THE VOICE OF JESUS TO NATIONS',
  'VESSEL',
  'THE VOICE OF JESUS TO NATIONS',
]

const bookBtnStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  background: 'var(--accent)',
  color: '#FDFAF5',
  padding: '11px 24px',
  fontFamily: 'var(--font-jost)',
  fontSize: '9px',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  transition: 'background 0.3s',
}

const exploreStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  color: 'rgba(253,250,245,0.4)',
  fontFamily: 'var(--font-jost)',
  fontSize: '9px',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  padding: '11px 0',
  transition: 'color 0.3s',
}

interface HeroSectionProps {
  heroImageUrl?: string
  bookingHref?: string
}

export default function HeroSection({ heroImageUrl, bookingHref = '/booking' }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const state1Ref = useRef<HTMLDivElement>(null)
  const state2Ref = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=600',
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      })

      tl.to(
        state1Ref.current,
        {
          opacity: 0,
          y: -40,
          duration: 0.3,
        },
        0,
      )

      tl.to(
        state2Ref.current,
        {
          opacity: 1,
          duration: 0.4,
        },
        0.25,
      )

      tl.fromTo(
        imageRef.current,
        { x: 80, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5 },
        0.25,
      )
    }, sectionRef)

    const refresh = () => ScrollTrigger.refresh()
    requestAnimationFrame(refresh)
    return () => {
      ctx.revert()
      refresh()
    }
  }, [heroImageUrl])

  const wordStyle: CSSProperties = {
    fontFamily: 'var(--font-jost)',
    fontSize: 'clamp(3rem, 7vw, 6.5rem)',
    fontWeight: 300,
    letterSpacing: '0.06em',
    color: 'rgba(253,250,245,0.06)',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    paddingRight: '3rem',
  }

  return (
    <section
      ref={sectionRef}
      className="relative h-screen min-h-[100dvh] overflow-hidden"
      style={{ background: '#0A0806' }}
    >
      {/* STATE 1 */}
      <div ref={state1Ref} className="absolute inset-0 z-20 flex flex-col items-center justify-center">
        <div className="px-8 text-center">
          <div style={{ overflow: 'hidden' }}>
            <motion.span
              initial={{ y: '105%' }}
              animate={{ y: 0 }}
              transition={{
                duration: 1.2,
                delay: 0.2,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="block font-playfair italic"
              style={{
                fontSize: 'clamp(5rem, 16vw, 15rem)',
                fontWeight: 400,
                lineHeight: 0.88,
                color: '#FDFAF5',
              }}
            >
              Yadah
            </motion.span>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <motion.span
              initial={{ y: '105%' }}
              animate={{ y: 0 }}
              transition={{
                duration: 1.2,
                delay: 0.38,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="block font-playfair"
              style={{
                fontSize: 'clamp(2.5rem, 9vw, 8rem)',
                fontWeight: 400,
                lineHeight: 0.9,
                color: 'rgba(253,250,245,0.2)',
              }}
            >
              Kukeurim Daniel.
            </motion.span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="absolute bottom-10 flex flex-col items-center gap-4"
        >
          <p
            className="font-jost"
            style={{
              fontSize: '9px',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: 'rgba(253,250,245,0.25)',
            }}
          >
            SCROLL TO EXPLORE
          </p>
          <motion.div
            animate={{ scaleY: [0, 1, 0] }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: 'easeInOut',
              repeatDelay: 0.3,
            }}
            style={{
              width: '1px',
              height: '56px',
              background: 'rgba(253,250,245,0.18)',
              transformOrigin: 'top',
            }}
          />
        </motion.div>
      </div>

      {/* STATE 2 */}
      <div ref={state2Ref} className="absolute inset-0 z-10" style={{ opacity: 0 }}>
        <div
          className="absolute inset-0 flex flex-col justify-center gap-6 overflow-hidden"
          style={{ zIndex: 1 }}
        >
          <div style={{ overflow: 'hidden' }}>
            <motion.div
              animate={{ x: ['0%', '-50%'] }}
              transition={{
                duration: 22,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                display: 'flex',
                width: 'max-content',
              }}
            >
              {[...WORDS_ROW_1, ...WORDS_ROW_1].map((word, i) => (
                <span key={i} className="hero-marquee-word" style={wordStyle}>
                  {word}
                </span>
              ))}
            </motion.div>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <motion.div
              animate={{ x: ['-50%', '0%'] }}
              transition={{
                duration: 28,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                display: 'flex',
                width: 'max-content',
              }}
            >
              {[...WORDS_ROW_2, ...WORDS_ROW_2].map((word, i) => (
                <span key={i} className="hero-marquee-word" style={wordStyle}>
                  {word}
                </span>
              ))}
            </motion.div>
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: 2,
            background: `linear-gradient(
              to right,
              rgba(10,8,6,0.97) 0%,
              rgba(10,8,6,0.75) 30%,
              rgba(10,8,6,0.2) 55%,
              rgba(10,8,6,0.05) 100%
            )`,
          }}
        />

        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0"
          style={{
            zIndex: 3,
            height: '25%',
            background: 'linear-gradient(to top, #0A0806, transparent)',
          }}
        />

        <div
          ref={imageRef}
          className="hero-image-container absolute bottom-0 right-0 top-0"
          style={{
            zIndex: 2,
            width: '55%',
            height: '100%',
          }}
        >
          {heroImageUrl ? (
            <img
              src={heroImageUrl}
              alt="Yadah Kukeurim Daniel"
              className="h-full w-full object-cover object-top"
              loading="eager"
              fetchPriority="high"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <p className="font-playfair italic" style={{ color: 'rgba(253,250,245,0.15)', fontSize: '1.5rem' }}>
                Set hero image in admin settings
              </p>
            </div>
          )}
        </div>

        <div
          className="hero-state2-content absolute z-40"
          style={{
            left: 'clamp(2rem, 5vw, 5rem)',
            bottom: 'clamp(3rem, 6vw, 5rem)',
            maxWidth: '420px',
          }}
        >
          <h1
            className="font-playfair italic"
            style={{
              fontSize: 'clamp(3rem, 7vw, 6.5rem)',
              fontWeight: 400,
              lineHeight: 0.92,
              color: '#FDFAF5',
              marginBottom: '0.5rem',
            }}
          >
            Yadah
          </h1>
          <p
            className="font-playfair"
            style={{
              fontSize: 'clamp(1.2rem, 2.5vw, 2.2rem)',
              fontWeight: 400,
              color: 'rgba(253,250,245,0.25)',
              marginBottom: '1.75rem',
              lineHeight: 1,
            }}
          >
            Kukeurim Daniel.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '1px',
                background: 'rgba(201,168,76,0.7)',
                flexShrink: 0,
              }}
            />
            <p
              className="font-jost"
              style={{
                fontSize: '9px',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'rgba(201,168,76,0.7)',
              }}
            >
              The Voice of Jesus Christ to Nations
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <PublicHrefLink href={bookingHref} style={bookBtnStyle}>
              Book Yadah
            </PublicHrefLink>
            <Link href="#music" style={exploreStyle}>
              <span
                style={{
                  display: 'block',
                  width: '24px',
                  height: '1px',
                  background: 'currentColor',
                }}
              />
              Explore Music
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-image-container {
            width: 100% !important;
            left: 0 !important;
            right: auto !important;
          }
          .hero-image-container img {
            opacity: 0.35;
          }
          .hero-state2-content {
            left: 2rem !important;
          }
          .hero-marquee-word {
            font-size: clamp(1.75rem, 8vw, 3rem) !important;
          }
        }
      `}</style>
    </section>
  )
}
