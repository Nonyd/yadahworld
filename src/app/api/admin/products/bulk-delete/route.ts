import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const bodySchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(200),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  const ids = Array.from(new Set(parsed.data.ids))

  const blockedRows = await prisma.orderItem.findMany({
    where: { productId: { in: ids } },
    select: { productId: true },
    distinct: ['productId'],
  })
  const skippedIds = blockedRows.map((r) => r.productId)
  const skippedSet = new Set(skippedIds)
  const toDelete = ids.filter((id) => !skippedSet.has(id))

  if (toDelete.length === 0) {
    return NextResponse.json({
      ok: true,
      deleted: 0,
      skippedIds,
    })
  }

  try {
    const rows = await prisma.product.findMany({
      where: { id: { in: toDelete } },
      select: { slug: true },
    })

    const del = await prisma.product.deleteMany({ where: { id: { in: toDelete } } })

    try {
      for (const r of rows) {
        revalidatePath(`/shop/${r.slug}`)
      }
      revalidatePath('/shop')
      revalidatePath('/', 'layout')
    } catch (revErr) {
      console.warn('revalidatePath after product bulk delete:', revErr)
    }

    return NextResponse.json({
      ok: true,
      deleted: del.count,
      skippedIds,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
