'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeletePlaylistButton({ id }: { id: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const onDelete = async () => {
    if (!confirm('Delete this playlist? Cached videos from this playlist will be removed.')) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/playlists/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      router.push('/admin/playlists')
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={onDelete}
      className="admin-btn admin-btn-ghost text-red-700 hover:bg-red-50"
    >
      {busy ? '…' : 'Delete'}
    </button>
  )
}
