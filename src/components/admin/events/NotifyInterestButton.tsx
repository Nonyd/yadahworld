'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NotifyInterestButton({ eventId, pendingCount }: { eventId: string; pendingCount: number }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const onClick = async () => {
    if (pendingCount < 1) {
      setMsg('No pending subscribers to notify.')
      return
    }
    if (!confirm(`Send “registration open” to ${pendingCount} subscriber(s) who have not been notified?`)) return
    setBusy(true)
    setMsg('')
    try {
      const res = await fetch(`/api/admin/events/${eventId}/notify-interest`, { method: 'POST' })
      const j = (await res.json()) as { message?: string; error?: string }
      if (!res.ok) throw new Error(j.error || 'Failed')
      setMsg(j.message ?? 'Sent.')
      router.refresh()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <button type="button" disabled={busy} className="admin-btn admin-btn-primary text-[10px]" onClick={() => void onClick()}>
        {busy ? 'Sending…' : 'Notify all not yet notified'}
      </button>
      {msg && <p className="mt-2 text-sm text-admin-muted">{msg}</p>}
    </div>
  )
}
