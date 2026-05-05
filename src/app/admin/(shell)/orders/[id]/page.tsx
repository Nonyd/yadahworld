import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import OrderDetailForm from '@/components/admin/shop/OrderDetailForm'

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: { include: { product: { select: { images: true } }, variant: true } },
    },
  })
  if (!order) notFound()

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/orders" className="text-[10px] font-medium uppercase tracking-[0.16em] text-admin-muted hover:text-admin-accent">
          ← Orders
        </Link>
      </div>
      <AdminPageHeader title={order.orderNumber} description="Shop order detail and fulfillment." />
      <div className="mt-8">
        <OrderDetailForm initial={order} />
      </div>
    </div>
  )
}
