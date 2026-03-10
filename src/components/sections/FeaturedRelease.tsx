"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function FeaturedRelease() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="featured"
      className="py-20 md:py-28 px-6 bg-[var(--bg)]"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 md:gap-16 items-center">
        <motion.div
          className="flex-shrink-0 w-full md:w-[45%] max-w-md"
          initial={{ x: -60, opacity: 0 }}
          animate={inView ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
            <Image
              src="https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&q=80"
              alt="YADAH — Latest release album artwork"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </div>
        </motion.div>

        <motion.div
          className="flex-1"
          initial={{ x: 60, opacity: 0 }}
          animate={inView ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <p className="accent-label text-gold mb-4">LATEST RELEASE</p>
          <h2 className="font-serif text-4xl md:text-5xl italic text-[var(--ivory)] mb-6">
            The Light
          </h2>
          <p className="text-[var(--ivory)]/80 text-lg leading-relaxed mb-4">
            A collection of worship anthems that bridge the sacred and the global.
            Every track carries the same mission: to bring the presence of God
            into every space it reaches.
          </p>
          <p className="text-muted text-sm mb-8">Released November 2024</p>

          <div className="flex gap-4 mb-8">
            <a
              href="#"
              className="p-2 rounded-full border border-[var(--muted)] text-[var(--ivory)] hover:border-gold hover:text-gold transition-colors"
              aria-label="Listen on Spotify"
            >
              <SpotifyIcon />
            </a>
            <a
              href="#"
              className="p-2 rounded-full border border-[var(--muted)] text-[var(--ivory)] hover:border-gold hover:text-gold transition-colors"
              aria-label="Listen on Apple Music"
            >
              <AppleMusicIcon />
            </a>
            <a
              href="#"
              className="p-2 rounded-full border border-[var(--muted)] text-[var(--ivory)] hover:border-gold hover:text-gold transition-colors"
              aria-label="Listen on YouTube Music"
            >
              <YouTubeMusicIcon />
            </a>
          </div>

          <a
            href="#music"
            className="inline-flex items-center gap-2 text-gold font-medium hover:underline underline-offset-4"
          >
            Explore Full Discography
            <span aria-hidden>→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function SpotifyIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.3 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18 12.42c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

function AppleMusicIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.4c5.302 0 9.6 4.298 9.6 9.6s-4.298 9.6-9.6 9.6S2.4 17.302 2.4 12 6.698 2.4 12 2.4zM8.4 7.2v9.6h1.2V7.2H8.4zm6 0v9.6h1.2V7.2h-1.2zm-6 2.4v4.8h1.2V9.6H8.4zm6 0v4.8h1.2V9.6h-1.2z" />
    </svg>
  );
}

function YouTubeMusicIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.75 12l-5-3v6l5-3zM12 8.4c1.988 0 3.6 1.612 3.6 3.6s-1.612 3.6-3.6 3.6-3.6-1.612-3.6-3.6S10.012 8.4 12 8.4z" />
    </svg>
  );
}
