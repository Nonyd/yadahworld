import AboutPageClient from '@/components/about/AboutPageClient'
import { getSiteVisuals } from '@/lib/site-settings'

export default async function AboutPage() {
  const v = await getSiteVisuals()
  return <AboutPageClient aboutHero={v.aboutHero} aboutPortrait={v.aboutPortrait} />
}
