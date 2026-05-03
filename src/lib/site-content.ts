import { prisma } from '@/lib/prisma'
import { images } from '@/lib/imagePlaceholders'
import { slugify } from '@/lib/slug'
import { youtubeThumbnailFromUrl } from '@/lib/youtube'

export type PublicRelease = {
  slug: string
  title: string
  feat: string
  type: string
  year: string
  cover: string
  spotify: string | null
  spotifyEmbed: string | null
  apple: string | null
  youtube: string | null
  musicVideoYoutube: string | null
  isNew: boolean
  description: string | null
}

export type PublicEvent = {
  title: string
  dateLabel: string
  location: string
  href: string
  external: boolean
}

export type PublicVideo = {
  id: string
  title: string
  youtubeUrl: string
  thumbnail: string
}

const FALLBACK_RELEASES: PublicRelease[] = [
  {
    slug: 'never-seen-live',
    title: 'Never Seen (Live)',
    feat: 'ft. Sunmisola Agbebi',
    type: 'Single',
    year: '2024',
    cover: images.releaseNeverSeen,
    spotify: 'https://open.spotify.com/search/yadah%20never%20seen',
    spotifyEmbed: null,
    apple: null,
    youtube: null,
    musicVideoYoutube: null,
    isNew: true,
    description: null,
  },
  {
    slug: 'fathered-by-the-best',
    title: 'Fathered By The Best',
    feat: '',
    type: 'Album',
    year: '2023',
    cover: images.releaseFathered,
    spotify: 'https://open.spotify.com/search/yadah%20fathered',
    spotifyEmbed: null,
    apple: null,
    youtube: null,
    musicVideoYoutube: null,
    isNew: false,
    description: null,
  },
  {
    slug: 'onye-nwere-jesus',
    title: 'Onye Nwere Jesus',
    feat: '',
    type: 'Single',
    year: '2023',
    cover: images.releaseOnye,
    spotify: 'https://open.spotify.com/search/yadah%20onye',
    spotifyEmbed: null,
    apple: null,
    youtube: null,
    musicVideoYoutube: null,
    isNew: false,
    description: null,
  },
  {
    slug: 'beyond-me',
    title: 'Beyond Me',
    feat: '',
    type: 'Single',
    year: '2022',
    cover: images.releaseBeyond,
    spotify: 'https://open.spotify.com/search/yadah%20beyond%20me',
    spotifyEmbed: null,
    apple: null,
    youtube: null,
    musicVideoYoutube: null,
    isNew: false,
    description: null,
  },
]

const FALLBACK_EVENTS: PublicEvent[] = [
  {
    title: 'Room For You',
    dateLabel: 'TBA',
    location: 'Multiple cities',
    href: 'https://rfyglobal.org',
    external: true,
  },
  {
    title: 'Campus Tour',
    dateLabel: 'Coming soon',
    location: 'Abuja, Nigeria',
    href: '/campus-tour',
    external: false,
  },
]

const FALLBACK_VIDEOS: PublicVideo[] = [
  {
    id: 'fb-never-seen',
    title: 'Never Seen (Live)',
    youtubeUrl: 'https://www.youtube.com/results?search_query=yadah+never+seen+live',
    thumbnail: images.videoNeverSeen,
  },
  {
    id: 'fb-na-your-hand',
    title: 'Na Your Hand',
    youtubeUrl: 'https://www.youtube.com/results?search_query=yadah+na+your+hand',
    thumbnail: images.videoNaYourHand,
  },
]

function formatEventDate(d: Date) {
  try {
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return 'TBA'
  }
}

function mapReleaseRow(r: {
  slug: string
  title: string
  feat: string | null
  type: string
  year: string
  cover: string
  spotify: string | null
  spotifyEmbed: string | null
  apple: string | null
  youtube: string | null
  musicVideoYoutube: string | null
  isNew: boolean
  description: string | null
}): PublicRelease {
  return {
    slug: r.slug,
    title: r.title,
    feat: r.feat ?? '',
    type: r.type,
    year: r.year,
    cover: r.cover,
    spotify: r.spotify,
    spotifyEmbed: r.spotifyEmbed,
    apple: r.apple,
    youtube: r.youtube,
    musicVideoYoutube: r.musicVideoYoutube,
    isNew: r.isNew,
    description: r.description,
  }
}

export async function getPublicReleases(): Promise<PublicRelease[]> {
  try {
    const rows = await prisma.siteRelease.findMany({
      orderBy: [{ releasedAt: 'desc' }, { createdAt: 'desc' }],
    })
    return rows.map(mapReleaseRow)
  } catch {
    return FALLBACK_RELEASES
  }
}

/** Homepage music grid — up to 4 releases flagged by admin; `order` ascending, then `releasedAt`. */
export async function getHomepageReleases(): Promise<PublicRelease[]> {
  try {
    const rows = await prisma.siteRelease.findMany({
      where: { showOnHomepage: true },
      orderBy: [{ order: 'asc' }, { releasedAt: 'desc' }],
      take: 4,
    })
    return rows.map(mapReleaseRow)
  } catch {
    return FALLBACK_RELEASES.slice(0, 4)
  }
}

export async function getReleaseBySlug(slug: string): Promise<PublicRelease | null> {
  try {
    const row = await prisma.siteRelease.findUnique({ where: { slug } })
    if (row) return mapReleaseRow(row)
    return null
  } catch {
    return FALLBACK_RELEASES.find((r) => r.slug === slug) ?? null
  }
}

export async function getPublicEvents(): Promise<PublicEvent[]> {
  try {
    const rows = await prisma.siteEvent.findMany({
      where: { isActive: true },
      orderBy: { date: 'asc' },
    })
    return rows.map((e) => {
      const link = e.link?.trim() ?? ''
      const external = link.startsWith('http://') || link.startsWith('https://')
      const href = link || '/booking'
      const cap = e.dateCaption?.trim()
      return {
        title: e.title,
        dateLabel: cap || formatEventDate(e.date),
        location: e.location,
        href,
        external,
      }
    })
  } catch {
    return FALLBACK_EVENTS
  }
}

export async function getPublicVideos(): Promise<PublicVideo[]> {
  try {
    const rows = await prisma.siteVideo.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      take: 6,
    })
    return rows.map((v) => ({
      id: v.id,
      title: v.title,
      youtubeUrl: v.youtubeUrl,
      thumbnail: youtubeThumbnailFromUrl(v.youtubeUrl, v.thumbnailUrl) || images.videoNeverSeen,
    }))
  } catch {
    return FALLBACK_VIDEOS
  }
}

/** Ensure a base slug is unique in SiteRelease (excluding one id when editing). */
/** Ensure a base slug is unique for Product (excluding one id when editing). */
export async function uniqueProductSlug(base: string, excludeId?: string): Promise<string> {
  const s = slugify(base) || 'product'
  for (let n = 0; n < 200; n++) {
    const candidate = n === 0 ? s : `${s}-${n}`
    try {
      const found = await prisma.product.findUnique({ where: { slug: candidate } })
      if (!found || found.id === excludeId) return candidate
    } catch {
      return candidate
    }
  }
  return `${s}-${Date.now()}`
}

export async function uniqueReleaseSlug(base: string, excludeId?: string): Promise<string> {
  const s = slugify(base) || 'release'
  for (let n = 0; n < 200; n++) {
    const candidate = n === 0 ? s : `${s}-${n}`
    try {
      const found = await prisma.siteRelease.findUnique({ where: { slug: candidate } })
      if (!found || found.id === excludeId) return candidate
    } catch {
      return candidate
    }
  }
  return `${s}-${Date.now()}`
}

export { DEFAULT_SITE_LOGO_URL } from '@/lib/default-branding'
