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

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  price: z.number().int().min(0).optional(),
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

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const row = await prisma.product.findUnique({
      where: { id: params.id },
      include: { variants: true },
    })
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(row)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
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
  if (d.name !== undefined) data.name = d.name.trim()
  if (d.description !== undefined) data.description = d.description?.trim() || null
  if (d.price !== undefined) data.price = d.price
  if (d.comparePrice !== undefined) data.comparePrice = d.comparePrice ?? null
  if (d.category !== undefined) data.category = d.category?.trim() || null
  if (d.tags !== undefined) data.tags = d.tags.map((t) => t.trim()).filter(Boolean)
  if (d.images !== undefined) data.images = d.images.map((u) => u.trim()).filter(Boolean).slice(0, 20)
  if (d.type !== undefined) data.type = d.type
  if (d.isActive !== undefined) data.isActive = d.isActive
  if (d.isFeatured !== undefined) data.isFeatured = d.isFeatured
  if (d.digitalFile !== undefined) data.digitalFile = d.digitalFile?.trim() || null

  if (d.slug !== undefined && d.slug !== null) {
    const s = d.slug.trim()
    if (s) {
      const unique = await uniqueProductSlug(s, params.id)
      data.slug = unique
    }
  }

  const before = await prisma.product.findUnique({
    where: { id: params.id },
    select: { slug: true },
  })
  if (!before) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: params.id },
        data,
      })
      if (d.variants !== undefined) {
        await tx.productVariant.deleteMany({ where: { productId: params.id } })
        if (d.variants.length > 0) {
          await tx.productVariant.createMany({
            data: d.variants.map((v) => ({
              productId: params.id,
              name: v.name.trim(),
              value: v.value.trim(),
              stock: v.stock,
              price: v.price ?? null,
              sku: v.sku?.trim() || null,
            })),
          })
        }
      }
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  const after = await prisma.product.findUnique({
    where: { id: params.id },
    select: { slug: true },
  })
  try {
    revalidatePath('/shop')
    revalidatePath(`/shop/${before.slug}`)
    if (after?.slug && after.slug !== before.slug) {
      revalidatePath(`/shop/${after.slug}`)
    }
    revalidatePath('/', 'layout')
  } catch (revErr) {
    console.warn('revalidatePath after product update:', revErr)
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const row = await prisma.product.findUnique({
    where: { id: params.id },
    select: { slug: true },
  })
  if (!row) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    await prisma.product.delete({ where: { id: params.id } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }

  try {
    revalidatePath('/shop')
    revalidatePath(`/shop/${row.slug}`)
    revalidatePath('/', 'layout')
  } catch (revErr) {
    console.warn('revalidatePath after product delete:', revErr)
  }

  return NextResponse.json({ ok: true })
}
