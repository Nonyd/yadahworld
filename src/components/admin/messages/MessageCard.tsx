'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function MessageCard({
  id,
  subject,
  name,
  email,
  createdAt,
  message,
  read,
}: {
  id: string
  subject: string
  name: string
  email: string
  createdAt: string
  message: string
  read: boolean
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [localRead, setLocalRead] = useState(read)

  const toggleRead = async () => {
    setBusy(true)
    const next = !localRead
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: next }),
      })
      if (!res.ok) throw new Error()
      setLocalRead(next)
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className={`admin-card p-5 sm:p-6 ${!localRead ? 'ring-1 ring-admin-accent/15' : ''}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-playfair text-lg font-normal text-admin-text">{subject}</h2>
          <p className="mt-1 text-xs uppercase tracking-wider text-admin-muted">
            {name} · {email} · {createdAt}
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={toggleRead}
          className="admin-btn admin-btn-secondary shrink-0 self-start text-[10px]"
        >
          {localRead ? 'Mark unread' : 'Mark read'}
        </button>
      </div>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-admin-text/90">{message}</p>
    </article>
  )
}
