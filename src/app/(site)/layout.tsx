import LenisProvider from '@/components/providers/LenisProvider'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CustomCursor from '@/components/ui/CustomCursor'
import 'lenis/dist/lenis.css'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <LenisProvider>
      <CustomCursor />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </LenisProvider>
  )
}
