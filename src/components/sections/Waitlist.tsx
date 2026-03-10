"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function Waitlist() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="waitlist"
      className="py-20 md:py-28 px-6 bg-[var(--bg)]"
    >
      <div className="max-w-2xl mx-auto text-center">
        <motion.h2
          className="font-serif text-4xl md:text-5xl italic text-[var(--ivory)] mb-6"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          Join the Inner Circle
        </motion.h2>
        <motion.p
          className="text-[var(--ivory)]/80 text-lg mb-10"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Be first for new music, tour dates & exclusive content.
        </motion.p>

        <motion.form
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          onSubmit={(e) => e.preventDefault()}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <input
            type="email"
            placeholder="Your email"
            className="flex-1 min-w-0 px-5 py-3.5 rounded-full bg-[var(--bg)] border border-[var(--muted)] text-[var(--ivory)] placeholder:text-[var(--muted)] focus:outline-none focus:border-gold transition-colors"
            aria-label="Email address"
          />
          <button
            type="submit"
            className="px-8 py-3.5 rounded-full bg-gold text-[var(--bg)] font-medium hover:opacity-90 transition-opacity"
          >
            Submit
          </button>
        </motion.form>

        <motion.p
          className="mt-6 text-[var(--muted)] text-sm"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          We respect your privacy. Unsubscribe at any time.
        </motion.p>
      </div>
    </section>
  );
}
