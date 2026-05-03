import Link from 'next/link'
import YadahLogo from '@/components/branding/YadahLogo'
import { SocialIcon } from '@/components/ui/SocialIcons'

const FOOTER_COLS = [
  {
    heading: 'Navigate',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Media', href: '/media' },
      { label: 'Releases', href: '/releases' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Booking', href: '/booking' },
      { label: 'Shop', href: '/shop' },
    ],
  },
  {
    heading: 'Events',
    links: [
      { label: 'Room For You', href: 'https://rfyglobal.org', external: true },
      { label: 'Campus Tour', href: '/media' },
      { label: 'Upcoming', href: '/#events' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Refund & Returns', href: '/refund-policy' },
      { label: 'About SonsHub', href: 'https://sonshubmedia.com', external: true },
    ],
  },
]

const DEFAULT_TAGLINE = 'The Voice of Jesus Christ to Nations. Gospel music minister based in Abuja, Nigeria.'
const DEFAULT_CONTACT = 'yadahsings@gmail.com · +234 808 188 1365'

export type FooterSocial = { label: string; href: string }

export default function Footer({
  siteName = 'Yadah',
  tagline,
  contactLine,
  socials,
  copyrightLine,
}: {
  siteName?: string
  tagline?: string | null
  contactLine?: string
  socials?: FooterSocial[]
  /** When set, replaces the default © line (year + SonsHub still applied unless you include them). */
  copyrightLine?: string | null
}) {
  const displayTagline = tagline?.trim() || DEFAULT_TAGLINE
  const displayContact = contactLine?.trim() || DEFAULT_CONTACT
  const socialList =
    socials && socials.length > 0
      ? socials
      : [
          { label: 'IG', href: 'https://instagram.com/ministersings' },
          { label: 'YT', href: 'https://youtube.com/@yadah' },
          { label: 'SP', href: 'https://open.spotify.com/artist/xxx' },
          { label: 'FB', href: 'https://facebook.com/yadahsings' },
          { label: 'X', href: 'https://x.com/ministeryadah' },
          { label: 'TT', href: 'https://www.tiktok.com/@yadah' },
        ]

  return (
    <footer
      className="border-t px-8 md:px-20 pt-20 pb-10"
      style={{ background: 'var(--surface)', borderColor: 'rgba(201,168,76,0.18)' }}
    >
      <div className="max-w-screen-xl mx-auto">
        <div className="grid md:grid-cols-[4fr_2fr_2fr_2fr] gap-12 md:gap-16 mb-16">
          <div>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/" aria-label={`${siteName} home`}>
                <YadahLogo alt={siteName} treatment="inDarkPill" height={44} />
              </Link>
            </div>
            <p className="body-sm mt-4 max-w-xs">{displayTagline}</p>
            <div className="flex gap-3 mt-8 flex-wrap items-center">
              {socialList.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--body)_12%,transparent)] px-3 py-2 text-[11px] font-medium uppercase tracking-wider transition-colors hover:border-[color-mix(in_srgb,var(--accent)_45%,transparent)] hover:text-[var(--accent)]"
                  style={{ color: 'var(--muted)' }}
                  aria-label={label}
                >
                  <SocialIcon label={label} href={href} className="h-4 w-4 shrink-0 opacity-80 group-hover:opacity-100" />
                  <span className="link-underline decoration-transparent group-hover:decoration-current">{label}</span>
                </a>
              ))}
            </div>
          </div>

          {FOOTER_COLS.map((col) => (
            <div key={col.heading}>
              <p className="eyebrow mb-6">{col.heading}</p>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {'external' in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="body-sm link-underline"
                        style={{ color: 'var(--muted)' }}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="body-sm link-underline" style={{ color: 'var(--muted)' }}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-t"
          style={{ borderColor: 'rgba(201,168,76,0.15)' }}
        >
          <p className="ui-label max-w-xl" style={{ color: 'var(--muted)' }}>
            {copyrightLine?.trim() ? (
              copyrightLine.trim()
            ) : (
              <>
                © {new Date().getFullYear()} {siteName}. Powered & managed by{' '}
                <a
                  href="https://sonshubmedia.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline"
                  style={{ color: 'var(--accent)' }}
                >
                  SonsHub Media
                </a>
              </>
            )}
          </p>
          <p className="ui-label" style={{ color: 'var(--muted)', opacity: 0.5 }}>
            {displayContact}
          </p>
        </div>
      </div>
    </footer>
  )
}
