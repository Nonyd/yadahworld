'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { SiteVideo } from '@prisma/client'

type Mode = 'create' | 'edit'

export default function VideoForm({ mode, initial }: { mode: Mode; initial?: SiteVideo }) {
  const router = useRouter()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [youtubeUrl, setYoutubeUrl] = useState(initial?.youtubeUrl ?? '')
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnailUrl ?? '')
  const [order, setOrder] = useState(initial?.order ?? 0)
  const [isActive, setIsActive] = useState(initial?.isActive ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      title,
      youtubeUrl,
      thumbnailUrl: thumbnailUrl || null,
      order: Number(order) || 0,
      isActive,
    }
    try {
      if (mode === 'create') {
        const res = await fetch('/api/admin/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          throw new Error(j.error || 'Failed to create')
        }
        router.push('/admin/videos')
        router.refresh()
        return
      }
      if (!initial?.id) return
      const res = await fetch(`/api/admin/videos/${initial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to save')
      router.push('/admin/videos')
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
          <label className="admin-label">YouTube URL</label>
          <input
            className="admin-input"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
            required
          />
          <p className="mt-1 text-xs text-admin-muted">Watch or embed URLs work. Thumbnails use YouTube automatically unless you set an override.</p>
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Thumbnail URL (optional)</label>
          <input className="admin-input" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="Override default YouTube preview" />
        </div>
        <div>
          <label className="admin-label">Sort order</label>
          <input type="number" className="admin-input" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
        </div>
        <div className="flex items-end">
          <label className="flex cursor-pointer items-center gap-3 text-sm text-admin-text">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-admin-border text-admin-accent" />
            Visible on the site
          </label>
        </div>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
          {saving ? 'Saving…' : mode === 'create' ? 'Add video' : 'Save changes'}
        </button>
        <button type="button" className="admin-btn admin-btn-secondary" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </form>
  )
}
