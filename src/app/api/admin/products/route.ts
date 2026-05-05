import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uniqueProductSlug } from '@/lib/site-content'
import { z } from 'zod'

const variantSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
  stock: z.number().int().min(0),
  price: z.number().int().min(0).optional().nullable(),
  sku: z.string().optional().nullable(),
})

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  price: z.number().int().min(0),
  comparePrice: z.number().int().optional().nullable(),
  category: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).max(20).optional(),
  type: z.enum(['PHYSICAL', 'DIGITAL', 'BOOK']).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  digitalFile: z.string().optional().nullable(),
  variants: z.array(variantSchema).optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const items = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { variants: true },
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
  const slug = (d.slug?.trim() && d.slug.trim()) || (await uniqueProductSlug(d.name))
  const images = (d.images ?? []).map((u) => u.trim()).filter(Boolean).slice(0, 20)
  const tags = (d.tags ?? []).map((t) => t.trim()).filter(Boolean)

  try {
    const row = await prisma.product.create({
      data: {
        name: d.name.trim(),
        slug,
        description: d.description?.trim() || null,
        price: d.price,
        comparePrice: d.comparePrice ?? null,
        category: d.category?.trim() || null,
        tags,
        images,
        type: d.type ?? 'PHYSICAL',
        isActive: d.isActive ?? true,
        isFeatured: d.isFeatured ?? false,
        digitalFile: d.digitalFile?.trim() || null,
        variants:
          d.variants && d.variants.length > 0
            ? {
                create: d.variants.map((v) => ({
                  name: v.name.trim(),
                  value: v.value.trim(),
                  stock: v.stock,
                  price: v.price ?? null,
                  sku: v.sku?.trim() || null,
                })),
              }
            : undefined,
      },
    })
    try {
      revalidatePath('/shop')
      revalidatePath(`/shop/${row.slug}`)
      revalidatePath('/', 'layout')
    } catch (revErr) {
      console.warn('revalidatePath after product create:', revErr)
    }
    return NextResponse.json(row)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
