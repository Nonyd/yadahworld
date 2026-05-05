import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { formatNgnKobo } from '@/lib/shop-money'
import OrdersExportButton from '@/components/admin/shop/OrdersExportButton'
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
        <div className="admin-card overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-admin-border text-[10px] font-medium uppercase tracking-wider text-admin-muted">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-admin-border/80 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-admin-text">{o.orderNumber}</td>
                  <td className="px-4 py-3 text-admin-muted">{o.createdAt.toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-admin-muted">{o.customerName}</td>
                  <td className="px-4 py-3 text-admin-muted">{o.items.length}</td>
                  <td className="px-4 py-3 text-admin-muted">{formatNgnKobo(o.total)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-admin-bg px-2 py-0.5 text-[10px] uppercase text-admin-muted">{o.paymentStatus}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-admin-accent/10 px-2 py-0.5 text-[10px] uppercase text-admin-accent">{o.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/orders/${o.id}`} className="admin-btn admin-btn-secondary text-[10px]">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
