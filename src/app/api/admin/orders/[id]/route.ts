import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { OrderStatus, Prisma } from '@prisma/client'
import { sendShopOrderStatusEmail } from '@/lib/shop-emails'
import { logAdminApiActivity } from '@/lib/admin-activity-log'

const patchSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']).optional(),
  trackingNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  sendStatusEmail: z.boolean().optional(),
})

function statusLabel(s: OrderStatus): string {
  switch (s) {
    case 'PENDING':
      return 'pending'
    case 'PROCESSING':
      return 'processing'
    case 'SHIPPED':
      return 'shipped'
    case 'DELIVERED':
      return 'delivered'
    case 'CANCELLED':
      return 'cancelled'
    case 'REFUNDED':
      return 'refunded'
  }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: { include: { product: { select: { images: true } }, variant: true } },
      },
    })
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(order)
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

  const before = await prisma.order.findUnique({ where: { id: params.id } })
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const d = parsed.data
  const data: Prisma.OrderUpdateInput = {}
  if (d.trackingNumber !== undefined) data.trackingNumber = d.trackingNumber?.trim() || null
  if (d.notes !== undefined) data.notes = d.notes?.trim() || null

  let history = (before.statusHistory as unknown as { status: string; at: string; note?: string }[] | null) ?? []
  if (d.status !== undefined && d.status !== before.status) {
    data.status = d.status
    history = [...history, { status: d.status, at: new Date().toISOString(), note: d.notes?.trim() || undefined }]
    data.statusHistory = history as unknown as Prisma.InputJsonValue
    if (d.status === 'SHIPPED') data.shippedAt = new Date()
    if (d.status === 'DELIVERED') data.deliveredAt = new Date()
  }

  try {
    await prisma.order.update({
      where: { id: params.id },
      data,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  if (d.sendStatusEmail) {
    const fresh = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true },
    })
    if (fresh) {
      try {
        await sendShopOrderStatusEmail(fresh, statusLabel(fresh.status))
        await prisma.order.update({
          where: { id: params.id },
          data: { lastStatusEmailAt: new Date() },
        })
      } catch (e) {
        console.error('sendShopOrderStatusEmail', e)
      }
    }
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

  const existing = await prisma.order.findUnique({
    where: { id: params.id },
    select: { id: true },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    await prisma.order.delete({ where: { id: params.id } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }

  await logAdminApiActivity(session, {
    method: 'DELETE',
    path: `${req.nextUrl.pathname}${req.nextUrl.search}`,
    req,
  })
  return NextResponse.json({ ok: true })
}
