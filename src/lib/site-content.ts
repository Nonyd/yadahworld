import { prisma } from '@/lib/prisma'
import { images } from '@/lib/imagePlaceholders'

export type PublicRelease = {
  title: string
  feat: string
  type: string
  year: string
  cover: string
  spotify: string | null
  isNew: boolean
}

export type PublicEvent = {
  title: string
  dateLabel: string
  location: string
  href: string
  external: boolean
}

const FALLBACK_RELEASES: PublicRelease[] = [
  {
    title: 'Never Seen (Live)',
    feat: 'ft. Sunmisola Agbebi',
    type: 'Single',
    year: '2024',
    cover: images.releaseNeverSeen,
    spotify: 'https://open.spotify.com/search/yadah%20never%20seen',
    isNew: true,
  },
  {
    title: 'Fathered By The Best',
    feat: '',
    type: 'Album',
    year: '2023',
    cover: images.releaseFathered,
    spotify: 'https://open.spotify.com/search/yadah%20fathered',
    isNew: false,
  },
  {
    title: 'Onye Nwere Jesus',
    feat: '',
    type: 'Single',
    year: '2023',
    cover: images.releaseOnye,
    spotify: 'https://open.spotify.com/search/yadah%20onye',
    isNew: false,
  },
  {
    title: 'Beyond Me',
    feat: '',
    type: 'Single',
    year: '2022',
    cover: images.releaseBeyond,
    spotify: 'https://open.spotify.com/search/yadah%20beyond%20me',
    isNew: false,
  },
]

const FALLBACK_EVENTS: PublicEvent[] = [
  {
    title: 'Room For You Global',
    dateLabel: 'TBA',
    location: 'Multiple cities',
    href: 'https://rfyglobal.org',
    external: true,
  },
  {
    title: 'Worship Night with Yadah',
    dateLabel: 'Coming soon',
    location: 'Abuja, Nigeria',
    href: '/booking',
    external: false,
  },
]

function formatEventDate(d: Date) {
  try {
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return 'TBA'
  }
}

export async function getPublicReleases(): Promise<PublicRelease[]> {
  try {
    const rows = await prisma.siteRelease.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })
    if (rows.length === 0) return FALLBACK_RELEASES
    return rows.map((r) => ({
      title: r.title,
      feat: r.feat ?? '',
      type: r.type,
      year: r.year,
      cover: r.cover,
      spotify: r.spotify,
      isNew: r.isNew,
    }))
  } catch {
    return FALLBACK_RELEASES
  }
}

export async function getPublicEvents(): Promise<PublicEvent[]> {
  try {
    const rows = await prisma.siteEvent.findMany({
      where: { isActive: true },
      orderBy: { date: 'asc' },
    })
    if (rows.length === 0) return FALLBACK_EVENTS
    return rows.map((e) => {
      const link = e.link?.trim() ?? ''
      const external = link.startsWith('http://') || link.startsWith('https://')
      const href = link || '/booking'
      return {
        title: e.title,
        dateLabel: formatEventDate(e.date),
        location: e.location,
        href,
        external,
      }
    })
  } catch {
    return FALLBACK_EVENTS
  }
}
