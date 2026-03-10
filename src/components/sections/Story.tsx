"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const IDENTITY_WORDS = [
  "YADAH",
  "·",
  "AHFREEKAH",
  "·",
  "ABUJA",
  "·",
  "NIGERIA",
  "·",
  "GLORY",
  "·",
  "WORSHIP",
  "·",
  "FAITH",
  "·",
  "THE WORLD",
  "·",
];

export default function Story() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const marqueeContent = [...IDENTITY_WORDS, ...IDENTITY_WORDS];

  return (
    <section
      ref={ref}
      id="story"
      className="py-20 md:py-28 px-6 bg-[var(--bg)]"
    >
      <div className="max-w-6xl mx-auto">
        <motion.p
          className="accent-label text-gold mb-4"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          The Story
        </motion.p>
        <motion.h2
          className="font-serif text-4xl md:text-5xl lg:text-6xl italic text-[var(--ivory)] mb-16 leading-tight max-w-2xl"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Music born from faith.
          <br />
          Carried to the world.
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start mb-20">
          <motion.div
            className="prose prose-invert max-w-none"
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <p className="text-[var(--ivory)]/90 text-lg leading-relaxed">
              From Abuja to the world, Yadah Ahfreekah has devoted her life to
              one calling: carrying the light of worship beyond church walls.
              What began in local ministry has become a global movement—over 100
              million streams, sold-out gatherings, and a sound that unites
              believers across continents. She doesn&apos;t perform; she ministers.
              Every song is an invitation into the presence of God, and every
              stage is an altar. SonsHub Media, the label she founded, exists to
              amplify that mission: excellence in message, reach without limit.
            </p>
          </motion.div>
          <motion.div
            className="relative aspect-[3/4] max-h-[500px] rounded-lg overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <Image
              src="https://images.unsplash.com/photo-1545128485-c400e7702796?w=600&q=80"
              alt="YADAH — artist portrait"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        </div>

        {/* Identity marquee */}
        <div className="overflow-hidden border-y border-[var(--muted)]/50 py-4">
          <motion.div
            className="flex gap-8 whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear",
              },
            }}
            style={{ width: "max-content" }}
          >
            {marqueeContent.map((item, i) => (
              <span
                key={i}
                className="text-[var(--ivory)]/80 text-sm font-medium tracking-widest uppercase"
              >
                {item}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
