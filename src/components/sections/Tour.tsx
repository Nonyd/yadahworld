"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

// Placeholder: no dates yet — show "coming soon" + email signup
const TOUR_DATES: { date: string; city: string; venue: string; url: string }[] = [];

export default function Tour() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="tour"
      className="relative py-20 md:py-28 px-6 overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1920&q=80"
          alt="Live worship experience"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-[var(--bg)]/85"
          aria-hidden
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.p
          className="accent-label text-gold mb-4"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          Live
        </motion.p>
        <motion.h2
          className="font-serif text-4xl md:text-5xl lg:text-6xl italic text-[var(--ivory)] mb-12"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Experience The Presence
        </motion.h2>

        {TOUR_DATES.length > 0 ? (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {TOUR_DATES.map((show) => (
              <div
                key={show.date + show.city}
                className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-xl bg-[var(--bg)]/60 border border-[var(--muted)]/30"
              >
                <div className="text-left">
                  <p className="font-medium text-[var(--ivory)]">{show.date}</p>
                  <p className="text-gold">{show.city} · {show.venue}</p>
                </div>
                <a
                  href={show.url}
                  className="px-6 py-2.5 rounded-full border-2 border-gold text-gold text-sm font-medium hover:bg-gold hover:text-[var(--bg)] transition-colors"
                >
                  Get Tickets
                </a>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="max-w-md mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <p className="text-[var(--ivory)]/80 text-lg mb-8">
              Upcoming dates coming soon.
            </p>
            <form
              className="flex flex-col sm:flex-row gap-3 justify-center"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Email for notifications"
                className="flex-1 min-w-0 px-5 py-3 rounded-full bg-[var(--bg)]/80 border border-[var(--muted)] text-[var(--ivory)] placeholder:text-[var(--muted)] focus:outline-none focus:border-gold transition-colors"
                aria-label="Email for tour notifications"
              />
              <button
                type="submit"
                className="px-8 py-3 rounded-full bg-gold text-[var(--bg)] font-medium hover:opacity-90 transition-opacity"
              >
                Notify Me
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </section>
  );
}
