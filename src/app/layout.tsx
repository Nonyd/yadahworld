import type { Metadata } from 'next'
import { Playfair_Display, Jost } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import SessionProvider from '@/components/providers/SessionProvider'
import './globals.css'

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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yadahworld.com'),
  title: { default: 'Yadah — The Voice of Jesus Christ to Nations', template: '%s | Yadah' },
  description:
    'Yadah Kukeurim Daniel — international gospel music minister, 100M+ streams. Book Yadah, explore her music, and encounter the presence of God.',
  openGraph: {
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${jost.variable}`}>
      <body>
        <SessionProvider>{children}</SessionProvider>
        <Analytics />
      </body>
    </html>
  )
}
