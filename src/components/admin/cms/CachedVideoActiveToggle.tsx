'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CachedVideoActiveToggle({ id, initial }: { id: string; initial: boolean }) {
  const router = useRouter()
  const [value, setValue] = useState(initial)
  const [busy, setBusy] = useState(false)

  const toggle = async () => {
    const next = !value
    const prev = value
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/videos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: next }),
      })
      if (!res.ok) throw new Error()
      setValue(next)
      router.refresh()
    } catch {
      setValue(prev)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button type="button" disabled={busy} onClick={toggle} className="text-left text-sm underline-offset-2 hover:underline">
      {value ? <span className="text-emerald-700">Yes</span> : <span className="text-stone-500">No</span>}
    </button>
  )
}
