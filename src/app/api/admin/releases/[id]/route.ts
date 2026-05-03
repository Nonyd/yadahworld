import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  feat: z.string().optional().nullable(),
  type: z.string().min(1).optional(),
  year: z.string().min(1).optional(),
  cover: z.string().min(1).optional(),
  spotify: z.string().optional().nullable(),
  apple: z.string().optional().nullable(),
  youtube: z.string().optional().nullable(),
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
  try {
    await prisma.siteRelease.update({
      where: { id: params.id },
      data: {
        ...(d.title !== undefined && { title: d.title.trim() }),
        ...(d.feat !== undefined && { feat: emptyToNull(d.feat) }),
        ...(d.type !== undefined && { type: d.type.trim() }),
        ...(d.year !== undefined && { year: d.year.trim() }),
        ...(d.cover !== undefined && { cover: d.cover.trim() }),
        ...(d.spotify !== undefined && { spotify: emptyToNull(d.spotify) }),
        ...(d.apple !== undefined && { apple: emptyToNull(d.apple) }),
        ...(d.youtube !== undefined && { youtube: emptyToNull(d.youtube) }),
        ...(d.isNew !== undefined && { isNew: d.isNew }),
        ...(d.order !== undefined && { order: d.order }),
      },
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
