import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { formatNgnKobo } from '@/lib/shop-money'

type Props = { params: { orderNumber: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Order ${params.orderNumber}` }
}

export default async function OrderConfirmedPage({ params }: Props) {
  const orderNumber = decodeURIComponent(params.orderNumber || '').trim()
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  })
  if (!order) notFound()

  return (
    <div className="min-h-screen pt-40 pb-32 px-8 md:px-20" style={{ background: 'var(--bg)' }}>
      <div className="max-w-screen-md mx-auto text-center">
        <p className="eyebrow mb-4">Thank you</p>
        <h1 className="display-3 text-body mb-6">Your order is confirmed</h1>
        <p className="body-lg mb-2 text-muted">
          Order number <span className="font-mono text-body">{order.orderNumber}</span>
        </p>
        <p className="font-playfair text-2xl text-accent mb-10">{formatNgnKobo(order.total)}</p>

        <ul className="mb-10 space-y-2 text-left font-jost text-sm text-body">
          {order.items.map((it) => (
            <li key={it.id} className="flex justify-between border-b border-[rgba(42,37,32,0.06)] py-2">
              <span>
                {it.name}
                {it.variantLabel ? <span className="text-muted"> — {it.variantLabel}</span> : null} ×{it.quantity}
              </span>
              <span>{formatNgnKobo(it.price * it.quantity)}</span>
            </li>
          ))}
        </ul>

        <p className="body-sm text-muted mb-10">Check your email for order confirmation.</p>
        <Link href="/shop" className="btn-primary inline-flex">
          Back to shop
        </Link>
      </div>
    </div>
  )
}
