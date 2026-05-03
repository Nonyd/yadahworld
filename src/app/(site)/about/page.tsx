'use client'

import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { images } from '@/lib/imagePlaceholders'

export default function AboutPage() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })

  return (
    <div className="min-h-screen">
      <section className="relative h-[70vh] overflow-hidden flex items-end pb-20">
        <div className="absolute inset-0 scale-110">
          <Image src={images.aboutHero} alt="Yadah" fill className="object-cover object-top" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-deep/95 via-deep/40 to-transparent" />
        </div>
        <div className="relative z-10 px-8 md:px-20">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="eyebrow mb-4 text-[rgba(253,250,245,0.45)]"
          >
            The Artist
          </motion.p>
          <motion.h1
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.77, 0, 0.175, 1] }}
            className="font-playfair text-[clamp(3rem,10vw,8rem)] font-normal text-ivory leading-[0.9]"
          >
            Yadah.
            <br />
            <em className="text-[rgba(253,250,245,0.55)] text-[clamp(1.5rem,5vw,4rem)] font-playfair italic">
              The Voice Of Jesus To Nations.
            </em>
          </motion.h1>
        </div>
      </section>

      <section ref={ref} className="py-24 md:py-40 px-8 md:px-20 bg-bg">
        <div className="max-w-screen-xl mx-auto grid md:grid-cols-2 gap-20">
          <div>
            <motion.blockquote
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="font-playfair text-2xl md:text-3xl font-normal italic text-gold-light leading-relaxed mb-10 border-l border-accent pl-6"
            >
              &ldquo;I believe in the one and only true God. I believe in Christ&apos;s cross and all that it is to a
              believer!!&rdquo;
            </motion.blockquote>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="body-lg mb-6"
            >
              Yadah Kukeurim Daniel, professionally known as Yadah, is a distinguished Nigerian singer, songwriter, and fashion
              designer whose impactful music centers on the themes of God&apos;s love and grace. Based in Abuja, Nigeria,
              Yadah has carved a significant niche in contemporary gospel music, captivating audiences worldwide with her
              soulful melodies and profound lyrical content.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="body-lg mb-6"
            >
              She made her official debut in 2017 with &ldquo;Goodie Goodie&rdquo; under the management of SonsHub Media. Her
              discography includes hit songs such as &ldquo;Beyond Me&rdquo;, &ldquo;Never Seen&rdquo;, &ldquo;Onye Nwere
              Jesus&rdquo;, &ldquo;Free of Charge&rdquo;, and &ldquo;Na Your Hand&rdquo; — collectively garnering over 100
              million streams globally.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap gap-6 mt-10"
            >
              <div>
                <p className="font-playfair text-5xl font-normal text-accent">100M+</p>
                <p className="ui-label text-muted mt-1">Streams Globally</p>
              </div>
              <div className="w-px bg-gold-light/20 hidden sm:block self-stretch min-h-[3rem]" />
              <div>
                <p className="font-playfair text-5xl font-normal text-accent">600K+</p>
                <p className="ui-label text-muted mt-1">Social Followers</p>
              </div>
              <div className="w-px bg-gold-light/20 hidden sm:block self-stretch min-h-[3rem]" />
              <div>
                <p className="font-playfair text-5xl font-normal text-accent">7+</p>
                <p className="ui-label text-muted mt-1">Years Ministry</p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)' }}
            animate={inView ? { clipPath: 'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)' } : {}}
            transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1] }}
            className="relative aspect-[3/4] manuscript-frame overflow-hidden"
          >
            <Image src={images.aboutPortrait} alt="Yadah" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-8 md:px-20 text-center border-t border-gold-light/15 bg-surface/40">
        <p className="font-playfair text-2xl font-normal italic text-muted mb-6">Want to invite Yadah to your event?</p>
        <Link href="/booking" className="btn-primary">
          Book Yadah
          <span aria-hidden>→</span>
        </Link>
      </section>
    </div>
  )
}
