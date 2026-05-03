'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import YadahLogo from '@/components/branding/YadahLogo'
import ThemeToggle from '@/components/ui/ThemeToggle'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Media', href: '/media' },
  { label: 'Releases', href: '/releases' },
  { label: 'About', href: '/about' },
  { label: 'Room For You', href: 'https://rfyglobal.org', external: true },
  { label: 'Contact', href: '/contact' },
  { label: 'Booking', href: '/booking' },
  { label: 'Shop', href: '/shop' },
]

export default function Navbar({ siteName = 'Yadah' }: { siteName?: string }) {
  const pathname = usePathname()
  const [heroMode, setHeroMode] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => {
    setHeroMode(y < 40)
  })

  /** Light text + logo only on home over the dark hero. Else use body-colored chrome. */
  const onDarkHero = pathname === '/' && heroMode

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 z-50
          flex items-center justify-between gap-4
          px-8 md:px-16 py-6
          transition-all duration-700
          ${
            onDarkHero
              ? 'bg-transparent'
              : 'border-b border-gold-light/15 bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] backdrop-blur-md'
          }
        `}
      >
        <Link href="/" className="relative z-10 flex shrink-0 items-center" aria-label={`${siteName} home`}>
          <YadahLogo alt={siteName} treatment={onDarkHero ? 'onDarkHero' : 'inDarkPill'} height={38} priority />
        </Link>

        <nav className="hidden lg:flex flex-1 items-center justify-end gap-8 xl:gap-10">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="ui-label link-underline"
                style={{ color: onDarkHero ? 'rgba(253,250,245,0.72)' : 'var(--muted)' }}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="ui-label link-underline"
                style={{ color: onDarkHero ? 'rgba(253,250,245,0.72)' : 'var(--muted)' }}
              >
                {link.label}
              </Link>
            ),
          )}
          <ThemeToggle variant="navbar" onDarkBackdrop={onDarkHero} className="shrink-0" />
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle variant="navbar" onDarkBackdrop={onDarkHero} />
          <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex flex-col gap-[5px] p-2"
          aria-label="Open menu"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-5 h-px transition-colors duration-300"
              style={{ background: onDarkHero ? 'var(--white)' : 'var(--body)' }}
            />
          ))}
        </button>
        </div>
      </header>

      <motion.div
        initial={false}
        animate={{ opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? 'auto' : 'none' }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-10"
        style={{ background: 'var(--bg)' }}
      >
        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          className="absolute top-7 right-8 ui-label text-muted"
        >
          Close
        </button>
        {NAV_LINKS.map((link, i) => (
          <motion.div
            key={link.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: menuOpen ? 1 : 0, y: menuOpen ? 0 : 30 }}
            transition={{ delay: i * 0.06, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="font-playfair text-4xl font-normal italic text-accent"
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-playfair text-4xl font-normal text-body hover:text-accent transition-colors"
              >
                {link.label}
              </Link>
            )}
          </motion.div>
        ))}
      </motion.div>
    </>
  )
}
