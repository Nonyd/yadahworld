'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import DeleteProductButton from '@/components/admin/cms/DeleteProductButton'
import { formatNgnKobo } from '@/lib/shop-money'

export type AdminProductsTableRow = {
  id: string
  name: string
  type: 'PHYSICAL' | 'DIGITAL' | 'BOOK'
  price: number
  images: string[]
  isActive: boolean
  variants: { stock: number }[]
}

export default function AdminProductsTable({ products }: { products: AdminProductsTableRow[] }) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleteBusy, setDeleteBusy] = useState(false)
  const selectAllRef = useRef<HTMLInputElement>(null)

  const allSelected = products.length > 0 && selectedIds.length === products.length
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
    else setSelectedIds(products.map((p) => p.id))
  }

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Delete ${selectedIds.length} product(s)? This cannot be undone.`)) return
    setDeleteBusy(true)
    try {
      const res = await fetch('/api/admin/products/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      })
      const data = (await res.json().catch(() => null)) as {
        error?: string
        deleted?: number
        skippedIds?: string[]
      } | null
      if (!res.ok) {
        alert(typeof data?.error === 'string' ? data.error : 'Could not delete products.')
        return
      }
      const skipped = data?.skippedIds?.length ?? 0
      const deleted = data?.deleted ?? 0
      if (skipped > 0) {
        alert(
          `Deleted ${deleted} product(s). ${skipped} could not be removed because they appear on one or more orders.`,
        )
      }
      setSelectedIds([])
      router.refresh()
    } finally {
      setDeleteBusy(false)
    }
  }

  const rowStock = (p: AdminProductsTableRow) =>
    p.variants.length ? p.variants.reduce((s, v) => s + v.stock, 0) : p.type === 'DIGITAL' ? '—' : 0

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
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-admin-border text-[10px] font-medium uppercase tracking-wider text-admin-muted">
              <th className="w-10 px-2 py-3 sm:px-3">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-admin-border"
                  aria-label="Select all products"
                />
              </th>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const img = p.images[0]
              const stock = rowStock(p)
              return (
                <tr key={p.id} className="border-b border-admin-border/80 last:border-0">
                  <td className="px-2 py-3 sm:px-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      disabled={deleteBusy}
                      className="h-4 w-4 rounded border-admin-border"
                      aria-label={`Select ${p.name}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded border border-admin-border bg-admin-bg">
                      {img ? <Image src={img} alt="" fill className="object-cover" sizes="48px" /> : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-admin-text">{p.name}</td>
                  <td className="px-4 py-3 text-admin-muted">{p.type}</td>
                  <td className="px-4 py-3 text-admin-muted">{formatNgnKobo(p.price)}</td>
                  <td className="px-4 py-3 text-admin-muted">{stock}</td>
                  <td className="px-4 py-3">{p.isActive ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/products/${p.id}`} className="admin-btn admin-btn-secondary text-[10px]">
                        Edit
                      </Link>
                      <DeleteProductButton
                        id={p.id}
                        disabled={deleteBusy}
                        onDeleted={() => setSelectedIds((prev) => prev.filter((x) => x !== p.id))}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Fragment>
  )
}
