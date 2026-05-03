'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { SiteRelease } from '@prisma/client'

type Mode = 'create' | 'edit'

export default function ReleaseForm({ mode, initial }: { mode: Mode; initial?: SiteRelease }) {
  const router = useRouter()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [feat, setFeat] = useState(initial?.feat ?? '')
  const [type, setType] = useState(initial?.type ?? 'Single')
  const [year, setYear] = useState(initial?.year ?? new Date().getFullYear().toString())
  const [cover, setCover] = useState(initial?.cover ?? '')
  const [spotify, setSpotify] = useState(initial?.spotify ?? '')
  const [apple, setApple] = useState(initial?.apple ?? '')
  const [youtube, setYoutube] = useState(initial?.youtube ?? '')
  const [isNew, setIsNew] = useState(initial?.isNew ?? false)
  const [order, setOrder] = useState(initial?.order ?? 0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      title,
      feat: feat || null,
      type,
      year,
      cover,
      spotify: spotify || null,
      apple: apple || null,
      youtube: youtube || null,
      isNew,
      order: Number(order) || 0,
    }
    try {
      if (mode === 'create') {
        const res = await fetch('/api/admin/releases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          throw new Error(j.error || 'Failed to create')
        }
        router.push('/admin/releases')
        router.refresh()
        return
      }
      if (!initial?.id) return
      const res = await fetch(`/api/admin/releases/${initial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to save')
      router.push('/admin/releases')
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
          <label className="admin-label">Featuring (optional)</label>
          <input className="admin-input" value={feat} onChange={(e) => setFeat(e.target.value)} placeholder="ft. Artist" />
        </div>
        <div>
          <label className="admin-label">Type</label>
          <input className="admin-input" value={type} onChange={(e) => setType(e.target.value)} required />
        </div>
        <div>
          <label className="admin-label">Year</label>
          <input className="admin-input" value={year} onChange={(e) => setYear(e.target.value)} required />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Cover image URL</label>
          <input className="admin-input" value={cover} onChange={(e) => setCover(e.target.value)} required />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Spotify URL</label>
          <input className="admin-input" value={spotify} onChange={(e) => setSpotify(e.target.value)} placeholder="https://..." />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Apple Music URL</label>
          <input className="admin-input" value={apple} onChange={(e) => setApple(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">YouTube URL</label>
          <input className="admin-input" value={youtube} onChange={(e) => setYoutube(e.target.value)} />
        </div>
        <div>
          <label className="admin-label">Sort order</label>
          <input
            type="number"
            className="admin-input"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
          />
        </div>
        <div className="flex items-end">
          <label className="flex cursor-pointer items-center gap-3 text-sm text-admin-text">
            <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} className="h-4 w-4 rounded border-admin-border text-admin-accent" />
            Show “New” badge
          </label>
        </div>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
          {saving ? 'Saving…' : mode === 'create' ? 'Create release' : 'Save changes'}
        </button>
        <button type="button" className="admin-btn admin-btn-secondary" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </form>
  )
}
