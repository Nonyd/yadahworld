'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteProductButton({
  id,
  disabled,
  onDeleted,
}: {
  id: string
  disabled?: boolean
  onDeleted?: () => void
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const onDelete = async () => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      if (!res.ok) {
        alert(typeof data?.error === 'string' ? data.error : 'Could not delete product.')
        return
      }
      onDeleted?.()
      router.refresh()
    } finally {
      setBusy(false)
    }
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
