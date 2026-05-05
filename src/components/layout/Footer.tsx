import Image from 'next/image'
import Link from 'next/link'
import { DEFAULT_SITE_LOGO_URL } from '@/lib/default-branding'
import PublicHrefLink from '@/components/ui/PublicHrefLink'
import NewsletterForm from '@/components/newsletter/NewsletterForm'
import ConditionalPreFooter from '@/components/layout/ConditionalPreFooter'
import FooterMinistryLinks from '@/components/layout/FooterMinistryLinks'
import CookiePreferencesButton from '@/components/consent/CookiePreferencesButton'
import { bookingHrefFromCopy, getCopyString, roomForYouHrefFromCopy, type SiteCopy } from '@/lib/site-copy'

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
  logoUrl = DEFAULT_SITE_LOGO_URL,
  contactLine,
  socialConnect,
  copyrightLine,
  copy,
}: {
  siteName?: string
  logoUrl?: string
  contactLine?: string
  socialConnect?: Partial<FooterSocialConnect>
  copyrightLine?: string | null
  copy: SiteCopy
}) {
  const social = { ...defaultSocial, ...socialConnect }
  const displayContact = contactLine?.trim() || 'yadahsings@gmail.com · +234 808 188 1365'
  const g = (k: string) => getCopyString(copy, `footer.${k}`)
  const bookingHref = bookingHrefFromCopy(copy)
  const roomForYouHref = roomForYouHrefFromCopy(copy)

  return (
    <footer className="w-full">
      <ConditionalPreFooter>
        <section className="pre-footer-strip py-20 px-8 md:px-20">
          <div className="mx-auto max-w-4xl text-center">
            <p className="eyebrow mb-6">{g('preFooterTitle')}</p>
            <h2 className="font-playfair italic text-[clamp(2rem,5vw,4rem)] text-[var(--body)] text-center leading-tight whitespace-pre-line">
              {g('preFooterSubtitle')}
            </h2>
            <p className="font-baskerville italic text-lg text-[var(--muted)] text-center mt-4">{g('preFooterAttribution')}</p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/gospel" className="btn-primary">
                SEE GOOD NEWS
              </Link>
              <Link href="/releases" className="btn-ghost">
                <span className="arrow-line" />
                {g('preFooterSecondaryCta')}
              </Link>
            </div>
          </div>
        </section>
      </ConditionalPreFooter>

      <div className="px-8 md:px-20" style={{ background: '#0D0B08' }}>
        <div className="flex justify-between items-center py-16 gap-8 flex-col sm:flex-row sm:items-center">
          <Link href="/" className="shrink-0" aria-label={`${siteName} home`}>
            <Image
              src={logoUrl}
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
            &ldquo;{g('taglineQuote')}&rdquo;
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 border-b border-[rgba(253,250,245,0.08)] py-12 md:grid-cols-2 md:items-center md:gap-12">
          <div>
            <p className="eyebrow mb-3" style={{ color: 'rgba(253,250,245,0.25)' }}>
              {g('newsletterEyebrow')}
            </p>
            <p
              className="font-playfair italic whitespace-pre-line"
              style={{
                fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                color: '#FDFAF5',
                lineHeight: 1.3,
                marginBottom: '8px',
              }}
            >
              {g('newsletterBody')}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-baskerville)',
                fontSize: '13px',
                color: 'rgba(253,250,245,0.35)',
                fontStyle: 'italic',
              }}
            >
              {g('newsletterFinePrint')}
            </p>
          </div>
          <div>
            <NewsletterForm theme="dark" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 py-16">
          <div>
            <p className="eyebrow mb-5" style={{ color: 'rgba(253,250,245,0.25)' }}>
              {g('colNavigate')}
            </p>
            <Link href="/" className={linkClass} style={{ color: 'rgba(253,250,245,0.4)' }}>
              {g('linkHome')}
            </Link>
            <Link href="/media" className={linkClass} style={{ color: 'rgba(253,250,245,0.4)' }}>
              {g('linkMedia')}
            </Link>
            <Link href="/ministrations" className={linkClass} style={{ color: 'rgba(253,250,245,0.4)' }}>
              {g('linkMinistrations')}
            </Link>
            <Link href="/about" className={linkClass} style={{ color: 'rgba(253,250,245,0.4)' }}>
              {g('linkAbout')}
            </Link>
            <Link href="/releases" className={linkClass} style={{ color: 'rgba(253,250,245,0.4)' }}>
              {g('linkReleases')}
            </Link>
            <Link href="/contact" className={linkClass} style={{ color: 'rgba(253,250,245,0.4)' }}>
              {g('linkContact')}
            </Link>
            <PublicHrefLink href={bookingHref} className={linkClass} style={{ color: 'rgba(253,250,245,0.4)' }}>
              {g('linkBooking')}
            </PublicHrefLink>
            <Link href="/shop" className={linkClass} style={{ color: 'rgba(253,250,245,0.4)' }}>
              {g('linkShop')}
            </Link>
          </div>

          <FooterMinistryLinks
            columnTitle={g('colMinistry')}
            roomForYouHref={roomForYouHref}
            roomForYouLabel={g('ministryRoomForYou')}
            campusTourLabel={g('ministryCampusTour')}
          />

          <div className="col-span-2 md:col-span-1">
            <p className="eyebrow mb-5" style={{ color: 'rgba(253,250,245,0.25)' }}>
              {g('colConnect')}
            </p>
            <a
              href={social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              style={{ color: 'rgba(253,250,245,0.4)' }}
            >
              {g('connectInstagram')}
            </a>
            <a
              href={social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              style={{ color: 'rgba(253,250,245,0.4)' }}
            >
              {g('connectYoutube')}
            </a>
            <a
              href={social.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              style={{ color: 'rgba(253,250,245,0.4)' }}
            >
              {g('connectSpotify')}
            </a>
            <a
              href={social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              style={{ color: 'rgba(253,250,245,0.4)' }}
            >
              {g('connectFacebook')}
            </a>
            <a
              href={social.x}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              style={{ color: 'rgba(253,250,245,0.4)' }}
            >
              {g('connectX')}
            </a>
            <a
              href={social.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              style={{ color: 'rgba(253,250,245,0.4)' }}
            >
              {g('connectTiktok')}
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-jost text-[10px] tracking-[0.2em] uppercase">
            <Link
              href="/privacy-policy"
              className="transition-colors hover:text-[#C9A84C]"
              style={{ color: 'rgba(253,250,245,0.45)' }}
            >
              {g('bottomPrivacy')}
            </Link>
            <span style={{ color: 'rgba(253,250,245,0.25)' }} aria-hidden>
              ·
            </span>
            <Link
              href="/refund-policy"
              className="transition-colors hover:text-[#C9A84C]"
              style={{ color: 'rgba(253,250,245,0.45)' }}
            >
              {g('refundLink')}
            </Link>
            <span style={{ color: 'rgba(253,250,245,0.25)' }} aria-hidden>
              ·
            </span>
            <Link
              href="/cookie-policy"
              className="transition-colors hover:text-[#C9A84C]"
              style={{ color: 'rgba(253,250,245,0.45)' }}
            >
              {g('bottomCookie')}
            </Link>
            <span style={{ color: 'rgba(253,250,245,0.25)' }} aria-hidden>
              ·
            </span>
            <CookiePreferencesButton
              className="cursor-pointer border-0 bg-transparent font-jost text-[10px] tracking-[0.2em] uppercase transition-colors hover:text-[#C9A84C]"
              style={{ color: 'rgba(253,250,245,0.45)' }}
            >
              {g('bottomCookieSettings')}
            </CookiePreferencesButton>
          </div>
          <a
            href={g('creditHref')}
            target="_blank"
            rel="noopener noreferrer"
            className="font-jost text-[11px] tracking-[0.12em] transition-colors hover:text-ivory"
            style={{ color: 'rgba(253,250,245,0.55)' }}
          >
            {g('creditLine')}
          </a>
        </div>

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
              © {new Date().getFullYear()} {siteName}.
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
