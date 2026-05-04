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
  })
  .refine((d) => d.isActive !== undefined || d.isFeatured !== undefined, {
    message: 'Provide isActive and/or isFeatured',
  })

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

  const { isActive, isFeatured } = parsed.data

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

    const data: { isActive?: boolean; isFeatured?: boolean } = {}
    if (typeof isActive === 'boolean') data.isActive = isActive
    if (typeof isFeatured === 'boolean') data.isFeatured = isFeatured

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
