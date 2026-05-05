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
  initialDeclineReason,
  initialConfirmationNote,
  bookerEmail,
  eventName,
  fullName,
  submittedAt,
}: {
  bookingId: string
  initialStatus: BookingStatus
  initialNotes: string
  initialDeclineReason: string
  initialConfirmationNote: string
  bookerEmail: string
  eventName: string
  fullName: string
  submittedAt: string
}) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus)
  const [notes, setNotes] = useState(initialNotes)
  const [declineReason, setDeclineReason] = useState(initialDeclineReason)
  const [confirmationNote, setConfirmationNote] = useState(initialConfirmationNote)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [replyOpen, setReplyOpen] = useState(false)
  const [replySubject, setReplySubject] = useState(`Re: ${eventName}`)
  const [replyMessage, setReplyMessage] = useState(`Dear ${fullName},\n\n`)
  const [replySending, setReplySending] = useState(false)
  const [replyMsg, setReplyMsg] = useState('')

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          adminNotes: notes,
          declineReason,
          confirmationNote,
        }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error || 'Failed')
      }
      setMsg('Saved.')
      router.refresh()
    } catch (error) {
      setMsg(error instanceof Error ? error.message : 'Could not save. Check database and API route.')
    } finally {
      setSaving(false)
    }
  }

  const onReply = async (e: React.FormEvent) => {
    e.preventDefault()
    setReplyMsg('')
    setReplySending(true)
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: replySubject,
          message: replyMessage,
        }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error || 'Could not send.')
      }
      setReplyMsg(`Reply sent to ${bookerEmail}.`)
      setReplyOpen(false)
      router.refresh()
    } catch (error) {
      setReplyMsg(error instanceof Error ? error.message : 'Could not send.')
    } finally {
      setReplySending(false)
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
        {status === 'DECLINED' && (
          <div>
            <label className="admin-label">Decline reason</label>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="admin-input min-h-[120px] resize-y"
              rows={4}
              required
            />
          </div>
        )}
        {status === 'CONFIRMED' && (
          <div>
            <label className="admin-label">Confirmation note (from call)</label>
            <textarea
              value={confirmationNote}
              onChange={(e) => setConfirmationNote(e.target.value)}
              className="admin-input min-h-[120px] resize-y"
              rows={4}
            />
          </div>
        )}
        {msg && <p className="text-sm text-admin-muted">{msg}</p>}
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button type="button" onClick={() => setReplyOpen((v) => !v)} className="admin-btn admin-btn-secondary text-[10px]">
            {replyOpen ? 'Close reply' : 'Reply'}
          </button>
        </div>
      </form>
      {replyOpen && (
        <form onSubmit={onReply} className="space-y-4 border-t border-admin-border pt-6">
          <div>
            <label className="admin-label">Reply subject</label>
            <input value={replySubject} onChange={(e) => setReplySubject(e.target.value)} className="admin-input" required />
          </div>
          <div>
            <label className="admin-label">Reply message</label>
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              className="admin-input min-h-[140px] resize-y"
              rows={6}
              required
            />
          </div>
          {replyMsg && <p className="text-sm text-admin-muted">{replyMsg}</p>}
          <button type="submit" disabled={replySending} className="admin-btn admin-btn-primary">
            {replySending ? 'Sending…' : 'Send reply'}
          </button>
        </form>
      )}
    </div>
  )
}
