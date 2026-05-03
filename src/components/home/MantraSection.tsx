'use client'

import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'
import { getCopyString, type SiteCopy } from '@/lib/site-copy'

export default function MantraSection({ copy }: { copy: SiteCopy }) {
  const { ref, inView } = useInView({ threshold: 0.4, triggerOnce: true })
  const h = (k: string) => getCopyString(copy, `home.${k}`)
  const lines = [h('mantraLine1'), h('mantraLine2'), h('mantraLine3')]

  return (
    <section ref={ref} className="px-8 md:px-20 py-[clamp(6rem,12vw,14rem)] bg-[var(--bg)]">
      <div className="max-w-4xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="eyebrow mb-12"
        >
          {h('mantraEyebrow')}
        </motion.p>

        {lines.map((line, i) => (
          <div key={i} style={{ overflow: 'hidden' }}>
            <motion.p
              initial={{ y: '100%', opacity: 0 }}
              animate={inView ? { y: 0, opacity: 1 } : {}}
              transition={{
                delay: 0.1 + i * 0.15,
                duration: 0.9,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="font-playfair italic text-[clamp(1.5rem,3.5vw,2.8rem)] text-[var(--body)] leading-[1.3] mb-1"
            >
              {line}
            </motion.p>
          </div>
        ))}

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="font-jost text-xs tracking-[0.2em] uppercase text-[var(--muted)] mt-8"
        >
          {h('mantraAttribution')}
        </motion.p>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ delay: 0.9, duration: 1.2, ease: [0.77, 0, 0.175, 1] }}
          className="h-px max-w-[120px] mx-auto mt-10 origin-center"
          style={{ background: 'var(--gold-light)', opacity: 0.4 }}
        />
      </div>
    </section>
  )
}
