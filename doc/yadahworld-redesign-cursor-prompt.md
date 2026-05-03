# YADAHWORLD.COM — WORLD-CLASS REDESIGN
## Complete Cursor AI Build Prompt
### Stack: Next.js 14 · TypeScript · Tailwind CSS · Framer Motion · GSAP · Lenis · Cloudinary · Neon (PostgreSQL) · Prisma · Vercel

---

## 0. REFERENCE & VISION

**Reference site:** https://www.jubriloflagos.com — editorial, scroll-driven, large cinematic type, sectioned storytelling with marquee text, image reveals, and premium motion.

**Yadah World Vision:** "The Voice of Jesus Christ to Nations" — Yadah Kukeurim Daniel is an international Nigerian gospel music minister with 100M+ streams globally. The website must feel like a *sacred cinematic experience* — dark, reverent, powerful, intimate. Think: a gospel artist who sells out arenas and moves in the supernatural.

**Design Language:**
- Dark backgrounds: near-black (`#0A0A0A`) with warm charcoal tones
- Accent: Electric magenta/fuchsia (`#E8006F`) — her brand color, used sparingly and boldly
- Secondary accent: Warm gold/amber (`#C9A84C`) for divine, anointed moments
- Typography: `Cormorant Garamond` (display, headlines — regal, spiritual weight) + `Neue Montreal` or `DM Sans` (body) + script font for the Yadah logotype
- Motion: Smooth scroll via Lenis, GSAP ScrollTrigger for reveals, Framer Motion for page transitions and micro-interactions
- Photography: Full-bleed editorial, Cloudinary-optimized
- Feel: Luxury editorial gospel — NOT a typical church website. This is a world-class artist site.

---

## 1. PROJECT SETUP

```bash
npx create-next-app@latest yadahworld --typescript --tailwind --eslint --app --src-dir
cd yadahworld
npm install framer-motion gsap @gsap/react lenis @studio-freight/lenis
npm install @prisma/client prisma
npm install next-cloudinary
npm install @vercel/analytics
npm install react-intersection-observer
npm install swiper
npm install react-hook-form @hookform/resolvers zod
npm install nodemailer @types/nodemailer
npm install resend
npx prisma init
```

---

## 2. FOLDER STRUCTURE

```
src/
├── app/
│   ├── layout.tsx              # Root layout with Lenis, fonts, analytics
│   ├── page.tsx                # Homepage
│   ├── about/page.tsx          # About / Artist page
│   ├── media/page.tsx          # Videos & Photos
│   ├── booking/page.tsx        # Booking form (multi-step)
│   ├── contact/page.tsx        # Contact page
│   ├── shop/page.tsx           # Merch redirect or shop
│   ├── api/
│   │   ├── booking/route.ts    # Booking form submission
│   │   └── contact/route.ts    # Contact form submission
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   ├── MusicSection.tsx
│   │   ├── AboutSnippet.tsx
│   │   ├── VideosSection.tsx
│   │   ├── TestimonialMarquee.tsx
│   │   └── UpcomingEvents.tsx
│   ├── booking/
│   │   └── BookingForm.tsx
│   ├── ui/
│   │   ├── MagneticButton.tsx
│   │   ├── TextReveal.tsx
│   │   ├── ImageReveal.tsx
│   │   ├── MarqueeText.tsx
│   │   └── SmoothScroll.tsx
│   └── providers/
│       └── LenisProvider.tsx
├── lib/
│   ├── prisma.ts
│   └── cloudinary.ts
└── prisma/
    └── schema.prisma
```

---

## 3. ROOT LAYOUT & GLOBAL STYLES

### `src/app/layout.tsx`

```tsx
import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/react'
import LenisProvider from '@/components/providers/LenisProvider'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Yadah — The Voice of Jesus Christ to Nations',
  description:
    'Yadah Kukeurim Daniel — Nigerian gospel music minister with 100M+ streams. Book Yadah, explore her music, and experience the presence of God.',
  openGraph: {
    title: 'Yadah — The Voice of Jesus Christ to Nations',
    description: 'Nigerian gospel music minister with 100M+ global streams.',
    url: 'https://yadahworld.com',
    siteName: 'Yadah World',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="bg-[#0A0A0A] text-white antialiased overflow-x-hidden">
        <LenisProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </LenisProvider>
        <Analytics />
      </body>
    </html>
  )
}
```

### `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --magenta: #E8006F;
  --gold: #C9A84C;
  --charcoal: #1A1A1A;
  --near-black: #0A0A0A;
  --white: #FAFAF8;
  --font-cormorant: 'Cormorant Garamond', serif;
  --font-dm-sans: 'DM Sans', sans-serif;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: auto; /* Lenis handles this */
}

body {
  background: var(--near-black);
  color: var(--white);
  font-family: var(--font-dm-sans);
}

/* Lenis smooth scroll */
html.lenis {
  height: auto;
}
.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}
.lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain;
}
.lenis.lenis-stopped {
  overflow: hidden;
}
.lenis.lenis-scrolling iframe {
  pointer-events: none;
}

/* Custom cursor */
.cursor-dot {
  width: 8px;
  height: 8px;
  background: var(--magenta);
  border-radius: 50%;
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
  transition: transform 0.1s ease, width 0.3s ease, height 0.3s ease, opacity 0.3s ease;
}

.cursor-ring {
  width: 40px;
  height: 40px;
  border: 1px solid rgba(232, 0, 111, 0.5);
  border-radius: 50%;
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 9998;
  transform: translate(-50%, -50%);
  transition: transform 0.15s ease, width 0.3s ease, height 0.3s ease, opacity 0.3s ease;
}

/* Selection */
::selection {
  background: var(--magenta);
  color: #fff;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 3px;
}
::-webkit-scrollbar-track {
  background: var(--near-black);
}
::-webkit-scrollbar-thumb {
  background: var(--magenta);
  border-radius: 3px;
}

/* Clip path utility */
.clip-reveal {
  clip-path: polygon(0 100%, 100% 100%, 100% 100%, 0 100%);
}
.clip-reveal.revealed {
  clip-path: polygon(0 0%, 100% 0%, 100% 100%, 0 100%);
  transition: clip-path 1.2s cubic-bezier(0.77, 0, 0.175, 1);
}

/* Line animation */
@keyframes lineGrow {
  from { transform: scaleX(0); transform-origin: left; }
  to { transform: scaleX(1); transform-origin: left; }
}

/* Marquee animation */
@keyframes marquee {
  from { transform: translateX(0%); }
  to { transform: translateX(-50%); }
}
.marquee-inner {
  animation: marquee 20s linear infinite;
  display: flex;
  gap: 0;
  width: max-content;
}
.marquee-inner:hover {
  animation-play-state: paused;
}
```

---

## 4. LENIS SMOOTH SCROLL PROVIDER

### `src/components/providers/LenisProvider.tsx`

```tsx
'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    })

    lenisRef.current = lenis

    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      gsap.ticker.remove((time) => lenis.raf(time * 1000))
    }
  }, [])

  return <>{children}</>
}
```

---

## 5. NAVBAR

### `src/components/layout/Navbar.tsx`

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Media', href: '/media' },
  { label: 'About', href: '/about' },
  { label: 'Room For You', href: 'https://rfyglobal.org', external: true },
  { label: 'Contact', href: '/contact' },
  { label: 'Booking', href: '/booking' },
  { label: 'Shop', href: '/shop' },
]

export default function Navbar() {
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  const lastY = useRef(0)

  useMotionValueEvent(scrollY, 'change', (y) => {
    setHidden(y > lastY.current && y > 100)
    setScrolled(y > 40)
    lastY.current = y
  })

  return (
    <>
      <motion.header
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.4, ease: [0.77, 0, 0.175, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 py-5 transition-all duration-500 ${
          scrolled ? 'bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/5' : 'bg-transparent'
        }`}
      >
        {/* Logo */}
        <Link href="/" className="relative z-10">
          <span className="font-[family-name:var(--font-cormorant)] text-2xl font-light italic tracking-wide text-white">
            Yadah
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs tracking-[0.15em] uppercase text-white/60 hover:text-[#E8006F] transition-colors duration-300 font-[family-name:var(--font-dm-sans)]"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs tracking-[0.15em] uppercase text-white/60 hover:text-white transition-colors duration-300 font-[family-name:var(--font-dm-sans)] group relative"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#E8006F] group-hover:w-full transition-all duration-300" />
              </Link>
            )
          ))}
        </nav>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden flex flex-col gap-1.5 w-8 h-8 items-center justify-center"
          aria-label="Menu"
        >
          <motion.span
            animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 8 : 0 }}
            className="w-6 h-px bg-white block"
          />
          <motion.span
            animate={{ opacity: menuOpen ? 0 : 1 }}
            className="w-6 h-px bg-white block"
          />
          <motion.span
            animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -8 : 0 }}
            className="w-6 h-px bg-white block"
          />
        </button>
      </motion.header>

      {/* Mobile Menu */}
      <motion.div
        initial={{ opacity: 0, x: '100%' }}
        animate={{ opacity: menuOpen ? 1 : 0, x: menuOpen ? '0%' : '100%' }}
        transition={{ duration: 0.5, ease: [0.77, 0, 0.175, 1] }}
        className="fixed inset-0 z-40 bg-[#0A0A0A] flex flex-col items-center justify-center gap-10 lg:hidden"
      >
        {navLinks.map((link, i) => (
          <motion.div
            key={link.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: menuOpen ? 1 : 0, y: menuOpen ? 0 : 20 }}
            transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
          >
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="font-[family-name:var(--font-cormorant)] text-4xl font-light text-[#E8006F] hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-[family-name:var(--font-cormorant)] text-4xl font-light text-white/80 hover:text-white transition-colors"
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
```

---

## 6. HOMEPAGE

### `src/app/page.tsx`

```tsx
import HeroSection from '@/components/home/HeroSection'
import AboutSnippet from '@/components/home/AboutSnippet'
import MusicSection from '@/components/home/MusicSection'
import VideosSection from '@/components/home/VideosSection'
import TestimonialMarquee from '@/components/home/TestimonialMarquee'
import UpcomingEvents from '@/components/home/UpcomingEvents'
import BookingCTA from '@/components/home/BookingCTA'

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSnippet />
      <MusicSection />
      <VideosSection />
      <TestimonialMarquee />
      <UpcomingEvents />
      <BookingCTA />
    </>
  )
}
```

---

## 7. HERO SECTION

### `src/components/home/HeroSection.tsx`

```tsx
'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Link from 'next/link'

gsap.registerPlugin(ScrollTrigger)

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax on hero image
      gsap.to(imageRef.current, {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      // Text fade out on scroll
      gsap.to(textRef.current, {
        opacity: 0,
        y: -60,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: '20% top',
          end: '60% top',
          scrub: true,
        },
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen overflow-hidden flex items-end pb-20 md:pb-32"
    >
      {/* Full-bleed background image with parallax */}
      <div
        ref={imageRef}
        className="absolute inset-0 scale-110"
        style={{
          backgroundImage: `url('/images/hero-yadah.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/60 to-transparent" />
      </div>

      {/* Animated noise grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px',
        }}
      />

      {/* Text content */}
      <div ref={textRef} className="relative z-10 px-8 md:px-16 max-w-[90vw]">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-[#E8006F] text-xs tracking-[0.3em] uppercase font-[family-name:var(--font-dm-sans)] mb-6"
        >
          The Voice of Jesus Christ to Nations
        </motion.p>

        {/* Massive headline */}
        <div className="overflow-hidden mb-2">
          <motion.h1
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.77, 0, 0.175, 1] }}
            className="font-[family-name:var(--font-cormorant)] text-[clamp(4rem,12vw,10rem)] font-light leading-[0.9] tracking-tight text-white"
          >
            Yadah
          </motion.h1>
        </div>
        <div className="overflow-hidden mb-10">
          <motion.h2
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 1, delay: 0.45, ease: [0.77, 0, 0.175, 1] }}
            className="font-[family-name:var(--font-cormorant)] text-[clamp(1rem,3vw,2.5rem)] font-light italic text-white/60 tracking-wide"
          >
            100M+ streams worldwide
          </motion.h2>
        </div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-wrap gap-4 items-center"
        >
          <Link
            href="/booking"
            className="group relative inline-flex items-center gap-3 bg-[#E8006F] text-white px-8 py-4 text-xs tracking-[0.2em] uppercase font-[family-name:var(--font-dm-sans)] overflow-hidden hover:shadow-[0_0_40px_rgba(232,0,111,0.4)] transition-all duration-500"
          >
            <span className="relative z-10">Book Yadah</span>
            <span className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.77,0,0.175,1)]" />
            <span className="relative z-10 group-hover:text-[#E8006F] transition-colors duration-300">→</span>
          </Link>

          <a
            href="#music"
            className="text-white/60 hover:text-white text-xs tracking-[0.2em] uppercase font-[family-name:var(--font-dm-sans)] transition-colors duration-300 flex items-center gap-2"
          >
            <span className="w-8 h-px bg-white/40 group-hover:bg-white" />
            Explore Music
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 right-12 flex flex-col items-center gap-3"
      >
        <span className="text-white/30 text-[10px] tracking-[0.3em] uppercase rotate-90 origin-center font-[family-name:var(--font-dm-sans)]">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent"
        />
      </motion.div>
    </section>
  )
}
```

---

## 8. ABOUT SNIPPET (Homepage)

### `src/components/home/AboutSnippet.tsx`

```tsx
'use client'

import { useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function AboutSnippet() {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true })

  return (
    <section ref={ref} className="py-32 md:py-48 px-8 md:px-16">
      <div className="max-w-screen-xl mx-auto grid md:grid-cols-2 gap-20 items-center">
        {/* Left — image with clip reveal */}
        <motion.div
          initial={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)' }}
          animate={inView ? { clipPath: 'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)' } : {}}
          transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1] }}
          className="relative aspect-[3/4] overflow-hidden"
        >
          <img
            src="/images/yadah-editorial.jpg"
            alt="Yadah"
            className="w-full h-full object-cover object-top scale-110"
          />
          {/* Gold frame accent */}
          <div className="absolute top-4 left-4 right-4 bottom-4 border border-[#C9A84C]/20 pointer-events-none" />
        </motion.div>

        {/* Right — text */}
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
            className="text-[#E8006F] text-xs tracking-[0.3em] uppercase font-[family-name:var(--font-dm-sans)] mb-6"
          >
            The Origin
          </motion.p>

          <div className="overflow-hidden mb-6">
            <motion.h2
              initial={{ y: '100%' }}
              animate={inView ? { y: 0 } : {}}
              transition={{ duration: 1, delay: 0.2, ease: [0.77, 0, 0.175, 1] }}
              className="font-[family-name:var(--font-cormorant)] text-[clamp(2.5rem,6vw,5rem)] font-light leading-[1.1] text-white"
            >
              A Voice Sent<br />
              <em className="text-[#C9A84C]">From Heaven.</em>
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-white/60 font-[family-name:var(--font-dm-sans)] text-base leading-relaxed mb-8 max-w-md"
          >
            Yadah Kukeurim Daniel is a distinguished Nigerian singer, songwriter, and minister
            whose music centers on the themes of God's love and grace. With over 100 million
            streams globally, her sound has touched hearts in every continent and led countless
            souls into the presence of God.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex items-center gap-4"
          >
            <Link
              href="/about"
              className="text-white text-xs tracking-[0.2em] uppercase font-[family-name:var(--font-dm-sans)] hover:text-[#E8006F] transition-colors flex items-center gap-3 group"
            >
              <span className="w-12 h-px bg-white group-hover:bg-[#E8006F] transition-colors" />
              More About Yadah
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
```

---

## 9. MUSIC SECTION (Homepage)

### `src/components/home/MusicSection.tsx`

```tsx
'use client'

import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'
import Link from 'next/link'

const releases = [
  {
    title: 'Never Seen (Live) ft. Sunmisola Agbebi',
    type: 'Single',
    year: '2024',
    cover: '/images/releases/never-seen.jpg',
    spotify: '#',
  },
  {
    title: 'Fathered By The Best',
    type: 'Album',
    year: '2023',
    cover: '/images/releases/fathered.jpg',
    spotify: '#',
  },
  {
    title: 'Onye Nwere Jesus',
    type: 'Single',
    year: '2023',
    cover: '/images/releases/onye-nwere-jesus.jpg',
    spotify: '#',
  },
  {
    title: 'Beyond Me',
    type: 'Single',
    year: '2022',
    cover: '/images/releases/beyond-me.jpg',
    spotify: '#',
  },
]

export default function MusicSection() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })

  return (
    <section id="music" ref={ref} className="py-24 md:py-40">
      {/* Section title */}
      <div className="px-8 md:px-16 mb-16 flex items-end justify-between">
        <div>
          <p className="text-[#E8006F] text-xs tracking-[0.3em] uppercase font-[family-name:var(--font-dm-sans)] mb-4">
            The Sound
          </p>
          <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2.5rem,6vw,5rem)] font-light text-white leading-tight">
            Recent<br />
            <em className="italic">Releases.</em>
          </h2>
        </div>
        <Link
          href="/media"
          className="hidden md:flex items-center gap-3 text-white/40 hover:text-white text-xs tracking-[0.2em] uppercase font-[family-name:var(--font-dm-sans)] transition-colors group"
        >
          View All
          <span className="w-8 h-px bg-white/40 group-hover:bg-white transition-colors" />
        </Link>
      </div>

      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="px-8 md:px-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {releases.map((release, i) => (
          <motion.div
            key={release.title}
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.12, duration: 0.7, ease: [0.77, 0, 0.175, 1] }}
            className="group cursor-pointer"
          >
            <div className="relative overflow-hidden aspect-square mb-4">
              <img
                src={release.cover}
                alt={release.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-[#E8006F]/0 group-hover:bg-[#E8006F]/20 transition-all duration-500 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  className="w-12 h-12 rounded-full border border-white flex items-center justify-center"
                >
                  <svg className="w-4 h-4 fill-white ml-1" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </motion.div>
              </div>
              {/* NEW badge */}
              {i === 0 && (
                <div className="absolute top-3 right-3 bg-[#E8006F] text-white text-[9px] tracking-[0.2em] uppercase px-2 py-1 font-[family-name:var(--font-dm-sans)]">
                  New
                </div>
              )}
            </div>
            <p className="text-white text-sm font-[family-name:var(--font-dm-sans)] font-medium line-clamp-1 group-hover:text-[#E8006F] transition-colors">
              {release.title}
            </p>
            <p className="text-white/40 text-xs font-[family-name:var(--font-dm-sans)] mt-1">
              {release.type} · {release.year}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
```

---

## 10. TESTIMONIAL MARQUEE

### `src/components/home/TestimonialMarquee.tsx`

```tsx
'use client'

import { motion } from 'framer-motion'

const testimonials = [
  '"Her voice carries the glory of God"',
  '"Changed my life forever"',
  '"Beyond Me brought me to tears in worship"',
  '"She ministers, she doesn\'t just sing"',
  '"Anointed. Powerful. Sent."',
  '"100 million streams and counting — God is using her"',
]

export default function TestimonialMarquee() {
  return (
    <section className="py-16 border-y border-white/5 overflow-hidden">
      <div className="flex">
        <div className="marquee-inner">
          {[...testimonials, ...testimonials].map((t, i) => (
            <span
              key={i}
              className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl font-light italic text-white/20 hover:text-white/60 transition-colors whitespace-nowrap px-12"
            >
              {t}
              <span className="text-[#E8006F] mx-12 text-lg">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

## 11. VIDEOS SECTION (Homepage)

### `src/components/home/VideosSection.tsx`

```tsx
'use client'

import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'
import Link from 'next/link'

const videos = [
  {
    title: 'Never Seen (Live)',
    thumbnail: '/images/videos/never-seen-thumb.jpg',
    youtube: 'https://youtube.com/watch?v=xxx',
  },
  {
    title: 'Na Your Hand',
    thumbnail: '/images/videos/na-your-hand-thumb.jpg',
    youtube: 'https://youtube.com/watch?v=xxx',
  },
]

export default function VideosSection() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true })

  return (
    <section ref={ref} className="py-24 md:py-40 px-8 md:px-16">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-end justify-between mb-16">
          <div>
            <p className="text-[#E8006F] text-xs tracking-[0.3em] uppercase font-[family-name:var(--font-dm-sans)] mb-4">
              The Visual
            </p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2.5rem,6vw,5rem)] font-light text-white">
              Latest<br />
              <em>Videos.</em>
            </h2>
          </div>
          <Link
            href="/media#videos"
            className="hidden md:flex items-center gap-3 text-white/40 hover:text-white text-xs tracking-[0.2em] uppercase font-[family-name:var(--font-dm-sans)] transition-colors group"
          >
            See More
            <span className="w-8 h-px bg-white/40 group-hover:bg-white transition-colors" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {videos.map((video, i) => (
            <motion.a
              key={video.title}
              href={video.youtube}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.7 }}
              className="relative group overflow-hidden aspect-video block"
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[#0A0A0A]/40 group-hover:bg-[#0A0A0A]/20 transition-all duration-500" />
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center bg-white/10 backdrop-blur-sm"
                >
                  <svg className="w-6 h-6 fill-white ml-1" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </motion.div>
              </div>
              {/* Title */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0A0A0A] to-transparent">
                <p className="font-[family-name:var(--font-cormorant)] text-xl font-light text-white">
                  {video.title}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

## 12. BOOKING CTA SECTION

### `src/components/home/BookingCTA.tsx`

```tsx
'use client'

import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function BookingCTA() {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true })

  return (
    <section
      ref={ref}
      className="relative py-40 md:py-56 px-8 md:px-16 overflow-hidden"
    >
      {/* Background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url('/images/yadah-worship.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A]/60 to-[#0A0A0A]" />

      {/* Gold horizontal lines */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.5, ease: [0.77, 0, 0.175, 1] }}
        className="absolute top-16 left-16 right-16 h-px bg-[#C9A84C]/30 origin-left"
      />
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.5, delay: 0.2, ease: [0.77, 0, 0.175, 1] }}
        className="absolute bottom-16 left-16 right-16 h-px bg-[#C9A84C]/30 origin-left"
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase font-[family-name:var(--font-dm-sans)] mb-8"
        >
          Invite Yadah
        </motion.p>
        <div className="overflow-hidden mb-6">
          <motion.h2
            initial={{ y: '100%' }}
            animate={inView ? { y: 0 } : {}}
            transition={{ duration: 1, delay: 0.3, ease: [0.77, 0, 0.175, 1] }}
            className="font-[family-name:var(--font-cormorant)] text-[clamp(3rem,8vw,7rem)] font-light text-white leading-[0.95]"
          >
            "Yadah is always<br />
            <em className="text-[#E8006F]">Glad to be</em><br />
            a blessing."
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="text-white/50 font-[family-name:var(--font-dm-sans)] text-base mb-12 max-w-md mx-auto"
        >
          Book Yadah for your concert, church conference, album launch, or worship event.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
        >
          <Link
            href="/booking"
            className="inline-flex items-center gap-4 border border-[#E8006F] text-white px-10 py-5 text-xs tracking-[0.25em] uppercase font-[family-name:var(--font-dm-sans)] hover:bg-[#E8006F] transition-all duration-500 group"
          >
            Submit Booking Request
            <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
```

---

## 13. BOOKING PAGE — MULTI-STEP FORM

### `src/app/booking/page.tsx`

```tsx
import BookingForm from '@/components/booking/BookingForm'

export default function BookingPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 px-8 md:px-16">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <p className="text-[#E8006F] text-xs tracking-[0.3em] uppercase font-[family-name:var(--font-dm-sans)] mb-4">
            Invitations
          </p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-[clamp(3rem,8vw,7rem)] font-light text-white leading-[0.95] mb-6">
            Book<br />
            <em className="italic text-[#C9A84C]">Yadah.</em>
          </h1>
          <p className="text-white/50 font-[family-name:var(--font-dm-sans)] max-w-lg">
            Yadah is always glad to be a blessing to the body of Christ. Fill out the form below
            and her management team will get back to you at the soonest possible time.
          </p>
          <p className="text-white/30 font-[family-name:var(--font-dm-sans)] text-sm mt-2">
            Note: This form does not confirm an event. It is used for scheduling purposes only.
          </p>
        </div>

        <BookingForm />
      </div>
    </div>
  )
}
```

### `src/components/booking/BookingForm.tsx`

```tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

// ---- Step schemas ----
const step1Schema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Phone number required'),
})

const step2Schema = z.object({
  churchName: z.string().min(2, 'Church/Organization name required'),
  website: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  streetAddress: z.string().min(5, 'Address required'),
  city: z.string().min(2),
  state: z.string().min(2),
  country: z.string().min(2),
  orgPhone: z.string().min(7),
  orgEmail: z.string().email(),
})

const step3Schema = z.object({
  eventName: z.string().min(2, 'Event name required'),
  natureOfEvent: z.string().min(2, 'Nature of event required'),
  whatExpected: z.array(z.string()).min(1, 'Select at least one'),
  expectationDetails: z.string().min(10, 'Please describe what is expected'),
  eventDate: z.string().min(1, 'Event date required'),
  eventTime: z.string().min(1, 'Event time required'),
  eventAddress: z.string().min(5),
  eventCity: z.string().min(2),
  eventState: z.string().min(2),
  eventCountry: z.string().min(2),
  additionalInfo: z.string().optional(),
})

const steps = ['Contact Info', 'Organization', 'Event Details', 'Confirm']

// Field component for consistent styling
function Field({ label, required, error, children }: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs tracking-[0.15em] uppercase font-[family-name:var(--font-dm-sans)] text-white/60">
        {label} {required && <span className="text-[#E8006F]">*</span>}
      </label>
      {children}
      {error && <p className="text-[#E8006F] text-xs font-[family-name:var(--font-dm-sans)]">{error}</p>}
    </div>
  )
}

const inputClass = "bg-transparent border border-white/15 text-white px-4 py-3 text-sm font-[family-name:var(--font-dm-sans)] focus:outline-none focus:border-[#E8006F] transition-colors w-full placeholder:text-white/20"

export default function BookingForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const schemas = [step1Schema, step2Schema, step3Schema]
  const { register, handleSubmit, formState: { errors }, getValues } = useForm({
    resolver: zodResolver(schemas[currentStep] as any),
  })

  const handleNext = handleSubmit((data) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setCurrentStep((s) => s + 1)
  })

  const handleFinalSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) setSubmitted(true)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-24 text-center max-w-lg"
      >
        <div className="w-16 h-16 border border-[#C9A84C] rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-[#C9A84C] text-2xl">✓</span>
        </div>
        <h2 className="font-[family-name:var(--font-cormorant)] text-4xl font-light text-white mb-4">
          Request Received
        </h2>
        <p className="text-white/50 font-[family-name:var(--font-dm-sans)]">
          Thank you for reaching out. Yadah's management will review your request and get back to
          you at the soonest possible time. God bless you.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="max-w-2xl">
      {/* Progress */}
      <div className="mb-12">
        <div className="flex gap-2 mb-4">
          {steps.map((step, i) => (
            <div key={step} className="flex-1">
              <div
                className={`h-px transition-all duration-700 ${
                  i <= currentStep ? 'bg-[#E8006F]' : 'bg-white/10'
                }`}
              />
            </div>
          ))}
        </div>
        <p className="text-white/40 text-xs tracking-[0.2em] uppercase font-[family-name:var(--font-dm-sans)]">
          Step {currentStep + 1} of {steps.length} — {steps[currentStep]}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.4, ease: [0.77, 0, 0.175, 1] }}
        >
          {/* Step 1 — Contact Info */}
          {currentStep === 0 && (
            <div className="flex flex-col gap-6">
              <Field label="Full Name" required error={errors.fullName?.message as string}>
                <input {...register('fullName')} placeholder="Your full name" className={inputClass} />
              </Field>
              <Field label="Email" required error={errors.email?.message as string}>
                <input {...register('email')} type="email" placeholder="your@email.com" className={inputClass} />
              </Field>
              <Field label="Phone Number" required error={errors.phone?.message as string}>
                <input {...register('phone')} placeholder="+234 800 000 0000" className={inputClass} />
              </Field>
            </div>
          )}

          {/* Step 2 — Organization */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-6">
              <Field label="Church / Organization Name" required error={errors.churchName?.message as string}>
                <input {...register('churchName')} placeholder="Name of your church or organization" className={inputClass} />
              </Field>
              <Field label="Website" error={errors.website?.message as string}>
                <input {...register('website')} placeholder="https://yourwebsite.com" className={inputClass} />
              </Field>
              <Field label="Address" required error={errors.streetAddress?.message as string}>
                <input {...register('streetAddress')} placeholder="Street Address" className={inputClass} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="City" required error={errors.city?.message as string}>
                  <input {...register('city')} placeholder="City" className={inputClass} />
                </Field>
                <Field label="State / Province" required error={errors.state?.message as string}>
                  <input {...register('state')} placeholder="State" className={inputClass} />
                </Field>
              </div>
              <Field label="Country" required error={errors.country?.message as string}>
                <input {...register('country')} placeholder="Nigeria" className={inputClass} />
              </Field>
              <Field label="Organization Phone" required error={errors.orgPhone?.message as string}>
                <input {...register('orgPhone')} placeholder="+234 800 000 0000" className={inputClass} />
              </Field>
              <Field label="Organization Email" required error={errors.orgEmail?.message as string}>
                <input {...register('orgEmail')} type="email" placeholder="office@organization.org" className={inputClass} />
              </Field>
            </div>
          )}

          {/* Step 3 — Event Details */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-6">
              <Field label="Event Name & Theme" required error={errors.eventName?.message as string}>
                <input {...register('eventName')} placeholder="e.g. Glory Conference 2025" className={inputClass} />
              </Field>
              <Field label="Nature of Event" required error={errors.natureOfEvent?.message as string}>
                <input {...register('natureOfEvent')} placeholder="Concert, Worship Meeting, Church Conference…" className={inputClass} />
              </Field>
              <Field label="What is Expected From Yadah" required>
                <div className="flex flex-col gap-2">
                  {['Music Ministration', 'Public Speaking', 'Public Appearance', 'Others'].map((opt) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        value={opt}
                        {...register('whatExpected')}
                        className="w-4 h-4 border border-white/20 bg-transparent accent-[#E8006F] cursor-pointer"
                      />
                      <span className="text-white/60 text-sm font-[family-name:var(--font-dm-sans)] group-hover:text-white transition-colors">
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="Describe What is Expected" required error={errors.expectationDetails?.message as string}>
                <textarea
                  {...register('expectationDetails')}
                  rows={4}
                  placeholder="Please describe in detail…"
                  className={`${inputClass} resize-none`}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Date of Event" required error={errors.eventDate?.message as string}>
                  <input type="date" {...register('eventDate')} className={inputClass} />
                </Field>
                <Field label="Time of Event" required error={errors.eventTime?.message as string}>
                  <input type="time" {...register('eventTime')} className={inputClass} />
                </Field>
              </div>
              <Field label="Event Address" required error={errors.eventAddress?.message as string}>
                <input {...register('eventAddress')} placeholder="Street Address" className={inputClass} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="City" required>
                  <input {...register('eventCity')} placeholder="City" className={inputClass} />
                </Field>
                <Field label="State" required>
                  <input {...register('eventState')} placeholder="State" className={inputClass} />
                </Field>
              </div>
              <Field label="Country" required>
                <input {...register('eventCountry')} placeholder="Nigeria" className={inputClass} />
              </Field>
              <Field label="Additional Information">
                <textarea
                  {...register('additionalInfo')}
                  rows={3}
                  placeholder="Any other details about the event…"
                  className={`${inputClass} resize-none`}
                />
              </Field>
            </div>
          )}

          {/* Step 4 — Confirm */}
          {currentStep === 3 && (
            <div>
              <div className="border border-white/10 p-6 mb-8">
                <p className="text-white/40 text-xs tracking-[0.15em] uppercase font-[family-name:var(--font-dm-sans)] mb-4">
                  Please Note
                </p>
                <p className="text-white/60 font-[family-name:var(--font-dm-sans)] text-sm leading-relaxed">
                  This form is used by Yadah's Management for scheduling purposes only and does NOT
                  confirm an event. We will get back to you at the soonest time possible after
                  reviewing your request.
                </p>
              </div>

              <button
                onClick={handleFinalSubmit}
                disabled={loading}
                className="w-full md:w-auto inline-flex items-center justify-center gap-4 bg-[#E8006F] text-white px-12 py-5 text-xs tracking-[0.25em] uppercase font-[family-name:var(--font-dm-sans)] hover:bg-white hover:text-[#E8006F] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting…' : 'Submit Booking Request'}
                {!loading && <span>→</span>}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center gap-6 mt-10">
        {currentStep > 0 && currentStep < 3 && (
          <button
            onClick={() => setCurrentStep((s) => s - 1)}
            className="text-white/40 hover:text-white text-xs tracking-[0.2em] uppercase font-[family-name:var(--font-dm-sans)] transition-colors flex items-center gap-2"
          >
            ← Back
          </button>
        )}
        {currentStep < 3 && (
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-4 border border-white/20 text-white px-8 py-4 text-xs tracking-[0.25em] uppercase font-[family-name:var(--font-dm-sans)] hover:border-[#E8006F] hover:text-[#E8006F] transition-all duration-300"
          >
            Continue
            <span>→</span>
          </button>
        )}
      </div>
    </div>
  )
}
```

---

## 14. BOOKING API ROUTE

### `src/app/api/booking/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const body = await req.json()

  try {
    // Save to database
    await prisma.bookingRequest.create({
      data: {
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        churchName: body.churchName,
        website: body.website || null,
        orgAddress: `${body.streetAddress}, ${body.city}, ${body.state}, ${body.country}`,
        orgPhone: body.orgPhone,
        orgEmail: body.orgEmail,
        eventName: body.eventName,
        natureOfEvent: body.natureOfEvent,
        whatExpected: body.whatExpected.join(', '),
        expectationDetails: body.expectationDetails,
        eventDate: new Date(body.eventDate),
        eventTime: body.eventTime,
        eventAddress: `${body.eventAddress}, ${body.eventCity}, ${body.eventState}, ${body.eventCountry}`,
        additionalInfo: body.additionalInfo || null,
        status: 'PENDING',
      },
    })

    // Notify management
    await resend.emails.send({
      from: 'Yadah Booking <noreply@yadahworld.com>',
      to: 'yadahsings@gmail.com',
      subject: `New Booking Request: ${body.eventName}`,
      html: `
        <h2>New Booking Request</h2>
        <p><strong>From:</strong> ${body.fullName} (${body.email})</p>
        <p><strong>Organization:</strong> ${body.churchName}</p>
        <p><strong>Event:</strong> ${body.eventName}</p>
        <p><strong>Date:</strong> ${body.eventDate}</p>
        <p><strong>Nature:</strong> ${body.natureOfEvent}</p>
        <p><strong>Expected:</strong> ${body.whatExpected.join(', ')}</p>
        <p><strong>Details:</strong> ${body.expectationDetails}</p>
        <p><strong>Address:</strong> ${body.eventAddress}, ${body.eventCity}</p>
        ${body.additionalInfo ? `<p><strong>Additional:</strong> ${body.additionalInfo}</p>` : ''}
      `,
    })

    // Auto-reply to requester
    await resend.emails.send({
      from: 'Yadah Management <noreply@yadahworld.com>',
      to: body.email,
      subject: 'Your Booking Request Has Been Received',
      html: `
        <p>Dear ${body.fullName},</p>
        <p>Thank you for reaching out. Your booking request for <strong>${body.eventName}</strong> 
        on <strong>${body.eventDate}</strong> has been received.</p>
        <p>Please note that this does not confirm the event. Yadah's management will review your 
        request and contact you at the soonest possible time.</p>
        <p>God bless you,<br/>Yadah Management Team<br/>SonsHub Media</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 })
  }
}
```

---

## 15. PRISMA SCHEMA

### `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model BookingRequest {
  id                String   @id @default(cuid())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Contact
  fullName          String
  email             String
  phone             String

  // Organization
  churchName        String
  website           String?
  orgAddress        String
  orgPhone          String
  orgEmail          String

  // Event
  eventName         String
  natureOfEvent     String
  whatExpected      String
  expectationDetails String
  eventDate         DateTime
  eventTime         String
  eventAddress      String
  additionalInfo    String?

  // Management
  status            BookingStatus @default(PENDING)
  notes             String?
}

enum BookingStatus {
  PENDING
  REVIEWING
  CONFIRMED
  DECLINED
}

model ContactMessage {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  name      String
  email     String
  subject   String
  message   String
  read      Boolean  @default(false)
}
```

---

## 16. FOOTER

### `src/components/layout/Footer.tsx`

```tsx
import Link from 'next/link'

const footerLinks = [
  {
    heading: 'Navigation',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Media', href: '/media' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Booking', href: '/booking' },
      { label: 'Shop', href: '/shop' },
    ],
  },
  {
    heading: 'Events',
    links: [
      { label: 'Campus Tour 2025', href: '/campus-tour' },
      { label: 'Room For You', href: 'https://rfyglobal.org', external: true },
      { label: 'Upcoming Events', href: '/#events' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Refund & Returns', href: '/refund-policy' },
      { label: 'About SonsHub', href: 'https://sonshubmedia.com', external: true },
    ],
  },
]

const socials = [
  { label: 'Instagram', href: 'https://instagram.com/ministersings', icon: 'IG' },
  { label: 'YouTube', href: 'https://youtube.com/@yadah', icon: 'YT' },
  { label: 'Spotify', href: 'https://open.spotify.com/artist/xxx', icon: 'SP' },
  { label: 'Facebook', href: 'https://facebook.com/yadahsings', icon: 'FB' },
  { label: 'Twitter', href: 'https://twitter.com/ministeryadah', icon: 'TW' },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/5 pt-20 pb-10 px-8 md:px-16">
      <div className="max-w-screen-xl mx-auto">
        {/* Top row */}
        <div className="grid md:grid-cols-5 gap-12 mb-20">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/">
              <span className="font-[family-name:var(--font-cormorant)] text-4xl font-light italic tracking-wide text-white">
                Yadah
              </span>
            </Link>
            <p className="text-white/40 font-[family-name:var(--font-dm-sans)] text-sm mt-4 max-w-xs leading-relaxed">
              The Voice of Jesus Christ to Nations. Gospel music minister, songwriter, and
              fashion designer based in Abuja, Nigeria.
            </p>
            <div className="flex gap-4 mt-6">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 border border-white/10 flex items-center justify-center text-[9px] text-white/40 hover:border-[#E8006F] hover:text-[#E8006F] transition-all duration-300 font-[family-name:var(--font-dm-sans)] tracking-widest"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {footerLinks.map((group) => (
            <div key={group.heading}>
              <p className="text-[10px] tracking-[0.3em] uppercase font-[family-name:var(--font-dm-sans)] text-white/30 mb-5">
                {group.heading}
              </p>
              <ul className="flex flex-col gap-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {'external' in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/50 hover:text-white text-sm font-[family-name:var(--font-dm-sans)] transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-white/50 hover:text-white text-sm font-[family-name:var(--font-dm-sans)] transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex gap-6 text-white/20 text-xs font-[family-name:var(--font-dm-sans)] tracking-widest">
            <span>📍 Abuja, Nigeria</span>
            <span>📞 +2348081881365</span>
            <span>✉️ yadahsings@gmail.com</span>
          </div>
          <p className="text-white/20 text-xs font-[family-name:var(--font-dm-sans)]">
            © {new Date().getFullYear()} Yadah. Powered & managed by{' '}
            <a
              href="https://sonshubmedia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E8006F] hover:text-white transition-colors"
            >
              SonsHub Media
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
```

---

## 17. ENVIRONMENT VARIABLES

### `.env.local`

```env
# Database (Neon)
DATABASE_URL="postgresql://user:password@host/yadahworld?sslmode=require"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Resend (email)
RESEND_API_KEY="re_xxxxxxxxxxxx"

# App
NEXT_PUBLIC_SITE_URL="https://yadahworld.com"
```

---

## 18. TAILWIND CONFIG

### `tailwind.config.ts`

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        cormorant: ['var(--font-cormorant)', 'serif'],
        sans: ['var(--font-dm-sans)', 'sans-serif'],
      },
      colors: {
        magenta: '#E8006F',
        gold: '#C9A84C',
        charcoal: '#1A1A1A',
        'near-black': '#0A0A0A',
      },
      animation: {
        marquee: 'marquee 20s linear infinite',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0%)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

---

## 19. VERCEL DEPLOYMENT CONFIG

### `vercel.json`

```json
{
  "framework": "nextjs",
  "buildCommand": "npx prisma generate && next build",
  "installCommand": "npm install",
  "env": {
    "DATABASE_URL": "@database_url",
    "RESEND_API_KEY": "@resend_api_key",
    "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME": "@cloudinary_cloud_name",
    "CLOUDINARY_API_KEY": "@cloudinary_api_key",
    "CLOUDINARY_API_SECRET": "@cloudinary_api_secret"
  }
}
```

---

## 20. CUSTOM CURSOR (add to layout)

### `src/components/ui/CustomCursor.tsx`

```tsx
'use client'

import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let mouseX = 0, mouseY = 0
    let ringX = 0, ringY = 0

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`
    }

    const animate = () => {
      ringX += (mouseX - ringX) * 0.12
      ringY += (mouseY - ringY) * 0.12
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`
      requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMouseMove)
    const raf = requestAnimationFrame(animate)

    // Hover effects on interactive elements
    const els = document.querySelectorAll('a, button')
    els.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        ring.style.width = '60px'
        ring.style.height = '60px'
        ring.style.borderColor = 'rgba(232, 0, 111, 0.8)'
      })
      el.addEventListener('mouseleave', () => {
        ring.style.width = '40px'
        ring.style.height = '40px'
        ring.style.borderColor = 'rgba(232, 0, 111, 0.5)'
      })
    })

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="cursor-dot hidden md:block" />
      <div ref={ringRef} className="cursor-ring hidden md:block" />
    </>
  )
}
```

Add `<CustomCursor />` to `layout.tsx` body.

---

## 21. ABOUT PAGE

### `src/app/about/page.tsx`

```tsx
'use client'

import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function AboutPage() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[70vh] overflow-hidden flex items-end pb-20">
        <div
          className="absolute inset-0 scale-110"
          style={{
            backgroundImage: `url('/images/about-hero.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/30 to-transparent" />
        </div>
        <div className="relative z-10 px-8 md:px-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[#E8006F] text-xs tracking-[0.3em] uppercase font-[family-name:var(--font-dm-sans)] mb-4"
          >
            The Artist
          </motion.p>
          <motion.h1
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.77, 0, 0.175, 1] }}
            className="font-[family-name:var(--font-cormorant)] text-[clamp(3rem,10vw,8rem)] font-light text-white leading-[0.9]"
          >
            Yadah.<br />
            <em className="text-white/50 text-[clamp(1.5rem,5vw,4rem)]">
              The Voice Of Jesus To Nations.
            </em>
          </motion.h1>
        </div>
      </section>

      {/* Bio */}
      <section ref={ref} className="py-24 md:py-40 px-8 md:px-16">
        <div className="max-w-screen-xl mx-auto grid md:grid-cols-2 gap-20">
          <div>
            <motion.blockquote
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl font-light italic text-[#C9A84C] leading-relaxed mb-10 border-l border-[#E8006F] pl-6"
            >
              "I believe in the one and only true God. I believe in Christ's cross and all that
              it is to a believer!!"
            </motion.blockquote>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="text-white/60 font-[family-name:var(--font-dm-sans)] leading-relaxed mb-6"
            >
              Yadah Kukeurim Daniel, professionally known as Yadah, is a distinguished Nigerian
              singer, songwriter, and fashion designer whose impactful music centers on the themes
              of God's love and grace. Based in Abuja, Nigeria, Yadah has carved a significant
              niche in contemporary gospel music, captivating audiences worldwide with her
              soulful melodies and profound lyrical content.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="text-white/60 font-[family-name:var(--font-dm-sans)] leading-relaxed mb-6"
            >
              She made her official debut in 2017 with "Goodie Goodie" under the management of
              SonsHub Media. Her discography includes hit songs such as "Beyond Me", "Never Seen",
              "Onye Nwere Jesus", "Free of Charge", and "Na Your Hand" — collectively garnering
              over 100 million streams globally.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.8 }}
              className="flex gap-6 mt-10"
            >
              <div>
                <p className="font-[family-name:var(--font-cormorant)] text-5xl font-light text-[#E8006F]">100M+</p>
                <p className="text-white/40 text-xs tracking-[0.15em] uppercase font-[family-name:var(--font-dm-sans)]">Streams Globally</p>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <p className="font-[family-name:var(--font-cormorant)] text-5xl font-light text-[#E8006F]">600K+</p>
                <p className="text-white/40 text-xs tracking-[0.15em] uppercase font-[family-name:var(--font-dm-sans)]">Social Followers</p>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <p className="font-[family-name:var(--font-cormorant)] text-5xl font-light text-[#E8006F]">7+</p>
                <p className="text-white/40 text-xs tracking-[0.15em] uppercase font-[family-name:var(--font-dm-sans)]">Years Ministry</p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)' }}
            animate={inView ? { clipPath: 'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)' } : {}}
            transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1] }}
            className="relative aspect-[3/4]"
          >
            <img
              src="/images/yadah-about.jpg"
              alt="Yadah"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Booking CTA */}
      <section className="py-20 px-8 md:px-16 text-center border-t border-white/5">
        <p className="font-[family-name:var(--font-cormorant)] text-2xl font-light italic text-white/40 mb-6">
          Want to invite Yadah to your event?
        </p>
        <Link
          href="/booking"
          className="inline-flex items-center gap-4 bg-[#E8006F] text-white px-10 py-5 text-xs tracking-[0.25em] uppercase font-[family-name:var(--font-dm-sans)] hover:bg-white hover:text-[#E8006F] transition-all duration-500"
        >
          Book Yadah →
        </Link>
      </section>
    </div>
  )
}
```

---

## 22. KEY IMAGES NEEDED (Cloudinary upload)

Upload these images to Cloudinary and map them in `/public/images/` or use the `next-cloudinary` `CldImage` component:

| Path | Description |
|------|-------------|
| `/images/hero-yadah.jpg` | Full-bleed hero — best editorial shot of Yadah |
| `/images/yadah-editorial.jpg` | Portrait for About snippet on homepage |
| `/images/yadah-about.jpg` | About page portrait |
| `/images/yadah-worship.jpg` | Worship/concert shot for booking CTA BG |
| `/images/about-hero.jpg` | About page hero |
| `/images/releases/never-seen.jpg` | Album cover |
| `/images/releases/fathered.jpg` | Album cover |
| `/images/releases/onye-nwere-jesus.jpg` | Single cover |
| `/images/releases/beyond-me.jpg` | Single cover |
| `/images/videos/never-seen-thumb.jpg` | Video thumbnail |
| `/images/videos/na-your-hand-thumb.jpg` | Video thumbnail |

---

## 23. ADDITIONAL PAGES TO BUILD

Following the same pattern, build these pages:

### `/media` — Gallery/Videos Page
- Two tabs: Videos | Photos
- Videos: YouTube embed grid with hover-play previews
- Photos: Masonry grid with Cloudinary images + lightbox (use `yet-another-react-lightbox`)
- Spotify embed widget (Follow on Spotify)

### `/contact` — Contact Page (SEPARATE from booking)
- Simple elegant form: Name, Email, Subject, Message
- No multi-step — one clean form
- API route: `/api/contact` → saves to DB + Resend email
- Show office address, phone, email alongside form

### `/shop` — Merch Page
- Can redirect to external merch store OR display Cloudinary product images
- Clean product grid with hover effects

---

## 24. PAGE TRANSITIONS

Add to `layout.tsx`:

```tsx
// Use Framer Motion AnimatePresence for page transitions
// In layout.tsx:
import { AnimatePresence, motion } from 'framer-motion'

// Wrap children:
<AnimatePresence mode="wait">
  <motion.div
    key={/* use pathname */}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5, ease: [0.77, 0, 0.175, 1] }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

---

## 25. DEPLOYMENT STEPS

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "initial"
git remote add origin https://github.com/sonshubmedia/yadahworld
git push -u origin main

# 2. Connect Neon DB
# Create project at neon.tech
# Copy DATABASE_URL to Vercel environment variables

# 3. Deploy on Vercel
# Import repo, add all .env vars, deploy

# 4. Run migrations
npx prisma db push

# 5. Cloudinary
# Upload images via Cloudinary dashboard or Media Library
# Use next-cloudinary CldImage for optimized delivery
```

---

## DESIGN SUMMARY

| Element | Choice |
|---------|--------|
| Background | `#0A0A0A` near-black |
| Primary accent | `#E8006F` electric magenta |
| Secondary accent | `#C9A84C` warm gold |
| Display font | `Cormorant Garamond` (regal, spiritual) |
| Body font | `DM Sans` (clean, legible) |
| Motion library | GSAP + Framer Motion + Lenis |
| Scroll | Lenis smooth scroll |
| Images | Cloudinary via `next-cloudinary` |
| Database | Neon (PostgreSQL) + Prisma |
| Email | Resend |
| Hosting | Vercel |
| Custom cursor | Magenta dot + ring |
| Feel | Sacred cinematic editorial |
