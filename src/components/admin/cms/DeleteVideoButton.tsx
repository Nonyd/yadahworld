'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteVideoButton({ id }: { id: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const onDelete = async () => {
    if (!confirm('Delete this video?')) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/videos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
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
