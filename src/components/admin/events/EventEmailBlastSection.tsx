'use client'

import { useState } from 'react'
import RichTextEditor from '@/components/admin/RichTextEditor'

export default function EventEmailBlastSection({
  eventId,
  eventTitle,
  confirmedCount,
}: {
  eventId: string
  eventTitle: string
  confirmedCount: number
}) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [feedback, setFeedback] = useState('')

  const send = async () => {
    if (!subject.trim() || !message.trim()) {
      setFeedback('Subject and message are required.')
      setStatus('error')
      return
    }
    if (confirmedCount < 1) {
      setFeedback('There are no confirmed registrants to email.')
      setStatus('error')
      return
    }
    if (!confirm(`Send this email to ${confirmedCount} confirmed registrants for “${eventTitle}”?`)) return
    setStatus('loading')
    setFeedback('')
    try {
      const res = await fetch(`/api/admin/events/${eventId}/email-blast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject.trim(), message }),
      })
      const json = (await res.json()) as { message?: string; error?: string }
      if (!res.ok) {
        setStatus('error')
        setFeedback(json.error ?? 'Send failed')
        return
      }
      setStatus('done')
      setFeedback(json.message ?? 'Sent.')
    } catch {
      setStatus('error')
      setFeedback('Network error')
    }
  }

  return (
    <div id="email-blast" className="admin-card mb-10 scroll-mt-24 space-y-4 p-6 sm:p-8">
      <h2 className="font-playfair text-xl font-normal text-admin-text">Email registrants</h2>
      <p className="text-sm text-admin-muted">
        {confirmedCount} confirmed registrant{confirmedCount === 1 ? '' : 's'} will receive this message (paid or free tickets only).
      </p>
      <div>
        <label className="admin-label">Subject line</label>
        <input className="admin-input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Short subject" />
      </div>
      <div>
        <label className="admin-label">Message</label>
        <RichTextEditor value={message} onChange={setMessage} minHeight="200px" />
      </div>
      {feedback && <p className={`text-sm ${status === 'error' ? 'text-red-700' : 'text-admin-muted'}`}>{feedback}</p>}
      <button type="button" disabled={status === 'loading'} className="admin-btn admin-btn-primary text-[10px]" onClick={send}>
        {status === 'loading' ? 'Sending…' : 'Send to all confirmed registrants'}
      </button>
    </div>
  )
}
