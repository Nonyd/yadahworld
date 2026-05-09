'use client'

import Link from 'next/link'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import DeleteOrderButton from '@/components/admin/shop/DeleteOrderButton'

export type AdminOrdersTableRow = {
  id: string
  orderNumber: string
  dateDisplay: string
  customerName: string
  itemCount: number
  totalDisplay: string
  paymentStatus: string
  status: string
}

export default function AdminOrdersTable({ orders }: { orders: AdminOrdersTableRow[] }) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleteBusy, setDeleteBusy] = useState(false)
  const selectAllRef = useRef<HTMLInputElement>(null)

  const allSelected = orders.length > 0 && selectedIds.length === orders.length
  const someSelected = selectedIds.length > 0 && !allSelected

  useEffect(() => {
    const el = selectAllRef.current
    if (el) el.indeterminate = someSelected
  }, [someSelected])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds([])
    else setSelectedIds(orders.map((o) => o.id))
  }

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return
    if (
      !confirm(
        `Delete ${selectedIds.length} order(s)? This permanently removes those orders and their line items. This cannot be undone.`,
      )
    ) {
      return
    }
    setDeleteBusy(true)
    try {
      const res = await fetch('/api/admin/orders/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      })
      const data = (await res.json().catch(() => null)) as { error?: string; deleted?: number } | null
      if (!res.ok) {
        alert(typeof data?.error === 'string' ? data.error : 'Could not delete orders.')
        return
      }
      setSelectedIds([])
      router.refresh()
    } finally {
      setDeleteBusy(false)
    }
  }

  return (
    <Fragment>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          disabled={deleteBusy || selectedIds.length === 0}
          onClick={() => void deleteSelected()}
          className="admin-btn admin-btn-secondary text-[10px] text-red-800 ring-1 ring-red-200 hover:bg-red-50"
        >
          Delete selected{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
        </button>
      </div>

      <div className="admin-card overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead>
            <tr className="border-b border-admin-border text-[10px] font-medium uppercase tracking-wider text-admin-muted">
              <th className="w-10 px-2 py-3 sm:px-3">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-admin-border"
                  aria-label="Select all orders"
                />
              </th>
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
                <td className="px-2 py-3 sm:px-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(o.id)}
                    onChange={() => toggleSelect(o.id)}
                    disabled={deleteBusy}
                    className="h-4 w-4 rounded border-admin-border"
                    aria-label={`Select order ${o.orderNumber}`}
                  />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-admin-text">{o.orderNumber}</td>
                <td className="px-4 py-3 text-admin-muted">{o.dateDisplay}</td>
                <td className="px-4 py-3 text-admin-muted">{o.customerName}</td>
                <td className="px-4 py-3 text-admin-muted">{o.itemCount}</td>
                <td className="px-4 py-3 text-admin-muted">{o.totalDisplay}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-admin-bg px-2 py-0.5 text-[10px] uppercase text-admin-muted">{o.paymentStatus}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-admin-accent/10 px-2 py-0.5 text-[10px] uppercase text-admin-accent">{o.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/orders/${o.id}`} className="admin-btn admin-btn-secondary text-[10px]">
                      View
                    </Link>
                    <DeleteOrderButton
                      id={o.id}
                      orderNumber={o.orderNumber}
                      disabled={deleteBusy}
                      onDeleted={() => setSelectedIds((prev) => prev.filter((x) => x !== o.id))}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Fragment>
  )
}
