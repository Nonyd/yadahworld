'use client'

import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { bookingHrefFromCopy, getCopyString, type SiteCopy } from '@/lib/site-copy'
import { proseHtmlFromStored } from '@/lib/rich-text-display'

export default function AboutPageClient({
  aboutHero,
  aboutPortrait,
  copy,
}: {
  aboutHero: string
  aboutPortrait: string
  copy: SiteCopy
}) {
  const { ref: bioRef, inView: bioInView } = useInView({ threshold: 0.08, triggerOnce: true })
  const a = (k: string) => getCopyString(copy, `aboutPage.${k}`)
  const bookingHref = bookingHrefFromCopy(copy)

  const bio1Html = proseHtmlFromStored(a('body1'))
  const bio2Html = proseHtmlFromStored(a('body2'))

  const statRows = [{ number: a('stat1n'), label: a('stat1l') }]

  return (
    <div className="min-h-screen">
      {/* SECTION 1 — Hero (unchanged) */}
      <section className="relative h-[70vh] overflow-hidden flex items-end pb-20">
        <div className="absolute inset-0 scale-110">
          <Image src={aboutHero} alt="Yadah" fill className="object-cover object-top" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-deep/95 via-deep/40 to-transparent" />
        </div>
        <div className="relative z-10 px-8 md:px-20">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="eyebrow mb-4 text-[rgba(253,250,245,0.45)]"
          >
            {a('heroEyebrow')}
          </motion.p>
          <motion.h1
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.77, 0, 0.175, 1] }}
            className="font-playfair text-[clamp(3rem,10vw,8rem)] font-normal text-ivory leading-[0.9]"
          >
            {a('heroTitle')}
            <br />
            <em className="text-[rgba(253,250,245,0.55)] text-[clamp(1.5rem,5vw,4rem)] font-playfair italic">
              {a('heroSubtitle')}
            </em>
          </motion.h1>
        </div>
      </section>

      {/* SECTION 2 — Opening Mantra */}
      <section
        style={{
          background: 'var(--bg)',
          padding: 'clamp(6rem, 12vw, 10rem) clamp(2rem, 8vw, 12rem)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p className="eyebrow mb-8">{a('mantraEyebrow')}</p>
          <blockquote
            className="font-playfair italic"
            style={{
              fontSize: 'clamp(1.4rem, 3vw, 2.2rem)',
              lineHeight: 1.5,
              color: 'var(--body)',
              borderLeft: 'none',
              padding: 0,
            }}
          >
            &ldquo;{a('mantraQuote')}&rdquo;
          </blockquote>
          <p className="font-jost text-xs tracking-[0.2em] uppercase mt-10" style={{ color: 'var(--muted)' }}>
            {a('mantraAttribution')}
          </p>
        </div>
      </section>

      {/* SECTION 3 — Bio Story */}
      <section
        ref={bioRef}
        style={{
          padding: 'clamp(6rem, 12vw, 10rem) clamp(2rem, 5vw, 5rem)',
        }}
      >
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 gap-16 md:gap-24">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-[5fr_7fr] md:gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={bioInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="manuscript-frame relative aspect-[3/4] w-full max-w-lg mx-auto md:max-w-none overflow-hidden md:sticky md:top-[120px]"
            >
              <Image
                src={aboutPortrait}
                alt="Yadah Kukeurim Daniel"
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 42vw"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={bioInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.75, delay: 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <p className="eyebrow mb-8" style={{ color: 'var(--gold)' }}>
                {a('ministerEyebrow')}
              </p>

              <div style={{ marginBottom: '2.5rem' }}>
                <h2
                  className="font-playfair"
                  style={{
                    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                    fontWeight: 400,
                    lineHeight: 1.0,
                    color: 'var(--body)',
                    marginBottom: '0.5rem',
                  }}
                >
                  {a('stageName')}
                </h2>
                <p
                  className="font-playfair italic"
                  style={{
                    fontSize: 'clamp(1rem, 2vw, 1.4rem)',
                    color: 'var(--muted)',
                  }}
                >
                  {a('fullName')}
                </p>
              </div>

              <div
                className="prose max-w-none text-[var(--body)] [&_p+p]:mt-6"
                style={{
                  fontSize: '1rem',
                  lineHeight: 1.9,
                }}
                dangerouslySetInnerHTML={{ __html: bio1Html }}
              />

              <blockquote
                style={{
                  borderLeft: '2px solid var(--gold)',
                  paddingLeft: '1.5rem',
                  margin: '2.5rem 0',
                  fontFamily: 'var(--font-baskerville)',
                  fontStyle: 'italic',
                  fontSize: '1.05rem',
                  lineHeight: 1.8,
                  color: 'var(--body)',
                }}
              >
                &ldquo;{a('faithDeclaration')}&rdquo;
              </blockquote>

              <div
                className="prose max-w-none text-[var(--body)] [&_p+p]:mt-6"
                style={{
                  fontSize: '1rem',
                  lineHeight: 1.9,
                }}
                dangerouslySetInnerHTML={{ __html: bio2Html }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — Stats Row */}
      <section style={{ background: 'var(--surface)' }} className="py-20 px-8 md:px-20 mt-8 md:mt-16">
        <div className="max-w-screen-xl mx-auto">
          <div
            className="grid grid-cols-1 gap-0"
            style={{
              borderTop: '1px solid rgba(139, 105, 20, 0.15)',
              borderBottom: '1px solid rgba(139, 105, 20, 0.15)',
            }}
          >
            {statRows.map(({ number, label }) => (
              <div key={label} className="py-12 text-center">
                <p
                  className="font-playfair"
                  style={{
                    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                    fontWeight: 400,
                    color: 'var(--accent)',
                    lineHeight: 1,
                    marginBottom: '0.5rem',
                  }}
                >
                  {number}
                </p>
                <p className="eyebrow" style={{ color: 'var(--muted)' }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 — Ministry CTA */}
      <section className="border-t border-[rgba(42,37,32,0.1)] bg-bg mt-12 md:mt-20 py-24 px-8 md:px-20 text-center">
        <p className="eyebrow mb-4">{a('ministryEyebrow')}</p>
        <p className="font-playfair text-2xl font-normal italic text-[var(--body)] mb-4 max-w-xl mx-auto">
          {a('ministryLead')}
        </p>
        <p className="body-sm text-muted max-w-lg mx-auto mb-10">{a('ministryBody')}</p>
        <div className="flex justify-center">
          <Link href={bookingHref} className="btn-ghost inline-flex">
            <span className="arrow-line" />
            {a('ministryCta')}
          </Link>
        </div>
      </section>
    </div>
  )
}
