'use client'

import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export default function AboutSnippet({ editorialImage }: { editorialImage: string }) {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true })

  return (
    <section ref={ref} className="px-8 md:px-20 py-[clamp(6rem,12vw,14rem)]">
      <div className="max-w-screen-xl mx-auto grid md:grid-cols-[5fr_7fr] gap-16 md:gap-24 items-center">
        <motion.div
          initial={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)' }}
          animate={inView ? { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' } : {}}
          transition={{ duration: 1.4, ease: [0.77, 0, 0.175, 1] }}
          className="manuscript-frame relative aspect-[3/4] overflow-hidden order-2 md:order-1"
        >
          <Image
            src={editorialImage}
            alt="Minister Yadah"
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 42vw"
          />
        </motion.div>

        <div className="order-1 md:order-2">
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="eyebrow mb-8"
          >
            03 — The Artist
          </motion.p>

          <div style={{ overflow: 'hidden' }} className="mb-2">
            <motion.h2
              initial={{ y: '100%' }}
              animate={inView ? { y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="display-2 text-[var(--body)]"
            >
              A Voice Sent
            </motion.h2>
          </div>
          <div style={{ overflow: 'hidden' }} className="mb-10">
            <motion.h2
              initial={{ y: '100%' }}
              animate={inView ? { y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="display-2 font-playfair italic text-[var(--accent)]"
            >
              From Heaven.
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="body-lg max-w-md mb-10"
          >
            Yadah Kukeurim Daniel is a Nigerian singer, songwriter, and minister of the gospel. Her music — rooted in
            God&apos;s love and grace — has accumulated over 100 million streams globally, touching hearts in every
            continent and leading souls into the presence of God.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 }}
            className="flex gap-10 mb-12 pb-10 border-b border-[var(--gold-light)]/20 flex-wrap"
          >
            {[
              { n: '100M+', label: 'Streams' },
              { n: '600K+', label: 'Followers' },
              { n: '7+', label: 'Years of Ministry' },
            ].map(({ n, label }) => (
              <div key={label}>
                <p className="font-playfair text-[2.5rem] font-normal text-[var(--accent)] leading-none mb-1">{n}</p>
                <p className="ui-label text-[var(--muted)]">{label}</p>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.8 }}>
            <Link href="/about" className="btn-ghost">
              <span className="arrow-line" />
              Read Her Story
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
