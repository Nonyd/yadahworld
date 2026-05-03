'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const onDelete = async () => {
    if (!confirm('Delete this product?')) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      router.push('/admin/products')
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <button type="button" disabled={busy} onClick={onDelete} className="admin-btn admin-btn-ghost text-red-700 hover:bg-red-50">
      {busy ? '…' : 'Delete'}
    </button>
  )
}
