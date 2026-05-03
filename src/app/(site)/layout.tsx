import LenisProvider from '@/components/providers/LenisProvider'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CustomCursor from '@/components/ui/CustomCursor'
import { getPublicBranding, getSiteSettingsRow } from '@/lib/site-settings'
import 'lenis/dist/lenis.css'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [branding, settings] = await Promise.all([getPublicBranding(), getSiteSettingsRow()])
  const contactLine = [branding.contactEmail, branding.contactPhone].filter(Boolean).join(' · ')
  const hash = '#'
  const socialConnect = {
    instagram: settings?.socialInstagram?.trim() || hash,
    youtube: settings?.socialYoutube?.trim() || hash,
    spotify: settings?.socialSpotify?.trim() || hash,
    facebook: settings?.socialFacebook?.trim() || hash,
    x: settings?.socialX?.trim() || hash,
    tiktok: settings?.socialTiktok?.trim() || hash,
  }

  return (
    <LenisProvider>
      <CustomCursor />
      <Navbar siteName={branding.siteName} logoUrl={branding.logoUrl} />
      <main>{children}</main>
      <Footer
        siteName={branding.siteName}
        contactLine={contactLine || undefined}
        socialConnect={socialConnect}
        copyrightLine={branding.footerCopyright}
      />
    </LenisProvider>
  )
}
