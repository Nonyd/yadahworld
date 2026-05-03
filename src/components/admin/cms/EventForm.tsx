'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { SiteEvent } from '@prisma/client'

type Mode = 'create' | 'edit'

function toInputDate(d: Date) {
  try {
    const x = new Date(d)
    const y = x.getFullYear()
    const m = String(x.getMonth() + 1).padStart(2, '0')
    const day = String(x.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  } catch {
    return ''
  }
}

export default function EventForm({ mode, initial }: { mode: Mode; initial?: SiteEvent }) {
  const router = useRouter()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [date, setDate] = useState(initial ? toInputDate(initial.date) : '')
  const [location, setLocation] = useState(initial?.location ?? '')
  const [link, setLink] = useState(initial?.link ?? '')
  const [isActive, setIsActive] = useState(initial?.isActive ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      title,
      description: description || null,
      date,
      location,
      link: link || null,
      isActive,
    }
    try {
      if (mode === 'create') {
        const res = await fetch('/api/admin/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          throw new Error(j.error || 'Failed to create')
        }
        router.push('/admin/events')
        router.refresh()
        return
      }
      if (!initial?.id) return
      const res = await fetch(`/api/admin/events/${initial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to save')
      router.push('/admin/events')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="admin-card max-w-2xl space-y-6 p-6 sm:p-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="admin-label">Title</label>
          <input className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Description (optional)</label>
          <textarea
            className="admin-input min-h-[100px] resize-y"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className="admin-label">Date</label>
          <input type="date" className="admin-input" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div>
          <label className="admin-label">Location</label>
          <input className="admin-input" value={location} onChange={(e) => setLocation(e.target.value)} required />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Link (booking path or full URL)</label>
          <input className="admin-input" value={link} onChange={(e) => setLink(e.target.value)} placeholder="/booking or https://..." />
        </div>
        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-3 text-sm text-admin-text">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-admin-border text-admin-accent" />
            Visible on the public site
          </label>
        </div>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
          {saving ? 'Saving…' : mode === 'create' ? 'Create event' : 'Save changes'}
        </button>
        <button type="button" className="admin-btn admin-btn-secondary" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </form>
  )
}
