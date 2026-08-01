import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uniqueReleaseSlug } from '@/lib/site-content'
import { slugify } from '@/lib/slug'
import { parseReleasedAtInput } from '@/lib/release-date'
import { parseSpotifyEmbedUrl } from '@/lib/spotify-embed'
import { parseLockedFields } from '@/lib/spotify-sync'
import { extractYoutubeVideoId } from '@/lib/youtube'
import { normalizeStreamingLinksJson } from '@/lib/streaming-links'
import { z } from 'zod'
import { logAdminApiActivity } from '@/lib/admin-activity-log'

const streamingLinkInput = z.object({
  label: z.string().min(1).max(120),
  url: z.string().min(1).max(2000),
})

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
  releasedAt: z.string().optional().nullable(),
  showOnHomepage: z.boolean().optional(),
  streamingLinks: z.array(streamingLinkInput).optional(),
})

function emptyToNull(s: string | null | undefined) {
  const t = s?.trim()
  return t ? t : null
}

function sameInstant(a: Date, b: Date) {
  return a.getTime() === b.getTime()
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
  if (d.releasedAt !== undefined) {
    data.releasedAt = parseReleasedAtInput(d.releasedAt, new Date())
  }
  if (d.showOnHomepage !== undefined) data.showOnHomepage = d.showOnHomepage
  if (d.streamingLinks !== undefined) {
    data.streamingLinks = normalizeStreamingLinksJson(d.streamingLinks)
  }

  if (d.slug !== undefined && d.slug !== null) {
    const raw = String(d.slug).trim()
    if (raw) {
      data.slug = await uniqueReleaseSlug(slugify(raw), params.id)
    }
  }

  const before = await prisma.siteRelease.findUnique({
    where: { id: params.id },
    select: {
      slug: true,
      spotifyAlbumId: true,
      lockedFields: true,
      title: true,
      type: true,
      year: true,
      cover: true,
      spotify: true,
      apple: true,
      releasedAt: true,
    },
  })
  if (!before) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Synced releases: editing a sync-owned field locks it against future Spotify overwrites.
  if (before.spotifyAlbumId) {
    const locked = parseLockedFields(before.lockedFields)
    if (d.title !== undefined && d.title.trim() !== before.title) locked.add('title')
    if (d.type !== undefined && d.type.trim() !== before.type) locked.add('type')
    if (d.year !== undefined && d.year.trim() !== before.year) locked.add('date')
    if (d.releasedAt !== undefined) {
      const next = parseReleasedAtInput(d.releasedAt, before.releasedAt)
      if (!sameInstant(next, before.releasedAt)) locked.add('date')
    }
    if (d.cover !== undefined && d.cover.trim() !== before.cover) {
      locked.add('cover')
      // Prefer the admin-uploaded cover over the synced Spotify image.
      data.coverExternalUrl = null
    }
    if (d.spotify !== undefined && emptyToNull(d.spotify) !== before.spotify) locked.add('spotify')
    if (d.apple !== undefined && emptyToNull(d.apple) !== before.apple) locked.add('apple')
    data.lockedFields = Array.from(locked)
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

  const after = await prisma.siteRelease.findUnique({
    where: { id: params.id },
    select: { slug: true },
  })
  try {
    revalidatePath('/releases')
    revalidatePath(`/releases/${before.slug}`)
    if (after?.slug && after.slug !== before.slug) {
      revalidatePath(`/releases/${after.slug}`)
    }
    revalidatePath('/', 'layout')
  } catch (revErr) {
    console.warn('revalidatePath after release update:', revErr)
  }

  await logAdminApiActivity(session, {
    method: 'PATCH',
    path: `${req.nextUrl.pathname}${req.nextUrl.search}`,
    req,
  })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const row = await prisma.siteRelease.findUnique({
    where: { id: params.id },
    select: { slug: true },
  })
  if (!row) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    await prisma.siteRelease.delete({ where: { id: params.id } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }

  try {
    revalidatePath('/releases')
    revalidatePath(`/releases/${row.slug}`)
    revalidatePath('/', 'layout')
  } catch (revErr) {
    console.warn('revalidatePath after release delete:', revErr)
  }

  await logAdminApiActivity(session, {
    method: 'DELETE',
    path: `${req.nextUrl.pathname}${req.nextUrl.search}`,
    req,
  })
  return NextResponse.json({ ok: true })
}
