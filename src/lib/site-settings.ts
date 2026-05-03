import type { SiteSettings } from '@prisma/client'
import { cache } from 'react'
import { DEFAULT_SITE_LOGO_URL } from '@/lib/default-branding'
import { prisma } from '@/lib/prisma'
import { images } from '@/lib/imagePlaceholders'
import { mergeSiteContent, type SiteCopy } from '@/lib/site-copy'

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
  { label: 'TT', href: 'https://www.tiktok.com/@yadah' },
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
    TT: settings.socialTiktok,
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
  /** Logo URL (admin **Images → Site logo**) or default Cloudinary asset. */
  logoUrl: string
  siteTagline: string | null
  metaDescription: string | null
  metaTitleSuffix: string | null
  contactEmail: string | null
  contactPhone: string | null
  bookingEmail: string | null
  heroTagline: string | null
  aboutBioShort: string | null
  footerCopyright: string | null
  locationDisplay: string | null
}

export async function getPublicBranding(): Promise<PublicSiteBranding> {
  const row = await getSiteSettingsRow()
  const customLogo = row?.imageSiteLogo?.trim()
  return {
    siteName: row?.siteName?.trim() || 'Yadah',
    logoUrl: customLogo || DEFAULT_SITE_LOGO_URL,
    siteTagline: row?.siteTagline?.trim() || null,
    metaDescription: row?.metaDescription?.trim() || null,
    metaTitleSuffix: row?.metaTitleSuffix?.trim() || '| Yadah',
    contactEmail: row?.contactEmail?.trim() || null,
    contactPhone: row?.contactPhone?.trim() || null,
    bookingEmail: row?.bookingEmail?.trim() || null,
    heroTagline: row?.heroTagline?.trim() || null,
    aboutBioShort: row?.aboutBioShort?.trim() || null,
    footerCopyright: row?.footerCopyright?.trim() || null,
    locationDisplay: row?.locationDisplay?.trim() || null,
  }
}

/** Where admin notifications should go (DB overrides env). */
export type CampusTourVisuals = {
  portraitUrl: string
  marqueeRow1: string[]
  marqueeRow2: string[]
}

/**
 * Visuals for `/campus-tour`. Portrait falls back to About portrait placeholder; marquee rows
 * fall back to split stock gallery strips until the admin fills **Campus tour** in Settings.
 */
export async function getCampusTourVisuals(): Promise<CampusTourVisuals> {
  const row = await getSiteSettingsRow()
  const portrait =
    row?.imageCampusTourPortrait?.trim() || row?.imageAboutPortrait?.trim() || images.aboutPortrait
  const m1 = row?.campusTourMarquee1Urls?.filter(Boolean) ?? []
  const m2 = row?.campusTourMarquee2Urls?.filter(Boolean) ?? []
  const g = [...images.gallery]
  const marqueeRow1 = m1.length > 0 ? m1 : g.slice(0, Math.min(4, g.length))
  let marqueeRow2: string[]
  if (m2.length > 0) {
    marqueeRow2 = m2
  } else if (m1.length > 0) {
    marqueeRow2 = [...m1].reverse()
  } else {
    const secondHalf = g.slice(4, 8)
    marqueeRow2 = secondHalf.length > 0 ? secondHalf : [...marqueeRow1].reverse()
  }
  return {
    portraitUrl: portrait,
    marqueeRow1,
    marqueeRow2,
  }
}

export async function getNotifyEmail(): Promise<string> {
  const row = await getSiteSettingsRow()
  return row?.brevoNotifyEmail?.trim() || process.env.BREVO_NOTIFY_EMAIL?.trim() || 'yadahsings@gmail.com'
}

/** Merged site copy (defaults + `siteContentJson`). Cached per request. */
export const getSiteCopy = cache(async (): Promise<SiteCopy> => {
  const row = await getSiteSettingsRow()
  return mergeSiteContent(row?.siteContentJson ?? null)
})
