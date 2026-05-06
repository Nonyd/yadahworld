'use client'

import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useTheme } from 'next-themes'
import { DEFAULT_SITE_LOGO_URL } from '@/lib/default-branding'
import type { PublicNavLink } from '@/lib/site-copy'
import ThemeToggle from '@/components/ui/ThemeToggle'
import CartNavButton from '@/components/layout/CartNavButton'

export default function Navbar({
  siteName = 'Yadah',
  logoUrl = DEFAULT_SITE_LOGO_URL,
  navLinks,
  navLabels,
}: {
  siteName?: string
  logoUrl?: string
  navLinks: PublicNavLink[]
  navLabels: Record<string, string>
}) {
  const pathname = usePathname()
  const [heroMode, setHeroMode] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { scrollY } = useScroll()
  const { theme } = useTheme()

  useMotionValueEvent(scrollY, 'change', (y) => {
    // Home: pinned hero scroll (~600px) — keep transparent bar until past that range.
    setHeroMode(pathname === '/' ? y < 650 : y < 40)
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const onDarkHero = pathname === '/' && heroMode
  const scrolled = !heroMode
  const navMuted = 'rgba(253,250,245,0.6)'
  const isDark = mounted && theme === 'dark'
  const darkScrolledBar = scrolled && isDark

  /** Hero is dark; scrolled light needs black mark; scrolled dark keeps white mark. */
  const logoStyle: CSSProperties | undefined = onDarkHero ? undefined : !isDark ? { filter: 'brightness(0)' } : undefined

  const labelFor = (href: string, fallback: string) => navLabels[href]?.trim() || fallback

  const headerSurface =
    onDarkHero
      ? 'border-transparent bg-transparent'
      : [
          'border-b backdrop-blur-md',
          darkScrolledBar
            ? 'scrolled border-[rgba(201,168,76,0.1)]'
            : 'border-gold-light/15 bg-[color-mix(in_srgb,var(--bg)_92%,transparent)]',
        ].join(' ')

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 z-[10050]
          flex items-center justify-between gap-4
          px-8 md:px-16 py-6
          transition-all duration-700
          ${headerSurface}
        `}
      >
        <Link href="/" className="relative z-10 flex shrink-0 items-center" aria-label={`${siteName} home`}>
          <Image
            src={logoUrl}
            alt={siteName}
            width={320}
            height={80}
            priority
            className="h-10 w-auto md:h-14"
            style={logoStyle}
            sizes="(max-width: 768px) 140px, 180px"
          />
        </Link>

        <nav className="hidden lg:flex flex-1 items-center justify-end gap-6 xl:gap-8">
          {navLinks.map((link) =>
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
          <ThemeToggle />
          <CartNavButton onDarkHero={onDarkHero} />
        </nav>

        <div className="flex items-center gap-4 lg:hidden">
          <CartNavButton onDarkHero={onDarkHero} />
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
        className="fixed inset-0 z-[10100] flex flex-col bg-[var(--bg)]"
      >
        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          className="absolute top-7 right-8 ui-label text-muted"
        >
          Close
        </button>
        <div className="flex flex-1 flex-col items-center justify-center gap-10 px-8">
          {navLinks.map((link, i) => (
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
        </div>
        <div className="flex justify-center border-t border-[rgba(42,37,32,0.08)] py-6 dark:border-[rgba(201,168,76,0.1)]">
          <ThemeToggle />
        </div>
      </motion.div>
    </>
  )
}
