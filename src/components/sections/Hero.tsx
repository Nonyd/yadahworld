"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const WORDS = "She doesn't just sing. She carries Light.".split(" ");

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1920&q=80"
          alt="YADAH — gospel worship atmosphere"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/60 to-transparent"
          aria-hidden
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.h1
          className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl italic text-[var(--white)] mb-6 leading-tight"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: { staggerChildren: 0.06, delayChildren: 0.3 },
            },
            hidden: {},
          }}
        >
          {WORDS.map((word, i) => (
            <motion.span
              key={i}
              className="inline-block mr-[0.25em]"
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          className="text-sm sm:text-base tracking-[0.3em] uppercase text-[var(--ivory)]/80 mb-12 font-sans"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          International Gospel Music Minister
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <a
            href="#music"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-gold text-[var(--bg)] font-medium hover:opacity-90 transition-opacity"
          >
            Listen on Spotify
          </a>
          <a
            href="#"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full border-2 border-[var(--ivory)]/60 text-[var(--ivory)] font-medium hover:border-gold hover:text-gold transition-colors"
          >
            Watch Latest
          </a>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
        >
          <a
            href="#marquee"
            className="flex flex-col items-center gap-2 text-gold"
            aria-label="Scroll down"
          >
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </motion.span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
