'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { PlaylistSlot } from '@prisma/client'

export default function CachedVideoFeaturedToggle({
  id,
  slot,
  initialFeatured,
  initialOrder,
}: {
  id: string
  slot: PlaylistSlot
  initialFeatured: boolean
  initialOrder: number | null
}) {
  const router = useRouter()
  const [featured, setFeatured] = useState(initialFeatured)
  const [orderInput, setOrderInput] = useState(initialOrder != null ? String(initialOrder) : '')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setFeatured(initialFeatured)
    setOrderInput(initialOrder != null ? String(initialOrder) : '')
  }, [initialFeatured, initialOrder])

  if (slot !== 'MUSIC_VIDEOS') {
    return <span className="text-admin-muted">—</span>
  }

  const toggleFeatured = async () => {
    const next = !featured
    const prevFeatured = featured
    const prevOrder = orderInput
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/videos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: next }),
      })
      const json = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        if (json.error) window.alert(json.error)
        throw new Error(json.error || 'Request failed')
      }
      setFeatured(next)
      if (!next) setOrderInput('')
      router.refresh()
    } catch {
      setFeatured(prevFeatured)
      setOrderInput(prevOrder)
    } finally {
      setBusy(false)
    }
  }

  const saveOrder = async () => {
    if (!featured) return
    const raw = orderInput.trim()
    const n = parseInt(raw, 10)
    if (raw === '' || Number.isNaN(n) || n < 1 || n > 3) {
      window.alert('Enter a number from 1 to 3.')
      setOrderInput(initialOrder != null ? String(initialOrder) : '')
      return
    }
    if (initialOrder != null && n === initialOrder) return
    const prev = orderInput
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/videos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featuredOrder: n }),
      })
      const json = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        if (json.error) window.alert(json.error)
        throw new Error(json.error || 'Request failed')
      }
      setOrderInput(String(n))
      router.refresh()
    } catch {
      setOrderInput(prev)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="inline-flex items-center justify-center gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={toggleFeatured}
        aria-label={featured ? 'Remove from featured' : 'Mark as featured'}
        className="inline-flex shrink-0 items-center justify-center rounded p-1 text-lg leading-none transition-opacity hover:opacity-80 disabled:opacity-50"
        title={featured ? 'Featured on homepage (max 3)' : 'Feature on homepage'}
      >
        {featured ? <span className="text-[#C9A84C]">★</span> : <span className="text-admin-muted">☆</span>}
      </button>
      {featured ? (
        <input
          type="number"
          min={1}
          max={3}
          disabled={busy}
          value={orderInput}
          onChange={(e) => setOrderInput(e.target.value)}
          onBlur={() => void saveOrder()}
          className="admin-input w-[50px] shrink-0 py-1.5 text-center text-xs tabular-nums"
          aria-label="Featured display order (1–3)"
        />
      ) : (
        <span className="inline-block w-[50px] text-center font-jost text-xs text-admin-muted" title="Not featured">
          —
        </span>
      )}
    </div>
  )
}
