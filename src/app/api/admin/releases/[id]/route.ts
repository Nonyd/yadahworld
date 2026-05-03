import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uniqueReleaseSlug } from '@/lib/site-content'
import { slugify } from '@/lib/slug'
import { parseSpotifyEmbedUrl } from '@/lib/spotify-embed'
import { extractYoutubeVideoId } from '@/lib/youtube'
import { z } from 'zod'

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  feat: z.string().optional().nullable(),
  type: z.string().min(1).optional(),
  year: z.string().min(1).optional(),
  cover: z.string().min(1).optional(),
  spotify: z.string().optional().nullable(),
  spotifyEmbed: z.string().optional().nullable(),
  apple: z.string().optional().nullable(),
  youtube: z.string().optional().nullable(),
  musicVideoYoutube: z.string().optional().nullable(),
  isNew: z.boolean().optional(),
  order: z.number().int().optional(),
})

function emptyToNull(s: string | null | undefined) {
  const t = s?.trim()
  return t ? t : null
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
  const data: Record<string, unknown> = {}
  if (d.title !== undefined) data.title = d.title.trim()
  if (d.description !== undefined) data.description = emptyToNull(d.description)
  if (d.feat !== undefined) data.feat = emptyToNull(d.feat)
  if (d.type !== undefined) data.type = d.type.trim()
  if (d.year !== undefined) data.year = d.year.trim()
  if (d.cover !== undefined) data.cover = d.cover.trim()
  if (d.spotify !== undefined) data.spotify = emptyToNull(d.spotify)
  if (d.spotifyEmbed !== undefined) data.spotifyEmbed = parseSpotifyEmbedUrl(d.spotifyEmbed)
  if (d.apple !== undefined) data.apple = emptyToNull(d.apple)
  if (d.youtube !== undefined) data.youtube = emptyToNull(d.youtube)
  if (d.musicVideoYoutube !== undefined) {
    const u = emptyToNull(d.musicVideoYoutube)
    data.musicVideoYoutube = u && extractYoutubeVideoId(u) ? u : null
  }
  if (d.isNew !== undefined) data.isNew = d.isNew
  if (d.order !== undefined) data.order = d.order

  if (d.slug !== undefined && d.slug !== null) {
    const raw = String(d.slug).trim()
    if (raw) {
      data.slug = await uniqueReleaseSlug(slugify(raw), params.id)
    }
  }

  try {
    await prisma.siteRelease.update({
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
    await prisma.siteRelease.delete({ where: { id: params.id } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
