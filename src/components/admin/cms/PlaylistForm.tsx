'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { PlaylistSlot, YouTubePlaylist } from '@prisma/client'
import { extractYoutubePlaylistId } from '@/lib/youtube'

const SLOT_OPTIONS: { value: PlaylistSlot; label: string }[] = [
  { value: 'MUSIC_VIDEOS', label: 'Media page + Homepage latest videos' },
  { value: 'MINISTRATIONS', label: '/ministrations page' },
  { value: 'GENERAL', label: 'General use' },
]

type Mode = 'create' | 'edit'

export default function PlaylistForm({ mode, initial }: { mode: Mode; initial?: YouTubePlaylist }) {
  const router = useRouter()
  const [name, setName] = useState(initial?.name ?? '')
  const [playlistInput, setPlaylistInput] = useState(initial?.youtubePlaylistId ?? '')
  const [extractedId, setExtractedId] = useState(() =>
    initial?.youtubePlaylistId ? extractYoutubePlaylistId(initial.youtubePlaylistId) : '',
  )
  const [slot, setSlot] = useState<PlaylistSlot>(initial?.slot ?? 'GENERAL')
  const [maxVideos, setMaxVideos] = useState(initial?.maxVideos ?? 50)
  const [isActive, setIsActive] = useState(initial?.isActive ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const onPlaylistBlur = () => {
    setExtractedId(extractYoutubePlaylistId(playlistInput))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const youtubePlaylistId = extractYoutubePlaylistId(playlistInput)
    if (!youtubePlaylistId) {
      setError('Enter a valid YouTube playlist URL or playlist ID.')
      setSaving(false)
      return
    }

    const payload = {
      name: name.trim(),
      youtubePlaylistId,
      slot,
      maxVideos,
      isActive,
    }

    try {
      if (mode === 'create') {
        const res = await fetch('/api/admin/playlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          throw new Error(j.error || 'Failed to create')
        }
        const row = (await res.json()) as { id: string }
        const syncRes = await fetch(`/api/admin/playlists/${row.id}/sync`, { method: 'POST' })
        if (!syncRes.ok) {
          const j = await syncRes.json().catch(() => ({}))
          throw new Error(j.error || 'Playlist saved but initial sync failed')
        }
        router.push('/admin/playlists')
        router.refresh()
        return
      }

      if (!initial?.id) return
      const res = await fetch(`/api/admin/playlists/${initial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || 'Failed to save')
      }
      router.push('/admin/playlists')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="admin-card max-w-2xl space-y-6 p-6 sm:p-8">
      <div className="grid gap-6">
        <div>
          <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-admin-muted">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="admin-input w-full"
            placeholder="Official Music Videos"
          />
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-admin-muted">
            YouTube playlist URL or ID
          </label>
          <input
            required
            value={playlistInput}
            onChange={(e) => setPlaylistInput(e.target.value)}
            onBlur={onPlaylistBlur}
            className="admin-input w-full font-mono text-sm"
            placeholder="https://www.youtube.com/playlist?list=…"
          />
          <p className="mt-2 text-xs text-admin-muted">
            Extracted playlist ID:{' '}
            <span className="font-mono text-admin-text">{extractedId || '—'}</span>
          </p>
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-admin-muted">Slot</label>
          <select
            value={slot}
            onChange={(e) => setSlot(e.target.value as PlaylistSlot)}
            className="admin-input w-full"
          >
            {SLOT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-admin-muted">
            Max videos (1–200)
          </label>
          <input
            type="number"
            min={1}
            max={200}
            required
            value={maxVideos}
            onChange={(e) => setMaxVideos(Number(e.target.value))}
            className="admin-input w-full max-w-[120px]"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-3">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4" />
          <span className="text-sm text-admin-text">Active</span>
        </label>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
          {saving ? 'Saving…' : mode === 'create' ? 'Create & sync' : 'Save'}
        </button>
        <button type="button" className="admin-btn admin-btn-ghost" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </form>
  )
}
