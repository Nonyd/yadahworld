import { NextRequest, NextResponse } from 'next/server'
import { revalidateMediaAndMinistrations } from '@/lib/revalidate-public'
import { getServerSession } from 'next-auth/next'
import { PlaylistSlot } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { extractYoutubePlaylistId } from '@/lib/youtube'
import { z } from 'zod'

const slotSchema = z.nativeEnum(PlaylistSlot)

const createSchema = z.object({
  name: z.string().min(1),
  youtubePlaylistId: z.string().min(1),
  slot: slotSchema,
  maxVideos: z.number().int().min(1).max(200).optional(),
  isActive: z.boolean().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const items = await prisma.youTubePlaylist.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { videos: true } } },
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
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  const d = parsed.data
  const youtubePlaylistId = extractYoutubePlaylistId(d.youtubePlaylistId)
  if (!youtubePlaylistId) {
    return NextResponse.json({ error: 'Invalid YouTube playlist id or URL' }, { status: 400 })
  }

  try {
    const row = await prisma.youTubePlaylist.create({
      data: {
        name: d.name.trim(),
        youtubePlaylistId,
        slot: d.slot,
        maxVideos: d.maxVideos ?? 50,
        isActive: d.isActive ?? true,
      },
    })
    revalidateMediaAndMinistrations()
    return NextResponse.json(row)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Create failed — duplicate playlist id?' }, { status: 500 })
  }
}
