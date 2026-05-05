import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { orderNumber: string } }) {
  const orderNumber = decodeURIComponent(params.orderNumber || '').trim()
  if (!orderNumber) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: { product: { select: { images: true } } },
      },
    },
  })
  if (!order) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    total: order.total,
    customerName: order.customerName,
    items: order.items.map((it) => ({
      name: it.name,
      variantLabel: it.variantLabel,
      quantity: it.quantity,
      price: it.price,
      image: it.product.images[0] ?? null,
    })),
  })
}
