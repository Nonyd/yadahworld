import LenisProvider from '@/components/providers/LenisProvider'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CustomCursor from '@/components/ui/CustomCursor'
import { buildSocialLinks, getPublicBranding, getSiteSettingsRow } from '@/lib/site-settings'
import 'lenis/dist/lenis.css'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [branding, settings] = await Promise.all([getPublicBranding(), getSiteSettingsRow()])
  const contactLine = [branding.contactEmail, branding.contactPhone].filter(Boolean).join(' · ')
  const socials = buildSocialLinks(settings)

  return (
    <LenisProvider>
      <CustomCursor />
      <Navbar siteName={branding.siteName} />
      <main>{children}</main>
      <Footer
        siteName={branding.siteName}
        tagline={branding.siteTagline}
        contactLine={contactLine || undefined}
        socials={socials}
        copyrightLine={branding.footerCopyright}
      />
    </LenisProvider>
  )
}
