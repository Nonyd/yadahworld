'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SyncSpotifyButton({
  lastSyncAt,
  lastSyncNote,
}: {
  lastSyncAt?: string | Date | null
  lastSyncNote?: string | null
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState(lastSyncNote ?? '')

  const lastLabel = lastSyncAt
    ? new Date(lastSyncAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
    : 'Never'

  const onClick = async () => {
    setBusy(true)
    setNote('')
    try {
      const res = await fetch('/api/admin/releases/sync-spotify', { method: 'POST' })
      const j = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        note?: string
        error?: string
      }
      if (!res.ok) throw new Error(j.error || j.note || 'Sync failed')
      setNote(j.note || (j.ok ? 'Sync complete' : 'Sync finished with issues'))
      router.refresh()
    } catch (e) {
      setNote(e instanceof Error ? e.message : 'Sync failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-1 sm:items-end">
      <button
        type="button"
        disabled={busy}
        onClick={onClick}
        className="admin-btn admin-btn-secondary text-[10px]"
      >
        {busy ? (
          <span className="inline-flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-admin-border border-t-admin-accent"
              aria-hidden
            />
            Syncing…
          </span>
        ) : (
          'Sync from Spotify'
        )}
      </button>
      <p className="max-w-xs text-right text-[11px] leading-snug text-admin-muted">
        Last sync: <span className="text-admin-text">{lastLabel}</span>
        {note ? <> — {note}</> : null}
      </p>
    </div>
  )
}
