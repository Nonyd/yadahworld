import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { OrderStatus, Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') as OrderStatus | 'ALL' | null
  const q = searchParams.get('q')?.trim()

  const filters: Prisma.OrderWhereInput[] = []
  if (status && status !== 'ALL') filters.push({ status })
  if (q) {
    filters.push({
      OR: [
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { customerEmail: { contains: q, mode: 'insensitive' } },
      ],
    })
  }
  const where: Prisma.OrderWhereInput = filters.length ? { AND: filters } : {}

  try {
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { items: { select: { id: true } } },
      take: 200,
    })
    return NextResponse.json(orders)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 })
  }
}
