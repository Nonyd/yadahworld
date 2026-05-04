import type { Metadata } from 'next'
import { Cormorant_Garamond, Libre_Baskerville, Playfair_Display, Jost } from 'next/font/google'
import SessionProvider from '@/components/providers/SessionProvider'
import ThemeProvider from '@/components/providers/ThemeProvider'
import SiteCookieConsent from '@/components/consent/SiteCookieConsent'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})
const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-jost',
  display: 'swap',
})
const baskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-baskerville',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yadahworld.com'),
  title: { default: 'Yadah — The Voice of Jesus Christ to Nations', template: '%s | Yadah' },
  description:
    'Yadah Kukeurim Daniel — international gospel music minister, touching millions of lives globally. Book Yadah, explore her music, and encounter the presence of God.',
  openGraph: {
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${playfair.variable} ${jost.variable} ${baskerville.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
        <SiteCookieConsent />
      </body>
    </html>
  )
}
