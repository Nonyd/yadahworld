import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slug'
import type { Prisma } from '@prisma/client'
import { z } from 'zod'

const tierSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
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

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'COMING_SOON', 'PUBLISHED', 'CANCELLED', 'PAST']).optional(),
  type: z.enum(['PHYSICAL', 'ONLINE', 'HYBRID']).optional(),
  isFeatured: z.boolean().optional(),
  date: z.string().min(1).optional(),
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
  tiers: z.array(tierSchema).optional(),
  speakers: z.array(speakerSchema).optional(),
})

function toMinorUnits(major: number) {
  return Math.round(major * 100)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
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
  const existing = await prisma.event.findUnique({
    where: { id: params.id },
    include: { tiers: true },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const eventUpdate: Prisma.EventUpdateInput = {}
  if (d.title !== undefined) eventUpdate.title = d.title.trim()
  if (d.slug !== undefined && d.slug !== null && d.slug.trim() !== '') {
    const next = slugify(d.slug.trim())
    if (next && next !== existing.slug) {
      const clash = await prisma.event.findFirst({ where: { slug: next, NOT: { id: params.id } } })
      if (clash) {
        return NextResponse.json({ error: 'Slug already in use' }, { status: 409 })
      }
    }
    eventUpdate.slug = next || existing.slug
  }
  if (d.status !== undefined) eventUpdate.status = d.status
  if (d.type !== undefined) eventUpdate.type = d.type
  if (d.isFeatured !== undefined) eventUpdate.isFeatured = d.isFeatured
  if (d.date !== undefined) {
    const date = new Date(d.date)
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
    }
    eventUpdate.date = date
  }
  if (d.endDate !== undefined) {
    if (d.endDate === null || d.endDate === '') {
      eventUpdate.endDate = null
    } else {
      const end = new Date(d.endDate)
      if (Number.isNaN(end.getTime())) {
        return NextResponse.json({ error: 'Invalid end date' }, { status: 400 })
      }
      eventUpdate.endDate = end
    }
  }
  if (d.doorsOpen !== undefined) eventUpdate.doorsOpen = d.doorsOpen?.trim() || null
  if (d.timezone !== undefined) eventUpdate.timezone = d.timezone?.trim() || 'Africa/Lagos'
  if (d.venueName !== undefined) eventUpdate.venueName = d.venueName?.trim() || null
  if (d.venueAddress !== undefined) eventUpdate.venueAddress = d.venueAddress?.trim() || null
  if (d.venueCity !== undefined) eventUpdate.venueCity = d.venueCity?.trim() || null
  if (d.venueCountry !== undefined) eventUpdate.venueCountry = d.venueCountry?.trim() || 'Nigeria'
  if (d.isOnline !== undefined) eventUpdate.isOnline = d.isOnline
  if (d.streamUrl !== undefined) eventUpdate.streamUrl = d.streamUrl?.trim() || null
  if (d.bannerImage !== undefined) eventUpdate.bannerImage = d.bannerImage?.trim() || null
  if (d.description !== undefined) eventUpdate.description = d.description ?? null
  if (d.dressCode !== undefined) eventUpdate.dressCode = d.dressCode?.trim() || null
  if (d.requirements !== undefined) eventUpdate.requirements = d.requirements ?? null
  if (d.totalCapacity !== undefined) eventUpdate.totalCapacity = d.totalCapacity ?? null

  try {
    await prisma.$transaction(async (tx) => {
      if (Object.keys(eventUpdate).length > 0) {
        await tx.event.update({
          where: { id: params.id },
          data: eventUpdate,
        })
      }

      if (d.tiers) {
        const submittedIds = new Set(d.tiers.map((t) => t.id).filter((id): id is string => Boolean(id)))
        for (const ex of existing.tiers) {
          if (!submittedIds.has(ex.id)) {
            const regCount = await tx.eventRegistration.count({ where: { tierId: ex.id } })
            if (regCount > 0) {
              await tx.ticketTier.update({
                where: { id: ex.id },
                data: { isActive: false },
              })
            } else {
              await tx.ticketTier.delete({ where: { id: ex.id } })
            }
          }
        }

        for (const t of d.tiers) {
          const price = toMinorUnits(t.price)
          const cap = t.capacity ?? null
          const isAct = t.isActive ?? true
          if (t.id && existing.tiers.some((e) => e.id === t.id)) {
            const ex = existing.tiers.find((e) => e.id === t.id)!
            if (cap !== null && cap < ex.sold) {
              throw new Error(`Tier "${t.name}" capacity cannot be below tickets sold (${ex.sold}).`)
            }
            await tx.ticketTier.update({
              where: { id: t.id },
              data: {
                name: t.name.trim(),
                description: t.description?.trim() || null,
                price,
                currency: t.currency,
                capacity: cap,
                isActive: isAct,
              },
            })
          } else {
            await tx.ticketTier.create({
              data: {
                eventId: params.id,
                name: t.name.trim(),
                description: t.description?.trim() || null,
                price,
                currency: t.currency,
                capacity: cap,
                isActive: isAct,
              },
            })
          }
        }
      }

      if (d.speakers) {
        await tx.eventSpeaker.deleteMany({ where: { eventId: params.id } })
        if (d.speakers.length > 0) {
          await tx.eventSpeaker.createMany({
            data: d.speakers.map((s, i) => ({
              eventId: params.id,
              name: s.name.trim(),
              role: s.role?.trim() || null,
              bio: s.bio?.trim() || null,
              photo: s.photo?.trim() || null,
              order: s.order ?? i,
            })),
          })
        }
      }
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Update failed'
    console.error(e)
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const updated = await prisma.event.findUnique({
    where: { id: params.id },
    select: { slug: true },
  })
  try {
    revalidatePath('/events')
    revalidatePath(`/events/${existing.slug}`)
    if (updated?.slug && updated.slug !== existing.slug) {
      revalidatePath(`/events/${updated.slug}`)
    }
    revalidatePath('/', 'layout')
  } catch (revErr) {
    console.warn('revalidatePath after event update:', revErr)
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const row = await prisma.event.findUnique({
    where: { id: params.id },
    select: { slug: true },
  })
  if (!row) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    await prisma.event.delete({ where: { id: params.id } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }

  try {
    revalidatePath('/events')
    revalidatePath(`/events/${row.slug}`)
    revalidatePath('/', 'layout')
  } catch (revErr) {
    console.warn('revalidatePath after event delete:', revErr)
  }

  return NextResponse.json({ ok: true })
}
