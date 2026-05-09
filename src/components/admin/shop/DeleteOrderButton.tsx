'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteOrderButton({
  id,
  orderNumber,
  variant = 'row',
  disabled,
  onDeleted,
  /** When set (e.g. `/admin/orders` from the detail page), navigate after a successful delete. */
  redirectAfterDelete,
}: {
  id: string
  orderNumber: string
  variant?: 'row' | 'block'
  disabled?: boolean
  onDeleted?: () => void
  redirectAfterDelete?: string
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const onDelete = async () => {
    if (
      !confirm(
        `Delete order ${orderNumber}? This permanently removes the order and its line items. This cannot be undone.`,
      )
    ) {
      return
    }
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' })
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      if (!res.ok) {
        alert(typeof data?.error === 'string' ? data.error : 'Could not delete order.')
        return
      }
      onDeleted?.()
      if (redirectAfterDelete) router.push(redirectAfterDelete)
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  if (variant === 'block') {
    return (
      <button
        type="button"
        disabled={busy || disabled}
        onClick={() => void onDelete()}
        className="admin-btn admin-btn-secondary mt-4 w-full text-[10px] text-red-800 ring-1 ring-red-200 hover:bg-red-50"
      >
        {busy ? 'Deleting…' : 'Delete order'}
      </button>
    )
  }

  return (
    <button
      type="button"
      disabled={busy || disabled}
      onClick={() => void onDelete()}
      className="admin-btn admin-btn-ghost text-red-700 hover:bg-red-50"
    >
      {busy ? '…' : 'Delete'}
    </button>
  )
}
