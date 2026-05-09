import { prisma } from '@/lib/prisma'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { formatNgnKobo } from '@/lib/shop-money'
import OrdersExportButton from '@/components/admin/shop/OrdersExportButton'
import AdminOrdersTable from '@/components/admin/shop/AdminOrdersTable'
import type { OrderStatus } from '@prisma/client'

const STATUSES: (OrderStatus | 'ALL')[] = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string }
}) {
  const q = searchParams.q?.trim()
  const st = searchParams.status as OrderStatus | 'ALL' | undefined

  const filters: { status?: OrderStatus; OR?: { orderNumber?: object; customerEmail?: object }[] }[] = []
  if (st && st !== 'ALL') filters.push({ status: st as OrderStatus })
  if (q) {
    filters.push({
      OR: [
        { orderNumber: { contains: q, mode: 'insensitive' as const } },
        { customerEmail: { contains: q, mode: 'insensitive' as const } },
      ],
    })
  }
  const where = filters.length ? { AND: filters } : {}

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { items: { select: { id: true } } },
    take: 300,
  })

  const exportRows = orders.map((o) => ({
    orderNumber: o.orderNumber,
    createdAt: o.createdAt.toISOString(),
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    items: o.items.length,
    total: o.total,
    paymentStatus: o.paymentStatus,
    status: o.status,
  }))

  const tableRows = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    dateDisplay: o.createdAt.toLocaleDateString(),
    customerName: o.customerName,
    itemCount: o.items.length,
    totalDisplay: formatNgnKobo(o.total),
    paymentStatus: o.paymentStatus,
    status: o.status,
  }))

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <AdminPageHeader title="Orders" description="Shop purchases, payment status, and fulfillment." />
        <OrdersExportButton rows={exportRows} />
      </div>

      <form className="mb-6 flex flex-wrap items-end gap-3" method="get">
        <div>
          <label className="admin-label">Search</label>
          <input name="q" defaultValue={q} className="admin-input w-56" placeholder="Order # or email" />
        </div>
        <div>
          <label className="admin-label">Status</label>
          <select name="status" className="admin-input w-44" defaultValue={st ?? 'ALL'}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="admin-btn admin-btn-secondary text-[10px]">
          Filter
        </button>
      </form>

      {orders.length === 0 ? (
        <p className="text-sm text-admin-muted">No orders yet.</p>
      ) : (
        <AdminOrdersTable orders={tableRows} />
      )}
    </div>
  )
}
