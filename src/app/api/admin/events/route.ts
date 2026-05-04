import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slug'
import { z } from 'zod'

const tierSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  /** Major currency units (e.g. NGN naira); stored as ×100 minor units */
  price: z.number().nonnegative(),
  currency: z.enum(['NGN', 'USD']),
  capacity: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().optional(),
})

const speakerSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  photo: z.string().optional().nullable(),
  order: z.number().int().optional(),
})

const createSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'COMING_SOON', 'PUBLISHED', 'CANCELLED', 'PAST']),
  type: z.enum(['PHYSICAL', 'ONLINE', 'HYBRID']),
  isFeatured: z.boolean().optional(),
  date: z.string().min(1),
  endDate: z.string().optional().nullable(),
  doorsOpen: z.string().optional().nullable(),
  timezone: z.string().optional(),
  venueName: z.string().optional().nullable(),
  venueAddress: z.string().optional().nullable(),
  venueCity: z.string().optional().nullable(),
  venueCountry: z.string().optional().nullable(),
  isOnline: z.boolean().optional(),
  streamUrl: z.string().optional().nullable(),
  bannerImage: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  dressCode: z.string().optional().nullable(),
  requirements: z.string().optional().nullable(),
  totalCapacity: z.number().int().positive().nullable().optional(),
  tiers: z.array(tierSchema).default([]),
  speakers: z.array(speakerSchema).default([]),
})

function toMinorUnits(major: number) {
  return Math.round(major * 100)
}

async function uniqueSlug(base: string) {
  let s = base || 'event'
  let n = 0
  while (await prisma.event.findUnique({ where: { slug: s } })) {
    n += 1
    s = `${base}-${n}`
  }
  return s
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const items = await prisma.event.findMany({
      orderBy: { date: 'asc' },
      include: {
        _count: { select: { registrations: true, interests: true } },
      },
    })
    return NextResponse.json(items)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 })
  }

  const d = parsed.data
  const date = new Date(d.date)
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
  }

  let endDate: Date | null = null
  if (d.endDate) {
    endDate = new Date(d.endDate)
    if (Number.isNaN(endDate.getTime())) {
      return NextResponse.json({ error: 'Invalid end date' }, { status: 400 })
    }
  }

  const baseSlug = (d.slug?.trim() && slugify(d.slug.trim())) || slugify(d.title.trim()) || 'event'
  const slug = await uniqueSlug(baseSlug)

  try {
    const row = await prisma.event.create({
      data: {
        title: d.title.trim(),
        slug,
        status: d.status,
        type: d.type,
        isFeatured: d.isFeatured ?? false,
        date,
        endDate,
        doorsOpen: d.doorsOpen?.trim() || null,
        timezone: d.timezone?.trim() || 'Africa/Lagos',
        venueName: d.venueName?.trim() || null,
        venueAddress: d.venueAddress?.trim() || null,
        venueCity: d.venueCity?.trim() || null,
        venueCountry: d.venueCountry?.trim() || 'Nigeria',
        isOnline: d.isOnline ?? false,
        streamUrl: d.streamUrl?.trim() || null,
        bannerImage: d.bannerImage?.trim() || null,
        description: d.description ?? null,
        dressCode: d.dressCode?.trim() || null,
        requirements: d.requirements ?? null,
        totalCapacity: d.totalCapacity ?? null,
        tiers: {
          create: d.tiers.map((t) => ({
            name: t.name.trim(),
            description: t.description?.trim() || null,
            price: toMinorUnits(t.price),
            currency: t.currency,
            capacity: t.capacity ?? null,
            isActive: t.isActive ?? true,
          })),
        },
        speakers: {
          create: d.speakers.map((s, i) => ({
            name: s.name.trim(),
            role: s.role?.trim() || null,
            bio: s.bio?.trim() || null,
            photo: s.photo?.trim() || null,
            order: s.order ?? i,
          })),
        },
      },
      include: { tiers: true, speakers: true },
    })
    return NextResponse.json(row)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
