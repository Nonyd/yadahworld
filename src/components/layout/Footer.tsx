import Image from 'next/image'
import Link from 'next/link'
import { DEFAULT_SITE_LOGO_URL } from '@/lib/default-branding'

const linkClass =
  'font-jost text-[11px] tracking-[0.15em] uppercase block mb-3 transition-colors duration-300 hover:text-[#C9A84C]'

export type FooterSocialConnect = {
  instagram: string
  youtube: string
  spotify: string
  facebook: string
  x: string
  tiktok: string
}

const defaultSocial: FooterSocialConnect = {
  instagram: '#',
  youtube: '#',
  spotify: '#',
  facebook: '#',
  x: '#',
  tiktok: '#',
}

export default function Footer({
  siteName = 'Yadah',
  contactLine,
  socialConnect,
  copyrightLine,
}: {
  siteName?: string
  contactLine?: string
  socialConnect?: Partial<FooterSocialConnect>
  copyrightLine?: string | null
}) {
  const social = { ...defaultSocial, ...socialConnect }
  const displayContact = contactLine?.trim() || 'yadahsings@gmail.com · +234 808 188 1365'

  return (
    <footer className="w-full">
      {/* Part A — pre-footer */}
      <section
        className="py-20 px-8 md:px-20"
        style={{ background: '#EDE8DF' }}
      >
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-playfair italic text-[clamp(2rem,5vw,4rem)] text-[var(--body)] text-center">
            Have you heard the good news?
          </h2>
          <p className="font-baskerville italic text-lg text-[var(--muted)] text-center mt-4 mb-10">
            You can live forever by believing in Jesus.
          </p>
          <a href="/booking" className="btn-primary mx-auto inline-flex">
            Book Yadah
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M1 7h12M7 1l6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </section>

      {/* Part B — main footer */}
      <div className="px-8 md:px-20" style={{ background: '#0D0B08' }}>
        <div className="flex justify-between items-center py-16 gap-8 flex-col sm:flex-row sm:items-center">
          <Link href="/" className="shrink-0" aria-label={`${siteName} home`}>
            <Image
              src={DEFAULT_SITE_LOGO_URL}
              alt={siteName}
              width={300}
              height={56}
              className="h-14 w-auto"
              sizes="160px"
            />
          </Link>
          <p
            className="font-playfair italic text-[clamp(1rem,3vw,2rem)] text-center sm:text-right max-w-xl"
            style={{ color: 'rgba(201,168,76,0.35)' }}
          >
            &ldquo;The Voice of Jesus Christ to Nations.&rdquo;
          </p>
        </div>

        <div style={{ height: '1px', background: 'rgba(201,168,76,0.12)' }} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 py-16">
          <div>
            <p className="eyebrow mb-5" style={{ color: 'rgba(253,250,245,0.25)' }}>
              Navigate
            </p>
            <Link href="/" className={linkClass} style={{ color: 'rgba(253,250,245,0.4)' }}>
              Home
            </Link>
            <Link href="/media" className={linkClass} style={{ color: 'rgba(253,250,245,0.4)' }}>
              Media
            </Link>
            <Link href="/about" className={linkClass} style={{ color: 'rgba(253,250,245,0.4)' }}>
              About
            </Link>
            <Link href="/releases" className={linkClass} style={{ color: 'rgba(253,250,245,0.4)' }}>
              Releases
            </Link>
            <Link href="/contact" className={linkClass} style={{ color: 'rgba(253,250,245,0.4)' }}>
              Contact
            </Link>
            <Link href="/booking" className={linkClass} style={{ color: 'rgba(253,250,245,0.4)' }}>
              Booking
            </Link>
            <Link href="/shop" className={linkClass} style={{ color: 'rgba(253,250,245,0.4)' }}>
              Shop
            </Link>
          </div>

          <div>
            <p className="eyebrow mb-5" style={{ color: 'rgba(253,250,245,0.25)' }}>
              Events
            </p>
            <Link href="/#events" className={linkClass} style={{ color: 'rgba(253,250,245,0.4)' }}>
              Upcoming
            </Link>
          </div>

          <div>
            <p className="eyebrow mb-5" style={{ color: 'rgba(253,250,245,0.25)' }}>
              Ministry
            </p>
            <a
              href="https://rfyglobal.org"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              style={{ color: 'rgba(253,250,245,0.4)' }}
            >
              Room For You
            </a>
            <Link href="/campus-tour" className={linkClass} style={{ color: 'rgba(253,250,245,0.4)' }}>
              Campus Tour
            </Link>
            <Link href="/privacy-policy" className={linkClass} style={{ color: 'rgba(253,250,245,0.4)' }}>
              Privacy Policy
            </Link>
            <Link href="/refund-policy" className={linkClass} style={{ color: 'rgba(253,250,245,0.4)' }}>
              Refund & Returns
            </Link>
            <a
              href="https://sonshubmedia.com"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              style={{ color: 'rgba(253,250,245,0.4)' }}
            >
              About SonsHub
            </a>
          </div>

          <div>
            <p className="eyebrow mb-5" style={{ color: 'rgba(253,250,245,0.25)' }}>
              Connect
            </p>
            <a
              href={social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              style={{ color: 'rgba(253,250,245,0.4)' }}
            >
              Instagram
            </a>
            <a
              href={social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              style={{ color: 'rgba(253,250,245,0.4)' }}
            >
              YouTube
            </a>
            <a
              href={social.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              style={{ color: 'rgba(253,250,245,0.4)' }}
            >
              Spotify
            </a>
            <a
              href={social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              style={{ color: 'rgba(253,250,245,0.4)' }}
            >
              Facebook
            </a>
            <a
              href={social.x}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              style={{ color: 'rgba(253,250,245,0.4)' }}
            >
              X (Twitter)
            </a>
            <a
              href={social.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              style={{ color: 'rgba(253,250,245,0.4)' }}
            >
              TikTok
            </a>
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(201,168,76,0.12)' }} />

        <div className="flex flex-col md:flex-row justify-between items-center gap-2 py-6">
          {copyrightLine?.trim() ? (
            <p
              className="font-jost text-[10px] tracking-[0.15em] uppercase text-center md:text-left"
              style={{ color: 'rgba(253,250,245,0.2)' }}
            >
              {copyrightLine.trim()}
            </p>
          ) : (
            <p
              className="font-jost text-[10px] tracking-[0.15em] uppercase text-center md:text-left"
              style={{ color: 'rgba(253,250,245,0.2)' }}
            >
              © {new Date().getFullYear()} {siteName}. Powered & managed by{' '}
              <a
                href="https://sonshubmedia.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#C9A84C] transition-colors"
                style={{ color: 'rgba(253,250,245,0.35)' }}
              >
                SonsHub Media
              </a>
            </p>
          )}
          <p
            className="font-jost text-[10px] tracking-[0.15em] uppercase text-center md:text-right"
            style={{ color: 'rgba(253,250,245,0.2)' }}
          >
            {displayContact}
          </p>
        </div>
      </div>
    </footer>
  )
}
