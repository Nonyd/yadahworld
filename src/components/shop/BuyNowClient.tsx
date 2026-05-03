'use client'

import { useState } from 'react'

export default function BuyNowClient({ productSlug }: { productSlug: string }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const onClick = async () => {
    setBusy(true)
    setErr('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productSlug }),
      })
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
      if (!res.ok) throw new Error(data.error || 'Checkout failed')
      if (data.url) window.location.href = data.url
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Checkout failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <button type="button" disabled={busy} onClick={() => void onClick()} className="btn-primary">
        {busy ? 'Redirecting…' : 'Buy now'}
      </button>
      {err && <p className="mt-3 text-sm text-accent">{err}</p>}
    </div>
  )
}
