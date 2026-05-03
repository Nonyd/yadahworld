import HeroSection from '@/components/home/HeroSection'
import MantraSection from '@/components/home/MantraSection'
import AboutSnippet from '@/components/home/AboutSnippet'
import MusicSection from '@/components/home/MusicSection'
import VideosSection from '@/components/home/VideosSection'
import StreamMarquee from '@/components/home/StreamMarquee'
import UpcomingEvents from '@/components/home/UpcomingEvents'
import BookingCTA from '@/components/home/BookingCTA'
import { getPublicEvents, getPublicReleases, getPublicVideos } from '@/lib/site-content'
import { getSiteVisuals } from '@/lib/site-settings'

export default async function Home() {
  const [releases, events, videos, visuals] = await Promise.all([
    getPublicReleases(),
    getPublicEvents(),
    getPublicVideos(),
    getSiteVisuals(),
  ])

  return (
    <>
      <HeroSection heroImage={visuals.hero} />
      <MantraSection />
      <AboutSnippet editorialImage={visuals.editorial} />
      <div className="section-rule mx-16 md:mx-24" />
      <MusicSection releases={releases} />
      <div className="section-rule mx-16 md:mx-24" />
      <VideosSection videos={videos} />
      <StreamMarquee />
      <UpcomingEvents events={events} />
      <BookingCTA worshipBg={visuals.worshipBg} />
    </>
  )
}
