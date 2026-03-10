"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const ALBUMS = [
  {
    title: "The Light",
    year: "2024",
    type: "Album",
    image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=600&q=80",
  },
  {
    title: "Glory in the Room",
    year: "2023",
    type: "EP",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80",
  },
  {
    title: "Carry the Sound",
    year: "2023",
    type: "Single",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80",
  },
  {
    title: "Worship Nights",
    year: "2022",
    type: "Album",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80",
  },
];

export default function Discography() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="music"
      className="py-20 md:py-28 px-6 bg-[var(--bg)]"
    >
      <div className="max-w-6xl mx-auto">
        <motion.p
          className="accent-label text-gold mb-12"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          Discography
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 snap-x snap-mandatory sm:snap-none scrollbar-hide">
          {ALBUMS.map((album, i) => (
            <motion.article
              key={album.title}
              className="group flex-shrink-0 w-[280px] sm:w-auto snap-center"
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <a
                href="#music"
                className="block rounded-xl overflow-hidden border border-transparent group-hover:border-gold/50 group-hover:shadow-[0_0_24px_rgba(201,168,76,0.15)] transition-all duration-300"
              >
                <div className="relative aspect-square mb-4">
                  <Image
                    src={album.image}
                    alt={`${album.title} — ${album.type}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 280px, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <h3 className="font-serif text-xl italic text-[var(--ivory)] mb-1">
                  {album.title}
                </h3>
                <p className="text-sm text-[var(--muted)]">
                  {album.year} · {album.type}
                </p>
              </a>
            </motion.article>
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <a
            href="#music"
            className="inline-flex items-center px-8 py-3 rounded-full border-2 border-gold text-gold font-medium hover:bg-gold hover:text-[var(--bg)] transition-colors"
          >
            View All
          </a>
        </motion.div>
      </div>
    </section>
  );
}
