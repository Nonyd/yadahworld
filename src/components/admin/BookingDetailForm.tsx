'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { BookingStatus } from '@prisma/client'

const STATUSES: BookingStatus[] = ['PENDING', 'REVIEWING', 'CONFIRMED', 'DECLINED']

export default function BookingDetailForm({
  bookingId,
  initialStatus,
  initialNotes,
}: {
  bookingId: string
  initialStatus: BookingStatus
  initialNotes: string
}) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus)
  const [notes, setNotes] = useState(initialNotes)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes: notes }),
      })
      if (!res.ok) throw new Error('Failed')
      setMsg('Saved.')
      router.refresh()
    } catch {
      setMsg('Could not save. Check database and API route.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSave} className="admin-card space-y-6 p-6 sm:p-8">
      <div>
        <label className="admin-label">Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value as BookingStatus)} className="admin-input">
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="admin-label">Admin notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="admin-input min-h-[120px] resize-y" rows={4} />
      </div>
      {msg && <p className="text-sm text-admin-muted">{msg}</p>}
      <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}
