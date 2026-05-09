import type { Metadata } from 'next'
import { Cormorant_Garamond, Libre_Baskerville, Playfair_Display, Jost } from 'next/font/google'
import SessionProvider from '@/components/providers/SessionProvider'
import ThemeProvider from '@/components/providers/ThemeProvider'
import { CartProvider } from '@/components/shop/CartProvider'
import SiteCookieConsent from '@/components/consent/SiteCookieConsent'
import PersonSchema from '@/components/seo/PersonSchema'
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://yadahworld.com'),
  icons: {
    icon: [{ url: '/icon.png', type: 'image/png' }],
    apple: [{ url: '/apple-icon.png', type: 'image/png' }],
  },
  title: {
    default: 'Yadah — The Voice of Jesus to Nations',
    template: '%s | Yadah',
  },
  description:
    'Yadah Kukeurim Daniel is a leading Nigerian female gospel music minister, singer, and songwriter. One of the top worship ministers in Nigeria with millions of lives impacted globally.',
  keywords: [
    'Yadah',
    'Yadah gospel',
    'Nigerian gospel artist',
    'female gospel music minister',
    'top gospel music ministers in Nigeria',
    'top female gospel music ministers',
    'gospel artist in Nigeria',
    'top worship ministers in Nigeria',
    'Nigerian gospel singer',
    'Yadah Kukeurim Daniel',
    'SonsHub Media',
    'Beyond Me',
    'Never Seen',
    'Onye Nwere Jesus',
    'God in All Seasons',
  ],
  authors: [{ name: 'Yadah Kukeurim Daniel', url: 'https://yadahworld.com' }],
  creator: 'Yadah Kukeurim Daniel',
  publisher: 'SonsHub Media',
  openGraph: {
    type: 'profile',
    locale: 'en_US',
    url: 'https://yadahworld.com',
    siteName: 'Yadah',
    title: 'Yadah — The Voice of Jesus to Nations',
    description:
      'Gospel music minister and worshipper — The Voice of Jesus to Nations. Songs like Beyond Me, Never Seen, and Onye Nwere Jesus have reached millions across nations.',
    images: [
      {
        url: 'https://res.cloudinary.com/dxliuat50/image/upload/v1778352160/yadahworld/site/jp81aeryirlpfhmhdw6l.png',
        width: 1200,
        height: 630,
        alt: 'Yadah — Nigerian Gospel Music Minister',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yadah — The Voice of Jesus to Nations',
    description: 'Gospel music minister and worshipper — The Voice of Jesus to Nations. Songs like Beyond Me, Never Seen, and Onye Nwere Jesus have reached millions across nations.',
    images: ['https://res.cloudinary.com/dxliuat50/image/upload/v1778352160/yadahworld/site/jp81aeryirlpfhmhdw6l.png'],
    creator: '@yadahworld1',
  },
  alternates: {
    canonical: 'https://yadahworld.com',
  },
  verification: {
    google: 'Oez4ct1K_8jcfXnWWqMikJF-h6LGQu-pnZ2Swu-RHog',
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
        <PersonSchema />
        <ThemeProvider>
          <SessionProvider>
            <CartProvider>{children}</CartProvider>
          </SessionProvider>
        </ThemeProvider>
        <SiteCookieConsent />
      </body>
    </html>
  )
}
