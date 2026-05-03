import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const patchSchema = z.object({
  siteName: z.string().min(1).optional(),
  siteTagline: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaTitleSuffix: z.string().optional().nullable(),
  contactEmail: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  bookingEmail: z.string().optional().nullable(),
  socialInstagram: z.string().optional().nullable(),
  socialYoutube: z.string().optional().nullable(),
  socialSpotify: z.string().optional().nullable(),
  socialFacebook: z.string().optional().nullable(),
  socialX: z.string().optional().nullable(),
  socialTiktok: z.string().optional().nullable(),
  imageHero: z.string().optional().nullable(),
  imageEditorial: z.string().optional().nullable(),
  imageAboutHero: z.string().optional().nullable(),
  imageAboutPortrait: z.string().optional().nullable(),
  imageWorshipBg: z.string().optional().nullable(),
  imageCampusTourPortrait: z.string().optional().nullable(),
  campusTourMarquee1Urls: z.array(z.string()).optional(),
  campusTourMarquee2Urls: z.array(z.string()).optional(),
  galleryImageUrls: z.array(z.string()).optional(),
  paystackPublicKey: z.string().optional().nullable(),
  paystackSecretKey: z.string().optional().nullable(),
  paystackEnabled: z.boolean().optional(),
  flutterwavePublicKey: z.string().optional().nullable(),
  flutterwaveSecretKey: z.string().optional().nullable(),
  flutterwaveEnabled: z.boolean().optional(),
  stripeEnabled: z.boolean().optional(),
  stripeSecretKey: z.string().optional().nullable(),
  stripePublishableKey: z.string().optional().nullable(),
  stripeWebhookSecret: z.string().optional().nullable(),
  brevoSmtpHost: z.string().optional().nullable(),
  brevoSmtpPort: z.number().int().optional().nullable(),
  brevoSmtpUser: z.string().optional().nullable(),
  brevoSmtpPass: z.string().optional().nullable(),
  brevoFromEmail: z.string().optional().nullable(),
  brevoFromName: z.string().optional().nullable(),
  brevoNotifyEmail: z.string().optional().nullable(),
  heroTagline: z.string().optional().nullable(),
  aboutBioShort: z.string().optional().nullable(),
  footerCopyright: z.string().optional().nullable(),
  locationDisplay: z.string().optional().nullable(),
})

function emptyToNull(s: string | null | undefined) {
  const t = s?.trim()
  return t === '' || t === undefined ? null : t
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    let row = await prisma.siteSettings.findUnique({ where: { id: 1 } })
    if (!row) {
      row = await prisma.siteSettings.create({ data: { id: 1 } })
    }
    return NextResponse.json(row)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  const d = parsed.data
  const data: Record<string, unknown> = {}
  if (d.siteName !== undefined) data.siteName = d.siteName.trim()
  if (d.siteTagline !== undefined) data.siteTagline = emptyToNull(d.siteTagline)
  if (d.metaDescription !== undefined) data.metaDescription = emptyToNull(d.metaDescription)
  if (d.metaTitleSuffix !== undefined) data.metaTitleSuffix = emptyToNull(d.metaTitleSuffix)
  if (d.contactEmail !== undefined) data.contactEmail = emptyToNull(d.contactEmail)
  if (d.contactPhone !== undefined) data.contactPhone = emptyToNull(d.contactPhone)
  if (d.bookingEmail !== undefined) data.bookingEmail = emptyToNull(d.bookingEmail)
  if (d.socialInstagram !== undefined) data.socialInstagram = emptyToNull(d.socialInstagram)
  if (d.socialYoutube !== undefined) data.socialYoutube = emptyToNull(d.socialYoutube)
  if (d.socialSpotify !== undefined) data.socialSpotify = emptyToNull(d.socialSpotify)
  if (d.socialFacebook !== undefined) data.socialFacebook = emptyToNull(d.socialFacebook)
  if (d.socialX !== undefined) data.socialX = emptyToNull(d.socialX)
  if (d.socialTiktok !== undefined) data.socialTiktok = emptyToNull(d.socialTiktok)
  if (d.imageHero !== undefined) data.imageHero = emptyToNull(d.imageHero)
  if (d.imageEditorial !== undefined) data.imageEditorial = emptyToNull(d.imageEditorial)
  if (d.imageAboutHero !== undefined) data.imageAboutHero = emptyToNull(d.imageAboutHero)
  if (d.imageAboutPortrait !== undefined) data.imageAboutPortrait = emptyToNull(d.imageAboutPortrait)
  if (d.imageWorshipBg !== undefined) data.imageWorshipBg = emptyToNull(d.imageWorshipBg)
  if (d.imageCampusTourPortrait !== undefined) data.imageCampusTourPortrait = emptyToNull(d.imageCampusTourPortrait)
  if (d.campusTourMarquee1Urls !== undefined) {
    data.campusTourMarquee1Urls = d.campusTourMarquee1Urls.map((u) => u.trim()).filter(Boolean)
  }
  if (d.campusTourMarquee2Urls !== undefined) {
    data.campusTourMarquee2Urls = d.campusTourMarquee2Urls.map((u) => u.trim()).filter(Boolean)
  }
  if (d.galleryImageUrls !== undefined) data.galleryImageUrls = d.galleryImageUrls.map((u) => u.trim()).filter(Boolean)
  if (d.paystackPublicKey !== undefined) data.paystackPublicKey = emptyToNull(d.paystackPublicKey)
  if (d.paystackSecretKey !== undefined) data.paystackSecretKey = emptyToNull(d.paystackSecretKey)
  if (d.paystackEnabled !== undefined) data.paystackEnabled = d.paystackEnabled
  if (d.flutterwavePublicKey !== undefined) data.flutterwavePublicKey = emptyToNull(d.flutterwavePublicKey)
  if (d.flutterwaveSecretKey !== undefined) data.flutterwaveSecretKey = emptyToNull(d.flutterwaveSecretKey)
  if (d.flutterwaveEnabled !== undefined) data.flutterwaveEnabled = d.flutterwaveEnabled
  if (d.stripeEnabled !== undefined) data.stripeEnabled = d.stripeEnabled
  if (d.stripeSecretKey !== undefined) data.stripeSecretKey = emptyToNull(d.stripeSecretKey)
  if (d.stripePublishableKey !== undefined) data.stripePublishableKey = emptyToNull(d.stripePublishableKey)
  if (d.stripeWebhookSecret !== undefined) data.stripeWebhookSecret = emptyToNull(d.stripeWebhookSecret)
  if (d.brevoSmtpHost !== undefined) data.brevoSmtpHost = emptyToNull(d.brevoSmtpHost)
  if (d.brevoSmtpPort !== undefined) data.brevoSmtpPort = d.brevoSmtpPort
  if (d.brevoSmtpUser !== undefined) data.brevoSmtpUser = emptyToNull(d.brevoSmtpUser)
  if (d.brevoSmtpPass !== undefined) data.brevoSmtpPass = emptyToNull(d.brevoSmtpPass)
  if (d.brevoFromEmail !== undefined) data.brevoFromEmail = emptyToNull(d.brevoFromEmail)
  if (d.brevoFromName !== undefined) data.brevoFromName = emptyToNull(d.brevoFromName)
  if (d.brevoNotifyEmail !== undefined) data.brevoNotifyEmail = emptyToNull(d.brevoNotifyEmail)
  if (d.heroTagline !== undefined) data.heroTagline = emptyToNull(d.heroTagline)
  if (d.aboutBioShort !== undefined) data.aboutBioShort = emptyToNull(d.aboutBioShort)
  if (d.footerCopyright !== undefined) data.footerCopyright = emptyToNull(d.footerCopyright)
  if (d.locationDisplay !== undefined) data.locationDisplay = emptyToNull(d.locationDisplay)

  try {
    const row = await prisma.siteSettings.upsert({
      where: { id: 1 },
      create: { id: 1, ...(data as object) },
      update: data,
    })
    return NextResponse.json(row)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Save failed' }, { status: 500 })
  }
}
