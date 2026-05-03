'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { BookingStatus } from '@prisma/client'

const STATUSES: BookingStatus[] = ['PENDING', 'REVIEWING', 'CONFIRMED', 'DECLINED']

const statusStyle: Record<BookingStatus, string> = {
  PENDING: 'border-amber-500/40 bg-amber-500/10 text-amber-900',
  REVIEWING: 'border-blue-500/40 bg-blue-500/10 text-blue-900',
  CONFIRMED: 'border-emerald-600/40 bg-emerald-600/10 text-emerald-900',
  DECLINED: 'border-red-600/40 bg-red-600/10 text-red-900',
}

export default function BookingDetailForm({
  bookingId,
  initialStatus,
  initialNotes,
  bookerEmail,
  eventName,
  fullName,
  submittedAt,
}: {
  bookingId: string
  initialStatus: BookingStatus
  initialNotes: string
  bookerEmail: string
  eventName: string
  fullName: string
  submittedAt: string
}) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus)
  const [notes, setNotes] = useState(initialNotes)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const replySubject = encodeURIComponent(`Re: ${eventName}`)
  const replyBody = encodeURIComponent(`Dear ${fullName},\n\n`)
  const mailto = `mailto:${bookerEmail}?subject=${replySubject}&body=${replyBody}`

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
    <div className="admin-card space-y-6 p-6 sm:p-8">
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-admin-muted">Submitted</p>
      <p className="text-sm text-admin-text">{submittedAt}</p>

      <form onSubmit={onSave} className="space-y-6 border-t border-admin-border pt-6">
        <div>
          <label className="admin-label">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as BookingStatus)}
            className={`admin-input border-2 ${statusStyle[status]}`}
          >
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
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <a href={mailto} className="admin-btn admin-btn-secondary inline-flex items-center text-[10px]">
            Reply by email
          </a>
        </div>
      </form>
    </div>
  )
}
