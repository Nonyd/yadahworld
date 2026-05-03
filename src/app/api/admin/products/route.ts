import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uniqueProductSlug } from '@/lib/site-content'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  price: z.number().int().min(0),
  currency: z.enum(['NGN', 'USD']).optional(),
  category: z.string().optional().nullable(),
  inStock: z.boolean().optional(),
  images: z.array(z.string()).max(5).optional(),
  stripeId: z.string().optional().nullable(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const items = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
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
  const slug = (d.slug?.trim() && d.slug.trim()) || (await uniqueProductSlug(d.name))
  const images = (d.images ?? []).map((u) => u.trim()).filter(Boolean).slice(0, 5)

  try {
    const row = await prisma.product.create({
      data: {
        name: d.name.trim(),
        slug,
        description: d.description?.trim() || null,
        price: d.price,
        currency: d.currency ?? 'NGN',
        category: d.category?.trim() || null,
        inStock: d.inStock ?? true,
        images,
        stripeId: d.stripeId?.trim() || null,
      },
    })
    return NextResponse.json(row)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
