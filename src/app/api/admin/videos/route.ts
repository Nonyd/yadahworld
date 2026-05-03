import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { Prisma } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

function describeDbError(e: unknown): string {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === 'P2021') {
      return 'The SiteVideo table is missing. From the project root run: npx prisma db push'
    }
    if (e.code === 'P2002') {
      return 'A unique constraint failed. Check for duplicate data.'
    }
  }
  if (e instanceof Prisma.PrismaClientInitializationError) {
    return 'Database connection failed. Check DATABASE_URL and that the database is reachable.'
  }
  if (process.env.NODE_ENV === 'development' && e instanceof Prisma.PrismaClientKnownRequestError) {
    return `Database error (${e.code}). Check the terminal where next dev is running for details.`
  }
  return 'Create failed'
}

const createSchema = z.object({
  title: z.string().min(1),
  youtubeUrl: z.string().min(1),
  thumbnailUrl: z.string().optional().nullable(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const items = await prisma.siteVideo.findMany({
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
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  const d = parsed.data
  const thumb = d.thumbnailUrl?.trim() || null

  try {
    const row = await prisma.siteVideo.create({
      data: {
        title: d.title.trim(),
        youtubeUrl: d.youtubeUrl.trim(),
        thumbnailUrl: thumb,
        order: d.order ?? 0,
        isActive: d.isActive ?? true,
      },
    })
    return NextResponse.json(row)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: describeDbError(e) }, { status: 500 })
  }
}
