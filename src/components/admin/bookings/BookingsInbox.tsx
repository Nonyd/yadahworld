'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export type BookingRow = {
  id: string
  createdAt: string
  fullName: string
  churchName: string
  eventName: string
  eventDate: string
  status: string
}

export default function BookingsInbox({ bookings }: { bookings: BookingRow[] }) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const selectAllRef = useRef<HTMLInputElement>(null)

  const allSelected = bookings.length > 0 && selectedIds.length === bookings.length
  const someSelected = selectedIds.length > 0 && !allSelected

  useEffect(() => {
    const el = selectAllRef.current
    if (el) el.indeterminate = someSelected
  }, [someSelected])

  const toggle = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds([])
    else setSelectedIds(bookings.map((b) => b.id))
  }

  const deleteOne = async (id: string) => {
    if (!confirm('Delete this booking request? This cannot be undone.')) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setSelectedIds((prev) => prev.filter((x) => x !== id))
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Delete ${selectedIds.length} booking request(s)? This cannot be undone.`)) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin/bookings/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      })
      if (!res.ok) throw new Error()
      setSelectedIds([])
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={busy || selectedIds.length === 0}
            onClick={() => void deleteSelected()}
            className="admin-btn admin-btn-secondary text-[10px] text-red-800 ring-1 ring-red-200 hover:bg-red-50"
          >
            Delete selected{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
          </button>
        </div>
      </div>

      <div className="admin-card overflow-x-auto">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead>
            <tr className="border-b border-admin-border bg-black/[0.02] text-[10px] font-medium uppercase tracking-[0.14em] text-admin-muted">
              <th className="w-10 px-2 py-3 sm:px-3">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-admin-border"
                  aria-label="Select all"
                />
              </th>
              <th className="px-4 py-3 font-medium sm:px-6">Date</th>
              <th className="px-4 py-3 font-medium sm:px-6">Name</th>
              <th className="px-4 py-3 font-medium sm:px-6">Organisation</th>
              <th className="px-4 py-3 font-medium sm:px-6">Event</th>
              <th className="px-4 py-3 font-medium sm:px-6">Event date</th>
              <th className="px-4 py-3 font-medium sm:px-6">Status</th>
              <th className="px-4 py-3 text-right font-medium sm:px-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {bookings.map((b) => (
              <tr key={b.id} className="text-admin-text transition-colors hover:bg-black/[0.02]">
                <td className="px-2 py-3 sm:px-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(b.id)}
                    onChange={() => toggle(b.id)}
                    className="h-4 w-4 rounded border-admin-border"
                    aria-label={`Select ${b.fullName}`}
                  />
                </td>
                <td className="px-4 py-3 text-admin-muted sm:px-6">{b.createdAt}</td>
                <td className="px-4 py-3 font-medium sm:px-6">{b.fullName}</td>
                <td className="px-4 py-3 text-admin-muted sm:px-6">{b.churchName}</td>
                <td className="px-4 py-3 sm:px-6">{b.eventName}</td>
                <td className="px-4 py-3 text-admin-muted sm:px-6">{b.eventDate}</td>
                <td className="px-4 py-3 sm:px-6">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                      b.status === 'PENDING'
                        ? 'bg-amber-50 text-amber-900'
                        : b.status === 'CONFIRMED'
                          ? 'bg-emerald-50 text-emerald-800'
                          : b.status === 'REVIEWING'
                            ? 'bg-sky-50 text-sky-800'
                            : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right sm:px-6">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/bookings/${b.id}`} className="admin-btn admin-btn-ghost text-[10px]">
                      View
                    </Link>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void deleteOne(b.id)}
                      className="admin-btn admin-btn-ghost text-[10px] text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
