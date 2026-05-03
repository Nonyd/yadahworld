'use client'

import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useTheme } from 'next-themes'
import { DEFAULT_SITE_LOGO_URL } from '@/lib/default-branding'
import ThemeToggle from '@/components/ui/ThemeToggle'

type NavLink = { label: string; href: string; external?: boolean }

const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Media', href: '/media' },
  { label: 'About', href: '/about' },
  { label: 'Room For You', href: 'https://rfyglobal.org', external: true },
  { label: 'Campus Tour', href: '/campus-tour' },
  { label: 'Contact', href: '/contact' },
  { label: 'Booking', href: '/booking' },
  { label: 'Shop', href: '/shop' },
]

export default function Navbar({
  siteName = 'Yadah',
  logoUrl = DEFAULT_SITE_LOGO_URL,
  navLabels,
}: {
  siteName?: string
  logoUrl?: string
  navLabels: Record<string, string>
}) {
  const pathname = usePathname()
  const [heroMode, setHeroMode] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { scrollY } = useScroll()
  const { resolvedTheme } = useTheme()

  useMotionValueEvent(scrollY, 'change', (y) => {
    setHeroMode(y < 40)
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const onDarkHero = pathname === '/' && heroMode
  const navMuted = 'rgba(253,250,245,0.6)'
  const isDark = mounted && resolvedTheme === 'dark'
  /** White mark on hero / dark pages; dark mark on light pages (light theme only). */
  const logoStyle: CSSProperties | undefined =
    onDarkHero || isDark ? undefined : { filter: 'brightness(0)' }

  const labelFor = (href: string, fallback: string) => navLabels[href]?.trim() || fallback

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 z-[10050]
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
          <Image
            src={logoUrl}
            alt={siteName}
            width={320}
            height={80}
            priority
            className="h-9 w-auto md:h-12"
            style={logoStyle}
            sizes="(max-width: 768px) 140px, 180px"
          />
        </Link>

        <nav className="hidden lg:flex flex-1 items-center justify-end gap-6 xl:gap-8">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="ui-label link-underline"
                style={{ color: onDarkHero ? navMuted : 'var(--muted)' }}
              >
                {labelFor(link.href, link.label)}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="ui-label link-underline"
                style={{ color: onDarkHero ? navMuted : 'var(--muted)' }}
              >
                {labelFor(link.href, link.label)}
              </Link>
            ),
          )}
          <ThemeToggle
            className={onDarkHero ? '!border-white/25 !text-[rgba(253,250,245,0.75)]' : ''}
            variant="public"
          />
        </nav>

        <div className="flex items-center gap-3 lg:hidden">
          <ThemeToggle
            className={onDarkHero ? '!border-white/25 !text-[rgba(253,250,245,0.75)]' : ''}
            variant="public"
          />
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex flex-col gap-[5px] rounded-none border-0 bg-transparent p-2 shadow-none outline-none ring-0"
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
        className="fixed inset-0 z-[10100] flex flex-col items-center justify-center gap-10"
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
            key={link.href}
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
                {labelFor(link.href, link.label)}
              </a>
            ) : (
              <Link
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-playfair text-4xl font-normal text-body hover:text-accent transition-colors"
              >
                {labelFor(link.href, link.label)}
              </Link>
            )}
          </motion.div>
        ))}
      </motion.div>
    </>
  )
}
