import HeroSection from '@/components/home/HeroSection'
import MantraSection from '@/components/home/MantraSection'
import AboutSnippet from '@/components/home/AboutSnippet'
import MusicSection from '@/components/home/MusicSection'
import VideosSection from '@/components/home/VideosSection'
import StreamMarquee from '@/components/home/StreamMarquee'
import UpcomingEvents from '@/components/home/UpcomingEvents'
import BookingCTA from '@/components/home/BookingCTA'
import { getHomepageReleases, getPublicEvents, getPublicVideos } from '@/lib/site-content'
import { getCopyString } from '@/lib/site-copy'
import { getPublicBranding, getSiteCopy, getSiteVisuals } from '@/lib/site-settings'

export default async function Home() {
  const [releases, events, videos, visuals, branding, copy] = await Promise.all([
    getHomepageReleases(),
    getPublicEvents(),
    getPublicVideos(),
    getSiteVisuals(),
    getPublicBranding(),
    getSiteCopy(),
  ])

  const heroTag = branding.heroTagline?.trim()
  const heroEyebrow = heroTag ? `01 — ${heroTag}` : getCopyString(copy, 'home.heroDefaultEyebrow')
  const loc = branding.locationDisplay?.trim()
  const heroSubline = [
    getCopyString(copy, 'home.heroRoleLine'),
    getCopyString(copy, 'home.heroStreamsLine'),
    loc || getCopyString(copy, 'home.heroLocationFallback'),
  ].join(' · ')

  return (
    <>
      <HeroSection heroImage={visuals.hero} heroEyebrow={heroEyebrow} heroSubline={heroSubline} />
      <MantraSection copy={copy} />
      <AboutSnippet editorialImage={visuals.editorial} aboutBioShort={branding.aboutBioShort} copy={copy} />
      <MusicSection releases={releases} copy={copy} />
      <VideosSection videos={videos} copy={copy} />
      <StreamMarquee copy={copy} />
      <UpcomingEvents events={events} copy={copy} />
      <BookingCTA worshipBg={visuals.worshipBg} copy={copy} />
    </>
  )
}
