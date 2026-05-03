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
    <form onSubmit={onSave} className="border-t pt-10 space-y-6" style={{ borderColor: 'rgba(201,168,76,0.2)' }}>
      <div>
        <label className="ui-label mb-2 block" style={{ color: 'var(--muted)' }}>
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as BookingStatus)}
          className="field-input border border-[rgba(42,37,32,0.15)] px-3 py-2"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="ui-label mb-2 block" style={{ color: 'var(--muted)' }}>
          Admin notes
        </label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="field-textarea" rows={4} />
      </div>
      {msg && (
        <p className="font-jost text-sm" style={{ color: 'var(--muted)' }}>
          {msg}
        </p>
      )}
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}
