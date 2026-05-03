import HeroSection from '@/components/home/HeroSection'
import MantraSection from '@/components/home/MantraSection'
import AboutSnippet from '@/components/home/AboutSnippet'
import MusicSection from '@/components/home/MusicSection'
import VideosSection from '@/components/home/VideosSection'
import StreamMarquee from '@/components/home/StreamMarquee'
import UpcomingEvents from '@/components/home/UpcomingEvents'
import BookingCTA from '@/components/home/BookingCTA'

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
