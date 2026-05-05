import type { Metadata } from 'next'
import AboutPageClient from '@/components/about/AboutPageClient'
import { getSiteCopy, getSiteVisuals } from '@/lib/site-settings'

export const metadata: Metadata = {
  title: 'About Yadah — Nigerian Female Gospel Music Minister',
  description:
    'Learn about Yadah Kukeurim Daniel — one of the top female gospel music ministers and worship ministers in Nigeria. Based in Abuja, Nigeria, with 7+ years of ministry and millions of lives touched globally.',
  alternates: { canonical: 'https://yadahworld.com/about' },
  openGraph: {
    title: 'About Yadah — Nigerian Female Gospel Music Minister',
    description:
      'Yadah Kukeurim Daniel is one of the top female gospel music ministers in Nigeria with songs like Beyond Me, Never Seen, and Onye Nwere Jesus.',
    url: 'https://yadahworld.com/about',
  },
}

export default async function AboutPage() {
  const [v, copy] = await Promise.all([getSiteVisuals(), getSiteCopy()])
  return <AboutPageClient aboutHero={v.aboutHero} aboutPortrait={v.aboutPortrait} copy={copy} />
}
