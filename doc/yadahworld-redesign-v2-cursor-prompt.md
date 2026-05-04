# YADAHWORLD.COM — COMPLETE REDESIGN v2
## Cursor AI Master Build Prompt
### Stack: Next.js 14 · TypeScript · Tailwind CSS · Framer Motion · GSAP · Lenis · Prisma · Neon · Cloudinary · Resend · Vercel

---

## PART 0 — DESIGN BRIEF & PHILOSOPHY

### Who is Yadah?
Yadah Kukeurim Daniel is an international gospel music minister — not a pop artist, not a celebrity. She is first a *minister of the gospel*, a worshipper, a voice sent to nations. Her ministry has touched millions of lives globally. She is managed by SonsHub Media, based in Abuja, Nigeria, and married to Okafor Chinonso Daniel.

### The Design Problem
Most gospel artist websites look like either (a) a church bulletin board or (b) a generic pop-music promo site. Neither is appropriate here. Yadah's website must occupy a third category: **sacred, civilised, and world-class.**

### The Concept: "A Consecrated Space"
The website is designed like a **rare illuminated manuscript** meets **a luxury gallery opening**. When someone lands on it, they should feel what they feel in the five seconds before a worship set begins — *quiet anticipation, the weight of something holy, and the sense that they are in the presence of something real.*

**This is not a dark website. This is a LIGHT website.** Light = the presence of God. Ivory, parchment, warm cream backgrounds. The darkness is reserved for moments of depth — a line of scripture, a weight, a contrast.

### Design Tokens (commit to these, never deviate)

```
Background:        #F7F3EC  (warm ivory / parchment)
Surface:           #EDE8DF  (slightly deeper parchment, cards/sections)
Deep:              #0D0B08  (near-black ink, not pure black)
Body text:         #2A2520  (warm dark brown, not cold black)
Muted text:        #8A7F72  (warm grey-brown)
Accent:            #6B2737  (deep oxblood/burgundy — sacred, ancient)
Accent light:      #A03848  (lighter oxblood for hover states)
Gold:              #8B6914  (antique gold — divine, not gaudy)
Gold light:        #C9A84C  (lighter gold for decorative use)
White:             #FDFAF5  (warm white, never pure #FFFFFF)
```

### Typography (install these, use no others)

```
Display font:      "Playfair Display" — Google Font
                   Weights: 400, 500, 700, 900, 400italic, 700italic
                   Use for: H1, H2, H3, pull quotes, section titles
                   
Body font:         "Libre Baskerville" — Google Font  
                   Weights: 400, 400italic, 700
                   Use for: body text, descriptions, long-form content
                   
Label/UI font:     "Jost" — Google Font
                   Weights: 300, 400, 500
                   Use for: nav items, labels, buttons, captions, all-caps utility text
                   
NO SANS-SERIF for content. Jost is only for UI chrome.
```

### Motion Principles
- **Reverent, not playful.** Every animation should feel like a page turning, not a notification bouncing.
- Entrance: elements reveal upward with `y: 40 → 0`, opacity `0 → 1`, duration `0.9s`, ease `[0.25, 0.46, 0.45, 0.94]` (ease-out-quint)
- Image reveals: clip-path `polygon(0 100%, 100% 100%, 100% 100%, 0 100%)` → `polygon(0 0, 100% 0, 100% 100%, 0 100%)`, duration `1.4s`, ease `[0.77, 0, 0.175, 1]`
- Lenis scroll: duration `1.6`, easing: `(t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))`
- Hover on links: underline draws from left, color shifts to oxblood
- Page transitions: whole page fades through ivory overlay (not instant cut)
- **NO** bouncy springs. **NO** elastic animations. **NO** scale-up card hovers (use shadow + slight translate-y instead).

### Layout Principles
- The grid is 12 columns but sections *intentionally break* it — text can start at column 3 on desktop, images can bleed to the edge while text sits centred
- Sections are numbered like a liturgy: `01 — 02 — 03`
- Generous whitespace. Sections breathe. Padding-top/bottom: `clamp(6rem, 12vw, 14rem)`
- A thin `1px` horizontal rule in `#C9A84C/30` separates major sections
- Images always have a thin `1px solid #8B6914/20` inset border (the "illuminated manuscript" detail)

---

## PART 1 — PROJECT SETUP

### Install dependencies
```bash
# Start fresh or update the existing project
npm install framer-motion gsap @gsap/react lenis
npm install @prisma/client prisma
npm install next-cloudinary
npm install @vercel/analytics
npm install react-intersection-observer
npm install swiper
npm install react-hook-form @hookform/resolvers zod
npm install resend
npm install yet-another-react-lightbox
npm install next-themes
# Admin dashboard
npm install @auth/prisma-adapter next-auth@beta
npm install bcryptjs @types/bcryptjs
npm install uploadthing @uploadthing/react  # for admin image uploads
# Shop / payments
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

### Fonts in `src/app/layout.tsx`
```tsx
import { Playfair_Display, Libre_Baskerville, Jost } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

const baskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-baskerville',
  display: 'swap',
})

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-jost',
  display: 'swap',
})
```

---

## PART 2 — GLOBAL STYLES (`src/app/globals.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg:           #F7F3EC;
  --surface:      #EDE8DF;
  --deep:         #0D0B08;
  --body:         #2A2520;
  --muted:        #8A7F72;
  --accent:       #6B2737;
  --accent-light: #A03848;
  --gold:         #8B6914;
  --gold-light:   #C9A84C;
  --white:        #FDFAF5;

  --font-playfair:    var(--font-playfair-var, 'Playfair Display', serif);
  --font-baskerville: var(--font-baskerville-var, 'Libre Baskerville', serif);
  --font-jost:        var(--font-jost-var, 'Jost', sans-serif);

  --ease-out-quint: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-reveal:    cubic-bezier(0.77, 0, 0.175, 1);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: auto; }

body {
  background-color: var(--bg);
  color: var(--body);
  font-family: var(--font-baskerville);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Smooth scroll classes for Lenis */
html.lenis { height: auto; }
.lenis.lenis-smooth { scroll-behavior: auto !important; }
.lenis.lenis-stopped { overflow: hidden; }

/* Typography scale */
.display-1 {
  font-family: var(--font-playfair);
  font-size: clamp(4rem, 10vw, 9rem);
  font-weight: 400;
  line-height: 0.92;
  letter-spacing: -0.02em;
}
.display-2 {
  font-family: var(--font-playfair);
  font-size: clamp(2.5rem, 6vw, 5.5rem);
  font-weight: 400;
  line-height: 1.0;
  letter-spacing: -0.01em;
}
.display-3 {
  font-family: var(--font-playfair);
  font-size: clamp(1.8rem, 4vw, 3.5rem);
  font-weight: 400;
  line-height: 1.15;
}
.eyebrow {
  font-family: var(--font-jost);
  font-size: 0.65rem;
  font-weight: 400;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--gold);
}
.body-lg {
  font-family: var(--font-baskerville);
  font-size: 1.125rem;
  line-height: 1.8;
  color: var(--muted);
}
.body-sm {
  font-family: var(--font-baskerville);
  font-size: 0.9375rem;
  line-height: 1.75;
  color: var(--muted);
}
.ui-label {
  font-family: var(--font-jost);
  font-size: 0.7rem;
  font-weight: 400;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

/* Selection */
::selection {
  background: var(--accent);
  color: var(--white);
}

/* Scrollbar */
::-webkit-scrollbar { width: 2px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--gold); }

/* Section divider */
.section-rule {
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, #C9A84C40, transparent);
}

/* Image with illuminated manuscript inset border */
.manuscript-frame {
  position: relative;
}
.manuscript-frame::after {
  content: '';
  position: absolute;
  inset: 8px;
  border: 1px solid rgba(139, 105, 20, 0.18);
  pointer-events: none;
  z-index: 2;
}

/* Marquee */
@keyframes marquee-left {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.marquee-track {
  display: flex;
  width: max-content;
  animation: marquee-left 30s linear infinite;
}
.marquee-track:hover { animation-play-state: paused; }

/* Page transition overlay */
.page-overlay {
  position: fixed;
  inset: 0;
  background: var(--bg);
  z-index: 200;
  pointer-events: none;
}

/* Custom cursor */
.cursor-dot {
  width: 6px; height: 6px;
  background: var(--accent);
  border-radius: 50%;
  position: fixed; top: 0; left: 0;
  pointer-events: none; z-index: 9999;
  transform: translate(-50%, -50%);
  transition: opacity 0.3s;
}
.cursor-ring {
  width: 36px; height: 36px;
  border: 1px solid rgba(107, 39, 55, 0.4);
  border-radius: 50%;
  position: fixed; top: 0; left: 0;
  pointer-events: none; z-index: 9998;
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s, border-color 0.3s;
}

/* Animated underline link */
.link-underline {
  position: relative;
  display: inline-block;
}
.link-underline::after {
  content: '';
  position: absolute;
  bottom: -2px; left: 0;
  width: 0; height: 1px;
  background: var(--accent);
  transition: width 0.4s var(--ease-out-quint);
}
.link-underline:hover::after { width: 100%; }
.link-underline:hover { color: var(--accent); }

/* Form inputs */
.field-input {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(42, 37, 32, 0.2);
  padding: 0.75rem 0;
  font-family: var(--font-baskerville);
  font-size: 1rem;
  color: var(--body);
  outline: none;
  transition: border-color 0.3s;
}
.field-input::placeholder { color: var(--muted); opacity: 0.6; }
.field-input:focus { border-bottom-color: var(--accent); }

.field-textarea {
  width: 100%;
  background: transparent;
  border: 1px solid rgba(42, 37, 32, 0.15);
  padding: 1rem;
  font-family: var(--font-baskerville);
  font-size: 0.9375rem;
  color: var(--body);
  outline: none;
  resize: vertical;
  min-height: 120px;
  transition: border-color 0.3s;
}
.field-textarea:focus { border-color: var(--accent); }

/* Button variants */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  background: var(--accent);
  color: var(--white);
  padding: 1rem 2.5rem;
  font-family: var(--font-jost);
  font-size: 0.7rem;
  font-weight: 400;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  transition: background 0.4s, color 0.4s;
  text-decoration: none;
}
.btn-primary:hover { background: var(--deep); }

.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  background: transparent;
  color: var(--body);
  padding: 0.875rem 2rem;
  font-family: var(--font-jost);
  font-size: 0.7rem;
  font-weight: 400;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  border: 1px solid rgba(42, 37, 32, 0.25);
  cursor: pointer;
  transition: border-color 0.3s, color 0.3s;
  text-decoration: none;
}
.btn-outline:hover { border-color: var(--accent); color: var(--accent); }

.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: transparent;
  color: var(--muted);
  padding: 0;
  font-family: var(--font-jost);
  font-size: 0.7rem;
  font-weight: 400;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  transition: color 0.3s;
  text-decoration: none;
}
.btn-ghost:hover { color: var(--accent); }
.btn-ghost .arrow-line {
  display: block; width: 2rem; height: 1px;
  background: currentColor;
  transition: width 0.3s;
}
.btn-ghost:hover .arrow-line { width: 3rem; }
```

---

## PART 3 — TAILWIND CONFIG (`tailwind.config.ts`)

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#F7F3EC',
        surface: '#EDE8DF',
        deep:    '#0D0B08',
        body:    '#2A2520',
        muted:   '#8A7F72',
        accent:  '#6B2737',
        'accent-light': '#A03848',
        gold:    '#8B6914',
        'gold-light': '#C9A84C',
        ivory:   '#FDFAF5',
      },
      fontFamily: {
        playfair:    ['var(--font-playfair)', 'serif'],
        baskerville: ['var(--font-baskerville)', 'serif'],
        jost:        ['var(--font-jost)', 'sans-serif'],
      },
      spacing: {
        section: 'clamp(6rem, 12vw, 14rem)',
      },
    },
  },
  plugins: [],
}
export default config
```

---

## PART 4 — LAYOUT (`src/app/layout.tsx`)

```tsx
import type { Metadata } from 'next'
import { Playfair_Display, Libre_Baskerville, Jost } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import LenisProvider from '@/components/providers/LenisProvider'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CustomCursor from '@/components/ui/CustomCursor'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})
const baskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-baskerville',
  display: 'swap',
})
const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-jost',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yadahworld.com'),
  title: { default: 'Yadah — The Voice of Jesus Christ to Nations', template: '%s | Yadah' },
  description: 'Yadah Kukeurim Daniel — international gospel music minister, touching millions of lives globally. Book Yadah, explore her music, and encounter the presence of God.',
  openGraph: {
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${baskerville.variable} ${jost.variable}`}>
      <body>
        <LenisProvider>
          <CustomCursor />
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

---

## PART 5 — NAVBAR (`src/components/layout/Navbar.tsx`)

The navbar is minimal, almost invisible. It lives at the top, becomes a thin line on scroll. On dark hero images it shows white text; on the ivory homepage body it shows dark text. Use `useEffect` + `IntersectionObserver` on a hero sentinel element to toggle color mode.

```tsx
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'

const NAV_LINKS = [
  { label: 'Home',       href: '/' },
  { label: 'Media',      href: '/media' },
  { label: 'About',      href: '/about' },
  { label: 'Room For You', href: 'https://rfyglobal.org', external: true },
  { label: 'Contact',    href: '/contact' },
  { label: 'Booking',    href: '/booking' },
  { label: 'Shop',       href: '/shop' },
]

export default function Navbar() {
  const [hidden, setHidden] = useState(false)
  const [atTop, setAtTop]   = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  let lastY = 0

  useMotionValueEvent(scrollY, 'change', (y) => {
    setHidden(y > lastY && y > 80)
    setAtTop(y < 40)
    lastY = y
  })

  return (
    <>
      {/* Main navbar */}
      <motion.header
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.5, ease: [0.77, 0, 0.175, 1] }}
        className={`
          fixed top-0 left-0 right-0 z-50
          flex items-center justify-between
          px-8 md:px-16 py-6
          transition-all duration-700
          ${!atTop ? 'bg-[#F7F3EC]/90 backdrop-blur-md border-b border-[#C9A84C]/15' : 'bg-transparent'}
        `}
      >
        {/* Logotype */}
        <Link href="/" className="relative z-10 group">
          <span
            className="font-playfair text-xl font-normal italic tracking-wide"
            style={{ color: atTop ? 'var(--white)' : 'var(--body)' }}
          >
            Yadah
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-10">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="ui-label link-underline"
                style={{ color: atTop ? 'rgba(253,250,245,0.6)' : 'var(--muted)' }}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="ui-label link-underline"
                style={{ color: atTop ? 'rgba(253,250,245,0.6)' : 'var(--muted)' }}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        {/* Hamburger (mobile) */}
        <button
          onClick={() => setMenuOpen(true)}
          className="lg:hidden flex flex-col gap-[5px] p-2"
          aria-label="Open menu"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-5 h-px transition-colors duration-300"
              style={{ background: atTop ? 'var(--white)' : 'var(--body)' }}
            />
          ))}
        </button>
      </motion.header>

      {/* Mobile menu overlay */}
      <motion.div
        initial={false}
        animate={{ opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? 'all' : 'none' }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[100] bg-[#F7F3EC] flex flex-col items-center justify-center gap-10"
      >
        <button
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
```

---

## PART 6 — HOMEPAGE (`src/app/page.tsx`)

```tsx
import HeroSection        from '@/components/home/HeroSection'
import MantraSection      from '@/components/home/MantraSection'
import AboutSnippet       from '@/components/home/AboutSnippet'
import MusicSection       from '@/components/home/MusicSection'
import VideosSection      from '@/components/home/VideosSection'
import StreamMarquee      from '@/components/home/StreamMarquee'
import UpcomingEvents     from '@/components/home/UpcomingEvents'
import BookingCTA         from '@/components/home/BookingCTA'

export default function Home() {
  return (
    <>
      <HeroSection />
      <MantraSection />
      <AboutSnippet />
      <div className="section-rule mx-16 md:mx-24" />
      <MusicSection />
      <div className="section-rule mx-16 md:mx-24" />
      <VideosSection />
      <StreamMarquee />
      <UpcomingEvents />
      <BookingCTA />
    </>
  )
}
```

---

## PART 7 — HERO SECTION (`src/components/home/HeroSection.tsx`)

The hero is a full-viewport dark image with the artist's name in enormous Playfair Display. The name "Yadah" is split into characters, each revealing with a staggered upward wipe. Below it, a thin serif tagline. The hero background is a full-bleed editorial photograph with a warm vignette overlay (NOT a cold black overlay — use `rgba(13,11,8,0.55)` with a warm tint).

```tsx
'use client'
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Link from 'next/link'

gsap.registerPlugin(ScrollTrigger)

const CHAR_VARIANTS = {
  hidden: { y: '110%', opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: 0.1 + i * 0.055,
      duration: 0.9,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
}

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const imgRef     = useRef<HTMLDivElement>(null)
  const textRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax on background image
      gsap.to(imgRef.current, {
        yPercent: 25,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
      // Text fades as user scrolls into body
      gsap.to(textRef.current, {
        opacity: 0,
        y: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: '30% top',
          end: '70% top',
          scrub: true,
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const chars = 'Yadah'.split('')

  return (
    <section
      ref={sectionRef}
      className="relative h-screen min-h-[700px] overflow-hidden flex flex-col justify-end pb-20 md:pb-28"
    >
      {/* Background */}
      <div
        ref={imgRef}
        className="absolute inset-0 scale-[1.15]"
        style={{
          backgroundImage: `url('/images/hero-yadah.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
        }}
      />
      {/* Warm dark vignette — NOT pure black */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(to top, rgba(13,11,8,0.92) 0%, rgba(13,11,8,0.45) 45%, rgba(13,11,8,0.15) 100%),
            linear-gradient(to right, rgba(13,11,8,0.3) 0%, transparent 60%)
          `,
        }}
      />
      {/* Subtle warm grain */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Content */}
      <div ref={textRef} className="relative z-10 px-8 md:px-20">

        {/* Section number */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="ui-label mb-8 text-[rgba(253,250,245,0.35)]"
        >
          01 — The Voice of Jesus Christ to Nations
        </motion.p>

        {/* Giant name */}
        <h1
          className="display-1 text-[#FDFAF5] mb-6 overflow-hidden"
          aria-label="Yadah"
        >
          {chars.map((char, i) => (
            <span key={i} style={{ display: 'inline-block', overflow: 'hidden' }}>
              <motion.span
                custom={i}
                variants={CHAR_VARIANTS}
                initial="hidden"
                animate="visible"
                style={{ display: 'inline-block' }}
              >
                {char}
              </motion.span>
            </span>
          ))}
        </h1>

        {/* Tagline */}
        <div style={{ overflow: 'hidden' }}>
          <motion.p
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="font-baskerville italic text-[clamp(1rem,2.5vw,1.5rem)] text-[rgba(253,250,245,0.55)] max-w-xl mb-10"
          >
            Gospel music minister · Millions of lives impacted · Abuja, Nigeria
          </motion.p>
        </div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-wrap items-center gap-6"
        >
          <Link href="/booking" className="btn-primary">
            Book Yadah
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <a href="#music" className="btn-ghost" style={{ color: 'rgba(253,250,245,0.5)' }}>
            <span className="arrow-line" />
            Explore Music
          </a>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-10 right-12 flex items-center gap-3"
        style={{ writingMode: 'vertical-rl' }}
      >
        <span className="ui-label text-[rgba(253,250,245,0.25)]">Scroll</span>
        <motion.span
          animate={{ scaleY: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="block w-px h-12 origin-top"
          style={{ background: 'rgba(253,250,245,0.2)' }}
        />
      </motion.div>
    </section>
  )
}
```

---

## PART 8 — MANTRA SECTION (`src/components/home/MantraSection.tsx`)

This is a full-width typographic section — ivory background, the artist's mantra/belief statement in large Playfair italic, centred on the page. No image. Pure typography. Like a page from scripture.

```tsx
'use client'
import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'

const MANTRA_LINES = [
  '"I believe in the one and only true God.',
  'I believe in Christ\'s cross and all',
  'that it is to a believer."',
]

export default function MantraSection() {
  const { ref, inView } = useInView({ threshold: 0.4, triggerOnce: true })

  return (
    <section
      ref={ref}
      className="px-8 md:px-20 py-[clamp(6rem,12vw,14rem)] bg-[var(--bg)]"
    >
      <div className="max-w-4xl mx-auto text-center">
        {/* Section label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="eyebrow mb-12"
        >
          02 — Her Mantra
        </motion.p>

        {/* The lines */}
        {MANTRA_LINES.map((line, i) => (
          <div key={i} style={{ overflow: 'hidden' }}>
            <motion.p
              initial={{ y: '100%', opacity: 0 }}
              animate={inView ? { y: 0, opacity: 1 } : {}}
              transition={{
                delay: 0.1 + i * 0.15,
                duration: 0.9,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="font-playfair italic text-[clamp(1.5rem,3.5vw,2.8rem)] text-[var(--body)] leading-[1.3] mb-1"
            >
              {line}
            </motion.p>
          </div>
        ))}

        {/* Attribution */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="font-jost text-xs tracking-[0.2em] uppercase text-[var(--muted)] mt-8"
        >
          — Yadah Kukeurim Daniel
        </motion.p>

        {/* Decorative rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ delay: 0.9, duration: 1.2, ease: [0.77, 0, 0.175, 1] }}
          className="h-px max-w-[120px] mx-auto mt-10 origin-center"
          style={{ background: 'var(--gold-light)', opacity: 0.4 }}
        />
      </div>
    </section>
  )
}
```

---

## PART 9 — ABOUT SNIPPET (`src/components/home/AboutSnippet.tsx`)

Asymmetric two-column layout. Left: editorial portrait (tall, vertical, manuscript frame). Right: section number, large headline with one italic word in oxblood, bio paragraph, stat row, CTA. On mobile, image comes second (after text).

```tsx
'use client'
import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function AboutSnippet() {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true })

  return (
    <section ref={ref} className="px-8 md:px-20 py-[clamp(6rem,12vw,14rem)]">
      <div className="max-w-screen-xl mx-auto grid md:grid-cols-[5fr_7fr] gap-16 md:gap-24 items-center">

        {/* Image */}
        <motion.div
          initial={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)' }}
          animate={inView ? { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' } : {}}
          transition={{ duration: 1.4, ease: [0.77, 0, 0.175, 1] }}
          className="manuscript-frame relative aspect-[3/4] overflow-hidden order-2 md:order-1"
        >
          <img
            src="/images/yadah-editorial.jpg"
            alt="Minister Yadah"
            className="w-full h-full object-cover object-top"
          />
        </motion.div>

        {/* Text */}
        <div className="order-1 md:order-2">
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="eyebrow mb-8"
          >
            03 — The Artist
          </motion.p>

          <div style={{ overflow: 'hidden' }} className="mb-2">
            <motion.h2
              initial={{ y: '100%' }}
              animate={inView ? { y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="display-2 text-[var(--body)]"
            >
              A Voice Sent
            </motion.h2>
          </div>
          <div style={{ overflow: 'hidden' }} className="mb-10">
            <motion.h2
              initial={{ y: '100%' }}
              animate={inView ? { y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="display-2 font-playfair italic text-[var(--accent)]"
            >
              From Heaven.
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="body-lg max-w-md mb-10"
          >
            Yadah Kukeurim Daniel is a Nigerian singer, songwriter, and minister of the gospel.
            Her music — rooted in God's love and grace — has touched hearts on every continent,
            drawing lives into worship and leading souls into the
            presence of God.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 }}
            className="flex gap-10 mb-12 pb-10 border-b border-[var(--gold-light)]/20"
          >
            {[
              { n: 'Millions', label: 'Lives impacted' },
              { n: '600K+', label: 'Followers' },
              { n: '7+',    label: 'Years of Ministry' },
            ].map(({ n, label }) => (
              <div key={label}>
                <p className="font-playfair text-[2.5rem] font-normal text-[var(--accent)] leading-none mb-1">{n}</p>
                <p className="ui-label text-[var(--muted)]">{label}</p>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.8 }}
          >
            <Link href="/about" className="btn-ghost">
              <span className="arrow-line" />
              Read Her Story
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
```

---

## PART 10 — MUSIC SECTION (`src/components/home/MusicSection.tsx`)

The music section has a large section title, then a horizontal row of release cards. Each card is minimal — album art (square, manuscript-framed), title in Playfair, type + year in Jost. No genre-typical neon. On hover, the card lifts slightly (`translateY(-4px)`) with a gentle shadow.

```tsx
'use client'
import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'
import Link from 'next/link'

const RELEASES = [
  { title: 'Never Seen (Live)',     feat: 'ft. Sunmisola Agbebi', type: 'Single', year: '2024', cover: '/images/releases/never-seen.jpg',    spotify: '#', isNew: true },
  { title: 'Fathered By The Best', feat: '',                      type: 'Album',  year: '2023', cover: '/images/releases/fathered.jpg',       spotify: '#', isNew: false },
  { title: 'Onye Nwere Jesus',      feat: '',                      type: 'Single', year: '2023', cover: '/images/releases/onye-nwere-jesus.jpg', spotify: '#', isNew: false },
  { title: 'Beyond Me',             feat: '',                      type: 'Single', year: '2022', cover: '/images/releases/beyond-me.jpg',      spotify: '#', isNew: false },
]

export default function MusicSection() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })

  return (
    <section id="music" ref={ref} className="px-8 md:px-20 py-[clamp(6rem,12vw,14rem)]">
      {/* Header row */}
      <div className="max-w-screen-xl mx-auto flex items-end justify-between mb-16">
        <div>
          <p className="eyebrow mb-6">04 — The Sound</p>
          <h2 className="display-2 text-[var(--body)]">
            Recent<br />
            <em className="font-playfair italic">Releases.</em>
          </h2>
        </div>
        <Link href="/media" className="btn-ghost hidden md:flex">
          <span className="arrow-line" />
          All Releases
        </Link>
      </div>

      {/* Cards grid */}
      <div className="max-w-screen-xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {RELEASES.map((release, i) => (
          <motion.a
            key={release.title}
            href={release.spotify}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.1, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ y: -4 }}
            className="group block"
            style={{ textDecoration: 'none' }}
          >
            {/* Album art */}
            <div
              className="manuscript-frame relative aspect-square overflow-hidden mb-4"
              style={{ boxShadow: '0 4px 24px rgba(13,11,8,0.08)' }}
            >
              <img
                src={release.cover}
                alt={release.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              {/* NEW label */}
              {release.isNew && (
                <span
                  className="absolute top-3 left-3 ui-label px-2 py-1 text-[10px]"
                  style={{ background: 'var(--accent)', color: 'var(--white)' }}
                >
                  New
                </span>
              )}
            </div>
            <p
              className="font-playfair text-base font-normal leading-snug mb-1 group-hover:text-[var(--accent)] transition-colors"
              style={{ color: 'var(--body)' }}
            >
              {release.title}
              {release.feat && (
                <span className="font-baskerville italic text-sm" style={{ color: 'var(--muted)' }}>
                  {' '}{release.feat}
                </span>
              )}
            </p>
            <p className="ui-label" style={{ color: 'var(--muted)' }}>
              {release.type} · {release.year}
            </p>
          </motion.a>
        ))}
      </div>
    </section>
  )
}
```

---

## PART 11 — STREAM MARQUEE (`src/components/home/StreamMarquee.tsx`)

A full-width marquee strip with a warm surface background. Text: song titles and stream count in alternating Playfair italic and Jost. A thin gold rule above and below.

```tsx
export default function StreamMarquee() {
  const items = [
    'Beyond Me', '· Lives impacted ·', 'Onye Nwere Jesus', '· God in All Seasons ·',
    'Fathered By The Best', '· Never Seen ·', 'Free of Charge', '· Na Your Hand ·',
  ]

  return (
    <section style={{ background: 'var(--surface)' }} className="py-6 overflow-hidden border-y border-[var(--gold-light)]/20">
      <div className="marquee-track">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="px-8 whitespace-nowrap">
            {item.startsWith('·') ? (
              <span className="ui-label" style={{ color: 'var(--gold)' }}>{item}</span>
            ) : (
              <span className="font-playfair italic text-lg" style={{ color: 'var(--body)', opacity: 0.5 }}>{item}</span>
            )}
          </span>
        ))}
      </div>
    </section>
  )
}
```

---

## PART 12 — BOOKING CTA (`src/components/home/BookingCTA.tsx`)

A full-bleed section with a dark background image (concert/worship photo), a warm overlay, and the booking invitation as large centred Playfair text. The CTA button is the outline variant (white border on dark background).

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
      className="relative py-[clamp(8rem,16vw,18rem)] px-8 md:px-20 overflow-hidden"
    >
      {/* BG image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url('/images/yadah-worship.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(13,11,8,0.85), rgba(13,11,8,0.75))',
        }}
      />

      {/* Gold rule top */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.6, ease: [0.77, 0, 0.175, 1] }}
        className="absolute top-16 left-20 right-20 h-px origin-left"
        style={{ background: 'rgba(201,168,76,0.25)' }}
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="eyebrow mb-10 text-[var(--gold-light)] opacity-60"
        >
          07 — Invite Yadah
        </motion.p>

        {["Yadah is always", "glad to be", "a blessing."].map((line, i) => (
          <div key={i} style={{ overflow: 'hidden' }}>
            <motion.p
              initial={{ y: '110%' }}
              animate={inView ? { y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.12, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="font-playfair font-normal leading-[1.1] text-[#FDFAF5]"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}
            >
              {i === 2 ? <em className="italic" style={{ color: 'var(--gold-light)' }}>{line}</em> : line}
            </motion.p>
          </div>
        ))}

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="font-baskerville italic text-[rgba(253,250,245,0.45)] text-lg mt-8 mb-12"
        >
          Concert · Church Conference · Worship Night · Album Launch
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
        >
          <Link
            href="/booking"
            className="inline-flex items-center gap-4 border text-[var(--white)] px-10 py-5 font-jost text-[0.7rem] tracking-[0.2em] uppercase hover:bg-[var(--white)] hover:text-[var(--accent)] transition-all duration-500"
            style={{ borderColor: 'rgba(253,250,245,0.3)' }}
          >
            Submit Booking Request
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
```

---

## PART 13 — BOOKING PAGE & FORM

The booking page has the same multi-step structure but re-skinned completely for the ivory/warm aesthetic. All inputs use `field-input` (bottom-border only). The progress indicator is a thin horizontal line divided into 4 segments, filled with gold as steps complete.

### `src/app/booking/page.tsx`
```tsx
import BookingForm from '@/components/booking/BookingForm'

export const metadata = { title: 'Booking' }

export default function BookingPage() {
  return (
    <div className="min-h-screen pt-40 pb-32 px-8 md:px-20" style={{ background: 'var(--bg)' }}>
      <div className="max-w-screen-lg mx-auto">
        {/* Page header */}
        <div className="mb-20">
          <p className="eyebrow mb-6">Invitations</p>
          <h1 className="display-1 text-[var(--body)] mb-6">
            Book<br />
            <em className="font-playfair italic text-[var(--accent)]">Yadah.</em>
          </h1>
          <p className="body-lg max-w-lg">
            Yadah is always glad to be a blessing to the body of Christ.
            Please provide all necessary information about your event below.
          </p>
          <p className="ui-label mt-3" style={{ color: 'var(--muted)' }}>
            Note: This form is for scheduling purposes only and does not confirm an event.
          </p>
        </div>

        {/* Gold divider */}
        <div className="h-px mb-16" style={{ background: 'var(--gold-light)', opacity: 0.25 }} />

        <BookingForm />
      </div>
    </div>
  )
}
```

### `src/components/booking/BookingForm.tsx`

Re-implement the 4-step form using `field-input` classes, bottom-border style inputs, Zod per-step validation (safeParse approach as in the existing implementation), and this step indicator:

```tsx
{/* Step indicator */}
<div className="flex gap-2 mb-12">
  {['Contact', 'Organisation', 'Event', 'Confirm'].map((label, i) => (
    <div key={label} className="flex-1">
      <div
        className="h-px mb-2 transition-all duration-700"
        style={{ background: i <= currentStep ? 'var(--accent)' : 'rgba(42,37,32,0.12)' }}
      />
      <p className="ui-label" style={{ color: i <= currentStep ? 'var(--accent)' : 'var(--muted)' }}>
        {String(i + 1).padStart(2, '0')} {label}
      </p>
    </div>
  ))}
</div>
```

All `<input>` elements use `className="field-input"`. All `<textarea>` elements use `className="field-textarea"`. Field labels use `className="ui-label mb-2 block"`. Error messages use `className="font-jost text-xs text-[var(--accent)] mt-1"`.

Submit button: `className="btn-primary mt-8"`.
Back button: `className="btn-ghost"`.
Continue button: `className="btn-outline"`.

The success state shows:
```tsx
<div className="py-20">
  <div className="w-12 h-12 border border-[var(--gold)] flex items-center justify-center mb-8">
    <span className="font-playfair text-xl text-[var(--gold)]">✓</span>
  </div>
  <h2 className="display-3 text-[var(--body)] mb-4">Request Received.</h2>
  <p className="body-lg max-w-sm">
    Thank you. Yadah's management will review your request and be in touch
    at the soonest possible time. God bless you.
  </p>
</div>
```

---

## PART 14 — CONTACT PAGE (`src/app/contact/page.tsx`)

The contact page is a clean single-column form with the artist's contact details alongside.

```tsx
'use client'
import ContactForm from '@/components/contact/ContactForm'

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-40 pb-32 px-8 md:px-20" style={{ background: 'var(--bg)' }}>
      <div className="max-w-screen-lg mx-auto">
        <p className="eyebrow mb-6">Get in Touch</p>
        <h1 className="display-2 text-[var(--body)] mb-20">Contact.</h1>

        <div className="grid md:grid-cols-[3fr_5fr] gap-20">
          {/* Contact details */}
          <div>
            <p className="body-sm mb-8">
              For general enquiries, press, partnerships, or questions about Yadah's ministry.
              For event bookings, please use the{' '}
              <a href="/booking" className="link-underline text-[var(--accent)]">Booking page</a>.
            </p>
            <div className="flex flex-col gap-6">
              {[
                { label: 'Location', value: 'Abuja, Nigeria' },
                { label: 'Phone',    value: '+234 808 188 1365' },
                { label: 'Email',    value: 'yadahsings@gmail.com' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="eyebrow mb-1">{label}</p>
                  <p className="font-baskerville text-[var(--body)]">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <ContactForm />
        </div>
      </div>
    </div>
  )
}
```

### `src/components/contact/ContactForm.tsx`

```tsx
'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'

const schema = z.object({
  name:    z.string().min(2, 'Name required'),
  email:   z.string().email('Valid email required'),
  subject: z.string().min(2, 'Subject required'),
  message: z.string().min(10, 'Message required'),
})
type FormData = z.infer<typeof schema>

export default function ContactForm() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12">
        <p className="font-playfair text-2xl italic text-[var(--body)] mb-4">Message sent.</p>
        <p className="body-sm">Thank you for reaching out. We will be in touch shortly.</p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      {[
        { id: 'name',    label: 'Your Name',    type: 'text',  placeholder: 'Full name' },
        { id: 'email',   label: 'Email Address', type: 'email', placeholder: 'your@email.com' },
        { id: 'subject', label: 'Subject',       type: 'text',  placeholder: 'How can we help?' },
      ].map(({ id, label, type, placeholder }) => (
        <div key={id}>
          <label className="ui-label mb-2 block" style={{ color: 'var(--muted)' }}>{label}</label>
          <input
            {...register(id as any)}
            type={type}
            placeholder={placeholder}
            className="field-input"
          />
          {errors[id as keyof FormData] && (
            <p className="font-jost text-xs mt-1" style={{ color: 'var(--accent)' }}>
              {errors[id as keyof FormData]?.message}
            </p>
          )}
        </div>
      ))}
      <div>
        <label className="ui-label mb-2 block" style={{ color: 'var(--muted)' }}>Message</label>
        <textarea {...register('message')} placeholder="Your message…" className="field-textarea" />
        {errors.message && (
          <p className="font-jost text-xs mt-1" style={{ color: 'var(--accent)' }}>{errors.message.message}</p>
        )}
      </div>
      <button type="submit" disabled={loading} className="btn-primary self-start">
        {loading ? 'Sending…' : 'Send Message'}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </form>
  )
}
```

---

## PART 15 — FOOTER (`src/components/layout/Footer.tsx`)

```tsx
import Link from 'next/link'

const FOOTER_COLS = [
  {
    heading: 'Navigate',
    links: [
      { label: 'Home',          href: '/' },
      { label: 'Media',         href: '/media' },
      { label: 'About',         href: '/about' },
      { label: 'Contact',       href: '/contact' },
      { label: 'Booking',       href: '/booking' },
      { label: 'Shop',          href: '/shop' },
    ],
  },
  {
    heading: 'Events',
    links: [
      { label: 'Room For You',  href: 'https://rfyglobal.org', external: true },
      { label: 'Campus Tour',   href: '/campus-tour' },
      { label: 'Upcoming',      href: '/#events' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy',    href: '/privacy-policy' },
      { label: 'Refund & Returns',  href: '/refund-policy' },
      { label: 'About SonsHub',     href: 'https://sonshubmedia.com', external: true },
    ],
  },
]

const SOCIALS = [
  { label: 'IG',  href: 'https://instagram.com/ministersings' },
  { label: 'YT',  href: 'https://youtube.com/@yadah' },
  { label: 'SP',  href: 'https://open.spotify.com/artist/xxx' },
  { label: 'FB',  href: 'https://facebook.com/yadahsings' },
  { label: 'X',   href: 'https://x.com/ministeryadah' },
]

export default function Footer() {
  return (
    <footer
      className="border-t px-8 md:px-20 pt-20 pb-10"
      style={{ background: 'var(--surface)', borderColor: 'rgba(201,168,76,0.18)' }}
    >
      <div className="max-w-screen-xl mx-auto">
        <div className="grid md:grid-cols-[4fr_2fr_2fr_2fr] gap-12 md:gap-16 mb-16">
          {/* Brand */}
          <div>
            <Link href="/">
              <span className="font-playfair text-3xl italic" style={{ color: 'var(--body)' }}>
                Yadah
              </span>
            </Link>
            <p className="body-sm mt-4 max-w-xs">
              The Voice of Jesus Christ to Nations. Gospel music minister based in Abuja, Nigeria.
            </p>
            <div className="flex gap-4 mt-8">
              {SOCIALS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ui-label link-underline"
                  style={{ color: 'var(--muted)' }}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map((col) => (
            <div key={col.heading}>
              <p className="eyebrow mb-6">{col.heading}</p>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {'external' in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="body-sm link-underline"
                        style={{ color: 'var(--muted)' }}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="body-sm link-underline"
                        style={{ color: 'var(--muted)' }}
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

        {/* Bottom */}
        <div
          className="pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-t"
          style={{ borderColor: 'rgba(201,168,76,0.15)' }}
        >
          <p className="ui-label" style={{ color: 'var(--muted)' }}>
            © {new Date().getFullYear()} Yadah. Powered & managed by{' '}
            <a
              href="https://sonshubmedia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline"
              style={{ color: 'var(--accent)' }}
            >
              SonsHub Media
            </a>
          </p>
          <p className="ui-label" style={{ color: 'var(--muted)', opacity: 0.5 }}>
            yadahsings@gmail.com · +234 808 188 1365
          </p>
        </div>
      </div>
    </footer>
  )
}
```

---

## PART 16 — ADMIN DASHBOARD

The admin is a protected area at `/admin` with its own layout. It uses NextAuth for authentication (single admin user — credentials provider), Prisma for data, and UploadThing for image uploads.

### Admin routes structure
```
src/app/admin/
├── layout.tsx            # Admin shell layout (sidebar nav)
├── page.tsx              # Dashboard overview (stats cards)
├── login/page.tsx        # Login page
├── bookings/
│   ├── page.tsx          # Booking requests list
│   └── [id]/page.tsx     # Single booking detail + status update
├── messages/
│   └── page.tsx          # Contact messages list
├── media/
│   └── page.tsx          # Upload/manage photos and videos
├── releases/
│   ├── page.tsx          # Releases list
│   └── new/page.tsx      # Add release
├── events/
│   ├── page.tsx          # Events list
│   └── new/page.tsx      # Add event
└── settings/
    └── page.tsx          # Site settings (bio text, contact info)
```

### Admin layout (`src/app/admin/layout.tsx`)

```tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  return (
    <div className="min-h-screen flex" style={{ background: '#F0EBE1', fontFamily: 'var(--font-jost)' }}>
      <AdminSidebar />
      <main className="flex-1 p-8 md:p-12">
        {children}
      </main>
    </div>
  )
}
```

### Admin sidebar (`src/components/admin/AdminSidebar.tsx`)

```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const ADMIN_LINKS = [
  { label: 'Overview',   href: '/admin',            icon: '◉' },
  { label: 'Bookings',   href: '/admin/bookings',   icon: '◈' },
  { label: 'Messages',   href: '/admin/messages',   icon: '◇' },
  { label: 'Media',      href: '/admin/media',      icon: '◫' },
  { label: 'Releases',   href: '/admin/releases',   icon: '◎' },
  { label: 'Events',     href: '/admin/events',     icon: '◆' },
  { label: 'Settings',   href: '/admin/settings',   icon: '◻' },
]

export default function AdminSidebar() {
  const path = usePathname()

  return (
    <aside
      className="w-64 min-h-screen flex flex-col px-6 py-8 border-r"
      style={{ background: '#EDE8DF', borderColor: 'rgba(201,168,76,0.2)' }}
    >
      <div className="mb-12">
        <p className="font-playfair text-2xl italic" style={{ color: 'var(--body)' }}>Yadah</p>
        <p className="ui-label mt-1" style={{ color: 'var(--muted)' }}>Admin Dashboard</p>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {ADMIN_LINKS.map(({ label, href, icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded transition-colors"
            style={{
              background: path === href ? 'rgba(107,39,55,0.08)' : 'transparent',
              color: path === href ? 'var(--accent)' : 'var(--muted)',
            }}
          >
            <span className="text-sm">{icon}</span>
            <span className="ui-label">{label}</span>
          </Link>
        ))}
      </nav>

      <button
        onClick={() => signOut({ callbackUrl: '/admin/login' })}
        className="btn-ghost mt-8 self-start"
        style={{ color: 'var(--muted)' }}
      >
        Sign Out
      </button>
    </aside>
  )
}
```

### Admin overview (`src/app/admin/page.tsx`)

```tsx
import { prisma } from '@/lib/prisma'

export default async function AdminOverview() {
  const [bookings, messages, pendingBookings] = await Promise.all([
    prisma.bookingRequest.count(),
    prisma.contactMessage.count(),
    prisma.bookingRequest.count({ where: { status: 'PENDING' } }),
  ])

  const stats = [
    { label: 'Total Bookings',    value: bookings,        note: `${pendingBookings} pending` },
    { label: 'Messages',          value: messages,        note: 'Unread' },
  ]

  return (
    <div>
      <h1 className="font-playfair text-3xl font-normal mb-2" style={{ color: 'var(--body)' }}>Overview</h1>
      <p className="ui-label mb-12" style={{ color: 'var(--muted)' }}>Welcome back.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {stats.map(({ label, value, note }) => (
          <div
            key={label}
            className="p-6 border"
            style={{ background: 'var(--bg)', borderColor: 'rgba(201,168,76,0.2)' }}
          >
            <p className="font-playfair text-4xl font-normal mb-1" style={{ color: 'var(--accent)' }}>
              {value}
            </p>
            <p className="ui-label mb-1" style={{ color: 'var(--body)' }}>{label}</p>
            <p className="ui-label" style={{ color: 'var(--muted)', opacity: 0.6 }}>{note}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Admin bookings list (`src/app/admin/bookings/page.tsx`)

```tsx
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function BookingsPage() {
  const bookings = await prisma.bookingRequest.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <h1 className="font-playfair text-3xl mb-8" style={{ color: 'var(--body)' }}>Booking Requests</h1>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ fontFamily: 'var(--font-jost)' }}>
          <thead>
            <tr className="border-b" style={{ borderColor: 'rgba(201,168,76,0.2)' }}>
              {['Date', 'Name', 'Organisation', 'Event', 'Event Date', 'Status', ''].map((h) => (
                <th key={h} className="text-left pb-3 pr-6 ui-label" style={{ color: 'var(--muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr
                key={b.id}
                className="border-b hover:bg-[var(--surface)] transition-colors"
                style={{ borderColor: 'rgba(42,37,32,0.06)' }}
              >
                <td className="py-4 pr-6 text-sm" style={{ color: 'var(--muted)' }}>
                  {new Date(b.createdAt).toLocaleDateString('en-GB')}
                </td>
                <td className="py-4 pr-6 text-sm font-medium" style={{ color: 'var(--body)' }}>{b.fullName}</td>
                <td className="py-4 pr-6 text-sm" style={{ color: 'var(--muted)' }}>{b.churchName}</td>
                <td className="py-4 pr-6 text-sm" style={{ color: 'var(--body)' }}>{b.eventName}</td>
                <td className="py-4 pr-6 text-sm" style={{ color: 'var(--muted)' }}>
                  {new Date(b.eventDate).toLocaleDateString('en-GB')}
                </td>
                <td className="py-4 pr-6">
                  <span
                    className="ui-label px-2 py-1 text-[10px]"
                    style={{
                      background: b.status === 'PENDING' ? 'rgba(139,105,20,0.1)' :
                                  b.status === 'CONFIRMED' ? 'rgba(40,100,40,0.1)' :
                                  'rgba(107,39,55,0.1)',
                      color: b.status === 'PENDING' ? 'var(--gold)' :
                             b.status === 'CONFIRMED' ? '#2D6A2D' :
                             'var(--accent)',
                    }}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="py-4">
                  <Link href={`/admin/bookings/${b.id}`} className="btn-ghost text-xs">
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

### Auth setup (`src/lib/auth.ts`)

```ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (
          credentials?.email    === process.env.ADMIN_EMAIL &&
          credentials?.password === process.env.ADMIN_PASSWORD
        ) {
          return { id: '1', email: credentials.email, name: 'Admin' }
        }
        return null
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
}
```

Add to `.env.local`:
```env
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD=your_secure_password
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
NEXTAUTH_URL=https://yadahworld.com
```

---

## PART 17 — SHOP & STRIPE PAYMENTS

### Prisma schema additions

```prisma
model Product {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  name        String
  description String?
  price       Int      // in kobo/cents
  currency    String   @default("NGN")
  images      String[] // Cloudinary URLs
  category    String?  // merch, music, etc.
  inStock     Boolean  @default(true)
  stripeId    String?  // Stripe product ID
  slug        String   @unique

  orders      OrderItem[]
}

model Order {
  id          String      @id @default(cuid())
  createdAt   DateTime    @default(now())
  customerName  String
  customerEmail String
  amount      Int
  currency    String
  status      OrderStatus @default(PENDING)
  stripePaymentIntentId String?
  items       OrderItem[]
}

model OrderItem {
  id        String  @id @default(cuid())
  order     Order   @relation(fields: [orderId], references: [id])
  orderId   String
  product   Product @relation(fields: [productId], references: [id])
  productId String
  quantity  Int
  price     Int
}

enum OrderStatus {
  PENDING
  PAID
  SHIPPED
  DELIVERED
  CANCELLED
}
```

### Shop page (`src/app/shop/page.tsx`)

```tsx
import { prisma } from '@/lib/prisma'
import ShopGrid from '@/components/shop/ShopGrid'

export const metadata = { title: 'Shop' }

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    where: { inStock: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen pt-40 pb-32 px-8 md:px-20" style={{ background: 'var(--bg)' }}>
      <div className="max-w-screen-xl mx-auto">
        <p className="eyebrow mb-6">The Store</p>
        <h1 className="display-2 text-[var(--body)] mb-20">
          Shop<br />
          <em className="font-playfair italic text-[var(--accent)]">Yadah.</em>
        </h1>
        <ShopGrid products={products} />
      </div>
    </div>
  )
}
```

### Stripe checkout API (`src/app/api/checkout/route.ts`)

```ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

export async function POST(req: NextRequest) {
  const { items, customerEmail } = await req.json()

  const lineItems = items.map((item: { name: string; price: number; quantity: number; image?: string }) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
        images: item.image ? [item.image] : [],
      },
      unit_amount: item.price,
    },
    quantity: item.quantity,
  }))

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    customer_email: customerEmail,
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/shop`,
    metadata: { source: 'yadahworld' },
  })

  return NextResponse.json({ url: session.url })
}
```

Add to `.env.local`:
```env
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

## PART 18 — PRISMA SCHEMA (complete)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model BookingRequest {
  id                 String        @id @default(cuid())
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt
  fullName           String
  email              String
  phone              String
  churchName         String
  website            String?
  orgAddress         String
  orgPhone           String
  orgEmail           String
  eventName          String
  natureOfEvent      String
  whatExpected       String
  expectationDetails String
  eventDate          DateTime
  eventTime          String
  eventAddress       String
  additionalInfo     String?
  status             BookingStatus @default(PENDING)
  adminNotes         String?
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

model Product {
  id          String      @id @default(cuid())
  createdAt   DateTime    @default(now())
  name        String
  description String?
  price       Int
  currency    String      @default("NGN")
  images      String[]
  category    String?
  inStock     Boolean     @default(true)
  stripeId    String?
  slug        String      @unique
  orders      OrderItem[]
}

model Order {
  id              String      @id @default(cuid())
  createdAt       DateTime    @default(now())
  customerName    String
  customerEmail   String
  amount          Int
  currency        String
  status          OrderStatus @default(PENDING)
  stripePaymentId String?
  items           OrderItem[]
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  price     Int
}

model SiteRelease {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  title     String
  feat      String?
  type      String   // Single, EP, Album
  year      String
  cover     String   // Cloudinary URL
  spotify   String?
  apple     String?
  youtube   String?
  isNew     Boolean  @default(false)
  order     Int      @default(0)
}

model SiteEvent {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  title       String
  description String?
  date        DateTime
  location    String
  link        String?
  isActive    Boolean  @default(true)
}

enum BookingStatus {
  PENDING
  REVIEWING
  CONFIRMED
  DECLINED
}

enum OrderStatus {
  PENDING
  PAID
  SHIPPED
  DELIVERED
  CANCELLED
}
```

---

## PART 19 — ENVIRONMENT VARIABLES (`.env.example`)

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:pass@host/yadahworld?sslmode=require"

# Auth
NEXTAUTH_SECRET="generate: openssl rand -base64 32"
NEXTAUTH_URL="https://yadahworld.com"
ADMIN_EMAIL="admin@yadahworld.com"
ADMIN_PASSWORD="strong_password_here"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_key"
CLOUDINARY_API_SECRET="your_secret"

# Resend (email)
RESEND_API_KEY="re_xxxxxxxxxxxx"
RESEND_FROM_BOOKING="Yadah Booking <noreply@yadahworld.com>"
RESEND_FROM_CONTACT="Yadah <noreply@yadahworld.com>"
RESEND_NOTIFY_EMAIL="yadahsings@gmail.com"

# Stripe
STRIPE_SECRET_KEY="sk_live_xxxxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"

# App
NEXT_PUBLIC_SITE_URL="https://yadahworld.com"
```

---

## PART 20 — WHAT TO DELETE / REPLACE

Delete or replace these files from the previous implementation:

1. **`src/app/globals.css`** — replace entirely with the CSS in Part 2
2. **`tailwind.config.ts`** — replace entirely with Part 3
3. **`src/app/layout.tsx`** — replace fonts and body with Part 4
4. All files in **`src/components/home/`** — replace with Parts 7–12
5. **`src/components/layout/Navbar.tsx`** — replace with Part 5
6. **`src/components/layout/Footer.tsx`** — replace with Part 15
7. **`src/app/booking/page.tsx`** and **`src/components/booking/BookingForm.tsx`** — restyle with Part 13
8. **`src/app/contact/page.tsx`** and **`src/components/contact/ContactForm.tsx`** — replace with Part 14

Keep: `LenisProvider.tsx`, `CustomCursor.tsx`, API routes (just restyle responses), Prisma lib, image placeholders lib.

---

## PART 21 — IMAGE REQUIREMENTS

| Path | Description |
|------|-------------|
| `/images/hero-yadah.jpg` | Best editorial full-bleed portrait — warm tones, not concert crowd |
| `/images/yadah-editorial.jpg` | Tall portrait (3:4) for About snippet — clean background preferred |
| `/images/yadah-about.jpg` | About page hero portrait |
| `/images/yadah-worship.jpg` | Worship/concert atmosphere for Booking CTA background |
| `/images/releases/never-seen.jpg` | Album art |
| `/images/releases/fathered.jpg` | Album art |
| `/images/releases/onye-nwere-jesus.jpg` | Single art |
| `/images/releases/beyond-me.jpg` | Single art |
| `/images/videos/never-seen-thumb.jpg` | Video thumbnail |
| `/images/videos/na-your-hand-thumb.jpg` | Video thumbnail |

All managed via Cloudinary. Use `next-cloudinary`'s `CldImage` component for automatic optimization, WebP delivery, and blur placeholders.

---

## DESIGN SUMMARY

| Decision | Choice | Reason |
|----------|--------|--------|
| Color scheme | Warm ivory light theme | Light = divine presence; maturity; intimacy |
| Primary accent | Deep oxblood `#6B2737` | Ancient, sacred, weighted — not pop/commercial |
| Gold | Antique `#8B6914` | Decorative, not garish; illuminated manuscript |
| Display font | Playfair Display | Authoritative, classic, literary — not trendy |
| Body font | Libre Baskerville | Warm, readable, editorial — feels like a book |
| UI font | Jost | Clean, minimal, never competes with serifs |
| No pink/magenta | Removed entirely | Wrong energy for a minister |
| Layout | Numbered liturgical sections | Tells a story, creates reverence |
| Motion | Slow, reverent, wipe-based | Feels like pages turning, not UI bouncing |
| Cursor | Oxblood dot + ring | Subtle brand presence |
| Admin | NextAuth + Prisma | Secure, simple, no third-party CMS overhead |
| Payments | Stripe Checkout | Best DX, handles receipts/webhooks automatically |
