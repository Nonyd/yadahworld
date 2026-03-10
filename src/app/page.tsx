import Hero from "@/components/sections/Hero";
import Marquee from "@/components/sections/Marquee";
import FeaturedRelease from "@/components/sections/FeaturedRelease";
import Story from "@/components/sections/Story";
import Discography from "@/components/sections/Discography";
import Tour from "@/components/sections/Tour";
import Ministry from "@/components/sections/Ministry";
import Waitlist from "@/components/sections/Waitlist";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Marquee />
      <FeaturedRelease />
      <Story />
      <Discography />
      <Tour />
      <Ministry />
      <Waitlist />
      <Footer />
    </main>
  );
}
