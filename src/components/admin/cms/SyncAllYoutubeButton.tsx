'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SyncAllYoutubeButton({ className = '' }: { className?: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const onClick = async () => {
    setBusy(true)
    try {
      const res = await fetch('/api/admin/playlists/sync-all', { method: 'POST' })
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
    <button type="button" disabled={busy} onClick={onClick} className={className || 'admin-btn admin-btn-secondary text-[10px]'}>
      {busy ? 'Syncing…' : 'Sync all'}
    </button>
  )
}
