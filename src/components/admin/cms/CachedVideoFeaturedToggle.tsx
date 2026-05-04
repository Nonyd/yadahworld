'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { PlaylistSlot } from '@prisma/client'

export default function CachedVideoFeaturedToggle({
  id,
  slot,
  initial,
}: {
  id: string
  slot: PlaylistSlot
  initial: boolean
}) {
  const router = useRouter()
  const [value, setValue] = useState(initial)
  const [busy, setBusy] = useState(false)

  if (slot !== 'MUSIC_VIDEOS') {
    return <span className="text-admin-muted">—</span>
  }

  const toggle = async () => {
    const next = !value
    const prev = value
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
      setValue(next)
      router.refresh()
    } catch {
      setValue(prev)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={toggle}
      aria-label={value ? 'Remove from featured' : 'Mark as featured'}
      className="inline-flex items-center justify-center rounded p-1 text-lg leading-none transition-opacity hover:opacity-80 disabled:opacity-50"
      title={value ? 'Featured on homepage (max 3)' : 'Feature on homepage'}
    >
      {value ? <span className="text-[#C9A84C]">★</span> : <span className="text-admin-muted">☆</span>}
    </button>
  )
}
