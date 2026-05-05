'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import PublicHrefLink from '@/components/ui/PublicHrefLink'

const linkClass =
  'font-jost text-[11px] tracking-[0.15em] uppercase block mb-3 transition-colors duration-300 hover:text-[#C9A84C]'

const inactive = { color: 'rgba(253,250,245,0.4)' as const }
const active = { color: 'var(--gold-light)' as const }

function pathActive(pathname: string, href: string): boolean {
  const h = href.trim()
  if (!h || h.startsWith('/#')) return false
  // External URLs: never match Next pathname — their URL pathname is often `/`,
  // which would wrongly highlight links (e.g. Room For You) on the site homepage.
  if (h.startsWith('http://') || h.startsWith('https://')) return false

  let path = h
  if (path.includes('#')) {
    path = path.split('#')[0] || '/'
  }
  const norm = path.replace(/\/$/, '') || '/'
  const pn = pathname.replace(/\/$/, '') || '/'
  if (norm === '/') return pn === '/'
  return pn === norm || pn.startsWith(`${norm}/`)
}

export default function FooterMinistryLinks({
  columnTitle,
  roomForYouHref,
  roomForYouLabel,
  campusTourLabel,
}: {
  columnTitle: string
  roomForYouHref: string
  roomForYouLabel: string
  campusTourLabel: string
}) {
  const pathname = usePathname() || '/'

  return (
    <div>
      <p className="eyebrow mb-5" style={{ color: 'rgba(253,250,245,0.25)' }}>
        {columnTitle}
      </p>
      <Link href="/gospel" className={linkClass} style={pathActive(pathname, '/gospel') ? active : inactive}>
        The Gospel
      </Link>
      <Link href="/events" className={linkClass} style={pathActive(pathname, '/events') ? active : inactive}>
        Events
      </Link>
      <PublicHrefLink
        href={roomForYouHref}
        className={linkClass}
        style={pathActive(pathname, roomForYouHref) ? active : inactive}
      >
        {roomForYouLabel}
      </PublicHrefLink>
      <Link href="/campus-tour" className={linkClass} style={pathActive(pathname, '/campus-tour') ? active : inactive}>
        {campusTourLabel}
      </Link>
    </div>
  )
}
