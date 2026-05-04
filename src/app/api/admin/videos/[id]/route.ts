import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PlaylistSlot } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const patchSchema = z
  .object({
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    featuredOrder: z.number().int().min(1).max(3).optional(),
  })
  .refine(
    (d) => d.isActive !== undefined || d.isFeatured !== undefined || d.featuredOrder !== undefined,
    { message: 'Provide at least one of isActive, isFeatured, featuredOrder' },
  )

const FEATURED_LIMIT = 3
const FEATURED_ERROR = 'Only 3 videos can be featured at once. Unfeature another first.'

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

  const { isActive, isFeatured, featuredOrder } = parsed.data
  const willUnfeature = isFeatured === false

  try {
    if (isFeatured === true) {
      const video = await prisma.cachedVideo.findUnique({
        where: { id: params.id },
        include: { playlist: { select: { slot: true, isActive: true } } },
      })
      if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      if (video.playlist.slot !== PlaylistSlot.MUSIC_VIDEOS) {
        return NextResponse.json(
          { error: 'Only music videos (MUSIC_VIDEOS playlist) can be featured on the homepage.' },
          { status: 400 },
        )
      }

      const othersFeatured = await prisma.cachedVideo.count({
        where: {
          id: { not: params.id },
          isFeatured: true,
          playlist: { slot: PlaylistSlot.MUSIC_VIDEOS },
        },
      })
      if (othersFeatured >= FEATURED_LIMIT) {
        return NextResponse.json({ error: FEATURED_ERROR }, { status: 400 })
      }
    }

    if (typeof featuredOrder === 'number' && !willUnfeature) {
      const video = await prisma.cachedVideo.findUnique({
        where: { id: params.id },
        include: { playlist: { select: { slot: true } } },
      })
      if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      if (video.playlist.slot !== PlaylistSlot.MUSIC_VIDEOS) {
        return NextResponse.json({ error: 'Only music videos can use featured order.' }, { status: 400 })
      }
      if (!video.isFeatured) {
        return NextResponse.json({ error: 'Feature this video before setting display order.' }, { status: 400 })
      }
    }

    const data: { isActive?: boolean; isFeatured?: boolean; featuredOrder?: number | null } = {}
    if (typeof isActive === 'boolean') data.isActive = isActive
    if (typeof isFeatured === 'boolean') {
      data.isFeatured = isFeatured
      if (isFeatured === false) data.featuredOrder = null
    }
    if (typeof featuredOrder === 'number' && !willUnfeature) {
      data.featuredOrder = featuredOrder
    }

    await prisma.cachedVideo.update({
      where: { id: params.id },
      data,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
