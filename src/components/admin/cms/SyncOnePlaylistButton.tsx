'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SyncOnePlaylistButton({ playlistId }: { playlistId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const onClick = async () => {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/playlists/${playlistId}/sync`, { method: 'POST' })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j.error || 'Sync failed')
      router.refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Sync failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <button type="button" disabled={busy} onClick={onClick} className="admin-btn admin-btn-ghost text-[10px]">
      {busy ? '…' : 'Sync now'}
    </button>
  )
}
