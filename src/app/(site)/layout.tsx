import LenisProvider from '@/components/providers/LenisProvider'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CustomCursor from '@/components/ui/CustomCursor'
import { buildPublicNavLinks, navLabelsFromCopy } from '@/lib/site-copy'
import { getPublicBranding, getSiteCopy, getSiteSettingsRow } from '@/lib/site-settings'
import 'lenis/dist/lenis.css'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [branding, settings, copy] = await Promise.all([getPublicBranding(), getSiteSettingsRow(), getSiteCopy()])
  const navLinks = buildPublicNavLinks(copy)
  const navLabels = navLabelsFromCopy(copy)
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
      <Navbar siteName={branding.siteName} logoUrl={branding.logoUrl} navLinks={navLinks} navLabels={navLabels} />
      <main>{children}</main>
      <Footer
        siteName={branding.siteName}
        logoUrl={branding.logoUrl}
        contactLine={contactLine || undefined}
        socialConnect={socialConnect}
        copyrightLine={branding.footerCopyright}
        copy={copy}
      />
    </LenisProvider>
  )
}
