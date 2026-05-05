'use client'

import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { bookingHrefFromCopy, getCopyString, type SiteCopy } from '@/lib/site-copy'
import { proseHtmlFromStored } from '@/lib/rich-text-display'

const easeReveal = [0.77, 0, 0.175, 1] as const
const easeOut = [0.25, 0.46, 0.45, 0.94] as const

export default function AboutPageClient({
  aboutHero,
  aboutPortrait,
  copy,
}: {
  aboutHero: string
  aboutPortrait: string
  copy: SiteCopy
}) {
  const { ref: mantraRef, inView: mantraInView } = useInView({ threshold: 0.15, triggerOnce: true })
  const { ref: bioRef, inView: bioInView } = useInView({ threshold: 0.08, triggerOnce: true })
  const { ref: statsRef, inView: statsInView } = useInView({ threshold: 0.2, triggerOnce: true })
  const { ref: ctaRef, inView: ctaInView } = useInView({ threshold: 0.15, triggerOnce: true })

  const a = (k: string) => getCopyString(copy, `aboutPage.${k}`)
  const bookingHref = bookingHrefFromCopy(copy)

  const bio1Html = proseHtmlFromStored(a('body1'))
  const bio2Html = proseHtmlFromStored(a('body2'))

  const statRows = [{ number: a('stat1n'), label: a('stat1l') }]

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero */}
      <section className="relative flex min-h-[72vh] items-end overflow-hidden md:min-h-[78vh]">
        <div className="absolute inset-0 scale-[1.03]">
          <Image src={aboutHero} alt="" fill className="object-cover object-[center_20%]" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/55 to-deep/20" />
          <div
            className="absolute inset-0 opacity-40 mix-blend-overlay"
            style={{
              background: 'radial-gradient(ellipse 90% 70% at 70% 20%, rgba(253,250,245,0.12) 0%, transparent 55%)',
            }}
          />
        </div>
        <div className="relative z-10 w-full px-8 pb-20 pt-32 md:px-16 md:pb-28 lg:px-24">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.15, ease: easeReveal }}
              className="mb-6 h-px w-14 origin-left bg-gold-light/55 md:w-20"
            />
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: easeOut }}
              className="eyebrow mb-5 text-ivory/50"
            >
              {a('heroEyebrow')}
            </motion.p>
            <motion.h1
              initial={{ y: 48, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.1, ease: easeReveal }}
              className="font-playfair text-[clamp(3rem,10vw,7rem)] font-normal leading-[0.92] tracking-tight text-ivory"
            >
              {a('heroTitle')}
              <span className="mt-4 block font-playfair text-[clamp(1.35rem,4.2vw,2.75rem)] font-normal italic leading-snug text-ivory/60">
                {a('heroSubtitle')}
              </span>
            </motion.h1>
          </div>
        </div>
      </section>

      {/* Mantra */}
      <section className="relative overflow-hidden border-b border-gold-light/10 bg-bg py-20 md:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-100"
          style={{
            background:
              'radial-gradient(ellipse 75% 55% at 50% -20%, rgba(201, 168, 76, 0.09) 0%, transparent 58%), radial-gradient(ellipse 50% 40% at 100% 50%, rgba(107, 39, 55, 0.04) 0%, transparent 50%)',
          }}
        />
        <div ref={mantraRef} className="relative mx-auto max-w-3xl px-8 text-center md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={mantraInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.85, ease: easeOut }}
            className="mb-10 flex items-center justify-center gap-5"
          >
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold-light/45 md:w-16" />
            <p className="eyebrow text-gold">{a('mantraEyebrow')}</p>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold-light/45 md:w-16" />
          </motion.div>
          <motion.blockquote
            initial={{ opacity: 0, y: 16 }}
            animate={mantraInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.08, ease: easeOut }}
            className="font-playfair text-[clamp(1.35rem,3.2vw,2.05rem)] font-normal italic leading-[1.58] tracking-tight text-body"
          >
            &ldquo;{a('mantraQuote')}&rdquo;
          </motion.blockquote>
          <motion.div
            initial={{ opacity: 0 }}
            animate={mantraInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.25, ease: easeOut }}
            className="mt-12 flex flex-col items-center gap-4"
          >
            <span className="h-10 w-px bg-gradient-to-b from-gold-light/50 via-gold/30 to-transparent" />
            <p className="font-jost text-[0.65rem] uppercase tracking-[0.28em] text-muted">{a('mantraAttribution')}</p>
          </motion.div>
        </div>
      </section>

      {/* Bio */}
      <section
        ref={bioRef}
        className="relative border-b border-[rgba(42,37,32,0.06)] bg-[color-mix(in_srgb,var(--bg)_92%,var(--surface))] py-20 md:py-28 lg:py-32"
      >
        <div className="mx-auto max-w-6xl px-8 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-12 lg:gap-x-16 lg:gap-y-0">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={bioInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.85, ease: easeOut }}
              className="lg:col-span-5"
            >
              <div className="manuscript-frame relative mx-auto aspect-[3/4] max-w-md overflow-hidden shadow-[0_28px_90px_rgba(13,11,8,0.14)] lg:mx-0 lg:max-w-none lg:sticky lg:top-28">
                <Image
                  src={aboutPortrait}
                  alt="Yadah"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={bioInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1, ease: easeOut }}
              className="lg:col-span-7 lg:pt-4"
            >
              <p className="eyebrow mb-8 text-gold">{a('ministerEyebrow')}</p>

              <div className="mb-10 flex gap-6 md:gap-8">
                <div
                  className="mt-1 w-0.5 shrink-0 rounded-full bg-gradient-to-b from-accent via-gold to-gold-light/25 md:mt-2"
                  style={{ minHeight: '4.5rem' }}
                  aria-hidden
                />
                <div className="min-w-0">
                  <h2 className="display-3 text-body">{a('stageName')}</h2>
                  <p className="mt-3 font-playfair text-lg italic text-muted md:text-xl">{a('fullName')}</p>
                </div>
              </div>

              <div
                className="max-w-[40rem] text-[0.98rem] leading-[1.92] text-body md:text-[1.03rem] md:leading-[1.9] [&_p+p]:mt-6"
                dangerouslySetInnerHTML={{ __html: bio1Html }}
              />

              <aside className="relative my-12 rounded-sm border border-gold-light/18 bg-surface/70 py-8 pl-9 pr-6 shadow-[0_2px_24px_rgba(13,11,8,0.04)] md:my-14 md:py-10 md:pl-11 md:pr-8">
                <div
                  className="absolute bottom-6 left-0 top-6 w-[3px] rounded-full bg-accent/85"
                  aria-hidden
                />
                <p className="font-baskerville text-[1.05rem] italic leading-[1.82] text-body md:text-[1.12rem] md:leading-[1.78]">
                  &ldquo;{a('faithDeclaration')}&rdquo;
                </p>
              </aside>

              <div
                className="max-w-[40rem] text-[0.98rem] leading-[1.92] text-body md:text-[1.03rem] md:leading-[1.9] [&_p+p]:mt-6"
                dangerouslySetInnerHTML={{ __html: bio2Html }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stat */}
      <section ref={statsRef} className="relative overflow-hidden bg-surface py-16 md:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              'linear-gradient(115deg, transparent 0%, rgba(107, 39, 55, 0.035) 42%, transparent 72%), linear-gradient(-20deg, rgba(201, 168, 76, 0.06) 0%, transparent 45%)',
          }}
        />
        <div className="relative mx-auto max-w-lg px-8 md:max-w-xl">
          {statRows.map(({ number, label }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.75, ease: easeOut }}
              className="border border-gold-light/22 bg-bg px-8 py-12 text-center shadow-[0_8px_48px_rgba(13,11,8,0.06)] backdrop-blur-[2px] md:px-12 md:py-14"
            >
              <p className="font-playfair text-[clamp(3.25rem,11vw,5.75rem)] font-normal leading-none tracking-tight text-accent">
                {number}
              </p>
              <div className="mx-auto mt-8 flex max-w-xs items-center gap-4 md:mt-9">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-light/35 to-gold-light/50" />
                <p className="eyebrow shrink-0 text-muted">{label}</p>
                <span className="h-px flex-1 bg-gradient-to-l from-transparent via-gold-light/35 to-gold-light/50" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Ministry CTA */}
      <section ref={ctaRef} className="bg-bg px-8 py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={ctaInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: easeOut }}
          className="mx-auto max-w-2xl border border-gold-light/15 bg-surface/55 px-8 py-12 text-center shadow-[inset_0_1px_0_rgba(253,250,245,0.65),0_20px_60px_rgba(13,11,8,0.05)] md:px-14 md:py-16"
        >
          <p className="eyebrow mb-5 text-gold">{a('ministryEyebrow')}</p>
          <p className="font-playfair text-2xl font-normal italic leading-snug text-body md:text-[1.65rem]">
            {a('ministryLead')}
          </p>
          <p className="body-sm mx-auto mt-5 max-w-md text-muted">{a('ministryBody')}</p>
          <div className="mt-10 flex justify-center">
            <Link href={bookingHref} className="btn-ghost inline-flex">
              <span className="arrow-line" />
              {a('ministryCta')}
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
