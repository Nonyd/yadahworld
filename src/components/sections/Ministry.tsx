"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function Ministry() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="ministry"
      className="grid md:grid-cols-2 min-h-[400px]"
    >
      <motion.div
        className="bg-[var(--bg)] py-20 md:py-28 px-8 md:pl-16 lg:pl-24 flex flex-col justify-center"
        initial={{ opacity: 0, x: -40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7 }}
      >
        <p className="accent-label text-gold mb-4">The Label</p>
        <h2 className="font-serif text-4xl md:text-5xl italic text-[var(--ivory)] mb-6">
          SonsHub Media
        </h2>
        <p className="text-[var(--ivory)]/80 text-lg leading-relaxed mb-8 max-w-lg">
          Founded to elevate gospel and worship music to a global standard.
          SonsHub Media backs artists who carry a message—excellence in craft,
          integrity in mission, and reach without compromise.
        </p>
        <a
          href="#"
          className="inline-flex items-center gap-2 text-gold font-medium hover:underline underline-offset-4"
        >
          Learn More
          <span aria-hidden>→</span>
        </a>
      </motion.div>

      <motion.div
        className="bg-[#0f0f11] py-20 md:py-28 px-8 md:pr-16 lg:pr-24 flex items-center justify-center"
        initial={{ opacity: 0, x: 40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        <div className="w-full max-w-[200px] aspect-square rounded-2xl border border-[var(--muted)]/40 flex items-center justify-center">
          <span className="font-serif text-2xl italic text-[var(--ivory)]/60">
            SonsHub
          </span>
        </div>
      </motion.div>
    </section>
  );
}
