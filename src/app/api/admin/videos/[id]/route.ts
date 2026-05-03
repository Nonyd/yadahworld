import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  youtubeUrl: z.string().min(1).optional(),
  thumbnailUrl: z.string().optional().nullable(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
})

function emptyToNull(s: string | null | undefined) {
  const t = s?.trim()
  return t === '' || t === undefined ? null : t
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
  if (d.youtubeUrl !== undefined) data.youtubeUrl = d.youtubeUrl.trim()
  if (d.thumbnailUrl !== undefined) data.thumbnailUrl = emptyToNull(d.thumbnailUrl)
  if (d.order !== undefined) data.order = d.order
  if (d.isActive !== undefined) data.isActive = d.isActive

  try {
    await prisma.siteVideo.update({
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
    await prisma.siteVideo.delete({ where: { id: params.id } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
