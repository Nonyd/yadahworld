import AboutPageClient from '@/components/about/AboutPageClient'
import { getSiteCopy, getSiteVisuals } from '@/lib/site-settings'

export default async function AboutPage() {
  const [v, copy] = await Promise.all([getSiteVisuals(), getSiteCopy()])
  return <AboutPageClient aboutHero={v.aboutHero} aboutPortrait={v.aboutPortrait} copy={copy} />
}
