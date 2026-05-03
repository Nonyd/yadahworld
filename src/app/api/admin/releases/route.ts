import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSchema = z.object({
  title: z.string().min(1),
  feat: z.string().optional().nullable(),
  type: z.string().min(1),
  year: z.string().min(1),
  cover: z.string().min(1),
  spotify: z.string().optional().nullable(),
  apple: z.string().optional().nullable(),
  youtube: z.string().optional().nullable(),
  isNew: z.boolean().optional(),
  order: z.number().int().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const items = await prisma.siteRelease.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
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
  const emptyToNull = (s: string | null | undefined) => {
    const t = s?.trim()
    return t ? t : null
  }

  try {
    const row = await prisma.siteRelease.create({
      data: {
        title: d.title.trim(),
        feat: emptyToNull(d.feat),
        type: d.type.trim(),
        year: d.year.trim(),
        cover: d.cover.trim(),
        spotify: emptyToNull(d.spotify),
        apple: emptyToNull(d.apple),
        youtube: emptyToNull(d.youtube),
        isNew: d.isNew ?? false,
        order: d.order ?? 0,
      },
    })
    return NextResponse.json(row)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
