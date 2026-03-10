"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { label: "Music", href: "#music" },
  { label: "Tour", href: "#tour" },
  { label: "Story", href: "#story" },
  { label: "Ministry", href: "#ministry" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-[var(--bg)]/95 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a
            href="#hero"
            className="font-serif text-2xl italic text-gold tracking-tight"
          >
            YADAH
          </a>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-[var(--ivory)]/90 hover:text-gold transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden md:block">
            <a
              href="#music"
              className="inline-flex items-center px-6 py-2.5 rounded-full border-2 border-gold text-gold text-sm font-medium hover:bg-gold hover:text-[var(--bg)] transition-colors"
            >
              Listen Now
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label="Toggle menu"
            className="md:hidden p-2 text-[var(--ivory)]"
            onClick={() => setMobileOpen(true)}
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
                strokeWidth={1.5}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </nav>
      </header>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-[var(--bg)] md:hidden"
          >
            <div className="flex flex-col items-center justify-center min-h-screen gap-12 px-6">
              <button
                type="button"
                aria-label="Close menu"
                className="absolute top-6 right-6 p-2 text-[var(--ivory)]"
                onClick={() => setMobileOpen(false)}
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="font-serif text-3xl italic text-[var(--ivory)] hover:text-gold transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </motion.a>
              ))}

              <motion.a
                href="#music"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: NAV_LINKS.length * 0.08, duration: 0.4 }}
                className="mt-4 inline-flex items-center px-8 py-3 rounded-full border-2 border-gold text-gold text-lg font-medium hover:bg-gold hover:text-[var(--bg)] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Listen Now
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
