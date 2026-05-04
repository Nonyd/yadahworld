import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PlaylistSlot } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { extractYoutubePlaylistId } from '@/lib/youtube'
import { z } from 'zod'

const slotSchema = z.nativeEnum(PlaylistSlot)

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  youtubePlaylistId: z.string().min(1).optional(),
  slot: slotSchema.optional(),
  maxVideos: z.number().int().min(1).max(200).optional(),
  isActive: z.boolean().optional(),
})

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
  const data: Record<string, unknown> = {}
  if (d.name !== undefined) data.name = d.name.trim()
  if (d.youtubePlaylistId !== undefined) {
    const id = extractYoutubePlaylistId(d.youtubePlaylistId)
    if (!id) return NextResponse.json({ error: 'Invalid YouTube playlist id or URL' }, { status: 400 })
    data.youtubePlaylistId = id
  }
  if (d.slot !== undefined) data.slot = d.slot
  if (d.maxVideos !== undefined) data.maxVideos = d.maxVideos
  if (d.isActive !== undefined) data.isActive = d.isActive

  try {
    await prisma.youTubePlaylist.update({
      where: { id: params.id },
      data,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await prisma.youTubePlaylist.delete({ where: { id: params.id } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
