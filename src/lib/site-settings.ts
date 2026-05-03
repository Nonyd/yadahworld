import type { SiteSettings } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { images } from '@/lib/imagePlaceholders'

export type SiteVisuals = {
  hero: string
  editorial: string
  aboutHero: string
  aboutPortrait: string
  worshipBg: string
}

const defaultSocials = () => [
  { label: 'IG', href: 'https://instagram.com/ministersings' },
  { label: 'YT', href: 'https://youtube.com/@yadah' },
  { label: 'SP', href: 'https://open.spotify.com/artist/xxx' },
  { label: 'FB', href: 'https://facebook.com/yadahsings' },
  { label: 'X', href: 'https://x.com/ministeryadah' },
]

export function buildSocialLinks(settings: SiteSettings | null) {
  const s = defaultSocials()
  if (!settings) return s
  const map: Record<string, string | null | undefined> = {
    IG: settings.socialInstagram,
    YT: settings.socialYoutube,
    SP: settings.socialSpotify,
    FB: settings.socialFacebook,
    X: settings.socialX,
  }
  return s.map((item) => {
    const url = map[item.label]?.trim()
    return url ? { ...item, href: url } : item
  })
}

export async function getSiteSettingsRow(): Promise<SiteSettings | null> {
  try {
    let row = await prisma.siteSettings.findUnique({ where: { id: 1 } })
    if (!row) {
      row = await prisma.siteSettings.create({
        data: { id: 1 },
      })
    }
    return row
  } catch {
    return null
  }
}

export function mergeVisuals(settings: SiteSettings | null): SiteVisuals {
  return {
    hero: settings?.imageHero?.trim() || images.hero,
    editorial: settings?.imageEditorial?.trim() || images.editorial,
    aboutHero: settings?.imageAboutHero?.trim() || images.aboutHero,
    aboutPortrait: settings?.imageAboutPortrait?.trim() || images.aboutPortrait,
    worshipBg: settings?.imageWorshipBg?.trim() || images.worshipBg,
  }
}

export async function getSiteVisuals(): Promise<SiteVisuals> {
  const row = await getSiteSettingsRow()
  return mergeVisuals(row)
}

export function mergeGalleryUrls(settings: SiteSettings | null): string[] {
  const fromDb = settings?.galleryImageUrls?.filter(Boolean) ?? []
  if (fromDb.length > 0) return fromDb
  return [...images.gallery]
}

export async function getGalleryUrls(): Promise<string[]> {
  const row = await getSiteSettingsRow()
  return mergeGalleryUrls(row)
}

export type PublicSiteBranding = {
  siteName: string
  siteTagline: string | null
  metaDescription: string | null
  metaTitleSuffix: string | null
  contactEmail: string | null
  contactPhone: string | null
  bookingEmail: string | null
}

export async function getPublicBranding(): Promise<PublicSiteBranding> {
  const row = await getSiteSettingsRow()
  return {
    siteName: row?.siteName?.trim() || 'Yadah',
    siteTagline: row?.siteTagline?.trim() || null,
    metaDescription: row?.metaDescription?.trim() || null,
    metaTitleSuffix: row?.metaTitleSuffix?.trim() || '| Yadah',
    contactEmail: row?.contactEmail?.trim() || null,
    contactPhone: row?.contactPhone?.trim() || null,
    bookingEmail: row?.bookingEmail?.trim() || null,
  }
}
